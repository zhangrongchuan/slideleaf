import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = process.argv[2];
if (!repoRoot) {
  console.error("Usage: node scripts/import-beautiful-html-templates.mjs <beautiful-html-templates repo>");
  process.exit(1);
}

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputDir = path.join(packageRoot, "content", "style-directions");
mkdirSync(outputDir, { recursive: true });

const templatesDir = path.join(repoRoot, "templates");
const templateDirs = readdirSync(templatesDir, { withFileTypes: true })
  .filter((item) => item.isDirectory())
  .map((item) => item.name)
  .sort();

for (const slug of templateDirs) {
  const templateRoot = path.join(templatesDir, slug);
  const metadata = JSON.parse(readFileSync(path.join(templateRoot, "template.json"), "utf8"));
  const html = readFileSync(path.join(templateRoot, "template.html"), "utf8");
  const siblingCss = readOptional(path.join(templateRoot, "styles.css"));
  const siblingJs = readOptional(path.join(templateRoot, "deck-stage.js"));
  const cssSource = `${extractStyleBlocks(html)}\n${siblingCss}`;
  const cssVariables = extractCssVariables(cssSource).slice(0, 22);
  const slideClasses = extractSlideClasses(html).slice(0, 16);
  const layoutClasses = extractLayoutClasses(html).slice(0, 18);
  const cssTokens = buildCssTokens(cssVariables, metadata);
  const coreCssGrammar = extractCoreCssGrammar(cssSource, [...slideClasses, ...layoutClasses], metadata.slug);
  const motionAndEffects = buildMotionAndEffects(html, cssSource, siblingJs, metadata.slug);
  const sampleMarkup = buildSampleMarkup(metadata);
  const fileName = `template-${slug}.md`;
  writeFileSync(
    path.join(outputDir, fileName),
    renderEntry(metadata, cssVariables, slideClasses, layoutClasses, cssTokens, coreCssGrammar, motionAndEffects, sampleMarkup),
    "utf8"
  );
}

function renderEntry(metadata, cssVariables, slideClasses, layoutClasses, cssTokens, coreCssGrammar, motionAndEffects, sampleMarkup) {
  const tags = unique([
    "template",
    "beautiful-html-templates",
    metadata.slug,
    metadata.scheme,
    metadata.formality,
    metadata.density,
    ...(metadata.mood ?? []),
    ...(metadata.tone ?? []),
    ...(metadata.occasion ?? []),
    ...chineseTagsFor(metadata)
  ]);
  const sourceInfluences = unique([
    `beautiful-html-templates/${metadata.slug}`,
    metadata.typography?.display,
    metadata.typography?.body,
    metadata.typography?.mono
  ].filter(Boolean));
  const palette = metadata.palette
    ? Object.entries(metadata.palette)
        .filter(([, value]) => typeof value === "string")
        .map(([key, value]) => `${key}: ${value}`)
    : [];
  const typography = metadata.typography
    ? Object.entries(metadata.typography)
        .filter(([, value]) => typeof value === "string")
        .map(([key, value]) => `${key}: ${value}`)
    : [];

  return `---
id: template-${metadata.slug}
category: style-direction
title: Template Style - ${metadata.name}
tags: ${tags.join(", ")}
motionPreset: progressive-reveal
sourceInfluences: ${sourceInfluences.join(", ")}
---
## When To Use
- ${metadata.best_for}
- Use when the requested mood overlaps with: ${(metadata.mood ?? []).join(", ")}.
- Use when the occasion is close to: ${(metadata.occasion ?? []).join(", ")}.
- Good fit for ${metadata.formality} formality, ${metadata.density} density, and a ${metadata.scheme} color scheme.

## When Not To Use
- ${metadata.avoid_for}
- Do not use when the audience expects a materially different formality level or content density.
- Do not use if the deck needs a conflicting visual language; pick a different template direction instead.

## Good Structure
- Visual thesis: ${metadata.tagline}
- Palette discipline: ${palette.join("; ") || "Use the original template palette as the closed color system."}
- Typography discipline: ${typography.join("; ") || "Preserve the original font hierarchy and fallback logic."}
- Layout grammar: ${layoutClasses.length ? layoutClasses.join(", ") : "reuse the template's grid, card, hero, and table grammar"}.
- Slide grammar: ${slideClasses.length ? slideClasses.join(", ") : "cover, section, proof, comparison, quote, and closing variants"}.
- Convert the original full-template system into SlideLeaf fragments: one section.slide per file, shared CSS in themes/deck.css, and no project-level navigation code inside slide fragments.
- Extend missing layouts by reusing the same fonts, palette, spacing rhythm, decorative vocabulary, and component grammar.

## CSS Tokens
\`\`\`css
${cssTokens}
\`\`\`

## Core CSS Grammar
\`\`\`css
${coreCssGrammar}
\`\`\`

## Motion And Effects
${motionAndEffects}

## Anti Patterns
- Mixing this template with another template family in the same deck.
- Recoloring the palette or replacing the type system because it feels convenient.
- Removing signature decoration, chrome, texture, mono labels, or page furniture that carries the template identity.
- Copying the source template's deck navigation, keyboard handler, or slide-stage runtime into SlideLeaf; the renderer owns navigation.
- Turning the style into generic cards, centered bullets, purple gradients, or glassmorphism.

## Evidence Requirements
- Match density to evidence: ${metadata.density} density means proof blocks should be ${densityGuidance(metadata.density)}.
- Keep sources, assumptions, and benchmark labels visible but styled in the template's quiet chrome language.
- Use real metrics, cases, or explicit placeholders; never invent claims to fill the layout.

## Suggested Visual Components
${suggestedComponents(metadata, layoutClasses).map((item) => `- ${item}`).join("\n")}

## Example Markup
\`\`\`html
${sampleMarkup}
\`\`\`

## QA Checklist
- The generated slide clearly belongs to ${metadata.name}, not to a generic SlideLeaf default.
- The palette, typography, spacing, and decorative vocabulary remain internally consistent.
- The slide uses SlideLeaf fragment rules: one section.slide root, no script, no style tag, no remote assets.
- Renderer-owned navigation is not duplicated.
- Content density, formality, and tone match the user's brief and audience.
`;
}

function readOptional(filePath) {
  return existsSync(filePath) ? readFileSync(filePath, "utf8") : "";
}

function extractStyleBlocks(html) {
  return [...html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)].map((match) => match[1]).join("\n\n");
}

function extractCssVariables(css) {
  const variables = [];
  for (const match of css.matchAll(/--([a-z0-9_-]+)\s*:\s*([^;]+);/gi)) {
    variables.push(`--${match[1]}: ${match[2].trim()}`);
  }
  return unique(variables);
}

function buildCssTokens(cssVariables, metadata) {
  const lines = [];
  lines.push(`.style-template-${metadata.slug} {`);
  for (const variable of cssVariables) {
    lines.push(`  ${variable};`);
  }
  if (metadata.palette) {
    for (const [key, value] of Object.entries(metadata.palette)) {
      if (typeof value === "string" && /^#|rgb|hsl|var\(/i.test(value.trim())) {
        lines.push(`  --template-${key.replace(/_/g, "-")}: ${value};`);
      }
    }
  }
  if (metadata.typography) {
    for (const [key, value] of Object.entries(metadata.typography)) {
      if (typeof value === "string" && !key.endsWith("style")) {
        lines.push(`  --template-font-${key.replace(/_/g, "-")}: "${value}", system-ui, sans-serif;`);
      }
    }
  }
  lines.push("}");
  return unique(lines).join("\n");
}

function extractSlideClasses(html) {
  const classes = [];
  for (const match of html.matchAll(/<section\b[^>]*class=(["'])(.*?)\1/gi)) {
    for (const className of match[2].split(/\s+/)) {
      if (className && className !== "slide") classes.push(className);
    }
  }
  return unique(classes);
}

function extractLayoutClasses(html) {
  const classes = [];
  for (const match of html.matchAll(/class=(["'])(.*?)\1/gi)) {
    for (const className of match[2].split(/\s+/)) {
      if (
        /(?:grid|card|panel|stat|metric|quote|table|timeline|flow|hero|cover|toc|chapter|compare|feature|layout|content|body|rail|note|tag|kicker|chrome)/i.test(
          className
        )
      ) {
        classes.push(className);
      }
    }
  }
  return unique(classes);
}

function extractCoreCssGrammar(cssSource, candidateClasses, slug) {
  const normalized = stripCssComments(cssSource);
  const blocks = extractCssBlocks(normalized);
  const wantedClasses = new Set(candidateClasses.map((item) => item.replace(/^\./, "")));
  const selected = [];
  for (const block of blocks) {
    if (selected.join("\n").length > 5200) break;
    if (isForbiddenCssBlock(block)) continue;
    if (isSignatureCssBlock(block, wantedClasses)) selected.push(compactCssBlock(block));
  }
  const keyframes = extractKeyframes(normalized)
    .filter((block) => !isNavigationKeyframe(block))
    .slice(0, 3)
    .map(compactCssBlock);
  const output = unique([...selected.slice(0, 18), ...keyframes]).join("\n\n");
  return output || `.style-template-${slug} .slide-content {\n  display: grid;\n  gap: clamp(18px, 2.2vw, 34px);\n}\n\n.style-template-${slug} .card {\n  border: 1px solid currentColor;\n  padding: clamp(20px, 2.2vw, 36px);\n}`;
}

function stripCssComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, "");
}

function extractCssBlocks(css) {
  const blocks = [];
  let index = 0;
  while (index < css.length) {
    const open = css.indexOf("{", index);
    if (open === -1) break;
    const selector = css.slice(index, open).trim();
    let depth = 1;
    let cursor = open + 1;
    while (cursor < css.length && depth > 0) {
      if (css[cursor] === "{") depth += 1;
      else if (css[cursor] === "}") depth -= 1;
      cursor += 1;
    }
    if (selector && !selector.startsWith("@keyframes") && !selector.startsWith("@media")) {
      blocks.push(`${selector} {${css.slice(open + 1, cursor - 1)}}`);
    }
    index = cursor;
  }
  return blocks;
}

function extractKeyframes(css) {
  const blocks = [];
  const regex = /@keyframes\s+[a-z0-9_-]+\s*\{/gi;
  let match;
  while ((match = regex.exec(css))) {
    let depth = 1;
    let cursor = regex.lastIndex;
    while (cursor < css.length && depth > 0) {
      if (css[cursor] === "{") depth += 1;
      else if (css[cursor] === "}") depth -= 1;
      cursor += 1;
    }
    blocks.push(css.slice(match.index, cursor));
    regex.lastIndex = cursor;
  }
  return blocks;
}

function isForbiddenCssBlock(block) {
  return /(?:^|\s|,)(?:html|body|#deck|\.deck|\.slide(?:\.|:|\s|\[|,)|\.slideleaf-nav|\.slideleaf-progress|\.nav|\.nav-ui|\.progress-bar|\.controls|\.dots|\.dot|\.counter|button|deck-stage|tapzone|overlay)/i.test(block);
}

function isSignatureCssBlock(block, wantedClasses) {
  const selector = block.slice(0, block.indexOf("{"));
  if (/\[data-anim\]|\[data-delay\]|grain|scanline|crt|starfield|particle|paper|noise|chrome|kicker|label|stamp|rule|card|grid|stat|quote|table|timeline|flow|matrix|pyramid|pie|chart|hero|cover/i.test(selector)) {
    return true;
  }
  for (const className of wantedClasses) {
    if (className && selector.includes(`.${className}`)) return true;
  }
  return false;
}

function isNavigationKeyframe(block) {
  return /slide|deck|nav|progress/i.test(block);
}

function compactCssBlock(block) {
  return block
    .replace(/url\((["'])data:[\s\S]*?\1\)/g, "url(/* embedded texture omitted */)")
    .replace(/[ \t]+/g, " ")
    .replace(/\s*([{};,>])\s*/g, "$1 ")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+\n/g, "\n")
    .trim()
    .slice(0, 1400);
}

function buildMotionAndEffects(html, cssSource, siblingJs, slug) {
  const notes = [];
  const dataAnimValues = unique([...html.matchAll(/data-anim=(["'])(.*?)\1/g)].map((match) => match[2])).slice(0, 10);
  const keyframes = unique([...cssSource.matchAll(/@keyframes\s+([a-z0-9_-]+)/gi)].map((match) => match[1])).slice(0, 10);
  const effectClasses = unique(
    [...html.matchAll(/class=(["'])(.*?)\1/g)]
      .flatMap((match) => match[2].split(/\s+/))
      .filter((className) => /grain|scanline|crt|glow|star|particle|paper|noise|shadow|sticker|stamp|rule|reveal|marquee|float|orbit/i.test(className))
  ).slice(0, 12);

  if (dataAnimValues.length) {
    notes.push(`- CSS reveal vocabulary from source template: ${dataAnimValues.join(", ")}. In SlideLeaf, map these to data-reveal or CSS selectors under .slide.active; do not add a custom slide activator.`);
  }
  if (keyframes.length) {
    notes.push(`- Reusable keyframe names detected: ${keyframes.join(", ")}. Keep subtle entrance, rule-reveal, scale-in, glow, or float effects; avoid motion that competes with reading.`);
  }
  if (effectClasses.length) {
    notes.push(`- Decorative effect classes worth preserving as CSS-only motifs: ${effectClasses.join(", ")}.`);
  }
  if (/data-value|data-height|count|counter/i.test(html) && !/counter|slide-counter/i.test(slug)) {
    notes.push("- Safe optional JS effect: metric count-up or CSS bar build may run inside the active slide only.");
    notes.push(`\`\`\`js
function runTemplateMetricEffects(slide = document.querySelector(".slide.active")) {
  slide?.querySelectorAll("[data-count-to]").forEach((node) => {
    const target = Number(node.getAttribute("data-count-to") || "0");
    const start = performance.now();
    requestAnimationFrame(function tick(now) {
      const p = Math.min(1, (now - start) / 700);
      node.textContent = String(Math.round(target * p));
      if (p < 1) requestAnimationFrame(tick);
    });
  });
}
document.addEventListener("slideleaf:slidechange", (event) => runTemplateMetricEffects(event.detail?.slide));
runTemplateMetricEffects();
\`\`\``);
  }
  if (/mousemove|pointermove/i.test(`${html}\n${siblingJs}`) && !/data-deck|deck-stage|tapzone/i.test(siblingJs)) {
    notes.push("- Safe optional JS effect: pointer-driven CSS variables for ambient parallax, without changing slide state.");
    notes.push(`\`\`\`js
window.addEventListener("pointermove", (event) => {
  document.documentElement.style.setProperty("--pointer-x", String(event.clientX / window.innerWidth));
  document.documentElement.style.setProperty("--pointer-y", String(event.clientY / window.innerHeight));
}, { passive: true });
\`\`\``);
  }
  if (!notes.length) {
    notes.push("- Prefer CSS-only motion for this template: data-reveal, opacity/transform entrance, subtle rule draw, card cascade, and reduced-motion fallback.");
  }
  notes.push("- Forbidden JS from source template: slide navigation, keyboard handlers, deck transform, page counters, progress bars, active class toggles, custom elements that own the deck stage.");
  notes.push("- If runtime/deck.js is needed, use it only as a non-navigation extension and listen to the renderer's slideleaf:slidechange event.");
  return notes.join("\n");
}

function suggestedComponents(metadata, layoutClasses) {
  const components = ["executive-summary", "section-divider"];
  const haystack = `${metadata.best_for} ${metadata.avoid_for} ${metadata.density} ${(metadata.occasion ?? []).join(" ")} ${(metadata.tone ?? []).join(" ")} ${layoutClasses.join(" ")}`.toLowerCase();
  if (/investor|board|consulting|advisory|report|research|finance|policy|academic|high/.test(haystack)) {
    components.push("metric-system", "comparison-table", "evidence-panel");
  }
  if (/startup|pitch|launch|founder|product|saas|demo|tech|developer/.test(haystack)) {
    components.push("product-demo-flow", "roadmap", "architecture-diagram");
  }
  if (/brand|creative|agency|design|editorial|manifesto|culture|fashion|studio/.test(haystack)) {
    components.push("poster-hero", "quote-focus", "moodboard-grid");
  }
  if (/research|white paper|academic|policy|synthesis|qualitative/.test(haystack)) {
    components.push("narrative-timeline", "annotated-proof", "source-note");
  }
  if (/high/.test(metadata.density ?? "")) {
    components.push("dense-table", "multi-card-diagnosis");
  }
  return unique(components).slice(0, 9);
}

function buildSampleMarkup(metadata) {
  const className = `style-template-${metadata.slug}`;
  const visual = (metadata.density === "high" && "metric-system") || (metadata.formality === "high" && "executive-summary") || "comparison-table";
  return `<section class="slide ${className}" data-motion="progressive-reveal" data-visual="${visual}">
  <div class="slide-content">
    <p class="eyebrow">${metadata.name}</p>
    <h1>${escapeHtml(shortActionTitleFor(metadata))}</h1>
    <div class="card-grid">
      <article class="card" data-reveal>
        <h3>Visual thesis</h3>
        <p>${escapeHtml(metadata.tagline)}</p>
      </article>
      <article class="card" data-reveal>
        <h3>Best use</h3>
        <p>${escapeHtml(firstSentence(metadata.best_for))}</p>
      </article>
    </div>
  </div>
</section>`;
}

function shortActionTitleFor(metadata) {
  if (/investor|board|consulting|advisory|report|research|academic|policy/i.test(`${metadata.best_for} ${(metadata.occasion ?? []).join(" ")}`)) {
    return `${metadata.name} gives serious arguments a distinctive editorial system`;
  }
  if (/creative|brand|design|fashion|culture|studio/i.test(`${metadata.best_for} ${(metadata.occasion ?? []).join(" ")}`)) {
    return `${metadata.name} turns the deck into a recognizable design object`;
  }
  return `${metadata.name} creates a clear visual point of view for this story`;
}

function firstSentence(input) {
  return String(input ?? "").split(/(?<=[.!?])\s+/)[0] || "";
}

function densityGuidance(density) {
  if (density === "high") return "specific, compact, and numerous enough for analytical slides";
  if (density === "low") return "selective and high-signal, with fewer claims per slide";
  return "balanced, with enough supporting detail to avoid empty cards";
}

function chineseTagsFor(metadata) {
  const text = `${metadata.name} ${metadata.tagline} ${metadata.best_for} ${(metadata.occasion ?? []).join(" ")} ${(metadata.mood ?? []).join(" ")} ${(metadata.tone ?? []).join(" ")}`.toLowerCase();
  const tags = [];
  if (/investor|founder|pitch|startup|finance|investment/.test(text)) tags.push("投资人", "融资", "路演", "创业");
  if (/board|ceo|executive|consulting|advisory|strategy/.test(text)) tags.push("CEO", "董事会", "战略", "咨询");
  if (/technical|developer|tech|saas|product|architecture|demo/.test(text)) tags.push("技术", "开发者", "产品", "SaaS");
  if (/research|academic|white paper|policy|report|synthesis/.test(text)) tags.push("研究", "报告", "学术", "白皮书");
  if (/brand|creative|design|agency|editorial|culture|fashion|studio/.test(text)) tags.push("品牌", "创意", "设计", "编辑感");
  if (/playful|warm|friendly|community|workshop/.test(text)) tags.push("温暖", "活泼", "社区", "工作坊");
  if (/dark|navy|nocturnal|signal|vellum|studio|orbit/.test(text)) tags.push("暗色", "高级", "科技感");
  if (/professional|polished|institutional|trustworthy|formal|high/.test(text)) tags.push("专业", "正式", "高级");
  return tags;
}

function unique(items) {
  return [...new Set(items.filter(Boolean).map((item) => String(item).trim()).filter(Boolean))];
}

function escapeHtml(input) {
  return String(input ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
