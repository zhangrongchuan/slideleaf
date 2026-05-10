"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  Bot,
  Check,
  CheckCircle2,
  ChevronDown,
  Coins,
  Download,
  Clock3,
  FileCode2,
  FileText,
  FilePlus2,
  Folder,
  FolderPlus,
  History,
  Loader2,
  Logs,
  Play,
  Save,
  Send,
  Share2,
  Sparkles,
  Trash2,
  Users,
  X
} from "lucide-react";
import { BrandMark } from "./BrandMark";
import { API_URL, apiFetch } from "../lib/api";
import {
  aiProviderRequestPayload,
  isLocalAiProviderValue,
  loadLocalAiProviders,
  localProviderDisplayName,
  parseLocalProviderValue,
  type AiProviderValue,
  type AiProviderRequestPayload,
  type LocalAiProviderConfig
} from "../lib/localAiProviders";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

type Project = {
  id: string;
  title: string;
  description?: string | null;
  currentUserRole?: ProjectRole;
};

type CurrentUser = {
  id: string;
  email: string;
  name: string | null;
  credits: number;
  creditsMilli: number;
};

type ProjectRole = "owner" | "editor" | "viewer";
type AiProvider = AiProviderValue;
type DeckTextDensity = "concise" | "balanced" | "dense";

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
  prompt?: string | null;
  log?: string | null;
  diffJson?: {
    summary?: string;
    files?: Array<{
      path: string;
      action?: "create" | "update" | "delete";
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
type PendingChatEntry = {
  id: string;
  prompt: string;
  displayText?: string;
  title: string;
  description: string;
  status: "running" | "failed";
  error?: string;
  taskId?: string;
};
type SubmitAction =
  | { kind: "artifact"; type: ArtifactType }
  | { kind: "edit" };

const LEFT_MIN_WIDTH = 210;
const LEFT_MAX_WIDTH = 420;
const CENTER_MIN_WIDTH = 420;
const CENTER_MAX_WIDTH = 900;
const PREVIEW_MIN_WIDTH = 360;
const RESIZE_HANDLE_WIDTH = 6;
const WORKSPACE_STACK_BREAKPOINT = 1050;

type AiWorkflowResponse = {
  conversation: AiConversation;
  messages: AiMessage[];
  artifacts: AiArtifact[];
  tasks?: AiTask[];
};

export function WorkspaceClient({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [selectedFileId, setSelectedFileId] = useState("");
  const [content, setContent] = useState("");
  const [dirty, setDirty] = useState(false);
  const [aiError, setAiError] = useState("");
  const [operationError, setOperationError] = useState("");
  const [membersError, setMembersError] = useState("");
  const [notice, setNotice] = useState("");
  const [newPath, setNewPath] = useState("slides/04-new-slide.html");
  const [newKind, setNewKind] = useState<"file" | "folder">("file");
  const [compileJob, setCompileJob] = useState<CompileJob | null>(null);
  const [aiConversation, setAiConversation] = useState<AiConversation | null>(null);
  const [aiMessages, setAiMessages] = useState<AiMessage[]>([]);
  const [aiArtifacts, setAiArtifacts] = useState<AiArtifact[]>([]);
  const [aiInstruction, setAiInstruction] = useState("");
  const [aiMode, setAiMode] = useState<AiMode>("auto");
  const [aiProvider, setAiProvider] = useState<AiProvider>("deepseek");
  const [localAiProviders, setLocalAiProviders] = useState<LocalAiProviderConfig[]>([]);
  const [deckTextDensity, setDeckTextDensity] = useState<DeckTextDensity>("balanced");
  const [lastAiPrompt, setLastAiPrompt] = useState("");
  const [pendingChatEntries, setPendingChatEntries] = useState<PendingChatEntry[]>([]);
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
  const [workspaceWidth, setWorkspaceWidth] = useState(0);
  const workspaceMainRef = useRef<HTMLElement>(null);
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
  const latestRunArtifact = useMemo(() => latestGenerationRun(aiArtifacts), [aiArtifacts]);
  const latestRunStatus = latestRunArtifact ? textField(asRecord(latestRunArtifact.contentJson), "status") || latestRunArtifact.status : "";
  const latestWorkflowArtifact = useMemo(() => latestRunningWorkflowArtifact(aiArtifacts), [aiArtifacts]);
  const aiRequestInFlight =
    Boolean(workflowRun) ||
    aiTask?.status === "running" ||
    latestRunStatus === "running" ||
    Boolean(latestWorkflowArtifact) ||
    pendingChatEntries.some((entry) => entry.status === "running");
  const workspaceIsStacked = workspaceWidth > 0 && workspaceWidth <= WORKSPACE_STACK_BREAKPOINT;
  const maxLeftWidth = useMemo(() => {
    if (!workspaceWidth || workspaceIsStacked) return LEFT_MAX_WIDTH;
    return Math.max(
      LEFT_MIN_WIDTH,
      Math.min(
        LEFT_MAX_WIDTH,
        workspaceWidth - CENTER_MIN_WIDTH - PREVIEW_MIN_WIDTH - RESIZE_HANDLE_WIDTH * 2
      )
    );
  }, [workspaceIsStacked, workspaceWidth]);
  const maxCenterWidth = useMemo(() => {
    if (!workspaceWidth || workspaceIsStacked) return CENTER_MAX_WIDTH;
    const boundedLeftWidth = Math.min(leftWidth, maxLeftWidth);
    return Math.max(
      CENTER_MIN_WIDTH,
      Math.min(
        CENTER_MAX_WIDTH,
        workspaceWidth - boundedLeftWidth - PREVIEW_MIN_WIDTH - RESIZE_HANDLE_WIDTH * 2
      )
    );
  }, [leftWidth, maxLeftWidth, workspaceIsStacked, workspaceWidth]);
  const effectiveLeftWidth = Math.min(leftWidth, maxLeftWidth);
  const effectiveCenterWidth = Math.min(centerWidth, maxCenterWidth);
  const workspaceGridColumns = workspaceIsStacked
    ? "1fr"
    : `${effectiveLeftWidth}px ${RESIZE_HANDLE_WIDTH}px ${effectiveCenterWidth}px ${RESIZE_HANDLE_WIDTH}px minmax(${PREVIEW_MIN_WIDTH}px, 1fr)`;
  const shouldPollAi = aiRequestInFlight;

  useEffect(() => {
    void loadProject();
  }, [projectId]);

  useEffect(() => {
    const refreshLocalProviders = () => setLocalAiProviders(loadLocalAiProviders());
    refreshLocalProviders();
    window.addEventListener("storage", refreshLocalProviders);
    window.addEventListener("focus", refreshLocalProviders);
    return () => {
      window.removeEventListener("storage", refreshLocalProviders);
      window.removeEventListener("focus", refreshLocalProviders);
    };
  }, []);

  useEffect(() => {
    if (!isLocalAiProviderValue(aiProvider)) return;
    const parsed = parseLocalProviderValue(aiProvider);
    if (!localAiProviders.some((provider) => provider.id === parsed.id)) {
      setAiProvider("deepseek");
    }
  }, [aiProvider, localAiProviders]);

  useEffect(() => {
    if (!shouldPollAi) return;
    const interval = window.setInterval(() => {
      void loadAiWorkflow().catch((err) => setOperationError(err instanceof Error ? err.message : String(err)));
    }, 1800);
    return () => window.clearInterval(interval);
  }, [shouldPollAi, projectId]);

  useEffect(() => {
    setPendingChatEntries((current) =>
      current.filter((entry) => !isPendingEntrySaved(entry, aiMessages))
    );
  }, [aiMessages]);

  useEffect(() => {
    if (!notice && !operationError) return;
    const timeout = window.setTimeout(() => {
      setNotice("");
      setOperationError("");
    }, operationError ? 7000 : 3600);
    return () => window.clearTimeout(timeout);
  }, [notice, operationError]);

  useEffect(() => {
    if (selectedFile && selectedFile.kind === "file" && !selectedFile.isBinary) {
      setContent(selectedFile.contentText ?? "");
      setDirty(false);
    }
  }, [selectedFile?.id]);

  useEffect(() => {
    const node = workspaceMainRef.current;
    if (!node) return;

    const updateWorkspaceWidth = () => {
      setWorkspaceWidth(node.getBoundingClientRect().width);
    };

    updateWorkspaceWidth();
    window.addEventListener("resize", updateWorkspaceWidth);

    if (typeof ResizeObserver === "undefined") {
      return () => window.removeEventListener("resize", updateWorkspaceWidth);
    }

    const observer = new ResizeObserver(updateWorkspaceWidth);
    observer.observe(node);

    return () => {
      window.removeEventListener("resize", updateWorkspaceWidth);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!workspaceWidth || workspaceIsStacked) return;
    setLeftWidth((value) => Math.min(value, maxLeftWidth));
    setCenterWidth((value) => Math.min(value, maxCenterWidth));
  }, [maxCenterWidth, maxLeftWidth, workspaceIsStacked, workspaceWidth]);

  useEffect(() => {
    if (!dragTarget) return;

    const onMove = (event: MouseEvent) => {
      const workspaceLeft = workspaceMainRef.current?.getBoundingClientRect().left ?? 0;
      const pointerX = event.clientX - workspaceLeft;
      if (dragTarget === "left") {
        setLeftWidth(clamp(pointerX, LEFT_MIN_WIDTH, maxLeftWidth));
      } else {
        setCenterWidth(clamp(pointerX - effectiveLeftWidth - RESIZE_HANDLE_WIDTH, CENTER_MIN_WIDTH, maxCenterWidth));
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
  }, [dragTarget, effectiveLeftWidth, maxCenterWidth, maxLeftWidth]);

  async function loadProject() {
    setOperationError("");
    try {
      const [projectData, filesData, aiData, meData] = await Promise.all([
        apiFetch<{ project: Project }>(`/projects/${projectId}`),
        apiFetch<{ files: ProjectFile[] }>(`/projects/${projectId}/files`),
        apiFetch<AiWorkflowResponse>(`/projects/${projectId}/ai/workflow`),
        apiFetch<{ user: CurrentUser }>("/auth/me")
      ]);
      setProject(projectData.project);
      setCurrentUser(meData.user);
      setFiles(filesData.files);
      setAiConversation(aiData.conversation);
      setAiMessages(aiData.messages);
      setAiArtifacts(aiData.artifacts);
      restoreAiTaskFromWorkflow(aiData.tasks, aiData.artifacts);
      reconcilePendingChatEntries(aiData.messages, aiData.tasks);
      setActiveTab("assistant");

      if (!autoCompileStartedRef.current) {
        autoCompileStartedRef.current = true;
        window.setTimeout(() => {
          void compile({ auto: true });
        }, 200);
      }
    } catch (err) {
      const message = errorMessage(err);
      setOperationError(message);
    }
  }

  async function reloadFiles(selectFileId = selectedFileId) {
    const data = await apiFetch<{ files: ProjectFile[] }>(`/projects/${projectId}/files`);
    setFiles(data.files);
    setSelectedFileId(selectFileId);
  }

  async function loadAiWorkflow() {
    const [data, meData] = await Promise.all([
      apiFetch<AiWorkflowResponse>(`/projects/${projectId}/ai/workflow`),
      apiFetch<{ user: CurrentUser }>("/auth/me")
    ]);
    setCurrentUser(meData.user);
    setAiConversation(data.conversation);
    setAiMessages(data.messages);
    setAiArtifacts(data.artifacts);
    restoreAiTaskFromWorkflow(data.tasks, data.artifacts);
    reconcilePendingChatEntries(data.messages, data.tasks);
  }

  function restoreAiTaskFromWorkflow(tasks: AiTask[] | undefined, artifacts: AiArtifact[]) {
    const restorable = selectRestorableTask(tasks ?? [], artifacts);
    if (restorable) {
      setAiTask(restorable);
    } else {
      setAiTask((current) => (current?.status === "running" || current?.status === "failed" ? null : current));
    }
    const generationRun = latestGenerationRun(artifacts);
    if (generationRun) {
      const runStatus = textField(asRecord(generationRun.contentJson), "status") || generationRun.status;
      if (runStatus === "running" || runStatus === "needs_review") setHtmlGenerationRequested(true);
    }
    if (!restorable || restorable.status !== "running") {
      setLastAiPrompt("");
      setWorkflowRun(null);
    }
  }

  function reconcilePendingChatEntries(messages: AiMessage[], tasks?: AiTask[]) {
    const activeTaskIds = new Set((tasks ?? []).map((task) => task.id));
    setPendingChatEntries((current) =>
      current.filter((entry) => {
        if (isPendingEntrySaved(entry, messages)) return false;
        if (entry.taskId && !activeTaskIds.has(entry.taskId)) return false;
        return true;
      })
    );
  }

  function enqueuePendingChatEntry(prompt: string, title: string, description: string, displayText?: string): string {
    const id = `pending-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    setPendingChatEntries((current) => [
      ...current,
      {
        id,
        prompt,
        displayText,
        title,
        description,
        status: "running"
      }
    ]);
    return id;
  }

  function attachPendingTask(entryId: string, task?: AiTask | null) {
    if (!task?.id) return;
    setPendingChatEntries((current) =>
      current.map((entry) => (entry.id === entryId ? { ...entry, taskId: task.id } : entry))
    );
  }

  function failPendingChatEntry(entryId: string, error: string) {
    setPendingChatEntries((current) =>
      current.map((entry) =>
        entry.id === entryId
          ? {
              ...entry,
              status: "failed",
              title: "Request failed",
              description: error,
              error
            }
          : entry
      )
    );
  }

  async function loadMembers() {
    const data = await apiFetch<{ members: ProjectMember[] }>(`/projects/${projectId}/members`);
    setMembers(data.members);
  }

  async function openMembersPanel() {
    setMembersOpen((value) => !value);
    if (!membersOpen) {
      setMembersError("");
      await loadMembers().catch((err) => setMembersError(errorMessage(err)));
    }
  }

  async function inviteMember(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isOwner || !inviteEmail.trim()) return;
    setMembersError("");
    try {
      await apiFetch<{ member: ProjectMember }>(`/projects/${projectId}/members`, {
        method: "POST",
        body: JSON.stringify({ email: inviteEmail, role: inviteRole })
      });
      setInviteEmail("");
      await loadMembers();
      setNotice("Member invited");
    } catch (err) {
      setMembersError(errorMessage(err));
    }
  }

  async function changeMemberRole(memberId: string, role: ProjectRole) {
    if (!isOwner) return;
    setMembersError("");
    try {
      await apiFetch<{ member: ProjectMember }>(`/projects/${projectId}/members/${memberId}`, {
        method: "PATCH",
        body: JSON.stringify({ role })
      });
      await loadMembers();
      setNotice("Member role updated");
    } catch (err) {
      setMembersError(errorMessage(err));
    }
  }

  async function removeMember(member: ProjectMember) {
    if (!isOwner) return;
    if (!window.confirm(`Remove ${member.user.email} from this project?`)) return;
    setMembersError("");
    try {
      await apiFetch(`/projects/${projectId}/members/${member.id}`, { method: "DELETE" });
      await loadMembers();
      setNotice("Member removed");
    } catch (err) {
      setMembersError(errorMessage(err));
    }
  }

  async function leaveProject() {
    if (currentRole === "owner") return;
    if (!window.confirm(`Leave "${project?.title ?? "this project"}"? You will lose access unless an owner invites you again.`)) return;
    setMembersError("");
    try {
      await apiFetch(`/projects/${projectId}/leave`, { method: "POST" });
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setMembersError(errorMessage(err));
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
    setOperationError("");
    const data = await apiFetch<{ file: ProjectFile }>(`/projects/${projectId}/files/${selectedFile.id}`, {
      method: "PATCH",
      body: JSON.stringify({ contentText: content })
    }).catch((err) => {
      setOperationError(errorMessage(err));
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
    setOperationError("");
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
      setOperationError(errorMessage(err));
    }
  }

  async function renameSelected() {
    if (!canEdit) return;
    if (!selectedFile) return;
    const nextPath = window.prompt("New workspace path", selectedFile.path);
    if (!nextPath || nextPath === selectedFile.path) return;
    setOperationError("");
    try {
      const data = await apiFetch<{ file: ProjectFile }>(`/projects/${projectId}/files/${selectedFile.id}`, {
        method: "PATCH",
        body: JSON.stringify({ path: nextPath })
      });
      await reloadFiles(data.file.id);
      setNotice("Renamed");
    } catch (err) {
      setOperationError(errorMessage(err));
    }
  }

  async function deleteSelected() {
    if (!canEdit) return;
    if (!selectedFile) return;
    if (!window.confirm(`Delete ${selectedFile.path}?`)) return;
    setOperationError("");
    try {
      await apiFetch(`/projects/${projectId}/files/${selectedFile.id}`, { method: "DELETE" });
      setSelectedFileId("");
      setActiveTab("assistant");
      await reloadFiles("");
      setNotice("Deleted");
    } catch (err) {
      setOperationError(errorMessage(err));
    }
  }

  async function uploadAsset(fileList: FileList | null) {
    if (!canEdit) return;
    const file = fileList?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    setOperationError("");
    try {
      const data = await apiFetch<{ file: ProjectFile }>(`/projects/${projectId}/assets`, {
        method: "POST",
        body: formData
      });
      await reloadFiles(data.file.id);
      setNotice("Asset uploaded");
    } catch (err) {
      setOperationError(errorMessage(err));
    } finally {
      if (uploadRef.current) uploadRef.current.value = "";
    }
  }

  async function compile(options: { auto?: boolean } = {}) {
    if (dirty) await saveFile();
    setOperationError("");
    setNotice(options.auto ? "" : "Compiling current project...");
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
          // if (data.job.status === "success") {
          //   setPreviewNonce(Date.now());
          //   setNotice(options.auto ? "Compiled current project" : "Compiled");
          // }
          break;
        }
      }
    } catch (err) {
      setOperationError(errorMessage(err));
    }
  }

  async function createSnapshot() {
    setOperationError("");
    try {
      await apiFetch(`/projects/${projectId}/versions`, {
        method: "POST",
        body: JSON.stringify({ message: `Manual snapshot ${new Date().toLocaleString()}` })
      });
      setNotice("Snapshot saved");
    } catch (err) {
      setOperationError(errorMessage(err));
    }
  }

  async function requestAiEdit() {
    if (!canEdit) return;
    if (aiRequestInFlight) return;
    if (!aiInstruction.trim()) return;
    const prompt = aiInstruction.trim();
    const action = resolveSubmitAction(aiMode, aiConversation?.stage);
    if (action.kind === "artifact") {
      await generateWorkflowArtifact(action.type, prompt);
      return;
    }
    await submitAiPrompt(prompt);
  }

  async function submitAiPrompt(prompt: string, displayLabel?: string) {
    if (!canEdit) return;
    if (aiRequestInFlight) return;
    const previousTask = aiTask;
    const pendingEntryId = enqueuePendingChatEntry(
      prompt,
      "Refining the deck",
      "I am reading the current workspace and preparing a reviewable response. The result will appear here when it is ready.",
      displayLabel
    );
    setAiError("");
    setLastAiPrompt(displayLabel || prompt);
    setAiInstruction("");
    setAiTask({ id: "pending", status: "running" });
    setActiveTab("assistant");
    try {
      if (dirty) await saveFile();
      const providerPayload = requireAiProviderPayload(aiProvider, localAiProviders);
      const data = await apiFetch<{ task: AiTask }>(`/projects/${projectId}/ai/edit-file`, {
        method: "POST",
        body: JSON.stringify({
          conversationId: aiConversation?.id,
          clientRequestId: pendingEntryId,
          fileId: selectedFile?.kind === "file" && !selectedFile.isBinary ? selectedFile.id : undefined,
          instruction: prompt,
          ...providerPayload,
          density: deckTextDensity
        })
      });
      setAiTask(data.task);
      attachPendingTask(pendingEntryId, data.task);
      await loadAiWorkflow();
      if (data.task.status !== "running") {
        setLastAiPrompt("");
      }
    } catch (err) {
      const message = errorMessage(err);
      setAiError(message);
      failPendingChatEntry(pendingEntryId, message);
      setAiTask(previousTask?.status === "needs_review" ? previousTask : null);
    }
  }

  async function generateWorkflowArtifact(type: ArtifactType, promptOverride?: string, displayLabel?: string) {
    if (!canEdit) return;
    if (aiRequestInFlight) return;
    const prompt = promptOverride?.trim() || aiInstruction.trim();
    const visiblePrompt = displayLabel || prompt || `Generate ${artifactLabel(type)}`;
    const pendingEntryId = enqueuePendingChatEntry(
      prompt || visiblePrompt,
      workflowRunLabel(type),
      workflowRunDescription(type),
      visiblePrompt
    );
    setAiError("");
    setAiInstruction("");
    setLastAiPrompt(visiblePrompt);
    setWorkflowRun({ type, label: workflowRunLabel(type) });
    setActiveTab("assistant");
    setNotice(`Generating ${artifactLabel(type)}...`);
    if (type === "visual_direction" || type === "slide_plan") setHtmlGenerationRequested(false);
    try {
      if (dirty) await saveFile();
      const providerPayload = requireAiProviderPayload(aiProvider, localAiProviders);
      const data = await apiFetch<{ artifact?: AiArtifact; task?: AiTask }>(`/projects/${projectId}/ai/workflow/artifacts`, {
        method: "POST",
        body: JSON.stringify({
          conversationId: aiConversation?.id,
          clientRequestId: pendingEntryId,
          type,
          instruction: prompt || displayLabel || undefined,
          ...providerPayload,
          density: deckTextDensity
        })
      });
      if (data.task) setAiTask(data.task);
      attachPendingTask(pendingEntryId, data.task);
      setNotice(`${artifactLabel(type)} started`);
      await loadAiWorkflow();
      if (data.artifact?.status !== "failed") {
        setAiTask((current) => (current?.status === "failed" ? null : current));
      }
      setLastAiPrompt("");
    } catch (err) {
      const message = errorMessage(err);
      setAiError(message);
      failPendingChatEntry(pendingEntryId, message);
    } finally {
      setWorkflowRun(null);
    }
  }

  async function generateHtmlFromPlan() {
    if (!canEdit) return;
    if (htmlGenerationRequested || aiRequestInFlight) return;
    const pendingEntryId = enqueuePendingChatEntry(
      "Generate the deck slide by slide from the approved DeckPlan.",
      "Generating workspace files",
      "I am creating slide files from the approved plan. Each slide will appear in the generation tracker as it completes.",
      "Freeze DeckPlan and generate slides page by page"
    );
    setHtmlGenerationRequested(true);
    setAiError("");
    setAiInstruction("");
    setLastAiPrompt("Freeze DeckPlan and generate slides page by page");
    setAiTask({ id: "pending", status: "running" });
    setActiveTab("assistant");
    try {
      if (dirty) await saveFile();
      const planArtifact =
        latestArtifactForType(aiArtifacts, "slide_plan", "approved") ??
        latestArtifactForType(aiArtifacts, "slide_plan");
      if (!planArtifact) throw new Error("Create a DeckPlan before generating the deck.");
      if (planArtifact.status !== "approved") {
        await apiFetch(`/projects/${projectId}/ai/workflow/artifacts/${planArtifact.id}/approve`, {
          method: "POST"
        });
      }
      const providerPayload = requireAiProviderPayload(aiProvider, localAiProviders);
      const data = await apiFetch<{ task: AiTask }>(`/projects/${projectId}/ai/generate-deck`, {
        method: "POST",
        body: JSON.stringify({
          conversationId: aiConversation?.id,
          clientRequestId: pendingEntryId,
          planArtifactId: planArtifact.id,
          ...providerPayload,
          density: deckTextDensity
        })
      });
      setAiTask(data.task);
      attachPendingTask(pendingEntryId, data.task);
      await loadAiWorkflow();
      setLastAiPrompt("");
    } catch (err) {
      const message = errorMessage(err);
      setAiError(message);
      failPendingChatEntry(pendingEntryId, message);
      setAiTask({ id: "pending", status: "failed", log: message });
    }
  }

  async function repairCompileIssue() {
    if (!canEdit) return;
    if (aiRequestInFlight) return;
    const prompt = `Repair the current HTML deck so it compiles and passes the SlideLeaf quality gate.

Use this compile log as the primary diagnostic source:
${compileLog}

Return complete replacement workspace files for review. Preserve the chosen deck topic and visual direction, but fix structural HTML, slide framing, navigation, density, viewport, and security issues.`;
    await submitAiPrompt(prompt, "Repair deck");
  }

  async function applyAiTask() {
    if (!canEdit) return;
    if (!aiTask || aiTask.status !== "needs_review") return;
    setOperationError("");
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
      setOperationError(errorMessage(err));
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
      {operationError || notice ? (
        <WorkspaceToast
          tone={operationError ? "error" : "success"}
          message={operationError || notice}
          onClose={() => {
            setOperationError("");
            setNotice("");
          }}
        />
      ) : null}

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
          <span className="rounded-full border border-white/10 bg-white/8 px-2 py-1 text-xs text-slate-300">
            {roleLabel(currentRole)}
          </span>
          <CreditBadge creditsMilli={currentUser?.creditsMilli} />
          <ToolbarButton onClick={() => void openMembersPanel()} label="Members">
            <Users size={16} />
          </ToolbarButton>
          <ToolbarButton onClick={() => setLogOpen((value) => !value)} label="Compile log">
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
          {/* Asset upload is hidden until image/document ingestion is ready. */}
          {/* <ToolbarButton onClick={() => uploadRef.current?.click()} disabled={!canEdit} label="Upload asset">
            <Upload size={16} />
          </ToolbarButton>
          <input
            ref={uploadRef}
            className="hidden"
            type="file"
            accept="image/png,image/jpeg,image/gif,image/webp"
            onChange={(event) => void uploadAsset(event.target.files)}
          /> */}
          {compileJob?.shareSlug ? (
            <a
              href={`/share/${compileJob.shareSlug}`}
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-white/15 bg-white/8 px-3 text-sm text-slate-100 transition hover:bg-white/12"
            >
              <Share2 size={16} />
              Show
            </a>
          ) : null}
          {compileJob?.status === "success" && compileJob.id !== "pending" ? (
            <a
              href={`${API_URL}/projects/${projectId}/compile-jobs/${compileJob.id}/download-html`}
              download
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-white/15 bg-white/8 px-3 text-sm text-slate-100 transition hover:bg-white/12"
            >
              <Download size={16} />
              Download HTML
            </a>
          ) : null}
        </div>

        {logOpen ? (
          <div className="absolute right-4 top-[48px] z-30 w-[520px] max-w-[calc(100vw-32px)] overflow-hidden rounded-xl border border-slate-200 bg-white text-slate-950 shadow-[0_24px_80px_rgba(15,23,42,0.22)]">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold">
              <span>Compile log</span>
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
            currentUserId={currentUser?.id ?? ""}
            canLeaveProject={currentRole !== "owner"}
            inviteEmail={inviteEmail}
            inviteRole={inviteRole}
            error={membersError}
            onInviteEmailChange={setInviteEmail}
            onInviteRoleChange={setInviteRole}
            onInvite={inviteMember}
            onRoleChange={changeMemberRole}
            onRemove={removeMember}
            onLeaveProject={leaveProject}
            onClose={() => setMembersOpen(false)}
          />
        ) : null}
      </header>

      <section
        ref={workspaceMainRef}
        className="workspace-main min-h-0"
        style={{
          gridTemplateColumns: workspaceGridColumns
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

        {workspaceIsStacked ? null : <ResizeHandle onMouseDown={() => setDragTarget("left")} />}

        <section className="min-w-0 min-h-0 overflow-hidden border-r border-slate-200 bg-[var(--panel)]">
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
              localProviders={localAiProviders}
              textDensity={deckTextDensity}
              canEdit={canEdit}
              lastPrompt={lastAiPrompt}
              pendingEntries={pendingChatEntries}
              workflowRun={workflowRun}
              task={aiTask}
              htmlGenerationRequested={htmlGenerationRequested}
              error={aiError}
              onInstructionChange={setAiInstruction}
              onModeChange={setAiMode}
              onProviderChange={setAiProvider}
              onTextDensityChange={setDeckTextDensity}
              onAsk={requestAiEdit}
              onGenerateArtifact={generateWorkflowArtifact}
              onGenerateHtml={generateHtmlFromPlan}
              onApply={applyAiTask}
              onReject={rejectAiTask}
            />
          )}
        </section>

        {workspaceIsStacked ? null : <ResizeHandle onMouseDown={() => setDragTarget("center")} />}

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

function WorkspaceToast({
  tone,
  message,
  onClose
}: {
  tone: "success" | "error";
  message: string;
  onClose: () => void;
}) {
  const isError = tone === "error";
  return (
    <div className="fixed right-4 top-16 z-50 max-w-[min(420px,calc(100vw-32px))]">
      <div
        className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm shadow-[0_22px_60px_rgba(15,23,42,0.22)] ${
          isError
            ? "border-red-100 bg-red-50 text-red-800"
            : "border-emerald-100 bg-emerald-50 text-emerald-800"
        }`}
      >
        {isError ? (
          <AlertTriangle size={17} className="mt-0.5 shrink-0" />
        ) : (
          <CheckCircle2 size={17} className="mt-0.5 shrink-0" />
        )}
        <div className="min-w-0 flex-1 leading-5">{message}</div>
        <button
          onClick={onClose}
          className={`rounded-md p-0.5 transition ${
            isError ? "hover:bg-red-100" : "hover:bg-emerald-100"
          }`}
          title="Dismiss"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}

function MembersPanel({
  members,
  isOwner,
  currentUserId,
  canLeaveProject,
  inviteEmail,
  inviteRole,
  error,
  onInviteEmailChange,
  onInviteRoleChange,
  onInvite,
  onRoleChange,
  onRemove,
  onLeaveProject,
  onClose
}: {
  members: ProjectMember[];
  isOwner: boolean;
  currentUserId: string;
  canLeaveProject: boolean;
  inviteEmail: string;
  inviteRole: ProjectRole;
  error: string;
  onInviteEmailChange: (value: string) => void;
  onInviteRoleChange: (value: ProjectRole) => void;
  onInvite: (event: React.FormEvent<HTMLFormElement>) => void;
  onRoleChange: (memberId: string, role: ProjectRole) => void;
  onRemove: (member: ProjectMember) => void;
  onLeaveProject: () => void;
  onClose: () => void;
}) {
  return (
    <div className="absolute right-4 top-[48px] z-30 w-[520px] max-w-[calc(100vw-32px)] overflow-hidden rounded-xl border border-slate-200 bg-white text-slate-950 shadow-[0_24px_80px_rgba(15,23,42,0.22)]">
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold">
        <span>Project members</span>
        <button onClick={onClose} className="rounded-md p-1 hover:bg-slate-200">
          <X size={15} />
        </button>
      </div>
      <div className="space-y-3 p-3">
        <p className="text-xs leading-5 text-slate-500">
          Members share project files and compiled output. AI conversations and prompts stay private to each user.
        </p>

        {error ? (
          <div className="flex items-start gap-2 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm leading-5 text-red-700">
            <AlertTriangle size={15} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        ) : null}

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
                  {member.userId === currentUserId ? (
                    <span className="ml-2 rounded-full bg-blue-50 px-1.5 py-0.5 text-[10px] font-semibold text-blue-700">
                      You
                    </span>
                  ) : null}
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
              No members yet.
            </div>
          ) : null}
        </div>

        {canLeaveProject ? (
          <div className="border-t border-slate-200 pt-3">
            <button
              onClick={onLeaveProject}
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-red-100 bg-red-50 px-3 text-sm font-semibold text-red-700 transition hover:bg-red-100"
            >
              <X size={14} />
              Leave project
            </button>
          </div>
        ) : null}
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
      <option value="editor">Editor</option>
      <option value="viewer">Viewer</option>
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
    <aside className="min-h-0 min-w-0 overflow-hidden border-r border-slate-200 bg-[#f8fafc]">
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
            {file.kind === "folder" ? <Folder className="shrink-0" size={14} /> : <FileText className="shrink-0" size={14} />}
            <span className={`min-w-0 truncate ${file.kind === "folder" ? "font-semibold" : ""}`}>
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
  localProviders,
  textDensity,
  canEdit,
  lastPrompt,
  pendingEntries,
  workflowRun,
  task,
  htmlGenerationRequested,
  error,
  onInstructionChange,
  onModeChange,
  onProviderChange,
  onTextDensityChange,
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
  localProviders: LocalAiProviderConfig[];
  textDensity: DeckTextDensity;
  canEdit: boolean;
  lastPrompt: string;
  pendingEntries: PendingChatEntry[];
  workflowRun: WorkflowRun | null;
  task: AiTask | null;
  htmlGenerationRequested: boolean;
  error: string;
  onInstructionChange: (value: string) => void;
  onModeChange: (value: AiMode) => void;
  onProviderChange: (value: AiProvider) => void;
  onTextDensityChange: (value: DeckTextDensity) => void;
  onAsk: () => void;
  onGenerateArtifact: (type: ArtifactType, promptOverride?: string, displayLabel?: string) => void;
  onGenerateHtml: () => void;
  onApply: () => void;
  onReject: () => void;
}) {
  const hasPrompt = instruction.trim().length > 0;
  const runningArtifact = latestRunningWorkflowArtifact(artifacts);
  const activeWorkflowRun = workflowRun ?? workflowRunFromArtifact(runningArtifact);
  const generationRun = latestGenerationRun(artifacts);
  const visiblePendingEntries = pendingEntries.filter((entry) => !isPendingEntrySaved(entry, messages));
  const stageArtifactType = artifactTypeForStage(conversation?.stage ?? "consultation");
  const currentStageArtifact = stageArtifactType ? latestArtifactForType(artifacts, stageArtifactType) : null;
  const deferredBillingMessages = messages.filter((message) =>
    shouldDeferMessageBilling(message, {
      task,
      generationRun,
      currentStageArtifact
    })
  );
  const deferredBillingMessageIds = new Set(deferredBillingMessages.map((message) => message.id));
  const generationRunBeforeChat = Boolean(
    generationRun && (visiblePendingEntries.length > 0 || messages.some((message) => isMessageAfterArtifact(message, generationRun)))
  );
  const showTaskRunningBubble =
    task?.status === "running" &&
    !activeWorkflowRun &&
    !visiblePendingEntries.length &&
    !isRunningDeckGenerationTask(task, generationRun);
  const busy =
    Boolean(activeWorkflowRun) ||
    task?.status === "running" ||
    visiblePendingEntries.some((entry) => entry.status === "running");
  const chatEndRef = useRef<HTMLDivElement>(null);
  const lastPromptAlreadySaved = Boolean(
    lastPrompt && messages.some((message) => message.role === "user" && message.content === lastPrompt)
  );
  const lastPromptAlreadyPending = Boolean(
    lastPrompt && visiblePendingEntries.some((entry) => entry.prompt === lastPrompt || entry.displayText === lastPrompt)
  );

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [messages.length, lastPrompt, visiblePendingEntries.length, activeWorkflowRun?.label, task?.status, error, generationRun?.updatedAt]);

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
          Staged AI workflow · review before apply
        </div>
      </div>

      <div className="min-h-0 overflow-auto px-3 py-4">
        <div className="mx-auto flex min-w-0 max-w-4xl flex-col gap-4">
          {!messages.length && !lastPrompt && !workflowRun && !generationRun ? <AssistantWelcome /> : null}

          {generationRunBeforeChat && generationRun ? (
            <GenerationRunCard artifact={generationRun} />
          ) : null}

          {messages.map((message) => (
            <ChatBubble key={message.id} role={message.role === "user" ? "user" : "assistant"}>
              <MessageContent message={message} showBilling={!deferredBillingMessageIds.has(message.id)} />
              {message.role === "assistant" ? (
                <MessageArtifactAttachment
                  message={message}
                  artifacts={artifacts}
                />
              ) : null}
            </ChatBubble>
          ))}

          {!generationRunBeforeChat && generationRun ? (
            <GenerationRunCard artifact={generationRun} />
          ) : null}

          {activeWorkflowRun && !visiblePendingEntries.length ? (
            <ChatBubble role="assistant">
              <RunningBubble
                title={activeWorkflowRun.label}
                description={workflowRunDescription(activeWorkflowRun.type)}
              />
            </ChatBubble>
          ) : null}

          {mode === "auto" && !busy && shouldShowStageAction(conversation?.stage ?? "consultation", artifacts) ? (
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

          {showTaskRunningBubble ? (
            <ChatBubble role="assistant">
              <RunningBubble
                title={runningTaskTitle(task)}
                description="I am reading the current workspace and preparing a reviewable response. The result will appear here when it is ready."
              />
            </ChatBubble>
          ) : null}

          {error ? (
            <ChatBubble role="assistant">
              <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
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
                <div>
                  <div>
                    <div className="text-sm font-semibold text-slate-950">Review generated patch</div>
                    {task.diffJson?.summary ? <div className="mt-1 text-sm text-slate-600">{task.diffJson.summary}</div> : null}
                  </div>
                </div>
                <div className="space-y-2">
                  {task.diffJson?.files?.map((file) => (
                    <details key={file.path} className="overflow-hidden rounded-md border border-slate-200 bg-slate-50" open>
                      <summary className="flex cursor-pointer items-center justify-between border-b border-slate-200 px-3 py-2 text-xs">
                        <span className="font-mono font-semibold text-slate-800">{file.path}</span>
                        <span
                          className={`rounded px-1.5 py-0.5 text-[11px] ${
                            file.action === "delete" ? "bg-red-50 text-red-700" : "bg-white text-slate-500"
                          }`}
                        >
                          {file.action ?? "update"}
                        </span>
                      </summary>
                      <div className="max-h-64 overflow-auto p-2 font-mono text-xs">
                        {file.lines.map((line, index) => (
                          <DiffLine key={`${file.path}-${line.type}-${index}`} line={line} />
                        ))}
                      </div>
                    </details>
                  ))}
                </div>
                <div className="flex flex-wrap justify-end gap-2 border-t border-slate-200 pt-3">
                  <button
                    onClick={onReject}
                    disabled={!canEdit}
                    className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-3 py-1.5 text-sm disabled:opacity-40"
                  >
                    <X size={15} />
                    Reject
                  </button>
                  <button
                    onClick={onApply}
                    disabled={!canEdit}
                    className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-3 py-1.5 text-sm text-white disabled:opacity-40"
                  >
                    <Check size={15} />
                    Apply
                  </button>
                </div>
              </div>
            </ChatBubble>
          ) : null}

          {deferredBillingMessages.length ? <MessageBillingFooters messages={deferredBillingMessages} /> : null}

          {visiblePendingEntries.map((entry) => (
            <div key={entry.id} className="contents">
              <ChatBubble role="user">
                <div className="max-w-[34rem] whitespace-pre-wrap text-sm leading-6">
                  {entry.displayText || entry.prompt}
                </div>
              </ChatBubble>
              <ChatBubble role="assistant">
                {entry.status === "failed" ? (
                  <div className="rounded-md bg-red-50 px-3 py-2 text-sm leading-6 text-red-700">
                    {entry.error || entry.description}
                  </div>
                ) : (
                  <RunningBubble title={entry.title} description={entry.description} />
                )}
              </ChatBubble>
            </div>
          ))}

          {lastPrompt && !lastPromptAlreadySaved && !lastPromptAlreadyPending ? (
            <ChatBubble role="user">
              <div className="max-w-[34rem] whitespace-pre-wrap text-sm leading-6">{lastPrompt}</div>
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
                  if (!busy) onAsk();
                }
              }}
              rows={2}
              className="block max-h-28 min-h-[54px] w-full resize-none border-0 bg-transparent px-2 py-2 text-sm leading-6 text-slate-900 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed disabled:text-slate-400"
              placeholder={canEdit ? "Describe the deck, ask for a plan, or request a file change..." : "View-only access: you can read the workspace but cannot send edit requests."}
            />
            <div className="flex items-center justify-between gap-2 px-1 pt-1">
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <ModePicker value={mode} onChange={onModeChange} />
                <ModelPicker value={provider} localProviders={localProviders} onChange={onProviderChange} />
                <TextDensityPicker value={textDensity} onChange={onTextDensityChange} />
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
            Press Ctrl+Enter to send. AI changes remain reviewable until you apply them.
          </div>
        </div>
      </div>
    </section>
  );
}

function ModePicker({ value, onChange }: { value: AiMode; onChange: (value: AiMode) => void }) {
  const [open, setOpen] = useState(false);
  const options: Array<{ value: AiMode; label: string; description: string }> = [
    { value: "auto", label: "Auto", description: "Continue staged workflow" },
    { value: "consultation", label: "Clarify", description: "Brief and questions" },
    { value: "visual_direction", label: "Style", description: "Create visual directions" },
    { value: "slide_plan", label: "Plan", description: "DeckPlan and slide logic" },
    { value: "generate", label: "Edit", description: "Patch current files" }
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

function ModelPicker({
  value,
  localProviders,
  onChange
}: {
  value: AiProvider;
  localProviders: LocalAiProviderConfig[];
  onChange: (value: AiProvider) => void;
}) {
  const [open, setOpen] = useState(false);
  const options: Array<{ value: AiProvider; label: string; description: string; source: "official" | "own" }> = [
    { value: "deepseek", label: "DeepSeek Pro", description: "Official server model · uses credits", source: "official" },
    { value: "gemini", label: "Gemini 3 Flash Preview", description: "Official server model · uses credits", source: "official" },
    // Official Claude models are hidden for now. Users can still add their own Claude key in AI settings.
    // { value: "claude-sonnet", label: "Claude Sonnet", description: "Official server model · uses credits", source: "official" },
    // { value: "claude-opus", label: "Claude Opus", description: "Official server model · uses credits", source: "official" },
    ...localProviders.flatMap((provider) => {
      if (provider.provider === "anthropic") {
        return [
          {
            value: `local:${provider.id}:sonnet` as AiProvider,
            label: `${provider.label} Sonnet`,
            description: "Your own Claude key from this browser",
            source: "own" as const
          },
          {
            value: `local:${provider.id}:opus` as AiProvider,
            label: `${provider.label} Opus`,
            description: "Your own Claude key from this browser",
            source: "own" as const
          }
        ];
      }
      return [
        {
          value: `local:${provider.id}` as AiProvider,
          label: provider.label || `Own ${localProviderDisplayName(provider.provider)}`,
          description: `Your own ${localProviderDisplayName(provider.provider)} key from this browser`,
          source: "own" as const
        }
      ];
    })
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
                <span className="flex items-center gap-2 text-sm font-semibold">
                  {item.label}
                  <ModelSourceBadge label={item.source === "official" ? "official" : "own"} selected={item.value === value} />
                </span>
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

function ModelSourceBadge({ label, selected }: { label: string; selected: boolean }) {
  return (
    <span
      className={`rounded border px-1.5 py-0.5 text-[9px] font-black uppercase tracking-[0.08em] ${
        selected
          ? "border-amber-200 bg-amber-300 text-slate-950"
          : "border-amber-500/60 bg-slate-950 text-amber-300"
      }`}
    >
      {label}
    </span>
  );
}

function TextDensityPicker({
  value,
  onChange
}: {
  value: DeckTextDensity;
  onChange: (value: DeckTextDensity) => void;
}) {
  const options: Array<{ value: DeckTextDensity; label: string; title: string }> = [
    { value: "concise", label: "Concise", title: "Lower text density with stronger visual storytelling" },
    { value: "balanced", label: "Balanced", title: "Balance explanation and visual composition" },
    { value: "dense", label: "Detailed", title: "More information for reports and reference-style slides" }
  ];

  return (
    <div
      className="inline-flex h-9 overflow-hidden rounded-lg border border-slate-200 bg-slate-50 p-0.5"
      aria-label="Slide text density"
      title="Slide text density"
    >
      {options.map((item) => (
        <button
          key={item.value}
          type="button"
          onClick={() => onChange(item.value)}
          className={`rounded-md px-2.5 text-xs font-semibold transition ${
            item.value === value
              ? "bg-slate-950 text-white shadow-sm"
              : "text-slate-600 hover:bg-white hover:text-slate-900"
          }`}
          title={item.title}
        >
          {item.label}
        </button>
      ))}
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

function GenerationRunCard({ artifact }: { artifact: AiArtifact }) {
  const data = asRecord(artifact.contentJson);
  const slides = Array.isArray(data.slides) ? data.slides.map(asRecord).filter(BooleanRecord) : [];
  const status = textField(data, "status") || artifact.status;
  const completed = slides.filter((slide) => textField(slide, "status") === "done").length;
  const failed = slides.filter((slide) => textField(slide, "status") === "failed").length;
  const running = slides.filter((slide) => textField(slide, "status") === "running").length;
  const pending = slides.filter((slide) => (textField(slide, "status") || "pending") === "pending").length;
  const progress = slides.length ? Math.round((completed / slides.length) * 100) : 0;
  const currentSlide =
    slides.find((slide) => textField(slide, "status") === "running") ??
    slides.find((slide) => (textField(slide, "status") || "pending") === "pending") ??
    slides.find((slide) => textField(slide, "status") === "failed") ??
    slides.at(-1);

  return (
    <ChatBubble role="assistant">
      <div className="min-w-0 w-full max-w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_18px_48px_rgba(15,23,42,0.08)]">
        <div className="border-b border-slate-100 bg-gradient-to-br from-white via-slate-50 to-blue-50/70 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-slate-950 text-white">
                  {status === "needs_review" ? <CheckCircle2 size={16} /> : status === "failed" ? <AlertTriangle size={16} /> : <Sparkles size={16} />}
                </span>
                <div>
                  <div className="text-sm font-semibold text-slate-950">
                    {status === "needs_review" ? "Deck generated" : status === "failed" ? "Generation needs attention" : "Generating slide files"}
                  </div>
                  <p className="mt-0.5 max-w-[30rem] truncate text-xs text-slate-500">
                    Frozen plan {shortHash(textField(data, "planHash"))} · {completed}/{slides.length || 0} complete
                  </p>
                </div>
              </div>
            </div>
            <GenerationStatusPill status={status} />
          </div>

          <div className="mt-4">
            <div className="mb-1.5 flex items-center justify-between text-xs">
              <span className="font-medium text-slate-600">Overall progress</span>
              <span className="font-semibold text-slate-900">{progress}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-200">
              <div
                className={`h-full rounded-full transition-all ${
                  status === "failed" ? "bg-red-500" : status === "needs_review" ? "bg-emerald-500" : "bg-blue-600"
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="mt-4 grid grid-cols-[repeat(auto-fit,minmax(112px,1fr))] gap-2">
            <GenerationStat icon={<CheckCircle2 size={15} />} label="Complete" value={`${completed}/${slides.length || 0}`} tone="green" />
            <GenerationStat icon={<Loader2 size={15} className={running ? "animate-spin" : ""} />} label="Running" value={String(running)} tone="blue" />
            <GenerationStat icon={<Clock3 size={15} />} label="Queued" value={String(pending)} tone="slate" />
            <GenerationStat icon={<AlertTriangle size={15} />} label="Failed" value={String(failed)} tone={failed ? "amber" : "slate"} />
          </div>
        </div>

        <div className="space-y-3 p-4">
          {currentSlide ? <CurrentSlidePanel slide={currentSlide} total={slides.length} /> : null}

          <div className="flex min-w-0 flex-wrap items-center justify-between gap-2 rounded-xl bg-slate-100 px-3 py-2">
            <div className="text-xs font-semibold text-slate-700">Slide queue</div>
            <div className="text-xs text-slate-500">
              {pending ? `${pending} queued` : "No queued slides"} · {failed} failed
            </div>
          </div>

          <div className="grid gap-2">
            {slides.map((slide, index) => (
              <GenerationSlideRow key={textField(slide, "slideId") || `slide-${index}`} slide={slide} />
            ))}
            {!slides.length ? (
              <div className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">
                Waiting for slide jobs.
              </div>
            ) : null}
          </div>

          {failed ? (
            <div className="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-xs leading-5 text-red-800">
              <AlertTriangle size={15} className="mt-0.5 shrink-0" />
              <span>{failed} slide job failed. Review the failed row, then regenerate after fixing the prompt or plan.</span>
            </div>
          ) : null}
        </div>
      </div>
    </ChatBubble>
  );
}

function CurrentSlidePanel({ slide, total }: { slide: JsonRecord; total: number }) {
  const descriptor = generationSlideDescriptor(slide);
  const status = textField(slide, "status") || "pending";

  return (
    <div className="rounded-2xl border border-blue-100 bg-blue-50/70 px-3 py-3">
      <div className="flex items-start gap-3">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white text-blue-700 shadow-sm">
          {status === "running" ? <Loader2 size={17} className="animate-spin" /> : status === "done" ? <CheckCircle2 size={17} /> : <Clock3 size={17} />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-blue-700">
              {status === "running" ? "Currently generating" : status === "pending" ? "Up next" : "Latest slide"}
            </span>
            <span className="text-[11px] text-blue-500">
              Slide {descriptor.index || "?"}{total ? ` of ${total}` : ""}
            </span>
          </div>
          <div className="mt-1 break-words text-sm font-semibold text-slate-950">{descriptor.title}</div>
          <div className="mt-1 break-all font-mono text-[11px] text-blue-700">{descriptor.path}</div>
        </div>
      </div>
    </div>
  );
}

function GenerationSlideRow({ slide }: { slide: JsonRecord }) {
  const descriptor = generationSlideDescriptor(slide);
  const slideStatus = textField(slide, "status") || "pending";
  const error = textField(slide, "error");

  return (
    <div
      className={`rounded-xl border px-3 py-2.5 transition ${
        slideStatus === "running"
          ? "border-blue-200 bg-blue-50"
          : slideStatus === "failed"
            ? "border-red-200 bg-red-50"
            : "border-slate-200 bg-slate-50"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg text-xs font-bold ${
            slideStatus === "done"
              ? "bg-emerald-100 text-emerald-700"
              : slideStatus === "running"
                ? "bg-blue-100 text-blue-700"
                : slideStatus === "failed"
                  ? "bg-red-100 text-red-700"
                  : "bg-white text-slate-500"
          }`}
        >
          {slideStatus === "done" ? (
            <CheckCircle2 size={15} />
          ) : slideStatus === "running" ? (
            <Loader2 size={15} className="animate-spin" />
          ) : slideStatus === "failed" ? (
            <AlertTriangle size={15} />
          ) : (
            descriptor.index || <Clock3 size={14} />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 flex-wrap items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="break-words text-sm font-semibold leading-5 text-slate-900">{descriptor.title}</div>
              <div className="mt-0.5 flex min-w-0 items-start gap-1.5 text-[11px] text-slate-500">
                <FileCode2 size={12} className="shrink-0" />
                <span className="break-all font-mono">{descriptor.path}</span>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              <GenerationStatusPill status={slideStatus} compact />
            </div>
          </div>
          <GenerationStepBar status={slideStatus} />
          {error ? (
            <div className="mt-2 flex items-start gap-2 rounded-lg bg-white/70 px-2 py-1.5 text-xs leading-5 text-red-800">
              <AlertTriangle size={14} className="mt-0.5 shrink-0" />
              <span className="line-clamp-2">{error}</span>
            </div>
          ) : null}
        </div>

      </div>
    </div>
  );
}

function GenerationStat({
  icon,
  label,
  value,
  tone
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone: "green" | "blue" | "amber" | "slate";
}) {
  const toneClass =
    tone === "green"
      ? "border-emerald-100 bg-emerald-50 text-emerald-700"
      : tone === "blue"
        ? "border-blue-100 bg-blue-50 text-blue-700"
        : tone === "amber"
          ? "border-amber-100 bg-amber-50 text-amber-700"
          : "border-slate-100 bg-white text-slate-600";

  return (
    <div className={`rounded-xl border px-3 py-2 ${toneClass}`}>
      <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide opacity-80">
        {icon}
        {label}
      </div>
      <div className="mt-1 text-lg font-bold leading-none text-slate-950">{value}</div>
    </div>
  );
}

function GenerationStepBar({ status }: { status: string }) {
  const steps = [
    { label: "Context", state: status === "pending" ? "queued" : "done" },
    {
      label: "Generate",
      state: status === "running" ? "active" : status === "pending" ? "queued" : status === "failed" ? "failed" : "done"
    }
  ];

  return (
    <div className="mt-2 grid grid-cols-[repeat(auto-fit,minmax(72px,1fr))] gap-1.5">
      {steps.map((step) => (
        <div
          key={step.label}
          className={`flex min-w-0 items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] font-semibold ${
            step.state === "done"
              ? "bg-emerald-50 text-emerald-700"
              : step.state === "active"
                ? "bg-blue-50 text-blue-700"
                : step.state === "warning"
                  ? "bg-amber-50 text-amber-700"
                  : step.state === "failed"
                    ? "bg-red-50 text-red-700"
                    : "bg-white/70 text-slate-400"
          }`}
        >
          {step.state === "active" ? (
            <Loader2 size={12} className="shrink-0 animate-spin" />
          ) : step.state === "done" ? (
            <CheckCircle2 size={12} className="shrink-0" />
          ) : step.state === "failed" || step.state === "warning" ? (
            <AlertTriangle size={12} className="shrink-0" />
          ) : (
            <Clock3 size={12} className="shrink-0" />
          )}
          <span className="truncate">{step.label}</span>
        </div>
      ))}
    </div>
  );
}

function GenerationStatusPill({ status, compact }: { status: string; compact?: boolean }) {
  const normalized = status || "pending";
  const config =
    normalized === "done" || normalized === "needs_review"
      ? {
          label: normalized === "needs_review" ? "ready" : "done",
          className: "bg-emerald-50 text-emerald-700",
          icon: <CheckCircle2 size={compact ? 12 : 13} />
        }
      : normalized === "failed"
        ? {
            label: "failed",
            className: "bg-red-50 text-red-700",
            icon: <AlertTriangle size={compact ? 12 : 13} />
          }
        : normalized === "running"
          ? {
              label: "running",
              className: "bg-blue-50 text-blue-700",
              icon: <Loader2 size={compact ? 12 : 13} className="animate-spin" />
            }
          : {
              label: "pending",
              className: "bg-slate-100 text-slate-500",
              icon: <Clock3 size={compact ? 12 : 13} />
            };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${config.className}`}
    >
      {config.icon}
      {compact ? null : config.label}
    </span>
  );
}

function generationSlideDescriptor(slide: JsonRecord): { path: string; title: string; index: string } {
  const path = textField(slide, "path") || textField(slide, "slideId") || "slide";
  const slideId = textField(slide, "slideId");
  const index = textField(slide, "index") || slideId.replace(/^s0*/i, "");
  const fileName = path.split(/[\\/]/).at(-1) ?? path;
  const withoutExtension = fileName.replace(/\.[^.]+$/, "");
  const title = withoutExtension.replace(/^\d+[-_]/, "").replace(/[-_]+/g, " ").trim() || slideId || path;
  return { path, title, index };
}

function shortHash(value: string): string {
  if (!value) return "pending";
  return value.length > 12 ? `${value.slice(0, 8)}...${value.slice(-4)}` : value;
}

function AssistantWelcome() {
  return (
    <ChatBubble role="assistant">
      <div className="space-y-3">
        <div>
          <div className="text-sm font-semibold text-slate-950">Tell me what the deck needs to achieve.</div>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            I will clarify the brief, explore style directions, plan the storyline, then generate editable HTML slides for review.
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
              <div className="text-sm font-semibold text-slate-950">Ready to generate slide files</div>
              <p className="mt-1 text-xs leading-5 text-slate-600">
                I will use the current brief, visual direction, and deck plan to create modular slide files for review.
              </p>
            </div>
            {!htmlGenerationRequested && !running && canEdit ? (
              <button
                onClick={onGenerateHtml}
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(15,23,42,0.22)] transition hover:bg-slate-800"
              >
                <Sparkles size={15} />
                Generate files
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
                This step is required before final HTML generation. Add details in chat or click Start.
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

function MessageArtifactAttachment({ message, artifacts }: { message: AiMessage; artifacts: AiArtifact[] }) {
  const artifactId = messageArtifactId(message);
  if (!artifactId) return null;
  const artifact = artifacts.find((item) => item.id === artifactId);
  if (!artifact) return null;

  return (
    <div className="mt-3 max-w-[44rem]">
      <ArtifactPreview
        artifact={artifact}
        running={false}
        canEdit={false}
        onStartStyle={() => undefined}
        onStartPlan={() => undefined}
        onGenerateHtml={() => undefined}
        htmlGenerationRequested
      />
    </div>
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
  const pyramidPrinciple = asRecord(data.pyramidPrinciple);
  const scqa = asRecord(data.scqa);
  const meceMap = asRecord(data.meceMap);
  const meceBuckets = recordList(meceMap.buckets);
  const actionTitleCandidates = listField(data, "actionTitleCandidates");
  const soWhatTests = listField(data, "soWhatTests");
  const questionPlan = recordList(data.questionPlan);
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

      {Object.keys(pyramidPrinciple).length ? (
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Pyramid principle</div>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            <MiniFact label="Top-line answer" value={textField(pyramidPrinciple, "topLineAnswer")} />
            <ArtifactList title="Supporting pillars" items={listField(pyramidPrinciple, "supportingPillars")} compact />
            <ArtifactList title="Proof needed" items={listField(pyramidPrinciple, "proofNeeded")} compact tone="amber" />
          </div>
        </div>
      ) : null}

      {Object.keys(scqa).length ? (
        <div className="rounded-xl border border-blue-100 bg-blue-50 px-3 py-3">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-blue-700">SCQA frame</div>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            <MiniFact label="Situation" value={textField(scqa, "situation")} />
            <MiniFact label="Complication" value={textField(scqa, "complication")} />
            <MiniFact label="Question" value={textField(scqa, "question")} />
            <MiniFact label="Answer" value={textField(scqa, "answer")} />
          </div>
        </div>
      ) : null}

      {meceBuckets.length || listField(meceMap, "overlapRisks").length ? (
        <div className="rounded-xl border border-slate-200 bg-white px-3 py-3">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">MECE map</div>
          <ArtifactList
            title="Buckets"
            items={meceBuckets.map((bucket) => {
              const label = textField(bucket, "label");
              const included = listField(bucket, "included").join(", ");
              const why = textField(bucket, "whyItMatters");
              return [label, included, why].filter(Boolean).join(" — ");
            })}
            compact
          />
          <ArtifactList title="Overlap risks" items={listField(meceMap, "overlapRisks")} compact tone="amber" />
        </div>
      ) : null}

      <ArtifactList title="Action title candidates" items={actionTitleCandidates} tone="blue" />
      <ArtifactList title="So What tests" items={soWhatTests} />
      <ArtifactList
        title="Question rationale"
        items={questionPlan.map((item) => {
          const question = textField(item, "question");
          const reason = textField(item, "reason");
          const blocksStage = textField(item, "blocksStage");
          return [question, reason, blocksStage ? `blocks: ${blocksStage}` : ""].filter(Boolean).join(" — ");
        })}
        tone="amber"
      />

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
                        {canEdit ? (
                          <button
                            onClick={() => onStartPlan(id)}
                            disabled={running}
                            className="inline-flex h-10 items-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white shadow-[0_12px_26px_rgba(15,23,42,0.22)] transition hover:bg-slate-800 disabled:opacity-40"
                          >
                            <Check size={15} />
                            Use this
                          </button>
                        ) : null}
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

                    <details className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2" open>
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
  const sections = Array.isArray(data.sections) ? data.sections.map(asRecord).filter(BooleanRecord) : [];
  const slides =
    sections.length > 0
      ? sections.flatMap((section) => (Array.isArray(section.slides) ? section.slides.map(asRecord).filter(BooleanRecord) : []))
      : Array.isArray(data.slides)
        ? data.slides.map(asRecord).filter(BooleanRecord)
        : [];
  const globalStyle = asRecord(data.globalStyle);
  const chosenDirection = asRecord(globalStyle.chosenDirection ?? data.chosenDirection);
  const designSystem = Object.keys(globalStyle).length ? globalStyle : asRecord(data.designSystem);
  const narrativeArc = asRecord(data.narrativeArc);
  const evidencePack = asRecord(data.evidencePack);
  const evidenceItems = [
    ...recordList(evidencePack.knownFacts),
    ...recordList(evidencePack.userClaims),
    ...recordList(evidencePack.assumptions)
  ];
  const missingEvidence = recordList(evidencePack.missingEvidence);

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

      {Object.keys(narrativeArc).length ? (
        <div className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-blue-700">Narrative arc</div>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            <MiniFact label="Starting belief" value={textField(narrativeArc, "startingBelief")} />
            <MiniFact label="Tension" value={textField(narrativeArc, "tension")} />
            <MiniFact label="Turning point" value={textField(narrativeArc, "turningPoint")} />
            <MiniFact label="Resolution" value={textField(narrativeArc, "resolution")} />
            <MiniFact label="Decision ask" value={textField(narrativeArc, "decisionAsk")} />
            <MiniFact label="Story beats" value={listField(narrativeArc, "storylineBeats").join(" → ")} />
          </div>
        </div>
      ) : null}

      {evidenceItems.length || missingEvidence.length ? (
        <details className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2" open>
          <summary className="cursor-pointer text-xs font-semibold text-slate-700">
            Evidence pack · {evidenceItems.length} evidence item{evidenceItems.length === 1 ? "" : "s"} · {missingEvidence.length} missing
          </summary>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            <ArtifactList
              title="Known facts, claims, assumptions"
              items={evidenceItems.map((item) => {
                const id = textField(item, "id");
                const statement = textField(item, "statement");
                const confidence = textField(item, "confidence");
                return [id, statement, confidence ? `(${confidence})` : ""].filter(Boolean).join(" ");
              })}
              compact
            />
            <ArtifactList
              title="Missing evidence"
              items={missingEvidence.map((item) => {
                const label = textField(item, "label");
                const purpose = textField(item, "purpose");
                return [label, purpose].filter(Boolean).join(" — ");
              })}
              compact
              tone="amber"
            />
          </div>
        </details>
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
            Generate modular HTML files with this storyline, visual system, and motion language.
          </p>
        </div>
        <button
          onClick={onGenerateHtml}
          disabled={running}
          className="inline-flex h-9 items-center gap-2 rounded-lg bg-slate-950 px-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
        >
          <Sparkles size={15} />
          Generate files
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
  const pattern = textField(slide, "recommendedVisual") || textField(slide, "visualPattern");
  const message = textField(slide, "coreMessage") || textField(slide, "message");
  const visualRole = textField(slide, "role") || textField(slide, "visualRole");
  const density = textField(slide, "density");
  const claims = recordList(slide.claims);
  const evidenceSlots = recordList(slide.evidenceSlots);
  const contentBlocks = recordList(slide.contentBlocks);
  const dataNeeds = recordList(slide.dataNeeds);
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
            {textField(slide, "analysisOperator") ? <Tag>{textField(slide, "analysisOperator")}</Tag> : null}
            {visualRole ? <Tag>{visualRole}</Tag> : null}
            {density ? <Tag>{density} density</Tag> : null}
          </div>
          {message ? <p className="mt-2 text-sm leading-6 text-slate-600">{message}</p> : null}
          <ArtifactList title="Narrative job" items={[textField(slide, "narrativeFunction"), textField(slide, "tension"), textField(slide, "implication")].filter(Boolean)} compact tone="blue" />
          <ArtifactList
            title="Claims"
            items={claims.map((claim) =>
              [textField(claim, "claim"), textField(claim, "supportType") ? `(${textField(claim, "supportType")})` : ""]
                .filter(Boolean)
                .join(" ")
            )}
            compact
          />
          <ArtifactList
            title="Evidence slots"
            items={evidenceSlots.map((slot) => {
              const purpose = textField(slot, "purpose");
              const ids = listField(slot, "evidenceIds").join(", ");
              return [purpose, ids ? `→ ${ids}` : ""].filter(Boolean).join(" ");
            })}
            compact
            tone="amber"
          />
          <ArtifactList
            title="Content blocks"
            items={contentBlocks.map((block) =>
              [textField(block, "role"), textField(block, "contentIntent"), listField(block, "mustInclude").join(", ")]
                .filter(Boolean)
                .join(" — ")
            )}
            compact
          />
          <ArtifactList
            title="Data needs"
            items={dataNeeds.map((need) =>
              [textField(need, "label"), textField(need, "preferredFormat"), textField(need, "purpose")]
                .filter(Boolean)
                .join(" — ")
            )}
            compact
            tone="amber"
          />
          <ArtifactList title="Transitions" items={[textField(slide, "transitionFromPrevious"), textField(slide, "transitionToNext")].filter(Boolean)} compact tone="blue" />
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
      <div className="mt-1 text-xs leading-5 text-slate-700">{value}</div>
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

function CreditBadge({ creditsMilli }: { creditsMilli?: number | null }) {
  return (
    <span className="inline-flex h-8 items-center gap-1.5 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-2.5 text-xs text-cyan-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.10)]">
      <Coins size={14} className="text-cyan-200" />
      <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-cyan-200/75">Credits</span>
      <span className="font-mono font-semibold tabular-nums text-white">{formatCreditsMilli(creditsMilli)}</span>
    </span>
  );
}

function ChatBubble({ role, children }: { role: "assistant" | "user"; children: React.ReactNode }) {
  return (
    <div className={`flex min-w-0 ${role === "user" ? "justify-end" : "justify-start"}`}>
      <div
        className={`min-w-0 max-w-full rounded-xl px-4 py-3 shadow-sm ${
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

type MessageBillingCharge = {
  label?: string;
  credits?: number;
  creditsMilli?: number;
  remainingCredits?: number;
  remainingCreditsMilli?: number;
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
};

type MessageUsage = {
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
};

type MessageBillingNotice = {
  text: string;
  tone: "slate" | "amber";
};

function MessageContent({ message, showBilling = true }: { message: AiMessage; showBilling?: boolean }) {
  const rawStatus = typeof message.metadata?.status === "string" ? message.metadata.status : "";
  const status = rawStatus === "draft" || rawStatus === "approved" ? "" : rawStatus;
  const billing = messageBillingDetails(message);
  const showFooter = Boolean(status || (showBilling && hasBillingDetails(billing)));

  return (
    <div className="max-w-[34rem]">
      <div className="whitespace-pre-wrap text-sm leading-6">{message.content}</div>
      {showFooter ? (
        <div className="mt-2 flex flex-wrap gap-2">
          {status ? (
            <div className="inline-flex rounded-full bg-slate-100 px-2 py-1 text-[11px] text-slate-500">
              {status.replace("_", " ")}
            </div>
          ) : null}
          {showBilling ? <MessageBillingChips details={billing} /> : null}
        </div>
      ) : null}
    </div>
  );
}

function MessageBillingFooters({ messages }: { messages: AiMessage[] }) {
  const rows = messages.map((message) => ({ message, details: messageBillingDetails(message) })).filter((row) => hasBillingDetails(row.details));
  if (!rows.length) return null;

  return (
    <div className="flex justify-start">
      <div className="max-w-[34rem] rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] text-slate-500 shadow-sm">
        <div className="mb-1 font-semibold uppercase tracking-wide text-slate-400">Usage</div>
        <div className="flex flex-wrap gap-2">
          {rows.map((row) => (
            <MessageBillingChips key={row.message.id} details={row.details} />
          ))}
        </div>
      </div>
    </div>
  );
}

function MessageBillingChips({ details }: { details: ReturnType<typeof messageBillingDetails> }) {
  if (!hasBillingDetails(details)) return null;
  return (
    <>
      {details.usage ? (
        <div className="inline-flex rounded-full border border-blue-100 bg-blue-50 px-2 py-1 font-mono text-[11px] text-blue-600">
          {details.usage.totalTokens ?? (details.usage.inputTokens ?? 0) + (details.usage.outputTokens ?? 0)} tk ({details.usage.inputTokens ?? 0} in, {details.usage.outputTokens ?? 0} out)
        </div>
      ) : null}
      {details.creditCharges.map((charge, index) => (
        <div key={`${charge.label}-${index}`} className="inline-flex rounded-full border border-amber-100 bg-amber-50 px-2 py-1 font-mono text-[11px] text-amber-700">
          {charge.label ? `${charge.label}: ` : ""}-{formatCreditsMilli(charge.creditsMilli ?? charge.credits)} credits
        </div>
      ))}
      {details.notices.map((notice, index) => (
        <div
          key={`${notice.text}-${index}`}
          className={`inline-flex rounded-full border px-2 py-1 text-[11px] ${
            notice.tone === "amber"
              ? "border-amber-100 bg-amber-50 text-amber-700"
              : "border-slate-200 bg-slate-50 text-slate-500"
          }`}
        >
          {notice.text}
        </div>
      ))}
    </>
  );
}

function messageBillingDetails(message: AiMessage): {
  usage?: MessageUsage;
  creditCharges: MessageBillingCharge[];
  notices: MessageBillingNotice[];
} {
  const metadata = message.metadata ?? {};
  const usage = asUsage(metadata.usage);
  const creditCharge = asBillingCharge(metadata.creditCharge, "model");
  const playbookCreditCharge = asBillingCharge(metadata.playbookCreditCharge, "playbook");
  const billing = asDeckGenerationBilling(metadata.billing);
  const deckCharge = billing.charge;
  const chargeUsage = usage ?? usageFromCharge(creditCharge) ?? usageFromCharge(deckCharge);
  return {
    usage: chargeUsage,
    creditCharges: [playbookCreditCharge, creditCharge ?? deckCharge].filter(Boolean) as MessageBillingCharge[],
    notices: billing.notice ? [billing.notice] : []
  };
}

function hasBillingDetails(details: ReturnType<typeof messageBillingDetails>): boolean {
  return Boolean(details.usage || details.creditCharges.length || details.notices.length);
}

function asUsage(value: unknown): MessageUsage | undefined {
  const record = asRecord(value);
  const inputTokens = numberField(record, "inputTokens");
  const outputTokens = numberField(record, "outputTokens");
  const totalTokens = numberField(record, "totalTokens");
  if (!inputTokens && !outputTokens && !totalTokens) return undefined;
  return { inputTokens, outputTokens, totalTokens };
}

function usageFromCharge(charge?: MessageBillingCharge): MessageUsage | undefined {
  if (!charge?.inputTokens && !charge?.outputTokens && !charge?.totalTokens) return undefined;
  return {
    inputTokens: charge.inputTokens,
    outputTokens: charge.outputTokens,
    totalTokens: charge.totalTokens ?? (charge.inputTokens ?? 0) + (charge.outputTokens ?? 0)
  };
}

function asBillingCharge(value: unknown, fallbackLabel: string): (MessageBillingCharge & { label?: string }) | undefined {
  const record = asRecord(value);
  const credits = numberField(record, "credits");
  const creditsMilli = numberField(record, "creditsMilli");
  if (!credits && !creditsMilli) return undefined;
  return {
    label: textField(record, "label") || fallbackLabel,
    credits,
    creditsMilli,
    remainingCredits: numberField(record, "remainingCredits"),
    remainingCreditsMilli: numberField(record, "remainingCreditsMilli"),
    inputTokens: numberField(record, "inputTokens"),
    outputTokens: numberField(record, "outputTokens"),
    totalTokens: numberField(record, "totalTokens")
  };
}

function asDeckGenerationBilling(value: unknown): { charge?: MessageBillingCharge; notice?: MessageBillingNotice } {
  const record = asRecord(value);
  if (!Object.keys(record).length) return {};
  const charged = record.charged === true;
  const provider = textField(record, "provider");
  const source = textField(record, "source");
  const creditsMilli = numberField(record, "creditsMilli");
  const inputTokens = numberField(record, "inputTokens");
  const outputTokens = numberField(record, "outputTokens");
  const totalTokens = numberField(record, "totalTokens");

  if (charged && creditsMilli) {
    return {
      charge: {
        label: "deck-generation",
        creditsMilli,
        credits: creditsMilli,
        remainingCreditsMilli: numberField(record, "remainingCreditsMilli"),
        inputTokens,
        outputTokens,
        totalTokens
      }
    };
  }

  if (source === "custom") {
    return {
      notice: {
        tone: "slate",
        text: `${provider ? `${provider}: ` : ""}own model, no SlideLeaf credits charged`
      }
    };
  }

  return {
    notice: {
      tone: "amber",
      text: `${provider ? `${provider}: ` : ""}usage unavailable, no credits calculated`
    }
  };
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
    <section className="grid h-[calc(100%-44px)] min-w-0 grid-rows-[40px_minmax(0,1fr)] overflow-hidden bg-white">
      <div className="flex min-w-0 items-center justify-between gap-3 border-b border-slate-200 bg-slate-50/70 px-3">
        <div className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-800">
          {file.path}
          {dirty ? <span className="ml-2 text-xs text-blue-700">unsaved</span> : null}
        </div>
        <div className="flex shrink-0 gap-1">
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
        <div className="min-h-0 min-w-0 overflow-hidden">
          <MonacoEditor
            height="100%"
            width="100%"
            language={languageFor(file.path)}
            value={content}
            theme="vs-light"
            onChange={(value) => onContentChange(value ?? "")}
            options={{
              automaticLayout: true,
              minimap: { enabled: false },
              fontSize: 14,
              wordWrap: "on",
              tabSize: 2,
              scrollBeyondLastLine: false,
              readOnly: !canEdit
            }}
          />
        </div>
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
    <section className="min-w-0 min-h-0 overflow-hidden bg-[#e5ebf3]">
      <PanelTitle>
        <div className="flex w-full items-center justify-between gap-3">
          <span>Preview</span>
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
      <div className="m-3 h-[calc(100%-64px)] min-w-0 overflow-hidden rounded-2xl border border-slate-300/80 bg-[#d9e1ec] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.72),0_18px_42px_rgba(15,23,42,0.10)]">
        <div className="grid h-full min-w-0 place-items-center overflow-hidden rounded-xl border border-white/70 bg-[linear-gradient(135deg,#f8fafc_0%,#e9eef6_48%,#dfe7f1_100%)] p-5">
        {previewSrc ? (
          <iframe
            key={previewSrc}
            src={previewSrc}
            className="h-full w-full min-w-0 max-w-full rounded-lg border-0 bg-white shadow-[0_18px_48px_rgba(15,23,42,0.18)]"
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
      className={`inline-flex h-8 min-w-0 max-w-[360px] items-center gap-2 rounded-lg px-2 text-sm transition ${
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
  if (role === "editor") return "Editor";
  return "Viewer";
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
    return `<section class="slide" data-slide-id="new-slide" data-motion="progressive-reveal" data-visual="executive-summary">
  <div class="slide-content">
    <div class="eyebrow">New slide</div>
    <h1>New slide advances the deck argument</h1>
    <p>Replace this with one clear message, evidence, and an intentional visual structure.</p>
  </div>
</section>
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

function resolveSubmitAction(mode: AiMode, stage?: WorkflowStage): SubmitAction {
  const target = mode === "auto" ? stage ?? "consultation" : mode;
  const artifactType = artifactTypeForStage(target);
  return artifactType ? { kind: "artifact", type: artifactType } : { kind: "edit" };
}

function requireAiProviderPayload(
  value: AiProvider,
  providers: LocalAiProviderConfig[]
): AiProviderRequestPayload {
  const payload = aiProviderRequestPayload(value, providers);
  if (!payload) throw new Error("Selected own AI model is no longer available. Reopen AI settings and add it again.");
  return payload;
}

function latestArtifactForType(artifacts: AiArtifact[], type: ArtifactType, status?: string): AiArtifact | null {
  return (
    artifacts.find((artifact) => artifact.type === type && (!status || artifact.status === status)) ?? null
  );
}

function latestGenerationRun(artifacts: AiArtifact[]): AiArtifact | null {
  return artifacts.find((artifact) => artifact.type === "deck_generation_run") ?? null;
}

function latestRunningWorkflowArtifact(artifacts: AiArtifact[]): AiArtifact | null {
  return (
    artifacts.find(
      (artifact) =>
        artifact.status === "running" &&
        (artifact.type === "brief" || artifact.type === "visual_direction" || artifact.type === "slide_plan")
    ) ?? null
  );
}

function isPendingEntrySaved(entry: PendingChatEntry, messages: AiMessage[]): boolean {
  return messages.some((message) => {
    if (message.role !== "user") return false;
    if (entry.taskId && message.aiTaskId === entry.taskId) return true;
    return messageClientRequestId(message) === entry.id;
  });
}

function shouldDeferMessageBilling(
  message: AiMessage,
  context: {
    task: AiTask | null;
    generationRun: AiArtifact | null;
    currentStageArtifact: AiArtifact | null;
  }
): boolean {
  if (!hasBillingDetails(messageBillingDetails(message))) return false;
  const metadata = asRecord(message.metadata);
  const generationTaskId = textField(asRecord(context.generationRun?.contentJson), "taskId");
  if (context.task?.id && message.aiTaskId === context.task.id) return true;
  if (generationTaskId && message.aiTaskId === generationTaskId) return true;
  if (context.generationRun?.id && textField(metadata, "runArtifactId") === context.generationRun.id) return true;
  if (context.currentStageArtifact?.id && textField(metadata, "artifactId") === context.currentStageArtifact.id) return true;
  return false;
}

function isMessageAfterArtifact(message: AiMessage, artifact: AiArtifact): boolean {
  const messageTime = Date.parse(message.createdAt);
  const artifactTime = Date.parse(artifact.updatedAt);
  return Number.isFinite(messageTime) && Number.isFinite(artifactTime) && messageTime > artifactTime;
}

function messageClientRequestId(message: AiMessage): string {
  return textField(asRecord(message.metadata), "clientRequestId");
}

function messageArtifactId(message: AiMessage): string {
  return textField(asRecord(message.metadata), "artifactId");
}

function workflowRunFromArtifact(artifact: AiArtifact | null): WorkflowRun | null {
  if (!artifact) return null;
  if (artifact.type !== "brief" && artifact.type !== "visual_direction" && artifact.type !== "slide_plan") return null;
  return { type: artifact.type, label: workflowRunLabel(artifact.type) };
}

function workflowRunDescription(type: ArtifactType): string {
  if (type === "brief") {
    return "I am reading the chat and project context, then turning it into a clear brief.";
  }
  if (type === "visual_direction") {
    return "I am creating distinct visual directions so the deck has a real design point of view.";
  }
  return "I am turning the brief and style direction into narrative structure, slide logic, and layout choices.";
}

function isRunningDeckGenerationTask(task: AiTask | null, generationRun: AiArtifact | null): boolean {
  if (!task || task.status !== "running" || !generationRun) return false;
  const content = asRecord(generationRun.contentJson);
  const runStatus = textField(content, "status") || generationRun.status;
  if (runStatus !== "running") return false;
  const runTaskId = textField(content, "taskId");
  return !runTaskId || task.id === "pending" || task.id === runTaskId;
}

function runningTaskTitle(task: AiTask | null): string {
  const prompt = (task?.prompt ?? "").toLowerCase();
  if (prompt.includes("repair")) return "Repairing the deck";
  if (prompt.includes("generate") && prompt.includes("deck")) return "Generating workspace files";
  return "Working on your request";
}

function selectRestorableTask(tasks: AiTask[], artifacts: AiArtifact[] = []): AiTask | null {
  const running = tasks.find((task) => task.status === "running");
  if (running) return running;

  const needsReview = tasks.find((task) => task.status === "needs_review");
  if (needsReview) return needsReview;

  const latestSuccessfulArtifact = artifacts.find(
    (artifact) =>
      artifact.status === "draft" ||
      artifact.status === "approved" ||
      artifact.status === "needs_review" ||
      textField(asRecord(artifact.contentJson), "status") === "needs_review"
  );
  if (latestSuccessfulArtifact) return null;

  return tasks.find((task) => task.status === "failed") ?? null;
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

function numberField(record: JsonRecord, key: string): number | undefined {
  const value = record[key];
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
}

function listField(record: JsonRecord, key: string): string[] {
  const value = record[key];
  if (Array.isArray(value)) return value.map(readableValue).filter(Boolean);
  const text = readableValue(value);
  return text ? [text] : [];
}

function recordList(value: unknown): JsonRecord[] {
  return Array.isArray(value) ? value.map(asRecord).filter(BooleanRecord) : [];
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

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

function formatCreditsMilli(value?: number | null): string {
  return Math.max(0, Math.round(value ?? 0)).toLocaleString("en-US");
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
