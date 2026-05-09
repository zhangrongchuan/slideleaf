---
id: template-broadside
category: style-direction
title: Template Style - Broadside
tags: template, beautiful-html-templates, broadside, dark, medium-high, medium, editorial, dramatic, loud, newspaper, graphic, punchy, literary, considered, brand manifesto, founder vision deck, magazine / cultural pitch, design talk, bilingual EN/CN deck, campaign launch, 投资人, 融资, 路演, 创业, 技术, 开发者, 产品, SaaS, 研究, 报告, 学术, 白皮书, 品牌, 创意, 设计, 编辑感, 暗色, 高级, 科技感
motionPreset: progressive-reveal
sourceInfluences: beautiful-html-templates/broadside, Barlow, IBM Plex Mono
---
## When To Use
- Anything that should land like a broadside newspaper headline: brand manifestos, magazine and cultural pitches, design talks, bilingual EN/CN decks, founder vision statements. Also a striking pick for tech, research, or business decks that want a dramatic single-accent editorial feel.
- Use when the requested mood overlaps with: editorial, dramatic, loud, newspaper.
- Use when the occasion is close to: brand manifesto, founder vision deck, magazine / cultural pitch, design talk, bilingual EN/CN deck, campaign launch.
- Good fit for medium-high formality, medium density, and a dark color scheme.

## When Not To Use
- Decks that need to feel quiet, warm, or institutionally traditional — the dark canvas with fire-orange accent commits to drama.
- Do not use when the audience expects a materially different formality level or content density.
- Do not use if the deck needs a conflicting visual language; pick a different template direction instead.

## Good Structure
- Visual thesis: Dark editorial canvas with a single fire orange accent and bilingual Latin/Chinese type stack.
- Palette discipline: bg: #111111; bg_alt: #1a1a18; fg: #f0ece5; accent: #e85d26; border: #282826; muted: #888880; description: near-black newspaper canvas with warm cream text and a single fire-orange headline accent; high typographic contrast, no decorative color
- Typography discipline: display: Barlow; body: Barlow; mono: IBM Plex Mono; cn: Noto Sans SC; style: broadside-newspaper grotesk pairing with technical mono captions and Simplified Chinese support
- Layout grammar: slide--cover, broadside-top-chrome, cover-body, cover-meta, slide--chapter, slide--statement, slide-chrome, statement-body, kicker, slide-body, slide--stats, stats-grid, stat-card, stat-value, stat-label, body, stat-note, slide--quote.
- Slide grammar: slide--cover, orange, slide--chapter, slide--statement, dark, slide--split, slide--stats, slide--fadelist, slide--list, slide--quote, slide--compare, slide--chart, slide--diagram, slide--pie, slide--pyramid, slide--vtimeline.
- Convert the original full-template system into SlideLeaf fragments: one section.slide per file, shared CSS in themes/deck.css, and no project-level navigation code inside slide fragments.
- Extend missing layouts by reusing the same fonts, palette, spacing rhythm, decorative vocabulary, and component grammar.

## CSS Tokens
```css
.style-template-broadside {
--c-bg: #111111;
--c-bg-alt: #1a1a18;
--c-bg-light: #111111;
--c-bg-light-alt: #1a1a18;
--c-bg-orange: #e85d26;
--c-fg: #f0ece5;
--c-fg-2: #888880;
--c-fg-3: #505048;
--c-fg-light: #111111;
--c-fg-light-2: #2a1810;
--c-fg-light-3: rgba(
          17,
          17,
          17,
          0.55
        );
--c-accent: #e85d26;
--c-border: #282826;
--c-border-light: #282826;
--f-display: "Barlow", "Noto Sans SC", sans-serif;
--f-heading: "Barlow", "Noto Sans SC", sans-serif;
--f-body: "Barlow", "Noto Sans SC", system-ui, sans-serif;
--f-mono: "IBM Plex Mono", monospace;
--sz-display: 13vw;
--sz-h1: 7.5vw;
--sz-h2: 4.5vw;
--sz-h3: 2.8vw;
--template-bg: #111111;
--template-bg-alt: #1a1a18;
--template-fg: #f0ece5;
--template-accent: #e85d26;
--template-border: #282826;
--template-muted: #888880;
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

.body{ font-family: var(--f-body); font-size: var(--sz-body); font-weight: 400; line-height: 1.6; }

.label{ font-family: var(--f-mono); font-size: var(--sz-label); font-weight: 500; letter-spacing: 0.14em; text-transform: uppercase; }

.dark .muted{ color: var(--c-fg-2); }

.orange .muted{ color: var(--c-fg-light-2); }

.orange .display, .orange .h1, .orange .h2, .orange .h3{ color: #111111; }

.orange .lead, .orange .body{ color: rgba(17, 17, 17, 0.75); }

.orange .label{ color: rgba(17, 17, 17, 0.55); }

.orange .accent{ color: #111111; }

.slide-chrome, .slide-foot{ display: flex; justify-content: space-between; align-items: center; }

.slide-chrome{ padding-bottom: var(--gap-sm); border-bottom: 1px solid var(--c-border); margin-bottom: var(--gap-md); }

.orange .slide-chrome, .orange .slide-foot{ border-color: rgba(17, 17, 17, 0.2); }

.slide--cover .slide-chrome, .slide--cover .slide-foot, .slide--chapter .slide-chrome, .slide--chapter .slide-foot, .slide--quote .slide-chrome, .slide--quote .slide-foot, .slide--end .slide-chrome, .slide--end .slide-foot{ display: none; }

.slide--cover{ display: flex; flex-direction: column; justify-content: flex-end; }

.cover-body{ display: flex; flex-direction: column; flex: 1; justify-content: flex-end; gap: var(--gap-md); }

.cover-meta{ display: flex; justify-content: space-between; align-items: flex-end; margin-top: var(--gap-lg); padding-top: var(--gap-sm); border-top: 1px solid rgba(17, 17, 17, 0.2); }

.slide--chapter{ display: flex; flex-direction: column; justify-content: center; gap: 0; }

@keyframes kFadeUp{ from{ opacity: 0; transform: translateY(28px); } to{ opacity: 1; transform: none; } }

@keyframes kFadeIn{ from{ opacity: 0; } to{ opacity: 1; } }

@keyframes kRevealRight{ from{ clip-path: inset(0 100% 0 0); opacity: 1; } to{ clip-path: inset(0 0% 0 0); opacity: 1; } }
```

## Motion And Effects
- CSS reveal vocabulary from source template: fade-up, fade-in, reveal-right, reveal-left, scale-in. In SlideLeaf, map these to data-reveal or CSS selectors under .slide.active; do not add a custom slide activator.
- Reusable keyframe names detected: kFadeUp, kFadeIn, kRevealRight, kRevealLeft, kScaleIn. Keep subtle entrance, rule-reveal, scale-in, glow, or float effects; avoid motion that competes with reading.
- Decorative effect classes worth preserving as CSS-only motifs: rule.
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
<section class="slide style-template-broadside" data-motion="progressive-reveal" data-visual="comparison-table">
  <div class="slide-content">
    <p class="eyebrow">Broadside</p>
    <h1>Broadside gives serious arguments a distinctive editorial system</h1>
    <div class="card-grid">
      <article class="card" data-reveal>
        <h3>Visual thesis</h3>
        <p>Dark editorial canvas with a single fire orange accent and bilingual Latin/Chinese type stack.</p>
      </article>
      <article class="card" data-reveal>
        <h3>Best use</h3>
        <p>Anything that should land like a broadside newspaper headline: brand manifestos, magazine and cultural pitches, design talks, bilingual EN/CN decks, founder vision statements.</p>
      </article>
    </div>
  </div>
</section>
```

## QA Checklist
- The generated slide clearly belongs to Broadside, not to a generic SlideLeaf default.
- The palette, typography, spacing, and decorative vocabulary remain internally consistent.
- The slide uses SlideLeaf fragment rules: one section.slide root, no script, no style tag, no remote assets.
- Renderer-owned navigation is not duplicated.
- Content density, formality, and tone match the user's brief and audience.
