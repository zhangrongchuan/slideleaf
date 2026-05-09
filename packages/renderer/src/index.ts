import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import type { RenderError, RenderResult } from "@slideleaf/shared";

export type RenderProjectOptions = {
  workspaceDir: string;
  outputDir: string;
  entry?: string;
};

export type HtmlQualitySeverity = "error" | "warning";

export type HtmlQualityIssue = {
  severity: HtmlQualitySeverity;
  code: string;
  message: string;
};

export type HtmlQualityReport = {
  score: number;
  slideCount: number;
  issues: HtmlQualityIssue[];
};

type ProjectConfig = {
  name?: string;
  entry?: string;
  slides?: string[];
  theme?: string;
  runtime?: string;
  slideSize?: string;
  generationMode?: string;
};

type ParsedSlide = {
  frontmatter: Record<string, string>;
  body: string;
};

type SlideSourceKind = "html" | "markdown";

export async function renderProject(options: RenderProjectOptions): Promise<RenderResult> {
  const workspaceDir = path.resolve(options.workspaceDir);
  const outputDir = path.resolve(options.outputDir);
  const logs: string[] = [];
  const errors: RenderError[] = [];

  try {
    await rm(outputDir, { recursive: true, force: true });
    await mkdir(outputDir, { recursive: true });

    const configPath = resolveInside(workspaceDir, "project.config.json");
    const config = JSON.parse(await readFile(configPath, "utf8")) as ProjectConfig;
    logs.push("Read project.config.json");

    const slidePaths = resolveSlidePaths(config, options.entry);
    if (slidePaths.length === 0) {
      throw new Error("No slides configured. Add config.slides, config.entry, or an explicit entry.");
    }
    logs.push(`Resolved ${slidePaths.length} configured slide${slidePaths.length === 1 ? "" : "s"}`);

    const themePath = config.theme ?? "themes/default.css";
    const themeCss = await readOptionalText(resolveInside(workspaceDir, themePath));
    if (themeCss) {
      await writeFile(path.join(outputDir, "theme.css"), themeCss, "utf8");
      logs.push(`Loaded theme ${themePath}`);
    }
    const runtimePath = config.runtime ?? "runtime/deck.js";
    const projectRuntimeJs = sanitizeRuntimeScript(await readOptionalText(resolveInside(workspaceDir, runtimePath)));
    if (projectRuntimeJs) {
      logs.push(`Loaded runtime ${runtimePath}`);
    }
    const runtimeJs = composeRuntimeScript(projectRuntimeJs, logs);
    await writeFile(path.join(outputDir, "deck.js"), runtimeJs, "utf8");

    const assetsDir = path.join(workspaceDir, "assets");
    await cp(assetsDir, path.join(outputDir, "assets"), {
      recursive: true,
      force: true,
      errorOnExist: false
    }).catch((error: NodeJS.ErrnoException) => {
      if (error.code !== "ENOENT") {
        throw error;
      }
    });

    if (slidePaths.length === 1) {
      const fullDeckPath = slidePaths[0];
      const fullDeckSource = await readFile(resolveInside(workspaceDir, fullDeckPath), "utf8").catch(
        (error: NodeJS.ErrnoException) => {
          if (error.code === "ENOENT") {
            errors.push({ file: fullDeckPath, message: `Slide file not found: ${fullDeckPath}` });
            return undefined;
          }
          throw error;
        }
      );

      if (fullDeckSource !== undefined && isFullHtmlDocument(fullDeckSource)) {
        if (errors.length > 0) {
          return {
            success: false,
            logs,
            outputDir,
            errors
          };
        }

        const entryHtmlPath = path.join(outputDir, "index.html");
        const html = renderFullHtmlDocument(fullDeckSource, fullDeckPath);
        const quality = analyzeHtmlQuality(html);
        logs.push(...formatQualityLogs(quality));
        const qualityErrors = quality.issues.filter((issue) => issue.severity === "error");
        if (qualityErrors.length) {
          return {
            success: false,
            logs,
            outputDir,
            errors: qualityErrors.map((issue) => ({
              file: fullDeckPath,
              message: `${issue.code}: ${issue.message}`
            }))
          };
        }
        await writeFile(entryHtmlPath, html, "utf8");
        await writeManifest(outputDir, config, slidePaths);
        logs.push(`Rendered standalone HTML deck ${fullDeckPath}`);
        logs.push("Generated dist/index.html");

        return {
          success: true,
          logs,
          outputDir,
          entryHtmlPath
        };
      }
    }

    const renderedSlides = [];
    for (const slidePath of slidePaths) {
      const fullPath = resolveInside(workspaceDir, slidePath);
      const source = await readFile(fullPath, "utf8").catch((error: NodeJS.ErrnoException) => {
        if (error.code === "ENOENT") {
          errors.push({ file: slidePath, message: `Slide file not found: ${slidePath}` });
          return undefined;
        }
        throw error;
      });

      if (source === undefined) {
        continue;
      }

      const sourceKind = slideSourceKindFor(slidePath);
      if (sourceKind === "html" && isFullHtmlDocument(source)) {
        errors.push({
          file: slidePath,
          message: "Multi-slide projects must use HTML fragments with one <section class=\"slide\"> root, not full HTML documents."
        });
        continue;
      }

      if (sourceKind === "html") {
        const fragmentIssues = validateHtmlSlideFragment(source);
        if (fragmentIssues.length) {
          errors.push({
            file: slidePath,
            message: fragmentIssues.join(" ")
          });
          continue;
        }
      }

      const parsed = parseFrontmatter(source);
      renderedSlides.push(renderSlide(parsed, slidePath, sourceKind));
      logs.push(`Rendered ${slidePath}`);
    }

    if (errors.length > 0) {
      return {
        success: false,
        logs,
        outputDir,
        errors
      };
    }

    const html = renderDeckHtml({
      title: config.name ?? "SlideLeaf Presentation",
      slidesHtml: renderedSlides.join("\n"),
      themeCss,
      runtimeJs,
      slideCount: renderedSlides.length
    });
    const quality = analyzeHtmlQuality(html);
    logs.push(...formatQualityLogs(quality));
    const qualityErrors = quality.issues.filter((issue) => issue.severity === "error");
    if (qualityErrors.length) {
      return {
        success: false,
        logs,
        outputDir,
        errors: qualityErrors.map((issue) => ({
          message: `${issue.code}: ${issue.message}`
        }))
      };
    }
    const entryHtmlPath = path.join(outputDir, "index.html");

    await writeFile(entryHtmlPath, html, "utf8");
    await writeManifest(outputDir, config, slidePaths);
    logs.push("Generated dist/index.html");

    return {
      success: true,
      logs,
      outputDir,
      entryHtmlPath
    };
  } catch (error) {
    return {
      success: false,
      logs,
      outputDir,
      errors: [
        ...errors,
        {
          message: error instanceof Error ? error.message : String(error)
        }
      ]
    };
  }
}

async function writeManifest(outputDir: string, config: ProjectConfig, slidePaths: string[]): Promise<void> {
  await writeFile(
    path.join(outputDir, "manifest.json"),
    JSON.stringify(
      {
        name: config.name ?? "SlideLeaf Presentation",
        slides: slidePaths,
        generatedAt: new Date().toISOString()
      },
      null,
      2
    ),
    "utf8"
  );
}

export function parseFrontmatter(source: string): ParsedSlide {
  if (!source.startsWith("---\n") && !source.startsWith("---\r\n")) {
    return { frontmatter: {}, body: source };
  }

  const normalized = source.replace(/\r\n/g, "\n");
  const end = normalized.indexOf("\n---\n", 4);
  if (end === -1) {
    return { frontmatter: {}, body: source };
  }

  const rawFrontmatter = normalized.slice(4, end);
  const body = normalized.slice(end + "\n---\n".length);
  const frontmatter: Record<string, string> = {};

  for (const line of rawFrontmatter.split("\n")) {
    const index = line.indexOf(":");
    if (index === -1) continue;
    const key = line.slice(0, index).trim();
    const value = line.slice(index + 1).trim().replace(/^["']|["']$/g, "");
    if (key) frontmatter[key] = value;
  }

  return { frontmatter, body };
}

function resolveSlidePaths(config: ProjectConfig, explicitEntry?: string): string[] {
  if (Array.isArray(config.slides) && config.slides.length > 0) return config.slides;
  if (explicitEntry) return [explicitEntry];
  if (config.entry) return [config.entry];
  return [];
}

function slideSourceKindFor(sourcePath: string): SlideSourceKind {
  const lower = sourcePath.toLowerCase();
  return lower.endsWith(".html") || lower.endsWith(".htm") ? "html" : "markdown";
}

function isFullHtmlDocument(source: string): boolean {
  return /^\s*<!doctype\s+html/i.test(source) || /^\s*<html[\s>]/i.test(source);
}

function renderFullHtmlDocument(source: string, sourcePath: string): string {
  return rewriteWorkspaceReferences(sanitizeFullHtmlDocument(source), sourcePath);
}

function sanitizeFullHtmlDocument(source: string): string {
  return source.replace(/\b(href|src)\s*=\s*(["'])\s*javascript:[\s\S]*?\2/gi, '$1="#"');
}

function renderSlide(slide: ParsedSlide, sourcePath: string, sourceKind: SlideSourceKind): string {
  const layout = slide.frontmatter.layout ?? "default";
  const title = slide.frontmatter.title ?? "";
  const contentHtml =
    sourceKind === "html"
      ? renderHtmlSlideContent(slide.body, sourcePath)
      : renderLayoutContent(layout, slide.body, sourcePath);
  const titleAttr = escapeHtml(title);

  if (sourceKind === "html" && hasSlideRoot(contentHtml)) {
    return contentHtml;
  }

  return `<section class="slide layout-${escapeAttr(layout)}" aria-label="${escapeAttr(title)}">
  ${title ? `<div class="slide-kicker">${titleAttr}</div>` : ""}
  ${contentHtml}
</section>`;
}

function renderHtmlSlideContent(source: string, sourcePath: string): string {
  return rewriteWorkspaceReferences(sanitizeHtmlFragment(source), sourcePath);
}

function hasSlideRoot(html: string): boolean {
  return /^\s*<(section|article)\b[^>]*\bclass=(["'])[^"']*\bslide\b[^"']*\2/i.test(html);
}

function validateHtmlSlideFragment(source: string): string[] {
  const cleaned = sanitizeHtmlFragment(source).trim();
  const issues: string[] = [];
  const rootMatches = [
    ...cleaned.matchAll(/<(section|article)\b[^>]*\bclass=(["'])[^"']*\bslide\b[^"']*\2[^>]*>/gi)
  ];

  if (rootMatches.length !== 1) {
    issues.push("HTML slide fragments must contain exactly one <section class=\"slide\"> root.");
  }

  if (!/^\s*<(section|article)\b[^>]*\bclass=(["'])[^"']*\bslide\b[^"']*\2[^>]*>[\s\S]*<\/\1>\s*$/i.test(cleaned)) {
    issues.push("HTML slide fragments must be a complete single root fragment, not partial markup or multiple top-level nodes.");
  }

  return issues;
}

function sanitizeHtmlFragment(source: string): string {
  return source
    .replace(/<script\b[\s\S]*?<\/script>/gi, "")
    .replace(/\s+on[a-z]+\s*=\s*"[^"]*"/gi, "")
    .replace(/\s+on[a-z]+\s*=\s*'[^']*'/gi, "")
    .replace(/\s+on[a-z]+\s*=\s*[^\s>]+/gi, "")
    .replace(/\b(href|src)\s*=\s*(["'])\s*javascript:[\s\S]*?\2/gi, '$1="#"');
}

function rewriteWorkspaceReferences(source: string, sourcePath: string): string {
  return source.replace(/\b(src|href)\s*=\s*(["'])([^"']+)\2/gi, (_match, attr: string, quote: string, value: string) => {
    const normalized = normalizeWorkspaceReference(value, sourcePath);
    return `${attr}=${quote}${escapeAttr(normalized)}${quote}`;
  });
}

function renderLayoutContent(layout: string, body: string, sourcePath: string): string {
  if (layout === "two-column") {
    const left = extractDirective(body, "left");
    const right = extractDirective(body, "right");

    if (left !== undefined || right !== undefined) {
      return `<div class="two-column">
  <div>${renderMarkdown(left ?? "", sourcePath)}</div>
  <div>${renderMarkdown(right ?? "", sourcePath)}</div>
</div>`;
    }
  }

  return renderMarkdown(body, sourcePath);
}

function extractDirective(source: string, name: string): string | undefined {
  const pattern = new RegExp(`::${name}\\s*\\n([\\s\\S]*?)\\n::`, "m");
  const match = source.match(pattern);
  return match?.[1]?.trim();
}

export function renderMarkdown(source: string, sourcePath = ""): string {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const blocks: string[] = [];
  let paragraph: string[] = [];
  let list: { type: "ul" | "ol"; items: string[] } | undefined;

  const flushParagraph = () => {
    if (paragraph.length > 0) {
      blocks.push(`<p>${renderInline(paragraph.join(" "), sourcePath)}</p>`);
      paragraph = [];
    }
  };

  const flushList = () => {
    if (list) {
      blocks.push(
        `<${list.type}>${list.items.map((item) => `<li>${renderInline(item, sourcePath)}</li>`).join("")}</${list.type}>`
      );
      list = undefined;
    }
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      flushParagraph();
      flushList();
      continue;
    }

    const heading = /^(#{1,4})\s+(.+)$/.exec(line);
    if (heading) {
      flushParagraph();
      flushList();
      const level = heading[1].length;
      const className = level === 1 ? " class=\"slide-title\"" : "";
      blocks.push(`<h${level}${className}>${renderInline(heading[2], sourcePath)}</h${level}>`);
      continue;
    }

    const ordered = /^\d+\.\s+(.+)$/.exec(line);
    if (ordered) {
      flushParagraph();
      if (!list || list.type !== "ol") {
        flushList();
        list = { type: "ol", items: [] };
      }
      list.items.push(ordered[1]);
      continue;
    }

    const unordered = /^[-*]\s+(.+)$/.exec(line);
    if (unordered) {
      flushParagraph();
      if (!list || list.type !== "ul") {
        flushList();
        list = { type: "ul", items: [] };
      }
      list.items.push(unordered[1]);
      continue;
    }

    flushList();
    paragraph.push(line);
  }

  flushParagraph();
  flushList();

  return blocks.join("\n");
}

export function analyzeHtmlQuality(html: string): HtmlQualityReport {
  const issues: HtmlQualityIssue[] = [];
  const slideMatches = [...html.matchAll(/<(?:section|article|div)\b[^>]*class=(["'])[^"']*\bslide\b[^"']*\1/gi)];
  const slideCount = slideMatches.length;
  const slideBodies = extractSlideBodies(html);
  const textBodies = slideBodies.map((body) => stripHtml(body));

  if (!/<!doctype\s+html/i.test(html)) {
    issues.push({
      severity: "error",
      code: "missing-doctype",
      message: "Generated deck should be a full HTML document with <!doctype html>."
    });
  }

  if (!/<meta\b[^>]*name=(["'])viewport\1/i.test(html)) {
    issues.push({
      severity: "error",
      code: "missing-viewport",
      message: "Missing viewport meta tag. Responsive slide sizing may break."
    });
  }

  if (slideCount === 0) {
    issues.push({
      severity: "error",
      code: "missing-slides",
      message: "No elements with class=\"slide\" were found."
    });
  }

  if (/<script\b[^>]*\bsrc\s*=/i.test(html)) {
    issues.push({
      severity: "error",
      code: "remote-script",
      message: "Remote script tags are not allowed in compiled decks."
    });
  }

  if (/<link\b[^>]*\bhref=(["'])https?:/i.test(html)) {
    issues.push({
      severity: "warning",
      code: "remote-stylesheet",
      message: "Remote stylesheets reduce portability. Inline critical CSS or use local assets."
    });
  }

  if (/\b(?:href|src)\s*=\s*(["'])\s*javascript:/i.test(html)) {
    issues.push({
      severity: "error",
      code: "javascript-url",
      message: "javascript: URLs are not allowed."
    });
  }

  if (!/\.slide\b[\s\S]{0,1200}(?:height|min-height)\s*:\s*(?:100vh|100dvh)/i.test(html)) {
    issues.push({
      severity: "warning",
      code: "slide-height",
      message: "Slides should explicitly use 100vh or 100dvh to preserve presentation framing."
    });
  }

  if (!/overflow\s*:\s*hidden/i.test(html)) {
    issues.push({
      severity: "warning",
      code: "overflow-policy",
      message: "No overflow:hidden rule found. Dense slides may scroll or crop unpredictably."
    });
  }

  if (!/prefers-reduced-motion/i.test(html) && /animation|transition/i.test(html)) {
    issues.push({
      severity: "warning",
      code: "reduced-motion",
      message: "Motion is used without a prefers-reduced-motion fallback."
    });
  }

  if (!/keydown|ArrowRight|ArrowLeft|nextSlide|prevSlide/i.test(html)) {
    issues.push({
      severity: "warning",
      code: "keyboard-navigation",
      message: "No keyboard navigation was detected."
    });
  }

  if (!/progress|counter|slide-count|aria-live/i.test(html)) {
    issues.push({
      severity: "warning",
      code: "navigation-feedback",
      message: "No progress or slide counter indicator was detected."
    });
  }

  textBodies.forEach((text, index) => {
    const wordCount = text.split(/\s+/).filter(Boolean).length;
    const bulletCount = countSlideListItems(slideBodies[index] ?? "");
    if (wordCount > 180) {
      issues.push({
        severity: "warning",
        code: "dense-slide",
        message: `Slide ${index + 1} has about ${wordCount} words. Split dense content for better readability.`
      });
    }
    if (bulletCount > 7) {
      issues.push({
        severity: "warning",
        code: "too-many-bullets",
        message: `Slide ${index + 1} has ${bulletCount} bullet/list items. Keep lists short or split the slide.`
      });
    }
  });

  const errorCount = issues.filter((issue) => issue.severity === "error").length;
  const warningCount = issues.length - errorCount;
  const score = Math.max(0, 100 - errorCount * 28 - warningCount * 6);

  return { score, slideCount, issues };
}

function formatQualityLogs(report: HtmlQualityReport): string[] {
  const logs = [`Quality check: score ${report.score}/100, slides ${report.slideCount}`];
  for (const issue of report.issues) {
    logs.push(`Quality ${issue.severity}: ${issue.code} - ${issue.message}`);
  }
  if (!report.issues.length) logs.push("Quality check passed with no issues");
  return logs;
}

function extractSlideBodies(html: string): string[] {
  const bodies: string[] = [];
  const pattern = /<(section|article|div)\b([^>]*)class=(["'])[^"']*\bslide\b[^"']*\3[^>]*>([\s\S]*?)<\/\1>/gi;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(html))) {
    bodies.push(match[4] ?? "");
  }
  return bodies;
}

function stripHtml(html: string): string {
  return html
    .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
    .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function countSlideListItems(html: string): number {
  return (html.match(/<li\b/gi) ?? []).length;
}

function renderInline(source: string, sourcePath: string): string {
  const escaped = escapeHtml(source);
  return escaped
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_match, alt: string, src: string) => {
      const normalizedSrc = normalizeAssetReference(src, sourcePath);
      return `<img src="${escapeAttr(normalizedSrc)}" alt="${escapeAttr(alt)}" />`;
    })
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/`([^`]+)`/g, "<code>$1</code>");
}

function normalizeAssetReference(src: string, sourcePath: string): string {
  return normalizeWorkspaceReference(src, sourcePath);
}

function normalizeWorkspaceReference(src: string, sourcePath: string): string {
  if (/^(https?:|data:|#)/i.test(src)) {
    return src;
  }

  if (/^(mailto:|tel:)/i.test(src)) {
    return src;
  }

  if (/^javascript:/i.test(src.trim())) {
    return "#";
  }

  const { basePath, suffix } = splitReferenceSuffix(src);
  const slideDir = path.posix.dirname(sourcePath.replace(/\\/g, "/"));
  const normalized = path.posix.normalize(path.posix.join(slideDir, basePath)).replace(/^\/+/, "");

  if (normalized.startsWith("../")) {
    return src;
  }

  return `${normalized}${suffix}`;
}

function splitReferenceSuffix(src: string): { basePath: string; suffix: string } {
  const queryIndex = src.search(/[?#]/);
  if (queryIndex === -1) {
    return { basePath: src, suffix: "" };
  }
  return {
    basePath: src.slice(0, queryIndex),
    suffix: src.slice(queryIndex)
  };
}

function renderDeckHtml(options: { title: string; slidesHtml: string; themeCss: string; runtimeJs: string; slideCount: number }): string {
  const initialCounter = options.slideCount > 0 ? `1 / ${options.slideCount}` : "1 / 1";
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(options.title)}</title>
  <style>
${baseCss()}
${options.themeCss}
  </style>
</head>
<body>
  <main class="deck">
${options.slidesHtml}
  </main>
  <nav class="slideleaf-nav" aria-label="Slide navigation">
    <button type="button" data-prev-slide aria-label="Previous slide">Prev</button>
    <span data-slide-counter aria-live="polite">${initialCounter}</span>
    <button type="button" data-next-slide aria-label="Next slide">Next</button>
  </nav>
  <div class="slideleaf-progress" data-slide-progress></div>
  <script>
${options.runtimeJs}
  </script>
</body>
</html>
`;
}

function baseCss(): string {
  return `html {
  scroll-behavior: smooth;
}

body {
  margin: 0;
  overflow: hidden;
}

.deck {
  width: 100vw;
  height: 100vh;
  height: 100dvh;
  position: relative;
  overflow: hidden;
}

.slide {
  position: absolute !important;
  inset: 0 !important;
  width: 100vw;
  height: 100vh;
  height: 100dvh;
  overflow: hidden;
  visibility: hidden !important;
  opacity: 0 !important;
  pointer-events: none !important;
  z-index: 0 !important;
  box-sizing: border-box;
}

.slide.active {
  visibility: visible !important;
  opacity: 1 !important;
  pointer-events: auto !important;
  z-index: 1 !important;
}

.slideleaf-nav {
  position: fixed;
  left: 50%;
  bottom: 18px;
  transform: translateX(-50%);
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 10px;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.82);
  color: white;
  padding: 9px 12px;
  font: 700 13px/1 system-ui, sans-serif;
  backdrop-filter: blur(12px);
}

.slideleaf-nav button {
  border: 0;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.14);
  color: white;
  cursor: pointer;
  font: inherit;
  padding: 8px 11px;
}

.slideleaf-progress {
  position: fixed;
  left: 0;
  bottom: 0;
  z-index: 1001;
  width: 0;
  height: 5px;
  background: var(--accent, #2563eb);
  transition: width 0.25s ease;
}

.slide-kicker {
  color: var(--muted, #64748b);
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0;
  margin-bottom: 18px;
  text-transform: uppercase;
}

code {
  background: rgba(15, 23, 42, 0.08);
  border-radius: 4px;
  padding: 0 0.25em;
}

[data-reveal] {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    scroll-behavior: auto !important;
    transition-duration: 0.01ms !important;
  }
}
`;
}

function composeRuntimeScript(projectRuntimeJs: string, logs: string[]): string {
  const coreRuntime = defaultRuntimeJs();
  const extensionRuntime = projectRuntimeJs.trim();
  if (!extensionRuntime) return coreRuntime;
  if (runtimeControlsDeckNavigation(extensionRuntime)) {
    logs.push("Skipped project runtime deck controller because the renderer owns slide navigation and counters.");
    return coreRuntime;
  }
  logs.push("Appended project runtime as a non-navigation extension.");
  return `${coreRuntime}\n\n${extensionRuntime}`;
}

function runtimeControlsDeckNavigation(source: string): boolean {
  return [
    /querySelectorAll\(\s*(["'`])\.slide\1/i,
    /classList\.(?:add|remove|toggle)\(\s*(["'`])active\1/i,
    /\[data-(?:prev|next)-slide\]/i,
    /data-slide-counter/i,
    /addEventListener\(\s*(["'`])keydown\1/i,
    /\bnav-ui\b/i,
    /\bprogress-bar\b/i
  ].some((pattern) => pattern.test(source));
}

function defaultRuntimeJs(): string {
  return `(() => {
  if (window.__slideleafDeckInitialized) return;
  window.__slideleafDeckInitialized = true;
  const slides = Array.from(document.querySelectorAll(".slide"));
  const counter = document.querySelector("[data-slide-counter]");
  const progress = document.querySelector("[data-slide-progress]");
  let index = Math.max(0, slides.findIndex((slide) => slide.classList.contains("active")));
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reducedMotion) document.documentElement.dataset.reducedMotion = "true";
  function updateReveals(slide, isActive) {
    const reveals = Array.from(slide.querySelectorAll("[data-reveal]"));
    reveals.forEach((element, revealIndex) => {
      if (isActive) {
        if (reducedMotion) {
          element.classList.add("revealed");
        } else {
          window.setTimeout(() => element.classList.add("revealed"), revealIndex * 70);
        }
      } else {
        element.classList.remove("revealed");
      }
    });
  }
  function setSlide(nextIndex) {
    if (!slides.length) return;
    index = (nextIndex + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      const isActive = slideIndex === index;
      slide.classList.toggle("active", isActive);
      slide.setAttribute("aria-hidden", isActive ? "false" : "true");
      updateReveals(slide, isActive);
    });
    if (counter) counter.textContent = String(index + 1) + " / " + String(slides.length);
    if (progress instanceof HTMLElement) progress.style.width = String(((index + 1) / slides.length) * 100) + "%";
    document.dispatchEvent(new CustomEvent("slideleaf:slidechange", {
      detail: { index, count: slides.length, slide: slides[index] }
    }));
  }
  function next() { setSlide(index + 1); }
  function prev() { setSlide(index - 1); }
  document.querySelector("[data-prev-slide]")?.addEventListener("click", prev);
  document.querySelector("[data-next-slide]")?.addEventListener("click", next);
  document.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight" || event.key === " " || event.key === "Enter") next();
    if (event.key === "ArrowLeft" || event.key === "Backspace") prev();
  });
  window.SlideLeafDeck = {
    goTo: setSlide,
    next,
    prev,
    getIndex: () => index,
    getCount: () => slides.length
  };
  setSlide(index);
})();`;
}

async function readOptionalText(filePath: string): Promise<string> {
  try {
    return await readFile(filePath, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return "";
    }
    throw error;
  }
}

function sanitizeRuntimeScript(source: string): string {
  return source
    .replace(/<\/script/gi, "<\\/script")
    .replace(/\b(?:fetch|XMLHttpRequest|WebSocket|EventSource)\s*\(/gi, "void(");
}

function resolveInside(rootDir: string, relativePath: string): string {
  const root = path.resolve(rootDir);
  const fullPath = path.resolve(root, relativePath);
  const rel = path.relative(root, fullPath);

  if (relativePath.includes("\0") || rel.startsWith("..") || path.isAbsolute(rel)) {
    throw new Error(`Path escapes workspace: ${relativePath}`);
  }

  return fullPath;
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeAttr(input: string): string {
  return escapeHtml(input).replace(/'/g, "&#39;");
}
