---
id: template-playful
category: style-direction
title: Template Style - Playful
tags: template, beautiful-html-templates, playful, light, low, medium, warm, approachable, indie, friendly, upbeat, informal, welcoming, creator portfolio, indie product launch, lifestyle brand, small-business pitch, newsletter / community, 投资人, 融资, 路演, 创业, 技术, 开发者, 产品, SaaS, 研究, 报告, 学术, 白皮书, 品牌, 创意, 设计, 编辑感, 温暖, 活泼, 社区, 工作坊, 专业, 正式, 高级
motionPreset: progressive-reveal
sourceInfluences: beautiful-html-templates/playful, Syne, Space Grotesk
---
## When To Use
- Anything that should feel warm, indie, and approachable: creator portfolios, indie product launches, lifestyle brands, small-business pitches, newsletter / community decks. Also welcoming for any deck — including tech or research — that wants to feel friendly and human rather than corporate.
- Use when the requested mood overlaps with: warm, approachable, indie, friendly.
- Use when the occasion is close to: creator portfolio, indie product launch, lifestyle brand, small-business pitch, newsletter / community.
- Good fit for low formality, medium density, and a light color scheme.

## When Not To Use
- Contexts where institutional credibility matters more than warmth — the peach palette is intentionally informal.
- Do not use when the audience expects a materially different formality level or content density.
- Do not use if the deck needs a conflicting visual language; pick a different template direction instead.

## Good Structure
- Visual thesis: Sun-warm peach background with Syne display: a friendly indie launch deck.
- Palette discipline: bg: #F0C8A0; bg_alt: #E8B88E; text: #1A1A1A; light: #F7DEC6; description: warm peach / sand backgrounds with ink-black structure and lighter cream cards; single warm temperature throughout
- Typography discipline: display: Syne; body: Space Grotesk; style: geometric variable display with personality + clean grotesk body
- Layout grammar: toc-title, toc-grid, toc-item, big-statement, body-columns, body-text, team-grid, team-card, timeline-title, timeline-track, timeline-step, stats-title, stats-grid, stat-item, stat-num, stat-label, gallery-tag.
- Slide grammar: cover, section, proof, comparison, quote, and closing variants.
- Convert the original full-template system into SlideLeaf fragments: one section.slide per file, shared CSS in themes/deck.css, and no project-level navigation code inside slide fragments.
- Extend missing layouts by reusing the same fonts, palette, spacing rhythm, decorative vocabulary, and component grammar.

## CSS Tokens
```css
.style-template-playful {
--bg: #F0C8A0;
--bg-alt: #E8B88E;
--text: #1A1A1A;
--accent: #1A1A1A;
--light: #F7DEC6;
--template-bg: #F0C8A0;
--template-bg-alt: #E8B88E;
--template-text: #1A1A1A;
--template-light: #F7DEC6;
--template-font-display: "Syne", system-ui, sans-serif;
--template-font-body: "Space Grotesk", system-ui, sans-serif;
}
```

## Core CSS Grammar
```css
.slide-2 .section-label{ font-size: 0.85rem; font-weight: 600; letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 2rem; opacity: 0.7; }

.slide-2 .toc-title{ font-family: 'Syne', sans-serif; font-size: clamp(2rem, 4vw, 3.5rem); font-weight: 700; margin-bottom: 3rem; max-width: 60%; }

.slide-2 .toc-grid{ display: grid; grid-template-columns: repeat(2, 1fr); gap: 2rem; max-width: 900px; }

.toc-item{ border: 3px solid var(--text); padding: 1.5rem; position: relative; background: var(--bg); }

.toc-item::before{ content: ''; position: absolute; top: 6px; left: 6px; right: -6px; bottom: -6px; border: 2px solid var(--text); z-index: -1; }

.toc-item .num{ font-family: 'Syne', sans-serif; font-size: 2.5rem; font-weight: 800; line-height: 1; margin-bottom: 0.5rem; }

.toc-item .label{ font-size: 1rem; font-weight: 500; }

.slide-3 .big-statement{ font-family: 'Syne', sans-serif; font-size: clamp(2.5rem, 5vw, 4.5rem); font-weight: 700; line-height: 1.1; max-width: 75%; margin-bottom: 3rem; }

.slide-3 .body-columns{ display: grid; grid-template-columns: 1fr 1fr; gap: 3rem; max-width: 800px; }

.slide-3 .body-text{ font-size: 1rem; line-height: 1.7; opacity: 0.9; }

.slide-4 .chart-header{ display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 3rem; }

.slide-4 .chart-title{ font-family: 'Syne', sans-serif; font-size: clamp(2rem, 4vw, 3rem); font-weight: 700; max-width: 50%; }

.slide-4 .chart-legend{ display: flex; gap: 1.5rem; font-size: 0.85rem; font-weight: 500; }

.chart-area{ flex: 1; display: flex; align-items: flex-end; gap: 2rem; padding-bottom: 2rem; position: relative; }

.chart-bars{ display: flex; align-items: flex-end; gap: 1.5rem; height: 100%; flex: 1; padding-left: 3rem; border-left: 3px solid var(--text); border-bottom: 3px solid var(--text); padding-bottom: 1rem; padding-top: 2rem; }

.bar-label{ font-size: 0.8rem; font-weight: 600; text-align: center; }

.team-grid{ display: grid; grid-template-columns: repeat(4, 1fr); gap: 2rem; flex: 1; align-content: center; }

.team-card{ border: 3px solid var(--text); padding: 1.5rem; position: relative; background: var(--bg); }
```

## Motion And Effects
- Decorative effect classes worth preserving as CSS-only motifs: doodle-star.
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
<section class="slide style-template-playful" data-motion="progressive-reveal" data-visual="comparison-table">
  <div class="slide-content">
    <p class="eyebrow">Playful</p>
    <h1>Playful gives serious arguments a distinctive editorial system</h1>
    <div class="card-grid">
      <article class="card" data-reveal>
        <h3>Visual thesis</h3>
        <p>Sun-warm peach background with Syne display: a friendly indie launch deck.</p>
      </article>
      <article class="card" data-reveal>
        <h3>Best use</h3>
        <p>Anything that should feel warm, indie, and approachable: creator portfolios, indie product launches, lifestyle brands, small-business pitches, newsletter / community decks.</p>
      </article>
    </div>
  </div>
</section>
```

## QA Checklist
- The generated slide clearly belongs to Playful, not to a generic SlideLeaf default.
- The palette, typography, spacing, and decorative vocabulary remain internally consistent.
- The slide uses SlideLeaf fragment rules: one section.slide root, no script, no style tag, no remote assets.
- Renderer-owned navigation is not duplicated.
- Content density, formality, and tone match the user's brief and audience.
