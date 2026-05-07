"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, FilePlus2, LogOut, Pencil, Plus, Trash2 } from "lucide-react";
import { BrandMark } from "./BrandMark";
import { apiFetch } from "../lib/api";

type ProjectSummary = {
  id: string;
  title: string;
  description?: string | null;
  updatedAt: string;
};

export function DashboardClient() {
  const router = useRouter();
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [title, setTitle] = useState("Untitled Presentation");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void load();
  }, []);

  async function load() {
    setLoading(true);
    setError("");
    try {
      await apiFetch("/auth/me");
      const data = await apiFetch<{ projects: ProjectSummary[] }>("/projects");
      setProjects(data.projects);
    } catch (err) {
      router.push("/login");
    } finally {
      setLoading(false);
    }
  }

  async function createProject(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    try {
      const data = await apiFetch<{ project: ProjectSummary }>("/projects", {
        method: "POST",
        body: JSON.stringify({ title })
      });
      router.push(`/project/${data.project.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  async function renameProject(project: ProjectSummary) {
    const nextTitle = window.prompt("Project name", project.title)?.trim();
    if (!nextTitle || nextTitle === project.title) return;
    setError("");
    try {
      const data = await apiFetch<{ project: ProjectSummary }>(`/projects/${project.id}`, {
        method: "PATCH",
        body: JSON.stringify({ title: nextTitle })
      });
      setProjects((current) =>
        current.map((item) =>
          item.id === project.id
            ? {
                ...item,
                title: data.project.title,
                updatedAt: data.project.updatedAt
              }
            : item
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  async function deleteProject(project: ProjectSummary) {
    if (!window.confirm(`Delete "${project.title}"? This cannot be undone.`)) return;
    setError("");
    try {
      await apiFetch(`/projects/${project.id}`, { method: "DELETE" });
      setProjects((current) => current.filter((item) => item.id !== project.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  async function logout() {
    await apiFetch("/auth/logout", { method: "POST" }).catch(() => undefined);
    router.push("/login");
  }

  return (
    <main className="min-h-screen bg-[var(--app-bg)]">
      <header className="flex h-14 items-center justify-between border-b border-white/10 bg-[#0b1020] px-6 text-white shadow-[0_10px_30px_rgba(15,23,42,0.18)]">
        <BrandMark href="/dashboard" nameClassName="font-semibold text-white" markClassName="bg-transparent" />
        <button
          onClick={logout}
          className="inline-flex h-9 items-center gap-2 rounded-lg border border-white/15 bg-white/8 px-3 text-sm text-slate-100 transition hover:bg-white/12"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-5">
          <div>
            <div className="mb-2 inline-flex rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
              AI-native HTML Slide Studio
            </div>
            <h1 className="text-3xl font-semibold tracking-[-0.03em] text-slate-950">Projects</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Manage editable workspaces, compile HTML decks, and review AI-generated changes before applying them.
            </p>
          </div>

          <form onSubmit={createProject} className="flex rounded-xl border border-slate-200 bg-white p-1.5 shadow-sm">
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="h-10 w-72 rounded-lg border border-transparent bg-slate-50 px-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
            />
            <button className="inline-flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(37,99,235,0.25)] transition hover:bg-blue-700">
              <Plus size={16} />
              New
            </button>
          </form>
        </div>

        {error ? <p className="mb-4 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

        {loading ? (
          <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">Loading projects...</div>
        ) : projects.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
            <FilePlus2 className="mx-auto mb-3 text-slate-400" />
            <p className="font-medium text-slate-900">No projects yet</p>
            <p className="mt-1 text-sm text-slate-500">Create a workspace to start a controlled HTML deck workflow.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {projects.map((project) => (
              <article
                key={project.id}
                className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-[0_18px_44px_rgba(15,23,42,0.10)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-base font-semibold text-slate-950">{project.title}</div>
                    <div className="mt-2 text-sm text-slate-600">
                      Updated {new Date(project.updatedAt).toLocaleString()}
                    </div>
                  </div>
                  <button
                    onClick={() => router.push(`/project/${project.id}`)}
                    className="inline-flex h-9 shrink-0 items-center gap-1 rounded-lg bg-slate-950 px-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    Open
                    <ArrowRight size={15} />
                  </button>
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => void renameProject(project)}
                    className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 text-sm text-slate-700 transition hover:bg-white"
                  >
                    <Pencil size={14} />
                    Rename
                  </button>
                  <button
                    onClick={() => void deleteProject(project)}
                    className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-red-100 bg-red-50 px-2.5 text-sm text-red-700 transition hover:bg-red-100"
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
