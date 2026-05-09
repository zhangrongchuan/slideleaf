import { mkdtemp, readFile, rm, writeFile, mkdir } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { renderProject } from "./index.js";

describe("renderProject", () => {
  it("renders a configured multi-slide deck", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "slideleaf-renderer-"));
    const workspaceDir = path.join(root, "workspace");
    const outputDir = path.join(root, "dist");

    try {
      await mkdir(path.join(workspaceDir, "slides"), { recursive: true });
      await mkdir(path.join(workspaceDir, "themes"), { recursive: true });
      await writeFile(
        path.join(workspaceDir, "project.config.json"),
        JSON.stringify({
          name: "Renderer Test",
          slides: ["slides/intro.md", "slides/method.md"],
          theme: "themes/default.css"
        }),
        "utf8"
      );
      await writeFile(path.join(workspaceDir, "themes/default.css"), ".slide { color: red; }", "utf8");
      await writeFile(
        path.join(workspaceDir, "slides/intro.md"),
        "---\ntitle: Intro\nlayout: title\n---\n\n# Hello\n",
        "utf8"
      );
      await writeFile(
        path.join(workspaceDir, "slides/method.md"),
        "---\ntitle: Method\nlayout: two-column\n---\n\n::left\n## Left\n::\n\n::right\n## Right\n::\n",
        "utf8"
      );

      const result = await renderProject({ workspaceDir, outputDir });
      expect(result.success).toBe(true);
      const html = await readFile(path.join(outputDir, "index.html"), "utf8");
      expect(html).toContain("Renderer Test");
      expect(html).toContain("two-column");
      expect(html).toContain("Hello");
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it("renders html slide fragments and rewrites workspace asset paths", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "slideleaf-renderer-"));
    const workspaceDir = path.join(root, "workspace");
    const outputDir = path.join(root, "dist");

    try {
      await mkdir(path.join(workspaceDir, "slides"), { recursive: true });
      await mkdir(path.join(workspaceDir, "themes"), { recursive: true });
      await mkdir(path.join(workspaceDir, "assets"), { recursive: true });
      await writeFile(
        path.join(workspaceDir, "project.config.json"),
        JSON.stringify({
          name: "HTML Renderer Test",
          slides: ["slides/intro.html"],
          theme: "themes/default.css"
        }),
        "utf8"
      );
      await writeFile(path.join(workspaceDir, "themes/default.css"), ".slide { color: blue; }", "utf8");
      await writeFile(
        path.join(workspaceDir, "slides/intro.html"),
        `<section class="slide custom-slide">
  <h1>Hello HTML</h1>
  <img src="../assets/chart.png" onerror="alert('blocked')" />
  <script>alert("blocked")</script>
</section>`,
        "utf8"
      );

      const result = await renderProject({ workspaceDir, outputDir });
      expect(result.success).toBe(true);
      const html = await readFile(path.join(outputDir, "index.html"), "utf8");
      expect(html).toContain("Hello HTML");
      expect(html).toContain('src="assets/chart.png"');
      expect(html).not.toContain('alert("blocked")');
      expect(html).not.toContain("onerror");
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it("passes through a standalone html deck without wrapping it", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "slideleaf-renderer-"));
    const workspaceDir = path.join(root, "workspace");
    const outputDir = path.join(root, "dist");

    try {
      await mkdir(path.join(workspaceDir, "slides"), { recursive: true });
      await mkdir(path.join(workspaceDir, "assets"), { recursive: true });
      await writeFile(
        path.join(workspaceDir, "project.config.json"),
        JSON.stringify({
          name: "Standalone Test",
          entry: "slides/deck.html"
        }),
        "utf8"
      );
      await writeFile(
        path.join(workspaceDir, "slides/deck.html"),
        `<!doctype html>
<html lang="en">
<head><title>Standalone Test</title><meta name="viewport" content="width=device-width, initial-scale=1" /></head>
<body>
  <main class="deck">
    <section class="slide active"><img src="../assets/chart.png" /></section>
  </main>
  <button onclick="nextSlide()">Next</button>
  <script>function nextSlide() { document.body.dataset.active = "yes"; }</script>
</body>
</html>`,
        "utf8"
      );

      const result = await renderProject({ workspaceDir, outputDir });
      expect(result.success).toBe(true);
      const html = await readFile(path.join(outputDir, "index.html"), "utf8");
      expect(html).toContain("<!doctype html>");
      expect(html).toContain("function nextSlide()");
      expect(html).toContain('onclick="nextSlide()"');
      expect(html).toContain('src="assets/chart.png"');
      expect(html.match(/<main class="deck">/g)?.length).toBe(1);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it("renders multi-slide html fragments with shared runtime", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "slideleaf-renderer-"));
    const workspaceDir = path.join(root, "workspace");
    const outputDir = path.join(root, "dist");

    try {
      await mkdir(path.join(workspaceDir, "slides"), { recursive: true });
      await mkdir(path.join(workspaceDir, "themes"), { recursive: true });
      await mkdir(path.join(workspaceDir, "runtime"), { recursive: true });
      await writeFile(
        path.join(workspaceDir, "project.config.json"),
        JSON.stringify({
          name: "Fragment Deck",
          slides: ["slides/01-title.html", "slides/02-plan.html"],
          theme: "themes/deck.css",
          runtime: "runtime/deck.js"
        }),
        "utf8"
      );
      await writeFile(path.join(workspaceDir, "themes/deck.css"), ".slide { color: green; }", "utf8");
      await writeFile(path.join(workspaceDir, "runtime/deck.js"), "document.body.dataset.runtime = 'ok';", "utf8");
      await writeFile(
        path.join(workspaceDir, "slides/01-title.html"),
        `<section class="slide active" data-slide-id="s01" data-motion="static"><h1>Title</h1></section>`,
        "utf8"
      );
      await writeFile(
        path.join(workspaceDir, "slides/02-plan.html"),
        `<section class="slide" data-slide-id="s02" data-motion="progressive-reveal"><h1>Plan</h1></section>`,
        "utf8"
      );

      const result = await renderProject({ workspaceDir, outputDir });
      expect(result.success).toBe(true);
      const html = await readFile(path.join(outputDir, "index.html"), "utf8");
      expect(html).toContain("Title");
      expect(html).toContain("Plan");
      expect(html).toContain("slideleaf-nav");
      expect(html).toContain("document.body.dataset.runtime");
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it("skips project runtimes that try to own slide navigation", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "slideleaf-renderer-"));
    const workspaceDir = path.join(root, "workspace");
    const outputDir = path.join(root, "dist");

    try {
      await mkdir(path.join(workspaceDir, "slides"), { recursive: true });
      await mkdir(path.join(workspaceDir, "runtime"), { recursive: true });
      await writeFile(
        path.join(workspaceDir, "project.config.json"),
        JSON.stringify({
          name: "Runtime Collision Deck",
          slides: ["slides/01.html", "slides/02.html", "slides/03.html"],
          runtime: "runtime/deck.js",
          generationMode: "multi-slide"
        }),
        "utf8"
      );
      await writeFile(
        path.join(workspaceDir, "runtime/deck.js"),
        `const slides = document.querySelectorAll('.slide');
const navUI = document.createElement('div');
navUI.className = 'nav-ui';
document.body.appendChild(navUI);
document.addEventListener('keydown', () => slides[0].classList.add('active'));`,
        "utf8"
      );
      await writeFile(path.join(workspaceDir, "slides/01.html"), `<section class="slide"><h1>One</h1></section>`, "utf8");
      await writeFile(path.join(workspaceDir, "slides/02.html"), `<section class="slide"><h1>Two</h1></section>`, "utf8");
      await writeFile(path.join(workspaceDir, "slides/03.html"), `<section class="slide"><h1>Three</h1></section>`, "utf8");

      const result = await renderProject({ workspaceDir, outputDir });
      expect(result.success).toBe(true);
      expect(result.logs).toContain("Skipped project runtime deck controller because the renderer owns slide navigation and counters.");
      const html = await readFile(path.join(outputDir, "index.html"), "utf8");
      expect(html).toContain("window.__slideleafDeckInitialized");
      expect(html).toContain("getCount: () => slides.length");
      expect(html).toContain("slideleaf:slidechange");
      expect(html).toContain('<span data-slide-counter aria-live="polite">1 / 3</span>');
      expect(html).not.toContain("nav-ui");
      expect(html.match(/<section class="slide/g)?.length).toBe(3);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it("keeps inline slide display styles from breaking navigation visibility", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "slideleaf-renderer-"));
    const workspaceDir = path.join(root, "workspace");
    const outputDir = path.join(root, "dist");

    try {
      await mkdir(path.join(workspaceDir, "slides"), { recursive: true });
      await writeFile(
        path.join(workspaceDir, "project.config.json"),
        JSON.stringify({
          name: "Inline Display Deck",
          slides: ["slides/01.html", "slides/02.html"]
        }),
        "utf8"
      );
      await writeFile(
        path.join(workspaceDir, "slides/01.html"),
        `<section class="slide active" style="display:flex"><h1>One</h1></section>`,
        "utf8"
      );
      await writeFile(
        path.join(workspaceDir, "slides/02.html"),
        `<section class="slide" style="display:flex"><h1>Two</h1></section>`,
        "utf8"
      );

      const result = await renderProject({ workspaceDir, outputDir });
      expect(result.success).toBe(true);
      const html = await readFile(path.join(outputDir, "index.html"), "utf8");
      expect(html).toContain("position: absolute !important");
      expect(html).toContain("visibility: hidden !important");
      expect(html).not.toContain(".slide {\n  width: 100vw;\n  height: 100vh;\n  height: 100dvh;\n  overflow: hidden;\n  display: none;");
      expect(html).toContain("slides.forEach");
      expect(html).toContain("aria-hidden");
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it("keeps inline slide positioning styles from pushing active slides out of view", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "slideleaf-renderer-"));
    const workspaceDir = path.join(root, "workspace");
    const outputDir = path.join(root, "dist");

    try {
      await mkdir(path.join(workspaceDir, "slides"), { recursive: true });
      await writeFile(
        path.join(workspaceDir, "project.config.json"),
        JSON.stringify({
          name: "Inline Position Deck",
          slides: ["slides/01.html", "slides/02.html"]
        }),
        "utf8"
      );
      await writeFile(
        path.join(workspaceDir, "slides/01.html"),
        `<section class="slide" style="position:relative"><h1>One</h1></section>`,
        "utf8"
      );
      await writeFile(
        path.join(workspaceDir, "slides/02.html"),
        `<section class="slide" style="position:relative"><h1>Two</h1></section>`,
        "utf8"
      );

      const result = await renderProject({ workspaceDir, outputDir });
      expect(result.success).toBe(true);
      const html = await readFile(path.join(outputDir, "index.html"), "utf8");
      expect(html).toContain("position: absolute !important");
      expect(html).toContain("inset: 0 !important");
      expect(html).toContain("z-index: 1 !important");
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it("prefers configured unicode slide paths over an explicit legacy entry", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "slideleaf-renderer-"));
    const workspaceDir = path.join(root, "workspace");
    const outputDir = path.join(root, "dist");

    try {
      await mkdir(path.join(workspaceDir, "slides"), { recursive: true });
      await mkdir(path.join(workspaceDir, "themes"), { recursive: true });
      await writeFile(
        path.join(workspaceDir, "project.config.json"),
        JSON.stringify({
          name: "Unicode Deck",
          slides: ["slides/01-标题页.html", "slides/02-市场机会.html"],
          theme: "themes/deck.css",
          generationMode: "multi-slide"
        }),
        "utf8"
      );
      await writeFile(path.join(workspaceDir, "themes/deck.css"), ".slide { color: black; }", "utf8");
      await writeFile(
        path.join(workspaceDir, "slides/01-标题页.html"),
        `<section class="slide active" data-slide-id="s01" data-motion="static"><h1>标题页</h1></section>`,
        "utf8"
      );
      await writeFile(
        path.join(workspaceDir, "slides/02-市场机会.html"),
        `<section class="slide" data-slide-id="s02" data-motion="static"><h1>市场机会</h1></section>`,
        "utf8"
      );
      await writeFile(
        path.join(workspaceDir, "slides/deck.html"),
        `<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1" /></head><body><section class="slide">Legacy only</section></body></html>`,
        "utf8"
      );

      const result = await renderProject({ workspaceDir, outputDir, entry: "slides/deck.html" });
      expect(result.success).toBe(true);
      const html = await readFile(path.join(outputDir, "index.html"), "utf8");
      expect(html).toContain("标题页");
      expect(html).toContain("市场机会");
      expect(html).not.toContain("Legacy only");
      expect(html.match(/<section class="slide/g)?.length).toBe(2);
      expect(result.logs).toContain("Resolved 2 configured slides");
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it("rejects incomplete html slide fragments", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "slideleaf-renderer-"));
    const workspaceDir = path.join(root, "workspace");
    const outputDir = path.join(root, "dist");

    try {
      await mkdir(path.join(workspaceDir, "slides"), { recursive: true });
      await writeFile(
        path.join(workspaceDir, "project.config.json"),
        JSON.stringify({
          name: "Broken Fragment Deck",
          slides: ["slides/01-broken.html"],
          generationMode: "multi-slide"
        }),
        "utf8"
      );
      await writeFile(
        path.join(workspaceDir, "slides/01-broken.html"),
        `<section class="slide" data-slide-id="s01"><h1>Broken`,
        "utf8"
      );

      const result = await renderProject({ workspaceDir, outputDir });
      expect(result.success).toBe(false);
      expect(result.errors?.[0]?.file).toBe("slides/01-broken.html");
      expect(result.errors?.[0]?.message).toContain("complete single root fragment");
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it("rejects slide paths that escape the workspace", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "slideleaf-renderer-"));
    const workspaceDir = path.join(root, "workspace");
    const outputDir = path.join(root, "dist");

    try {
      await mkdir(workspaceDir, { recursive: true });
      await writeFile(
        path.join(workspaceDir, "project.config.json"),
        JSON.stringify({ slides: ["../secret.md"] }),
        "utf8"
      );
      const result = await renderProject({ workspaceDir, outputDir });
      expect(result.success).toBe(false);
      expect(result.errors?.[0]?.message).toContain("escapes workspace");
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
});
