---
id: template-cartesian
category: style-direction
title: Template Style - Cartesian
tags: template, beautiful-html-templates, cartesian, light, high, low, quiet, considered, elegant, warm-minimal, classical, literary, restrained, confident-quiet, investment thesis, white paper, advisory deliverable, research report, book / longform pitch, gallery / cultural, 投资人, 融资, 路演, 创业, CEO, 董事会, 战略, 咨询, 技术, 开发者, 产品, SaaS, 研究, 报告, 学术, 白皮书, 品牌, 创意, 设计, 编辑感, 温暖, 活泼, 社区, 工作坊
motionPreset: progressive-reveal
sourceInfluences: beautiful-html-templates/cartesian, Playfair Display, Inter
---
## When To Use
- Anything that should feel quiet, considered, and grown-up: investment theses, white papers, advisory work, longform research, gallery / cultural decks. Also a strong choice for editorial features, founder reflections, or any deck where restraint is the message — including across tech and finance.
- Use when the requested mood overlaps with: quiet, considered, elegant, warm-minimal.
- Use when the occasion is close to: investment thesis, white paper, advisory deliverable, research report, book / longform pitch, gallery / cultural.
- Good fit for high formality, low density, and a light color scheme.

## When Not To Use
- Decks that need visual heat, multiple accents, or a sense of urgency — the warm-neutral palette is intentionally low-energy.
- Do not use when the audience expects a materially different formality level or content density.
- Do not use if the deck needs a conflicting visual language; pick a different template direction instead.

## Good Structure
- Visual thesis: Quiet warm-neutral palette with classical Playfair serifs; tasteful and unhurried.
- Palette discipline: bg_primary: #EDE8E0; bg_secondary: #E2DBD1; text_primary: #1A1A1A; text_secondary: #5A5A5A; accent: #8A8178; line: #B8B0A4; description: warm bone and stone neutrals only; no saturated color; the entire system runs on tonal contrast and typography
- Typography discipline: display: Playfair Display; body: Inter; style: transitional serif headlines paired with a clean grotesk; reads like a Sunday newspaper essay
- Layout grammar: content, slide-statement, quote-mark, stats, stat-item, slide-cards, cards-grid, card, card-icon, slide-timeline, timeline, timeline-item, team-grid.
- Slide grammar: cover, section, proof, comparison, quote, and closing variants.
- Convert the original full-template system into SlideLeaf fragments: one section.slide per file, shared CSS in themes/deck.css, and no project-level navigation code inside slide fragments.
- Extend missing layouts by reusing the same fonts, palette, spacing rhythm, decorative vocabulary, and component grammar.

## CSS Tokens
```css
.style-template-cartesian {
--bg-primary: #ede8e0;
--bg-secondary: #e2dbd1;
--text-primary: #1a1a1a;
--text-secondary: #5a5a5a;
--accent: #8a8178;
--line: #b8b0a4;
--template-bg-primary: #EDE8E0;
--template-bg-secondary: #E2DBD1;
--template-text-primary: #1A1A1A;
--template-text-secondary: #5A5A5A;
--template-accent: #8A8178;
--template-line: #B8B0A4;
--template-font-display: "Playfair Display", system-ui, sans-serif;
--template-font-body: "Inter", system-ui, sans-serif;
}
```

## Core CSS Grammar
```css
.label{ font-family: 'Inter', sans-serif; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 3px; color: var(--accent); font-weight: 500; }

.slide-title .content{ position: relative; z-index: 1; max-width: 65vw; }

.slide-title .label{ margin-bottom: 3vh; }

.slide-agenda .content{ display: grid; grid-template-columns: 1fr 1fr; gap: 6vw; align-items: center; height: 100%; position: relative; z-index: 1; }

.slide-statement{ justify-content: center; align-items: center; text-align: center; }

.slide-statement .content{ max-width: 60vw; position: relative; z-index: 1; display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100%; }

.slide-statement .quote-mark{ font-family: 'Playfair Display', serif; font-size: 5rem; line-height: 1; color: var(--line); opacity: 0.5; display: block; margin-bottom: 2vh; }

.slide-statement h2{ font-style: italic; margin-bottom: 3vh; }

.slide-statement .attribution{ font-size: 0.85rem; color: var(--accent); text-transform: uppercase; letter-spacing: 2px; }

.slide-barchart .content{ display: grid; grid-template-columns: 1fr 1.5fr; gap: 5vw; align-items: center; height: 100%; position: relative; z-index: 1; }

.slide-barchart .left-col h2{ margin-bottom: 2vh; }

.slide-barchart .chart-container{ position: relative; height: 55vh; width: 100%; }

.slide-twocol .content{ display: grid; grid-template-columns: 1fr 1fr; gap: 5vw; align-items: center; height: 100%; position: relative; z-index: 1; }

.slide-twocol .image-label{ position: relative; z-index: 1; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 2px; color: var(--accent); }

.slide-twocol .stats{ display: flex; gap: 3vw; margin-top: 4vh; padding-top: 3vh; border-top: 1px solid var(--line); }

.slide-twocol .stat-item h4{ font-family: 'Playfair Display', serif; font-size: 2rem; margin-bottom: 0.5vh; }

.slide-twocol .stat-item span{ font-size: 0.8rem; color: var(--accent); text-transform: uppercase; letter-spacing: 1px; }

.slide-cards{ justify-content: center; }
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
<section class="slide style-template-cartesian" data-motion="progressive-reveal" data-visual="executive-summary">
  <div class="slide-content">
    <p class="eyebrow">Cartesian</p>
    <h1>Cartesian gives serious arguments a distinctive editorial system</h1>
    <div class="card-grid">
      <article class="card" data-reveal>
        <h3>Visual thesis</h3>
        <p>Quiet warm-neutral palette with classical Playfair serifs; tasteful and unhurried.</p>
      </article>
      <article class="card" data-reveal>
        <h3>Best use</h3>
        <p>Anything that should feel quiet, considered, and grown-up: investment theses, white papers, advisory work, longform research, gallery / cultural decks.</p>
      </article>
    </div>
  </div>
</section>
```

## QA Checklist
- The generated slide clearly belongs to Cartesian, not to a generic SlideLeaf default.
- The palette, typography, spacing, and decorative vocabulary remain internally consistent.
- The slide uses SlideLeaf fragment rules: one section.slide root, no script, no style tag, no remote assets.
- Renderer-owned navigation is not duplicated.
- Content density, formality, and tone match the user's brief and audience.
