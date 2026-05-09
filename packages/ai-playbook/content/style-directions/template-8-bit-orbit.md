---
id: template-8-bit-orbit
category: style-direction
title: Template Style - 8-Bit Orbit
tags: template, beautiful-html-templates, 8-bit-orbit, dark, low, medium, retro-tech, playful, cyberpunk, energetic, geeky, neon, rebellious, sci-fi, gaming pitch, hackathon demo, web3 / crypto deck, indie product launch, developer tools, synthwave brand, 投资人, 融资, 路演, 创业, 技术, 开发者, 产品, SaaS, 品牌, 创意, 设计, 编辑感, 温暖, 活泼, 社区, 工作坊, 暗色, 高级, 科技感
motionPreset: progressive-reveal
sourceInfluences: beautiful-html-templates/8-bit-orbit, Tektur, Chakra Petch, Space Mono
---
## When To Use
- Anything that should feel like a CRT screen at 2am: cyberpunk, gaming, web3, indie dev tools, hackathon demos. Just as good for a tech talk that wants to lean into nostalgic-digital craft, a synthwave brand deck, or a creative review that wants to feel like a console.
- Use when the requested mood overlaps with: retro-tech, playful, cyberpunk, energetic.
- Use when the occasion is close to: gaming pitch, hackathon demo, web3 / crypto deck, indie product launch, developer tools, synthwave brand.
- Good fit for low formality, medium density, and a dark color scheme.

## When Not To Use
- Contexts where the dark neon palette would actively work against the message — quiet institutional finance disclosures, healthcare patient-facing materials, traditional luxury.
- Do not use when the audience expects a materially different formality level or content density.
- Do not use if the deck needs a conflicting visual language; pick a different template direction instead.

## Good Structure
- Visual thesis: Pixel-art neon arcade aesthetic on a deep navy void.
- Palette discipline: neon_pink: #F0A6CA; neon_cyan: #5EDCF4; neon_yellow: #F4D03F; deep_navy: #0F1B3D; void: #0A0E27; lavender: #E2D5F2; description: deep navy/black void with neon pink, cyan, and yellow pops; pixel art accents and CRT-monitor energy
- Typography discipline: display: Tektur; body: Chakra Petch; mono: Space Mono; style: boxy display sans paired with technical mono, all unmistakably digital and pixel-flavored
- Layout grammar: bg-grid, slide-content, hero-subtitle, pixel-hero-text, hero-tagline, hero-badges, hero-badge, bg-grid-pink, split-layout, bg-grid-cyan, feature-grid, feature-card, feature-icon, chart-slide-layout, bg-grid-lavender, timeline-container, timeline-line, timeline-events.
- Slide grammar: bg-grid, scanlines, grain, crt-glow, bg-grid-pink, bg-grid-cyan, bg-grid-lavender.
- Convert the original full-template system into SlideLeaf fragments: one section.slide per file, shared CSS in themes/deck.css, and no project-level navigation code inside slide fragments.
- Extend missing layouts by reusing the same fonts, palette, spacing rhythm, decorative vocabulary, and component grammar.

## CSS Tokens
```css
.style-template-8-bit-orbit {
--neon-pink: #F0A6CA;
--neon-cyan: #5EDCF4;
--neon-yellow: #F4D03F;
--deep-navy: #0F1B3D;
--dark-void: #0A0E27;
--soft-lavender: #E2D5F2;
--pixel-size: 4px;
--font-display: 'Tektur', cursive;
--font-body: 'Chakra Petch', sans-serif;
--font-mono: 'Space Mono', monospace;
--template-neon-pink: #F0A6CA;
--template-neon-cyan: #5EDCF4;
--template-neon-yellow: #F4D03F;
--template-deep-navy: #0F1B3D;
--template-void: #0A0E27;
--template-lavender: #E2D5F2;
--template-font-display: "Tektur", system-ui, sans-serif;
--template-font-body: "Chakra Petch", system-ui, sans-serif;
--template-font-mono: "Space Mono", system-ui, sans-serif;
}
```

## Core CSS Grammar
```css
.scanlines::after{ content: ""; position: absolute; inset: 0; background: repeating-linear-gradient( 0deg, transparent 0px, transparent 2px, rgba(10, 14, 39, 0.04) 2px, rgba(10, 14, 39, 0.04) 4px ); pointer-events: none; z-index: 50; mix-blend-mode: multiply; }

.grain::before{ content: ""; position: absolute; inset: 0; background-image: url(/* embedded texture omitted */); opacity: 0.035; pointer-events: none; z-index: 49; }

.crt-glow::after{ content: ""; position: absolute; inset: 0; background: radial-gradient(ellipse at center, transparent 50%, rgba(10, 14, 39, 0.25) 100%); pointer-events: none; z-index: 51; }

.bg-grid{ background-color: var(--dark-void); background-image: linear-gradient(rgba(94, 220, 244, 0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(94, 220, 244, 0.07) 1px, transparent 1px); background-size: 40px 40px; }

.bg-grid-pink{ background-color: var(--neon-pink); background-image: linear-gradient(rgba(15, 27, 61, 0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(15, 27, 61, 0.06) 1px, transparent 1px); background-size: 40px 40px; }

.bg-grid-cyan{ background-color: var(--neon-cyan); background-image: linear-gradient(rgba(15, 27, 61, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(15, 27, 61, 0.08) 1px, transparent 1px); background-size: 40px 40px; }

.bg-grid-lavender{ background-color: var(--soft-lavender); background-image: linear-gradient(rgba(15, 27, 61, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(15, 27, 61, 0.05) 1px, transparent 1px); background-size: 40px 40px; }

.starfield{ position: absolute; inset: 0; overflow: hidden; z-index: 1; }

.starfield .star{ position: absolute; width: 4px; height: 4px; background: var(--neon-cyan); opacity: 0.6; animation: twinkle 3s infinite ease-in-out; }

.starfield .star:nth-child(2n){ background: var(--neon-yellow); }

.starfield .star:nth-child(3n){ background: var(--neon-pink); }

.starfield .star:nth-child(4n){ width: 6px; height: 6px; }

.pixel-particles{ position: absolute; inset: 0; overflow: hidden; z-index: 1; pointer-events: none; }

.pixel-particles .p{ position: absolute; width: 8px; height: 8px; opacity: 0.4; animation: float 8s infinite ease-in-out; }

.pixel-hero-text{ font-family: var(--font-display); font-weight: 900; font-size: clamp(3rem, 10vw, 8rem); line-height: 1.05; color: var(--neon-cyan); text-shadow: 4px 4px 0 var(--neon-yellow), 8px 8px 0 var(--deep-navy); letter-spacing: 0.04em; }

.pixel-label{ font-family: var(--font-mono); font-size: 0.75rem; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: var(--neon-yellow); background: var(--deep-navy); padding: 6px 14px; display: inline-block; margin-bottom: 1.5rem; }

.slide-content{ position: relative; z-index: 10; width: 100%; max-width: 1200px; display: flex; flex-direction: column; justify-content: center; align-items: center; }

.hero-subtitle{ font-family: var(--font-mono); font-size: 0.85rem; letter-spacing: 0.3em; color: var(--neon-pink); text-transform: uppercase; margin-bottom: 1.5rem; }

@keyframes twinkle{ 0%, 100%{ opacity: 0.3; transform: scale(1); } 50%{ opacity: 0.9; transform: scale(1.3); } }

@keyframes float{ 0%, 100%{ transform: translateY(0) rotate(0deg); } 50%{ transform: translateY(-30px) rotate(90deg); } }
```

## Motion And Effects
- Reusable keyframe names detected: twinkle, float. Keep subtle entrance, rule-reveal, scale-in, glow, or float effects; avoid motion that competes with reading.
- Decorative effect classes worth preserving as CSS-only motifs: scanlines, grain, crt-glow, starfield, pixel-particles.
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
<section class="slide style-template-8-bit-orbit" data-motion="progressive-reveal" data-visual="comparison-table">
  <div class="slide-content">
    <p class="eyebrow">8-Bit Orbit</p>
    <h1>8-Bit Orbit turns the deck into a recognizable design object</h1>
    <div class="card-grid">
      <article class="card" data-reveal>
        <h3>Visual thesis</h3>
        <p>Pixel-art neon arcade aesthetic on a deep navy void.</p>
      </article>
      <article class="card" data-reveal>
        <h3>Best use</h3>
        <p>Anything that should feel like a CRT screen at 2am: cyberpunk, gaming, web3, indie dev tools, hackathon demos.</p>
      </article>
    </div>
  </div>
</section>
```

## QA Checklist
- The generated slide clearly belongs to 8-Bit Orbit, not to a generic SlideLeaf default.
- The palette, typography, spacing, and decorative vocabulary remain internally consistent.
- The slide uses SlideLeaf fragment rules: one section.slide root, no script, no style tag, no remote assets.
- Renderer-owned navigation is not duplicated.
- Content density, formality, and tone match the user's brief and audience.
