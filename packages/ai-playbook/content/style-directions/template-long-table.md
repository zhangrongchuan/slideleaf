---
id: template-long-table
category: style-direction
title: Template Style - Long Table
tags: template, beautiful-html-templates, long-table, light, medium, warm, intimate, modern, friendly, small-batch, social, hospitality, playful, considered, magazine-friendly, modern-editorial, supper club or dinner series, event or community gathering, small hospitality / restaurant brand, creative studio open house, membership or subscription pitch, wine or food brand catalogue, modern lifestyle brand, 投资人, 融资, 路演, 创业, 品牌, 创意, 设计, 编辑感, 温暖, 活泼, 社区, 工作坊, 暗色, 高级, 科技感
motionPreset: progressive-reveal
sourceInfluences: beautiful-html-templates/long-table, Bricolage Grotesque, Fraunces (italic + roman)
---
## When To Use
- Anything that should feel like a warm, intimate, modern hospitality / community brand: supper clubs, dinner series, small restaurants, creative-studio events, membership pitches, lifestyle and wine brands. Equally good for any deck wanting a single warm accent colour, italic-meets-bold typography, and a social-media-aware modern-editorial voice.
- Use when the requested mood overlaps with: warm, intimate, modern, friendly, small-batch, social, hospitality.
- Use when the occasion is close to: supper club or dinner series, event or community gathering, small hospitality / restaurant brand, creative studio open house, membership or subscription pitch, wine or food brand catalogue, modern lifestyle brand.
- Good fit for medium formality, medium density, and a light color scheme.

## When Not To Use
- Decks that need corporate polish, technical density, or a cold / minimalist register — the rust-red palette and bold-italic mix are intentionally warm and people-facing.
- Do not use when the audience expects a materially different formality level or content density.
- Do not use if the deck needs a conflicting visual language; pick a different template direction instead.

## Good Structure
- Visual thesis: Warm cream and rust-red supper-club aesthetic with bold uppercase grotesk headlines, italic Fraunces, and pill-shaped outlined buttons.
- Palette discipline: paper: #FAF1E2; ink: #B53D2A; ink-deep: #8E2D1F; description: warm buttery-cream paper with one strict rust-red / terracotta ink used for type, pill borders, and outlined info cards — strictly bichromatic, very social-media friendly
- Typography discipline: display: Bricolage Grotesque; body: Fraunces (italic + roman); style: bold uppercase Bricolage Grotesque for hero / chapter titles paired with Fraunces italic for body, captions, button labels, and tagline — a contemporary mix-and-match modern editorial pairing
- Layout grammar: stage, s-cover, grid, stats, body-it, rect-tag, tagline, who-tag, lab-tag, card, card-top, num-tag, city-tag, seats-tag, date-tag, s-featured, stats-line, kicker.
- Slide grammar: s-cover, active, s-manifesto, s-index, s-featured, s-menu, s-quote, s-cal, s-closing.
- Convert the original full-template system into SlideLeaf fragments: one section.slide per file, shared CSS in themes/deck.css, and no project-level navigation code inside slide fragments.
- Extend missing layouts by reusing the same fonts, palette, spacing rhythm, decorative vocabulary, and component grammar.

## CSS Tokens
```css
.style-template-long-table {
--paper: #FAF1E2;
--paper-d: #F2E5CF;
--paper-vd: #E8D7B6;
--ink: #B53D2A;
--ink-dp: #8E2D1F;
--rule: #B53D2A;
--template-paper: #FAF1E2;
--template-ink: #B53D2A;
--template-ink-deep: #8E2D1F;
--template-font-display: "Bricolage Grotesque", system-ui, sans-serif;
--template-font-body: "Fraunces (italic + roman)", system-ui, sans-serif;
}
```

## Core CSS Grammar
```css
.stage{ position: relative; width: 100vw; height: 100vh; overflow: hidden; background: var(--paper); }

.stage::before{ content: ''; position: absolute; inset: 0; pointer-events: none; opacity: 0.10; background-image: radial-gradient(circle at 1px 1px, rgba(181, 61, 42, 0.5) 0.5px, transparent 1px); background-size: 4px 4px; z-index: 1; }

.body-it{ font-family: 'Fraunces', Georgia, serif; font-style: italic; font-weight: 400; line-height: 1.45; color: var(--ink); }

.rect-tag{ display: inline-flex; align-items: center; padding: clamp(7px, 0.9vh, 12px) clamp(14px, 1.4vw, 22px); border: 1.5px solid var(--ink); font-family: 'Fraunces', Georgia, serif; font-style: italic; font-size: clamp(15px, 1.1vw, 20px); color: var(--ink); line-height: 1.1; }

.s-cover{ background: var(--paper); }

.s-cover .grid{ position: absolute; inset: clamp(60px, 6vh, 100px) clamp(60px, 5vw, 110px) clamp(110px, 11vh, 170px); display: grid; grid-template-columns: 1.05fr 1fr; gap: clamp(40px, 4vw, 80px); z-index: 5; }

.s-cover .left{ display: flex; flex-direction: column; gap: clamp(18px, 2vh, 30px); }

.s-cover .ed-row{ display: flex; align-items: center; gap: clamp(12px, 1.2vw, 18px); }

.s-cover .ed-row .ed-label{ font-family: 'Fraunces', Georgia, serif; font-style: italic; font-size: clamp(20px, 1.6vw, 30px); color: var(--ink); line-height: 1; }

.s-cover .title{ font-family: 'Bricolage Grotesque', sans-serif; font-weight: 800; text-transform: uppercase; font-size: clamp(82px, min(8.8vw, 15vh), 180px); line-height: 0.92; letter-spacing: -0.012em; color: var(--ink); }

.s-cover .actions{ display: flex; gap: clamp(8px, 0.8vw, 14px); align-items: center; flex-wrap: wrap; }

.s-cover .stats{ font-family: 'Fraunces', Georgia, serif; font-style: italic; font-size: clamp(17px, 1.2vw, 22px); line-height: 1.4; color: var(--ink); }

.s-cover .stats .num{ font-style: normal; font-weight: 600; }

.s-cover .left .bottom-block{ margin-top: auto; display: flex; flex-direction: column; gap: clamp(12px, 1.4vh, 22px); align-items: flex-start; }

.s-cover .tagline{ font-family: 'Fraunces', Georgia, serif; font-style: italic; font-size: clamp(18px, 1.4vw, 26px); line-height: 1.35; color: var(--ink); max-width: 40ch; }

.s-cover .right{ display: flex; flex-direction: column; justify-content: center; align-items: flex-end; color: var(--ink); text-align: right; }

.s-cover .big-edition{ font-family: 'Fraunces', Georgia, serif; font-style: italic; font-weight: 400; font-size: clamp(180px, min(22vw, 38vh), 480px); line-height: 0.86; letter-spacing: -0.02em; color: var(--ink); }

.s-cover .big-edition-lab{ margin-top: clamp(8px, 1vh, 16px); font-family: 'Bricolage Grotesque', sans-serif; font-weight: 700; text-transform: uppercase; font-size: clamp(15px, 1.1vw, 18px); letter-spacing: 0.18em; color: var(--ink); }
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
- product-demo-flow
- roadmap
- architecture-diagram
- poster-hero
- quote-focus
- moodboard-grid

## Example Markup
```html
<section class="slide style-template-long-table" data-motion="progressive-reveal" data-visual="comparison-table">
  <div class="slide-content">
    <p class="eyebrow">Long Table</p>
    <h1>Long Table turns the deck into a recognizable design object</h1>
    <div class="card-grid">
      <article class="card" data-reveal>
        <h3>Visual thesis</h3>
        <p>Warm cream and rust-red supper-club aesthetic with bold uppercase grotesk headlines, italic Fraunces, and pill-shaped outlined buttons.</p>
      </article>
      <article class="card" data-reveal>
        <h3>Best use</h3>
        <p>Anything that should feel like a warm, intimate, modern hospitality / community brand: supper clubs, dinner series, small restaurants, creative-studio events, membership pitches, lifestyle and wine brands.</p>
      </article>
    </div>
  </div>
</section>
```

## QA Checklist
- The generated slide clearly belongs to Long Table, not to a generic SlideLeaf default.
- The palette, typography, spacing, and decorative vocabulary remain internally consistent.
- The slide uses SlideLeaf fragment rules: one section.slide root, no script, no style tag, no remote assets.
- Renderer-owned navigation is not duplicated.
- Content density, formality, and tone match the user's brief and audience.
