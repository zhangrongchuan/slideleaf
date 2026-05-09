---
id: template-mat
category: style-direction
title: Template Style - Mat
tags: template, beautiful-html-templates, mat, mixed, medium, warm-modern, considered, tactile, mid-century, warm, design-led, intentional, design studio credentials, architecture / interior brand, ceramics or craft brand, furniture pitch, advisory deliverable, bilingual EN/CN deck, 投资人, 融资, 路演, 创业, CEO, 董事会, 战略, 咨询, 技术, 开发者, 产品, SaaS, 研究, 报告, 学术, 白皮书, 品牌, 创意, 设计, 编辑感, 温暖, 活泼, 社区, 工作坊, 暗色, 高级, 科技感
motionPreset: progressive-reveal
sourceInfluences: beautiful-html-templates/mat, Bricolage Grotesque, DM Sans, DM Mono
---
## When To Use
- Anything that should feel mid-century, tactile, and intentional: design studio credentials, architecture / interior brands, ceramics / craft / furniture, advisory decks. Also a warm, distinctive choice for tech, research, or business decks that want a considered analog feel instead of digital-cool.
- Use when the requested mood overlaps with: warm-modern, considered, tactile, mid-century.
- Use when the occasion is close to: design studio credentials, architecture / interior brand, ceramics or craft brand, furniture pitch, advisory deliverable, bilingual EN/CN deck.
- Good fit for medium formality, medium density, and a mixed color scheme.

## When Not To Use
- Contexts that need fast tech energy or institutional restraint — the muted sage and burnt-orange palette is intentionally warm and slow.
- Do not use when the audience expects a materially different formality level or content density.
- Do not use if the deck needs a conflicting visual language; pick a different template direction instead.

## Good Structure
- Visual thesis: Dark sage canvas with bone paper and burnt-orange accent; mid-century modern with wood undertones.
- Palette discipline: bg: #232e26; bg_alt: #2e3d30; fg: #f0e8d2; accent: #c07030; bg_light: #ede6d0; wood: #7a4e24; description: muted sage green canvas with warm bone paper and a saturated burnt-orange accent; an underlying wood tone for tactile detail
- Typography discipline: display: Bricolage Grotesque; body: DM Sans; mono: DM Mono; cn: Noto Sans SC; style: expressive variable grotesk display + clean DM body + DM Mono captions
- Layout grammar: slide--cover, cover-headline, kicker, cover-copy, cover-bottom, info-card, info-card-heading, info-card-body, slide--statement, slide-chrome, slide-body, slide--stats, mat-stat, mat-stat-val, mat-stat-label, slide--quote, quote-mark, quote-text.
- Slide grammar: dark, slide--cover, slide--statement, slide--split, slide--stats, slide--quote, light, slide--list, slide--compare, slide--chart, slide--end.
- Convert the original full-template system into SlideLeaf fragments: one section.slide per file, shared CSS in themes/deck.css, and no project-level navigation code inside slide fragments.
- Extend missing layouts by reusing the same fonts, palette, spacing rhythm, decorative vocabulary, and component grammar.

## CSS Tokens
```css
.style-template-mat {
--c-bg: #232e26;
--c-bg-alt: #2e3d30;
--c-bg-light: #ede6d0;
--c-bg-light-alt: #e4dac4;
--c-fg: #f0e8d2;
--c-fg-2: rgba(240, 232, 210, 0.58);
--c-fg-3: rgba(240, 232, 210, 0.3);
--c-fg-light: #1e2820;
--c-fg-light-2: rgba(30, 40, 32, 0.6);
--c-fg-light-3: rgba(30, 40, 32, 0.3);
--c-accent: #c07030;
--c-border: rgba(240, 232, 210, 0.12);
--c-border-light: rgba(30, 40, 32, 0.14);
--c-wood: #7a4e24;
--f-display: "Bricolage Grotesque", "Noto Sans SC", sans-serif;
--f-heading: "Bricolage Grotesque", "Noto Sans SC", sans-serif;
--f-body: "DM Sans", "Noto Sans SC", system-ui, sans-serif;
--f-mono: "DM Mono", monospace;
--sz-display: 12vw;
--sz-h1: 7vw;
--sz-h2: 4vw;
--sz-h3: 2.4vw;
--template-bg: #232e26;
--template-bg-alt: #2e3d30;
--template-fg: #f0e8d2;
--template-accent: #c07030;
--template-bg-light: #ede6d0;
--template-wood: #7a4e24;
--template-font-display: "Bricolage Grotesque", system-ui, sans-serif;
--template-font-body: "DM Sans", system-ui, sans-serif;
--template-font-mono: "DM Mono", system-ui, sans-serif;
--template-font-cn: "Noto Sans SC", system-ui, sans-serif;
}
```

## Core CSS Grammar
```css
.slide-body{ min-height: 0; }

.label{ font-family: var(--f-mono); font-size: var(--sz-label); font-weight: 400; letter-spacing: 0.12em; text-transform: uppercase; }

.light .muted{ color: var(--c-fg-light-2); }

.light .bullet-list li{ color: var(--c-fg-light); }

.slide-chrome, .slide-foot{ display: flex; justify-content: space-between; align-items: center; }

.slide-chrome{ padding-bottom: var(--gap-sm); border-bottom: 1px solid var(--c-border); margin-bottom: var(--gap-md); }

.light .slide-chrome, .light .slide-foot{ border-color: var(--c-border-light); }

.slide--cover .slide-chrome, .slide--cover .slide-foot, .slide--quote .slide-chrome, .slide--quote .slide-foot, .slide--end .slide-chrome, .slide--end .slide-foot{ display: none; }

.kicker{ font-family: var(--f-mono); font-size: var(--sz-label); letter-spacing: 0.12em; text-transform: uppercase; color: var(--c-accent); }

.rule{ width: 32px; height: 1px; background: var(--c-accent); }

.light .img-placeholder{ background: var(--c-bg-light-alt); color: var(--c-fg-light-3); }

.info-card{ background: var(--c-bg-light); color: var(--c-fg-light); padding: var(--gap-md) calc(var(--pad-x) * 0.8); max-width: 28vw; display: flex; flex-direction: column; gap: var(--gap-sm); }

.info-card-heading{ font-family: var(--f-heading); font-size: var(--sz-h3); font-weight: 700; line-height: 1.1; letter-spacing: -0.01em; color: var(--c-fg-light); }

.info-card-body{ font-family: var(--f-body); font-size: var(--sz-body); font-weight: 400; line-height: 1.6; color: var(--c-fg-light-2); }

.slide--cover{ display: grid; grid-template-rows: 1fr auto; grid-template-columns: 1fr 1fr; gap: 0; padding: var(--pad-y) var(--pad-x); }

.cover-headline{ grid-column: 1; grid-row: 1; display: flex; flex-direction: column; justify-content: flex-start; padding-top: var(--gap-sm); gap: var(--gap-sm); }

.cover-copy{ grid-column: 2; grid-row: 1; display: flex; flex-direction: column; justify-content: center; padding-left: var(--pad-x); gap: var(--gap-md); }

.cover-bottom{ grid-column: 1 / 3; grid-row: 2; display: flex; align-items: flex-end; justify-content: space-between; gap: var(--gap-lg); padding-top: var(--gap-md); }
```

## Motion And Effects
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
- Match density to evidence: medium density means proof blocks should be balanced, with enough supporting detail to avoid empty cards.
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
<section class="slide style-template-mat" data-motion="progressive-reveal" data-visual="comparison-table">
  <div class="slide-content">
    <p class="eyebrow">Mat</p>
    <h1>Mat gives serious arguments a distinctive editorial system</h1>
    <div class="card-grid">
      <article class="card" data-reveal>
        <h3>Visual thesis</h3>
        <p>Dark sage canvas with bone paper and burnt-orange accent; mid-century modern with wood undertones.</p>
      </article>
      <article class="card" data-reveal>
        <h3>Best use</h3>
        <p>Anything that should feel mid-century, tactile, and intentional: design studio credentials, architecture / interior brands, ceramics / craft / furniture, advisory decks.</p>
      </article>
    </div>
  </div>
</section>
```

## QA Checklist
- The generated slide clearly belongs to Mat, not to a generic SlideLeaf default.
- The palette, typography, spacing, and decorative vocabulary remain internally consistent.
- The slide uses SlideLeaf fragment rules: one section.slide root, no script, no style tag, no remote assets.
- Renderer-owned navigation is not duplicated.
- Content density, formality, and tone match the user's brief and audience.
