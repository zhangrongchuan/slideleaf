---
id: template-studio
category: style-direction
title: Template Style - Studio
tags: template, beautiful-html-templates, studio, dark, medium, electric, bold, graphic, design-led, high-contrast, loud, modern, intentional, design studio credentials, creative agency pitch, brand showcase, art-direction review, fashion / sneaker brand, bilingual EN/CN deck, 投资人, 融资, 路演, 创业, 技术, 开发者, 产品, SaaS, 研究, 报告, 学术, 白皮书, 品牌, 创意, 设计, 编辑感, 暗色, 高级, 科技感, 专业, 正式
motionPreset: progressive-reveal
sourceInfluences: beautiful-html-templates/studio, Barlow, IBM Plex Mono
---
## When To Use
- Anything that should feel electric and design-led: studio credentials, creative agency pitches, brand showcases, art-direction reviews, fashion / sneaker brand work. Also a striking unexpected choice for tech, research, or business decks where the speaker wants the deck to *be* a brand statement.
- Use when the requested mood overlaps with: electric, bold, graphic, design-led, high-contrast.
- Use when the occasion is close to: design studio credentials, creative agency pitch, brand showcase, art-direction review, fashion / sneaker brand, bilingual EN/CN deck.
- Good fit for medium formality, medium density, and a dark color scheme.

## When Not To Use
- Contexts that should feel quiet or institutional — the black-and-electric-yellow palette is the loudest in the library.
- Do not use when the audience expects a materially different formality level or content density.
- Do not use if the deck needs a conflicting visual language; pick a different template direction instead.

## Good Structure
- Visual thesis: Black canvas with electric-yellow type; high-voltage design studio aesthetic.
- Palette discipline: bg: #1c1c1c; bg_alt: #242422; fg: #f5d200; accent: #f5d200; bg_light: #f5d200; description: near-black canvas with one signature electric-yellow that doubles as foreground type AND accent; reverses to yellow-paper mode for breathing room
- Typography discipline: display: Barlow; body: Barlow; mono: IBM Plex Mono; cn: Noto Sans SC; style: broadcast-grotesk display + technical mono captions; ultra-high-contrast typographic system
- Layout grammar: slide--cover, cover-img-area, cover-type, cover-meta, cover-meta-col, slide--chapter, chapter-num, slide--statement, statement-body, slide-chrome, slide-body, slide--stats, stats-grid, stat-card, stat-value, stat-label, stat-note, slide--quote.
- Slide grammar: dark, slide--cover, light, slide--chapter, slide--statement, slide--split, slide--stats, slide--list, slide--quote, slide--compare, slide--chart, slide--end.
- Convert the original full-template system into SlideLeaf fragments: one section.slide per file, shared CSS in themes/deck.css, and no project-level navigation code inside slide fragments.
- Extend missing layouts by reusing the same fonts, palette, spacing rhythm, decorative vocabulary, and component grammar.

## CSS Tokens
```css
.style-template-studio {
--c-bg: #1c1c1c;
--c-bg-alt: #242422;
--c-bg-light: #f5d200;
--c-bg-light-alt: #f0cc00;
--c-fg: #f5d200;
--c-fg-2: rgba(245, 210, 0, 0.58);
--c-fg-3: rgba(245, 210, 0, 0.32);
--c-fg-light: #1c1c1c;
--c-fg-light-2: rgba(28, 28, 28, 0.62);
--c-fg-light-3: rgba(28, 28, 28, 0.35);
--c-accent: #f5d200;
--c-border: #2e2e2c;
--c-border-light: rgba(28, 28, 28, 0.18);
--f-display: "Barlow", "Noto Sans SC", sans-serif;
--f-heading: "Barlow", "Noto Sans SC", sans-serif;
--f-body: "Barlow", "Noto Sans SC", system-ui, sans-serif;
--f-mono: "IBM Plex Mono", monospace;
--sz-display: 12vw;
--sz-h1: 7.5vw;
--sz-h2: 4.8vw;
--sz-h3: 2.8vw;
--sz-lead: 1.6vw;
--template-bg: #1c1c1c;
--template-bg-alt: #242422;
--template-fg: #f5d200;
--template-accent: #f5d200;
--template-bg-light: #f5d200;
--template-font-display: "Barlow", system-ui, sans-serif;
--template-font-body: "Barlow", system-ui, sans-serif;
--template-font-mono: "IBM Plex Mono", system-ui, sans-serif;
--template-font-cn: "Noto Sans SC", system-ui, sans-serif;
}
```

## Core CSS Grammar
```css
.slide-body{ min-height: 0; }

[data-anim]{ opacity: 0; }

.label{ font-size: var(--sz-label); font-weight: 500; letter-spacing: 0.06em; font-family: var(--f-mono); }

.light .muted{ color: var(--c-fg-light-2); }

.light .accent{ color: var(--c-fg-light); }

.light .bullet-list li::before{ color: var(--c-fg-light); }

.cover-footer{ display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0; padding-top: var(--gap-md); border-top: 1px solid var(--c-fg-3); margin-top: auto; }

.cover-footer-col{ font-family: var(--f-mono); font-size: var(--sz-caption); font-weight: 400; line-height: 1.5; }

.cover-footer-col:last-child{ text-align: right; }

.light .img-placeholder{ background: var(--c-bg-light-alt); color: var(--c-fg-light-3); border: 1px solid var(--c-border-light); }

.slide-chrome, .slide-foot{ display: flex; justify-content: space-between; align-items: center; }

.slide-chrome{ padding-bottom: var(--gap-sm); border-bottom: 1px solid var(--c-border); margin-bottom: var(--gap-md); }

.light .slide-chrome, .light .slide-foot{ border-color: var(--c-border-light); }

.slide--cover .slide-chrome, .slide--cover .slide-foot, .slide--chapter .slide-chrome, .slide--chapter .slide-foot, .slide--quote .slide-chrome, .slide--quote .slide-foot, .slide--statement .slide-chrome, .slide--statement .slide-foot, .slide--end .slide-chrome, .slide--end .slide-foot{ display: none; }

.slide--cover{ display: flex; flex-direction: column; justify-content: space-between; padding: 0; position: relative; }

.cover-img-area{ position: absolute; inset: 0; background: var( --c-bg-alt ); display: flex; align-items: center; justify-content: center; font-family: var(--f-mono); font-size: var(--sz-label); letter-spacing: 0.1em; color: var(--c-fg-3); }

.cover-type{ position: relative; z-index: 1; padding: var(--pad-y) var(--pad-x) 0; flex: 1; display: flex; align-items: flex-start; }

.cover-meta{ position: relative; z-index: 1; padding: var(--gap-md) var(--pad-x) var(--pad-y); display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0; border-top: 1px solid rgba(245, 210, 0, 0.25); }

@keyframes kFadeUp{ from{ opacity: 0; transform: translateY(28px); } to{ opacity: 1; transform: none; } }

@keyframes kFadeIn{ from{ opacity: 0; } to{ opacity: 1; } }

@keyframes kRevealRight{ from{ clip-path: inset(0 100% 0 0); opacity: 1; } to{ clip-path: inset(0 0% 0 0); opacity: 1; } }
```

## Motion And Effects
- CSS reveal vocabulary from source template: fade-up, fade-in, reveal-right, reveal-left, scale-in. In SlideLeaf, map these to data-reveal or CSS selectors under .slide.active; do not add a custom slide activator.
- Reusable keyframe names detected: kFadeUp, kFadeIn, kRevealRight, kRevealLeft, kScaleIn. Keep subtle entrance, rule-reveal, scale-in, glow, or float effects; avoid motion that competes with reading.
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
<section class="slide style-template-studio" data-motion="progressive-reveal" data-visual="comparison-table">
  <div class="slide-content">
    <p class="eyebrow">Studio</p>
    <h1>Studio gives serious arguments a distinctive editorial system</h1>
    <div class="card-grid">
      <article class="card" data-reveal>
        <h3>Visual thesis</h3>
        <p>Black canvas with electric-yellow type; high-voltage design studio aesthetic.</p>
      </article>
      <article class="card" data-reveal>
        <h3>Best use</h3>
        <p>Anything that should feel electric and design-led: studio credentials, creative agency pitches, brand showcases, art-direction reviews, fashion / sneaker brand work.</p>
      </article>
    </div>
  </div>
</section>
```

## QA Checklist
- The generated slide clearly belongs to Studio, not to a generic SlideLeaf default.
- The palette, typography, spacing, and decorative vocabulary remain internally consistent.
- The slide uses SlideLeaf fragment rules: one section.slide root, no script, no style tag, no remote assets.
- Renderer-owned navigation is not duplicated.
- Content density, formality, and tone match the user's brief and audience.
