---
id: template-pin-and-paper
category: style-direction
title: Template Style - Pin & Paper
tags: template, beautiful-html-templates, pin-and-paper, light, medium, crafted, handmade, warm, thoughtful, literary, intimate, grounded, research findings with personality, qualitative report, founder reflection, creator essay deck, workshop debrief, 投资人, 融资, 路演, 创业, 技术, 开发者, 产品, SaaS, 研究, 报告, 学术, 白皮书, 品牌, 创意, 设计, 编辑感, 温暖, 活泼, 社区, 工作坊
motionPreset: progressive-reveal
sourceInfluences: beautiful-html-templates/pin-and-paper, Caveat, Space Grotesk, DM Mono
---
## When To Use
- Anything that should feel hand-crafted, warm, and literary: qualitative research findings, founder reflections, longform brand stories, workshop debriefs. The signature safety-pin illustrations and paper-grain texture make it especially good for any deck — including tech or business — that wants personality and warmth over polish.
- Use when the requested mood overlaps with: crafted, handmade, warm, thoughtful, literary.
- Use when the occasion is close to: research findings with personality, qualitative report, founder reflection, creator essay deck, workshop debrief.
- Good fit for medium formality, medium density, and a light color scheme.

## When Not To Use
- Decks that need to feel digital-native polished or rigorously data-driven — handwritten Caveat is intentionally informal.
- Do not use when the audience expects a materially different formality level or content density.
- Do not use if the deck needs a conflicting visual language; pick a different template direction instead.

## Good Structure
- Visual thesis: Yellow paper with safety-pin illustrations, ink-blue handwritten Caveat, paper-grain texture.
- Palette discipline: paper: #EFE56A; cream: #F8F1D6; ink: #1F3A8A; red: #C2342B; description: saturated yellow paper, soft cream alternate, deep ink-blue type, plus rust red, kraft, and olive accents; visible paper grain texture
- Typography discipline: display: Caveat; body: Space Grotesk; mono: DM Mono; style: handwritten script for warmth + grotesk for legibility + mono for captions; textbook annotation feel
- Layout grammar: s-cover, stage, s-notes, grid, card, flow, timeline, table, s-stats, stat, s-quote, panel.
- Slide grammar: s-cover, s-agenda, s-notes, s-sec, ink, s-notice, s-chart, s-process, s-matrix, s-stats, s-quote, s-cta.
- Convert the original full-template system into SlideLeaf fragments: one section.slide per file, shared CSS in themes/deck.css, and no project-level navigation code inside slide fragments.
- Extend missing layouts by reusing the same fonts, palette, spacing rhythm, decorative vocabulary, and component grammar.

## CSS Tokens
```css
.style-template-pin-and-paper {
--paper: #EFE56A;
--paper-2: #F5ECA0;
--paper-3: #E8D85A;
--cream: #F8F1D6;
--kraft: #C9A66B;
--ink: #1F3A8A;
--ink-soft: #2D4FB8;
--ink-line: #3457C4;
--black: #0E1430;
--red: #C2342B;
--olive: #6B7A2E;
--orange: #D8702A;
--template-paper: #EFE56A;
--template-cream: #F8F1D6;
--template-ink: #1F3A8A;
--template-red: #C2342B;
--template-font-display: "Caveat", system-ui, sans-serif;
--template-font-body: "Space Grotesk", system-ui, sans-serif;
--template-font-mono: "DM Mono", system-ui, sans-serif;
}
```

## Core CSS Grammar
```css
section.slide.ink{ background: radial-gradient(120% 90% at 20% 10%, rgba(255, 255, 255, .06), transparent 60%), var(--ink); color: var(--paper); }

section.slide.ink::before{ opacity: .25; mix-blend-mode: screen; }

section.slide.ink .top{ color: var(--paper); }

section.slide.ink .footer{ color: var(--paper); opacity: .75; }

.stamp{ display: inline-block; border: 3px solid var(--red); color: var(--red); padding: 6px 16px; font-family: "DM Mono", monospace; font-weight: 500; font-size: 16px; letter-spacing: .18em; text-transform: uppercase; transform: rotate(-4deg); }

.s-cover{ padding: 0; }

.s-cover .stage{ position: absolute; inset: 0; padding: 110px 64px 80px; display: grid; grid-template-rows: auto 1fr auto; gap: 24px; z-index: 2; }

.s-cover .super{ font-family: "DM Mono", monospace; font-weight: 500; font-size: 18px; letter-spacing: .22em; text-transform: uppercase; opacity: .85; }

.s-cover h1{ font-family: "Space Grotesk", sans-serif; font-weight: 700; font-size: 196px; line-height: .88; letter-spacing: -.04em; color: var(--ink); margin: 0; align-self: center; max-width: 14ch; }

.s-cover h1 em{ font-family: "Caveat", cursive; font-weight: 700; font-style: normal; color: var(--ink); font-size: 1.05em; letter-spacing: -.005em; }

.s-cover .pin-1{ position: absolute; top: 130px; right: 80px; width: 420px; transform: rotate(-8deg); color: var(--ink); z-index: 1; }

.s-cover .pin-2{ position: absolute; bottom: 200px; right: 140px; width: 360px; transform: rotate(14deg); color: var(--ink); z-index: 1; }

.s-cover .handwritten{ position: absolute; right: 80px; bottom: 360px; font-family: "Caveat", cursive; font-size: 38px; line-height: 1.1; color: var(--ink); transform: rotate(-3deg); transform-origin: right bottom; text-align: right; z-index: 3; }

.s-cover .handwritten .underline{ border-bottom: 2px solid var(--ink); }

.s-cover .row{ display: flex; align-items: end; justify-content: space-between; gap: 32px; }

.s-cover .row .who{ font-family: "DM Mono", monospace; font-weight: 500; font-size: 16px; letter-spacing: .18em; text-transform: uppercase; }

.s-cover .row .who small{ display: block; opacity: .7; margin-top: 6px; letter-spacing: .14em; }

.s-cover .row .date{ font-family: "DM Mono", monospace; font-weight: 500; font-size: 16px; letter-spacing: .18em; text-transform: uppercase; text-align: right; }
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
<section class="slide style-template-pin-and-paper" data-motion="progressive-reveal" data-visual="comparison-table">
  <div class="slide-content">
    <p class="eyebrow">Pin & Paper</p>
    <h1>Pin &amp; Paper gives serious arguments a distinctive editorial system</h1>
    <div class="card-grid">
      <article class="card" data-reveal>
        <h3>Visual thesis</h3>
        <p>Yellow paper with safety-pin illustrations, ink-blue handwritten Caveat, paper-grain texture.</p>
      </article>
      <article class="card" data-reveal>
        <h3>Best use</h3>
        <p>Anything that should feel hand-crafted, warm, and literary: qualitative research findings, founder reflections, longform brand stories, workshop debriefs.</p>
      </article>
    </div>
  </div>
</section>
```

## QA Checklist
- The generated slide clearly belongs to Pin & Paper, not to a generic SlideLeaf default.
- The palette, typography, spacing, and decorative vocabulary remain internally consistent.
- The slide uses SlideLeaf fragment rules: one section.slide root, no script, no style tag, no remote assets.
- Renderer-owned navigation is not duplicated.
- Content density, formality, and tone match the user's brief and audience.
