---
id: template-peoples-platform
category: style-direction
title: Template Style - People's Platform (Block & Bold)
tags: template, beautiful-html-templates, peoples-platform, light, medium-low, medium-high, activist, loud, graphic, honest, punchy, direct, expressive, warm-bold, cultural commentary, manifesto, community / civic deck, design talk, campaign pitch, founder vision, 投资人, 融资, 路演, 创业, 品牌, 创意, 设计, 编辑感, 温暖, 活泼, 社区, 工作坊
motionPreset: progressive-reveal
sourceInfluences: beautiful-html-templates/peoples-platform, Alfa Slab One, DM Mono
---
## When To Use
- Anything that should feel honest, loud, and graphic: cultural commentary, manifestos, civic and community decks, design talks, campaign pitches. Excellent for founder-vision moments, mission statements, or any deck — including across industries — that wants protest-poster energy instead of corporate polish.
- Use when the requested mood overlaps with: activist, loud, graphic, honest.
- Use when the occasion is close to: cultural commentary, manifesto, community / civic deck, design talk, campaign pitch, founder vision.
- Good fit for medium-low formality, medium-high density, and a light color scheme.

## When Not To Use
- Contexts where institutional restraint is the actual goal — the saturated political-poster palette commits hard to expressive energy.
- Do not use when the audience expects a materially different formality level or content density.
- Do not use if the deck needs a conflicting visual language; pick a different template direction instead.

## Good Structure
- Visual thesis: Activist poster energy: blue, orange, red on cream, with Alfa Slab + Caveat Brush.
- Palette discipline: blue: #2C2CDC; orange: #F2A03A; red: #E83A2A; cream: #F4E9D6; ink: #0E0E14; description: saturated political-poster palette: cobalt blue, signal orange, warning red, on warm cream with deep ink
- Typography discipline: display: Alfa Slab One; secondary: Archivo Narrow; script: Caveat Brush; mono: DM Mono; style: heavy slab display + narrow grotesk + brush script + mono; protest-poster typographic stack
- Layout grammar: s-cover, s-toc, body, kicker, grid, tag, s-stat, stat, s-quote, quote, s-timeline, s-compare.
- Slide grammar: s-cover, grain, s-toc, s-manifesto, s-pillars, s-stat, s-platform, s-quote, s-timeline, s-compare, s-close.
- Convert the original full-template system into SlideLeaf fragments: one section.slide per file, shared CSS in themes/deck.css, and no project-level navigation code inside slide fragments.
- Extend missing layouts by reusing the same fonts, palette, spacing rhythm, decorative vocabulary, and component grammar.

## CSS Tokens
```css
.style-template-peoples-platform {
--blue: #2C2CDC;
--blue-deep: #1B1BB0;
--orange: #F2A03A;
--orange-deep: #E89321;
--red: #E83A2A;
--red-deep: #B7281C;
--cream: #F4E9D6;
--paper: #F5F2EA;
--ink: #0E0E14;
--template-blue: #2C2CDC;
--template-orange: #F2A03A;
--template-red: #E83A2A;
--template-cream: #F4E9D6;
--template-ink: #0E0E14;
--template-font-display: "Alfa Slab One", system-ui, sans-serif;
--template-font-secondary: "Archivo Narrow", system-ui, sans-serif;
--template-font-script: "Caveat Brush", system-ui, sans-serif;
--template-font-mono: "DM Mono", system-ui, sans-serif;
}
```

## Core CSS Grammar
```css
.stamp-orange{ color:var(--orange); text-shadow: 6px 6px 0 var(--red), 12px 12px 0 var(--red-deep); }

.stamp-blue{ color:var(--blue); text-shadow: 6px 6px 0 var(--red); }

.stamp-cream{ color:var(--cream); text-shadow: 6px 6px 0 var(--red); }

.grain::before{ content:""; position:absolute; inset:0; pointer-events:none; background-image: radial-gradient(rgba(0, 0, 0, .06) 1px, transparent 1px), radial-gradient(rgba(255, 255, 255, .05) 1px, transparent 1px); background-size: 3px 3px, 5px 5px; background-position: 0 0, 1px 2px; mix-blend-mode:multiply; opacity:.5; }

.s-cover{ background:var(--blue); color:var(--cream); }

.s-cover .frame{ position:absolute; inset:48px; border:6px solid var(--cream); }

.s-cover .meta-top{ position:absolute; top:90px; left:90px; right:90px; display:flex; justify-content:space-between; align-items:center; font-family:'DM Mono', monospace; font-size:24px; letter-spacing:.18em; color:var(--cream); }

.s-cover .meta-top .pill{ border:3px solid var(--cream); padding:8px 20px; border-radius:999px; }

.s-cover .center{ position:absolute; left:0; right:0; top:340px; display:flex; flex-direction:column; align-items:center; }

.s-cover .title{ font-family:'Alfa Slab One', serif; font-size:240px; line-height:.86; color:var(--orange); text-shadow: 10px 10px 0 var(--red), 20px 20px 0 var(--red-deep); }

.s-cover .row2{ display:flex; align-items:center; gap:34px; margin-top:46px; }

.s-cover .for{ font-family:'Caveat Brush', cursive; font-size:96px; color:var(--cream); transform:rotate(-5deg); }

.s-cover .sub{ font-family:'Alfa Slab One', serif; font-size:72px; color:var(--cream); letter-spacing:.01em; text-transform:uppercase; }

.s-cover .footline{ position:absolute; bottom:140px; left:0; right:0; display:flex; justify-content:center; gap:32px; align-items:center; font-family:'DM Mono', monospace; font-size:26px; letter-spacing:.22em; color:var(--cream); }

.s-toc{ background:var(--paper); }

.s-toc .head{ padding:80px 90px 30px; display:flex; justify-content:space-between; align-items:flex-end; border-bottom:6px solid var(--ink); }

.s-toc .head h2{ margin:0; font-family:'Alfa Slab One', serif; font-size:140px; line-height:.88; color:var(--blue); text-shadow:6px 6px 0 var(--red); text-transform:uppercase; }

.s-toc .head .meta{ font-family:'DM Mono', monospace; text-align:right; font-size:24px; letter-spacing:.16em; color:var(--ink); }
```

## Motion And Effects
- Decorative effect classes worth preserving as CSS-only motifs: grain, stamp.
- Forbidden JS from source template: slide navigation, keyboard handlers, deck transform, page counters, progress bars, active class toggles, custom elements that own the deck stage.
- If runtime/deck.js is needed, use it only as a non-navigation extension and listen to the renderer's slideleaf:slidechange event.

## Anti Patterns
- Mixing this template with another template family in the same deck.
- Recoloring the palette or replacing the type system because it feels convenient.
- Removing signature decoration, chrome, texture, mono labels, or page furniture that carries the template identity.
- Copying the source template's deck navigation, keyboard handler, or slide-stage runtime into SlideLeaf; the renderer owns navigation.
- Turning the style into generic cards, centered bullets, purple gradients, or glassmorphism.

## Evidence Requirements
- Match density to evidence: medium-high density means proof blocks should be balanced, with enough supporting detail to avoid empty cards.
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
<section class="slide style-template-peoples-platform" data-motion="progressive-reveal" data-visual="comparison-table">
  <div class="slide-content">
    <p class="eyebrow">People's Platform (Block & Bold)</p>
    <h1>People's Platform (Block &amp; Bold) turns the deck into a recognizable design object</h1>
    <div class="card-grid">
      <article class="card" data-reveal>
        <h3>Visual thesis</h3>
        <p>Activist poster energy: blue, orange, red on cream, with Alfa Slab + Caveat Brush.</p>
      </article>
      <article class="card" data-reveal>
        <h3>Best use</h3>
        <p>Anything that should feel honest, loud, and graphic: cultural commentary, manifestos, civic and community decks, design talks, campaign pitches.</p>
      </article>
    </div>
  </div>
</section>
```

## QA Checklist
- The generated slide clearly belongs to People's Platform (Block & Bold), not to a generic SlideLeaf default.
- The palette, typography, spacing, and decorative vocabulary remain internally consistent.
- The slide uses SlideLeaf fragment rules: one section.slide root, no script, no style tag, no remote assets.
- Renderer-owned navigation is not duplicated.
- Content density, formality, and tone match the user's brief and audience.
