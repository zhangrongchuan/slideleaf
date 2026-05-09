---
id: template-capsule
category: style-direction
title: Template Style - Capsule
tags: template, beautiful-html-templates, capsule, light, medium-low, medium, playful, modern, warm, fresh, fun, upbeat, graphic, approachable, cool, lifestyle brand, creator portfolio, DTC product launch, wellness or beauty pitch, Y2K-tinged brand work, 投资人, 融资, 路演, 创业, 技术, 开发者, 产品, SaaS, 研究, 报告, 学术, 白皮书, 品牌, 创意, 设计, 编辑感, 温暖, 活泼, 社区, 工作坊
motionPreset: progressive-reveal
sourceInfluences: beautiful-html-templates/capsule, Bodoni Moda, Space Grotesk
---
## When To Use
- Anything that should feel modular, modern, and a little Y2K: lifestyle brands, creator portfolios, DTC launches, beauty / wellness, agency credentials. Also fun for a playful tech demo or a research deck that wants pop-art clarity instead of gravitas.
- Use when the requested mood overlaps with: playful, modern, warm, fresh, fun.
- Use when the occasion is close to: lifestyle brand, creator portfolio, DTC product launch, wellness or beauty pitch, Y2K-tinged brand work.
- Good fit for medium-low formality, medium density, and a light color scheme.

## When Not To Use
- Contexts that require traditional institutional weight — the capsule shapes and pastel pops actively soften authority.
- Do not use when the audience expects a materially different formality level or content density.
- Do not use if the deck needs a conflicting visual language; pick a different template direction instead.

## Good Structure
- Visual thesis: Modular pill-shaped cards on warm bone with a full pastel-pop palette.
- Palette discipline: bg: #F5F5F0; fg: #1A1A1A; coral: #E85D4E; lime: #C4D94E; lavender: #C5B5E0; sky: #8BB4F7; violet: #A06CE8; yellow: #F2D160; peach: #F5B895; mint: #A8E6CF; description: warm bone background, ink-black structure, and a full pastel-pop palette (coral, lime, lavender, sky, violet, yellow, peach, mint) used as flat capsule shapes
- Typography discipline: display: Bodoni Moda; body: Space Grotesk; style: high-contrast didone serif paired with a friendly geometric sans
- Layout grammar: left-content, cards-grid, pillar-card, card-icon, statement-box, quote-mark, quote-highlight, timeline, timeline-track, timeline-step, stats-grid, stat-pill, stat-number, stat-label, stat-bar, frame-content, closing-content.
- Slide grammar: cover, section, proof, comparison, quote, and closing variants.
- Convert the original full-template system into SlideLeaf fragments: one section.slide per file, shared CSS in themes/deck.css, and no project-level navigation code inside slide fragments.
- Extend missing layouts by reusing the same fonts, palette, spacing rhythm, decorative vocabulary, and component grammar.

## CSS Tokens
```css
.style-template-capsule {
--bg: #F5F5F0;
--fg: #1A1A1A;
--coral: #E85D4E;
--lime: #C4D94E;
--lavender: #C5B5E0;
--sky: #8BB4F7;
--violet: #A06CE8;
--yellow: #F2D160;
--peach: #F5B895;
--mint: #A8E6CF;
--outline: #1E1E1E;
--shadow: rgba(26, 26, 26, 0.08);
--font-display: 'Bodoni Moda', serif;
--font-body: 'Space Grotesk', sans-serif;
--template-bg: #F5F5F0;
--template-fg: #1A1A1A;
--template-coral: #E85D4E;
--template-lime: #C4D94E;
--template-lavender: #C5B5E0;
--template-sky: #8BB4F7;
--template-violet: #A06CE8;
--template-yellow: #F2D160;
--template-peach: #F5B895;
--template-mint: #A8E6CF;
--template-font-display: "Bodoni Moda", system-ui, sans-serif;
--template-font-body: "Space Grotesk", system-ui, sans-serif;
}
```

## Core CSS Grammar
```css
.grain-overlay{ position: fixed; inset: 0; pointer-events: none; z-index: 9999; opacity: 0.04; mix-blend-mode: multiply; background-image: url(/* embedded texture omitted */); background-repeat: repeat; background-size: 200px 200px; }

.slide-2 .left-content{ display: flex; flex-direction: column; gap: 1.5rem; }

.slide-2 .left-content h2{ font-family: var(--font-display); font-size: clamp(2rem, 4vw, 3.5rem); font-weight: 700; line-height: 1.05; letter-spacing: -0.02em; }

.slide-2 .left-content p{ font-family: var(--font-body); font-size: clamp(0.95rem, 1.2vw, 1.15rem); line-height: 1.6; opacity: 0.7; max-width: 90%; }

.slide-2 .left-content .accent-line{ width: 60px; height: 4px; background: var(--coral); border-radius: 9999px; }

.slide-3 .cards-grid{ display: grid; grid-template-columns: repeat(3, 1fr); gap: 2rem; }

.slide-3 .pillar-card{ background: #fff; border: 2px solid var(--outline); border-radius: 2rem; padding: 2.5rem 2rem; display: flex; flex-direction: column; gap: 1.25rem; box-shadow: 8px 8px 0 var(--shadow); transition: transform 0.3s ease; }

.slide-3 .pillar-card .card-icon{ width: 60px; height: 60px; border-radius: 50%; border: 2px solid var(--outline); display: flex; align-items: center; justify-content: center; font-family: var(--font-display); font-size: 1.5rem; font-weight: 700; flex-shrink: 0; }

.slide-3 .pillar-card h3{ font-family: var(--font-display); font-size: 1.5rem; font-weight: 700; line-height: 1.1; }

.slide-3 .pillar-card p{ font-size: 0.9rem; line-height: 1.55; opacity: 0.65; }

.slide-4 .chart-container{ display: flex; flex-direction: column; gap: 1.5rem; background: #fff; border: 2px solid var(--outline); border-radius: 2rem; padding: 3rem; box-shadow: 8px 8px 0 var(--shadow); }

.slide-4 .chart-row{ display: flex; align-items: center; gap: 1.5rem; }

.slide-4 .chart-label{ width: 140px; font-family: var(--font-body); font-size: 0.85rem; font-weight: 500; text-align: right; flex-shrink: 0; }

.slide-4 .chart-bar-track{ flex: 1; height: 36px; background: var(--bg); border-radius: 9999px; border: 2px solid var(--outline); overflow: hidden; position: relative; }

.slide-4 .chart-bar-fill{ height: 100%; border-radius: 9999px; display: flex; align-items: center; justify-content: flex-end; padding-right: 1rem; font-size: 0.75rem; font-weight: 600; transition: width 1s cubic-bezier(0.4, 0, 0.2, 1); border-right: 2px solid var(--outline); }

.slide-4 .chart-value{ width: 60px; font-size: 0.9rem; font-weight: 600; flex-shrink: 0; }

.slide-5 .statement-box{ max-width: 900px; text-align: center; position: relative; padding: 3rem; }

.slide-5 .statement-box .quote-mark{ font-family: var(--font-display); font-size: 8rem; line-height: 0; color: var(--coral); opacity: 0.3; position: absolute; top: 2rem; left: 0; }
```

## Motion And Effects
- Decorative effect classes worth preserving as CSS-only motifs: grain-overlay, orbit-center, orbit-pill, floating-pills.
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
<section class="slide style-template-capsule" data-motion="progressive-reveal" data-visual="comparison-table">
  <div class="slide-content">
    <p class="eyebrow">Capsule</p>
    <h1>Capsule gives serious arguments a distinctive editorial system</h1>
    <div class="card-grid">
      <article class="card" data-reveal>
        <h3>Visual thesis</h3>
        <p>Modular pill-shaped cards on warm bone with a full pastel-pop palette.</p>
      </article>
      <article class="card" data-reveal>
        <h3>Best use</h3>
        <p>Anything that should feel modular, modern, and a little Y2K: lifestyle brands, creator portfolios, DTC launches, beauty / wellness, agency credentials.</p>
      </article>
    </div>
  </div>
</section>
```

## QA Checklist
- The generated slide clearly belongs to Capsule, not to a generic SlideLeaf default.
- The palette, typography, spacing, and decorative vocabulary remain internally consistent.
- The slide uses SlideLeaf fragment rules: one section.slide root, no script, no style tag, no remote assets.
- Renderer-owned navigation is not duplicated.
- Content density, formality, and tone match the user's brief and audience.
