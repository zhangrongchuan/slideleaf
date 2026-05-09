---
id: template-vellum
category: style-direction
title: Template Style - Vellum
tags: template, beautiful-html-templates, vellum, dark, high, low, scholarly, literary, considered, quiet, intellectual, patient, intelligent, research findings, white paper or longform report, academic or university deck, advisory deliverable, literary or editorial pitch, founder reflection / vision deck, bilingual EN/CN deck, 投资人, 融资, 路演, 创业, CEO, 董事会, 战略, 咨询, 技术, 开发者, 产品, SaaS, 研究, 报告, 学术, 白皮书, 品牌, 创意, 设计, 编辑感, 温暖, 活泼, 社区, 工作坊, 暗色, 高级, 科技感
motionPreset: progressive-reveal
sourceInfluences: beautiful-html-templates/vellum, Cormorant Garamond Italic, DM Sans, Courier Prime
---
## When To Use
- Anything that should feel scholarly, literary, and quietly intelligent: research synthesis, white papers, academic and policy briefs, advisory deliverables, longform editorial pieces, founder reflections. Equally strong for any deck — including tech, business, or creator work — that wants a calm, considered atmosphere instead of energetic visuals.
- Use when the requested mood overlaps with: scholarly, literary, considered, quiet, intellectual.
- Use when the occasion is close to: research findings, white paper or longform report, academic or university deck, advisory deliverable, literary or editorial pitch, founder reflection / vision deck, bilingual EN/CN deck.
- Good fit for high formality, low density, and a dark color scheme.

## When Not To Use
- Contexts that need visual heat or pop — the navy + warm-yellow italic-Cormorant aesthetic is intentionally low-tempo.
- Do not use when the audience expects a materially different formality level or content density.
- Do not use if the deck needs a conflicting visual language; pick a different template direction instead.

## Good Structure
- Visual thesis: Deep navy canvas with warm-yellow italic Cormorant serifs and a single dusty teal accent. A quiet, scholarly aesthetic.
- Palette discipline: bg: #2a3870; bg_alt: #343f80; fg: #E8D85C; accent: #3a7878; description: deep periwinkle navy canvas with warm yellow italic-serif type and one dusty-teal accent for quote marks; a single coherent palette across every slide, no inverted theme
- Typography discipline: display: Cormorant Garamond Italic; body: DM Sans; mono: Courier Prime; serif_cn: Noto Serif SC; sans_cn: Noto Sans SC; style: italic transitional serif as the structural display face, paired with clean DM Sans body and Courier Prime mono for attributions and labels; bilingual EN/CN support
- Layout grammar: slide--cover, cover-title, kicker, pin-note, slide--statement, slide-body, slide-chrome, slide--stats, stats-row, pin-stat, pin-stat-val, pin-stat-label, slide--quote, quote-mark, quote-text, quote-attr, slide--compare, compare-panel.
- Slide grammar: light, slide--cover, dark, slide--statement, slide--text, slide--stats, slide--list, slide--quote, slide--compare, slide--chart, slide--end.
- Convert the original full-template system into SlideLeaf fragments: one section.slide per file, shared CSS in themes/deck.css, and no project-level navigation code inside slide fragments.
- Extend missing layouts by reusing the same fonts, palette, spacing rhythm, decorative vocabulary, and component grammar.

## CSS Tokens
```css
.style-template-vellum {
--c-bg: #2a3870;
--c-bg-alt: #343f80;
--c-bg-light: #2a3870;
--c-bg-light-alt: #343f80;
--c-fg: #E8D85C;
--c-fg-2: rgba(232, 216, 92, 0.62);
--c-fg-3: rgba(232, 216, 92, 0.32);
--c-fg-light: #E8D85C;
--c-fg-light-2: rgba(232, 216, 92, 0.62);
--c-fg-light-3: rgba(232, 216, 92, 0.32);
--c-accent: #3a7878;
--c-emphasis: #F5E168;
--c-border: rgba(232, 216, 92, 0.20);
--c-border-light: rgba(232, 216, 92, 0.20);
--f-display: "Cormorant Garamond", "Noto Serif SC", Georgia, serif;
--f-heading: "Cormorant Garamond", "Noto Serif SC", Georgia, serif;
--f-body: "DM Sans", "Noto Sans SC", system-ui, sans-serif;
--f-mono: "Courier Prime", "Courier New", monospace;
--f-annotation: "Courier Prime", "Courier New", monospace;
--sz-display: 11vw;
--sz-h1: 7vw;
--sz-h2: 4vw;
--template-bg: #2a3870;
--template-bg-alt: #343f80;
--template-fg: #E8D85C;
--template-accent: #3a7878;
--template-font-display: "Cormorant Garamond Italic", system-ui, sans-serif;
--template-font-body: "DM Sans", system-ui, sans-serif;
--template-font-mono: "Courier Prime", system-ui, sans-serif;
--template-font-serif-cn: "Noto Serif SC", system-ui, sans-serif;
--template-font-sans-cn: "Noto Sans SC", system-ui, sans-serif;
}
```

## Core CSS Grammar
```css
.slide-body{ min-height: 0; }

.light .h1 em, .light .h2 em, .light .display em{ color: var(--c-emphasis); }

.label{ font-family: var(--f-mono); font-size: var(--sz-label); font-weight: 400; letter-spacing: 0.06em; }

.light .muted{ color: var(--c-fg-light-2); }

.pin-note{ font-family: var(--f-annotation); font-size: 1.15vw; font-weight: 500; line-height: 1.5; color: var(--c-accent); letter-spacing: 0.01em; }

.light .pin-note{ color: var(--c-accent); }

.slide-chrome, .slide-foot{ display: flex; justify-content: space-between; align-items: center; }

.slide-chrome{ padding-bottom: var(--gap-sm); border-bottom: 1px solid var(--c-border); margin-bottom: var(--gap-md); }

.light .slide-chrome, .light .slide-foot{ border-color: var(--c-border-light); }

.kicker{ font-family: var(--f-mono); font-size: var(--sz-label); letter-spacing: 0.1em; color: var(--c-accent); }

.rule{ width: 28px; height: 1px; background: var(--c-accent); }

.light .img-placeholder{ background: rgba(42, 56, 112, 0.08); color: var(--c-fg-light-3); }

.slide--cover{ display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; text-align: center; }

.cover-title{ display: flex; flex-direction: column; align-items: center; gap: var(--gap-md); max-width: 70%; }

.slide--statement{ display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; text-align: center; }

.slide--statement .slide-body{ display: flex; flex-direction: column; align-items: center; gap: var(--gap-md); max-width: 62%; min-height: 0; }

.slide--split .slide-body{ display: flex; flex-direction: column; align-items: center; gap: var(--gap-lg); min-height: 0; }

.slide--stats{ display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; }
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
<section class="slide style-template-vellum" data-motion="progressive-reveal" data-visual="executive-summary">
  <div class="slide-content">
    <p class="eyebrow">Vellum</p>
    <h1>Vellum gives serious arguments a distinctive editorial system</h1>
    <div class="card-grid">
      <article class="card" data-reveal>
        <h3>Visual thesis</h3>
        <p>Deep navy canvas with warm-yellow italic Cormorant serifs and a single dusty teal accent. A quiet, scholarly aesthetic.</p>
      </article>
      <article class="card" data-reveal>
        <h3>Best use</h3>
        <p>Anything that should feel scholarly, literary, and quietly intelligent: research synthesis, white papers, academic and policy briefs, advisory deliverables, longform editorial pieces, founder reflections.</p>
      </article>
    </div>
  </div>
</section>
```

## QA Checklist
- The generated slide clearly belongs to Vellum, not to a generic SlideLeaf default.
- The palette, typography, spacing, and decorative vocabulary remain internally consistent.
- The slide uses SlideLeaf fragment rules: one section.slide root, no script, no style tag, no remote assets.
- Renderer-owned navigation is not duplicated.
- Content density, formality, and tone match the user's brief and audience.
