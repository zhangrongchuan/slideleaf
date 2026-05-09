---
id: template-neo-grid-bold
category: style-direction
title: Template Style - Neo-Grid Bold
tags: template, beautiful-html-templates, neo-grid-bold, light, medium, high, confident, punchy, editorial, modern, bold, minimal, design-led, graphic, product launch, design review, founder pitch, brand deck, consulting findings, conference talk, 投资人, 融资, 路演, 创业, CEO, 董事会, 战略, 咨询, 技术, 开发者, 产品, SaaS, 研究, 报告, 学术, 白皮书, 品牌, 创意, 设计, 编辑感
motionPreset: progressive-reveal
sourceInfluences: beautiful-html-templates/neo-grid-bold, Space Grotesk, JetBrains Mono
---
## When To Use
- Anything that should feel confident and editorial-graphic: design-led pitches, brand work, founder talks, conference keynotes. Excellent for stat-heavy slides, comparisons, and process flows. Just as strong for tech, research, or finance when the speaker wants to read as design-led rather than corporate.
- Use when the requested mood overlaps with: confident, punchy, editorial, modern.
- Use when the occasion is close to: product launch, design review, founder pitch, brand deck, consulting findings, conference talk.
- Good fit for medium formality, high density, and a light color scheme.

## When Not To Use
- Contexts that need to feel quiet, traditional, or warm — the neon-yellow accent and uppercase display commit to a confident editorial voice.
- Do not use when the audience expects a materially different formality level or content density.
- Do not use if the deck needs a conflicting visual language; pick a different template direction instead.

## Good Structure
- Visual thesis: Editorial neo-brutalism with a single neon yellow accent on off-white paper.
- Palette discipline: bg: #ECECE8; ink: #0A0A0A; paper: #F5F4EF; accent: #E6FF3D; muted: #8A8A85; description: off-white paper background, ink black, signature neon yellow accent used sparingly
- Typography discipline: display: Space Grotesk; body: Space Grotesk; mono: JetBrains Mono; style: geometric sans paired with technical mono captions; uppercase display weight
- Layout grammar: s-cover, panel-photo-l, panel-mid, panel-titletile, panel-photo-r, panel-cap, s-toc, card, s-stats, stat-a, stat-num, stat-b, stat-c, stat-big, s-features, tag, s-quote, col-body.
- Slide grammar: s-cover, s-toc, s-stats, s-features, s-chart, s-section, s-quote, s-cta, s-consult, s-chart2, s-process2, s-matrix2.
- Convert the original full-template system into SlideLeaf fragments: one section.slide per file, shared CSS in themes/deck.css, and no project-level navigation code inside slide fragments.
- Extend missing layouts by reusing the same fonts, palette, spacing rhythm, decorative vocabulary, and component grammar.

## CSS Tokens
```css
.style-template-neo-grid-bold {
--bg: #ECECE8;
--ink: #0A0A0A;
--paper: #F5F4EF;
--accent: #E6FF3D;
--line: #0A0A0A;
--muted: #8A8A85;
--template-bg: #ECECE8;
--template-ink: #0A0A0A;
--template-paper: #F5F4EF;
--template-accent: #E6FF3D;
--template-muted: #8A8A85;
--template-font-display: "Space Grotesk", system-ui, sans-serif;
--template-font-body: "Space Grotesk", system-ui, sans-serif;
--template-font-mono: "JetBrains Mono", system-ui, sans-serif;
}
```

## Core CSS Grammar
```css
.card{ background: var(--paper); position: relative; overflow: hidden; }

.card.ink{ background: var(--ink); color: var(--paper); }

.card.lemon{ background: var(--accent); color: var(--ink); }

.card.photo{ background: #111; color: #fff; }

.label{ font-family: "JetBrains Mono", ui-monospace, monospace; font-size: 24px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--ink); opacity: 0.7; }

.stat-num{ font-weight: 700; font-size: 156px; line-height: 0.9; letter-spacing: -0.03em; }

.stat-num.sm{ font-size: 96px; }

.s-cover .panel-photo-l{ grid-column: 1 / span 3; grid-row: 1 / span 8; background: #0a0a0a; position: relative; overflow: hidden; }

.s-cover .panel-photo-l .ph{ position: absolute; inset: 0; background: radial-gradient(120% 80% at 30% 30%, #2a2a2a 0%, #0a0a0a 70%), repeating-linear-gradient(135deg, rgba(255, 255, 255, .04) 0 2px, transparent 2px 8px); }

.s-cover .panel-photo-l::after{ content: "PORTRAIT / B&W"; position: absolute; left: 16px; bottom: 56px; font-family: "JetBrains Mono", monospace; font-size: 13px; color: rgba(255, 255, 255, .55); letter-spacing: .12em; }

.s-cover .panel-mid{ grid-column: 4 / span 5; grid-row: 1 / span 5; background: var(--accent); position: relative; }

.s-cover .panel-titletile{ grid-column: 4 / span 5; grid-row: 6 / span 3; background: var(--accent); position: relative; }

.s-cover .panel-photo-r{ grid-column: 9 / span 4; grid-row: 1 / span 5; background:#111; position: relative; overflow: hidden; }

.s-cover .panel-photo-r .ph{ position: absolute; inset: 0; background: radial-gradient(80% 60% at 60% 40%, #1f1f1f 0%, #0b0b0b 80%), repeating-linear-gradient(45deg, rgba(255, 255, 255, .05) 0 2px, transparent 2px 8px); }

.s-cover .panel-photo-r::after{ content: "PORTRAIT / B&W"; position: absolute; left: 16px; bottom: 16px; font-family: "JetBrains Mono", monospace; font-size: 13px; color: rgba(255, 255, 255, .55); letter-spacing: .12em; }

.s-cover .panel-cap{ grid-column: 9 / span 4; grid-row: 6 / span 3; background: var(--paper); position: relative; }

.s-cover .qr{ position: absolute; top: 28px; left: 28px; width: 90px; height: 90px; background: var(--ink); display: grid; grid-template-columns: repeat(5, 1fr); grid-template-rows: repeat(5, 1fr); gap: 0; }

.s-cover .qr i{ background: var(--ink); }
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
<section class="slide style-template-neo-grid-bold" data-motion="progressive-reveal" data-visual="metric-system">
  <div class="slide-content">
    <p class="eyebrow">Neo-Grid Bold</p>
    <h1>Neo-Grid Bold gives serious arguments a distinctive editorial system</h1>
    <div class="card-grid">
      <article class="card" data-reveal>
        <h3>Visual thesis</h3>
        <p>Editorial neo-brutalism with a single neon yellow accent on off-white paper.</p>
      </article>
      <article class="card" data-reveal>
        <h3>Best use</h3>
        <p>Anything that should feel confident and editorial-graphic: design-led pitches, brand work, founder talks, conference keynotes.</p>
      </article>
    </div>
  </div>
</section>
```

## QA Checklist
- The generated slide clearly belongs to Neo-Grid Bold, not to a generic SlideLeaf default.
- The palette, typography, spacing, and decorative vocabulary remain internally consistent.
- The slide uses SlideLeaf fragment rules: one section.slide root, no script, no style tag, no remote assets.
- Renderer-owned navigation is not duplicated.
- Content density, formality, and tone match the user's brief and audience.
