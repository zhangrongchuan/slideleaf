---
id: template-retro-windows
category: style-direction
title: Template Style - Retro Windows
tags: template, beautiful-html-templates, retro-windows, light, low, medium, nostalgic, retro, geeky, playful, winking, fun, retro gaming pitch, Y2K brand, creator portfolio (90s aesthetic), tech-history talk, shitpost-but-make-it-fancy deck, 投资人, 融资, 路演, 创业, 技术, 开发者, 产品, SaaS, 品牌, 创意, 设计, 编辑感, 温暖, 活泼, 社区, 工作坊
motionPreset: progressive-reveal
sourceInfluences: beautiful-html-templates/retro-windows, Press Start 2P, MS Sans Serif, VT323
---
## When To Use
- Anything that should feel knowingly nostalgic: retro gaming, Y2K-aesthetic brands, creator portfolios with a 90s vibe, tech-history talks, deliberately tongue-in-cheek decks. A great choice anywhere a playful retro reference is the entire point.
- Use when the requested mood overlaps with: nostalgic, retro, geeky, playful.
- Use when the occasion is close to: retro gaming pitch, Y2K brand, creator portfolio (90s aesthetic), tech-history talk, shitpost-but-make-it-fancy deck.
- Good fit for low formality, medium density, and a light color scheme.

## When Not To Use
- Decks that need to read as modern, elegant, or institutionally credible — the Win95 chrome will always read as a costume.
- Do not use when the audience expects a materially different formality level or content density.
- Do not use if the deck needs a conflicting visual language; pick a different template direction instead.

## Good Structure
- Visual thesis: Windows 95 chrome: gray title bars, MS Sans Serif, pixel typography, full nostalgia.
- Palette discipline: bg_gray: #C0C0C0; bg_light: #D4D0C8; blue_navy: #000080; blue_light: #1084D0; white: #FFFFFF; black: #000000; description: Windows 95 system palette: 3D-button gray, navy title bars, pixel-perfect inset/outset borders, no anti-aliasing aesthetic
- Typography discipline: display: Press Start 2P; body: MS Sans Serif; mono: VT323; style: 8-bit pixel display + Microsoft system sans + DOS terminal mono
- Layout grammar: win-body, panel-sunken, grid-2, panel-raised, retro-table, grid-4, grid-3.
- Slide grammar: cover, section, proof, comparison, quote, and closing variants.
- Convert the original full-template system into SlideLeaf fragments: one section.slide per file, shared CSS in themes/deck.css, and no project-level navigation code inside slide fragments.
- Extend missing layouts by reusing the same fonts, palette, spacing rhythm, decorative vocabulary, and component grammar.

## CSS Tokens
```css
.style-template-retro-windows {
--bg-gray: #c0c0c0;
--bg-light: #d4d0c8;
--bg-dark: #808080;
--blue-navy: #000080;
--blue-bright: #0000a0;
--blue-light: #1084d0;
--white: #ffffff;
--black: #000000;
--text-dark: #222222;
--btn-face: #d4d0c8;
--btn-highlight: #ffffff;
--btn-shadow: #404040;
--btn-dark-shadow: #000000;
--green-retro: #008000;
--red-retro: #800000;
--yellow-retro: #808000;
--cyan-retro: #008080;
--template-bg-gray: #C0C0C0;
--template-bg-light: #D4D0C8;
--template-blue-navy: #000080;
--template-blue-light: #1084D0;
--template-white: #FFFFFF;
--template-black: #000000;
--template-font-display: "Press Start 2P", system-ui, sans-serif;
--template-font-body: "MS Sans Serif", system-ui, sans-serif;
--template-font-mono: "VT323", system-ui, sans-serif;
}
```

## Core CSS Grammar
```css
.crt-overlay{ position: fixed; top: 0; left: 0; right: 0; bottom: 0; pointer-events: none; z-index: 9999; background: repeating-linear-gradient( 0deg, rgba(0, 0, 0, 0.03) 0px, rgba(0, 0, 0, 0.03) 1px, transparent 1px, transparent 3px ); }

.win-body{ padding: 20px 24px 24px 24px; flex: 1; overflow: hidden; display: flex; flex-direction: column; }

.panel-raised{ background: var(--bg-light); border: 2px solid var(--btn-highlight); border-right-color: var(--btn-dark-shadow); border-bottom-color: var(--btn-dark-shadow); padding: 16px; }

.panel-sunken{ background: var(--white); border: 2px solid var(--btn-shadow); border-right-color: var(--btn-highlight); border-bottom-color: var(--btn-highlight); padding: 12px; }

.grid-2{ display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }

.grid-3{ display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; }

.grid-4{ display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 18px; }

.chart-container{ position: relative; height: 100%; min-height: 200px; width: 100%; }

.chart-container-sm{ position: relative; height: 100%; min-height: 160px; width: 100%; }

table.retro-table{ width: 100%; border-collapse: collapse; font-size: 14px; }

table.retro-table th{ background: var(--bg-gray); border: 1px solid var(--btn-shadow); padding: 6px 10px; text-align: left; font-weight: bold; }

table.retro-table td{ border: 1px solid var(--bg-gray); padding: 6px 10px; background: var(--white); }

table.retro-table tr:nth-child(even) td{ background: #f0f0f0; }

@keyframes marquee{ 0%{ transform: translateX(100%); } 100%{ transform: translateX(-100%); } }
```

## Motion And Effects
- Reusable keyframe names detected: marquee. Keep subtle entrance, rule-reveal, scale-in, glow, or float effects; avoid motion that competes with reading.
- Decorative effect classes worth preserving as CSS-only motifs: crt-overlay, marquee-container, marquee-text.
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
- product-demo-flow
- roadmap
- architecture-diagram
- poster-hero
- quote-focus
- moodboard-grid

## Example Markup
```html
<section class="slide style-template-retro-windows" data-motion="progressive-reveal" data-visual="comparison-table">
  <div class="slide-content">
    <p class="eyebrow">Retro Windows</p>
    <h1>Retro Windows turns the deck into a recognizable design object</h1>
    <div class="card-grid">
      <article class="card" data-reveal>
        <h3>Visual thesis</h3>
        <p>Windows 95 chrome: gray title bars, MS Sans Serif, pixel typography, full nostalgia.</p>
      </article>
      <article class="card" data-reveal>
        <h3>Best use</h3>
        <p>Anything that should feel knowingly nostalgic: retro gaming, Y2K-aesthetic brands, creator portfolios with a 90s vibe, tech-history talks, deliberately tongue-in-cheek decks.</p>
      </article>
    </div>
  </div>
</section>
```

## QA Checklist
- The generated slide clearly belongs to Retro Windows, not to a generic SlideLeaf default.
- The palette, typography, spacing, and decorative vocabulary remain internally consistent.
- The slide uses SlideLeaf fragment rules: one section.slide root, no script, no style tag, no remote assets.
- Renderer-owned navigation is not duplicated.
- Content density, formality, and tone match the user's brief and audience.
