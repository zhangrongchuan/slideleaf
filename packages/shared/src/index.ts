export type ProjectRole = "owner" | "editor" | "viewer";
export type FileKind = "file" | "folder";
export type CompileTargetFormat = "html" | "pdf";
export type CompileStatus = "queued" | "running" | "success" | "failed";

export type ProjectTemplateFile = {
  path: string;
  kind: FileKind;
  mimeType?: string;
  isBinary?: boolean;
  contentText?: string;
};

export type AuthUser = {
  id: string;
  email: string;
  name?: string | null;
};

export type ProjectSummary = {
  id: string;
  title: string;
  description?: string | null;
  updatedAt: string;
};

export type ProjectFileDto = {
  id: string;
  projectId: string;
  name: string;
  path: string;
  kind: FileKind;
  mimeType?: string | null;
  isBinary: boolean;
  contentText?: string | null;
  storageKey?: string | null;
  updatedAt: string;
};

export type CompileJobDto = {
  id: string;
  projectId: string;
  targetFormat: CompileTargetFormat;
  status: CompileStatus;
  log?: string | null;
  outputStorageKey?: string | null;
  shareSlug?: string | null;
  createdAt: string;
  startedAt?: string | null;
  finishedAt?: string | null;
};

export type RenderError = {
  file?: string;
  message: string;
  line?: number;
};

export type RenderResult = {
  success: boolean;
  logs: string[];
  outputDir: string;
  entryHtmlPath?: string;
  errors?: RenderError[];
};

export const DEFAULT_PROJECT_FILES: ProjectTemplateFile[] = [
  {
    path: "slides",
    kind: "folder"
  },
  {
    path: "themes",
    kind: "folder"
  },
  {
    path: "assets",
    kind: "folder"
  },
  {
    path: "project.config.json",
    kind: "file",
    mimeType: "application/json",
    contentText: JSON.stringify(
      {
        name: "Untitled Presentation",
        entry: "slides/deck.html",
        slideSize: "16:9"
      },
      null,
      2
    )
  },
  {
    path: "slides/deck.html",
    kind: "file",
    mimeType: "text/html",
    contentText: `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Untitled Presentation</title>
  <style>
:root {
  --bg: #ffffff;
  --fg: #111827;
  --muted: #64748b;
  --accent: #2563eb;
  --accent-soft: #dbeafe;
  --card: #ffffff;
  --border: #e5e7eb;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  background: #0f172a;
  color: var(--fg);
  overflow: hidden;
}

.deck {
  width: 100vw;
  height: 100vh;
  position: relative;
}

.slide {
  width: 100vw;
  height: 100vh;
  box-sizing: border-box;
  padding: 72px;
  display: none;
  background:
    radial-gradient(circle at 85% 15%, rgba(37, 99, 235, 0.16), transparent 30%),
    linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
}

.slide.active {
  display: flex;
}

.title-slide {
  align-items: center;
  justify-content: center;
  text-align: center;
}

.content {
  max-width: 980px;
  width: 100%;
  margin: auto;
}

.eyebrow {
  display: inline-flex;
  padding: 8px 14px;
  border-radius: 999px;
  background: var(--accent-soft);
  color: var(--accent);
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: 24px;
}

h1 {
  margin: 0;
  font-size: clamp(48px, 7vw, 88px);
  line-height: 0.95;
  letter-spacing: 0;
  color: #0f172a;
}

h2 {
  margin: 0 0 28px;
  font-size: clamp(38px, 4.8vw, 62px);
  line-height: 1;
  letter-spacing: 0;
  color: #0f172a;
}

p {
  font-size: 23px;
  line-height: 1.55;
  color: var(--muted);
  margin: 24px auto 0;
  max-width: 780px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 22px;
  margin-top: 34px;
}

.card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 24px;
  padding: 26px;
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.08);
}

.card h3 {
  margin: 0 0 12px;
  font-size: 22px;
  color: #111827;
}

.card p {
  margin: 0;
  font-size: 16px;
  line-height: 1.55;
}

.two-column {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 56px;
  align-items: center;
  width: 100%;
  max-width: 1120px;
  margin: auto;
}

.code-box {
  background: #111827;
  color: #e5e7eb;
  border-radius: 26px;
  padding: 28px;
  font-family: "SFMono-Regular", Consolas, monospace;
  font-size: 16px;
  line-height: 1.7;
  box-shadow: 0 26px 60px rgba(15, 23, 42, 0.28);
  white-space: pre-wrap;
}

.keyword { color: #93c5fd; }
.string { color: #86efac; }
.comment { color: #9ca3af; }

.nav {
  position: fixed;
  left: 50%;
  bottom: 24px;
  transform: translateX(-50%);
  display: flex;
  gap: 10px;
  align-items: center;
  background: rgba(15, 23, 42, 0.82);
  color: white;
  padding: 10px 14px;
  border-radius: 999px;
  backdrop-filter: blur(12px);
  font-size: 14px;
  z-index: 10;
}

.nav button {
  border: 0;
  background: rgba(255,255,255,0.12);
  color: white;
  border-radius: 999px;
  padding: 8px 12px;
  cursor: pointer;
  font-weight: 700;
}

.progress {
  position: fixed;
  left: 0;
  bottom: 0;
  height: 5px;
  background: var(--accent);
  width: 33.33%;
  transition: width 0.25s ease;
  z-index: 11;
}

@media (max-width: 900px) {
  .slide {
    padding: 42px 24px;
  }

  .grid,
  .two-column {
    grid-template-columns: 1fr;
  }
}
  </style>
</head>
<body>
  <main class="deck">
    <section class="slide title-slide active">
      <div class="content">
        <div class="eyebrow">SlideLeaf Deck</div>
        <h1>HTML-first Slides</h1>
        <p>Edit one complete HTML file, compile it, and share it as a static browser-native presentation.</p>
      </div>
    </section>

    <section class="slide">
      <div class="content">
        <div class="eyebrow">Core Features</div>
        <h2>What this workspace supports</h2>
        <div class="grid">
          <div class="card">
            <h3>Workspace</h3>
            <p>Each project is a file tree with slides, assets, data, and config files.</p>
          </div>
          <div class="card">
            <h3>Compile</h3>
            <p>The worker restores the workspace and builds a static HTML presentation.</p>
          </div>
          <div class="card">
            <h3>AI Patch</h3>
            <p>AI returns reviewable complete files instead of overwriting files directly.</p>
          </div>
        </div>
      </div>
    </section>

    <section class="slide">
      <div class="two-column">
        <div>
          <div class="eyebrow">Architecture</div>
          <h2>Source files become web-native slides</h2>
          <p style="margin-left: 0;">The MVP does not need PPTX export. HTML is the primary output, and PDF can be generated later with Playwright.</p>
        </div>
        <div class="code-box"><span class="comment">// project.config.json</span>
{
  <span class="keyword">"entry"</span>: <span class="string">"slides/deck.html"</span>,
  <span class="keyword">"slideSize"</span>: <span class="string">"16:9"</span>
}</div>
      </div>
    </section>
  </main>

  <div class="nav">
    <button id="prev-button">Prev</button>
    <span id="counter">1 / 3</span>
    <button id="next-button">Next</button>
  </div>
  <div class="progress" id="progress"></div>

  <script>
    const slides = Array.from(document.querySelectorAll(".slide"));
    const counter = document.getElementById("counter");
    const progress = document.getElementById("progress");
    const prevButton = document.getElementById("prev-button");
    const nextButton = document.getElementById("next-button");
    let index = 0;

    function showSlide(nextIndex) {
      slides[index].classList.remove("active");
      index = (nextIndex + slides.length) % slides.length;
      slides[index].classList.add("active");
      counter.textContent = \`\${index + 1} / \${slides.length}\`;
      progress.style.width = \`\${((index + 1) / slides.length) * 100}%\`;
    }

    prevButton.addEventListener("click", () => showSlide(index - 1));
    nextButton.addEventListener("click", () => showSlide(index + 1));
    document.addEventListener("keydown", (event) => {
      if (event.key === "ArrowRight" || event.key === " ") showSlide(index + 1);
      if (event.key === "ArrowLeft") showSlide(index - 1);
    });
  </script>
</body>
</html>
`
  },
  {
    path: "README.md",
    kind: "file",
    mimeType: "text/markdown",
    contentText: `# Untitled Presentation

This project was created with SlideLeaf.

Edit HTML and CSS files in the workspace, then compile to generate a static HTML presentation.
`
  }
];

export function fileNameFromPath(filePath: string): string {
  const normalized = filePath.replace(/\\/g, "/");
  return normalized.split("/").filter(Boolean).at(-1) ?? normalized;
}
