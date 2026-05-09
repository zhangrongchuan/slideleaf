---
id: template-stencil-tablet
category: style-direction
title: Template Style - Stencil & Tablet
tags: template, beautiful-html-templates, stencil-tablet, light, medium-high, medium, archival, earthy, tactile, considered, graphic, weighty, literary, museum / cultural institution, art / architecture brand, longform research, heritage / craft brand, manifesto, 技术, 开发者, 产品, SaaS, 研究, 报告, 学术, 白皮书, 品牌, 创意, 设计, 编辑感
motionPreset: progressive-reveal
sourceInfluences: beautiful-html-templates/stencil-tablet, Bowlby One, Inter
---
## When To Use
- Anything that should feel archival, tactile, and weighty-graphic: museum and cultural-institution decks, art / architecture brands, longform research, heritage and craft brands, manifestos. A great choice anytime — including across tech and business — when you want the deck to feel like a field manual rather than a slide deck.
- Use when the requested mood overlaps with: archival, earthy, tactile, considered, graphic.
- Use when the occasion is close to: museum / cultural institution, art / architecture brand, longform research, heritage / craft brand, manifesto.
- Good fit for medium-high formality, medium density, and a light color scheme.

## When Not To Use
- Contexts that demand digital-native polish or playful pop — the stencil-cut display and earth-tone palette commit to a deliberate analog feel.
- Do not use when the audience expects a materially different formality level or content density.
- Do not use if the deck needs a conflicting visual language; pick a different template direction instead.

## Good Structure
- Visual thesis: Bone paper with stencil-cut headlines and a six-color earth palette: archaeology meets brand.
- Palette discipline: bone: #E2DCC9; ink: #0A0A0A; paper: #F4EFE0; sienna: #A06A3C; magenta: #C73B7A; orange: #EE7A2E; teal: #2D7E73; blue: #3F73B7; olive: #6F7A2E; description: warm bone and paper neutrals with a saturated earthy palette (sienna, magenta, orange, teal, blue, olive) used in stencil-cut blocks
- Typography discipline: display: Bowlby One; stencil: Stardos Stencil; condensed: Barlow Condensed; body: Inter; style: ultra-heavy display + stencil + tall condensed + clean body; reads like an archaeological field manual
- Layout grammar: s-cover, stage, grid, card, tag, flow, timeline, table, note, s-stats, stat, s-quote, panel.
- Slide grammar: s-cover, s-agenda, dark, s-princ, s-sec, s-consult, s-chart, s-process, s-matrix, s-stats, s-quote, s-cta.
- Convert the original full-template system into SlideLeaf fragments: one section.slide per file, shared CSS in themes/deck.css, and no project-level navigation code inside slide fragments.
- Extend missing layouts by reusing the same fonts, palette, spacing rhythm, decorative vocabulary, and component grammar.

## CSS Tokens
```css
.style-template-stencil-tablet {
--bone: #E2DCC9;
--black: #000000;
--ink: #0A0A0A;
--paper: #F4EFE0;
--sienna: #A06A3C;
--magenta: #C73B7A;
--orange: #EE7A2E;
--teal: #2D7E73;
--blue: #3F73B7;
--mustard: #D8A93B;
--olive: #6F7A2E;
--template-bone: #E2DCC9;
--template-ink: #0A0A0A;
--template-paper: #F4EFE0;
--template-sienna: #A06A3C;
--template-magenta: #C73B7A;
--template-orange: #EE7A2E;
--template-teal: #2D7E73;
--template-blue: #3F73B7;
--template-olive: #6F7A2E;
--template-font-display: "Bowlby One", system-ui, sans-serif;
--template-font-stencil: "Stardos Stencil", system-ui, sans-serif;
--template-font-condensed: "Barlow Condensed", system-ui, sans-serif;
--template-font-body: "Inter", system-ui, sans-serif;
}
```

## Core CSS Grammar
```css
section.slide.dark{ background: var(--black); color: var(--bone); }

section.slide.dark .top{ color: var(--bone); }

section.slide.dark .footer{ color: var(--bone); }

.tablet{ border-radius: 26px; padding: 38px 32px 32px; display: flex; flex-direction: column; position: relative; overflow: hidden; }

.tablet .num{ font-family: "Stardos Stencil", "Bowlby One", serif; font-weight: 700; line-height: .9; color: var(--ink); font-size: 220px; letter-spacing: -.02em; }

.tablet h3{ font-family: "Stardos Stencil", serif; font-weight: 700; font-size: 30px; line-height: 1; text-transform: uppercase; letter-spacing: .02em; margin-top: auto; margin-bottom: 14px; }

.tablet p{ font-family: "Inter", sans-serif; font-size: 22px; line-height: 1.4; color: var(--ink); }

.tablet.dark{ color: var(--bone); }

.tablet.dark h3{ color: var(--bone); }

.tablet.dark p{ color: var(--bone); opacity: .9; }

.s-cover{ padding: 0; }

.s-cover .stage{ position: absolute; inset: 0; display: grid; grid-template-rows: 1fr auto; padding: 48px 64px; }

.s-cover .super{ font-family: "Barlow Condensed", sans-serif; font-weight: 800; font-size: 28px; letter-spacing: .12em; text-transform: uppercase; opacity: .8; }

.s-cover h1{ font-family: "Stardos Stencil", serif; font-weight: 700; font-size: 220px; line-height: .82; letter-spacing: -.015em; text-transform: uppercase; color: var(--ink); align-self: end; margin: 0; }

.s-cover h1 em{ font-style: normal; color: var(--magenta); }

.s-cover .row{ display: flex; align-items: end; justify-content: space-between; margin-top: 24px; }

.s-cover .row .lockup{ display: flex; align-items: center; gap: 18px; }

.s-cover .row .mark{ width: 56px; height: 56px; border-radius: 14px; background: var(--orange); }
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
<section class="slide style-template-stencil-tablet" data-motion="progressive-reveal" data-visual="comparison-table">
  <div class="slide-content">
    <p class="eyebrow">Stencil & Tablet</p>
    <h1>Stencil &amp; Tablet gives serious arguments a distinctive editorial system</h1>
    <div class="card-grid">
      <article class="card" data-reveal>
        <h3>Visual thesis</h3>
        <p>Bone paper with stencil-cut headlines and a six-color earth palette: archaeology meets brand.</p>
      </article>
      <article class="card" data-reveal>
        <h3>Best use</h3>
        <p>Anything that should feel archival, tactile, and weighty-graphic: museum and cultural-institution decks, art / architecture brands, longform research, heritage and craft brands, manifestos.</p>
      </article>
    </div>
  </div>
</section>
```

## QA Checklist
- The generated slide clearly belongs to Stencil & Tablet, not to a generic SlideLeaf default.
- The palette, typography, spacing, and decorative vocabulary remain internally consistent.
- The slide uses SlideLeaf fragment rules: one section.slide root, no script, no style tag, no remote assets.
- Renderer-owned navigation is not duplicated.
- Content density, formality, and tone match the user's brief and audience.
