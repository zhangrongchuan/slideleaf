---
id: template-editorial-tri-tone
category: style-direction
title: Template Style - Editorial Tri-Tone
tags: template, beautiful-html-templates, editorial-tri-tone, mixed, medium-high, medium, editorial, warm, intentional, moody, literary, considered, stylish, editorial / magazine pitch, fashion brand deck, lifestyle media, literary / cultural, art direction review, 投资人, 融资, 路演, 创业, 技术, 开发者, 产品, SaaS, 研究, 报告, 学术, 白皮书, 品牌, 创意, 设计, 编辑感, 温暖, 活泼, 社区, 工作坊
motionPreset: progressive-reveal
sourceInfluences: beautiful-html-templates/editorial-tri-tone, Bricolage Grotesque, JetBrains Mono
---
## When To Use
- Anything that should feel like a fashion-magazine spread: editorial pitches, fashion brand decks, lifestyle media, art direction reviews. Equally good for any deck — including tech, research, or business — that wants tri-tone discipline and serif/sans contrast instead of the usual neutrals.
- Use when the requested mood overlaps with: editorial, warm, intentional, moody.
- Use when the occasion is close to: editorial / magazine pitch, fashion brand deck, lifestyle media, literary / cultural, art direction review.
- Good fit for medium-high formality, medium density, and a mixed color scheme.

## When Not To Use
- Decks that need to read as soft or comforting — the burgundy/pink/cream tri-tone is intentionally high-contrast and styled.
- Do not use when the audience expects a materially different formality level or content density.
- Do not use if the deck needs a conflicting visual language; pick a different template direction instead.

## Good Structure
- Visual thesis: Three-color editorial system: dusty pink, mustard cream, and deep burgundy, set in Bricolage + Instrument Serif.
- Palette discipline: pink: #F2B6C6; cream_yellow: #F2D86A; burgundy: #7A1F35; description: dusty pink, mustard cream, and deep burgundy used as full-bleed color blocks; very high contrast tri-tone with no fourth color
- Typography discipline: display: Bricolage Grotesque; serif: Instrument Serif; mono: JetBrains Mono; style: expressive variable grotesk + literary serif + technical mono; magazine-page typographic system
- Layout grammar: s-cover, chapter, s-grid, grid, card, s-stat, kicker, s-timeline, s-quote.
- Slide grammar: s-cover, s-manifesto, s-grid, s-stat, s-timeline, s-chart, s-quote, s-closer.
- Convert the original full-template system into SlideLeaf fragments: one section.slide per file, shared CSS in themes/deck.css, and no project-level navigation code inside slide fragments.
- Extend missing layouts by reusing the same fonts, palette, spacing rhythm, decorative vocabulary, and component grammar.

## CSS Tokens
```css
.style-template-editorial-tri-tone {
--pink: #F2B6C6;
--pink-deep: #F2B6C6;
--cream: #F2D86A;
--navy: #7A1F35;
--forest: #7A1F35;
--burgundy: #7A1F35;
--lime: #F2D86A;
--sky: #F2B6C6;
--terracotta: #F2D86A;
--butter: #F2D86A;
--ink: #7A1F35;
--template-pink: #F2B6C6;
--template-cream-yellow: #F2D86A;
--template-burgundy: #7A1F35;
--template-font-display: "Bricolage Grotesque", system-ui, sans-serif;
--template-font-serif: "Instrument Serif", system-ui, sans-serif;
--template-font-mono: "JetBrains Mono", system-ui, sans-serif;
}
```

## Core CSS Grammar
```css
.label{ font-family:"JetBrains Mono", monospace; font-size:24px; letter-spacing: 0.15em; text-transform: uppercase; }

.s-cover{ background: var(--pink); color: var(--ink); }

.s-cover .pill-cluster{ position:absolute; top:120px; left:64px; right:64px; display:flex; flex-wrap:wrap; gap: 22px; max-width: 1500px; }

.s-cover .pill-cluster .pill{ font-size: 44px; padding: 16px 38px; }

.s-cover .wordmark{ position:absolute; left:64px; right:64px; bottom:80px; font-family:"Bricolage Grotesque", sans-serif; font-weight:800; font-size: 300px; line-height: 0.82; letter-spacing:-0.04em; color: var(--burgundy); display:flex; align-items:flex-end; flex-wrap:nowrap; }

.s-cover .wordmark .amp{ font-family:"Instrument Serif", serif; font-style:italic; font-weight:400; font-stretch:normal; }

.s-cover .meta{ position:absolute; top:64px; left:64px; right:64px; display:flex; justify-content:space-between; font-family:"JetBrains Mono", monospace; font-size:24px; letter-spacing:0.15em; text-transform:uppercase; }

.s-manifesto{ background: var(--cream); color: var(--ink); display:grid; grid-template-columns: 1fr 1fr; }

.s-manifesto .left{ padding: 96px 64px; display:flex; flex-direction:column; justify-content:space-between; }

.s-manifesto .right{ background: var(--forest); color: var(--cream); padding: 96px 80px; display:flex; flex-direction:column; justify-content:space-between; position:relative; }

.s-manifesto .chapter{ font-family:"Instrument Serif", serif; font-style:italic; font-size: 240px; line-height:0.9; color: var(--burgundy); }

.s-manifesto .chapter sup{ font-size: 0.35em; vertical-align: super; opacity:0.6; }

.s-manifesto .lede{ font-family:"Bricolage Grotesque", sans-serif; font-size: 56px; line-height:1.05; font-weight:500; letter-spacing:-0.02em; max-width: 720px; }

.s-manifesto .lede em{ font-family:"Instrument Serif", serif; font-style:italic; font-weight:400; color:var(--terracotta); }

.s-manifesto .right h3{ font-family:"JetBrains Mono", monospace; font-size: 24px; letter-spacing:0.18em; text-transform:uppercase; margin: 0 0 32px; color: var(--butter); font-weight:500; }

.s-manifesto .right p{ font-size: 28px; line-height:1.45; max-width:540px; margin:0 0 24px; }

.s-manifesto .right .signature{ font-family:"Instrument Serif", serif; font-style:italic; font-size: 64px; line-height:1; color: var(--lime); }

.s-grid{ background: var(--pink); padding: 72px 64px 80px; }
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
<section class="slide style-template-editorial-tri-tone" data-motion="progressive-reveal" data-visual="comparison-table">
  <div class="slide-content">
    <p class="eyebrow">Editorial Tri-Tone</p>
    <h1>Editorial Tri-Tone gives serious arguments a distinctive editorial system</h1>
    <div class="card-grid">
      <article class="card" data-reveal>
        <h3>Visual thesis</h3>
        <p>Three-color editorial system: dusty pink, mustard cream, and deep burgundy, set in Bricolage + Instrument Serif.</p>
      </article>
      <article class="card" data-reveal>
        <h3>Best use</h3>
        <p>Anything that should feel like a fashion-magazine spread: editorial pitches, fashion brand decks, lifestyle media, art direction reviews.</p>
      </article>
    </div>
  </div>
</section>
```

## QA Checklist
- The generated slide clearly belongs to Editorial Tri-Tone, not to a generic SlideLeaf default.
- The palette, typography, spacing, and decorative vocabulary remain internally consistent.
- The slide uses SlideLeaf fragment rules: one section.slide root, no script, no style tag, no remote assets.
- Renderer-owned navigation is not duplicated.
- Content density, formality, and tone match the user's brief and audience.
