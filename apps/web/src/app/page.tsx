import Link from "next/link";
import { ArrowRight, Code2, Play, Sparkles } from "lucide-react";
import { BrandMark } from "../components/BrandMark";

const codeLines = [
  "<section class=\"slide hero active\">",
  "  <h1>AI-native HTML Slide Studio</h1>",
  "  <p>Brief, plan, compile, refine.</p>",
  "</section>",
  "",
  ".slide {",
  "  display: grid;",
  "  place-items: center;",
  "  background: #07111f;",
  "}"
];

const deckSteps = ["Clarify", "Style", "Plan", "Compile"];

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#08111f] text-white">
      <section className="relative min-h-[92vh] overflow-hidden">
        <div className="absolute inset-0 home-grid opacity-70" />
        <div className="absolute inset-0 home-scene" aria-hidden="true">
          <div className="scene-code">
            <div className="scene-bar">
              <span />
              <span />
              <span />
              <strong>slides/01-title.html</strong>
            </div>
            <div className="space-y-2 p-5 font-mono text-[12px] leading-5 text-slate-300">
              {codeLines.map((line, index) => (
                <div key={`${line}-${index}`} className="home-code-line" style={{ animationDelay: `${index * 0.12}s` }}>
                  <span className="mr-4 select-none text-slate-600">{String(index + 1).padStart(2, "0")}</span>
                  {line || " "}
                </div>
              ))}
            </div>
          </div>

          <div className="scene-deck">
            <div className="deck-topline">
              <span>Compiled preview</span>
              <span>16:9 HTML</span>
            </div>
            <div className="deck-slide">
              <div className="deck-pill">AI Slide Studio</div>
              <h2>Source files become polished web-native decks</h2>
              <div className="deck-cards">
                <span>HTML</span>
                <span>CSS</span>
                <span>Assets</span>
              </div>
            </div>
          </div>

          <div className="scene-chat">
            <div className="chat-prompt">
              <Sparkles size={16} />
              <span>Generate a polished open-source project deck</span>
            </div>
            <div className="chat-progress">
              {deckSteps.map((step, index) => (
                <span key={step} style={{ animationDelay: `${index * 0.35}s` }}>
                  {step}
                </span>
              ))}
            </div>
          </div>
        </div>

        <header className="relative z-10 mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
          <BrandMark
            href="/"
            nameClassName="text-sm font-semibold text-white"
            markClassName="bg-transparent"
          />
          <nav className="flex items-center gap-2">
            <Link href="/login" className="hidden rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition hover:text-white sm:inline-flex">
              Log in
            </Link>
            <Link
              href="/login"
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-white px-4 text-sm font-semibold text-slate-950 shadow-[0_18px_44px_rgba(255,255,255,0.18)] transition hover:bg-slate-100"
            >
              Get started
              <ArrowRight size={16} />
            </Link>
          </nav>
        </header>

        <div className="relative z-10 mx-auto grid min-h-[calc(92vh-80px)] max-w-7xl grid-cols-1 items-center gap-10 px-6 pb-20 pt-8 lg:grid-cols-[minmax(0,0.92fr)_minmax(460px,1.08fr)]">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/8 px-3 py-1.5 text-xs font-semibold text-blue-100 backdrop-blur">
              <Sparkles size={14} />
              AI-native workflow for HTML presentations
            </div>
            <h1 className="text-[clamp(48px,8vw,112px)] font-semibold leading-[0.96] text-white">
              SlideLeaf
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              A professional workspace where AI clarifies the brief, explores visual direction, plans the deck, and generates editable HTML slide files.
            </p>

            <div className="mt-8 max-w-2xl rounded-2xl border border-white/14 bg-[#0d1728]/88 p-2 shadow-[0_28px_90px_rgba(0,0,0,0.40)] backdrop-blur-xl">
              <div className="flex min-h-16 flex-col gap-3 rounded-xl border border-white/8 bg-white/[0.03] p-3 sm:flex-row sm:items-center">
                <div className="flex min-w-0 flex-1 items-center gap-3 text-left text-sm text-slate-200">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-blue-500/16 text-blue-200">
                    <Code2 size={17} />
                  </span>
                  <span className="home-type truncate">
                    Generate a cinematic product strategy deck with HTML slides
                  </span>
                </div>
                <Link
                  href="/login"
                  className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-blue-500 px-4 text-sm font-semibold text-white shadow-[0_16px_36px_rgba(59,130,246,0.32)] transition hover:bg-blue-400"
                >
                  <Play size={16} />
                  Start building
                </Link>
              </div>
            </div>
          </div>

          <div className="relative hidden h-[620px] lg:block" aria-hidden="true">
            <div className="absolute left-2 top-10 h-[430px] w-[58%] rounded-2xl border border-white/12 bg-[#0a1220]/90 shadow-[0_30px_90px_rgba(0,0,0,0.48)] backdrop-blur-xl" />
            <div className="absolute right-0 top-0 h-[520px] w-[72%] rounded-2xl border border-white/12 bg-white/[0.06] shadow-[0_40px_100px_rgba(0,0,0,0.50)] backdrop-blur-xl" />
            <div className="absolute right-8 top-10 h-[420px] w-[64%] rounded-xl border border-white/14 bg-[#07111f] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.45)]">
              <div className="mb-4 flex items-center justify-between text-xs text-slate-400">
                <span>Live preview</span>
                <span>compiled</span>
              </div>
              <div className="grid h-[340px] place-items-center rounded-lg border border-white/10 bg-[#0b1b31] p-8">
                <div>
                  <div className="mb-5 inline-flex rounded-full border border-blue-300/30 bg-blue-400/12 px-3 py-1 text-xs font-semibold text-blue-100">
                    HTML-first deck
                  </div>
                  <div className="max-w-sm text-4xl font-semibold leading-tight text-white">
                    Strategy slides that stay editable as code.
                  </div>
                  <div className="mt-7 grid grid-cols-3 gap-2 text-xs font-semibold text-slate-300">
                    <span className="rounded-lg bg-white/8 px-3 py-2">Brief</span>
                    <span className="rounded-lg bg-white/8 px-3 py-2">Plan</span>
                    <span className="rounded-lg bg-blue-500 px-3 py-2 text-white">HTML</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 border-t border-white/10 bg-[#0b1423] px-6 py-10">
        <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-3">
          {[
            ["Clarify first", "Capture audience, purpose, tone, constraints, and missing inputs before generation starts."],
            ["DeckPlan before HTML", "Turn the story into action titles, slide roles, evidence needs, and visual plans."],
            ["Source files, not screenshots", "Generate modular HTML/CSS files that compile into a portable static presentation."]
          ].map(([title, body]) => (
            <article key={title} className="rounded-xl border border-white/10 bg-white/[0.04] p-5">
              <h2 className="text-base font-semibold text-white">{title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-400">{body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Footer Section */}
      <footer className="border-t border-white/10 bg-[#08111f] py-12 px-6 text-sm text-slate-400">
        <div className="mx-auto max-w-7xl grid gap-8 md:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))]">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <BrandMark
                size="sm"
                nameClassName="font-semibold text-white"
                markClassName="bg-transparent"
              />
            </div>
            <p className="max-w-[200px] text-xs leading-5">
              Open-source AI workspace for planning, generating, and compiling HTML presentations as editable source files.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold text-white mb-4">Product</h3>
            <ul className="space-y-3">
              <li><Link href="/login" className="hover:text-white transition">Workspace</Link></li>
              <li><Link href="/login" className="hover:text-white transition">DeckPlan workflow</Link></li>
              <li><Link href="/login" className="hover:text-white transition">HTML deck compiler</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-white mb-4">Open Source</h3>
            <ul className="space-y-3">
              <li><a href="https://github.com/zhangrongchuan/slideleaf" className="hover:text-white transition" target="_blank" rel="noreferrer">GitHub</a></li>
              <li><a href="https://github.com/zhangrongchuan/slideleaf#readme" className="hover:text-white transition" target="_blank" rel="noreferrer">README</a></li>
              <li><a href="https://github.com/zhangrongchuan/slideleaf/issues" className="hover:text-white transition" target="_blank" rel="noreferrer">Issues</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Get Started</h3>
            <ul className="space-y-3">
              <li><Link href="/login" className="hover:text-white transition">Log in</Link></li>
              <li><Link href="/login" className="hover:text-white transition">Create workspace</Link></li>
              <li><Link href="/login" className="hover:text-white transition">Configure own model</Link></li>
            </ul>
          </div>
        </div>
        <div className="mx-auto max-w-7xl mt-12 pt-8 border-t border-white/10 flex flex-col items-center justify-between gap-4 sm:flex-row text-xs">
          <p>&copy; {new Date().getFullYear()} SlideLeaf. Open-source HTML slide studio.</p>
          <div className="flex gap-4">
            <a href="https://github.com/zhangrongchuan/slideleaf" className="hover:text-white transition" target="_blank" rel="noreferrer">GitHub</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
