"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bot,
  Check,
  ChevronDown,
  FileText,
  FilePlus2,
  Folder,
  FolderPlus,
  History,
  Logs,
  Play,
  Save,
  Send,
  Share2,
  Sparkles,
  Trash2,
  Upload,
  Users,
  X
} from "lucide-react";
import { BrandMark } from "./BrandMark";
import { API_URL, apiFetch } from "../lib/api";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

type Project = {
  id: string;
  title: string;
  description?: string | null;
  currentUserRole?: ProjectRole;
};

type ProjectRole = "owner" | "editor" | "viewer";
type AiProvider = "deepseek" | "gemini";

type ProjectMember = {
  id: string;
  userId: string;
  role: ProjectRole;
  createdAt: string;
  user: {
    id: string;
    email: string;
    name?: string | null;
  };
};

type ProjectFile = {
  id: string;
  projectId: string;
  parentId?: string | null;
  name: string;
  path: string;
  kind: "file" | "folder";
  mimeType?: string | null;
  isBinary: boolean;
  contentText?: string | null;
  storageKey?: string | null;
  updatedAt: string;
};

type CompileJob = {
  id: string;
  status: "queued" | "running" | "success" | "failed";
  log?: string | null;
  shareSlug?: string | null;
  shareUrl?: string | null;
};

type DiffLineValue = { type: "same" | "add" | "remove"; text: string };

type AiTask = {
  id: string;
  conversationId?: string | null;
  status: string;
  log?: string | null;
  diffJson?: {
    summary?: string;
    files?: Array<{
      path: string;
      action?: "create" | "update";
      lines: DiffLineValue[];
    }>;
    lines?: DiffLineValue[];
  } | null;
};

type AiConversation = {
  id: string;
  title?: string | null;
  stage?: WorkflowStage;
  summary?: string | null;
};

type WorkflowStage = "consultation" | "visual_direction" | "slide_plan" | "generate";
type AiMode = "auto" | WorkflowStage;
type ArtifactType = "brief" | "visual_direction" | "slide_plan";

type AiArtifact = {
  id: string;
  type: ArtifactType | string;
  status: "draft" | "approved" | "rejected" | "superseded" | string;
  contentJson: unknown;
  updatedAt: string;
};

type AiMessage = {
  id: string;
  role: "user" | "assistant" | string;
  content: string;
  metadata?: Record<string, unknown> | null;
  aiTaskId?: string | null;
  createdAt: string;
};

type CenterTab = "assistant" | "file";
type DragTarget = "left" | "center" | null;
type JsonRecord = Record<string, unknown>;
type WorkflowRun = {
  type: ArtifactType;
  label: string;
};

export function WorkspaceClient({ projectId }: { projectId: string }) {
  const [project, setProject] = useState<Project | null>(null);
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [selectedFileId, setSelectedFileId] = useState("");
  const [content, setContent] = useState("");
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [newPath, setNewPath] = useState("slides/deck.html");
  const [newKind, setNewKind] = useState<"file" | "folder">("file");
  const [compileJob, setCompileJob] = useState<CompileJob | null>(null);
  const [aiConversation, setAiConversation] = useState<AiConversation | null>(null);
  const [aiMessages, setAiMessages] = useState<AiMessage[]>([]);
  const [aiArtifacts, setAiArtifacts] = useState<AiArtifact[]>([]);
  const [aiInstruction, setAiInstruction] = useState("");
  const [aiMode, setAiMode] = useState<AiMode>("auto");
  const [aiProvider, setAiProvider] = useState<AiProvider>("deepseek");
  const [lastAiPrompt, setLastAiPrompt] = useState("");
  const [workflowRun, setWorkflowRun] = useState<WorkflowRun | null>(null);
  const [aiTask, setAiTask] = useState<AiTask | null>(null);
  const [htmlGenerationRequested, setHtmlGenerationRequested] = useState(false);
  const [previewNonce, setPreviewNonce] = useState(0);
  const [activeTab, setActiveTab] = useState<CenterTab>("assistant");
  const [logOpen, setLogOpen] = useState(false);
  const [membersOpen, setMembersOpen] = useState(false);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<ProjectRole>("editor");
  const [leftWidth, setLeftWidth] = useState(260);
  const [centerWidth, setCenterWidth] = useState(560);
  const [dragTarget, setDragTarget] = useState<DragTarget>(null);
  const uploadRef = useRef<HTMLInputElement>(null);
  const autoCompileStartedRef = useRef(false);

  const selectedFile = useMemo(
    () => files.find((file) => file.id === selectedFileId) ?? null,
    [files, selectedFileId]
  );
  const sortedFiles = useMemo(() => sortWorkspaceFiles(files), [files]);
  const previewSrc = compileJob?.shareSlug ? `${API_URL}/share/${compileJob.shareSlug}?v=${previewNonce}` : "";
  const compileLog = compileJob?.log || "No compile job yet.";
  const currentRole = project?.currentUserRole ?? "viewer";
  const canEdit = currentRole === "owner" || currentRole === "editor";
  const isOwner = currentRole === "owner";

  useEffect(() => {
    void loadProject();
  }, [projectId]);

  useEffect(() => {
    if (selectedFile && selectedFile.kind === "file" && !selectedFile.isBinary) {
      setContent(selectedFile.contentText ?? "");
      setDirty(false);
    }
  }, [selectedFile?.id]);

  useEffect(() => {
    if (!dragTarget) return;

    const onMove = (event: MouseEvent) => {
      if (dragTarget === "left") {
        setLeftWidth(clamp(event.clientX, 210, 420));
      } else {
        setCenterWidth(clamp(event.clientX - leftWidth, 420, 900));
      }
    };
    const onUp = () => setDragTarget(null);

    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);

    return () => {
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [dragTarget, leftWidth]);

  async function loadProject() {
    setError("");
    try {
      const [projectData, filesData, aiData] = await Promise.all([
        apiFetch<{ project: Project }>(`/projects/${projectId}`),
        apiFetch<{ files: ProjectFile[] }>(`/projects/${projectId}/files`),
        apiFetch<{ conversation: AiConversation; messages: AiMessage[]; artifacts: AiArtifact[] }>(
          `/projects/${projectId}/ai/workflow`
        )
      ]);
      setProject(projectData.project);
      setFiles(filesData.files);
      setAiConversation(aiData.conversation);
      setAiMessages(aiData.messages);
      setAiArtifacts(aiData.artifacts);
      setActiveTab("assistant");

      if (!autoCompileStartedRef.current) {
        autoCompileStartedRef.current = true;
        window.setTimeout(() => {
          void compile({ auto: true });
        }, 200);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      setAiTask({ id: "pending", status: "failed", log: message });
    }
  }

  async function reloadFiles(selectFileId = selectedFileId) {
    const data = await apiFetch<{ files: ProjectFile[] }>(`/projects/${projectId}/files`);
    setFiles(data.files);
    setSelectedFileId(selectFileId);
  }

  async function loadAiWorkflow() {
    const data = await apiFetch<{ conversation: AiConversation; messages: AiMessage[]; artifacts: AiArtifact[] }>(
      `/projects/${projectId}/ai/workflow`
    );
    setAiConversation(data.conversation);
    setAiMessages(data.messages);
    setAiArtifacts(data.artifacts);
  }

  async function loadMembers() {
    const data = await apiFetch<{ members: ProjectMember[] }>(`/projects/${projectId}/members`);
    setMembers(data.members);
  }

  async function openMembersPanel() {
    setMembersOpen((value) => !value);
    if (!membersOpen) {
      await loadMembers().catch((err) => setError(err instanceof Error ? err.message : String(err)));
    }
  }

  async function inviteMember(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isOwner || !inviteEmail.trim()) return;
    setError("");
    try {
      await apiFetch<{ member: ProjectMember }>(`/projects/${projectId}/members`, {
        method: "POST",
        body: JSON.stringify({ email: inviteEmail, role: inviteRole })
      });
      setInviteEmail("");
      await loadMembers();
      setNotice("Member invited");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  async function changeMemberRole(memberId: string, role: ProjectRole) {
    if (!isOwner) return;
    setError("");
    try {
      await apiFetch<{ member: ProjectMember }>(`/projects/${projectId}/members/${memberId}`, {
        method: "PATCH",
        body: JSON.stringify({ role })
      });
      await loadMembers();
      setNotice("Member role updated");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  async function removeMember(member: ProjectMember) {
    if (!isOwner) return;
    if (!window.confirm(`Remove ${member.user.email} from this project?`)) return;
    setError("");
    try {
      await apiFetch(`/projects/${projectId}/members/${member.id}`, { method: "DELETE" });
      await loadMembers();
      setNotice("Member removed");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  function openEntry(file: ProjectFile) {
    setSelectedFileId(file.id);
    setActiveTab("file");
  }

  function closeFileTab() {
    if (dirty && !window.confirm("Close this file without saving?")) return;
    setDirty(false);
    setSelectedFileId("");
    setActiveTab("assistant");
  }

  async function saveFile() {
    if (!canEdit) return;
    if (!selectedFile || selectedFile.kind !== "file" || selectedFile.isBinary) return;
    setError("");
    const data = await apiFetch<{ file: ProjectFile }>(`/projects/${projectId}/files/${selectedFile.id}`, {
      method: "PATCH",
      body: JSON.stringify({ contentText: content })
    }).catch((err) => {
      setError(err instanceof Error ? err.message : String(err));
      return null;
    });
    if (!data) return;
    setFiles((current) => current.map((file) => (file.id === data.file.id ? data.file : file)));
    setDirty(false);
    setNotice("Saved");
  }

  async function createWorkspaceEntry(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canEdit) return;
    setError("");
    try {
      const data = await apiFetch<{ file: ProjectFile }>(`/projects/${projectId}/files`, {
        method: "POST",
        body: JSON.stringify({
          path: newPath,
          kind: newKind,
          contentText: newKind === "file" ? defaultContentFor(newPath) : undefined
        })
      });
      await reloadFiles(data.file.id);
      setActiveTab("file");
      setNewPath(newKind === "file" ? "slides/new-slide.html" : "slides/new-folder");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  async function renameSelected() {
    if (!canEdit) return;
    if (!selectedFile) return;
    const nextPath = window.prompt("New workspace path", selectedFile.path);
    if (!nextPath || nextPath === selectedFile.path) return;
    setError("");
    try {
      const data = await apiFetch<{ file: ProjectFile }>(`/projects/${projectId}/files/${selectedFile.id}`, {
        method: "PATCH",
        body: JSON.stringify({ path: nextPath })
      });
      await reloadFiles(data.file.id);
      setNotice("Renamed");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  async function deleteSelected() {
    if (!canEdit) return;
    if (!selectedFile) return;
    if (!window.confirm(`Delete ${selectedFile.path}?`)) return;
    setError("");
    try {
      await apiFetch(`/projects/${projectId}/files/${selectedFile.id}`, { method: "DELETE" });
      setSelectedFileId("");
      setActiveTab("assistant");
      await reloadFiles("");
      setNotice("Deleted");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  async function uploadAsset(fileList: FileList | null) {
    if (!canEdit) return;
    const file = fileList?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    setError("");
    try {
      const data = await apiFetch<{ file: ProjectFile }>(`/projects/${projectId}/assets`, {
        method: "POST",
        body: formData
      });
      await reloadFiles(data.file.id);
      setNotice("Asset uploaded");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      if (uploadRef.current) uploadRef.current.value = "";
    }
  }

  async function compile(options: { auto?: boolean } = {}) {
    if (dirty) await saveFile();
    setError("");
    setNotice(options.auto ? "Compiling current project..." : "");
    setCompileJob({ id: "pending", status: "queued", log: options.auto ? "Auto compile queued" : "Queued compile job" });
    try {
      const created = await apiFetch<{ jobId: string; status: CompileJob["status"] }>(`/projects/${projectId}/compile`, {
        method: "POST",
        body: JSON.stringify({ targetFormat: "html" })
      });

      for (let i = 0; i < 90; i += 1) {
        await delay(1200);
        const data = await apiFetch<{ job: CompileJob }>(
          `/projects/${projectId}/compile-jobs/${created.jobId}`
        );
        setCompileJob(data.job);
        if (data.job.status === "success" || data.job.status === "failed") {
          if (data.job.status === "success") {
            setPreviewNonce(Date.now());
            setNotice(options.auto ? "Compiled current project" : "Compiled");
          }
          break;
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  async function createSnapshot() {
    setError("");
    try {
      await apiFetch(`/projects/${projectId}/versions`, {
        method: "POST",
        body: JSON.stringify({ message: `Manual snapshot ${new Date().toLocaleString()}` })
      });
      setNotice("Snapshot saved");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  async function requestAiEdit() {
    if (!canEdit) return;
    if (!aiInstruction.trim()) return;
    await submitAiByMode(aiInstruction.trim());
  }

  async function submitAiByMode(prompt: string) {
    const mode = aiMode === "auto" ? aiConversation?.stage ?? "consultation" : aiMode;
    if (mode === "consultation") {
      await generateWorkflowArtifact("brief", prompt);
      return;
    }
    if (mode === "visual_direction") {
      await generateWorkflowArtifact("visual_direction", prompt);
      return;
    }
    if (mode === "slide_plan") {
      await generateWorkflowArtifact("slide_plan", prompt);
      return;
    }
    await submitAiPrompt(prompt);
  }

  async function submitAiPrompt(prompt: string, displayLabel?: string) {
    if (!canEdit) return;
    setError("");
    setLastAiPrompt(displayLabel || prompt);
    setAiInstruction("");
    setAiTask({ id: "pending", status: "running" });
    setActiveTab("assistant");
    try {
      if (dirty) await saveFile();
      const data = await apiFetch<{ task: AiTask }>(`/projects/${projectId}/ai/edit-file`, {
        method: "POST",
        body: JSON.stringify({
          conversationId: aiConversation?.id,
          fileId: selectedFile?.kind === "file" && !selectedFile.isBinary ? selectedFile.id : undefined,
          instruction: prompt,
          provider: aiProvider
        })
      });
      setAiTask(data.task);
      await loadAiWorkflow();
      setLastAiPrompt("");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  async function generateWorkflowArtifact(type: ArtifactType, promptOverride?: string, displayLabel?: string) {
    if (!canEdit) return;
    const prompt = promptOverride?.trim() || aiInstruction.trim();
    const visiblePrompt = displayLabel || prompt || `Generate ${artifactLabel(type)}`;
    setError("");
    setAiInstruction("");
    setLastAiPrompt(visiblePrompt);
    setWorkflowRun({ type, label: workflowRunLabel(type) });
    setActiveTab("assistant");
    setNotice(`Generating ${artifactLabel(type)}...`);
    if (type === "visual_direction" || type === "slide_plan") setHtmlGenerationRequested(false);
    try {
      if (dirty) await saveFile();
      await apiFetch(`/projects/${projectId}/ai/workflow/artifacts`, {
        method: "POST",
        body: JSON.stringify({
          conversationId: aiConversation?.id,
          type,
          instruction: prompt || displayLabel || undefined,
          provider: aiProvider
        })
      });
      setNotice(`${artifactLabel(type)} updated`);
      await loadAiWorkflow();
      setLastAiPrompt("");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setWorkflowRun(null);
    }
  }

  async function generateHtmlFromPlan() {
    if (!canEdit) return;
    if (htmlGenerationRequested || aiTask?.status === "running") return;
    setHtmlGenerationRequested(true);
    const customPrompt = aiInstruction.trim();
    const prompt =
      customPrompt ||
      "Generate the final standalone HTML deck from the current brief and plan. Return complete workspace files for review.";
    await submitAiPrompt(prompt, customPrompt ? undefined : "Generate HTML");
  }

  async function repairCompileIssue() {
    if (!canEdit) return;
    if (aiTask?.status === "running") return;
    const prompt = `Repair the current HTML deck so it compiles and passes the SlideLeaf quality gate.

Use this compile log as the primary diagnostic source:
${compileLog}

Return complete replacement workspace files for review. Preserve the chosen deck topic and visual direction, but fix structural HTML, slide framing, navigation, density, viewport, and security issues.`;
    await submitAiPrompt(prompt, "Repair deck");
  }

  async function applyAiTask() {
    if (!canEdit) return;
    if (!aiTask || aiTask.status !== "needs_review") return;
    setError("");
    try {
      await apiFetch(`/projects/${projectId}/ai/tasks/${aiTask.id}/apply`, { method: "POST" });
      setAiTask(null);
      setAiInstruction("");
      setLastAiPrompt("");
      setWorkflowRun(null);
      setHtmlGenerationRequested(true);
      await reloadFiles(selectedFileId);
      await loadAiWorkflow();
      setNotice("AI workspace patch applied");
      await compile({ auto: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  async function rejectAiTask() {
    if (!canEdit) return;
    if (!aiTask || aiTask.id === "pending") return;
    await apiFetch(`/projects/${projectId}/ai/tasks/${aiTask.id}/reject`, { method: "POST" }).catch(() => undefined);
    setAiTask(null);
    setHtmlGenerationRequested(false);
    await loadAiWorkflow().catch(() => undefined);
  }

  return (
    <main className="workspace-shell bg-[var(--app-bg)]">
      <header className="relative flex items-center justify-between border-b border-white/10 bg-[#0b1020] px-4 text-white shadow-[0_12px_36px_rgba(15,23,42,0.20)]">
        <div className="flex min-w-0 items-center gap-2 truncate text-sm font-semibold">
          <BrandMark
            href="/dashboard"
            size="sm"
            nameClassName="text-sm font-semibold text-blue-300 transition hover:text-blue-200"
            markClassName="bg-transparent"
          />
          <span className="mx-2 text-slate-500">/</span>
          <span className="text-slate-100">{project?.title ?? "Project"}</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {notice ? <span className="text-xs text-emerald-300">{notice}</span> : null}
          <StatusPill status={compileJob?.status} />
          <span className="rounded-full border border-white/10 bg-white/8 px-2 py-1 text-xs text-slate-300">
            {roleLabel(currentRole)}
          </span>
          <ToolbarButton onClick={() => void openMembersPanel()} label="Members">
            <Users size={16} />
          </ToolbarButton>
          <ToolbarButton onClick={() => setLogOpen((value) => !value)} label="Compile Log">
            <Logs size={16} />
          </ToolbarButton>
          <ToolbarButton onClick={saveFile} disabled={!canEdit || !dirty || activeTab !== "file"} label="Save">
            <Save size={16} />
          </ToolbarButton>
          <ToolbarButton onClick={() => void compile()} primary label="Compile HTML">
            <Play size={16} />
          </ToolbarButton>
          {/* Snapshot is reserved for version history/restore UI in a later pass. */}
          {/* <ToolbarButton onClick={createSnapshot} label="Snapshot">
            <History size={16} />
          </ToolbarButton> */}
          <ToolbarButton onClick={() => uploadRef.current?.click()} disabled={!canEdit} label="Upload asset">
            <Upload size={16} />
          </ToolbarButton>
          <input
            ref={uploadRef}
            className="hidden"
            type="file"
            accept="image/png,image/jpeg,image/gif,image/svg+xml,image/webp"
            onChange={(event) => void uploadAsset(event.target.files)}
          />
          {compileJob?.shareSlug ? (
            <a
              href={`/share/${compileJob.shareSlug}`}
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-white/15 bg-white/8 px-3 text-sm text-slate-100 transition hover:bg-white/12"
            >
              <Share2 size={16} />
              Share
            </a>
          ) : null}
        </div>

        {logOpen ? (
          <div className="absolute right-4 top-[48px] z-30 w-[520px] max-w-[calc(100vw-32px)] overflow-hidden rounded-xl border border-slate-200 bg-white text-slate-950 shadow-[0_24px_80px_rgba(15,23,42,0.22)]">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold">
              <span>Compile Log</span>
              <button onClick={() => setLogOpen(false)} className="rounded-md p-1 hover:bg-slate-200">
                <X size={15} />
              </button>
            </div>
            <pre className="max-h-[420px] overflow-auto whitespace-pre-wrap p-3 text-xs leading-5 text-slate-600">
              {compileLog}
            </pre>
          </div>
        ) : null}

        {membersOpen ? (
          <MembersPanel
            members={members}
            isOwner={isOwner}
            inviteEmail={inviteEmail}
            inviteRole={inviteRole}
            onInviteEmailChange={setInviteEmail}
            onInviteRoleChange={setInviteRole}
            onInvite={inviteMember}
            onRoleChange={changeMemberRole}
            onRemove={removeMember}
            onClose={() => setMembersOpen(false)}
          />
        ) : null}
      </header>

      <section
        className="workspace-main min-h-0"
        style={{
          gridTemplateColumns: `${leftWidth}px 6px ${centerWidth}px 6px minmax(360px, 1fr)`
        }}
      >
        <FilesPane
          files={sortedFiles}
          selectedFileId={selectedFileId}
          canEdit={canEdit}
          newKind={newKind}
          newPath={newPath}
          onNewKindChange={setNewKind}
          onNewPathChange={setNewPath}
          onCreate={createWorkspaceEntry}
          onOpen={openEntry}
        />

        <ResizeHandle onMouseDown={() => setDragTarget("left")} />

        <section className="min-h-0 border-r border-slate-200 bg-[var(--panel)]">
          <div className="flex h-[44px] items-center gap-1 border-b border-slate-200 bg-white/90 px-2 shadow-[inset_0_-1px_0_rgba(15,23,42,0.02)]">
            <TabButton active={activeTab === "assistant"} onClick={() => setActiveTab("assistant")}>
              <Bot size={15} />
              AI Workspace
            </TabButton>
            {selectedFile ? (
              <TabButton active={activeTab === "file"} onClick={() => setActiveTab("file")}>
                <span className="max-w-[260px] truncate font-mono text-xs">{selectedFile.path}</span>
                {dirty ? <span className="text-blue-700">•</span> : null}
                <button
                  onClick={(event) => {
                    event.stopPropagation();
                    closeFileTab();
                  }}
                  className="rounded p-0.5 hover:bg-slate-200"
                  title="Close file"
                >
                  <X size={13} />
                </button>
              </TabButton>
            ) : null}
          </div>

          {activeTab === "file" && selectedFile ? (
            <EditorPane
              file={selectedFile}
              content={content}
              dirty={dirty}
              canEdit={canEdit}
              onContentChange={(value) => {
                setContent(value);
                setDirty(true);
              }}
              onSave={saveFile}
              onRename={renameSelected}
              onDelete={deleteSelected}
            />
          ) : (
            <AssistantPane
              conversation={aiConversation}
              messages={aiMessages}
              artifacts={aiArtifacts}
              instruction={aiInstruction}
              mode={aiMode}
              provider={aiProvider}
              canEdit={canEdit}
              lastPrompt={lastAiPrompt}
              workflowRun={workflowRun}
              task={aiTask}
              htmlGenerationRequested={htmlGenerationRequested}
              error={error}
              onInstructionChange={setAiInstruction}
              onModeChange={setAiMode}
              onProviderChange={setAiProvider}
              onAsk={requestAiEdit}
              onGenerateArtifact={generateWorkflowArtifact}
              onGenerateHtml={generateHtmlFromPlan}
              onApply={applyAiTask}
              onReject={rejectAiTask}
            />
          )}
        </section>

        <ResizeHandle onMouseDown={() => setDragTarget("center")} />

        <PreviewPane
          previewSrc={previewSrc}
          projectTitle={project?.title ?? "Untitled Presentation"}
          compileStatus={compileJob?.status}
          compileLog={compileLog}
          canEdit={canEdit}
          repairRunning={aiTask?.status === "running"}
          onRepairCompile={() => void repairCompileIssue()}
        />
      </section>
    </main>
  );
}

function MembersPanel({
  members,
  isOwner,
  inviteEmail,
  inviteRole,
  onInviteEmailChange,
  onInviteRoleChange,
  onInvite,
  onRoleChange,
  onRemove,
  onClose
}: {
  members: ProjectMember[];
  isOwner: boolean;
  inviteEmail: string;
  inviteRole: ProjectRole;
  onInviteEmailChange: (value: string) => void;
  onInviteRoleChange: (value: ProjectRole) => void;
  onInvite: (event: React.FormEvent<HTMLFormElement>) => void;
  onRoleChange: (memberId: string, role: ProjectRole) => void;
  onRemove: (member: ProjectMember) => void;
  onClose: () => void;
}) {
  return (
    <div className="absolute right-4 top-[48px] z-30 w-[520px] max-w-[calc(100vw-32px)] overflow-hidden rounded-xl border border-slate-200 bg-white text-slate-950 shadow-[0_24px_80px_rgba(15,23,42,0.22)]">
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold">
        <span>Project Members</span>
        <button onClick={onClose} className="rounded-md p-1 hover:bg-slate-200">
          <X size={15} />
        </button>
      </div>
      <div className="space-y-3 p-3">
        <p className="text-xs leading-5 text-slate-500">
          Members share project files and compiled output. AI conversations and prompts stay private to each user.
        </p>

        {isOwner ? (
          <form onSubmit={onInvite} className="grid gap-2 rounded-lg border border-slate-200 bg-slate-50 p-2 sm:grid-cols-[1fr_120px_auto]">
            <input
              value={inviteEmail}
              onChange={(event) => onInviteEmailChange(event.target.value)}
              type="email"
              placeholder="member@email.com"
              className="h-9 rounded-lg border border-slate-300 bg-white px-2 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
            <RoleSelect value={inviteRole} onChange={onInviteRoleChange} />
            <button className="h-9 rounded-lg bg-slate-950 px-3 text-sm font-semibold text-white transition hover:bg-slate-800">
              Invite
            </button>
          </form>
        ) : null}

        <div className="max-h-[360px] space-y-2 overflow-auto">
          {members.map((member) => (
            <div key={member.id} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 px-3 py-2">
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-slate-900">
                  {member.user.name || member.user.email}
                </div>
                <div className="truncate text-xs text-slate-500">{member.user.email}</div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {isOwner ? (
                  <RoleSelect value={member.role} onChange={(role) => onRoleChange(member.id, role)} />
                ) : (
                  <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">
                    {roleLabel(member.role)}
                  </span>
                )}
                {isOwner ? (
                  <button
                    onClick={() => onRemove(member)}
                    className="grid h-8 w-8 place-items-center rounded-lg border border-red-100 bg-red-50 text-red-700 transition hover:bg-red-100"
                    title="Remove member"
                  >
                    <Trash2 size={14} />
                  </button>
                ) : null}
              </div>
            </div>
          ))}
          {!members.length ? (
            <div className="rounded-lg border border-dashed border-slate-300 p-3 text-sm text-slate-500">
              No members loaded.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function RoleSelect({ value, onChange }: { value: ProjectRole; onChange: (value: ProjectRole) => void }) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value as ProjectRole)}
      className="h-9 rounded-lg border border-slate-300 bg-white px-2 text-xs font-semibold text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
    >
      <option value="owner">Owner</option>
      <option value="editor">Edit</option>
      <option value="viewer">View</option>
    </select>
  );
}

function FilesPane({
  files,
  selectedFileId,
  canEdit,
  newKind,
  newPath,
  onNewKindChange,
  onNewPathChange,
  onCreate,
  onOpen
}: {
  files: ProjectFile[];
  selectedFileId: string;
  canEdit: boolean;
  newKind: "file" | "folder";
  newPath: string;
  onNewKindChange: (kind: "file" | "folder") => void;
  onNewPathChange: (path: string) => void;
  onCreate: (event: React.FormEvent<HTMLFormElement>) => void;
  onOpen: (file: ProjectFile) => void;
}) {
  return (
    <aside className="min-h-0 border-r border-slate-200 bg-[#f8fafc]">
      <PanelTitle>Files</PanelTitle>
      <form onSubmit={onCreate} className="border-b border-slate-200 bg-white/80 p-2">
        <div className="flex gap-1.5">
          <select
            value={newKind}
            disabled={!canEdit}
            onChange={(event) => onNewKindChange(event.target.value as "file" | "folder")}
            className="h-9 w-24 rounded-lg border border-slate-300 bg-white px-2 text-xs text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          >
            <option value="file">File</option>
            <option value="folder">Folder</option>
          </select>
          <input
            value={newPath}
            disabled={!canEdit}
            onChange={(event) => onNewPathChange(event.target.value)}
            className="h-9 min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-2 text-xs outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          />
          <button
            disabled={!canEdit}
            className="grid h-9 w-9 place-items-center rounded-lg border border-slate-300 bg-white text-slate-700 transition hover:border-blue-300 hover:text-blue-700 disabled:opacity-40"
            title={canEdit ? "Create" : "View-only members cannot create files"}
          >
            {newKind === "file" ? <FilePlus2 size={15} /> : <FolderPlus size={15} />}
          </button>
        </div>
      </form>
      <div className="h-[calc(100%-88px)] overflow-auto p-2 text-sm">
        {files.map((file) => (
          <button
            key={file.id}
            onClick={() => onOpen(file)}
            className={`mb-0.5 flex w-full items-center gap-2 truncate rounded-lg px-2 py-1.5 text-left transition ${
              selectedFileId === file.id
                ? "bg-blue-600 text-white shadow-[0_8px_18px_rgba(37,99,235,0.18)]"
                : "text-slate-700 hover:bg-white hover:shadow-sm"
            }`}
            style={{ paddingLeft: `${8 + depthFor(file.path) * 14}px` }}
            title={file.path}
          >
            {file.kind === "folder" ? <Folder size={14} /> : <FileText size={14} />}
            <span className={file.kind === "folder" ? "font-semibold" : ""}>
              {file.name}
            </span>
          </button>
        ))}
      </div>
    </aside>
  );
}

function AssistantPane({
  conversation,
  messages,
  artifacts,
  instruction,
  mode,
  provider,
  canEdit,
  lastPrompt,
  workflowRun,
  task,
  htmlGenerationRequested,
  error,
  onInstructionChange,
  onModeChange,
  onProviderChange,
  onAsk,
  onGenerateArtifact,
  onGenerateHtml,
  onApply,
  onReject
}: {
  conversation: AiConversation | null;
  messages: AiMessage[];
  artifacts: AiArtifact[];
  instruction: string;
  mode: AiMode;
  provider: AiProvider;
  canEdit: boolean;
  lastPrompt: string;
  workflowRun: WorkflowRun | null;
  task: AiTask | null;
  htmlGenerationRequested: boolean;
  error: string;
  onInstructionChange: (value: string) => void;
  onModeChange: (value: AiMode) => void;
  onProviderChange: (value: AiProvider) => void;
  onAsk: () => void;
  onGenerateArtifact: (type: ArtifactType, promptOverride?: string, displayLabel?: string) => void;
  onGenerateHtml: () => void;
  onApply: () => void;
  onReject: () => void;
}) {
  const hasPrompt = instruction.trim().length > 0;
  const busy = Boolean(workflowRun) || task?.status === "running";
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [messages.length, lastPrompt, workflowRun?.label, task?.status, error]);

  return (
    <section className="grid h-[calc(100%-44px)] grid-rows-[46px_minmax(0,1fr)_auto] bg-[#f4f7fb]">
      <div className="flex items-center justify-between border-b border-slate-200 bg-white/95 px-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-blue-50 text-blue-700">
            <Sparkles size={15} />
          </span>
          {conversation?.title ?? "Slide workspace assistant"}
        </div>
        <div className="text-xs text-slate-500">
          {messages.length ? `${messages.length} saved messages · ` : ""}
          HTML deck generation · review before apply
        </div>
      </div>

      <div className="min-h-0 overflow-auto px-5 py-5">
        <div className="mx-auto flex max-w-4xl flex-col gap-4">
          {!messages.length && !lastPrompt && !workflowRun ? <AssistantWelcome /> : null}

          {messages.map((message) => (
            <ChatBubble key={message.id} role={message.role === "user" ? "user" : "assistant"}>
              <MessageContent message={message} />
            </ChatBubble>
          ))}

          {shouldShowStageAction(conversation?.stage ?? "consultation", artifacts) ? (
            <StageActionCard
              stage={conversation?.stage ?? "consultation"}
              artifacts={artifacts}
              running={busy}
              canEdit={canEdit}
              htmlGenerationRequested={htmlGenerationRequested}
              onGenerateArtifact={onGenerateArtifact}
              onGenerateHtml={onGenerateHtml}
            />
          ) : null}

          {lastPrompt ? (
            <ChatBubble role="user">
              <div className="max-w-[34rem] whitespace-pre-wrap text-sm leading-6">{lastPrompt}</div>
            </ChatBubble>
          ) : null}

          {error ? (
            <ChatBubble role="assistant">
              <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
            </ChatBubble>
          ) : null}

          {workflowRun ? (
            <ChatBubble role="assistant">
              <RunningBubble
                title={workflowRun.label}
                description={
                  workflowRun.type === "brief"
                    ? "I am reading the chat and project context, then turning it into a clear brief."
                    : workflowRun.type === "visual_direction"
                      ? "I am creating distinct visual directions so the deck has a real design point of view."
                      : "I am turning the brief and style direction into narrative structure, slide logic, and layout choices."
                }
              />
            </ChatBubble>
          ) : null}

          {task?.status === "running" ? (
            <ChatBubble role="assistant">
              <RunningBubble
                title="Generating workspace files"
                description="I am reading the current project context and producing complete HTML/config files."
              />
            </ChatBubble>
          ) : null}

          {task?.status === "failed" ? (
            <ChatBubble role="assistant">
              <div className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">{task.log}</div>
            </ChatBubble>
          ) : null}

          {task?.status === "needs_review" ? (
            <ChatBubble role="assistant">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-slate-950">Generated workspace patch</div>
                    {task.diffJson?.summary ? <div className="mt-1 text-sm text-slate-600">{task.diffJson.summary}</div> : null}
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      onClick={onApply}
                      disabled={!canEdit}
                      className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-3 py-1.5 text-sm text-white disabled:opacity-40"
                    >
                      <Check size={15} />
                      Apply
                    </button>
                    <button
                      onClick={onReject}
                      disabled={!canEdit}
                      className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-3 py-1.5 text-sm disabled:opacity-40"
                    >
                      <X size={15} />
                      Reject
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  {task.diffJson?.files?.map((file) => (
                    <details key={file.path} className="overflow-hidden rounded-md border border-slate-200 bg-slate-50" open>
                      <summary className="flex cursor-pointer items-center justify-between border-b border-slate-200 px-3 py-2 text-xs">
                        <span className="font-mono font-semibold text-slate-800">{file.path}</span>
                        <span className="rounded bg-white px-1.5 py-0.5 text-[11px] text-slate-500">{file.action ?? "update"}</span>
                      </summary>
                      <div className="max-h-64 overflow-auto p-2 font-mono text-xs">
                        {file.lines.map((line, index) => (
                          <DiffLine key={`${file.path}-${line.type}-${index}`} line={line} />
                        ))}
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            </ChatBubble>
          ) : null}

          <div ref={chatEndRef} />
        </div>
      </div>

      <div className="border-t border-slate-200 bg-white/95 px-5 py-3 shadow-[0_-12px_34px_rgba(15,23,42,0.06)]">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-2xl border border-slate-300 bg-white p-2 shadow-[0_12px_30px_rgba(15,23,42,0.09)] transition focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100">
            <textarea
              value={instruction}
              onChange={(event) => onInstructionChange(event.target.value)}
              disabled={!canEdit}
              onKeyDown={(event) => {
                if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
                  event.preventDefault();
                  onAsk();
                }
              }}
              rows={2}
              className="block max-h-28 min-h-[54px] w-full resize-none border-0 bg-transparent px-2 py-2 text-sm leading-6 text-slate-900 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed disabled:text-slate-400"
              placeholder={canEdit ? "Describe the deck, refine the direction, or ask for changes..." : "View-only access: prompts are private and editing is disabled."}
            />
            <div className="flex items-center justify-between gap-2 px-1 pt-1">
              <div className="flex min-w-0 items-center gap-2">
                <ModePicker value={mode} onChange={onModeChange} />
                <ModelPicker value={provider} onChange={onProviderChange} />
                <div className="truncate text-xs text-slate-400">
                  {mode === "auto" ? `Auto uses ${shortStageLabel(conversation?.stage ?? "consultation")}` : shortStageLabel(mode)}
                </div>
              </div>
              <button
                onClick={onAsk}
                disabled={!canEdit || !hasPrompt || busy}
                className="inline-flex h-9 shrink-0 items-center gap-2 rounded-lg bg-slate-950 px-3 text-sm font-semibold text-white shadow-[0_10px_22px_rgba(15,23,42,0.18)] transition hover:bg-slate-800 disabled:opacity-40"
              >
                <Send size={15} />
                Send
              </button>
            </div>
          </div>
          <div className="mt-1 text-center text-[11px] text-slate-400">
            Press Ctrl+Enter to send. Generated files stay in review until you apply them.
          </div>
        </div>
      </div>
    </section>
  );
}

function ModePicker({ value, onChange }: { value: AiMode; onChange: (value: AiMode) => void }) {
  const [open, setOpen] = useState(false);
  const options: Array<{ value: AiMode; label: string; description: string }> = [
    { value: "auto", label: "Auto", description: "Follow current workflow" },
    { value: "consultation", label: "Clarify", description: "Refine goal and constraints" },
    { value: "slide_plan", label: "Plan", description: "Narrative and slide structure" },
    { value: "generate", label: "Create", description: "Generate workspace files" }
  ];
  const selected = options.find((item) => item.value === value) ?? options[0];

  return (
    <div
      className="relative"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(false);
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-2.5 text-xs font-semibold text-slate-800 transition hover:border-slate-300 hover:bg-white"
        title="AI mode"
      >
        {selected.label}
        <ChevronDown size={14} className={`text-slate-400 transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open ? (
        <div className="absolute bottom-[42px] left-0 z-40 w-64 overflow-hidden rounded-xl border border-slate-200 bg-white p-1 shadow-[0_24px_70px_rgba(15,23,42,0.22)]">
          {options.map((item) => (
            <button
              key={item.value}
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                onChange(item.value);
                setOpen(false);
              }}
              className={`flex w-full items-start justify-between gap-3 rounded-lg px-3 py-2 text-left transition ${
                item.value === value ? "bg-slate-950 text-white" : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              <span>
                <span className="block text-sm font-semibold">{item.label}</span>
                <span className={`mt-0.5 block text-xs ${item.value === value ? "text-slate-300" : "text-slate-500"}`}>
                  {item.description}
                </span>
              </span>
              {item.value === value ? <Check size={15} className="mt-0.5 shrink-0" /> : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function ModelPicker({ value, onChange }: { value: AiProvider; onChange: (value: AiProvider) => void }) {
  const [open, setOpen] = useState(false);
  const options: Array<{ value: AiProvider; label: string; description: string }> = [
    { value: "deepseek", label: "DeepSeek", description: "Long-form generation" },
    { value: "gemini", label: "Gemini", description: "Fast planning and drafting" }
  ];
  const selected = options.find((item) => item.value === value) ?? options[0];

  return (
    <div
      className="relative"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(false);
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-2.5 text-xs font-semibold text-slate-800 transition hover:border-slate-300 hover:bg-white"
        title="AI model"
      >
        {selected.label}
        <ChevronDown size={14} className={`text-slate-400 transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open ? (
        <div className="absolute bottom-[42px] left-0 z-40 w-64 overflow-hidden rounded-xl border border-slate-200 bg-white p-1 shadow-[0_24px_70px_rgba(15,23,42,0.22)]">
          {options.map((item) => (
            <button
              key={item.value}
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                onChange(item.value);
                setOpen(false);
              }}
              className={`flex w-full items-start justify-between gap-3 rounded-lg px-3 py-2 text-left transition ${
                item.value === value ? "bg-slate-950 text-white" : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              <span>
                <span className="block text-sm font-semibold">{item.label}</span>
                <span className={`mt-0.5 block text-xs ${item.value === value ? "text-slate-300" : "text-slate-500"}`}>
                  {item.description}
                </span>
              </span>
              {item.value === value ? <Check size={15} className="mt-0.5 shrink-0" /> : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function RunningBubble({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-1 flex gap-1">
        <span className="h-2 w-2 animate-bounce rounded-full bg-blue-600 [animation-delay:-0.2s]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-blue-600 [animation-delay:-0.1s]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-blue-600" />
      </div>
      <div>
        <div className="text-sm font-semibold text-slate-900">{title}</div>
        <div className="mt-1 text-sm leading-6 text-slate-600">{description}</div>
      </div>
    </div>
  );
}

function AssistantWelcome() {
  return (
    <ChatBubble role="assistant">
      <div className="space-y-3">
        <div>
          <div className="text-sm font-semibold text-slate-950">Tell me what this deck needs to achieve.</div>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            I will clarify the goal, show visual directions, plan the storyline, then create editable HTML slides for review.
          </p>
        </div>
        <div className="grid gap-2 text-sm sm:grid-cols-2">
          <ExamplePrompt text="Create an 8-slide investor deck for an AI-native slide studio. Make it premium, technical, and convincing." />
          <ExamplePrompt text="Make a cinematic Chinese story deck about The Little Prince with elegant motion and navigation." />
        </div>
      </div>
    </ChatBubble>
  );
}

function StageActionCard({
  stage,
  artifacts,
  running,
  canEdit,
  htmlGenerationRequested,
  onGenerateArtifact,
  onGenerateHtml
}: {
  stage: WorkflowStage;
  artifacts: AiArtifact[];
  running: boolean;
  canEdit: boolean;
  htmlGenerationRequested: boolean;
  onGenerateArtifact: (type: ArtifactType, promptOverride?: string, displayLabel?: string) => void;
  onGenerateHtml: () => void;
}) {
  const artifactType = artifactTypeForStage(stage);
  const currentArtifact = artifactType ? latestArtifactForType(artifacts, artifactType) : null;

  return (
    <ChatBubble role="assistant">
      <div className="w-full max-w-[44rem] rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-4 shadow-[0_18px_48px_rgba(15,23,42,0.08)]">
        {stage === "generate" ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-slate-950">Ready to create the deck</div>
              <p className="mt-1 text-xs leading-5 text-slate-600">
                I will use the current brief, visual direction, and deck plan to create editable HTML files.
              </p>
            </div>
            {!htmlGenerationRequested && !running && canEdit ? (
              <button
                onClick={onGenerateHtml}
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(15,23,42,0.22)] transition hover:bg-slate-800"
              >
                <Sparkles size={15} />
                Generate deck
              </button>
            ) : null}
          </div>
        ) : artifactType ? (
          <div className="space-y-3">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200/70 pb-3">
              <div>
                <div className="text-sm font-semibold text-slate-950">{stageLabel(stage)}</div>
                <p className="mt-1 text-xs leading-5 text-slate-600">{stageDescription(stage)}</p>
              </div>
              {!currentArtifact ? (
                <button
                  onClick={() =>
                    onGenerateArtifact(
                      artifactType,
                      undefined,
                      `Start ${artifactLabel(artifactType)}`
                    )
                  }
                  disabled={running || !canEdit}
                  className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 disabled:opacity-40"
                >
                  <Sparkles size={14} />
                  Start
                </button>
              ) : null}
            </div>

            {currentArtifact ? (
              <ArtifactPreview
                artifact={currentArtifact}
                running={running}
                canEdit={canEdit}
                onStartStyle={() =>
                  onGenerateArtifact(
                    "visual_direction",
                    "Create three distinct visual directions from the current creative brief.",
                    "Choose a visual direction"
                  )
                }
                onStartPlan={(directionId?: string) =>
                  onGenerateArtifact(
                    "slide_plan",
                    directionId
                      ? `Create the deck plan using visual direction ${directionId}.`
                      : "Create the deck plan from the current creative brief and visual direction.",
                    "Create deck plan"
                  )
                }
                onGenerateHtml={onGenerateHtml}
                htmlGenerationRequested={htmlGenerationRequested}
              />
            ) : (
              <div className="rounded-lg border border-dashed border-slate-300 bg-white p-3 text-xs text-slate-500">
                I need this step before creating final HTML. Use the chat box to add details, or click Start.
              </div>
            )}
          </div>
        ) : null}
      </div>
    </ChatBubble>
  );
}

function ArtifactPreview({
  artifact,
  running,
  canEdit,
  onStartStyle,
  onStartPlan,
  onGenerateHtml,
  htmlGenerationRequested
}: {
  artifact: AiArtifact;
  running: boolean;
  canEdit: boolean;
  onStartStyle: () => void;
  onStartPlan: (directionId?: string) => void;
  onGenerateHtml: () => void;
  htmlGenerationRequested: boolean;
}) {
  if (artifact.type === "brief") {
    return <BriefArtifact artifact={artifact} running={running} canEdit={canEdit} onStartStyle={onStartStyle} />;
  }
  if (artifact.type === "visual_direction") {
    return (
      <VisualDirectionArtifact
        artifact={artifact}
        running={running}
        canEdit={canEdit}
        onStartPlan={onStartPlan}
      />
    );
  }
  if (artifact.type === "slide_plan") {
    return (
      <PlanArtifact
        artifact={artifact}
        running={running}
        canEdit={canEdit}
        htmlGenerationRequested={htmlGenerationRequested}
        onGenerateHtml={onGenerateHtml}
      />
    );
  }

  return (
    <details className="overflow-hidden rounded-lg border border-slate-200 bg-white" open>
      <summary className="flex cursor-pointer items-center justify-between gap-3 px-3 py-2 text-xs">
        <span className="font-semibold text-slate-800">{artifactLabel(artifact.type)}</span>
      </summary>
      <pre className="max-h-64 overflow-auto border-t border-slate-100 p-3 text-xs leading-5 text-slate-700">
        {JSON.stringify(artifact.contentJson, null, 2)}
      </pre>
    </details>
  );
}

function BriefArtifact({
  artifact,
  running,
  canEdit,
  onStartStyle
}: {
  artifact: AiArtifact;
  running: boolean;
  canEdit: boolean;
  onStartStyle: () => void;
}) {
  const data = asRecord(artifact.contentJson);
  const fields = [
    ["Topic", textField(data, "topic")],
    ["Audience", textField(data, "audience")],
    ["Purpose", textField(data, "purpose")],
    ["Tone", textField(data, "tone")],
    ["Language", textField(data, "language")],
    ["Slides", textField(data, "slideCount")]
  ].filter(([, value]) => value && value !== "unknown");
  const mustInclude = listField(data, "mustInclude");
  const unknowns = meaningfulList(listField(data, "unknowns"));
  const questions = meaningfulList(listField(data, "clarifyingQuestions"));
  const readyForPlan = unknowns.length === 0 && questions.length === 0;

  return (
    <div className="space-y-3 rounded-lg border border-slate-200 bg-white p-4">
      <div>
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm font-semibold text-slate-950">Consultation brief</div>
          <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700">current context</span>
        </div>
        {textField(data, "summary") ? (
          <p className="mt-2 text-sm leading-6 text-slate-700">{textField(data, "summary")}</p>
        ) : null}
      </div>

      {fields.length ? (
        <div className="grid gap-2 sm:grid-cols-2">
          {fields.map(([label, value]) => (
            <div key={label} className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
              <div className="text-[11px] font-medium uppercase tracking-wide text-slate-400">{label}</div>
              <div className="mt-1 text-sm text-slate-800">{value}</div>
            </div>
          ))}
        </div>
      ) : null}

      <ArtifactList title="Must include" items={mustInclude} />
      <ArtifactList title="Still unclear" items={unknowns} tone="amber" />
      <ArtifactList title="Questions for you" items={questions} tone="blue" />

      {readyForPlan && canEdit ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-blue-100 bg-blue-50 px-3 py-3">
          <div>
            <div className="text-sm font-semibold text-blue-950">Brief is clear enough to design</div>
            <p className="mt-1 text-xs leading-5 text-blue-800">
              Next I will create three visual directions so you can choose the look before generating slides.
            </p>
          </div>
          <button
            onClick={onStartStyle}
            disabled={running}
            className="inline-flex h-9 items-center gap-2 rounded-lg bg-slate-950 px-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
          >
            <Sparkles size={15} />
            Choose style
          </button>
        </div>
      ) : null}
    </div>
  );
}

function VisualDirectionArtifact({
  artifact,
  running,
  canEdit,
  onStartPlan
}: {
  artifact: AiArtifact;
  running: boolean;
  canEdit: boolean;
  onStartPlan: (directionId?: string) => void;
}) {
  const data = asRecord(artifact.contentJson);
  const directions = Array.isArray(data.directions) ? data.directions.map(asRecord).filter(BooleanRecord) : [];
  const recommended = textField(data, "recommended");

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_18px_45px_rgba(15,23,42,0.07)]">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-base font-semibold text-slate-950">Choose the deck's visual direction</div>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Pick the visual system first. SlideLeaf will use it to constrain layout, motion, typography, and final HTML.
          </p>
        </div>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
          {directions.length || 3} options
        </span>
      </div>

      {directions.length ? (
        <div className="grid gap-4">
          {directions.map((direction, index) => {
            const id = textField(direction, "id") || `direction-${index + 1}`;
            const typography = asRecord(direction.typography);
            const palette = Array.isArray(direction.palette) ? direction.palette.map(readableValue).filter(Boolean) : [];
            const sampleHtml = textField(direction, "sampleSlideHtml");
            const isRecommended = recommended === id;

            return (
              <article
                key={id}
                className={`overflow-hidden rounded-2xl border bg-white shadow-[0_14px_36px_rgba(15,23,42,0.08)] transition ${
                  isRecommended ? "border-blue-300 ring-4 ring-blue-50" : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="space-y-3 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="text-base font-semibold text-slate-950">
                            {textField(direction, "name") || `Direction ${index + 1}`}
                          </div>
                          {isRecommended ? (
                            <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[11px] font-semibold text-white">
                              recommended
                            </span>
                          ) : null}
                        </div>
                        {textField(direction, "visualThesis") ? (
                          <p className="mt-2 text-sm leading-6 text-slate-600">{textField(direction, "visualThesis")}</p>
                        ) : null}
                      </div>
                      <div className="flex shrink-0 flex-wrap gap-2">
                        {sampleHtml ? (
                          <button
                            type="button"
                            onClick={() => openHtmlPreview(sampleHtml)}
                            className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
                          >
                            <Play size={15} />
                            Preview
                          </button>
                        ) : null}
                        <button
                          onClick={() => onStartPlan(id)}
                          disabled={running || !canEdit}
                          className="inline-flex h-10 items-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white shadow-[0_12px_26px_rgba(15,23,42,0.22)] transition hover:bg-slate-800 disabled:opacity-40"
                        >
                          <Check size={15} />
                          Use this
                        </button>
                      </div>
                    </div>

                    <MiniFact label="Best for" value={textField(direction, "bestFor")} />

                    <div className="flex flex-wrap items-center gap-2">
                      {palette.slice(0, 7).map((color) => (
                        <span
                          key={color}
                          className="h-7 w-12 rounded-full border border-slate-200 shadow-sm"
                          style={{ background: color }}
                          title={color}
                        />
                      ))}
                    </div>

                    <details className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
                      <summary className="cursor-pointer text-xs font-semibold text-slate-600">
                        Design notes
                      </summary>
                      <div className="mt-2 grid gap-2 sm:grid-cols-2">
                        <MiniFact label="Layout" value={textField(direction, "layoutPersonality")} />
                        <MiniFact
                          label="Typography"
                          value={[textField(typography, "display"), textField(typography, "body")].filter(Boolean).join(" / ")}
                        />
                        <MiniFact label="Motion" value={listField(direction, "motionLanguage").slice(0, 3).join(", ")} />
                        <MiniFact label="Signature" value={listField(direction, "signatureElements").slice(0, 3).join(", ")} />
                      </div>
                    </details>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <pre className="max-h-64 overflow-auto rounded-lg border border-slate-100 bg-slate-50 p-3 text-xs leading-5 text-slate-700">
          {JSON.stringify(artifact.contentJson, null, 2)}
        </pre>
      )}
    </div>
  );
}

function PlanArtifact({
  artifact,
  running,
  canEdit,
  htmlGenerationRequested,
  onGenerateHtml
}: {
  artifact: AiArtifact;
  running: boolean;
  canEdit: boolean;
  htmlGenerationRequested: boolean;
  onGenerateHtml: () => void;
}) {
  const data = asRecord(artifact.contentJson);
  const slides = Array.isArray(data.slides) ? data.slides.map(asRecord).filter(BooleanRecord) : [];
  const chosenDirection = asRecord(data.chosenDirection);
  const designSystem = asRecord(data.designSystem);

  return (
    <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-slate-950">Deck plan</div>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Storyline, slide structure, layouts, and motion rules are ready.
          </p>
        </div>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
          {slides.length ? `${slides.length} slides` : "current plan"}
        </span>
      </div>

      {textField(data, "narrativeArc") ? (
        <div className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-blue-700">Narrative arc</div>
          <p className="mt-1 text-sm leading-6 text-slate-800">{textField(data, "narrativeArc")}</p>
        </div>
      ) : null}

      {textField(chosenDirection, "name") || textField(data, "designDirection") ? (
        <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Chosen visual system</div>
          <p className="mt-1 text-sm leading-6 text-slate-700">
            {textField(chosenDirection, "name") || textField(data, "designDirection")}
            {textField(chosenDirection, "reason") ? ` — ${textField(chosenDirection, "reason")}` : ""}
          </p>
        </div>
      ) : null}

      {Object.keys(designSystem).length ? (
        <div className="grid gap-2 sm:grid-cols-2">
          <MiniFact label="Typography" value={textField(designSystem, "typography")} />
          <MiniFact label="Motion" value={listField(designSystem, "motion").join(", ")} />
          <MiniFact label="Components" value={listField(designSystem, "componentRules").slice(0, 3).join("; ")} />
          <MiniFact label="Avoid" value={listField(designSystem, "antiPatterns").slice(0, 3).join("; ")} />
        </div>
      ) : null}

      {slides.length ? (
        <div className="space-y-2">
          {slides.map((slide, index) => (
            <SlidePlanItem key={`${textField(slide, "id") || index}`} slide={slide} fallbackIndex={index + 1} />
          ))}
        </div>
      ) : (
        <pre className="max-h-64 overflow-auto rounded-lg border border-slate-100 bg-slate-50 p-3 text-xs leading-5 text-slate-700">
          {JSON.stringify(artifact.contentJson, null, 2)}
        </pre>
      )}

      {!htmlGenerationRequested && !running && canEdit ? (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-blue-100 bg-blue-50 px-3 py-3">
        <div>
          <div className="text-sm font-semibold text-blue-950">Plan is ready for generation</div>
          <p className="mt-1 text-xs leading-5 text-blue-800">
            Generate editable HTML files with this storyline, visual system, and motion language.
          </p>
        </div>
        <button
          onClick={onGenerateHtml}
          disabled={running}
          className="inline-flex h-9 items-center gap-2 rounded-lg bg-slate-950 px-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
        >
          <Sparkles size={15} />
          Generate deck
        </button>
      </div>
      ) : null}
    </div>
  );
}

function SlidePlanItem({ slide, fallbackIndex }: { slide: JsonRecord; fallbackIndex: number }) {
  const index = textField(slide, "index") || String(fallbackIndex);
  const actionTitle = textField(slide, "actionTitle") || textField(slide, "title") || `Slide ${index}`;
  const layout = textField(slide, "layout");
  const pattern = textField(slide, "visualPattern");
  const message = textField(slide, "message");
  const visualRole = textField(slide, "visualRole");
  const density = textField(slide, "density");
  const contentBlocks = Array.isArray(slide.contentBlocks)
    ? slide.contentBlocks.map(readableValue).filter(Boolean)
    : [];
  const visualTreatment = asRecord(slide.visualTreatment);
  const designNotes = asRecord(slide.designNotes);

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-slate-950 text-xs font-semibold text-white">
          {index}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold leading-5 text-slate-950">{actionTitle}</div>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {layout ? <Tag>{layout}</Tag> : null}
            {pattern ? <Tag>{pattern}</Tag> : null}
            {visualRole ? <Tag>{visualRole}</Tag> : null}
            {density ? <Tag>{density} density</Tag> : null}
          </div>
          {message ? <p className="mt-2 text-sm leading-6 text-slate-600">{message}</p> : null}
          <ArtifactList title="Supporting points" items={listField(slide, "supportingPoints")} compact />
          <ArtifactList title="Content blocks" items={contentBlocks} compact />
          <ArtifactList
            title="Visual treatment"
            items={[
              textField(visualTreatment, "composition"),
              textField(visualTreatment, "motion"),
              textField(visualTreatment, "signatureElement")
            ].filter(Boolean)}
            compact
            tone="blue"
          />
          {textField(slide, "speakerIntent") ? (
            <p className="mt-2 text-xs leading-5 text-slate-500">Presenter intent: {textField(slide, "speakerIntent")}</p>
          ) : null}
          {textField(designNotes, "mood") ? (
            <p className="mt-2 text-xs leading-5 text-slate-500">Mood: {textField(designNotes, "mood")}</p>
          ) : null}
          <ArtifactList
            title="Avoid"
            items={[...listField(designNotes, "avoid"), ...listField(slide, "avoid")]}
            compact
            tone="red"
          />
        </div>
      </div>
    </article>
  );
}

function MiniFact({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</div>
      <div className="mt-1 max-h-[3.75rem] overflow-hidden text-xs leading-5 text-slate-700">{value}</div>
    </div>
  );
}

function ArtifactList({
  title,
  items,
  tone = "slate",
  compact
}: {
  title: string;
  items: string[];
  tone?: "slate" | "blue" | "amber" | "red";
  compact?: boolean;
}) {
  if (!items.length) return null;
  const toneClass =
    tone === "blue"
      ? "border-blue-100 bg-blue-50 text-blue-900"
      : tone === "amber"
        ? "border-amber-100 bg-amber-50 text-amber-900"
        : tone === "red"
          ? "border-red-100 bg-red-50 text-red-900"
          : "border-slate-100 bg-slate-50 text-slate-700";

  return (
    <div className={compact ? "mt-2" : ""}>
      <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">{title}</div>
      <ul className={`space-y-1 rounded-lg border px-3 py-2 text-sm leading-6 ${toneClass}`}>
        {items.map((item, index) => (
          <li key={`${title}-${index}`} className="flex gap-2">
            <span className="mt-[0.55rem] h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-45" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
      {children}
    </span>
  );
}

function ChatBubble({ role, children }: { role: "assistant" | "user"; children: React.ReactNode }) {
  return (
    <div className={`flex ${role === "user" ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-full rounded-xl px-4 py-3 shadow-sm ${
          role === "user"
            ? "bg-slate-950 text-white shadow-[0_14px_32px_rgba(15,23,42,0.18)]"
            : "border border-slate-200 bg-white text-slate-900 shadow-[0_10px_30px_rgba(15,23,42,0.06)]"
        }`}
      >
        {children}
      </div>
    </div>
  );
}

function MessageContent({ message }: { message: AiMessage }) {
  const rawStatus = typeof message.metadata?.status === "string" ? message.metadata.status : "";
  const status = rawStatus === "draft" || rawStatus === "approved" ? "" : rawStatus;
  return (
    <div className="max-w-[34rem]">
      <div className="whitespace-pre-wrap text-sm leading-6">{message.content}</div>
      {status ? (
        <div className="mt-2 inline-flex rounded-full bg-slate-100 px-2 py-1 text-[11px] text-slate-500">
          {status.replace("_", " ")}
        </div>
      ) : null}
    </div>
  );
}

function ExamplePrompt({ text }: { text: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-600">
      {text}
    </div>
  );
}

function EditorPane({
  file,
  content,
  dirty,
  canEdit,
  onContentChange,
  onSave,
  onRename,
  onDelete
}: {
  file: ProjectFile;
  content: string;
  dirty: boolean;
  canEdit: boolean;
  onContentChange: (value: string) => void;
  onSave: () => void;
  onRename: () => void;
  onDelete: () => void;
}) {
  return (
    <section className="grid h-[calc(100%-44px)] grid-rows-[40px_minmax(0,1fr)] bg-white">
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/70 px-3">
        <div className="min-w-0 truncate text-sm font-semibold text-slate-800">
          {file.path}
          {dirty ? <span className="ml-2 text-xs text-blue-700">unsaved</span> : null}
        </div>
        <div className="flex gap-1">
          <button onClick={onSave} disabled={!canEdit || !dirty || file.kind !== "file" || file.isBinary} className="rounded-md border border-slate-300 bg-white px-2 py-0.5 text-xs transition hover:bg-slate-50 disabled:opacity-50">
            Save
          </button>
          <button onClick={onRename} disabled={!canEdit} className="rounded-md border border-slate-300 bg-white px-2 py-0.5 text-xs transition hover:bg-slate-50 disabled:opacity-50">
            Rename
          </button>
          <button onClick={onDelete} disabled={!canEdit} className="rounded-md border border-red-100 bg-red-50 px-2 py-0.5 text-xs text-red-700 transition hover:bg-red-100 disabled:opacity-50">
            <Trash2 size={13} />
          </button>
        </div>
      </div>
      {file.kind === "file" && !file.isBinary ? (
        <MonacoEditor
          height="100%"
          language={languageFor(file.path)}
          value={content}
          theme="vs-light"
          onChange={(value) => onContentChange(value ?? "")}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            wordWrap: "on",
            tabSize: 2,
            scrollBeyondLastLine: false,
            readOnly: !canEdit
          }}
        />
      ) : (
        <div className="grid place-items-center p-6 text-center text-sm text-slate-500">
          {file.isBinary ? "Binary asset selected." : "Folder selected. Rename or delete it from this panel."}
        </div>
      )}
    </section>
  );
}

function PreviewPane({
  previewSrc,
  projectTitle,
  compileStatus,
  compileLog,
  canEdit,
  repairRunning,
  onRepairCompile
}: {
  previewSrc: string;
  projectTitle: string;
  compileStatus?: CompileJob["status"];
  compileLog: string;
  canEdit: boolean;
  repairRunning: boolean;
  onRepairCompile: () => void;
}) {
  const isCompiling = compileStatus === "queued" || compileStatus === "running";
  const isFailed = compileStatus === "failed";
  const qualityLines = compileLog
    .split("\n")
    .filter((line) => /^Quality (?:error|warning):/i.test(line))
    .slice(0, 4);
  const statusLabel =
    compileStatus === "success"
      ? "Ready"
      : compileStatus === "failed"
        ? "Failed"
        : isCompiling
          ? "Compiling"
          : "Waiting";

  return (
    <section className="min-h-0 bg-[#e5ebf3]">
      <PanelTitle>
        <div className="flex w-full items-center justify-between gap-3">
          <span>Visualization</span>
          <span
            className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
              compileStatus === "success"
                ? "bg-emerald-50 text-emerald-700"
                : compileStatus === "failed"
                  ? "bg-red-50 text-red-700"
                  : isCompiling
                    ? "bg-blue-50 text-blue-700"
                    : "bg-slate-100 text-slate-500"
            }`}
          >
            {statusLabel}
          </span>
        </div>
      </PanelTitle>
      <div className="m-3 h-[calc(100%-64px)] overflow-hidden rounded-2xl border border-slate-300/80 bg-[#d9e1ec] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.72),0_18px_42px_rgba(15,23,42,0.10)]">
        <div className="grid h-full place-items-center overflow-hidden rounded-xl border border-white/70 bg-[linear-gradient(135deg,#f8fafc_0%,#e9eef6_48%,#dfe7f1_100%)] p-5">
        {previewSrc ? (
          <iframe
            key={previewSrc}
            src={previewSrc}
            className="h-full w-full rounded-lg border-0 bg-white shadow-[0_18px_48px_rgba(15,23,42,0.18)]"
            sandbox="allow-scripts"
            title="Compiled preview"
          />
        ) : (
          <div className="w-[min(88%,980px)]">
              <div className="mb-3 flex items-center justify-between gap-3 rounded-xl border border-white/80 bg-white/85 px-3 py-2 text-xs shadow-sm backdrop-blur">
                <div className="min-w-0 truncate font-medium text-slate-600">
                {isFailed
                  ? "Compile failed before publishing a preview"
                  : isCompiling
                    ? "Building static HTML preview"
                    : "Preview will appear after compile"}
                </div>
                <div className="flex shrink-0 items-center gap-2 text-slate-500">
                  {isCompiling ? (
                  <span className="h-2 w-2 animate-pulse rounded-full bg-blue-600" />
                ) : null}
                <span>{statusLabel}</span>
              </div>
            </div>
            <div
              className="relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.16)]"
              style={{ aspectRatio: "16 / 9" }}
            >
              <div className="absolute inset-x-0 top-0 h-1.5 bg-slate-100">
                <div
                  className={`h-full bg-blue-600 transition-all duration-500 ${
                    isCompiling ? "w-2/3 animate-pulse" : "w-1/4"
                  }`}
                />
              </div>
              <div className="grid h-full grid-cols-[minmax(0,1fr)_32%] gap-8 p-[7%]">
                <div className="flex min-w-0 flex-col justify-center">
                  <div className="mb-5 h-6 w-36 rounded-full bg-slate-100" />
                  <h1 className="text-[clamp(28px,4vw,54px)] font-semibold leading-none tracking-normal text-slate-950">
                    {isFailed ? "Deck needs a repair pass" : projectTitle}
                  </h1>
                  <p className="mt-5 max-w-xl text-[clamp(14px,1.4vw,20px)] leading-7 text-slate-500">
                    {isFailed
                      ? "The quality gate stopped this compile so a broken HTML deck is not shared. Check the issues below or use the chat to repair the deck."
                      : isCompiling
                      ? "SlideLeaf is rendering the current workspace into a shareable HTML presentation."
                      : "Compile the workspace to render an interactive HTML presentation here."}
                  </p>
                  <div className="mt-8 grid max-w-lg grid-cols-3 gap-3">
                    {(isFailed ? ["Quality", "Repair", "Retry"] : ["Files", "Render", "Share"]).map((item, index) => (
                      <div key={item} className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-3">
                        <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                          Step {index + 1}
                        </div>
                        <div className="mt-1 text-sm font-semibold text-slate-700">{item}</div>
                      </div>
                    ))}
                  </div>
                  {qualityLines.length ? (
                    <div className="mt-5 max-w-xl rounded-xl border border-amber-100 bg-amber-50 px-4 py-3">
                      <div className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                        Quality issues
                      </div>
                      <ul className="mt-2 space-y-1 text-xs leading-5 text-amber-900">
                        {qualityLines.map((line, index) => (
                          <li key={`${line}-${index}`}>{line.replace(/^Quality (?:error|warning):\s*/i, "")}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                  {isFailed && canEdit ? (
                    <button
                      onClick={onRepairCompile}
                      disabled={repairRunning}
                      className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(15,23,42,0.18)] transition hover:bg-slate-800 disabled:opacity-40"
                    >
                      <Sparkles size={15} />
                      Repair with AI
                    </button>
                  ) : null}
                </div>
                <div className="hidden min-w-0 flex-col justify-center gap-3 md:flex">
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                    <div className="mb-3 h-3 w-20 rounded bg-slate-200" />
                    <div className="space-y-2">
                      <div className="h-2.5 rounded bg-slate-200" />
                      <div className="h-2.5 w-5/6 rounded bg-slate-200" />
                      <div className="h-2.5 w-2/3 rounded bg-slate-200" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="h-24 rounded-xl border border-slate-100 bg-slate-50" />
                    <div className="h-24 rounded-xl border border-slate-100 bg-slate-50" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </section>
  );
}

function ResizeHandle({ onMouseDown }: { onMouseDown: () => void }) {
  return (
    <button
      onMouseDown={onMouseDown}
      className="h-full cursor-col-resize border-x border-slate-200 bg-slate-200/70 transition hover:bg-blue-200"
      title="Drag to resize"
    />
  );
}

function TabButton({
  active,
  children,
  onClick
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex h-8 max-w-[360px] items-center gap-2 rounded-lg px-2 text-sm transition ${
        active ? "bg-white text-slate-950 shadow-sm ring-1 ring-slate-200" : "text-slate-600 hover:bg-slate-100"
      }`}
    >
      {children}
    </button>
  );
}

function StatusPill({ status }: { status?: CompileJob["status"] }) {
  if (!status) return null;
  const color =
    status === "success"
      ? "text-emerald-300"
      : status === "failed"
        ? "text-red-300"
        : "text-blue-300";
  return <span className={`text-xs ${color}`}>{status === "success" ? "Compiled" : status}</span>;
}

function roleLabel(role: ProjectRole): string {
  if (role === "owner") return "Owner";
  if (role === "editor") return "Edit";
  return "View";
}

function DiffLine({ line }: { line: DiffLineValue }) {
  return (
    <div
      className={
        line.type === "add"
          ? "text-emerald-700"
          : line.type === "remove"
            ? "text-red-700"
            : "text-slate-500"
      }
    >
      {line.type === "add" ? "+ " : line.type === "remove" ? "- " : "  "}
      {line.text || " "}
    </div>
  );
}

function ToolbarButton({
  children,
  label,
  primary,
  disabled,
  onClick
}: {
  children: React.ReactNode;
  label: string;
  primary?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={label}
      className={`inline-flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-medium transition disabled:opacity-50 ${
        primary
          ? "bg-blue-600 text-white shadow-[0_10px_24px_rgba(37,99,235,0.28)] hover:bg-blue-500"
          : "border border-white/15 bg-white/8 text-slate-100 hover:bg-white/12"
      }`}
    >
      {children}
      <span className="hidden lg:inline">{label}</span>
    </button>
  );
}

function PanelTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-[40px] items-center gap-2 border-b border-slate-200 bg-white/80 px-3 text-sm font-semibold text-slate-800">
      {children}
    </div>
  );
}

function sortWorkspaceFiles(files: ProjectFile[]): ProjectFile[] {
  return [...files].sort((a, b) => {
    const aFolderBias = a.kind === "folder" ? 0 : 1;
    const bFolderBias = b.kind === "folder" ? 0 : 1;
    return a.path.localeCompare(b.path) || aFolderBias - bFolderBias;
  });
}

function depthFor(filePath: string): number {
  return Math.max(0, filePath.split("/").length - 1);
}

function languageFor(filePath: string): string {
  const lower = filePath.toLowerCase();
  if (lower.endsWith(".md")) return "markdown";
  if (lower.endsWith(".css")) return "css";
  if (lower.endsWith(".json")) return "json";
  if (lower.endsWith(".html")) return "html";
  return "plaintext";
}

function defaultContentFor(filePath: string): string {
  if (filePath.endsWith(".html")) {
    return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>New Slide Deck</title>
</head>
<body>
  <main class="deck">
    <section class="slide active">
      <h1>New Slide Deck</h1>
    </section>
  </main>
</body>
</html>
`;
  }
  if (filePath.endsWith(".md")) {
    return `---\ntitle: New Slide\nlayout: default\n---\n\n# New Slide\n`;
  }
  if (filePath.endsWith(".json")) return "{\n  \n}\n";
  return "";
}

const WORKFLOW_STAGES: WorkflowStage[] = ["consultation", "visual_direction", "slide_plan", "generate"];

function artifactTypeForStage(stage: WorkflowStage): ArtifactType | null {
  if (stage === "consultation") return "brief";
  if (stage === "visual_direction") return "visual_direction";
  if (stage === "slide_plan") return "slide_plan";
  return null;
}

function latestArtifactForType(artifacts: AiArtifact[], type: ArtifactType, status?: string): AiArtifact | null {
  return (
    artifacts.find((artifact) => artifact.type === type && (!status || artifact.status === status)) ?? null
  );
}

function shouldShowStageAction(stage: WorkflowStage, artifacts: AiArtifact[]): boolean {
  if (stage === "generate") return Boolean(latestArtifactForType(artifacts, "slide_plan") || latestArtifactForType(artifacts, "brief"));
  const type = artifactTypeForStage(stage);
  return Boolean(type && latestArtifactForType(artifacts, type));
}

function stageLabel(stage: WorkflowStage): string {
  if (stage === "consultation") return "Understand the deck";
  if (stage === "visual_direction") return "Choose a visual direction";
  if (stage === "slide_plan") return "Review the deck plan";
  return "Create the HTML deck";
}

function shortStageLabel(stage: WorkflowStage): string {
  if (stage === "consultation") return "Clarify";
  if (stage === "visual_direction") return "Style";
  if (stage === "slide_plan") return "Plan";
  return "Create";
}

function stageDescription(stage: WorkflowStage): string {
  if (stage === "consultation") return "I will clarify the audience, goal, tone, constraints, and missing inputs.";
  if (stage === "visual_direction") return "Pick the look before generation so the final deck has a strong design point of view.";
  if (stage === "slide_plan") return "Review the storyline, action titles, layouts, and motion plan before HTML generation.";
  return "Generate editable workspace files from the approved direction and plan.";
}

function artifactLabel(type: string): string {
  if (type === "brief") return "Brief";
  if (type === "visual_direction") return "Style directions";
  return "Plan";
}

function artifactHelp(type: ArtifactType): string {
  if (type === "brief") return "Clarifies audience, goal, tone, constraints, and missing inputs.";
  if (type === "visual_direction") return "Shows several visual systems before the deck is generated.";
  return "Combines narrative logic, action titles, layouts, content blocks, and design notes.";
}

function workflowRunLabel(type: ArtifactType): string {
  if (type === "brief") return "Refining the brief";
  if (type === "visual_direction") return "Creating visual directions";
  return "Building the deck plan";
}

function asRecord(value: unknown): JsonRecord {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as JsonRecord) : {};
}

function BooleanRecord(value: JsonRecord): value is JsonRecord {
  return Object.keys(value).length > 0;
}

function textField(record: JsonRecord, key: string): string {
  return readableValue(record[key]);
}

function listField(record: JsonRecord, key: string): string[] {
  const value = record[key];
  if (Array.isArray(value)) return value.map(readableValue).filter(Boolean);
  const text = readableValue(value);
  return text ? [text] : [];
}

function readableValue(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) return value.map(readableValue).filter(Boolean).join(", ");
  if (value && typeof value === "object") {
    const record = value as JsonRecord;
    const type = readableValue(record.type);
    const text = readableValue(record.text) || readableValue(record.content) || readableValue(record.message);
    if (type && text) return `${type}: ${text}`;
    if (text) return text;
    return JSON.stringify(value);
  }
  return "";
}

function openHtmlPreview(html: string): void {
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const opened = window.open(url, "_blank", "noopener,noreferrer");

  if (!opened) {
    URL.revokeObjectURL(url);
    return;
  }

  window.setTimeout(() => URL.revokeObjectURL(url), 5 * 60 * 1000);
}

function meaningfulList(items: string[]): string[] {
  const emptyMarkers = new Set([
    "none",
    "no",
    "n/a",
    "na",
    "unknown",
    "not specified",
    "无",
    "无。",
    "没有",
    "暂无",
    "不需要",
    "无需",
    "无待确认"
  ]);

  return items.filter((item) => {
    const normalized = item.trim().toLowerCase();
    return normalized.length > 0 && !emptyMarkers.has(normalized);
  });
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
