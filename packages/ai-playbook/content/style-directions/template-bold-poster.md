---
id: template-bold-poster
category: style-direction
title: Template Style - Bold Poster
tags: template, beautiful-html-templates, bold-poster, light, medium, low, bold, editorial, loud, confident, dramatic, graphic, sharp, intentional, brand manifesto, creative-led pitch, magazine / editorial, founder vision deck, art / culture, 投资人, 融资, 路演, 创业, 技术, 开发者, 产品, SaaS, 品牌, 创意, 设计, 编辑感
motionPreset: progressive-reveal
sourceInfluences: beautiful-html-templates/bold-poster, Shrikhand, Space Grotesk
---
## When To Use
- Anything that should land like a magazine cover: brand manifestos, founder vision decks, editorial / cultural pitches, creative reviews. Excellent any time you want a few words to feel like a poster — including unexpected fits like a tech keynote or a finance manifesto that wants to be quotable.
- Use when the requested mood overlaps with: bold, editorial, loud, confident.
- Use when the occasion is close to: brand manifesto, creative-led pitch, magazine / editorial, founder vision deck, art / culture.
- Good fit for medium formality, low density, and a light color scheme.

## When Not To Use
- Decks that need to communicate dense information per slide — the layout is built around a few large statements, not paragraphs of detail.
- Do not use when the audience expects a materially different formality level or content density.
- Do not use if the deck needs a conflicting visual language; pick a different template direction instead.

## Good Structure
- Visual thesis: Editorial poster aesthetic with massive Shrikhand display and a single fire-engine red accent.
- Palette discipline: bg: #FFFFFF; dark: #1C1410; red: #D8000F; light: #F5F2EF; description: white and warm-cream paper with deep almost-black ink, lifted by a single saturated fire-engine red
- Typography discipline: display: Shrikhand; serif: Libre Baskerville; body: Space Grotesk; style: groovy display + editorial serif + grotesk body; very high typographic contrast
- Layout grammar: slide-hero, hero-meta, hero-title-group, hero-title, hero-tagline, tag-label, tag-body, red-quote, hl-body, fin-grid, fc-body, slide-stat, stat-big, stat-row, stat-item, stat-context, svc-grid, svc-card.
- Slide grammar: cover, section, proof, comparison, quote, and closing variants.
- Convert the original full-template system into SlideLeaf fragments: one section.slide per file, shared CSS in themes/deck.css, and no project-level navigation code inside slide fragments.
- Extend missing layouts by reusing the same fonts, palette, spacing rhythm, decorative vocabulary, and component grammar.

## CSS Tokens
```css
.style-template-bold-poster {
--bg: #FFFFFF;
--dark: #1C1410;
--red: #D8000F;
--light: #F5F2EF;
--template-bg: #FFFFFF;
--template-dark: #1C1410;
--template-red: #D8000F;
--template-light: #F5F2EF;
--template-font-display: "Shrikhand", system-ui, sans-serif;
--template-font-serif: "Libre Baskerville", system-ui, sans-serif;
--template-font-body: "Space Grotesk", system-ui, sans-serif;
}
```

## Core CSS Grammar
```css
.slide-hero{ background: var(--bg); justify-content: flex-start; align-items: flex-start; padding-top: 5vh; padding-left: 7vw; }

.hero-meta{ font-family: 'Libre Baskerville', serif; font-size: clamp(11px, 1vw, 14px); font-style: italic; color: var(--dark); opacity: 0.6; margin-bottom: 1.5vh; letter-spacing: 0.5px; }

.hero-title-group{ position: relative; width: 100%; }

.hero-title{ font-family: 'Shrikhand', cursive; font-size: clamp(72px, 16vw, 220px); line-height: 0.88; color: var(--dark); letter-spacing: 1px; }

.hero-title.red{ color: var(--red); font-size: clamp(84px, 18vw, 260px); line-height: 0.85; transform: rotate(-4deg); display: inline-block; margin-left: -0.5vw; margin-top: -2vh; }

.hero-title.bottom{ font-size: clamp(64px, 14vw, 200px); line-height: 0.9; transform: rotate(2deg); display: inline-block; margin-top: -1vh; }

.hero-tagline{ position: absolute; right: 7vw; bottom: 8vh; text-align: right; max-width: 300px; }

.hero-tagline .tag-label{ font-family: 'Space Grotesk', sans-serif; font-size: clamp(10px, 0.9vw, 12px); letter-spacing: 3px; text-transform: uppercase; font-weight: 600; color: var(--red); margin-bottom: 8px; }

.hero-tagline .tag-body{ font-family: 'Libre Baskerville', serif; font-size: clamp(13px, 1.2vw, 16px); line-height: 1.6; color: var(--dark); font-style: italic; }

.red-quote{ font-family: 'Shrikhand', cursive; font-size: clamp(32px, 7vw, 90px); line-height: 1.15; text-shadow: 2px 2px 0 rgba(28, 20, 16, 0.25), 4px 4px 0 rgba(28, 20, 16, 0.2), 6px 6px 0 rgba(28, 20, 16, 0.15); max-width: 900px; }

.summary-hl .hl-label{ font-family: 'Space Grotesk', sans-serif; font-size: 10px; letter-spacing: 2px; text-transform: uppercase; font-weight: 600; color: var(--dark); margin-bottom: 4px; }

.summary-hl .hl-body{ font-family: 'Libre Baskerville', serif; font-size: clamp(11px, 1vw, 13px); line-height: 1.5; color: var(--dark); opacity: 0.75; }

.fin-grid{ display: grid; grid-template-columns: repeat(3, 1fr); gap: 0; width: 100%; max-width: 1100px; border: 3px solid var(--dark); }

.fin-cell .fc-label{ font-family: 'Space Grotesk', sans-serif; font-size: 10px; letter-spacing: 2px; text-transform: uppercase; font-weight: 600; color: var(--dark); margin-bottom: 6px; }

.fin-cell .fc-body{ font-family: 'Libre Baskerville', serif; font-size: clamp(11px, 1vw, 13px); line-height: 1.55; color: var(--dark); opacity: 0.8; margin-bottom: 10px; }

.slide-stat{ background: var(--bg); justify-content: center; align-items: center; text-align: center; }

.stat-big{ font-family: 'Shrikhand', cursive; font-size: clamp(120px, 26vw, 320px); line-height: 0.82; color: var(--red); transform: rotate(-6deg); display: inline-block; }

.stat-row{ display: flex; gap: 48px; justify-content: center; margin-top: 5vh; }
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
<section class="slide style-template-bold-poster" data-motion="progressive-reveal" data-visual="comparison-table">
  <div class="slide-content">
    <p class="eyebrow">Bold Poster</p>
    <h1>Bold Poster turns the deck into a recognizable design object</h1>
    <div class="card-grid">
      <article class="card" data-reveal>
        <h3>Visual thesis</h3>
        <p>Editorial poster aesthetic with massive Shrikhand display and a single fire-engine red accent.</p>
      </article>
      <article class="card" data-reveal>
        <h3>Best use</h3>
        <p>Anything that should land like a magazine cover: brand manifestos, founder vision decks, editorial / cultural pitches, creative reviews.</p>
      </article>
    </div>
  </div>
</section>
```

## QA Checklist
- The generated slide clearly belongs to Bold Poster, not to a generic SlideLeaf default.
- The palette, typography, spacing, and decorative vocabulary remain internally consistent.
- The slide uses SlideLeaf fragment rules: one section.slide root, no script, no style tag, no remote assets.
- Renderer-owned navigation is not duplicated.
- Content density, formality, and tone match the user's brief and audience.
