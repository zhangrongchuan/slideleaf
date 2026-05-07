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
  X
} from "lucide-react";
import { BrandMark } from "./BrandMark";
import { API_URL, apiFetch } from "../lib/api";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

type Project = {
  id: string;
  title: string;
  description?: string | null;
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

type WorkflowStage = "consultation" | "slide_plan" | "generate";
type AiMode = "auto" | WorkflowStage;
type ArtifactType = "brief" | "slide_plan";

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
  const [lastAiPrompt, setLastAiPrompt] = useState("");
  const [workflowRun, setWorkflowRun] = useState<WorkflowRun | null>(null);
  const [aiTask, setAiTask] = useState<AiTask | null>(null);
  const [htmlGenerationRequested, setHtmlGenerationRequested] = useState(false);
  const [previewNonce, setPreviewNonce] = useState(0);
  const [activeTab, setActiveTab] = useState<CenterTab>("assistant");
  const [logOpen, setLogOpen] = useState(false);
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
    if (!aiInstruction.trim()) return;
    await submitAiByMode(aiInstruction.trim());
  }

  async function submitAiByMode(prompt: string) {
    const mode = aiMode === "auto" ? aiConversation?.stage ?? "consultation" : aiMode;
    if (mode === "consultation") {
      await generateWorkflowArtifact("brief", prompt);
      return;
    }
    if (mode === "slide_plan") {
      await generateWorkflowArtifact("slide_plan", prompt);
      return;
    }
    await submitAiPrompt(prompt);
  }

  async function submitAiPrompt(prompt: string, displayLabel?: string) {
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
          instruction: prompt
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
    const prompt = promptOverride?.trim() || aiInstruction.trim();
    const visiblePrompt = displayLabel || prompt || `Generate ${artifactLabel(type)}`;
    setError("");
    setAiInstruction("");
    setLastAiPrompt(visiblePrompt);
    setWorkflowRun({ type, label: workflowRunLabel(type) });
    setActiveTab("assistant");
    setNotice(`Generating ${artifactLabel(type)}...`);
    if (type === "slide_plan") setHtmlGenerationRequested(false);
    try {
      if (dirty) await saveFile();
      await apiFetch(`/projects/${projectId}/ai/workflow/artifacts`, {
        method: "POST",
        body: JSON.stringify({
          conversationId: aiConversation?.id,
          type,
          instruction: prompt || displayLabel || undefined
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
    if (htmlGenerationRequested || aiTask?.status === "running") return;
    setHtmlGenerationRequested(true);
    const customPrompt = aiInstruction.trim();
    const prompt =
      customPrompt ||
      "Generate the final standalone HTML deck from the current brief and plan. Return complete workspace files for review.";
    await submitAiPrompt(prompt, customPrompt ? undefined : "Generate HTML");
  }

  async function applyAiTask() {
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
          <ToolbarButton onClick={() => setLogOpen((value) => !value)} label="Compile Log">
            <Logs size={16} />
          </ToolbarButton>
          <ToolbarButton onClick={saveFile} disabled={!dirty || activeTab !== "file"} label="Save">
            <Save size={16} />
          </ToolbarButton>
          <ToolbarButton onClick={() => void compile()} primary label="Compile HTML">
            <Play size={16} />
          </ToolbarButton>
          {/* Snapshot is reserved for version history/restore UI in a later pass. */}
          {/* <ToolbarButton onClick={createSnapshot} label="Snapshot">
            <History size={16} />
          </ToolbarButton> */}
          <ToolbarButton onClick={() => uploadRef.current?.click()} label="Upload asset">
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
              lastPrompt={lastAiPrompt}
              workflowRun={workflowRun}
              task={aiTask}
              htmlGenerationRequested={htmlGenerationRequested}
              error={error}
              onInstructionChange={setAiInstruction}
              onModeChange={setAiMode}
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
        />
      </section>
    </main>
  );
}

function FilesPane({
  files,
  selectedFileId,
  newKind,
  newPath,
  onNewKindChange,
  onNewPathChange,
  onCreate,
  onOpen
}: {
  files: ProjectFile[];
  selectedFileId: string;
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
            onChange={(event) => onNewKindChange(event.target.value as "file" | "folder")}
            className="h-9 w-24 rounded-lg border border-slate-300 bg-white px-2 text-xs text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          >
            <option value="file">File</option>
            <option value="folder">Folder</option>
          </select>
          <input
            value={newPath}
            onChange={(event) => onNewPathChange(event.target.value)}
            className="h-9 min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-2 text-xs outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          />
          <button className="grid h-9 w-9 place-items-center rounded-lg border border-slate-300 bg-white text-slate-700 transition hover:border-blue-300 hover:text-blue-700" title="Create">
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
  lastPrompt,
  workflowRun,
  task,
  htmlGenerationRequested,
  error,
  onInstructionChange,
  onModeChange,
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
  lastPrompt: string;
  workflowRun: WorkflowRun | null;
  task: AiTask | null;
  htmlGenerationRequested: boolean;
  error: string;
  onInstructionChange: (value: string) => void;
  onModeChange: (value: AiMode) => void;
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
    <section className="grid h-[calc(100%-44px)] grid-rows-[46px_minmax(0,1fr)_auto] bg-[#eef2f7]">
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

      <div className="min-h-0 overflow-auto px-4 py-6">
        <div className="mx-auto flex max-w-3xl flex-col gap-4">
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
                    : "I am turning the brief into narrative structure, slide logic, and layout choices."
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
                    <button onClick={onApply} className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-3 py-1.5 text-sm text-white">
                      <Check size={15} />
                      Apply
                    </button>
                    <button onClick={onReject} className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-3 py-1.5 text-sm">
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

      <div className="border-t border-slate-200 bg-white/95 px-4 py-4 shadow-[0_-16px_40px_rgba(15,23,42,0.06)]">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-xl border border-slate-300 bg-white p-2 shadow-[0_16px_40px_rgba(15,23,42,0.10)] transition focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100">
            <textarea
              value={instruction}
              onChange={(event) => onInstructionChange(event.target.value)}
              onKeyDown={(event) => {
                if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
                  event.preventDefault();
                  onAsk();
                }
              }}
              rows={3}
              className="block max-h-40 min-h-[78px] w-full resize-none border-0 bg-transparent px-2 py-2 text-sm leading-6 text-slate-900 outline-none placeholder:text-slate-400"
              placeholder="Ask SlideLeaf to generate or revise the deck..."
            />
            <div className="flex items-center justify-between gap-2 px-1 pt-1">
              <div className="flex min-w-0 items-center gap-2">
                <ModePicker value={mode} onChange={onModeChange} />
                <div className="truncate text-xs text-slate-400">
                  {mode === "auto" ? `Auto uses ${stageLabel(conversation?.stage ?? "consultation")}` : stageLabel(mode)}
                </div>
              </div>
              <button
                onClick={onAsk}
                disabled={!hasPrompt || busy}
                className="inline-flex h-9 shrink-0 items-center gap-2 rounded-lg bg-slate-950 px-3 text-sm font-semibold text-white shadow-[0_10px_22px_rgba(15,23,42,0.18)] transition hover:bg-slate-800 disabled:opacity-40"
              >
                <Send size={15} />
                Send
              </button>
            </div>
          </div>
          <div className="mt-2 text-center text-[11px] text-slate-400">
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
    { value: "consultation", label: "Consultation", description: "Clarify goal and constraints" },
    { value: "slide_plan", label: "Plan", description: "Narrative and layout plan" },
    { value: "generate", label: "Agent", description: "Generate workspace files" }
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
          <div className="text-sm font-semibold text-slate-950">What should this presentation become?</div>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            Describe the topic, audience, tone, slide count, and visual style. I will clarify, plan, then generate files for review.
          </p>
        </div>
        <div className="grid gap-2 text-sm sm:grid-cols-2">
          <ExamplePrompt text="Make a 6-slide classroom deck about photosynthesis with a clean science style." />
          <ExamplePrompt text="Create a dramatic story deck about The Little Prince, with navigation and progress." />
        </div>
      </div>
    </ChatBubble>
  );
}

function StageActionCard({
  stage,
  artifacts,
  running,
  htmlGenerationRequested,
  onGenerateArtifact,
  onGenerateHtml
}: {
  stage: WorkflowStage;
  artifacts: AiArtifact[];
  running: boolean;
  htmlGenerationRequested: boolean;
  onGenerateArtifact: (type: ArtifactType, promptOverride?: string, displayLabel?: string) => void;
  onGenerateHtml: () => void;
}) {
  const artifactType = artifactTypeForStage(stage);
  const currentArtifact = artifactType ? latestArtifactForType(artifacts, artifactType) : null;

  return (
    <ChatBubble role="assistant">
      <div className="w-full max-w-[42rem] space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-slate-950">{stageLabel(stage)} mode</div>
            <div className="mt-1 text-xs text-slate-500">{stageDescription(stage)}</div>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
        {stage === "generate" ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-slate-950">Generate HTML from current plan</div>
              <p className="mt-1 text-xs leading-5 text-slate-600">
                The agent will use the latest brief and plan as source of truth, then return files for review.
              </p>
            </div>
            {!htmlGenerationRequested && !running ? (
              <button
                  onClick={onGenerateHtml}
                  className="inline-flex h-9 items-center gap-2 rounded-lg bg-slate-950 px-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                <Sparkles size={15} />
                Generate HTML
              </button>
            ) : null}
          </div>
        ) : artifactType ? (
          <div className="space-y-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-slate-950">{artifactLabel(artifactType)}</div>
                <p className="mt-1 text-xs leading-5 text-slate-600">{artifactHelp(artifactType)}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    onGenerateArtifact(
                      artifactType,
                      undefined,
                      currentArtifact ? `Refine ${artifactLabel(artifactType)}` : `Generate ${artifactLabel(artifactType)}`
                    )
                  }
                  disabled={running}
                  className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2.5 text-sm text-slate-700 transition hover:bg-slate-50 disabled:opacity-40"
                >
                  <Sparkles size={14} />
                  {currentArtifact ? `Refine ${artifactLabel(artifactType)}` : `Generate ${artifactLabel(artifactType)}`}
                </button>
              </div>
            </div>

            {currentArtifact ? (
              <ArtifactPreview
                artifact={currentArtifact}
                running={running}
                onStartPlan={() =>
                  onGenerateArtifact(
                    "slide_plan",
                    "Start Plan from the current consultation brief.",
                    "Start Plan"
                  )
                }
                onGenerateHtml={onGenerateHtml}
                htmlGenerationRequested={htmlGenerationRequested}
              />
            ) : (
              <div className="rounded-lg border border-dashed border-slate-300 bg-white p-3 text-xs text-slate-500">
                No {artifactLabel(artifactType).toLowerCase()} yet. Generate this stage and continue the conversation.
              </div>
            )}
          </div>
        ) : null}
      </div>
      </div>
    </ChatBubble>
  );
}

function ArtifactPreview({
  artifact,
  running,
  onStartPlan,
  onGenerateHtml,
  htmlGenerationRequested
}: {
  artifact: AiArtifact;
  running: boolean;
  onStartPlan: () => void;
  onGenerateHtml: () => void;
  htmlGenerationRequested: boolean;
}) {
  if (artifact.type === "brief") {
    return <BriefArtifact artifact={artifact} running={running} onStartPlan={onStartPlan} />;
  }
  if (artifact.type === "slide_plan") {
    return (
      <PlanArtifact
        artifact={artifact}
        running={running}
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
  onStartPlan
}: {
  artifact: AiArtifact;
  running: boolean;
  onStartPlan: () => void;
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

      {readyForPlan ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-3">
          <div>
            <div className="text-sm font-semibold text-emerald-950">Brief is clear enough to plan</div>
            <p className="mt-1 text-xs leading-5 text-emerald-800">
              Start the next step to turn this brief into slide structure, action titles, and layouts.
            </p>
          </div>
          <button
            onClick={onStartPlan}
            disabled={running}
            className="inline-flex h-9 items-center gap-2 rounded-lg bg-emerald-700 px-3 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:opacity-50"
          >
            <Sparkles size={15} />
            Start Plan
          </button>
        </div>
      ) : null}
    </div>
  );
}

function PlanArtifact({
  artifact,
  running,
  htmlGenerationRequested,
  onGenerateHtml
}: {
  artifact: AiArtifact;
  running: boolean;
  htmlGenerationRequested: boolean;
  onGenerateHtml: () => void;
}) {
  const data = asRecord(artifact.contentJson);
  const slides = Array.isArray(data.slides) ? data.slides.map(asRecord).filter(BooleanRecord) : [];

  return (
    <div className="space-y-3 rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-semibold text-slate-950">Deck plan</div>
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

      {textField(data, "designDirection") ? (
        <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Design direction</div>
          <p className="mt-1 text-sm leading-6 text-slate-700">{textField(data, "designDirection")}</p>
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

      {!htmlGenerationRequested && !running ? (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-blue-100 bg-blue-50 px-3 py-3">
        <div>
          <div className="text-sm font-semibold text-blue-950">Plan is ready for generation</div>
          <p className="mt-1 text-xs leading-5 text-blue-800">
            Generate editable HTML workspace files from this plan.
          </p>
        </div>
        <button
          onClick={onGenerateHtml}
          disabled={running}
          className="inline-flex h-9 items-center gap-2 rounded-lg bg-slate-950 px-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
        >
          <Sparkles size={15} />
          Generate HTML
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
  const contentBlocks = Array.isArray(slide.contentBlocks)
    ? slide.contentBlocks.map(readableValue).filter(Boolean)
    : [];
  const designNotes = asRecord(slide.designNotes);

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-slate-950 text-xs font-semibold text-white">
          {index}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold leading-5 text-slate-950">{actionTitle}</div>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {layout ? <Tag>{layout}</Tag> : null}
            {pattern ? <Tag>{pattern}</Tag> : null}
          </div>
          {message ? <p className="mt-2 text-sm leading-6 text-slate-600">{message}</p> : null}
          <ArtifactList title="Supporting points" items={listField(slide, "supportingPoints")} compact />
          <ArtifactList title="Evidence needed" items={listField(slide, "evidenceNeeded")} compact tone="amber" />
          <ArtifactList title="Content blocks" items={contentBlocks} compact />
          {textField(designNotes, "mood") ? (
            <p className="mt-2 text-xs leading-5 text-slate-500">Mood: {textField(designNotes, "mood")}</p>
          ) : null}
          <ArtifactList title="Avoid" items={listField(designNotes, "avoid")} compact tone="red" />
        </div>
      </div>
    </article>
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
  onContentChange,
  onSave,
  onRename,
  onDelete
}: {
  file: ProjectFile;
  content: string;
  dirty: boolean;
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
          <button onClick={onSave} disabled={!dirty || file.kind !== "file" || file.isBinary} className="rounded-md border border-slate-300 bg-white px-2 py-0.5 text-xs transition hover:bg-slate-50 disabled:opacity-50">
            Save
          </button>
          <button onClick={onRename} className="rounded-md border border-slate-300 bg-white px-2 py-0.5 text-xs transition hover:bg-slate-50">
            Rename
          </button>
          <button onClick={onDelete} className="rounded-md border border-red-100 bg-red-50 px-2 py-0.5 text-xs text-red-700 transition hover:bg-red-100">
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
            scrollBeyondLastLine: false
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
  compileStatus
}: {
  previewSrc: string;
  projectTitle: string;
  compileStatus?: CompileJob["status"];
}) {
  const isCompiling = compileStatus === "queued" || compileStatus === "running";
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
                {isCompiling ? "Building static HTML preview" : "Preview will appear after compile"}
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
                    {projectTitle}
                  </h1>
                  <p className="mt-5 max-w-xl text-[clamp(14px,1.4vw,20px)] leading-7 text-slate-500">
                    {isCompiling
                      ? "SlideLeaf is rendering the current workspace into a shareable HTML presentation."
                      : "Compile the workspace to render an interactive HTML presentation here."}
                  </p>
                  <div className="mt-8 grid max-w-lg grid-cols-3 gap-3">
                    {["Files", "Render", "Share"].map((item, index) => (
                      <div key={item} className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-3">
                        <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                          Step {index + 1}
                        </div>
                        <div className="mt-1 text-sm font-semibold text-slate-700">{item}</div>
                      </div>
                    ))}
                  </div>
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

const WORKFLOW_STAGES: WorkflowStage[] = ["consultation", "slide_plan", "generate"];

function artifactTypeForStage(stage: WorkflowStage): ArtifactType | null {
  if (stage === "consultation") return "brief";
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
  if (stage === "consultation") return "Consultation";
  if (stage === "slide_plan") return "Plan";
  return "Generate";
}

function stageDescription(stage: WorkflowStage): string {
  if (stage === "consultation") return "Clarify goals";
  if (stage === "slide_plan") return "Narrative + layouts";
  return "HTML files";
}

function artifactLabel(type: string): string {
  if (type === "brief") return "Brief";
  return "Plan";
}

function artifactHelp(type: ArtifactType): string {
  if (type === "brief") return "Clarifies audience, goal, tone, constraints, and missing inputs.";
  return "Combines narrative logic, action titles, layouts, content blocks, and design notes.";
}

function workflowRunLabel(type: ArtifactType): string {
  return type === "brief" ? "Refining consultation brief" : "Building deck plan";
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
