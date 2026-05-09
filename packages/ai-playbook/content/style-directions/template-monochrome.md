---
id: template-monochrome
category: style-direction
title: Template Style - Monochrome
tags: template, beautiful-html-templates, monochrome, light, high, restrained, literary, archival, ledger, considered, neutral, honest, user research synthesis, white paper, longform report, academic deck, policy brief, advisory deliverable, bilingual EN/CN deck, CEO, 董事会, 战略, 咨询, 技术, 开发者, 产品, SaaS, 研究, 报告, 学术, 白皮书, 品牌, 创意, 设计, 编辑感
motionPreset: progressive-reveal
sourceInfluences: beautiful-html-templates/monochrome, Lora, Jost, JetBrains Mono
---
## When To Use
- Anything that should feel like a hand-typeset ledger: user research synthesis, white papers, longform reports, academic and policy briefs, advisory deliverables, bilingual EN/CN reports. Equally good for tech, design, or brand decks that want their words to be the only thing on the page.
- Use when the requested mood overlaps with: restrained, literary, archival, ledger.
- Use when the occasion is close to: user research synthesis, white paper, longform report, academic deck, policy brief, advisory deliverable, bilingual EN/CN deck.
- Good fit for high formality, high density, and a light color scheme.

## When Not To Use
- Decks that need visual personality or color-led storytelling — the all-ink palette is intentionally austere.
- Do not use when the audience expects a materially different formality level or content density.
- Do not use if the deck needs a conflicting visual language; pick a different template direction instead.

## Good Structure
- Visual thesis: Ivory ledger paper with all-black type; Lora serif headlines, Jost body, no color at all.
- Palette discipline: bg: #fafadf; bg_alt: #f2f2d2; bg_cream: #f5f0e4; fg: #1a1a16; fg_2: #5e5e54; description: ivory and pale-cream paper with deep ink-black type only; no color at all; the system runs on typography, line, and white space
- Typography discipline: display: Lora; body: Jost; mono: JetBrains Mono; serif_cn: Noto Serif SC; sans_cn: Noto Sans SC; style: literary serif headlines + clean geometric sans body + technical mono; reads like a hand-typeset ledger
- Layout grammar: slide--cover, cover-body, cover-meta, slide--chapter, chapter-num, chapter-rule, slide--statement, slide-chrome, statement-body, kicker, slide-body, slide--stats, stats-grid, stat-card, stat-value, stat-label, stat-note, body.
- Slide grammar: slide--cover, light, slide--chapter, dark, slide--statement, slide--split, slide--stats, slide--list, slide--compare, slide--quote, slide--dense, slide--chart, slide--diagram, slide--pie, slide--vtimeline, slide--cycle.
- Convert the original full-template system into SlideLeaf fragments: one section.slide per file, shared CSS in themes/deck.css, and no project-level navigation code inside slide fragments.
- Extend missing layouts by reusing the same fonts, palette, spacing rhythm, decorative vocabulary, and component grammar.

## CSS Tokens
```css
.style-template-monochrome {
--c-bg: #fafadf;
--c-bg-alt: #f2f2d2;
--c-bg-light: #fafadf;
--c-bg-light-alt: #f0f0d4;
--c-bg-cream: #f5f0e4;
--c-fg: #1a1a16;
--c-fg-2: #5e5e54;
--c-fg-3: #8a8a80;
--c-fg-light: #1a1a16;
--c-fg-light-2: #5e5e54;
--c-fg-light-3: #8a8a80;
--c-accent: #1a1a16;
--c-border: #1a1a16;
--c-border-light: #1a1a16;
--c-card-a: #fafadf;
--c-card-b: #f5f0e4;
--c-card-c: #fafadf;
--f-display: "Jost", "Noto Sans SC", system-ui, sans-serif;
--f-heading: "Jost", "Noto Sans SC", system-ui, sans-serif;
--f-body: "Jost", "Noto Sans SC", system-ui, sans-serif;
--f-serif: "Lora", "Noto Serif SC", Georgia, serif;
--f-mono: "JetBrains Mono", monospace;
--template-bg: #fafadf;
--template-bg-alt: #f2f2d2;
--template-bg-cream: #f5f0e4;
--template-fg: #1a1a16;
--template-fg-2: #5e5e54;
--template-font-display: "Lora", system-ui, sans-serif;
--template-font-body: "Jost", system-ui, sans-serif;
--template-font-mono: "JetBrains Mono", system-ui, sans-serif;
--template-font-serif-cn: "Noto Serif SC", system-ui, sans-serif;
--template-font-sans-cn: "Noto Sans SC", system-ui, sans-serif;
}
```

## Core CSS Grammar
```css
.slide-body{ min-height: 0; }

[data-anim]{ opacity: 0; }

.body{ font-family: var(--f-body); font-size: var(--sz-body); font-weight: 300; line-height: 1.7; }

.label{ font-family: var(--f-mono); font-size: var(--sz-label); font-weight: 400; letter-spacing: 0.12em; text-transform: uppercase; }

.dark .muted{ color: var(--c-fg-2); }

.light .muted{ color: var(--c-fg-light-2); }

.slide-chrome, .slide-foot{ display: flex; justify-content: space-between; align-items: center; }

.slide-chrome{ padding-bottom: var(--gap-sm); border-bottom: 1px solid var(--c-border); margin-bottom: var(--gap-md); }

.light .slide-chrome, .light .slide-foot, .cream .slide-chrome, .cream .slide-foot{ border-color: var(--c-border-light); }

.slide--cover .slide-chrome, .slide--cover .slide-foot, .slide--chapter .slide-chrome, .slide--chapter .slide-foot, .slide--quote .slide-chrome, .slide--quote .slide-foot, .slide--end .slide-chrome, .slide--end .slide-foot{ display: none; }

.dark .slide-sidebar::before{ background: var(--c-border); }

.sidebar-label{ font-family: var(--f-mono); font-size: 0.65vw; letter-spacing: 0.18em; text-transform: uppercase; color: var(--c-fg-light-3); writing-mode: vertical-rl; transform: rotate(180deg); white-space: nowrap; padding-left: 0.8vw; }

.dark .sidebar-label{ color: var(--c-fg-3); }

.slide--cover{ display: flex; flex-direction: column; justify-content: flex-end; }

.cover-body{ display: flex; flex-direction: column; flex: 1; justify-content: flex-end; gap: var(--gap-md); }

.cover-meta{ display: flex; justify-content: space-between; align-items: flex-end; margin-top: var(--gap-lg); padding-top: var(--gap-sm); border-top: 1px solid var(--c-border-light); }

.slide--chapter{ display: flex; flex-direction: column; justify-content: center; }

.chapter-num{ font-family: var(--f-mono); font-size: var(--sz-label); letter-spacing: 0.2em; text-transform: uppercase; color: var(--c-accent); margin-bottom: var(--gap-md); }

@keyframes kFadeUp{ from{ opacity: 0; transform: translateY(28px); } to{ opacity: 1; transform: none; } }

@keyframes kFadeIn{ from{ opacity: 0; } to{ opacity: 1; } }

@keyframes kRevealRight{ from{ clip-path: inset(0 100% 0 0); opacity: 1; } to{ clip-path: inset(0 0% 0 0); opacity: 1; } }
```

## Motion And Effects
- CSS reveal vocabulary from source template: fade-up, fade-in, reveal-right, reveal-left, scale-in. In SlideLeaf, map these to data-reveal or CSS selectors under .slide.active; do not add a custom slide activator.
- Reusable keyframe names detected: kFadeUp, kFadeIn, kRevealRight, kRevealLeft, kScaleIn. Keep subtle entrance, rule-reveal, scale-in, glow, or float effects; avoid motion that competes with reading.
- Decorative effect classes worth preserving as CSS-only motifs: rule, chapter-rule.
- Safe optional JS effect: metric count-up or CSS bar build may run inside the active slide only.
```js
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
```
- Forbidden JS from source template: slide navigation, keyboard handlers, deck transform, page counters, progress bars, active class toggles, custom elements that own the deck stage.
- If runtime/deck.js is needed, use it only as a non-navigation extension and listen to the renderer's slideleaf:slidechange event.

## Anti Patterns
- Mixing this template with another template family in the same deck.
- Recoloring the palette or replacing the type system because it feels convenient.
- Removing signature decoration, chrome, texture, mono labels, or page furniture that carries the template identity.
- Copying the source template's deck navigation, keyboard handler, or slide-stage runtime into SlideLeaf; the renderer owns navigation.
- Turning the style into generic cards, centered bullets, purple gradients, or glassmorphism.

## Evidence Requirements
- Match density to evidence: high density means proof blocks should be specific, compact, and numerous enough for analytical slides.
- Keep sources, assumptions, and benchmark labels visible but styled in the template's quiet chrome language.
- Use real metrics, cases, or explicit placeholders; never invent claims to fill the layout.

## Suggested Visual Components
- executive-summary
- section-divider
- metric-system
- comparison-table
- evidence-panel
- product-demo-flow
- roadmap
- architecture-diagram
- poster-hero

## Example Markup
```html
<section class="slide style-template-monochrome" data-motion="progressive-reveal" data-visual="metric-system">
  <div class="slide-content">
    <p class="eyebrow">Monochrome</p>
    <h1>Monochrome gives serious arguments a distinctive editorial system</h1>
    <div class="card-grid">
      <article class="card" data-reveal>
        <h3>Visual thesis</h3>
        <p>Ivory ledger paper with all-black type; Lora serif headlines, Jost body, no color at all.</p>
      </article>
      <article class="card" data-reveal>
        <h3>Best use</h3>
        <p>Anything that should feel like a hand-typeset ledger: user research synthesis, white papers, longform reports, academic and policy briefs, advisory deliverables, bilingual EN/CN reports.</p>
      </article>
    </div>
  </div>
</section>
```

## QA Checklist
- The generated slide clearly belongs to Monochrome, not to a generic SlideLeaf default.
- The palette, typography, spacing, and decorative vocabulary remain internally consistent.
- The slide uses SlideLeaf fragment rules: one section.slide root, no script, no style tag, no remote assets.
- Renderer-owned navigation is not duplicated.
- Content density, formality, and tone match the user's brief and audience.
