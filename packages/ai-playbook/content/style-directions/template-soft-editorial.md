---
id: template-soft-editorial
category: style-direction
title: Template Style - Soft Editorial
tags: template, beautiful-html-templates, soft-editorial, light, high, low, literary, elegant, quiet, warm-classical, considered, warm, magazine, editorial feature, longform brand story, gallery or museum, literary pitch, advisory deliverable, wedding / lifestyle media, 投资人, 融资, 路演, 创业, CEO, 董事会, 战略, 咨询, 技术, 开发者, 产品, SaaS, 研究, 报告, 学术, 白皮书, 品牌, 创意, 设计, 编辑感, 温暖, 活泼, 社区, 工作坊
motionPreset: progressive-reveal
sourceInfluences: beautiful-html-templates/soft-editorial, Cormorant Garamond, Work Sans
---
## When To Use
- Anything that should feel literary, elegant, and unhurried: editorial features, longform brand stories, gallery / museum decks, advisory deliverables, wedding / lifestyle media, founder essays. Equally good for tech, research, or business decks that want a Sunday-supplement warmth instead of corporate polish.
- Use when the requested mood overlaps with: literary, elegant, quiet, warm-classical.
- Use when the occasion is close to: editorial feature, longform brand story, gallery or museum, literary pitch, advisory deliverable, wedding / lifestyle media.
- Good fit for high formality, low density, and a light color scheme.

## When Not To Use
- Decks that need visual heat or punch — the warm-paper palette and Cormorant serif are intentionally quiet.
- Do not use when the audience expects a materially different formality level or content density.
- Do not use if the deck needs a conflicting visual language; pick a different template direction instead.

## Good Structure
- Visual thesis: Cormorant Garamond serif on warm paper with sage, blush, and lemon accents.
- Palette discipline: paper: #F2EEDF; ink: #2A241B; pink: #E1A4C2; lemon: #D6DD63; blush: #E8C9B6; sage: #B7C7A8; description: warm paper canvas with deep ink type, accented by soft pink, lemon, blush, and sage; reads like a Sunday editorial spread
- Typography discipline: display: Cormorant Garamond; body: Work Sans; style: high-contrast garalde serif headlines paired with a clean humanist sans body
- Layout grammar: s-cover, kicker, grid, card, stat, s-quote, panel, tag, body, flow, timeline, table, note.
- Slide grammar: s-cover, s-foreword, s-method, s-insights, s-closer, s-numbers, s-quote, s-next, s-consult, s-chart, s-process, s-matrix.
- Convert the original full-template system into SlideLeaf fragments: one section.slide per file, shared CSS in themes/deck.css, and no project-level navigation code inside slide fragments.
- Extend missing layouts by reusing the same fonts, palette, spacing rhythm, decorative vocabulary, and component grammar.

## CSS Tokens
```css
.style-template-soft-editorial {
--paper: #F2EEDF;
--paper-2: #ECE6D2;
--ink: #2A241B;
--ink-soft: #5C5345;
--pink: #E1A4C2;
--lemon: #D6DD63;
--blush: #E8C9B6;
--sage: #B7C7A8;
--lilac: #C9BEDC;
--template-paper: #F2EEDF;
--template-ink: #2A241B;
--template-pink: #E1A4C2;
--template-lemon: #D6DD63;
--template-blush: #E8C9B6;
--template-sage: #B7C7A8;
--template-font-display: "Cormorant Garamond", system-ui, sans-serif;
--template-font-body: "Work Sans", system-ui, sans-serif;
}
```

## Core CSS Grammar
```css
.body{ font-family: "Work Sans", sans-serif; font-weight: 400; font-size: 26px; line-height: 1.5; }

.s-cover .stack{ position: absolute; left: 80px; right: 80px; top: 50%; transform: translateY(-50%); display: flex; flex-direction: column; gap: 36px; }

.s-cover .kicker{ font-family: "Cormorant Garamond", serif; font-style: italic; font-size: 38px; color: var(--ink-soft); }

.s-cover h1{ font-family: "Cormorant Garamond", serif; font-weight: 500; font-size: 232px; line-height: 0.92; letter-spacing: -0.02em; }

.s-cover h1 em{ font-style: italic; font-weight: 400; }

.s-cover .lede{ font-size: 30px; line-height: 1.4; max-width: 60ch; color: var(--ink-soft); }

.s-cover .swatches{ position: absolute; right: 80px; top: 80px; display: flex; gap: 14px; }

.s-cover .swatches i{ width: 56px; height: 56px; border-radius: 50%; display: block; }

.s-foreword .col-l{ position: absolute; left: 80px; top: 200px; width: 760px; }

.s-foreword .col-l .opener{ font-family: "Cormorant Garamond", serif; font-style: italic; font-size: 56px; line-height: 1.1; color: var(--ink); margin-bottom: 36px; }

.s-foreword .col-l .opener:first-letter{ font-size: 132px; float: left; line-height: 0.85; padding: 8px 14px 0 0; font-style: normal; font-weight: 500; }

.s-foreword .col-r{ position: absolute; right: 80px; top: 200px; width: 760px; }

.s-foreword .col-r p{ font-size: 24px; line-height: 1.55; margin-bottom: 22px; color: var(--ink-soft); }

.s-foreword .col-r p:first-child{ color: var(--ink); }

.s-foreword .signoff{ margin-top: 24px; font-family: "Cormorant Garamond", serif; font-style: italic; font-size: 30px; color: var(--ink); }

.s-method .grid{ position: absolute; left: 80px; right: 80px; top: 220px; bottom: 140px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 28px; }

.s-method .step{ background: rgba(255, 255, 255, 0.55); border-radius: 32px; padding: 36px 32px; display: flex; flex-direction: column; justify-content: space-between; }

.s-method .step .n{ font-family: "Cormorant Garamond", serif; font-style: italic; font-size: 92px; line-height: 0.9; color: var(--ink); }
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
- Match density to evidence: low density means proof blocks should be selective and high-signal, with fewer claims per slide.
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
<section class="slide style-template-soft-editorial" data-motion="progressive-reveal" data-visual="executive-summary">
  <div class="slide-content">
    <p class="eyebrow">Soft Editorial</p>
    <h1>Soft Editorial gives serious arguments a distinctive editorial system</h1>
    <div class="card-grid">
      <article class="card" data-reveal>
        <h3>Visual thesis</h3>
        <p>Cormorant Garamond serif on warm paper with sage, blush, and lemon accents.</p>
      </article>
      <article class="card" data-reveal>
        <h3>Best use</h3>
        <p>Anything that should feel literary, elegant, and unhurried: editorial features, longform brand stories, gallery / museum decks, advisory deliverables, wedding / lifestyle media, founder essays.</p>
      </article>
    </div>
  </div>
</section>
```

## QA Checklist
- The generated slide clearly belongs to Soft Editorial, not to a generic SlideLeaf default.
- The palette, typography, spacing, and decorative vocabulary remain internally consistent.
- The slide uses SlideLeaf fragment rules: one section.slide root, no script, no style tag, no remote assets.
- Renderer-owned navigation is not duplicated.
- Content density, formality, and tone match the user's brief and audience.
