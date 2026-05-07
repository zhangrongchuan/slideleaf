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
      expect(html).not.toContain("<script>");
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
<head><title>Standalone Test</title></head>
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
