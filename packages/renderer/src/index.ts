import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import type { RenderError, RenderResult } from "@slideleaf/shared";

export type RenderProjectOptions = {
  workspaceDir: string;
  outputDir: string;
  entry?: string;
};

type ProjectConfig = {
  name?: string;
  entry?: string;
  slides?: string[];
  theme?: string;
  slideSize?: string;
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

    const themePath = config.theme ?? "themes/default.css";
    const themeCss = await readOptionalText(resolveInside(workspaceDir, themePath));
    if (themeCss) {
      await writeFile(path.join(outputDir, "theme.css"), themeCss, "utf8");
      logs.push(`Loaded theme ${themePath}`);
    }

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
        await writeFile(entryHtmlPath, renderFullHtmlDocument(fullDeckSource, fullDeckPath), "utf8");
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

      const parsed = parseFrontmatter(source);
      const sourceKind = slideSourceKindFor(slidePath);
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
      themeCss
    });
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
  if (explicitEntry) return [explicitEntry];
  if (Array.isArray(config.slides) && config.slides.length > 0) return config.slides;
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

function renderDeckHtml(options: { title: string; slidesHtml: string; themeCss: string }): string {
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
</body>
</html>
`;
}

function baseCss(): string {
  return `html {
  scroll-behavior: smooth;
}

body {
  overflow-y: auto;
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
`;
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
