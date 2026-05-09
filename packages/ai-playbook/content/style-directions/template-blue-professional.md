---
id: template-blue-professional
category: style-direction
title: Template Style - Blue Professional
tags: template, beautiful-html-templates, blue-professional, light, medium-high, medium, professional, modern, calm, trustworthy, clean, considered, polished, neutral, B2B SaaS pitch, consulting deliverable, internal review, advisory pitch, investor update, 投资人, 融资, 路演, 创业, CEO, 董事会, 战略, 咨询, 技术, 开发者, 产品, SaaS, 研究, 报告, 学术, 白皮书, 品牌, 创意, 设计, 编辑感, 专业, 正式, 高级
motionPreset: progressive-reveal
sourceInfluences: beautiful-html-templates/blue-professional, Space Grotesk, Inter
---
## When To Use
- Anything that should feel modern-considered and lightly authoritative: B2B SaaS pitches, consulting deliverables, advisory updates, investor reports. Also a clean, tasteful choice whenever you want to read as professional without going stiff — research synthesis, internal reviews, brand work for service businesses.
- Use when the requested mood overlaps with: professional, modern, calm, trustworthy.
- Use when the occasion is close to: B2B SaaS pitch, consulting deliverable, internal review, advisory pitch, investor update.
- Good fit for medium-high formality, medium density, and a light color scheme.

## When Not To Use
- Contexts where the deck should feel hot, playful, or intentionally informal — the cool electric-blue restraint will read as overly polished.
- Do not use when the audience expects a materially different formality level or content density.
- Do not use if the deck needs a conflicting visual language; pick a different template direction instead.

## Good Structure
- Visual thesis: Cream paper background with electric cobalt blue accents; clean modern professional.
- Palette discipline: bg: #FDFAE7; primary: #1E2BFA; text: #111111; text_muted: #6B6B6B; description: warm cream paper background with one electric cobalt blue accent; restrained ink black text and soft muted greys
- Typography discipline: display: Space Grotesk; body: Inter; style: modern sans pairing; quiet, professional, no decorative flourishes
- Layout grammar: layout-cover, cover-decoration, cover-dots, layout-agenda, tag, slide-content, agenda-grid, layout-metrics, metrics-row, metric-card, metric-value, metric-label, metric-desc, metric-supports, metric-change, layout-dashboard, stats-grid, stat-cell.
- Slide grammar: cover, section, proof, comparison, quote, and closing variants.
- Convert the original full-template system into SlideLeaf fragments: one section.slide per file, shared CSS in themes/deck.css, and no project-level navigation code inside slide fragments.
- Extend missing layouts by reusing the same fonts, palette, spacing rhythm, decorative vocabulary, and component grammar.

## CSS Tokens
```css
.style-template-blue-professional {
--bg: #fdfae7;
--primary: #1e2bfa;
--text: #111111;
--text-muted: #6b6b6b;
--text-light: #9a9a9a;
--accent-light: rgba(30, 43, 250, 0.08);
--accent-medium: rgba(30, 43, 250, 0.15);
--border: rgba(30, 43, 250, 0.2);
--card-bg: rgba(30, 43, 250, 0.04);
--template-bg: #FDFAE7;
--template-primary: #1E2BFA;
--template-text: #111111;
--template-text-muted: #6B6B6B;
--template-font-display: "Space Grotesk", system-ui, sans-serif;
--template-font-body: "Inter", system-ui, sans-serif;
}
```

## Core CSS Grammar
```css
.slide-header .tag{ font-family: 'Space Grotesk', sans-serif; font-size: 0.75rem; font-weight: 500; color: var(--primary); background: var(--accent-light); padding: 0.35rem 0.9rem; border-radius: 100px; }

.slide-content{ flex: 1; display: flex; flex-direction: column; min-height: 0; }

.layout-cover{ justify-content: center; align-items: flex-start; padding-left: 8vw; }

.layout-cover h1{ max-width: 55vw; margin-bottom: 1.5rem; line-height: 1.05; }

.layout-cover .subtitle{ font-size: clamp(1rem, 1.5vw, 1.25rem); color: var(--text-muted); max-width: 40vw; margin-bottom: 3rem; font-weight: 400; }

.layout-cover .meta{ font-family: 'Space Grotesk', sans-serif; font-size: 0.8rem; color: var(--text-light); letter-spacing: 0.05em; }

.layout-cover .cover-decoration{ position: absolute; top: 0; right: 0; width: 35vw; height: 100vh; background: var(--accent-light); clip-path: polygon(30% 0, 100% 0, 100% 100%, 0% 100%); }

.layout-cover .cover-dots{ position: absolute; bottom: 12vh; right: 8vw; display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; opacity: 0.25; }

.layout-agenda .agenda-grid{ display: grid; grid-template-columns: repeat(2, 1fr); grid-template-rows: repeat(3, 1fr); gap: 1rem 3rem; margin-top: 1rem; flex: 1; min-height: 0; }

.layout-metrics .slide-content{ justify-content: flex-start; }

.layout-metrics .metrics-row{ display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; margin-top: 0.5rem; align-items: stretch; }

.metric-card{ display: flex; flex-direction: column; gap: 0.7rem; padding: 1.5rem 1.6rem; border-radius: 14px; border: 1.5px solid var(--border); background: var(--card-bg); }

.metric-card .metric-value{ font-family: 'Space Grotesk', sans-serif; font-size: clamp(2.2rem, 3.4vw, 3rem); font-weight: 700; color: var(--primary); line-height: 1; }

.metric-card .metric-label{ font-size: clamp(0.95rem, 1.3vw, 1.1rem); font-weight: 600; color: var(--text); line-height: 1.3; }

.metric-card .metric-desc{ font-size: clamp(0.78rem, 0.95vw, 0.9rem); color: var(--text-muted); line-height: 1.5; }

.metric-card .metric-supports{ list-style: none; display: flex; flex-direction: column; gap: 0.45rem; margin: 0.2rem 0 0; padding: 0.7rem 0 0; border-top: 1px solid var(--border); }

.metric-card .metric-supports li{ font-size: clamp(0.75rem, 0.9vw, 0.85rem); color: var(--text-muted); padding-left: 1rem; position: relative; line-height: 1.45; }

.metric-card .metric-supports li::before{ content: '—'; position: absolute; left: 0; color: var(--text-light); }
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
<section class="slide style-template-blue-professional" data-motion="progressive-reveal" data-visual="comparison-table">
  <div class="slide-content">
    <p class="eyebrow">Blue Professional</p>
    <h1>Blue Professional gives serious arguments a distinctive editorial system</h1>
    <div class="card-grid">
      <article class="card" data-reveal>
        <h3>Visual thesis</h3>
        <p>Cream paper background with electric cobalt blue accents; clean modern professional.</p>
      </article>
      <article class="card" data-reveal>
        <h3>Best use</h3>
        <p>Anything that should feel modern-considered and lightly authoritative: B2B SaaS pitches, consulting deliverables, advisory updates, investor reports.</p>
      </article>
    </div>
  </div>
</section>
```

## QA Checklist
- The generated slide clearly belongs to Blue Professional, not to a generic SlideLeaf default.
- The palette, typography, spacing, and decorative vocabulary remain internally consistent.
- The slide uses SlideLeaf fragment rules: one section.slide root, no script, no style tag, no remote assets.
- Renderer-owned navigation is not duplicated.
- Content density, formality, and tone match the user's brief and audience.
