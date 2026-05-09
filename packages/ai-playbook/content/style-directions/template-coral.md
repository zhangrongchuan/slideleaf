---
id: template-coral
category: style-direction
title: Template Style - Coral
tags: template, beautiful-html-templates, coral, mixed, medium, bold, warm, modern, confident, graphic, punchy, magazine, fashion / beauty pitch, fitness brand, F&B brand deck, lifestyle launch, creative agency, 投资人, 融资, 路演, 创业, 技术, 开发者, 产品, SaaS, 研究, 报告, 学术, 白皮书, 品牌, 创意, 设计, 编辑感, 温暖, 活泼, 社区, 工作坊
motionPreset: progressive-reveal
sourceInfluences: beautiful-html-templates/coral, Bebas Neue, Inter
---
## When To Use
- Anything that should feel warm-graphic and editorial: fashion, beauty, fitness, F&B, lifestyle brands, agency credentials. Just as strong for a creator portfolio, a manifesto, or a tech / research deck that wants warmth and a single bold accent instead of corporate cool.
- Use when the requested mood overlaps with: bold, warm, modern, confident.
- Use when the occasion is close to: fashion / beauty pitch, fitness brand, F&B brand deck, lifestyle launch, creative agency.
- Good fit for medium formality, medium density, and a mixed color scheme.

## When Not To Use
- Contexts that should feel quiet or institutional — the coral accent and oversized Bebas Neue commit hard to a confident magazine voice.
- Do not use when the audience expects a materially different formality level or content density.
- Do not use if the deck needs a conflicting visual language; pick a different template direction instead.

## Good Structure
- Visual thesis: Cream and coral on near-black, set in oversized Bebas Neue.
- Palette discipline: coral: #E85D5D; coral_dark: #D44A4A; cream: #F5F0E8; cream_dark: #E8E0D4; ink: #1A1A1A; gray: #6B6B6B; description: near-black canvas, warm cream paper for content, and a saturated coral accent that carries the entire personality
- Typography discipline: display: Bebas Neue; body: Inter; style: tall condensed display sans for shouty headlines + neutral body for everything else
- Layout grammar: big-statement, body-text, stat-number, stat-label, columns-grid, column-card, card-icon, card-title, card-text, card-stat, quote-left, quote-right, quote-accent, quote-text, quote-author, quote-role, timeline-container, timeline-line.
- Slide grammar: cover, section, proof, comparison, quote, and closing variants.
- Convert the original full-template system into SlideLeaf fragments: one section.slide per file, shared CSS in themes/deck.css, and no project-level navigation code inside slide fragments.
- Extend missing layouts by reusing the same fonts, palette, spacing rhythm, decorative vocabulary, and component grammar.

## CSS Tokens
```css
.style-template-coral {
--coral: #E85D5D;
--coral-dark: #D44A4A;
--cream: #F5F0E8;
--cream-dark: #E8E0D4;
--black: #1A1A1A;
--gray: #6B6B6B;
--light-gray: #B0B0B0;
--template-coral: #E85D5D;
--template-coral-dark: #D44A4A;
--template-cream: #F5F0E8;
--template-cream-dark: #E8E0D4;
--template-ink: #1A1A1A;
--template-gray: #6B6B6B;
--template-font-display: "Bebas Neue", system-ui, sans-serif;
--template-font-body: "Inter", system-ui, sans-serif;
}
```

## Core CSS Grammar
```css
.slide-1 .title-rule{ width: 100%; height: 3px; background: var(--black); margin-top: clamp(16px, 2.5vh, 32px); opacity: 0.15; }

.slide-1 .meta-label{ font-family: 'Inter', sans-serif; font-size: 11px; font-weight: 600; letter-spacing: 3px; text-transform: uppercase; color: var(--gray); }

.slide-2 .section-label{ font-family: 'Inter', sans-serif; font-size: 12px; font-weight: 700; letter-spacing: 4px; text-transform: uppercase; color: var(--coral); margin-bottom: 24px; }

.slide-2 .big-statement{ font-family: 'Bebas Neue', sans-serif; font-size: clamp(42px, 7vw, 100px); color: var(--black); line-height: 1.0; letter-spacing: 2px; max-width: 90%; margin-bottom: 32px; }

.slide-2 .body-text{ font-family: 'Inter', sans-serif; font-size: clamp(15px, 1.4vw, 20px); line-height: 1.7; color: var(--gray); max-width: 600px; }

.slide-3 .right-col .item-label{ font-family: 'Inter', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; color: var(--coral); margin-bottom: 8px; }

.slide-4 .header-left .section-label{ font-family: 'Inter', sans-serif; font-size: 12px; font-weight: 700; letter-spacing: 4px; text-transform: uppercase; color: var(--coral); margin-bottom: 12px; }

.slide-4 .stat-number{ font-family: 'Bebas Neue', sans-serif; font-size: clamp(48px, 7vw, 96px); color: var(--coral); line-height: 1; }

.slide-4 .stat-label{ font-family: 'Inter', sans-serif; font-size: 12px; color: var(--gray); letter-spacing: 2px; text-transform: uppercase; }

.slide-4 .chart-container{ flex: 1; display: flex; gap: 40px; align-items: stretch; min-height: 0; }

.slide-4 .chart-wrapper{ flex: 2; position: relative; min-height: 0; }

.slide-4 .chart-wrapper canvas{ max-height: 100%; }

.slide-4 .chart-sidebar{ flex: 1; display: flex; flex-direction: column; gap: 20px; justify-content: center; }

.slide-4 .sidebar-item .label{ font-family: 'Inter', sans-serif; font-size: 12px; color: var(--gray); margin-top: 4px; letter-spacing: 1px; }

.slide-6 .columns-grid{ display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px; flex: 1; }

.slide-6 .column-card{ background: white; padding: clamp(24px, 3vh, 40px); border-top: 5px solid var(--coral); display: flex; flex-direction: column; }

.slide-6 .column-card .card-icon{ width: 48px; height: 48px; background: var(--coral); margin-bottom: 20px; display: flex; align-items: center; justify-content: center; font-family: 'Bebas Neue', sans-serif; font-size: 24px; color: white; }

.slide-6 .column-card .card-title{ font-family: 'Bebas Neue', sans-serif; font-size: clamp(24px, 2.5vw, 36px); color: var(--black); letter-spacing: 1px; margin-bottom: 12px; line-height: 1.1; }
```

## Motion And Effects
- Decorative effect classes worth preserving as CSS-only motifs: title-rule.
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
<section class="slide style-template-coral" data-motion="progressive-reveal" data-visual="comparison-table">
  <div class="slide-content">
    <p class="eyebrow">Coral</p>
    <h1>Coral gives serious arguments a distinctive editorial system</h1>
    <div class="card-grid">
      <article class="card" data-reveal>
        <h3>Visual thesis</h3>
        <p>Cream and coral on near-black, set in oversized Bebas Neue.</p>
      </article>
      <article class="card" data-reveal>
        <h3>Best use</h3>
        <p>Anything that should feel warm-graphic and editorial: fashion, beauty, fitness, F&amp;B, lifestyle brands, agency credentials.</p>
      </article>
    </div>
  </div>
</section>
```

## QA Checklist
- The generated slide clearly belongs to Coral, not to a generic SlideLeaf default.
- The palette, typography, spacing, and decorative vocabulary remain internally consistent.
- The slide uses SlideLeaf fragment rules: one section.slide root, no script, no style tag, no remote assets.
- Renderer-owned navigation is not duplicated.
- Content density, formality, and tone match the user's brief and audience.
