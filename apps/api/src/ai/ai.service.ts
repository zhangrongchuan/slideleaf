import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import type { AiConversation, Prisma } from "@prisma/client";
import { Buffer } from "node:buffer";
import { createHash } from "node:crypto";
import {
  getPlaybookEntriesByIds,
  renderPlaybookCandidateIndex,
  renderPlaybookContext,
  selectPlaybookEntries,
  selectPlaybookEntriesWithAlternates,
  type PlaybookEntry,
  type PlaybookQuery
} from "@slideleaf/ai-playbook";
import { PrismaService } from "../prisma/prisma.service.js";
import { ProjectsService } from "../projects/projects.service.js";
import { nameFor, normalizeClientPath, parentPathFor } from "../workspace-paths.js";
import {
  buildDefaultDeckCss,
  buildDefaultDeckRuntime,
  buildProjectConfig,
  deckPlanHash,
  flattenDeckSlides,
  normalizeDeckPlan,
  sanitizeSlideHtmlFragment,
  slideFilePath,
  validateDeckPlan,
  type DeckPlan,
  type DeckSlidePlan
} from "./deck-plan.js";
import {
  SLIDELEAF_ROOT_PROMPT,
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
  action: "create" | "update" | "delete";
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

type GeneratedWorkspaceChanges = {
  files: Array<{ path: string; content: string }>;
  deletePaths: string[];
};

type ParsedWorkspacePayload = {
  summary?: unknown;
  files?: unknown;
  newContent?: unknown;
  deletePaths?: unknown;
  deletes?: unknown;
};

type SlideTextDensity = "concise" | "balanced" | "dense";

type CustomAiProviderInput = {
  provider?: unknown;
  apiKey?: unknown;
  baseUrl?: unknown;
  model?: unknown;
  anthropicModelFamily?: unknown;
};

type AiConversationMessage = {
  role: "user" | "assistant";
  content: string;
};

type ProviderMessage = {
  role: "user" | "assistant";
  content: string;
};

type TokenUsage = {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
};

type CreditCharge = {
  label: string;
  provider: AiProviderConfig["provider"];
  model: string;
  inputTokens: number;
  outputTokens: number;
  creditsMilli: number;
  credits: number;
  remainingCreditsMilli: number;
  remainingCredits: number;
};

type DeckGenerationRunJson = {
  kind: "deck_generation_run";
  taskId?: string;
  planArtifactId: string;
  planHash: string;
  provider: string;
  status: "running" | "needs_review" | "failed";
  slides: DeckGenerationSlideJobJson[];
  validation: {
    errors: string[];
    warnings: string[];
  };
};

type DeckGenerationSlideJobJson = {
  slideId: string;
  index: number;
  path: string;
  status: "pending" | "running" | "done" | "failed";
  dependencies: string[];
  inputContextHash: string;
  error?: string;
  retries: number;
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
    const messages = (await this.prisma.aiMessage.findMany({
      where: { conversationId: conversation.id },
      orderBy: { createdAt: "desc" },
      take: 120
    })).reverse();

    return { conversation, messages };
  }

  async getWorkflow(userId: string, projectId: string, conversationId?: string) {
    await this.projects.assertAccess(userId, projectId, "viewer");
    const conversation = await this.getOrCreateProjectConversation(userId, projectId, conversationId);
    const [messages, artifacts, tasks] = await Promise.all([
      this.prisma.aiMessage.findMany({
        where: { conversationId: conversation.id },
        orderBy: { createdAt: "desc" },
        take: 120
      }).then((messages) => messages.reverse()),
      this.prisma.aiArtifact.findMany({
        where: { conversationId: conversation.id },
        orderBy: { updatedAt: "desc" },
        take: 30
      }),
      this.prisma.aiTask.findMany({
        where: {
          projectId,
          userId,
          conversationId: conversation.id,
          status: { in: ["running", "needs_review", "failed"] }
        },
        orderBy: { updatedAt: "desc" },
        take: 10
      })
    ]);

    return { conversation, messages, artifacts, tasks };
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
    body: { conversationId?: string; clientRequestId?: string; type?: string; instruction?: string; provider?: string; density?: string; customProvider?: unknown }
  ) {
    const timer = new TimingLogger("ai-artifact", `${projectId}:${body.type ?? "unknown"}`);
    await this.projects.assertAccess(userId, projectId, "editor");
    if (!isArtifactType(body.type)) throw new BadRequestException("Invalid AI artifact type");
    const conversation = await this.getOrCreateProjectConversation(userId, projectId, body.conversationId);
    const instruction = body.instruction?.trim() || `Generate ${artifactLabel(body.type)} for this deck.`;
    const clientRequestId = normalizeClientRequestId(body.clientRequestId);
    const density = normalizeSlideTextDensity(body.density);
    const requestStartedAt = Date.now();
    const aiConfig = resolveAiConfig(body.provider, body.customProvider);
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
    await this.assertOfficialCreditsAvailable(userId, aiConfig);

    const task = await this.prisma.aiTask.create({
      data: {
        projectId,
        userId,
        conversationId: conversation.id,
        status: "running",
        prompt: instruction
      }
    });
    const userMessage = await this.prisma.aiMessage.create({
      data: {
        conversationId: conversation.id,
        role: "user",
        content: instruction,
        aiTaskId: task.id,
        metadata: {
          workflowAction: `generate_${body.type}`,
          textDensity: density,
          status: "running",
          ...(clientRequestId ? { clientRequestId } : {})
        }
      }
    });
    const artifact = await this.prisma.aiArtifact.create({
      data: {
        projectId,
        conversationId: conversation.id,
        type: body.type,
        status: "running",
        contentJson: {
          kind: "workflow_artifact_run",
          type: body.type,
          label: artifactLabel(body.type),
          instruction,
          status: "running",
          startedAt: new Date().toISOString()
        } as Prisma.InputJsonValue
      }
    });
    await this.prisma.aiConversation.update({
      where: { id: conversation.id },
      data: {
        title: conversation.title ?? titleFromInstruction(instruction),
        updatedAt: new Date()
      }
    });
    timer.mark("persist_background_job", { taskId: task.id, artifactId: artifact.id, userMessageId: userMessage.id });

    void this.runArtifactGenerationJob({
      timer,
      projectId,
      conversationId: conversation.id,
      conversationSummary: conversation.summary ?? undefined,
      type: body.type,
      instruction,
      density,
      aiConfig,
      userId,
      taskId: task.id,
      artifactId: artifact.id,
      userMessageId: userMessage.id,
      requestStartedAt
    });

    return { artifact, task };
  }

  private async runArtifactGenerationJob(input: {
    timer: TimingLogger;
    projectId: string;
    conversationId: string;
    conversationSummary?: string;
    type: ArtifactType;
    instruction: string;
    density: SlideTextDensity;
    aiConfig: AiProviderConfig;
    userId: string;
    taskId: string;
    artifactId: string;
    userMessageId: string;
    requestStartedAt: number;
  }): Promise<void> {
    const {
      timer,
      projectId,
      conversationId,
      conversationSummary,
      type,
      instruction,
      density,
      aiConfig,
      userId,
      taskId,
      artifactId,
      userMessageId,
      requestStartedAt
    } = input;

    try {
      const [workspaceFiles, messages, artifacts] = await Promise.all([
        this.getWorkspaceTextFiles(projectId),
        this.loadRecentConversationMessages(conversationId),
        this.loadWorkflowArtifacts(conversationId)
      ]);
      const contextChars = workspaceFiles.reduce((sum, file) => sum + file.contentText.length, 0);
      timer.mark("background_load_context", {
        files: workspaceFiles.length,
        chars: contextChars,
        history: messages.length,
        artifacts: artifacts.length
      });

      const response = await requestAiArtifact({
        type,
        config: aiConfig,
        instruction,
        density,
        conversationSummary,
        conversationMessages: messages,
        artifacts,
        files: workspaceFiles
      });
      const contentJson = response.contentJson;
      const usage = response.usage;
      const playbookCreditCharge = await this.chargeOfficialModelUsage(
        userId,
        aiConfig,
        response.playbookUsage,
        "playbook"
      );
      const creditCharge = await this.chargeOfficialModelUsage(userId, aiConfig, usage, "artifact");
      timer.mark("ai_artifact_response", { usage, creditCharge, playbookCreditCharge });

      const artifact = await this.prisma.aiArtifact.update({
        where: { id: artifactId },
        data: {
          status: "draft",
          contentJson
        }
      });
      timer.mark("persist_artifact", { artifactId: artifact.id });
      await this.prisma.aiMessage.create({
        data: {
          conversationId,
          role: "assistant",
          content: `${artifactLabel(type)} updated.`,
          aiTaskId: taskId,
          metadata: {
            workflowAction: `generated_${type}`,
            artifactId: artifact.id,
            userMessageId,
            status: "updated",
            usage,
            creditCharge,
            playbookCreditCharge
          }
        }
      });
      await this.prisma.aiTask.update({
        where: { id: taskId },
        data: { status: "done" }
      });
      await this.prisma.aiConversation.update({
        where: { id: conversationId },
        data: {
          stage: stageForArtifact(type),
          updatedAt: new Date()
        }
      });
      await this.refreshConversationMemory(conversationId);
      timer.mark("persist_messages_memory");
      console.log(
        `[ai-workflow] conversation=${conversationId} type=${type} ready total_ms=${Date.now() - requestStartedAt}`
      );
      timer.end("done");
    } catch (error) {
      timer.fail(error);
      const log = error instanceof Error ? error.message : String(error);
      await this.prisma.aiArtifact.update({
        where: { id: artifactId },
        data: {
          status: "failed",
          contentJson: {
            kind: "workflow_artifact_run",
            type,
            label: artifactLabel(type),
            instruction,
            status: "failed",
            error: log,
            finishedAt: new Date().toISOString()
          } as Prisma.InputJsonValue
        }
      });
      await this.prisma.aiMessage.create({
        data: {
          conversationId,
          role: "assistant",
          content: log,
          aiTaskId: taskId,
          metadata: { workflowAction: `generate_${type}`, status: "failed", artifactId }
        }
      });
      await this.prisma.aiTask.update({
        where: { id: taskId },
        data: { status: "failed", log }
      });
      await this.refreshConversationMemory(conversationId);
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

  async generateDeck(
    userId: string,
    projectId: string,
    body: { conversationId?: string; clientRequestId?: string; planArtifactId?: string; provider?: string; density?: string; customProvider?: unknown }
  ) {
    const timer = new TimingLogger("deck-generation", projectId);
    await this.projects.assertAccess(userId, projectId, "editor");
    const conversation = await this.getOrCreateProjectConversation(userId, projectId, body.conversationId);
    const aiConfig = resolveAiConfig(body.provider, body.customProvider);
    const clientRequestId = normalizeClientRequestId(body.clientRequestId);
    const density = normalizeSlideTextDensity(body.density);
    timer.mark("auth_conversation_config", {
      conversationId: conversation.id,
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
    await this.assertOfficialCreditsAvailable(userId, aiConfig);

    const planArtifact = body.planArtifactId
      ? await this.prisma.aiArtifact.findFirst({
          where: { id: body.planArtifactId, projectId, conversationId: conversation.id, type: "slide_plan" }
        })
      : await this.prisma.aiArtifact.findFirst({
          where: { projectId, conversationId: conversation.id, type: "slide_plan", status: "approved" },
          orderBy: { updatedAt: "desc" }
        });

    if (!planArtifact) {
      throw new BadRequestException("Approve a DeckPlan before generating slide files");
    }
    if (planArtifact.status !== "approved") {
      throw new BadRequestException("DeckPlan must be approved/frozen before slide-by-slide generation");
    }

    const plan = normalizeDeckPlan(planArtifact.contentJson);
    const validation = validateDeckPlan(plan);
    if (!validation.ok) {
      throw new BadRequestException(`DeckPlan validation failed: ${validation.errors.join("; ")}`);
    }
    const slides = flattenDeckSlides(plan);
    const planHash = deckPlanHash(plan);
    timer.mark("load_plan_context", {
      planArtifactId: planArtifact.id,
      slides: slides.length,
      warnings: validation.warnings.length
    });

    const task = await this.prisma.aiTask.create({
      data: {
        projectId,
        userId,
        conversationId: conversation.id,
        status: "running",
        prompt: "Generate a multi-file HTML deck from the approved DeckPlan"
      }
    });
    const runJson: DeckGenerationRunJson = {
      kind: "deck_generation_run",
      taskId: task.id,
      planArtifactId: planArtifact.id,
      planHash,
      provider: aiConfig.provider,
      status: "running",
      validation,
      slides: slides.map((slide) => ({
        slideId: slide.id,
        index: slide.index,
        path: slideFilePath(slide),
        status: "pending",
        dependencies: slide.dependencies,
        inputContextHash: "",
        retries: 0
      }))
    };
    const runArtifact = await this.prisma.aiArtifact.create({
      data: {
        projectId,
        conversationId: conversation.id,
        type: "deck_generation_run",
        status: "running",
        contentJson: runJson as unknown as Prisma.InputJsonValue
      }
    });
    await this.prisma.aiMessage.create({
      data: {
        conversationId: conversation.id,
        role: "user",
        content: "Generate the deck slide by slide from the approved DeckPlan.",
        aiTaskId: task.id,
        metadata: {
          workflowAction: "generate_deck",
          planArtifactId: planArtifact.id,
          textDensity: density,
          ...(clientRequestId ? { clientRequestId } : {})
        }
      }
    });
    void this.runDeckGenerationJob({
      timer,
      projectId,
      conversationId: conversation.id,
      conversationSummary: conversation.summary ?? undefined,
      aiConfig,
      userId,
      density,
      plan,
      slides,
      planHash,
      taskId: task.id,
      runArtifactId: runArtifact.id,
      runJson
    });

    timer.mark("queued_background_job", { taskId: task.id, runArtifactId: runArtifact.id });
    return { run: runArtifact, task };
  }

  private async runDeckGenerationJob(input: {
    timer: TimingLogger;
    projectId: string;
    conversationId: string;
    conversationSummary?: string;
    aiConfig: AiProviderConfig;
    userId: string;
    density: SlideTextDensity;
    plan: DeckPlan;
    slides: DeckSlidePlan[];
    planHash: string;
    taskId: string;
    runArtifactId: string;
    runJson: DeckGenerationRunJson;
  }): Promise<void> {
    const {
      timer,
      projectId,
      conversationId,
      conversationSummary,
      aiConfig,
      userId,
      density,
      plan,
      slides,
      planHash,
      taskId,
      runArtifactId,
      runJson
    } = input;
    const generatedFiles: Array<{ path: string; content: string }> = [
      { path: "project.config.json", content: buildProjectConfig(plan) },
      { path: "themes/deck.css", content: buildDefaultDeckCss(plan) },
      { path: "runtime/deck.js", content: buildDefaultDeckRuntime() }
    ];
    const creditCharges: CreditCharge[] = [];

    try {
      const [existingFiles, workflowArtifacts] = await Promise.all([
        this.getWorkspaceTextFiles(projectId),
        this.loadWorkflowArtifacts(conversationId)
      ]);
      timer.mark("background_load_context", {
        files: existingFiles.length,
        artifacts: workflowArtifacts.length
      });

      for (const slide of slides) {
        const job = runJson.slides.find((item) => item.slideId === slide.id);
        if (job) {
          job.status = "running";
          job.inputContextHash = hashJson({
            planHash,
            slide,
            next: nearbySlides(slides, slide).map((item) => item.id)
          });
          await this.prisma.aiArtifact.update({
            where: { id: runArtifactId },
            data: { contentJson: runJson as unknown as Prisma.InputJsonValue }
          });
        }

        const slideResult = await requestAiSlideFragment({
          config: aiConfig,
          plan,
          slide,
          density,
          nextSlides: nearbySlides(slides, slide),
          workflowArtifacts,
          conversationSummary
        });
        const creditCharge = await this.chargeOfficialModelUsage(userId, aiConfig, slideResult.usage, `slide:${slide.id}`);
        if (creditCharge) creditCharges.push(creditCharge);
        const slideHtml = sanitizeSlideHtmlFragment(slideResult.slideHtml, slide);
        generatedFiles.push({ path: slideFilePath(slide), content: slideHtml });

        if (job) {
          job.status = "done";
          await this.prisma.aiArtifact.update({
            where: { id: runArtifactId },
            data: { contentJson: runJson as unknown as Prisma.InputJsonValue }
          });
        }
        timer.mark("slide_done", { slideId: slide.id, usage: slideResult.usage, creditCharge });
      }

      const diff = buildWorkspaceDiff({
        summary: `Generated ${slides.length} modular slide files from the approved DeckPlan.`,
        generatedFiles,
        existingFiles,
        deletePaths: staleDeckSourcePaths(existingFiles, generatedFiles)
      });
      validateGeneratedDeckPatch(diff, slides.map(slideFilePath));
      validateDeckWorkspaceAfterPatch(diff, existingFiles);
      await this.prisma.aiTask.update({
        where: { id: taskId },
        data: {
          status: "needs_review",
          diffJson: diff
        }
      });
      runJson.status = "needs_review";
      await this.prisma.aiArtifact.update({
        where: { id: runArtifactId },
        data: {
          status: "needs_review",
          contentJson: runJson as unknown as Prisma.InputJsonValue
        }
      });
      await this.prisma.aiMessage.create({
        data: {
          conversationId,
          role: "assistant",
          content: `Generated ${slides.length} slide files, a shared theme, optional runtime extension, and project.config.json for review.`,
          aiTaskId: taskId,
          metadata: {
            workflowAction: "generated_deck",
            runArtifactId,
            changedFiles: diff.files.map((file) => ({ path: file.path, action: file.action })),
            creditCharge: summarizeCreditCharges(creditCharges),
            billing: deckGenerationBillingSummary(aiConfig, creditCharges),
            status: "needs_review"
          }
        }
      });
      await this.refreshConversationMemory(conversationId);
      timer.end("done");
    } catch (error) {
      timer.fail(error);
      const log = error instanceof Error ? error.message : String(error);
      runJson.status = "failed";
      const runningJob = runJson.slides.find((item) => item.status === "running");
      if (runningJob) {
        runningJob.status = "failed";
        runningJob.error = log;
      }
      await this.prisma.aiArtifact.update({
        where: { id: runArtifactId },
        data: {
          status: "failed",
          contentJson: runJson as unknown as Prisma.InputJsonValue
        }
      });
      await this.prisma.aiMessage.create({
        data: {
          conversationId,
          role: "assistant",
          content: log,
          aiTaskId: taskId,
          metadata: { workflowAction: "generate_deck", status: "failed", runArtifactId }
        }
      });
      await this.refreshConversationMemory(conversationId);
      await this.prisma.aiTask.update({
        where: { id: taskId },
        data: { status: "failed", log }
      });
    }
  }

  async editFile(
    userId: string,
    projectId: string,
    body: {
      conversationId?: string;
      clientRequestId?: string;
      fileId?: string;
      instruction?: string;
      selectedText?: string | null;
      provider?: string;
      density?: string;
      customProvider?: unknown;
    }
  ) {
    const timer = new TimingLogger("ai-edit", projectId);
    await this.projects.assertAccess(userId, projectId, "editor");
    const instruction = body.instruction?.trim();
    if (!instruction) throw new BadRequestException("instruction is required");
    const clientRequestId = normalizeClientRequestId(body.clientRequestId);
    const density = normalizeSlideTextDensity(body.density);
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
          selectedText: body.selectedText ?? null,
          textDensity: density,
          ...(clientRequestId ? { clientRequestId } : {})
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

    const aiConfig = resolveAiConfig(body.provider, body.customProvider);
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
      await this.assertOfficialCreditsAvailable(userId, aiConfig);
      const workflowArtifacts = await this.loadWorkflowArtifacts(conversation.id);
      timer.mark("load_workflow_artifacts", { artifacts: workflowArtifacts.length });
      const result = await requestAiWorkspaceRewrite({
        taskId: task.id,
        config: aiConfig,
        instruction,
        density,
        files: textFiles,
        conversationSummary: conversation.summary ?? undefined,
        conversationMessages,
        artifacts: workflowArtifacts,
        selectedFilePath: selectedFile?.path,
        selectedText: body.selectedText ?? undefined
      });
      const usage = result.usage;
      const creditCharge = await this.chargeOfficialModelUsage(userId, aiConfig, usage, "workspace-edit");
      timer.mark("ai_workspace_response", {
        files: result.changes.files.length,
        deletes: result.changes.deletePaths.length,
        chars: result.changes.files.reduce((sum, file) => sum + file.content.length, 0),
        usage,
        creditCharge
      });

      const diff = buildWorkspaceDiff({
        summary: result.summary,
        generatedFiles: result.changes.files,
        existingFiles: textFiles,
        deletePaths: result.changes.deletePaths
      });
      validateDeckWorkspaceAfterPatch(diff, textFiles);
      timer.mark("build_diff", { changedFiles: diff.files.length });
      const generatedCharCount = result.changes.files.reduce((sum, file) => sum + file.content.length, 0);
      console.log(
        `[ai] task=${task.id} ready total_ms=${Date.now() - requestStartedAt} generated_files=${result.changes.files.length} delete_paths=${result.changes.deletePaths.length} generated_chars=${generatedCharCount}`
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
            })),
            usage,
            creditCharge
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
    validateDeckWorkspaceAfterPatch(diff, await this.getWorkspaceTextFiles(projectId));

    const appliedTask = await this.prisma.$transaction(async (tx) => {
      for (const filePatch of diff.files) {
        const filePath = normalizeClientPath(filePatch.path);
        const existing = await tx.file.findFirst({ where: { projectId, path: filePath } });
        if (filePatch.action === "delete") {
          if (existing) {
            if (existing.kind === "folder") {
              throw new BadRequestException(`Cannot delete folder from AI patch: ${filePath}`);
            }
            await tx.file.delete({ where: { id: existing.id } });
          }
          continue;
        }
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

  private async assertOfficialCreditsAvailable(userId: string, config: AiProviderConfig): Promise<void> {
    if (config.isCustom || !officialModelPricing(config)) return;
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { creditsMilli: true }
    });
    if (!user || user.creditsMilli <= 0) {
      throw new BadRequestException("Official models require credits. Ask an admin to add credits or select an own API key in AI settings.");
    }
  }

  private async chargeOfficialModelUsage(
    userId: string,
    config: AiProviderConfig,
    usage: TokenUsage | undefined,
    label: string
  ): Promise<CreditCharge | undefined> {
    if (config.isCustom || !usage) return undefined;
    const pricing = officialModelPricing(config);
    if (!pricing) return undefined;
    const creditsMilli = calculateCreditsMilli(usage, pricing);
    if (creditsMilli <= 0) return undefined;

    const updated = await this.prisma.user.updateMany({
      where: {
        id: userId,
        creditsMilli: { gte: creditsMilli }
      },
      data: {
        creditsMilli: { decrement: creditsMilli }
      }
    });
    if (updated.count !== 1) {
      throw new BadRequestException(
        `Insufficient credits for official ${config.model}. This request used ${formatCredits(creditsMilli)} credits. Ask an admin to add credits or select an own API key in AI settings.`
      );
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { creditsMilli: true }
    });
    const remainingCreditsMilli = Math.max(0, user?.creditsMilli ?? 0);
    return {
      label,
      provider: config.provider,
      model: config.model,
      inputTokens: usage.inputTokens,
      outputTokens: usage.outputTokens,
      creditsMilli,
      credits: creditsMilli,
      remainingCreditsMilli,
      remainingCredits: remainingCreditsMilli
    };
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
  density: SlideTextDensity;
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
}): Promise<{ summary: string; changes: GeneratedWorkspaceChanges; usage?: TokenUsage }> {
  const contextFiles = buildAiContextFiles(input.files, input.config);
  const contextChars = contextFiles.reduce((sum, file) => sum + file.content.length, 0);
  const effectiveMaxTokens = input.config.maxTokens;
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
        textDensity: buildSlideTextDensityContext(input.density),
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
    throw new Error("AI response was cut off before complete workspace files were returned. Ask for fewer slides or reduce detail.");
  }

  const parseStartedAt = Date.now();
  const parsed = parseAiWorkspaceResponse(raw);
  const changes = parseGeneratedWorkspaceChanges(parsed);
  console.log(
    `[timing][ai-edit-parse] task=${input.taskId} ms=${Date.now() - parseStartedAt} files=${changes.files.length} deletes=${changes.deletePaths.length}`
  );
  const totalSize = changes.files.reduce((sum, file) => sum + file.content.length, 0);
  if (totalSize > 650_000) {
    throw new Error("AI response is too large");
  }

  return {
    summary: typeof parsed.summary === "string" ? parsed.summary : "Updated workspace files",
    changes,
    usage: completion.usage
  };
}

async function requestAiArtifact(input: {
  type: ArtifactType;
  config: AiProviderConfig;
  instruction: string;
  density: SlideTextDensity;
  files: WorkspaceTextFile[];
  conversationSummary?: string;
  conversationMessages: AiConversationMessage[];
  artifacts: Array<{
    type: string;
    status: string;
    contentJson: Prisma.JsonValue;
  }>;
}): Promise<{ contentJson: Prisma.InputJsonValue; usage?: TokenUsage; playbookUsage?: TokenUsage }> {
  const contextFiles = buildAiContextFiles(input.files, input.config);
  const contextChars = contextFiles.reduce((sum, file) => sum + file.content.length, 0);
  const effectiveMaxTokens = input.config.maxTokens;
  const playbook = await buildArtifactPlaybookContext({
    type: input.type,
    config: input.config,
    instruction: input.instruction,
    conversationSummary: input.conversationSummary,
    artifacts: input.artifacts,
    density: input.density
  });
  const messages: ProviderMessage[] = [
    ...input.conversationMessages.map((message) => ({
      role: message.role,
      content: clipConversationMessage(message.content)
    })),
    {
      role: "user",
      content: JSON.stringify({
        instruction: input.instruction,
        textDensity: buildSlideTextDensityContext(input.density),
        conversationSummary: input.conversationSummary ?? null,
        workflowArtifacts: input.artifacts.map((artifact) => ({
          type: artifact.type,
          status: artifact.status,
          content: artifact.contentJson
        })),
        currentFiles: contextFiles,
        playbookContext: playbook.context
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
    throw new Error("AI artifact response was cut off. Reduce detail or split the request into smaller steps.");
  }

  const parseStartedAt = Date.now();
  const parsed = parseJsonObject(raw, `${artifactLabel(input.type)} response`);
  console.log(`[timing][ai-artifact-parse] type=${input.type} ms=${Date.now() - parseStartedAt}`);
  return { contentJson: parsed, usage: completion.usage, playbookUsage: playbook.usage };
}

async function buildArtifactPlaybookContext(input: {
  type: ArtifactType;
  config: AiProviderConfig;
  instruction: string;
  density: SlideTextDensity;
  conversationSummary?: string;
  artifacts: Array<{
    type: string;
    status: string;
    contentJson: Prisma.JsonValue;
  }>;
}): Promise<{ context: string; usage?: TokenUsage }> {
  if (input.type === "brief") {
    return { context: "No playbook context needed for brief clarification." };
  }

  const query = buildArtifactPlaybookQuery({
    type: input.type,
    instruction: input.instruction,
    conversationSummary: input.conversationSummary,
    artifacts: input.artifacts
  });

  if (input.type !== "visual_direction") {
    return { context: renderPlaybookContext(selectPlaybookEntries(query)) };
  }

  const selection = selectPlaybookEntriesWithAlternates(query, 36);
  const candidatePool = selection.alternates
    .filter((entry) => entry.category === "style-direction" || entry.category === "example")
    .slice(0, 30);
  const extraSelection = await requestAdditionalVisualPlaybookIds({
    config: input.config,
    instruction: input.instruction,
    conversationSummary: input.conversationSummary,
    density: input.density,
    selected: selection.selected,
    candidates: candidatePool
  });
  const candidateIds = new Set(candidatePool.map((entry) => entry.id));
  const extraEntries = getPlaybookEntriesByIds(extraSelection.selectedIds.filter((id) => candidateIds.has(id))).slice(0, 3);
  const finalEntries = mergePlaybookEntries(selection.selected, extraEntries);
  const extraNote = extraEntries.length
    ? `Model requested additional playbook entries: ${extraEntries.map((entry) => entry.id).join(", ")}.`
    : "Model did not request additional playbook entries; backend-selected entries were considered sufficient.";

  return {
    context: `${renderPlaybookContext(finalEntries)}

## Playbook Retrieval Metadata
Backend-selected entries: ${selection.selected.map((entry) => entry.id).join(", ")}
${extraNote}
Candidate policy: backend retrieval provides high-confidence matches first; the model may add up to three alternate style/example entries only when they materially improve the visual direction.`,
    usage: extraSelection.usage
  };
}

function buildArtifactPlaybookQuery(input: {
  type: ArtifactType;
  instruction: string;
  conversationSummary?: string;
  artifacts: Array<{
    type: string;
    status: string;
    contentJson: Prisma.JsonValue;
  }>;
}): PlaybookQuery {
  return {
    deckArchetype: input.type,
    brief: `${input.instruction}\n${input.conversationSummary ?? ""}`,
    extraTerms: input.artifacts.flatMap((artifact) => [
      artifact.type,
      artifact.status,
      safeJsonSearchText(artifact.contentJson)
    ]).concat(
      input.type === "visual_direction"
        ? ["template-candidate-router", "qa-template-style-integrity", "template", "mood", "tone", "formality", "density"]
        : input.type === "slide_plan"
          ? ["qa-template-style-integrity", "style-system", "globalStyle"]
          : []
    ),
    limit: input.type === "visual_direction" ? 14 : 10
  };
}

async function requestAdditionalVisualPlaybookIds(input: {
  config: AiProviderConfig;
  instruction: string;
  density: SlideTextDensity;
  selected: PlaybookEntry[];
  candidates: PlaybookEntry[];
  conversationSummary?: string;
}): Promise<{ selectedIds: string[]; usage?: TokenUsage }> {
  if (!input.candidates.length) return { selectedIds: [] };

  try {
    const completion = await requestProviderText({
      config: input.config,
      systemPrompt: `${SLIDELEAF_ROOT_PROMPT}

You are the SlideLeaf playbook curator for the visual-direction stage.
The backend has already selected high-confidence playbook entries.
Review the additional candidate index and optionally choose up to three ids that would materially improve style diversity, audience fit, or template specificity.
Choose zero ids if the backend selection is already strong.
Return only valid JSON. Do not include markdown fences.`,
      messages: [
        {
          role: "user",
          content: JSON.stringify({
            task: "Optionally select extra playbook entries for the next visual-direction generation prompt.",
            userInstruction: input.instruction,
            conversationSummary: input.conversationSummary ?? null,
            textDensity: buildSlideTextDensityContext(input.density),
            backendSelectedIndex: renderPlaybookCandidateIndex(input.selected),
            additionalCandidateIndex: renderPlaybookCandidateIndex(input.candidates),
            rules: [
              "Return selectedIds from additionalCandidateIndex only.",
              "Select 0-3 ids.",
              "Prefer style-direction/template entries that are genuinely different from the backend selection.",
              "Do not select entries just because they are available."
            ],
            outputSchema: {
              selectedIds: ["candidate id"],
              rationale: "short reason for the selection or for selecting none"
            }
          })
        }
      ],
      maxTokens: 1200,
      temperature: 0.1,
      responseFormat: "json_object",
      logLabel: "playbook-curator visual_direction",
      requestDetails: `selected=${input.selected.length} candidates=${input.candidates.length}`
    });
    const parsed = parseJsonObject(completion.content, "Playbook curator response") as Record<string, unknown>;
    const ids = stringArrayField(parsed.selectedIds).slice(0, 3);
    console.log(`[ai-playbook-curator] selected_extra_ids=${ids.join(",") || "none"}`);
    return { selectedIds: ids, usage: completion.usage };
  } catch (error) {
    console.warn(`[ai-playbook-curator] skipped optional expansion: ${error instanceof Error ? error.message : String(error)}`);
    return { selectedIds: [] };
  }
}

function mergePlaybookEntries(primary: PlaybookEntry[], extra: PlaybookEntry[]): PlaybookEntry[] {
  const seen = new Set<string>();
  const merged: PlaybookEntry[] = [];
  for (const entry of [...primary, ...extra]) {
    if (seen.has(entry.id)) continue;
    seen.add(entry.id);
    merged.push(entry);
  }
  return merged;
}

function stringArrayField(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string" && item.trim().length > 0) : [];
}

async function requestAiSlideFragment(input: {
  config: AiProviderConfig;
  plan: DeckPlan;
  slide: DeckSlidePlan;
  density: SlideTextDensity;
  nextSlides: DeckSlidePlan[];
  workflowArtifacts: Array<{
    type: string;
    status: string;
    contentJson: Prisma.JsonValue;
  }>;
  conversationSummary?: string;
}): Promise<{ slideHtml: string; usage?: TokenUsage }> {
  const playbookEntries = selectPlaybookEntries({
    deckArchetype: input.plan.brief.objective,
    analysisOperator: input.slide.analysisOperator,
    visualPattern: input.slide.recommendedVisual,
    motionPreset: input.slide.motionPreset,
    slideRole: input.slide.role,
    styleDirection: safeJsonSearchText(input.plan.globalStyle),
    tone: input.plan.brief.tone,
    occasion: input.plan.brief.objective,
    audience: input.plan.brief.audience,
    textDensity: input.plan.brief.textDensity ?? input.density,
    brief: `${input.plan.brief.topic}\n${input.plan.mainThesis}\n${input.plan.narrativeArc.tension}\n${input.plan.narrativeArc.resolution}`,
    extraTerms: [
      input.plan.brief.language,
      input.slide.title,
      input.slide.actionTitle,
      input.slide.coreMessage,
      input.slide.question,
      input.slide.tension,
      input.slide.implication
    ],
    limit: 8
  }).filter((entry) => entry.category !== "style-direction");
  const playbookContext = renderPlaybookContext(playbookEntries);
  const prompt = JSON.stringify({
    task: "Generate exactly one HTML slide fragment. Do not generate a complete HTML document.",
    permanentContext: {
      brief: input.plan.brief,
      mainThesis: input.plan.mainThesis,
      narrativeArc: input.plan.narrativeArc,
      globalStyle: input.plan.globalStyle,
      terminology: input.plan.terminology,
      generationRules: input.plan.generationRules,
      textDensity: buildSlideTextDensityContext(input.density)
    },
    currentSlide: input.slide,
    nextSlidesPlan: input.nextSlides,
    evidencePack: input.plan.evidencePack,
    evidencePlan: input.plan.evidencePlan,
    workflowArtifacts: input.workflowArtifacts.map((artifact) => ({
      type: artifact.type,
      status: artifact.status,
      content: artifact.contentJson
    })),
    conversationSummary: input.conversationSummary ?? null,
    playbookContext,
    componentRenderingRules: {
      rules: [
        "Build the visual as semantic HTML/CSS only: grids, tables, bars, matrix cells, roadmap rows, timeline items, flow nodes, metric cards, and callout panels.",
        "Do not use inline SVG, canvas, external chart libraries, remote images, icon libraries, or per-slide scripts.",
        "Do not copy style-direction template class names from playbook examples. The final fragment must use shared deck classes only.",
        "Use shared classes such as slide-content, content-frame, card-grid, metric-grid, matrix-grid, chart-panel, bar-list, timeline-list, roadmap-list, flow-stack, process-flow, architecture-grid, comparison-table, and data-reveal.",
        "For charts, encode evidence with HTML/CSS bars, rows, labels, annotations, and source/assumption notes. Do not invent data.",
        "Keep components readable, responsive, and consistent with deck.css."
      ]
    },
    outputSchema: {
      slideHtml:
        "A single <section class=\"slide\">...</section> fragment. Include data-slide-id, data-motion, data-visual. No <html>, <head>, <body>, <style>, <script>, <svg>, canvas, remote CSS, or remote JS."
    }
  });

  let completion = await requestProviderText({
    config: input.config,
    systemPrompt: buildSlideFragmentSystemPrompt(),
    messages: [{ role: "user", content: prompt }],
    maxTokens: input.config.maxTokens,
    temperature: 0.18,
    responseFormat: "json_object",
    logLabel: `deck-slide slide=${input.slide.id}`,
    requestDetails: `slide=${input.slide.id} operator=${input.slide.analysisOperator} visual=${input.slide.recommendedVisual}`
  });
  let usage = completion.usage;
  if (completion.finishReason === "length" || completion.finishReason === "max_tokens") {
    console.warn(
      `[deck-generation] slide=${input.slide.id} response cut off at ${input.config.maxTokens} tokens; retrying compact fragment`
    );
    completion = await requestProviderText({
      config: input.config,
      systemPrompt: buildSlideFragmentSystemPrompt(),
      messages: [
        {
          role: "user",
          content: JSON.stringify({
            ...JSON.parse(prompt),
            outputBudget: {
              instruction:
                "The previous response was cut off. Return a complete but compact slideHtml fragment under 6000 characters. Prefer concise semantic HTML, compact labels, and shared CSS classes. Do not include explanatory prose.",
              maxSlideHtmlCharacters: 6000
            }
          })
        }
      ],
      maxTokens: input.config.maxTokens,
      temperature: 0.08,
      responseFormat: "json_object",
      logLabel: `deck-slide-retry slide=${input.slide.id}`,
      requestDetails: `slide=${input.slide.id} compact_retry operator=${input.slide.analysisOperator} visual=${input.slide.recommendedVisual}`
    });
    usage = combineTokenUsage(usage, completion.usage);
    if (completion.finishReason === "length" || completion.finishReason === "max_tokens") {
      throw new Error(`Slide ${input.slide.id} response was cut off before a complete fragment was returned after retry.`);
    }
  }

  const parsed = parseJsonObject(completion.content, `Slide ${input.slide.id} response`) as Record<string, unknown>;
  const slideHtml = typeof parsed.slideHtml === "string" ? parsed.slideHtml : "";
  if (!slideHtml.trim()) {
    throw new Error(`Slide ${input.slide.id} response did not include slideHtml`);
  }
  return { slideHtml, usage };
}

function buildSlideFragmentSystemPrompt(): string {
  return `${SLIDELEAF_ROOT_PROMPT}

You are generating one page in a consulting-grade HTML presentation system.
The deck architecture is frozen. Do not change slide order, topic, role, dependencies, or the core message.
Return only valid JSON. Do not include markdown fences.

Slide fragment rules:
- Return exactly one slide fragment in the slideHtml field.
- The fragment must start with <section class="slide"...> and end with </section>.
- The root class must be exactly "slide"; do not add style-template-* or template/private classes to the root.
- Include data-slide-id, data-motion, and data-visual on the root.
- Keep the root <section class="slide"> structurally simple. Do not put position, inset, top/right/bottom/left, z-index, visibility, opacity, pointer-events, width, height, min-height, max-height, or overflow styles on the root. Put visual layout inside a child container such as <div class="slide-content">.
- Every slide must contain a direct child <div class="slide-content">. Put constrained content inside <div class="content-frame">.
- Treat .slide-content as the full-bleed slide canvas. Do not use it as a narrow framed panel.
- If a slide needs constrained content, put <div class="content-frame"> inside .slide-content. Backgrounds, grids, scanlines, and page-level color must cover the full .slide or full .slide-content, never only a max-width content frame.
- Do not mix full-bleed pages and centered 16:9 framed pages in the same deck unless the DeckPlan explicitly requests a framed presentation style.
- Do not copy template class names from playbook examples or style-direction documents. Avoid style-template-*, bg-grid-pink, scanlines, frame, pixel-hero-text, bubble, and other private template selectors.
- Do not include <!doctype>, <html>, <head>, <body>, <style>, <script>, external scripts, external stylesheets, analytics, forms, or network calls.
- Use semantic, compact HTML that depends on the global theme/runtime.
- Prefer strong hierarchy, action-title storytelling, evidence-backed content, and non-repetitive visual patterns.
- Use the rich currentSlide argument spec: claims, evidenceSlots, contentBlocks, dataNeeds, tension, implication, and transition notes.
- Preserve enough information density for a serious executive deck; avoid generic one-line cards when the slide plan calls for proof, metrics, examples, or comparisons.
- Build chart, matrix, timeline, roadmap, architecture, issue-tree, risk, and metric visuals with semantic HTML/CSS components only.
- Do not use <svg>, <canvas>, <foreignObject>, <image>, external icon libraries, chart libraries, filters, or inline event handlers.
- For charts, encode evidence with HTML/CSS bars, rows, labels, annotations, and source/assumption notes. Do not invent data; use placeholders when evidence is missing.
- Use shared theme classes such as slide-content, content-frame, two-column, eyebrow, lead, action-title, card-grid, metric-grid, matrix-grid, chart-panel, bar-list, timeline-list, roadmap-list, flow-stack, process-flow, step-card, architecture-grid, comparison-table, visual-panel, and data-reveal.
- Keep one core message per slide and honor doNotCover.
- Use data-reveal sparingly for sequence, and choose only the requested motion preset.
- If evidence is missing, use explicit placeholders instead of inventing facts.
- The slide must fit a 16:9 viewport without scrolling.`;
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
}): Promise<{ content: string; finishReason?: string | null; usage?: TokenUsage }> {
  console.log("========== AI PROMPT DUMP ==========");
  console.log(`[Target] Provider: ${input.config.provider}, Model: ${input.config.model}`);
  console.log(`[System Prompt]\n${input.systemPrompt}\n`);
  input.messages.forEach((msg, i) => {
    console.log(`[${msg.role.toUpperCase()} Message ${i}]\n${msg.content}\n`);
  });
  console.log("====================================");

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
}): Promise<{ content: string; finishReason?: string | null; usage?: TokenUsage }> {
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

  const response = await fetchProviderWithRetry({
    url: `${input.config.baseUrl}/chat/completions`,
    init: {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${input.config.apiKey}`
      },
      body: requestBody
    },
    provider: input.config.provider,
    logLabel: input.logLabel
  });

  const bodyStartedAt = Date.now();
  const data = (await response.json()) as {
    choices?: Array<{ finish_reason?: string | null; message?: { content?: string } }>;
    usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
  };
  console.log(
    `[timing][provider-response] ${input.logLabel} provider=${input.config.provider} body_json_ms=${Date.now() - bodyStartedAt}`
  );

  const choice = data.choices?.[0];
  const content = choice?.message?.content;
  if (!content) throw new Error("AI response did not include content");

  const usage = data.usage ? {
    inputTokens: data.usage.prompt_tokens ?? 0,
    outputTokens: data.usage.completion_tokens ?? 0,
    totalTokens: data.usage.total_tokens ?? 0
  } : undefined;

  return { content, finishReason: choice?.finish_reason, usage };
}

async function requestAnthropicText(input: {
  config: AiProviderConfig;
  systemPrompt: string;
  messages: ProviderMessage[];
  maxTokens: number;
  temperature: number;
  logLabel: string;
  requestDetails: string;
}): Promise<{ content: string; finishReason?: string | null; usage?: TokenUsage }> {
  const payload: Record<string, unknown> = {
    model: input.config.model,
    system: input.systemPrompt,
    messages: input.messages,
    max_tokens: input.maxTokens
  };
  if (input.config.anthropicEffort) {
    payload.output_config = { effort: input.config.anthropicEffort };
  }
  if (input.config.anthropicThinking === "adaptive") {
    payload.thinking = { type: "adaptive" };
  }
  const requestBody = JSON.stringify(payload);
  console.log(
    `[timing][provider-request] ${input.logLabel} provider=anthropic payload_bytes=${Buffer.byteLength(requestBody, "utf8")} ${input.requestDetails}`
  );

  const response = await fetchProviderWithRetry({
    url: `${input.config.baseUrl}/messages`,
    init: {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": input.config.apiKey,
        "anthropic-version": input.config.anthropicVersion ?? "2023-06-01"
      },
      body: requestBody
    },
    provider: "anthropic",
    logLabel: input.logLabel
  });

  const bodyStartedAt = Date.now();
  const data = (await response.json()) as {
    content?: Array<{ type?: string; text?: string }>;
    stop_reason?: string | null;
    usage?: { input_tokens?: number; output_tokens?: number };
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

  const usage = data.usage ? {
    inputTokens: data.usage.input_tokens ?? 0,
    outputTokens: data.usage.output_tokens ?? 0,
    totalTokens: (data.usage.input_tokens ?? 0) + (data.usage.output_tokens ?? 0)
  } : undefined;

  return { content, finishReason: data.stop_reason, usage };
}

const PROVIDER_RETRY_DELAYS_MS = [800, 2_000, 4_000];
const PROVIDER_RETRYABLE_STATUSES = new Set([408, 409, 425, 429, 500, 502, 503, 504]);

async function fetchProviderWithRetry(input: {
  url: string;
  init: RequestInit;
  provider: string;
  logLabel: string;
}): Promise<Response> {
  for (let attempt = 0; attempt <= PROVIDER_RETRY_DELAYS_MS.length; attempt += 1) {
    const apiStartedAt = Date.now();
    let response: Response;
    try {
      response = await fetch(input.url, input.init);
    } catch (error) {
      if (attempt < PROVIDER_RETRY_DELAYS_MS.length) {
        const delayMs = PROVIDER_RETRY_DELAYS_MS[attempt]!;
        console.warn(
          `[provider-retry] ${input.logLabel} provider=${input.provider} attempt=${attempt + 1} network_error delay_ms=${delayMs}`
        );
        await delay(delayMs);
        continue;
      }
      throw new Error(`AI provider request failed before a response: ${error instanceof Error ? error.message : String(error)}`);
    }

    console.log(
      `[timing][provider-response] ${input.logLabel} provider=${input.provider} status=${response.status} headers_ms=${Date.now() - apiStartedAt}`
    );

    if (response.ok) return response;

    const bodyText = await response.text();
    if (PROVIDER_RETRYABLE_STATUSES.has(response.status) && attempt < PROVIDER_RETRY_DELAYS_MS.length) {
      const delayMs = PROVIDER_RETRY_DELAYS_MS[attempt]!;
      console.warn(
        `[provider-retry] ${input.logLabel} provider=${input.provider} status=${response.status} attempt=${attempt + 1} delay_ms=${delayMs}`
      );
      await delay(delayMs);
      continue;
    }

    throw new Error(formatProviderError(input.provider, response.status, bodyText));
  }

  throw new Error("AI provider request failed after retries");
}

function formatProviderError(provider: string, status: number, bodyText: string): string {
  const parsed = parseProviderErrorBody(bodyText);
  const providerMessage = parsed.message || bodyText.replace(/\s+/g, " ").trim();
  const shortMessage = providerMessage.length > 260 ? `${providerMessage.slice(0, 260)}...` : providerMessage;

  if (status === 503 || /high demand|unavailable|overload/i.test(providerMessage)) {
    return `AI model is temporarily unavailable (${provider} ${status}). The provider reported high demand. Please retry shortly or switch to another model. ${shortMessage ? `Provider message: ${shortMessage}` : ""}`.trim();
  }
  if (status === 429) {
    return `AI model rate limit reached (${provider} ${status}). Please wait briefly and retry, or switch to another model. ${shortMessage ? `Provider message: ${shortMessage}` : ""}`.trim();
  }
  return `AI request failed (${provider} ${status}). ${shortMessage ? `Provider message: ${shortMessage}` : "No provider error details were returned."}`;
}

function parseProviderErrorBody(bodyText: string): { message: string } {
  try {
    const parsed = JSON.parse(bodyText) as unknown;
    const first = Array.isArray(parsed) ? parsed[0] : parsed;
    if (first && typeof first === "object") {
      const record = first as Record<string, unknown>;
      const error = record.error && typeof record.error === "object" ? (record.error as Record<string, unknown>) : record;
      const message = typeof error.message === "string" ? error.message : "";
      const status = typeof error.status === "string" ? error.status : "";
      const code = typeof error.code === "string" || typeof error.code === "number" ? String(error.code) : "";
      return { message: [message, status ? `status=${status}` : "", code ? `code=${code}` : ""].filter(Boolean).join(" ") };
    }
  } catch {
    // Fall back to raw body text below.
  }
  return { message: "" };
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildAiSystemPrompt(conversationSummary?: string): string {
  return `${SLIDELEAF_ROOT_PROMPT}

You are currently generating or editing a production-quality HTML-first presentation workspace for SlideLeaf.
Return only the file-block format below. Do not include markdown fences, explanations, or JSON.

<slideleaf-workspace>
<summary>Short description of the full workspace update.</summary>
<file path="project.config.json">
Complete replacement file content.
</file>
<file path="slides/01-title.html">
One complete slide fragment.
</file>
<delete path="slides/old-unused-slide.html" />
</slideleaf-workspace>

Rules:
- Prefer modular multi-slide projects: project.config.json should use a slides array, one file per page under slides/, plus themes/deck.css and runtime/deck.js when needed.
- Each slide file should be a single <section class="slide">...</section> HTML fragment with data-slide-id, data-motion, and data-visual.
- Keep global CSS in themes/deck.css. Renderer-owned navigation, counters, progress, keyboard controls, and .slide.active state are already provided; do not recreate them in runtime/deck.js.
- runtime/deck.js may add small non-navigation motion helpers only. It must not call querySelectorAll(".slide"), toggle/add/remove the active class, create duplicate nav/progress UI, or register its own keyboard slide navigation.
- Use standalone slides/deck.html only when repairing a legacy one-file project.
- Use HTML, not Markdown, for presentation content.
- Follow the latest workflow artifacts as source of truth in this order: creative brief, visual directions, deck plan.
- Prefer a complete, coherent deck: title slide, structured content slides, and a strong closing slide.
- Return full file contents for every file you create or modify; never return patches.
- When an edit, rename, regeneration, or polish makes old source files obsolete, duplicated, or no longer referenced by project.config.json, return <delete path="..."/> entries for those files.
- Do not delete files merely because you did not modify them. Delete only files that are superseded, duplicate, stale, broken, or likely to confuse compilation/review.
- Never delete a slide, theme, or runtime file that remains referenced by project.config.json.
- For most new decks, return project.config.json, slides/*.html fragments, themes/deck.css, and runtime/deck.js.
- Do not create Markdown slide files.
- Do not load remote JavaScript or remote CSS. Do not write custom inline navigation JavaScript; the renderer provides navigation.
- Do not include the literal closing tag </file> inside file contents.
- Keep paths relative to the workspace, such as slides/intro.html and themes/default.css.

Visual quality rules:
- Do not make generic AI slides: avoid purple gradients on white, default centered card grids, random glassmorphism, decorative blobs without purpose, and timid one-note palettes.
- Commit to one visual system with distinct typography, color, composition, navigation, and motion language.
- Every slide needs one dominant message and one clear hierarchy.
- Use HTML/CSS deliberately: staggered reveals, progressive diagrams, timeline builds, card cascades, and clean transitions are encouraged when they support the message. Renderer-owned counters, slide progress, and keyboard navigation are already provided.
- Keep all scripts inline, small, and deterministic. Do not fetch remote code.

Viewport and density rules:
- Every slide must fit a 16:9 viewport without scrolling.
- Use .slide { width: 100vw; height: 100vh; height: 100dvh; overflow: hidden; }.
- Use .slide-content as the full-bleed slide canvas with width: 100%; height: 100%; box-sizing: border-box. Do not make .slide-content a max-width framed panel.
- If content needs a readable measure, create an inner .content-frame. Keep page backgrounds on the full slide canvas, not on the constrained content frame.
- Use clamp() for major font sizes and spacing.
- Honor the structured textDensity field from the user message as a global deck preference:
  - concise: very low text density, often one title plus 1-2 short phrases; roughly 10-25 Chinese characters or 5-12 English words of body copy where possible.
  - balanced: moderate text density, usually 2-4 short bullets or compact cards; roughly 30-70 Chinese characters or 20-45 English words of body copy.
  - dense: fuller analytical slides using most of the canvas; roughly 80-150 Chinese characters or 60-110 English words of body copy, but still no scrolling.
- These are targets, not rigid limits. Title slides, transitions, charts, and closing slides may be naturally lighter.
- Keep content density controlled: 4-6 bullets maximum, 3-6 cards maximum, and split overly dense content into more slides.
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

function parseAiWorkspaceResponse(raw: string): ParsedWorkspacePayload {
  const cleaned = stripJsonCodeFence(raw);
  const blockPayload = parseFileBlockPayload(cleaned);
  if (blockPayload) return blockPayload;

  const jsonPayload = tryParseJsonPayload(cleaned);
  if (jsonPayload) return jsonPayload;

  throw new Error("AI response did not follow the required workspace file format. Please retry the request.");
}

function parseFileBlockPayload(raw: string): ParsedWorkspacePayload | null {
  const fileRegex = /<file\b([^>]*)>([\s\S]*?)<\/file>/gi;
  const deleteSelfClosingRegex = /<delete\b([^>]*)\/>/gi;
  const deletePairedRegex = /<delete\b([^>]*)>[\s\S]*?<\/delete>/gi;
  const files: Array<{ path: string; content: string }> = [];
  const deletePaths: string[] = [];
  let match: RegExpExecArray | null;

  while ((match = fileRegex.exec(raw))) {
    const attributes = match[1] ?? "";
    const pathValue = parseTagAttribute(attributes, "path")?.trim();
    if (!pathValue) continue;
    const actionValue = parseTagAttribute(attributes, "action")?.trim().toLowerCase();
    if (actionValue === "delete" || actionValue === "remove") {
      deletePaths.push(pathValue);
      continue;
    }
    const contentValue = unwrapFileBlockContent(match[2] ?? "");
    files.push({ path: pathValue, content: contentValue });
  }

  while ((match = deleteSelfClosingRegex.exec(raw))) {
    const pathValue = parseTagAttribute(match[1] ?? "", "path")?.trim();
    if (pathValue) {
      deletePaths.push(pathValue);
    }
  }

  while ((match = deletePairedRegex.exec(raw))) {
    const pathValue = parseTagAttribute(match[1] ?? "", "path")?.trim();
    if (pathValue) {
      deletePaths.push(pathValue);
    }
  }

  if (!files.length && !deletePaths.length) return null;

  const summaryMatch = /<summary\b[^>]*>([\s\S]*?)<\/summary>/i.exec(raw);
  return {
    summary: summaryMatch ? unwrapFileBlockContent(summaryMatch[1] ?? "") : "Updated workspace files",
    files,
    deletePaths
  };
}

function parseTagAttribute(attributes: string, name: string): string | null {
  const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = new RegExp(`\\b${escapedName}=(["'])(.*?)\\1`, "i").exec(attributes);
  return match?.[2] ?? null;
}

function tryParseJsonPayload(raw: string): ParsedWorkspacePayload | null {
  try {
    return JSON.parse(raw) as ParsedWorkspacePayload;
  } catch {
    return null;
  }
}

function safeJsonSearchText(value: unknown): string {
  try {
    return JSON.stringify(value)?.slice(0, 6000) ?? "";
  } catch {
    return "";
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

function buildAiContextFiles(
  files: WorkspaceTextFile[],
  config: AiProviderConfig
): Array<{ path: string; mimeType: string | null; content: string }> {
  const requestedMaxChars = parsePositiveInt(process.env.AI_CONTEXT_MAX_CHARS, config.maxContextChars);
  const maxTotalChars = Math.min(requestedMaxChars, config.maxContextChars);
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

function parseGeneratedWorkspaceChanges(parsed: ParsedWorkspacePayload): GeneratedWorkspaceChanges {
  const files: Array<{ path: string; content: string }> = [];
  const deletePaths: string[] = [];

  if (Array.isArray(parsed.files)) {
    parsed.files.forEach((item, index) => {
      if (!item || typeof item !== "object") {
        throw new Error(`AI response file at index ${index} is invalid`);
      }
      const pathValue = (item as { path?: unknown }).path;
      if (typeof pathValue !== "string" || !pathValue.trim()) {
        throw new Error(`AI response file at index ${index} must include a string path`);
      }

      const actionValue = (item as { action?: unknown }).action;
      const isDelete =
        (typeof actionValue === "string" && ["delete", "remove", "unlink"].includes(actionValue.toLowerCase())) ||
        (item as { delete?: unknown }).delete === true;
      if (isDelete) {
        deletePaths.push(pathValue);
        return;
      }

      const contentValue = (item as { content?: unknown; newContent?: unknown }).content ?? (item as { newContent?: unknown }).newContent;
      if (typeof contentValue !== "string") {
        throw new Error(`AI response file at index ${index} must include string path and content`);
      }
      files.push({ path: pathValue, content: contentValue });
    });
  }

  for (const [fieldName, value] of [
    ["deletePaths", parsed.deletePaths],
    ["deletes", parsed.deletes]
  ] as const) {
    if (value === undefined) continue;
    if (!Array.isArray(value)) {
      throw new Error(`AI response ${fieldName} must be an array of paths`);
    }
    value.forEach((item, index) => {
      if (typeof item !== "string" || !item.trim()) {
        throw new Error(`AI response ${fieldName} item at index ${index} must be a string path`);
      }
      deletePaths.push(item);
    });
  }

  if (!files.length && !deletePaths.length) {
    throw new Error("AI response did not include any file updates or delete paths");
  }

  return { files, deletePaths };
}

function buildWorkspaceDiff(input: {
  summary: string;
  generatedFiles: Array<{ path: string; content: string }>;
  existingFiles: WorkspaceTextFile[];
  deletePaths?: string[];
}): AiDiffJson {
  const existingByPath = new Map(input.existingFiles.map((file) => [normalizeClientPath(file.path), file]));
  const files: AiFilePatch[] = input.generatedFiles.map((generated) => {
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
  const generatedPaths = new Set(files.map((file) => file.path));
  const deletePatches: AiFilePatch[] = (input.deletePaths ?? [])
    .map(normalizeClientPath)
    .filter((filePath, index, paths) => !generatedPaths.has(filePath) && paths.indexOf(filePath) === index)
    .flatMap((filePath) => {
      const existing = existingByPath.get(filePath);
      if (!existing) return [];
      const oldContent = existing.contentText ?? "";
      return [{
        fileId: existing.id,
        path: filePath,
        action: "delete",
        oldContent,
        newContent: "",
        lines: buildLineDiff(oldContent, "")
      } satisfies AiFilePatch];
    });

  return {
    summary: input.summary,
    files: [...files, ...deletePatches]
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

function staleDeckSourcePaths(
  existingFiles: WorkspaceTextFile[],
  generatedFiles: Array<{ path: string; content: string }>
): string[] {
  const generatedPaths = new Set(generatedFiles.map((file) => normalizeClientPath(file.path)));
  return existingFiles
    .map((file) => normalizeClientPath(file.path))
    .filter((filePath) => isDeckSlideSourcePath(filePath) && !generatedPaths.has(filePath));
}

function isDeckSlideSourcePath(filePath: string): boolean {
  const lower = filePath.toLowerCase();
  return lower.startsWith("slides/") && (lower.endsWith(".html") || lower.endsWith(".htm") || lower.endsWith(".md"));
}

function validateGeneratedDeckPatch(diff: AiDiffJson, expectedSlidePaths: string[]): void {
  const patchByPath = new Map(diff.files.filter((file) => file.action !== "delete").map((file) => [file.path, file]));
  const configPatch = patchByPath.get("project.config.json");
  if (!configPatch) {
    throw new Error("Generated deck patch is missing project.config.json.");
  }

  let config: { slides?: unknown; entry?: unknown };
  try {
    config = JSON.parse(configPatch.newContent) as { slides?: unknown; entry?: unknown };
  } catch {
    throw new Error("Generated project.config.json is invalid JSON.");
  }

  const configuredSlides = Array.isArray(config.slides)
    ? config.slides.map((item) => (typeof item === "string" ? normalizeClientPath(item) : ""))
    : typeof config.entry === "string"
      ? [normalizeClientPath(config.entry)]
      : [];
  const expected = expectedSlidePaths.map(normalizeClientPath);
  if (configuredSlides.length !== expected.length) {
    throw new Error(
      `Generated project.config.json references ${configuredSlides.length} slides, but DeckPlan expected ${expected.length}.`
    );
  }
  for (const slidePath of expected) {
    if (!configuredSlides.includes(slidePath)) {
      throw new Error(`Generated project.config.json does not reference expected slide: ${slidePath}`);
    }
    const slidePatch = patchByPath.get(slidePath);
    if (!slidePatch) {
      throw new Error(`Generated deck patch is missing slide file: ${slidePath}`);
    }
    if (!hasSingleSlideRootFragment(slidePatch.newContent)) {
      throw new Error(`Generated slide file must be exactly one complete <section class="slide"> fragment: ${slidePath}`);
    }
  }
}

function validateDeckWorkspaceAfterPatch(diff: AiDiffJson, existingFiles: WorkspaceTextFile[]): void {
  const finalFiles = new Map(existingFiles.map((file) => [normalizeClientPath(file.path), file.contentText]));
  for (const filePatch of diff.files) {
    const filePath = normalizeClientPath(filePatch.path);
    if (filePatch.action === "delete") {
      finalFiles.delete(filePath);
    } else {
      finalFiles.set(filePath, filePatch.newContent);
    }
  }

  const configContent = finalFiles.get("project.config.json");
  if (!configContent) return;

  let config: { slides?: unknown; entry?: unknown; theme?: unknown; runtime?: unknown; generationMode?: unknown };
  try {
    config = JSON.parse(configContent) as {
      slides?: unknown;
      entry?: unknown;
      theme?: unknown;
      runtime?: unknown;
      generationMode?: unknown;
    };
  } catch {
    throw new Error("Generated project.config.json is invalid JSON.");
  }

  const slidePaths = configuredSlidePaths(config);
  const isMultiSlide =
    Array.isArray(config.slides) || readableConfigField(config.generationMode) === "multi-slide" || slidePaths.length > 1;
  if (!isMultiSlide) return;
  if (!slidePaths.length) {
    throw new Error("Multi-slide project.config.json must include a non-empty slides array.");
  }

  const seen = new Set<string>();
  for (const slidePath of slidePaths) {
    if (seen.has(slidePath)) {
      throw new Error(`project.config.json references the same slide more than once: ${slidePath}`);
    }
    seen.add(slidePath);

    if (!slidePath.startsWith("slides/") || !slidePath.toLowerCase().endsWith(".html")) {
      throw new Error(`Multi-slide project.config.json must reference HTML files under slides/: ${slidePath}`);
    }
    const slideContent = finalFiles.get(slidePath);
    if (slideContent === undefined) {
      throw new Error(`project.config.json references missing slide file: ${slidePath}`);
    }
    if (isFullHtmlDocument(slideContent)) {
      throw new Error(`Multi-slide projects must use slide fragments, not full HTML documents: ${slidePath}`);
    }
    if (!hasSingleSlideRootFragment(slideContent)) {
      throw new Error(`Slide file must be exactly one complete <section class="slide"> fragment: ${slidePath}`);
    }
  }

  const themePath = readableConfigField(config.theme);
  if (themePath && !finalFiles.has(normalizeClientPath(themePath))) {
    throw new Error(`project.config.json references missing theme file: ${themePath}`);
  }
  const runtimePath = readableConfigField(config.runtime);
  if (runtimePath && !finalFiles.has(normalizeClientPath(runtimePath))) {
    throw new Error(`project.config.json references missing runtime file: ${runtimePath}`);
  }
}

function configuredSlidePaths(config: { slides?: unknown; entry?: unknown }): string[] {
  if (Array.isArray(config.slides)) {
    return config.slides.map((item) => (typeof item === "string" ? normalizeClientPath(item) : ""));
  }
  if (typeof config.entry === "string") return [normalizeClientPath(config.entry)];
  return [];
}

function readableConfigField(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function hasSingleSlideRootFragment(content: string): boolean {
  const cleaned = content.trim();
  const rootMatches = [
    ...cleaned.matchAll(/<(section|article)\b[^>]*\bclass=(["'])[^"']*\bslide\b[^"']*\2[^>]*>/gi)
  ];
  return (
    rootMatches.length === 1 &&
    /^\s*<(section|article)\b[^>]*\bclass=(["'])[^"']*\bslide\b[^"']*\2[^>]*>[\s\S]*<\/\1>\s*$/i.test(cleaned)
  );
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
  isCustom: boolean;
  maxInputTokens: number;
  maxContextChars: number;
  maxTokens: number;
  anthropicVersion?: string;
  anthropicEffort?: AnthropicEffort;
  anthropicThinking?: "adaptive";
};

type AnthropicModelFamily = "sonnet" | "opus";
type AnthropicEffort = "low" | "medium" | "high" | "xhigh" | "max";

const MODEL_LIMITS = {
  deepseekV4Pro: { inputTokens: 1_000_000, outputTokens: 384_000 },
  gemini3FlashPreview: { inputTokens: 1_048_576, outputTokens: 65_536 },
  claudeSonnet46: { inputTokens: 1_000_000, outputTokens: 64_000 },
  claudeOpus47: { inputTokens: 1_000_000, outputTokens: 128_000 },
  openaiFallback: { inputTokens: 128_000, outputTokens: 16_384 }
} as const;

const CREDITS_PER_USD = 1000;
const OFFICIAL_MODEL_MARKUP = 1.5;

type OfficialModelPricing = {
  inputUsdPerMillion: number;
  outputUsdPerMillion: number;
};

const APPROX_CHARS_PER_TOKEN = 4;

function officialModelPricing(config: AiProviderConfig): OfficialModelPricing | undefined {
  const model = config.model.toLowerCase();
  if (config.provider === "deepseek" && model.includes("deepseek-v4-pro")) {
    return {
      // DeepSeek v4-pro current cache-miss promotional rate, observed 2026-05-10.
      inputUsdPerMillion: 0.435,
      outputUsdPerMillion: 0.87
    };
  }
  if (config.provider === "gemini" && model.includes("gemini-3-flash-preview")) {
    return {
      // Gemini 3 Flash Preview paid tier text/image/video pricing, observed 2026-05-11.
      inputUsdPerMillion: 0.5,
      outputUsdPerMillion: 3
    };
  }
  if (config.provider === "anthropic" && model.includes("opus")) {
    return {
      inputUsdPerMillion: 5,
      outputUsdPerMillion: 25
    };
  }
  if (config.provider === "anthropic" && model.includes("sonnet")) {
    return {
      inputUsdPerMillion: 3,
      outputUsdPerMillion: 15
    };
  }
  return undefined;
}

function calculateCreditsMilli(usage: TokenUsage, pricing: OfficialModelPricing): number {
  const inputUsd = (usage.inputTokens * pricing.inputUsdPerMillion) / 1_000_000;
  const outputUsd = (usage.outputTokens * pricing.outputUsdPerMillion) / 1_000_000;
  return Math.ceil((inputUsd + outputUsd) * CREDITS_PER_USD * OFFICIAL_MODEL_MARKUP);
}

function combineTokenUsage(...usages: Array<TokenUsage | undefined>): TokenUsage | undefined {
  const present = usages.filter((usage): usage is TokenUsage => Boolean(usage));
  if (!present.length) return undefined;
  const inputTokens = present.reduce((sum, usage) => sum + usage.inputTokens, 0);
  const outputTokens = present.reduce((sum, usage) => sum + usage.outputTokens, 0);
  const totalTokens = present.reduce((sum, usage) => sum + usage.totalTokens, 0) || inputTokens + outputTokens;
  return { inputTokens, outputTokens, totalTokens };
}

function formatCredits(creditsMilli: number): string {
  return creditsMilli.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
}

function summarizeCreditCharges(charges: CreditCharge[]): CreditCharge | undefined {
  if (!charges.length) return undefined;
  const last = charges[charges.length - 1];
  const inputTokens = charges.reduce((sum, charge) => sum + charge.inputTokens, 0);
  const outputTokens = charges.reduce((sum, charge) => sum + charge.outputTokens, 0);
  const creditsMilli = charges.reduce((sum, charge) => sum + charge.creditsMilli, 0);
  return {
    label: "deck-generation",
    provider: last.provider,
    model: last.model,
    inputTokens,
    outputTokens,
    creditsMilli,
    credits: creditsMilli,
    remainingCreditsMilli: last.remainingCreditsMilli,
    remainingCredits: last.remainingCredits
  };
}

function deckGenerationBillingSummary(config: AiProviderConfig, charges: CreditCharge[]): Prisma.InputJsonValue {
  const summary = summarizeCreditCharges(charges);
  if (summary) {
    return {
      charged: true,
      source: config.isCustom ? "custom" : "official",
      provider: config.provider,
      model: config.model,
      inputTokens: summary.inputTokens,
      outputTokens: summary.outputTokens,
      totalTokens: summary.inputTokens + summary.outputTokens,
      creditsMilli: summary.creditsMilli,
      remainingCreditsMilli: summary.remainingCreditsMilli,
      slideCharges: charges.map((charge) => ({
        label: charge.label,
        inputTokens: charge.inputTokens,
        outputTokens: charge.outputTokens,
        creditsMilli: charge.creditsMilli
      }))
    };
  }
  return {
    charged: false,
    source: config.isCustom ? "custom" : "official",
    provider: config.provider,
    model: config.model,
    reason: config.isCustom ? "custom_provider" : "usage_unavailable"
  };
}

function resolveAiConfig(providerOverride?: string, customProvider?: unknown): AiProviderConfig {
  const customConfig = resolveCustomAiConfig(providerOverride, customProvider);
  if (customConfig) return customConfig;

  const normalizedOverride = providerOverride?.trim().toLowerCase();
  const overrideConfig = parseAiProvider(normalizedOverride);
  if (normalizedOverride && normalizedOverride !== "default" && !overrideConfig) {
    throw new BadRequestException("AI provider must be deepseek, gemini, openai, anthropic, claude-sonnet, or claude-opus");
  }

  const envConfig = parseAiProvider(process.env.AI_PROVIDER?.trim().toLowerCase());
  const resolvedProvider = overrideConfig ?? envConfig ?? { provider: "deepseek" as const };
  const provider = resolvedProvider.provider;

  if (provider === "deepseek") {
    const limits = MODEL_LIMITS.deepseekV4Pro;
    return {
      provider,
      apiKey: process.env.DEEPSEEK_API_KEY || process.env.OPENAI_API_KEY || "",
      baseUrl: normalizeBaseUrl(process.env.DEEPSEEK_BASE_URL || process.env.AI_BASE_URL || "https://api.deepseek.com"),
      model: process.env.DEEPSEEK_MODEL || process.env.AI_MODEL || "deepseek-v4-pro",
      isCustom: false,
      maxInputTokens: limits.inputTokens,
      maxContextChars: tokensToApproxChars(limits.inputTokens),
      maxTokens: limits.outputTokens
    };
  }

  if (provider === "gemini") {
    const limits = MODEL_LIMITS.gemini3FlashPreview;
    return {
      provider,
      apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "",
      baseUrl: normalizeBaseUrl(
        process.env.GEMINI_BASE_URL || process.env.AI_BASE_URL || "https://generativelanguage.googleapis.com/v1beta/openai"
      ),
      model: process.env.GEMINI_MODEL || process.env.AI_MODEL || "gemini-3-flash-preview",
      isCustom: false,
      maxInputTokens: limits.inputTokens,
      maxContextChars: tokensToApproxChars(limits.inputTokens),
      maxTokens: limits.outputTokens
    };
  }

  if (provider === "anthropic") {
    const model = resolveAnthropicModel(resolvedProvider.anthropicModelFamily);
    const limits = resolveAnthropicLimits(model);
    return {
      provider,
      apiKey: process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY || "",
      baseUrl: normalizeBaseUrl(process.env.ANTHROPIC_BASE_URL || process.env.CLAUDE_BASE_URL || process.env.AI_BASE_URL || "https://api.anthropic.com/v1"),
      model,
      isCustom: false,
      maxInputTokens: limits.inputTokens,
      maxContextChars: tokensToApproxChars(limits.inputTokens),
      maxTokens: limits.outputTokens,
      anthropicVersion: process.env.ANTHROPIC_VERSION || "2023-06-01",
      anthropicEffort: resolveAnthropicEffort(resolvedProvider.anthropicModelFamily, model),
      anthropicThinking: parseAnthropicThinking(process.env.ANTHROPIC_THINKING)
    };
  }

  const limits = MODEL_LIMITS.openaiFallback;
  return {
    provider,
    apiKey: process.env.OPENAI_API_KEY || "",
    baseUrl: normalizeBaseUrl(process.env.OPENAI_BASE_URL || process.env.AI_BASE_URL || "https://api.openai.com/v1"),
    model: process.env.OPENAI_MODEL || process.env.AI_MODEL || "gpt-4.1-mini",
    isCustom: false,
    maxInputTokens: limits.inputTokens,
    maxContextChars: tokensToApproxChars(limits.inputTokens),
    maxTokens: limits.outputTokens
  };
}

function parseAiProvider(
  input: string | undefined
): { provider: AiProviderConfig["provider"]; anthropicModelFamily?: AnthropicModelFamily } | undefined {
  if (!input || input === "default") return undefined;
  if (input === "deepseek") return { provider: "deepseek" };
  if (input === "gemini") return { provider: "gemini" };
  if (input === "openai") return { provider: "openai" };
  if (input === "anthropic" || input === "claude") return { provider: "anthropic" };
  if (input === "claude-sonnet" || input === "anthropic-sonnet" || input === "sonnet") {
    return { provider: "anthropic", anthropicModelFamily: "sonnet" };
  }
  if (input === "claude-opus" || input === "anthropic-opus" || input === "opus") {
    return { provider: "anthropic", anthropicModelFamily: "opus" };
  }
  return undefined;
}

function parseAnthropicModelFamily(input: string | undefined): AnthropicModelFamily | undefined {
  const normalized = input?.trim().toLowerCase();
  if (normalized === "sonnet" || normalized === "opus") return normalized;
  return undefined;
}

function customString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function resolveAnthropicModel(modelFamily?: AnthropicModelFamily): string {
  if (modelFamily === "sonnet") {
    return process.env.ANTHROPIC_SONNET_MODEL || process.env.CLAUDE_SONNET_MODEL || "claude-sonnet-4-6";
  }
  if (modelFamily === "opus") {
    return process.env.ANTHROPIC_OPUS_MODEL || process.env.CLAUDE_OPUS_MODEL || "claude-opus-4-7";
  }
  return process.env.ANTHROPIC_MODEL || process.env.CLAUDE_MODEL || process.env.AI_MODEL || "claude-sonnet-4-6";
}

function resolveAnthropicLimits(model: string): { inputTokens: number; outputTokens: number } {
  if (model === "claude-opus-4-7") return MODEL_LIMITS.claudeOpus47;
  if (model === "claude-sonnet-4-6") return MODEL_LIMITS.claudeSonnet46;
  return MODEL_LIMITS.claudeSonnet46;
}

function resolveAnthropicEffort(modelFamily: AnthropicModelFamily | undefined, model: string): AnthropicEffort | undefined {
  const familySpecific =
    modelFamily === "opus"
      ? parseAnthropicEffort(process.env.ANTHROPIC_OPUS_EFFORT)
      : modelFamily === "sonnet"
        ? parseAnthropicEffort(process.env.ANTHROPIC_SONNET_EFFORT)
        : undefined;
  const configured = familySpecific ?? parseAnthropicEffort(process.env.ANTHROPIC_EFFORT);
  if (configured) return configured;
  if (model === "claude-sonnet-4-6") return "medium";
  if (model === "claude-opus-4-7") return "high";
  return undefined;
}

function parseAnthropicEffort(input: string | undefined): AnthropicEffort | undefined {
  const normalized = input?.trim().toLowerCase();
  if (normalized === "low" || normalized === "medium" || normalized === "high" || normalized === "xhigh" || normalized === "max") {
    return normalized;
  }
  return undefined;
}

function parseAnthropicThinking(input: string | undefined): "adaptive" | undefined {
  return input?.trim().toLowerCase() === "adaptive" ? "adaptive" : undefined;
}

function normalizeBaseUrl(input: string): string {
  return input.replace(/\/+$/, "");
}

function tokensToApproxChars(tokens: number): number {
  return tokens * APPROX_CHARS_PER_TOKEN;
}

function parsePositiveInt(input: string | undefined, fallback: number): number {
  const parsed = Number.parseInt(input ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function normalizeSlideTextDensity(input: string | undefined): SlideTextDensity {
  const normalized = input?.trim().toLowerCase();
  if (normalized === "concise") return "concise";
  if (normalized === "dense" || normalized === "complex") return "dense";
  return "balanced";
}

function normalizeClientRequestId(input: unknown): string | undefined {
  if (typeof input !== "string") return undefined;
  const trimmed = input.trim();
  if (!trimmed) return undefined;
  return trimmed.slice(0, 128);
}

function buildSlideTextDensityContext(density: SlideTextDensity) {
  if (density === "concise") {
    return {
      value: "concise",
      label: "Concise",
      intent: "Low text density. Favor visual storytelling, strong action titles, and very short body copy.",
      target: "Usually one title plus 1-2 short phrases per slide; roughly 10-25 Chinese characters or 5-12 English words of body copy where possible."
    };
  }

  if (density === "dense") {
    return {
      value: "dense",
      label: "Detailed",
      intent: "High information density. Use more of the canvas for analytical content, tables, timelines, diagrams, and fuller explanations.",
      target: "Roughly 80-150 Chinese characters or 60-110 English words of body copy per content slide, while still fitting the 16:9 viewport without scrolling."
    };
  }

  return {
    value: "balanced",
    label: "Balanced",
    intent: "Balanced text density. Keep slides presentation-friendly while giving enough explanation to stand alone.",
    target: "Usually 2-4 short bullets or compact cards; roughly 30-70 Chinese characters or 20-45 English words of body copy per content slide."
  };
}

function resolveCustomAiConfig(providerOverride: string | undefined, customProvider: unknown): AiProviderConfig | null {
  if (!customProvider || typeof customProvider !== "object" || Array.isArray(customProvider)) return null;
  const record = customProvider as CustomAiProviderInput;
  const apiKey = customString(record.apiKey);
  if (!apiKey) {
    throw new BadRequestException("Own AI provider config must include an API key");
  }

  const providerInput = customString(record.provider) || providerOverride;
  const parsed = parseAiProvider(providerInput?.trim().toLowerCase());
  if (!parsed) {
    throw new BadRequestException("Own AI provider must be deepseek, gemini, or anthropic/claude");
  }

  const provider = parsed.provider;
  const modelFamily = parseAnthropicModelFamily(customString(record.anthropicModelFamily)) ?? parsed.anthropicModelFamily;
  const customModel = customString(record.model);
  const customBaseUrl = customString(record.baseUrl);

  if (provider === "deepseek") {
    const limits = MODEL_LIMITS.deepseekV4Pro;
    return {
      provider,
      apiKey,
      baseUrl: normalizeBaseUrl(customBaseUrl || "https://api.deepseek.com"),
      model: customModel || "deepseek-v4-pro",
      isCustom: true,
      maxInputTokens: limits.inputTokens,
      maxContextChars: tokensToApproxChars(limits.inputTokens),
      maxTokens: limits.outputTokens
    };
  }

  if (provider === "gemini") {
    const limits = MODEL_LIMITS.gemini3FlashPreview;
    return {
      provider,
      apiKey,
      baseUrl: normalizeBaseUrl(customBaseUrl || "https://generativelanguage.googleapis.com/v1beta/openai"),
      model: customModel || "gemini-3-flash-preview",
      isCustom: true,
      maxInputTokens: limits.inputTokens,
      maxContextChars: tokensToApproxChars(limits.inputTokens),
      maxTokens: limits.outputTokens
    };
  }

  if (provider === "anthropic") {
    const model = customModel || resolveAnthropicModel(modelFamily);
    const limits = resolveAnthropicLimits(model);
    return {
      provider,
      apiKey,
      baseUrl: normalizeBaseUrl(customBaseUrl || "https://api.anthropic.com/v1"),
      model,
      isCustom: true,
      maxInputTokens: limits.inputTokens,
      maxContextChars: tokensToApproxChars(limits.inputTokens),
      maxTokens: limits.outputTokens,
      anthropicVersion: process.env.ANTHROPIC_VERSION || "2023-06-01",
      anthropicEffort: resolveAnthropicEffort(modelFamily, model),
      anthropicThinking: parseAnthropicThinking(process.env.ANTHROPIC_THINKING)
    };
  }

  const limits = MODEL_LIMITS.openaiFallback;
  return {
    provider,
    apiKey,
    baseUrl: normalizeBaseUrl(customBaseUrl || "https://api.openai.com/v1"),
    model: customModel || "gpt-4.1-mini",
    isCustom: true,
    maxInputTokens: limits.inputTokens,
    maxContextChars: tokensToApproxChars(limits.inputTokens),
    maxTokens: limits.outputTokens
  };
}

function nearbySlides(slides: DeckSlidePlan[], current: DeckSlidePlan): DeckSlidePlan[] {
  return slides
    .filter((slide) => slide.id !== current.id && Math.abs(slide.index - current.index) <= 2)
    .sort((a, b) => a.index - b.index);
}

function hashJson(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex").slice(0, 24);
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
