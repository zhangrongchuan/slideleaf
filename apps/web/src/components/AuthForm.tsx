"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { BrandMark } from "./BrandMark";
import { apiFetch } from "../lib/api";

type AuthFormProps = {
  mode: "login" | "register";
};

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      await apiFetch(`/auth/${mode}`, {
        method: "POST",
        body: JSON.stringify(mode === "register" ? { email, password, name } : { email, password })
      });
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[var(--app-bg)] px-5 py-8">
      <section className="grid w-full max-w-5xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.12)] md:grid-cols-[1.05fr_0.95fr]">
        <aside className="hidden min-h-[560px] flex-col justify-between bg-[#0b1020] p-8 text-white md:flex">
          <div>
            <BrandMark
              markClassName="bg-transparent"
              nameClassName="text-sm font-semibold text-white"
            />
            <div className="mt-16 max-w-md">
              <p className="text-sm font-medium uppercase tracking-[0.22em] text-blue-200">AI-native HTML Slide Studio</p>
              <h1 className="mt-4 text-4xl font-semibold leading-[1.05] tracking-[-0.03em]">
                Controlled generation for serious presentation work.
              </h1>
              <p className="mt-5 text-sm leading-6 text-slate-300">
                Clarify the brief, approve the plan, then let the agent generate editable HTML files inside a real workspace.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 text-xs text-slate-300">
            <div className="rounded-lg border border-white/10 bg-white/8 p-3">
              <div className="font-semibold text-white">HTML</div>
              <div className="mt-1">native output</div>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/8 p-3">
              <div className="font-semibold text-white">Plan</div>
              <div className="mt-1">before code</div>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/8 p-3">
              <div className="font-semibold text-white">Review</div>
              <div className="mt-1">before apply</div>
            </div>
          </div>
        </aside>

        <form onSubmit={submit} className="flex min-h-[560px] flex-col justify-center p-7 sm:p-10">
          <div className="mb-8">
            <BrandMark
              size="sm"
              className="md:hidden"
              nameClassName="text-sm font-semibold text-blue-700"
              markClassName="bg-transparent"
            />
            <h2 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-slate-950">
              {mode === "login" ? "Sign in" : "Create account"}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              {mode === "login"
                ? "Open your HTML slide workspaces."
                : "Start building controlled AI-generated decks."}
            </p>
          </div>

        {mode === "register" ? (
          <label className="mb-4 block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">Name</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
              autoComplete="name"
            />
          </label>
        ) : null}

        <label className="mb-4 block">
          <span className="mb-1.5 block text-sm font-medium text-slate-700">Email</span>
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
            type="email"
            autoComplete="email"
            required
          />
        </label>

        <label className="mb-4 block">
          <span className="mb-1.5 block text-sm font-medium text-slate-700">Password</span>
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
            type="password"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            minLength={8}
            required
          />
        </label>

        {error ? <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

        <button
          disabled={loading}
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(15,23,42,0.18)] transition hover:bg-slate-800 disabled:opacity-60"
        >
          {loading ? "Working..." : mode === "login" ? "Sign in" : "Register"}
          {!loading ? <ArrowRight size={16} /> : null}
        </button>

        <p className="mt-4 text-center text-sm text-slate-600">
          {mode === "login" ? (
            <a className="font-medium text-blue-700 hover:text-blue-800" href="/register">
              Need an account?
            </a>
          ) : (
            <a className="font-medium text-blue-700 hover:text-blue-800" href="/login">
              Already registered?
            </a>
          )}
        </p>
        </form>
      </section>
    </main>
  );
}
