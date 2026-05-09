---
id: template-cobalt-grid
category: style-direction
title: Template Style - Cobalt Grid
tags: template, beautiful-html-templates, cobalt-grid, light, high, medium, editorial, design-research, studious, modernist, tech-print, monochrome, considered, literary, quietly-modern, design trend or research report, studio annual or seasonal bulletin, creative agency capabilities deck, art or architecture publication, academic / curatorial publication, newsletter or zine pitch, 投资人, 融资, 路演, 创业, 技术, 开发者, 产品, SaaS, 研究, 报告, 学术, 白皮书, 品牌, 创意, 设计, 编辑感, 暗色, 高级, 科技感
motionPreset: progressive-reveal
sourceInfluences: beautiful-html-templates/cobalt-grid, Newsreader (italic), Hanken Grotesk, DM Mono
---
## When To Use
- Anything that should feel like a quietly serious design / research bulletin, art publication, or curated trend report. Strong for studio annuals, agency capabilities decks, design-research publications, architecture / art / academic decks, and any deck wanting one strict accent colour and a printed-ledger calmness rather than corporate polish.
- Use when the requested mood overlaps with: editorial, design-research, studious, modernist, tech-print, monochrome.
- Use when the occasion is close to: design trend or research report, studio annual or seasonal bulletin, creative agency capabilities deck, art or architecture publication, academic / curatorial publication, newsletter or zine pitch.
- Good fit for high formality, medium density, and a light color scheme.

## When Not To Use
- Decks that need warmth, multi-colour energy, or a casual / playful voice — the strict cobalt + cream + grid palette is intentionally austere.
- Do not use when the audience expects a materially different formality level or content density.
- Do not use if the deck needs a conflicting visual language; pick a different template direction instead.

## Good Structure
- Visual thesis: Electric cobalt italic serifs on a graph-paper canvas, anchored by stair-stepped pixel-glitch decorations and slim hairline rules.
- Palette discipline: paper: #F0EBDE; ink: #1F2BE0; ink-soft: #5560E5; grid: rgba(31,43,224,0.10); description: warm cream / ivory paper canvas with one strict accent of electric cobalt royal blue. The grid is a faint cobalt overlay, and decorations (pixel stair-blocks, QR-style mini-grids, hairline rules) all use the same blue, keeping the deck strictly bichromatic
- Typography discipline: display: Newsreader (italic); body: Hanken Grotesk; mono: DM Mono; style: transitional italic serif for hero type and section heads, paired with a neutral grotesk for body and a clean mono for tabular data and micro-captions; strictly cobalt-on-cream
- Layout grammar: stage, s-cover, subkicker, ftag, meta-tag, lab-tag, num-tag, s-chapter, nm-tag, body, stat, s-quote, qkicker, qbody, who-tag, s-table, mood-tag, delta-tag.
- Slide grammar: s-cover, hairlines, active, s-manifesto, s-index, s-chapter, s-data, s-quote, s-table, s-colophon.
- Convert the original full-template system into SlideLeaf fragments: one section.slide per file, shared CSS in themes/deck.css, and no project-level navigation code inside slide fragments.
- Extend missing layouts by reusing the same fonts, palette, spacing rhythm, decorative vocabulary, and component grammar.

## CSS Tokens
```css
.style-template-cobalt-grid {
--paper: #F0EBDE;
--paper-2: #E6E0CE;
--ink: #1F2BE0;
--ink-soft: #5560E5;
--grid: rgba(31, 43, 224, 0.10);
--rule: #1F2BE0;
--template-paper: #F0EBDE;
--template-ink: #1F2BE0;
--template-ink-soft: #5560E5;
--template-grid: rgba(31,43,224,0.10);
--template-font-display: "Newsreader (italic)", system-ui, sans-serif;
--template-font-body: "Hanken Grotesk", system-ui, sans-serif;
--template-font-mono: "DM Mono", system-ui, sans-serif;
}
```

## Core CSS Grammar
```css
.stage{ position: relative; width: 100vw; height: 100vh; overflow: hidden; background: var(--paper); }

.stage::before{ content: ''; position: absolute; inset: 0; background-image: linear-gradient(to right, var(--grid) 1px, transparent 1px), linear-gradient(to bottom, var(--grid) 1px, transparent 1px); background-size: clamp(28px, 2.2vw, 44px) clamp(28px, 2.2vw, 44px); pointer-events: none; z-index: 1; }

.body-tx{ font-family: 'Hanken Grotesk', sans-serif; font-weight: 400; line-height: 1.5; color: var(--ink); }

.hairlines::before, .hairlines::after{ content: ''; position: absolute; left: clamp(36px, 3.6vw, 80px); right: clamp(36px, 3.6vw, 80px); height: 1.5px; background: var(--ink); z-index: 4; pointer-events: none; }

.hairlines::before{ top: clamp(28px, 2.6vh, 48px); }

.hairlines::after{ bottom: clamp(20px, 2vh, 32px); }

.s-cover{ background: var(--paper); }

.s-cover .titlewrap{ position: absolute; left: clamp(36px, 3.6vw, 80px); top: clamp(80px, 9vh, 160px); z-index: 5; max-width: 60%; }

.s-cover .title{ font-family: 'Newsreader', Georgia, serif; font-style: italic; font-weight: 400; font-size: clamp(100px, min(11vw, 18vh), 200px); line-height: 0.92; letter-spacing: -0.008em; color: var(--ink); }

.s-cover .subkicker{ margin-top: clamp(20px, 2.2vh, 36px); display: flex; flex-direction: column; gap: 6px; }

.s-cover .subkicker .l{ font-family: 'Hanken Grotesk', sans-serif; font-weight: 600; text-transform: uppercase; letter-spacing: 0.18em; font-size: clamp(13px, 1vw, 16px); color: var(--ink); }

.s-cover .subkicker .ed{ font-family: 'Newsreader', Georgia, serif; font-style: italic; font-size: clamp(28px, min(2.8vw, 4.6vh), 50px); line-height: 1.1; color: var(--ink); }

.s-cover .pixel-glitch{ top: clamp(60px, 6vh, 120px); right: clamp(36px, 3.6vw, 80px); width: clamp(280px, 32vw, 560px); bottom: clamp(110px, 12vh, 200px); }

.s-cover .qr-block{ top: clamp(60px, 6vh, 120px); right: clamp(120px, 8vw, 200px); width: clamp(58px, 4.2vw, 84px); height: clamp(58px, 4.2vw, 84px); }

.s-cover .vstack{ position: absolute; right: clamp(36px, 3.6vw, 60px); top: 50%; transform: translateY(-50%); z-index: 5; display: flex; flex-direction: column; gap: clamp(10px, 1.2vh, 18px); align-items: end; }

.s-cover .vstack .v-row{ font-family: 'DM Mono', ui-monospace, monospace; font-size: clamp(12px, 0.9vw, 15px); line-height: 1; color: var(--ink); letter-spacing: 0.04em; writing-mode: vertical-rl; text-orientation: mixed; }

.s-cover .cfooter{ position: absolute; left: clamp(36px, 3.6vw, 80px); right: clamp(680px, 40vw, 880px); bottom: clamp(82px, 8vh, 120px); display: flex; justify-content: flex-start; align-items: end; z-index: 5; gap: clamp(28px, 3vw, 56px); }

.s-cover .cfooter .colf{ font-family: 'Hanken Grotesk', sans-serif; font-size: clamp(14px, 0.92vw, 15px); line-height: 1.45; color: var(--ink); }
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
<section class="slide style-template-cobalt-grid" data-motion="progressive-reveal" data-visual="executive-summary">
  <div class="slide-content">
    <p class="eyebrow">Cobalt Grid</p>
    <h1>Cobalt Grid gives serious arguments a distinctive editorial system</h1>
    <div class="card-grid">
      <article class="card" data-reveal>
        <h3>Visual thesis</h3>
        <p>Electric cobalt italic serifs on a graph-paper canvas, anchored by stair-stepped pixel-glitch decorations and slim hairline rules.</p>
      </article>
      <article class="card" data-reveal>
        <h3>Best use</h3>
        <p>Anything that should feel like a quietly serious design / research bulletin, art publication, or curated trend report.</p>
      </article>
    </div>
  </div>
</section>
```

## QA Checklist
- The generated slide clearly belongs to Cobalt Grid, not to a generic SlideLeaf default.
- The palette, typography, spacing, and decorative vocabulary remain internally consistent.
- The slide uses SlideLeaf fragment rules: one section.slide root, no script, no style tag, no remote assets.
- Renderer-owned navigation is not duplicated.
- Content density, formality, and tone match the user's brief and audience.
