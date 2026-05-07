import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import type { AiConversation, Prisma } from "@prisma/client";
import { Buffer } from "node:buffer";
import { PrismaService } from "../prisma/prisma.service.js";
import { ProjectsService } from "../projects/projects.service.js";
import { nameFor, normalizeClientPath, parentPathFor } from "../workspace-paths.js";
import {
  artifactLabel,
  buildArtifactSystemPrompt,
  isArtifactType,
  isWorkflowStage,
  nextStageAfterApproval,
  normalizeWorkflowStage,
  stageForArtifact,
  type ArtifactType,
  type WorkflowStage
} from "./workflow.js";

type AiDiffJson = {
  summary: string;
  files: AiFilePatch[];
  fileId?: string;
  oldContent?: string;
  newContent?: string;
  lines?: AiDiffLine[];
};

type AiDiffLine = { type: "same" | "add" | "remove"; text: string };

type AiFilePatch = {
  fileId?: string;
  path: string;
  action: "create" | "update";
  oldContent: string;
  newContent: string;
  lines: AiDiffLine[];
};

type WorkspaceTextFile = {
  id: string;
  path: string;
  mimeType: string | null;
  contentText: string;
};

type AiConversationMessage = {
  role: "user" | "assistant";
  content: string;
};

type ProviderMessage = {
  role: "user" | "assistant";
  content: string;
};

@Injectable()
export class AiService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly projects: ProjectsService
  ) {}

  async getConversation(userId: string, projectId: string, conversationId?: string) {
    await this.projects.assertAccess(userId, projectId, "viewer");
    const conversation = await this.getOrCreateProjectConversation(userId, projectId, conversationId);
    const messages = await this.prisma.aiMessage.findMany({
      where: { conversationId: conversation.id },
      orderBy: { createdAt: "asc" },
      take: 120
    });

    return { conversation, messages };
  }

  async getWorkflow(userId: string, projectId: string, conversationId?: string) {
    await this.projects.assertAccess(userId, projectId, "viewer");
    const conversation = await this.getOrCreateProjectConversation(userId, projectId, conversationId);
    const [messages, artifacts] = await Promise.all([
      this.prisma.aiMessage.findMany({
        where: { conversationId: conversation.id },
        orderBy: { createdAt: "asc" },
        take: 120
      }),
      this.prisma.aiArtifact.findMany({
        where: { conversationId: conversation.id },
        orderBy: { updatedAt: "desc" },
        take: 30
      })
    ]);

    return { conversation, messages, artifacts };
  }

  async setWorkflowStage(
    userId: string,
    projectId: string,
    body: { conversationId?: string; stage?: string }
  ) {
    await this.projects.assertAccess(userId, projectId, "editor");
    if (!isWorkflowStage(body.stage)) throw new BadRequestException("Invalid AI workflow stage");
    const conversation = await this.getOrCreateProjectConversation(userId, projectId, body.conversationId);
    const updated = await this.prisma.aiConversation.update({
      where: { id: conversation.id },
      data: { stage: body.stage }
    });
    return { conversation: updated };
  }

  async generateArtifact(
    userId: string,
    projectId: string,
    body: { conversationId?: string; type?: string; instruction?: string; provider?: string }
  ) {
    const timer = new TimingLogger("ai-artifact", `${projectId}:${body.type ?? "unknown"}`);
    await this.projects.assertAccess(userId, projectId, "editor");
    if (!isArtifactType(body.type)) throw new BadRequestException("Invalid AI artifact type");
    const conversation = await this.getOrCreateProjectConversation(userId, projectId, body.conversationId);
    const instruction = body.instruction?.trim() || `Generate ${artifactLabel(body.type)} for this deck.`;
    const requestStartedAt = Date.now();
    const aiConfig = resolveAiConfig(body.provider);
    timer.mark("auth_conversation_config", {
      conversationId: conversation.id,
      type: body.type,
      provider: aiConfig.provider,
      model: aiConfig.model
    });

    if (!aiConfig.apiKey) {
      throw new BadRequestException(
        aiConfig.provider === "deepseek"
          ? "DEEPSEEK_API_KEY is not configured"
          : aiConfig.provider === "gemini"
            ? "GEMINI_API_KEY is not configured"
            : aiConfig.provider === "anthropic"
              ? "ANTHROPIC_API_KEY is not configured"
            : "OPENAI_API_KEY is not configured"
      );
    }

    const [workspaceFiles, messages, artifacts] = await Promise.all([
      this.getWorkspaceTextFiles(projectId),
      this.loadRecentConversationMessages(conversation.id),
      this.loadWorkflowArtifacts(conversation.id)
    ]);
    const contextChars = workspaceFiles.reduce((sum, file) => sum + file.contentText.length, 0);
    timer.mark("load_context", {
      files: workspaceFiles.length,
      chars: contextChars,
      history: messages.length,
      artifacts: artifacts.length
    });

    const userMessage = await this.prisma.aiMessage.create({
      data: {
        conversationId: conversation.id,
        role: "user",
        content: instruction,
        metadata: { workflowAction: `generate_${body.type}` }
      }
    });
    timer.mark("persist_user_message", { userMessageId: userMessage.id });

    try {
      const contentJson = await requestAiArtifact({
        type: body.type,
        config: aiConfig,
        instruction,
        conversationSummary: conversation.summary ?? undefined,
        conversationMessages: messages,
        artifacts,
        files: workspaceFiles
      });
      timer.mark("ai_artifact_response");

      const artifact = await this.prisma.aiArtifact.create({
        data: {
          projectId,
          conversationId: conversation.id,
          type: body.type,
          status: "draft",
          contentJson
        }
      });
      timer.mark("persist_artifact", { artifactId: artifact.id });
      await this.prisma.aiMessage.create({
        data: {
          conversationId: conversation.id,
          role: "assistant",
          content: `${artifactLabel(body.type)} updated.`,
          metadata: {
            workflowAction: `generated_${body.type}`,
            artifactId: artifact.id,
            userMessageId: userMessage.id,
            status: "updated"
          }
        }
      });
      await this.prisma.aiConversation.update({
        where: { id: conversation.id },
        data: {
          stage: stageForArtifact(body.type),
          title: conversation.title ?? titleFromInstruction(instruction),
          updatedAt: new Date()
        }
      });
      await this.refreshConversationMemory(conversation.id);
      timer.mark("persist_messages_memory");
      console.log(
        `[ai-workflow] conversation=${conversation.id} type=${body.type} ready total_ms=${Date.now() - requestStartedAt}`
      );
      timer.end("done");
      return { artifact };
    } catch (error) {
      timer.fail(error);
      const log = error instanceof Error ? error.message : String(error);
      await this.prisma.aiMessage.create({
        data: {
          conversationId: conversation.id,
          role: "assistant",
          content: log,
          metadata: { workflowAction: `generate_${body.type}`, status: "failed" }
        }
      });
      await this.refreshConversationMemory(conversation.id);
      throw error;
    }
  }

  async approveArtifact(userId: string, projectId: string, artifactId: string) {
    await this.projects.assertAccess(userId, projectId, "editor");
    const artifact = await this.prisma.aiArtifact.findFirst({
      where: { id: artifactId, projectId }
    });
    if (!artifact) throw new NotFoundException("AI artifact not found");
    if (!isArtifactType(artifact.type)) throw new BadRequestException("Invalid AI artifact type");

    const nextStage = nextStageAfterApproval(artifact.type);
    const approved = await this.prisma.$transaction(async (tx) => {
      await tx.aiArtifact.updateMany({
        where: {
          projectId,
          conversationId: artifact.conversationId,
          type: artifact.type,
          status: "approved",
          id: { not: artifact.id }
        },
        data: { status: "superseded" }
      });
      const updatedArtifact = await tx.aiArtifact.update({
        where: { id: artifact.id },
        data: { status: "approved" }
      });
      await tx.aiConversation.update({
        where: { id: artifact.conversationId },
        data: { stage: nextStage }
      });
      return updatedArtifact;
    });

    await this.prisma.aiMessage.create({
      data: {
        conversationId: artifact.conversationId,
        role: "assistant",
        content: `${artifactLabel(artifact.type)} approved. Moved to ${humanStage(nextStage)}.`,
        metadata: {
          workflowAction: `approved_${artifact.type}`,
          artifactId: artifact.id,
          status: "approved",
          nextStage
        }
      }
    });
    await this.refreshConversationMemory(artifact.conversationId);
    return { artifact: approved };
  }

  async editFile(
    userId: string,
    projectId: string,
    body: {
      conversationId?: string;
      fileId?: string;
      instruction?: string;
      selectedText?: string | null;
      provider?: string;
    }
  ) {
    const timer = new TimingLogger("ai-edit", projectId);
    await this.projects.assertAccess(userId, projectId, "editor");
    const instruction = body.instruction?.trim();
    if (!instruction) throw new BadRequestException("instruction is required");
    const requestStartedAt = Date.now();
    timer.mark("auth_validate", {
      hasSelectedFile: Boolean(body.fileId),
      instructionChars: instruction.length
    });

    const workspaceFiles = await this.prisma.file.findMany({
      where: { projectId },
      orderBy: { path: "asc" }
    });
    const textFiles = workspaceFiles
      .filter((file) => file.kind === "file" && !file.isBinary)
      .map((file) => ({
        id: file.id,
        path: file.path,
        mimeType: file.mimeType,
        contentText: file.contentText ?? ""
      }));
    const contextCharCount = textFiles.reduce((sum, file) => sum + file.contentText.length, 0);

    const selectedFile = body.fileId
      ? workspaceFiles.find((file) => file.id === body.fileId)
      : undefined;
    if (body.fileId && !selectedFile) throw new NotFoundException("File not found");
    if (selectedFile && (selectedFile.kind !== "file" || selectedFile.isBinary)) {
      throw new BadRequestException("AI edit only supports text files as the selected file");
    }
    timer.mark("load_workspace_files", {
      totalFiles: workspaceFiles.length,
      textFiles: textFiles.length,
      chars: contextCharCount,
      selected: selectedFile?.path ?? "none"
    });

    const conversation = await this.getOrCreateProjectConversation(userId, projectId, body.conversationId);
    const conversationMessages = await this.loadRecentConversationMessages(conversation.id);
    timer.mark("load_conversation", {
      conversationId: conversation.id,
      history: conversationMessages.length
    });

    const task = await this.prisma.aiTask.create({
      data: {
        projectId,
        userId,
        conversationId: conversation.id,
        status: "running",
        prompt: instruction
      }
    });
    await this.prisma.aiMessage.create({
      data: {
        conversationId: conversation.id,
        role: "user",
        content: instruction,
        aiTaskId: task.id,
        metadata: {
          selectedFilePath: selectedFile?.path ?? null,
          selectedText: body.selectedText ?? null
        }
      }
    });
    await this.prisma.aiConversation.update({
      where: { id: conversation.id },
      data: {
        title: conversation.title ?? titleFromInstruction(instruction),
        updatedAt: new Date()
      }
    });
    timer.mark("persist_task_user_message", { taskId: task.id });

    const aiConfig = resolveAiConfig(body.provider);
    console.log(
      `[ai] task=${task.id} conversation=${conversation.id} start provider=${aiConfig.provider} model=${aiConfig.model} files=${textFiles.length} chars=${contextCharCount} history=${conversationMessages.length} selected=${selectedFile?.path ?? "none"}`
    );
    if (!aiConfig.apiKey) {
      const log =
        aiConfig.provider === "deepseek"
          ? "DEEPSEEK_API_KEY is not configured"
          : aiConfig.provider === "gemini"
            ? "GEMINI_API_KEY is not configured"
            : aiConfig.provider === "anthropic"
              ? "ANTHROPIC_API_KEY is not configured"
            : "OPENAI_API_KEY is not configured";
      await this.prisma.aiMessage.create({
        data: {
          conversationId: conversation.id,
          role: "assistant",
          content: log,
          aiTaskId: task.id,
          metadata: { status: "failed" }
        }
      });
      return this.prisma.aiTask.update({
        where: { id: task.id },
        data: {
          status: "failed",
          log
        }
      });
    }

    try {
      const workflowArtifacts = await this.loadWorkflowArtifacts(conversation.id);
      timer.mark("load_workflow_artifacts", { artifacts: workflowArtifacts.length });
      const result = await requestAiWorkspaceRewrite({
        taskId: task.id,
        config: aiConfig,
        instruction,
        files: textFiles,
        conversationSummary: conversation.summary ?? undefined,
        conversationMessages,
        artifacts: workflowArtifacts,
        selectedFilePath: selectedFile?.path,
        selectedText: body.selectedText ?? undefined
      });
      timer.mark("ai_workspace_response", {
        files: result.files.length,
        chars: result.files.reduce((sum, file) => sum + file.content.length, 0)
      });

      const diff = buildWorkspaceDiff({
        summary: result.summary,
        generatedFiles: result.files,
        existingFiles: textFiles
      });
      timer.mark("build_diff", { changedFiles: diff.files.length });
      const generatedCharCount = result.files.reduce((sum, file) => sum + file.content.length, 0);
      console.log(
        `[ai] task=${task.id} ready total_ms=${Date.now() - requestStartedAt} generated_files=${result.files.length} generated_chars=${generatedCharCount}`
      );

      const updatedTask = await this.prisma.aiTask.update({
        where: { id: task.id },
        data: {
          status: "needs_review",
          diffJson: diff
        }
      });
      timer.mark("persist_task_diff", { taskId: updatedTask.id });
      await this.prisma.aiMessage.create({
        data: {
          conversationId: conversation.id,
          role: "assistant",
          content: result.summary,
          aiTaskId: task.id,
          metadata: {
            status: "needs_review",
            changedFiles: diff.files.map((file) => ({
              path: file.path,
              action: file.action
            }))
          }
        }
      });
      await this.refreshConversationMemory(conversation.id);
      timer.mark("persist_assistant_memory");
      timer.end("done");
      return updatedTask;
    } catch (error) {
      timer.fail(error);
      console.error(`[ai] task=${task.id} failed total_ms=${Date.now() - requestStartedAt}`, error);
      const log = error instanceof Error ? error.message : String(error);
      await this.prisma.aiMessage.create({
        data: {
          conversationId: conversation.id,
          role: "assistant",
          content: log,
          aiTaskId: task.id,
          metadata: { status: "failed" }
        }
      });
      await this.refreshConversationMemory(conversation.id);
      return this.prisma.aiTask.update({
        where: { id: task.id },
        data: {
          status: "failed",
          log
        }
      });
    }
  }

  async get(userId: string, projectId: string, taskId: string) {
    await this.projects.assertAccess(userId, projectId, "viewer");
    const task = await this.prisma.aiTask.findFirst({ where: { id: taskId, projectId } });
    if (!task) throw new NotFoundException("AI task not found");
    return task;
  }

  async apply(userId: string, projectId: string, taskId: string) {
    await this.projects.assertAccess(userId, projectId, "editor");
    const task = await this.prisma.aiTask.findFirst({ where: { id: taskId, projectId } });
    if (!task) throw new NotFoundException("AI task not found");
    if (task.status !== "needs_review") {
      throw new BadRequestException("AI task is not waiting for review");
    }

    const diff = normalizeTaskDiff(task.diffJson);
    if (!diff.files.length) {
      throw new BadRequestException("AI task does not contain a valid patch");
    }

    const appliedTask = await this.prisma.$transaction(async (tx) => {
      for (const filePatch of diff.files) {
        const filePath = normalizeClientPath(filePatch.path);
        const existing = await tx.file.findFirst({ where: { projectId, path: filePath } });
        if (existing?.kind === "folder" || existing?.isBinary) {
          throw new BadRequestException(`Cannot apply AI patch to non-text file: ${filePath}`);
        }

        const parentId = await ensureFolderPath(tx, projectId, parentPathFor(filePath));
        if (existing) {
          await tx.file.update({
            where: { id: existing.id },
            data: {
              parentId,
              name: nameFor(filePath),
              mimeType: guessMimeType(filePath),
              contentText: filePatch.newContent
            }
          });
        } else {
          await tx.file.create({
            data: {
              projectId,
              parentId,
              path: filePath,
              name: nameFor(filePath),
              kind: "file",
              mimeType: guessMimeType(filePath),
              isBinary: false,
              contentText: filePatch.newContent
            }
          });
        }
      }
      await tx.project.update({ where: { id: projectId }, data: { updatedAt: new Date() } });
      return tx.aiTask.update({
        where: { id: taskId },
        data: { status: "applied" }
      });
    });

    if (task.conversationId) {
      await this.prisma.aiMessage.create({
        data: {
          conversationId: task.conversationId,
          role: "assistant",
          content: `Applied AI changes to ${diff.files.length} file${diff.files.length === 1 ? "" : "s"}.`,
          aiTaskId: task.id,
          metadata: { status: "applied" }
        }
      });
      await this.refreshConversationMemory(task.conversationId);
    }

    return appliedTask;
  }

  async reject(userId: string, projectId: string, taskId: string) {
    await this.projects.assertAccess(userId, projectId, "editor");
    const task = await this.prisma.aiTask.findFirst({ where: { id: taskId, projectId } });
    if (!task) throw new NotFoundException("AI task not found");
    const rejectedTask = await this.prisma.aiTask.update({
      where: { id: taskId },
      data: { status: "rejected" }
    });
    if (task.conversationId) {
      await this.prisma.aiMessage.create({
        data: {
          conversationId: task.conversationId,
          role: "assistant",
          content: "Rejected the generated workspace patch.",
          aiTaskId: task.id,
          metadata: { status: "rejected" }
        }
      });
      await this.refreshConversationMemory(task.conversationId);
    }
    return rejectedTask;
  }

  private async getOrCreateProjectConversation(userId: string, projectId: string, conversationId?: string) {
    if (conversationId) {
      const existing = await this.prisma.aiConversation.findFirst({
        where: { id: conversationId, projectId, userId }
      });
      if (!existing) throw new NotFoundException("AI conversation not found");
      return this.ensureSupportedWorkflowStage(existing);
    }

    const existing = await this.prisma.aiConversation.findFirst({
      where: { projectId, userId },
      orderBy: { updatedAt: "desc" }
    });
    if (existing) return this.ensureSupportedWorkflowStage(existing);

    return this.prisma.aiConversation.create({
      data: {
        projectId,
        userId,
        title: "Workspace chat"
      }
    });
  }

  private async ensureSupportedWorkflowStage(conversation: AiConversation): Promise<AiConversation> {
    const normalizedStage = normalizeWorkflowStage(conversation.stage);
    if (normalizedStage === conversation.stage) return conversation;
    return this.prisma.aiConversation.update({
      where: { id: conversation.id },
      data: { stage: normalizedStage }
    });
  }

  private async loadRecentConversationMessages(conversationId: string): Promise<AiConversationMessage[]> {
    const messages = await this.prisma.aiMessage.findMany({
      where: {
        conversationId,
        role: { in: ["user", "assistant"] }
      },
      orderBy: { createdAt: "desc" },
      take: 16
    });

    return messages.reverse().map((message) => ({
      role: message.role === "assistant" ? "assistant" : "user",
      content: message.content
    }));
  }

  private async loadWorkflowArtifacts(conversationId: string) {
    return this.prisma.aiArtifact.findMany({
      where: {
        conversationId,
        status: { in: ["draft", "approved"] }
      },
      orderBy: { updatedAt: "desc" },
      take: 12
    });
  }

  private async getWorkspaceTextFiles(projectId: string): Promise<WorkspaceTextFile[]> {
    const files = await this.prisma.file.findMany({
      where: { projectId, kind: "file", isBinary: false },
      orderBy: { path: "asc" }
    });
    return files.map((file) => ({
      id: file.id,
      path: file.path,
      mimeType: file.mimeType,
      contentText: file.contentText ?? ""
    }));
  }

  private async refreshConversationMemory(conversationId: string): Promise<void> {
    const messages = await this.prisma.aiMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: "desc" },
      take: 20
    });
    const recentUserGoals = messages
      .reverse()
      .filter((message) => message.role === "user")
      .slice(-8)
      .map((message) => `- ${clipForSummary(message.content)}`)
      .join("\n");

    await this.prisma.aiConversation.update({
      where: { id: conversationId },
      data: {
        summary: recentUserGoals ? `Recent user goals:\n${recentUserGoals}` : null,
        updatedAt: new Date()
      }
    });
  }
}

async function requestAiWorkspaceRewrite(input: {
  taskId: string;
  config: AiProviderConfig;
  instruction: string;
  files: WorkspaceTextFile[];
  conversationSummary?: string;
  conversationMessages: AiConversationMessage[];
  artifacts: Array<{
    type: string;
    status: string;
    contentJson: Prisma.JsonValue;
  }>;
  selectedFilePath?: string;
  selectedText?: string;
}): Promise<{ summary: string; files: Array<{ path: string; content: string }> }> {
  const contextFiles = buildAiContextFiles(input.files);
  const contextChars = contextFiles.reduce((sum, file) => sum + file.content.length, 0);
  const effectiveMaxTokens = Math.max(input.config.maxTokens, 8192);
  console.log(
    `[ai] task=${input.taskId} ${input.config.provider}_request baseUrl=${input.config.baseUrl} model=${input.config.model} context_files=${contextFiles.length} context_chars=${contextChars} max_tokens=${effectiveMaxTokens}`
  );

  const messages: ProviderMessage[] = [
    ...input.conversationMessages.map((message) => ({
      role: message.role,
      content: clipConversationMessage(message.content)
    })),
    {
      role: "user",
      content: JSON.stringify({
        instruction: input.instruction,
        selectedFilePath: input.selectedFilePath ?? null,
        selectedText: input.selectedText ?? null,
        workflowArtifacts: input.artifacts.map((artifact) => ({
          type: artifact.type,
          status: artifact.status,
          content: artifact.contentJson
        })),
        currentFiles: input.files.length > 0 ? contextFiles : [],
        fallbackPromptWhenWorkspaceIsEmpty:
          input.files.length === 0
            ? input.instruction
            : null
      })
    }
  ];

  const completion = await requestProviderText({
    config: input.config,
    systemPrompt: buildAiSystemPrompt(input.conversationSummary),
    messages,
    maxTokens: effectiveMaxTokens,
    temperature: 0.2,
    logLabel: `ai-edit task=${input.taskId}`,
    requestDetails: `task=${input.taskId} history=${input.conversationMessages.length} artifacts=${input.artifacts.length}`
  });
  const raw = completion.content;
  console.log(
    `[timing][ai-edit-response] task=${input.taskId} finish=${completion.finishReason ?? "unknown"} response_chars=${raw.length}`
  );
  if (completion.finishReason === "length" || completion.finishReason === "max_tokens") {
    throw new Error("AI response was cut off before complete workspace files were returned. Ask for fewer slides or increase AI_MAX_TOKENS.");
  }

  const parseStartedAt = Date.now();
  const parsed = parseAiWorkspaceResponse(raw);
  const files = parseGeneratedFiles(parsed);
  console.log(
    `[timing][ai-edit-parse] task=${input.taskId} ms=${Date.now() - parseStartedAt} files=${files.length}`
  );
  const totalSize = files.reduce((sum, file) => sum + file.content.length, 0);
  if (totalSize > 650_000) {
    throw new Error("AI response is too large");
  }

  return {
    summary: typeof parsed.summary === "string" ? parsed.summary : "Updated workspace files",
    files
  };
}

async function requestAiArtifact(input: {
  type: ArtifactType;
  config: AiProviderConfig;
  instruction: string;
  files: WorkspaceTextFile[];
  conversationSummary?: string;
  conversationMessages: AiConversationMessage[];
  artifacts: Array<{
    type: string;
    status: string;
    contentJson: Prisma.JsonValue;
  }>;
}): Promise<Prisma.InputJsonValue> {
  const contextFiles = buildAiContextFiles(input.files);
  const contextChars = contextFiles.reduce((sum, file) => sum + file.content.length, 0);
  const effectiveMaxTokens =
    input.config.provider === "anthropic"
      ? Math.max(4096, input.config.maxTokens)
      : Math.max(4096, Math.min(input.config.maxTokens, 8192));
  const messages: ProviderMessage[] = [
    ...input.conversationMessages.map((message) => ({
      role: message.role,
      content: clipConversationMessage(message.content)
    })),
    {
      role: "user",
      content: JSON.stringify({
        instruction: input.instruction,
        conversationSummary: input.conversationSummary ?? null,
        workflowArtifacts: input.artifacts.map((artifact) => ({
          type: artifact.type,
          status: artifact.status,
          content: artifact.contentJson
        })),
        currentFiles: contextFiles
      })
    }
  ];
  const completion = await requestProviderText({
    config: input.config,
    systemPrompt: buildArtifactSystemPrompt(input.type),
    messages,
    maxTokens: effectiveMaxTokens,
    temperature: 0.2,
    responseFormat: "json_object",
    logLabel: `ai-artifact type=${input.type}`,
    requestDetails: `type=${input.type} context_files=${contextFiles.length} context_chars=${contextChars} history=${input.conversationMessages.length} artifacts=${input.artifacts.length} max_tokens=${effectiveMaxTokens}`
  });
  const raw = completion.content;
  console.log(
    `[timing][ai-artifact-response] type=${input.type} finish=${completion.finishReason ?? "unknown"} response_chars=${raw.length}`
  );
  if (completion.finishReason === "length" || completion.finishReason === "max_tokens") {
    throw new Error("AI artifact response was cut off. Reduce detail or increase AI_MAX_TOKENS.");
  }

  const parseStartedAt = Date.now();
  const parsed = parseJsonObject(raw, `${artifactLabel(input.type)} response`);
  console.log(`[timing][ai-artifact-parse] type=${input.type} ms=${Date.now() - parseStartedAt}`);
  return parsed;
}

async function requestProviderText(input: {
  config: AiProviderConfig;
  systemPrompt: string;
  messages: ProviderMessage[];
  maxTokens: number;
  temperature: number;
  responseFormat?: "json_object";
  logLabel: string;
  requestDetails: string;
}): Promise<{ content: string; finishReason?: string | null }> {
  if (input.config.provider === "anthropic") {
    return requestAnthropicText(input);
  }
  return requestOpenAiCompatibleText(input);
}

async function requestOpenAiCompatibleText(input: {
  config: AiProviderConfig;
  systemPrompt: string;
  messages: ProviderMessage[];
  maxTokens: number;
  temperature: number;
  responseFormat?: "json_object";
  logLabel: string;
  requestDetails: string;
}): Promise<{ content: string; finishReason?: string | null }> {
  const payload: Record<string, unknown> = {
    model: input.config.model,
    messages: [
      {
        role: "system",
        content: input.systemPrompt
      },
      ...input.messages
    ],
    max_tokens: input.maxTokens,
    temperature: input.temperature
  };
  if (input.responseFormat) {
    payload.response_format = { type: input.responseFormat };
  }

  const requestBody = JSON.stringify(payload);
  console.log(
    `[timing][provider-request] ${input.logLabel} provider=${input.config.provider} payload_bytes=${Buffer.byteLength(requestBody, "utf8")} ${input.requestDetails}`
  );

  const apiStartedAt = Date.now();
  const response = await fetch(`${input.config.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${input.config.apiKey}`
    },
    body: requestBody
  });
  console.log(
    `[timing][provider-response] ${input.logLabel} provider=${input.config.provider} status=${response.status} headers_ms=${Date.now() - apiStartedAt}`
  );

  if (!response.ok) {
    throw new Error(`AI request failed with ${response.status}: ${await response.text()}`);
  }

  const bodyStartedAt = Date.now();
  const data = (await response.json()) as {
    choices?: Array<{ finish_reason?: string | null; message?: { content?: string } }>;
  };
  console.log(
    `[timing][provider-response] ${input.logLabel} provider=${input.config.provider} body_json_ms=${Date.now() - bodyStartedAt}`
  );

  const choice = data.choices?.[0];
  const content = choice?.message?.content;
  if (!content) throw new Error("AI response did not include content");
  return { content, finishReason: choice?.finish_reason };
}

async function requestAnthropicText(input: {
  config: AiProviderConfig;
  systemPrompt: string;
  messages: ProviderMessage[];
  maxTokens: number;
  temperature: number;
  logLabel: string;
  requestDetails: string;
}): Promise<{ content: string; finishReason?: string | null }> {
  const payload = {
    model: input.config.model,
    system: input.systemPrompt,
    messages: input.messages,
    max_tokens: input.maxTokens,
    temperature: input.temperature
  };
  const requestBody = JSON.stringify(payload);
  console.log(
    `[timing][provider-request] ${input.logLabel} provider=anthropic payload_bytes=${Buffer.byteLength(requestBody, "utf8")} ${input.requestDetails}`
  );

  const apiStartedAt = Date.now();
  const response = await fetch(`${input.config.baseUrl}/messages`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": input.config.apiKey,
      "anthropic-version": input.config.anthropicVersion ?? "2023-06-01"
    },
    body: requestBody
  });
  console.log(
    `[timing][provider-response] ${input.logLabel} provider=anthropic status=${response.status} headers_ms=${Date.now() - apiStartedAt}`
  );

  if (!response.ok) {
    throw new Error(`Anthropic request failed with ${response.status}: ${await response.text()}`);
  }

  const bodyStartedAt = Date.now();
  const data = (await response.json()) as {
    content?: Array<{ type?: string; text?: string }>;
    stop_reason?: string | null;
  };
  console.log(
    `[timing][provider-response] ${input.logLabel} provider=anthropic body_json_ms=${Date.now() - bodyStartedAt}`
  );

  const content = data.content
    ?.filter((block) => block.type === "text" && typeof block.text === "string")
    .map((block) => block.text)
    .join("\n")
    .trim();
  if (!content) throw new Error("Anthropic response did not include text content");
  return { content, finishReason: data.stop_reason };
}

function buildAiSystemPrompt(conversationSummary?: string): string {
  return `You are generating or editing a production-quality HTML-first presentation workspace for SlideLeaf.
Return only the file-block format below. Do not include markdown fences, explanations, or JSON.

<slideleaf-workspace>
<summary>Short description of the full workspace update.</summary>
<file path="project.config.json">
Complete replacement file content.
</file>
<file path="slides/deck.html">
Complete replacement file content.
</file>
</slideleaf-workspace>

Rules:
- Prefer one complete standalone HTML deck at slides/deck.html, including <!doctype html>, <head>, embedded <style>, <body>, slide sections, navigation controls, progress indicator, and small inline JavaScript for keyboard/button navigation.
- Always include or update project.config.json so entry points to slides/deck.html.
- Use HTML, not Markdown, for presentation content.
- Follow the latest workflow artifacts as source of truth in this order: creative brief, visual directions, deck plan.
- Prefer a complete, coherent deck: title slide, structured content slides, and a strong closing slide.
- Return full file contents for every file you create or modify; never return patches.
- For most requests, return only project.config.json and slides/deck.html unless another file is necessary.
- Do not create Markdown slide files.
- Do not load remote JavaScript or remote CSS. Inline CSS and small inline navigation JavaScript are acceptable.
- Do not include the literal closing tag </file> inside file contents.
- Keep paths relative to the workspace, such as slides/intro.html and themes/default.css.

Visual quality rules:
- Do not make generic AI slides: avoid purple gradients on white, default centered card grids, random glassmorphism, decorative blobs without purpose, and timid one-note palettes.
- Commit to one visual system with distinct typography, color, composition, navigation, and motion language.
- Every slide needs one dominant message and one clear hierarchy.
- Use HTML/CSS/JS deliberately: staggered reveals, progressive diagrams, timeline builds, card cascades, counter animation, slide progress, keyboard navigation, and clean transitions are encouraged when they support the message.
- Keep all scripts inline, small, and deterministic. Do not fetch remote code.

Viewport and density rules:
- Every slide must fit a 16:9 viewport without scrolling.
- Use .slide { width: 100vw; height: 100vh; height: 100dvh; overflow: hidden; }.
- Use clamp() for major font sizes and spacing.
- Keep content density controlled: 4-6 bullets maximum, 3-6 cards maximum, and split dense content into more slides.
- Images and diagrams must have viewport-relative max dimensions.
- Include prefers-reduced-motion support.

Compile quality gate:
- The renderer will fail the deck if no class="slide" elements exist.
- The renderer will fail the deck if the viewport meta tag is missing.
- The renderer will fail remote <script src="..."> and javascript: URLs.
- Warnings are emitted for missing keyboard navigation, missing progress/counter feedback, dense slides, missing 100vh/100dvh slide sizing, and missing reduced-motion fallback.
- Avoid these warnings where possible; they are product quality signals.

Conversation memory:
${conversationSummary?.trim() || "No prior conversation summary yet."}`;
}

function parseAiWorkspaceResponse(raw: string): { summary?: unknown; files?: unknown; newContent?: unknown } {
  const cleaned = stripJsonCodeFence(raw);
  const blockPayload = parseFileBlockPayload(cleaned);
  if (blockPayload) return blockPayload;

  const jsonPayload = tryParseJsonPayload(cleaned);
  if (jsonPayload) return jsonPayload;

  throw new Error("AI response did not follow the required workspace file format. Please retry the request.");
}

function parseFileBlockPayload(raw: string): { summary: string; files: Array<{ path: string; content: string }> } | null {
  const fileRegex = /<file\s+path=(["'])(.*?)\1\s*>([\s\S]*?)<\/file>/gi;
  const files: Array<{ path: string; content: string }> = [];
  let match: RegExpExecArray | null;

  while ((match = fileRegex.exec(raw))) {
    const pathValue = match[2]?.trim();
    const contentValue = unwrapFileBlockContent(match[3] ?? "");
    if (pathValue) {
      files.push({ path: pathValue, content: contentValue });
    }
  }

  if (!files.length) return null;

  const summaryMatch = /<summary\b[^>]*>([\s\S]*?)<\/summary>/i.exec(raw);
  return {
    summary: summaryMatch ? unwrapFileBlockContent(summaryMatch[1] ?? "") : "Updated workspace files",
    files
  };
}

function tryParseJsonPayload(raw: string): { summary?: unknown; files?: unknown; newContent?: unknown } | null {
  try {
    return JSON.parse(raw) as { summary?: unknown; files?: unknown; newContent?: unknown };
  } catch {
    return null;
  }
}

function parseJsonObject(raw: string, label: string): Prisma.InputJsonValue {
  try {
    const parsed = JSON.parse(stripJsonCodeFence(raw)) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new Error(`${label} must be a JSON object`);
    }
    return parsed as Prisma.InputJsonValue;
  } catch (error) {
    if (error instanceof Error && error.message.includes("must be a JSON object")) throw error;
    throw new Error(`${label} was not valid JSON. Please regenerate this step.`);
  }
}

function unwrapFileBlockContent(raw: string): string {
  let content = raw;
  if (content.startsWith("\r\n")) content = content.slice(2);
  else if (content.startsWith("\n")) content = content.slice(1);
  if (content.endsWith("\r\n")) content = content.slice(0, -2);
  else if (content.endsWith("\n")) content = content.slice(0, -1);

  const cdataMatch = /^<!\[CDATA\[([\s\S]*?)\]\]>$/.exec(content.trim());
  return cdataMatch?.[1] ?? content;
}

function buildAiContextFiles(files: WorkspaceTextFile[]): Array<{ path: string; mimeType: string | null; content: string }> {
  const maxTotalChars = parsePositiveInt(process.env.AI_CONTEXT_MAX_CHARS, 180_000);
  let remaining = maxTotalChars;

  return files.map((file) => {
    const content = file.contentText;
    const clipped = content.length > remaining ? `${content.slice(0, Math.max(0, remaining))}\n<!-- truncated -->` : content;
    remaining = Math.max(0, remaining - content.length);
    return {
      path: file.path,
      mimeType: file.mimeType,
      content: clipped
    };
  });
}

function parseGeneratedFiles(parsed: { files?: unknown; newContent?: unknown }): Array<{ path: string; content: string }> {
  if (Array.isArray(parsed.files)) {
    return parsed.files.map((item, index) => {
      if (!item || typeof item !== "object") {
        throw new Error(`AI response file at index ${index} is invalid`);
      }
      const pathValue = (item as { path?: unknown }).path;
      const contentValue = (item as { content?: unknown; newContent?: unknown }).content ?? (item as { newContent?: unknown }).newContent;
      if (typeof pathValue !== "string" || typeof contentValue !== "string") {
        throw new Error(`AI response file at index ${index} must include string path and content`);
      }
      return {
        path: pathValue,
        content: contentValue
      };
    });
  }

  throw new Error("AI response did not include files array");
}

function buildWorkspaceDiff(input: {
  summary: string;
  generatedFiles: Array<{ path: string; content: string }>;
  existingFiles: WorkspaceTextFile[];
}): AiDiffJson {
  const existingByPath = new Map(input.existingFiles.map((file) => [file.path, file]));
  const files = input.generatedFiles.map((generated) => {
    const path = validateGeneratedPath(generated.path, generated.content);
    const existing = existingByPath.get(path);
    const newContent = normalizeGeneratedContent(path, generated.content);
    const oldContent = existing?.contentText ?? "";
    return {
      fileId: existing?.id,
      path,
      action: existing ? "update" : "create",
      oldContent,
      newContent,
      lines: buildLineDiff(oldContent, newContent)
    } satisfies AiFilePatch;
  });

  return {
    summary: input.summary,
    files
  };
}

function validateGeneratedPath(inputPath: string, content: string): string {
  const filePath = normalizeClientPath(inputPath);
  if (filePath.startsWith("slides/") && filePath.toLowerCase().endsWith(".md")) {
    throw new Error("AI response attempted to create a Markdown slide. Use .html slide files.");
  }
  if (filePath === "project.config.json") {
    validateProjectConfigContent(content);
  }
  return filePath;
}

function validateProjectConfigContent(content: string): void {
  let parsed: { slides?: unknown; entry?: unknown };
  try {
    parsed = JSON.parse(content) as { slides?: unknown; entry?: unknown };
  } catch {
    throw new Error("AI response generated invalid project.config.json. Regenerate with valid JSON config content.");
  }
  const slidePaths = Array.isArray(parsed.slides) ? parsed.slides : parsed.entry ? [parsed.entry] : [];
  for (const slidePath of slidePaths) {
    if (typeof slidePath !== "string") {
      throw new Error("project.config.json slides must be strings");
    }
    if (slidePath.startsWith("slides/") && !slidePath.toLowerCase().endsWith(".html")) {
      throw new Error("project.config.json must reference HTML slide files");
    }
  }
}

function normalizeGeneratedContent(filePath: string, content: string): string {
  if (filePath.toLowerCase().endsWith(".html")) {
    return isFullHtmlDocument(content) ? sanitizeFullHtmlDocument(content) : sanitizeHtmlFragment(content);
  }
  return content;
}

function isFullHtmlDocument(source: string): boolean {
  return /^\s*<!doctype\s+html/i.test(source) || /^\s*<html[\s>]/i.test(source);
}

function sanitizeHtmlFragment(source: string): string {
  return source
    .replace(/<script\b[\s\S]*?<\/script>/gi, "")
    .replace(/\s+on[a-z]+\s*=\s*"[^"]*"/gi, "")
    .replace(/\s+on[a-z]+\s*=\s*'[^']*'/gi, "")
    .replace(/\s+on[a-z]+\s*=\s*[^\s>]+/gi, "")
    .replace(/\b(href|src)\s*=\s*(["'])\s*javascript:[\s\S]*?\2/gi, '$1="#"');
}

function sanitizeFullHtmlDocument(source: string): string {
  return source
    .replace(/<script\b[^>]*\bsrc\s*=\s*(["'])[\s\S]*?\1[^>]*>\s*<\/script>/gi, "")
    .replace(/<link\b[^>]*\bhref\s*=\s*(["'])https?:[\s\S]*?\1[^>]*>/gi, "")
    .replace(/\b(href|src)\s*=\s*(["'])\s*javascript:[\s\S]*?\2/gi, '$1="#"');
}

class TimingLogger {
  private readonly startedAt = Date.now();
  private lastMarkAt = this.startedAt;

  constructor(
    private readonly scope: string,
    private readonly id: string
  ) {
    this.mark("start");
  }

  mark(step: string, details?: Record<string, unknown> | string): void {
    const now = Date.now();
    console.log(
      `[timing][${this.scope}] id=${this.id} step=${step} +${now - this.lastMarkAt}ms total=${now - this.startedAt}ms${formatTimingDetails(details)}`
    );
    this.lastMarkAt = now;
  }

  end(step = "done"): void {
    this.mark(step);
  }

  fail(error: unknown): void {
    const message = error instanceof Error ? error.message : String(error);
    this.mark("failed", message);
  }
}

function formatTimingDetails(details?: Record<string, unknown> | string): string {
  if (!details) return "";
  if (typeof details === "string") return ` message=${JSON.stringify(details)}`;
  const entries = Object.entries(details).map(([key, value]) => `${key}=${JSON.stringify(value)}`);
  return entries.length ? ` ${entries.join(" ")}` : "";
}

type AiProviderConfig = {
  provider: "deepseek" | "openai" | "gemini" | "anthropic";
  apiKey: string;
  baseUrl: string;
  model: string;
  maxTokens: number;
  anthropicVersion?: string;
};

function resolveAiConfig(providerOverride?: string): AiProviderConfig {
  const normalizedOverride = providerOverride?.trim().toLowerCase();
  if (normalizedOverride && normalizedOverride !== "deepseek" && normalizedOverride !== "gemini") {
    throw new BadRequestException("AI provider must be deepseek or gemini");
  }
  const rawProvider = (normalizedOverride || process.env.AI_PROVIDER || "deepseek").toLowerCase();
  const provider: AiProviderConfig["provider"] =
    rawProvider === "gemini"
        ? "gemini"
        : rawProvider === "deepseek"
          ? "deepseek"
          : rawProvider === "openai"
            ? "openai"
            : rawProvider === "anthropic" || rawProvider === "claude"
              ? "anthropic"
              : "deepseek";

  if (provider === "deepseek") {
    return {
      provider,
      apiKey: process.env.DEEPSEEK_API_KEY || process.env.OPENAI_API_KEY || "",
      baseUrl: normalizeBaseUrl(process.env.DEEPSEEK_BASE_URL || process.env.AI_BASE_URL || "https://api.deepseek.com"),
      model: process.env.DEEPSEEK_MODEL || process.env.AI_MODEL || "deepseek-v4-pro",
      maxTokens: parsePositiveInt(process.env.AI_MAX_TOKENS, 8192)
    };
  }

  if (provider === "gemini") {
    return {
      provider,
      apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "",
      baseUrl: normalizeBaseUrl(
        process.env.GEMINI_BASE_URL || process.env.AI_BASE_URL || "https://generativelanguage.googleapis.com/v1beta/openai"
      ),
      model: process.env.GEMINI_MODEL || process.env.AI_MODEL || "gemini-3-flash-preview",
      maxTokens: parsePositiveInt(process.env.AI_MAX_TOKENS, 8192)
    };
  }

  if (provider === "anthropic") {
    return {
      provider,
      apiKey: process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY || "",
      baseUrl: normalizeBaseUrl(process.env.ANTHROPIC_BASE_URL || process.env.CLAUDE_BASE_URL || process.env.AI_BASE_URL || "https://api.anthropic.com/v1"),
      model: process.env.ANTHROPIC_MODEL || process.env.CLAUDE_MODEL || process.env.AI_MODEL || "claude-sonnet-4-6",
      maxTokens: parsePositiveInt(process.env.AI_MAX_TOKENS, 8192),
      anthropicVersion: process.env.ANTHROPIC_VERSION || "2023-06-01"
    };
  }

  return {
    provider,
    apiKey: process.env.OPENAI_API_KEY || "",
    baseUrl: normalizeBaseUrl(process.env.OPENAI_BASE_URL || process.env.AI_BASE_URL || "https://api.openai.com/v1"),
    model: process.env.OPENAI_MODEL || process.env.AI_MODEL || "gpt-4.1-mini",
    maxTokens: parsePositiveInt(process.env.AI_MAX_TOKENS, 8192)
  };
}

function normalizeBaseUrl(input: string): string {
  return input.replace(/\/+$/, "");
}

function parsePositiveInt(input: string | undefined, fallback: number): number {
  const parsed = Number.parseInt(input ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function titleFromInstruction(instruction: string): string {
  const compact = instruction.replace(/\s+/g, " ").trim();
  return compact.length > 48 ? `${compact.slice(0, 48)}...` : compact || "Workspace chat";
}

function clipForSummary(input: string): string {
  const compact = input.replace(/\s+/g, " ").trim();
  return compact.length > 180 ? `${compact.slice(0, 180)}...` : compact;
}

function clipConversationMessage(input: string): string {
  const maxChars = 2_000;
  return input.length > maxChars ? `${input.slice(0, maxChars)}\n[message clipped]` : input;
}

function humanStage(stage: WorkflowStage): string {
  if (stage === "consultation") return "Consultation";
  if (stage === "visual_direction") return "Visual Direction";
  if (stage === "slide_plan") return "Plan";
  return "Generate HTML";
}

function stripJsonCodeFence(input: string): string {
  const trimmed = input.trim();
  const match = /^```(?:json)?\s*([\s\S]*?)\s*```$/i.exec(trimmed);
  return match?.[1]?.trim() ?? trimmed;
}

function normalizeTaskDiff(raw: unknown): AiDiffJson {
  const diff = raw as Partial<AiDiffJson> | null;
  if (!diff) {
    return { summary: "Empty AI patch", files: [] };
  }

  if (Array.isArray(diff.files)) {
    return {
      summary: typeof diff.summary === "string" ? diff.summary : "Updated workspace files",
      files: diff.files
    };
  }

  if (typeof diff.fileId === "string" && typeof diff.newContent === "string") {
    return {
      summary: typeof diff.summary === "string" ? diff.summary : "Updated file content",
      files: [
        {
          fileId: diff.fileId,
          path: "unknown",
          action: "update",
          oldContent: typeof diff.oldContent === "string" ? diff.oldContent : "",
          newContent: diff.newContent,
          lines: Array.isArray(diff.lines) ? diff.lines : []
        }
      ]
    };
  }

  return { summary: "Invalid AI patch", files: [] };
}

async function ensureFolderPath(
  tx: Prisma.TransactionClient,
  projectId: string,
  folderPath: string | null
): Promise<string | null> {
  if (!folderPath) return null;

  let parentId: string | null = null;
  const parts = folderPath.split("/");
  for (let index = 0; index < parts.length; index += 1) {
    const currentPath = parts.slice(0, index + 1).join("/");
    const existing = await tx.file.findFirst({ where: { projectId, path: currentPath } });
    if (existing) {
      if (existing.kind !== "folder") {
        throw new BadRequestException(`Workspace path is not a folder: ${currentPath}`);
      }
      parentId = existing.id;
      continue;
    }

    const created: { id: string } = await tx.file.create({
      data: {
        projectId,
        parentId,
        path: currentPath,
        name: nameFor(currentPath),
        kind: "folder",
        isBinary: false,
        contentText: null
      }
    });
    parentId = created.id;
  }

  return parentId;
}

function guessMimeType(filePath: string): string {
  const lower = filePath.toLowerCase();
  if (lower.endsWith(".html") || lower.endsWith(".htm")) return "text/html";
  if (lower.endsWith(".css")) return "text/css";
  if (lower.endsWith(".json")) return "application/json";
  if (lower.endsWith(".md")) return "text/markdown";
  if (lower.endsWith(".txt")) return "text/plain";
  return "text/plain";
}

function buildLineDiff(oldContent: string, newContent: string): AiDiffLine[] {
  if (oldContent === newContent) {
    return oldContent.split("\n").map((text) => ({ type: "same", text }));
  }

  return [
    ...oldContent.split("\n").map((text) => ({ type: "remove" as const, text })),
    ...newContent.split("\n").map((text) => ({ type: "add" as const, text }))
  ];
}
