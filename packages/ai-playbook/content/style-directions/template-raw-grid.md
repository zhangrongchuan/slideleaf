---
id: template-raw-grid
category: style-direction
title: Template Style - Raw Grid
tags: template, beautiful-html-templates, raw-grid, light, medium-low, high, raw, punchy, energetic, confident, direct, modern, no-nonsense, graphic, startup pitch, accelerator demo day, founder pitch, indie product launch, brand deck, creator portfolio, 投资人, 融资, 路演, 创业, 技术, 开发者, 产品, SaaS, 研究, 报告, 学术, 白皮书, 品牌, 创意, 设计, 编辑感
motionPreset: progressive-reveal
sourceInfluences: beautiful-html-templates/raw-grid, Segoe UI / system-ui
---
## When To Use
- Anything that should feel direct and graphic-confident: founder pitches, accelerator demos, brand decks, indie launches, creator portfolios. Strong for stat slides, comparison tables, and process flows. Equally good for tech, research, or finance when the speaker wants the deck to feel scrappy-confident rather than buttoned-up.
- Use when the requested mood overlaps with: raw, punchy, energetic, confident.
- Use when the occasion is close to: startup pitch, accelerator demo day, founder pitch, indie product launch, brand deck, creator portfolio.
- Good fit for medium-low formality, high density, and a light color scheme.

## When Not To Use
- Contexts that need to feel soft, warm, or intentionally quiet — the brutalist borders and offset shadows commit to a graphic voice.
- Do not use when the audience expects a materially different formality level or content density.
- Do not use if the deck needs a conflicting visual language; pick a different template direction instead.

## Good Structure
- Visual thesis: Neo-brutalist deck with thick borders, offset shadows, and a pink/sage/ink palette.
- Palette discipline: primary: #FFFFFF; ink: #0A0A0A; pink: #F2D4CF; green: #E5EDD6; gray: #F5F5F5; description: white background with ink-black structure, soft pink and sage green as flat color blocks, hard 3px borders and 6px offset shadows
- Typography discipline: display: Segoe UI / system-ui; body: Segoe UI / system-ui; style: system sans set in heavy weights with strong uppercase tracking; functional rather than expressive
- Layout grammar: slide-content, t-body, s3-body, s3-stat-box, s3-stat-number, s3-stat-label, s4-grid, s4-card, s4-card-top, s6-body, s7-metric-row, s7-metric-num, s7-metric-info, s7-metric-title, s8-quote-mark, s8-statement, s8-stat, s8-stat-num.
- Slide grammar: cover, section, proof, comparison, quote, and closing variants.
- Convert the original full-template system into SlideLeaf fragments: one section.slide per file, shared CSS in themes/deck.css, and no project-level navigation code inside slide fragments.
- Extend missing layouts by reusing the same fonts, palette, spacing rhythm, decorative vocabulary, and component grammar.

## CSS Tokens
```css
.style-template-raw-grid {
--black: #0a0a0a;
--white: #ffffff;
--pink: #f2d4cf;
--green: #e5edd6;
--gray: #f5f5f5;
--darkgray: #333333;
--border: 3px solid var(--black);
--shadow: 6px 6px 0 var(--black);
--shadow-sm: 4px 4px 0 var(--black);
--template-primary: #FFFFFF;
--template-ink: #0A0A0A;
--template-pink: #F2D4CF;
--template-green: #E5EDD6;
--template-gray: #F5F5F5;
--template-font-display: "Segoe UI / system-ui", system-ui, sans-serif;
--template-font-body: "Segoe UI / system-ui", system-ui, sans-serif;
}
```

## Core CSS Grammar
```css
.slide-content{ width: 100%; height: 100%; overflow: hidden; }

.t-body{ font-size: clamp(16px, 1.3vw, 20px); font-weight: 500; line-height: 1.6; }

.grid{ display: grid; }

.label{ display: inline-block; background: var(--black); color: var(--white); padding: 6px 14px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; }

.s1 .slide-content{ display: grid; grid-template-columns: 1fr 1fr; height: 100%; }

.s1-cta .label{ cursor: pointer; }

.s2 .slide-content{ display: grid; grid-template-columns: 45% 55%; height: 100%; }

.s3 .slide-content{ display: flex; flex-direction: column; height: 100%; }

.s3-body{ flex: 1; display: grid; grid-template-columns: 1fr 1fr; }

.s3-chart-area{ padding: clamp(24px, 3vw, 48px); border-right: var(--border); display: flex; flex-direction: column; justify-content: center; }

.s3-chart-title{ margin-bottom: 24px; }

.s3-bar-label{ font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 6px; }

.s3-stat-box{ border: var(--border); padding: clamp(16px, 2vw, 28px); background: var(--white); }

.s3-stat-number{ font-size: clamp(36px, 4vw, 56px); font-weight: 900; line-height: 1; margin-bottom: 8px; }

.s3-stat-label{ font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; }

.s4 .slide-content{ display: flex; flex-direction: column; height: 100%; }

.s4-grid{ flex: 1; display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr; }

.s4-card{ padding: clamp(24px, 3vw, 48px); display: flex; flex-direction: column; justify-content: space-between; }
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
<section class="slide style-template-raw-grid" data-motion="progressive-reveal" data-visual="metric-system">
  <div class="slide-content">
    <p class="eyebrow">Raw Grid</p>
    <h1>Raw Grid gives serious arguments a distinctive editorial system</h1>
    <div class="card-grid">
      <article class="card" data-reveal>
        <h3>Visual thesis</h3>
        <p>Neo-brutalist deck with thick borders, offset shadows, and a pink/sage/ink palette.</p>
      </article>
      <article class="card" data-reveal>
        <h3>Best use</h3>
        <p>Anything that should feel direct and graphic-confident: founder pitches, accelerator demos, brand decks, indie launches, creator portfolios.</p>
      </article>
    </div>
  </div>
</section>
```

## QA Checklist
- The generated slide clearly belongs to Raw Grid, not to a generic SlideLeaf default.
- The palette, typography, spacing, and decorative vocabulary remain internally consistent.
- The slide uses SlideLeaf fragment rules: one section.slide root, no script, no style tag, no remote assets.
- Renderer-owned navigation is not duplicated.
- Content density, formality, and tone match the user's brief and audience.
