---
id: template-pink-script
category: style-direction
title: Template Style - Pink Script — After Hours
tags: template, beautiful-html-templates, pink-script, dark, medium-high, low, nocturnal, moody, intentional, luxe, expressive, literary, sultry, considered, magazine, fashion brand deck, creator personal brand, after-hours product (nightlife / dating / spirits), luxury launch, editorial feature, 投资人, 融资, 路演, 创业, 技术, 开发者, 产品, SaaS, 研究, 报告, 学术, 白皮书, 品牌, 创意, 设计, 编辑感, 暗色, 高级, 科技感
motionPreset: progressive-reveal
sourceInfluences: beautiful-html-templates/pink-script, Instrument Serif, Inter, JetBrains Mono
---
## When To Use
- Anything that should feel nocturnal, intentional, and a little luxe: fashion brand decks, creator personal brands, after-hours / nightlife / spirits launches, luxury product reveals, editorial features. Also a striking unexpected pick for a tech keynote, research synthesis, or business pitch that wants to land with magnetic confidence.
- Use when the requested mood overlaps with: nocturnal, moody, intentional, luxe, expressive.
- Use when the occasion is close to: fashion brand deck, creator personal brand, after-hours product (nightlife / dating / spirits), luxury launch, editorial feature.
- Good fit for medium-high formality, low density, and a dark color scheme.

## When Not To Use
- Daytime corporate-professional and traditional B2B contexts where the dark canvas with hot-pink accent reads as too styled or too expressive.
- Do not use when the audience expects a materially different formality level or content density.
- Do not use if the deck needs a conflicting visual language; pick a different template direction instead.

## Good Structure
- Visual thesis: Black canvas, hot pink accent, pearl-cream paper, Instrument Serif headlines: late-night editorial luxury.
- Palette discipline: ink: #060507; paper: #F5EDF1; pink: #ED3D8C; pink_2: #FF66A8; pink_deep: #B81D67; description: near-black canvas with one saturated hot pink accent and a pearl-cream paper for content; the whole system runs on a single accent + restraint
- Typography discipline: display: Instrument Serif; body: Inter; mono: JetBrains Mono; style: sharp transitional serif headlines + clean sans body + technical mono labels
- Layout grammar: s-cover, stage, s-toc, body, s-stats, kicker, stat, timeline, table, s-quote.
- Slide grammar: s-cover, s-toc, s-stats, s-section, s-chart, s-process, s-matrix, s-quote, s-cta.
- Convert the original full-template system into SlideLeaf fragments: one section.slide per file, shared CSS in themes/deck.css, and no project-level navigation code inside slide fragments.
- Extend missing layouts by reusing the same fonts, palette, spacing rhythm, decorative vocabulary, and component grammar.

## CSS Tokens
```css
.style-template-pink-script {
--ink: #060507;
--ink-2: #0F0D11;
--paper: #F5EDF1;
--pink: #ED3D8C;
--pink-2: #FF66A8;
--pink-deep: #B81D67;
--line: rgba(237,61,140,.32);
--mute: rgba(245,237,241,.55);
--hair: rgba(245,237,241,.14);
--template-ink: #060507;
--template-paper: #F5EDF1;
--template-pink: #ED3D8C;
--template-pink-2: #FF66A8;
--template-pink-deep: #B81D67;
--template-font-display: "Instrument Serif", system-ui, sans-serif;
--template-font-body: "Inter", system-ui, sans-serif;
--template-font-mono: "JetBrains Mono", system-ui, sans-serif;
}
```

## Core CSS Grammar
```css
.rule{ height: 1px; background: var(--pink); opacity: .45; }

.rule.thin{ opacity: .25; background: var(--paper); }

.s-cover .stage{ position: absolute; left: 60px; right: 60px; top: 180px; bottom: 360px; display: flex; align-items: center; justify-content: center; flex-direction: column; gap: 20px; }

.s-cover .pre{ font-family: "JetBrains Mono", monospace; font-size: 28px; letter-spacing: .42em; text-transform: uppercase; color: var(--paper); opacity: .75; }

.s-cover .title-wrap{ position: relative; }

.s-cover .title{ font-family: "Instrument Serif", serif; font-style: italic; color: var(--pink); font-size: 280px; line-height: 1.02; letter-spacing: -.015em; text-align: center; text-shadow: 0 0 80px rgba(237, 61, 140, .18); padding-bottom: .12em; }

.s-cover .title .l2{ display: block; padding-left: 180px; color: var(--paper); }

.s-cover .sub{ font-family: "Inter", sans-serif; font-weight: 300; font-size: 28px; letter-spacing: .12em; text-transform: uppercase; color: var(--paper); opacity: .85; margin-top: 28px; }

.s-cover .sub em{ color: var(--pink); font-style: normal; }

.s-cover .lower{ position: absolute; left: 60px; right: 60px; bottom: 160px; display: flex; justify-content: space-between; align-items: end; gap: 32px; }

.s-cover .lower .col{ display: flex; flex-direction: column; gap: 6px; }

.s-cover .lower .lab{ font-family: "JetBrains Mono", monospace; font-size: 22px; letter-spacing: .14em; text-transform: uppercase; color: var(--mute); }

.s-cover .lower .val{ font-family: "Instrument Serif", serif; font-style: italic; font-size: 48px; color: var(--pink); line-height: 1.05; }

.s-cover .lower .val.alt{ color: var(--paper); }

.s-toc .body{ position: absolute; inset: 140px 60px 140px 60px; display: grid; grid-template-columns: 480px 1fr; gap: 80px; }

.s-toc h1{ font-family: "Instrument Serif", serif; font-style: italic; font-size: 220px; line-height: 1.04; color: var(--pink); padding-bottom: .12em; }

.s-toc h1 .small{ display: block; font-size: 80px; color: var(--paper); margin-top: 16px; opacity: .8; }

.s-toc .rows{ display: flex; flex-direction: column; }
```

## Motion And Effects
- Prefer CSS-only motion for this template: data-reveal, opacity/transform entrance, subtle rule draw, card cascade, and reduced-motion fallback.
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
<section class="slide style-template-pink-script" data-motion="progressive-reveal" data-visual="comparison-table">
  <div class="slide-content">
    <p class="eyebrow">Pink Script — After Hours</p>
    <h1>Pink Script — After Hours gives serious arguments a distinctive editorial system</h1>
    <div class="card-grid">
      <article class="card" data-reveal>
        <h3>Visual thesis</h3>
        <p>Black canvas, hot pink accent, pearl-cream paper, Instrument Serif headlines: late-night editorial luxury.</p>
      </article>
      <article class="card" data-reveal>
        <h3>Best use</h3>
        <p>Anything that should feel nocturnal, intentional, and a little luxe: fashion brand decks, creator personal brands, after-hours / nightlife / spirits launches, luxury product reveals, editorial features.</p>
      </article>
    </div>
  </div>
</section>
```

## QA Checklist
- The generated slide clearly belongs to Pink Script — After Hours, not to a generic SlideLeaf default.
- The palette, typography, spacing, and decorative vocabulary remain internally consistent.
- The slide uses SlideLeaf fragment rules: one section.slide root, no script, no style tag, no remote assets.
- Renderer-owned navigation is not duplicated.
- Content density, formality, and tone match the user's brief and audience.
