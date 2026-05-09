---
id: template-biennale-yellow
category: style-direction
title: Template Style - Biennale Yellow
tags: template, beautiful-html-templates, biennale-yellow, light, high, medium, editorial, atmospheric, warm, cultural-institution, poster-like, literary, considered, contemplative, warm-modern, Dutch-editorial, exhibition or biennale, arts institution programme, design or typography conference, literary or curatorial publication, studio annual report, museum season announcement, 投资人, 融资, 路演, 创业, 研究, 报告, 学术, 白皮书, 品牌, 创意, 设计, 编辑感, 温暖, 活泼, 社区, 工作坊, 暗色, 高级, 科技感
motionPreset: progressive-reveal
sourceInfluences: beautiful-html-templates/biennale-yellow, Instrument Serif, Archivo, JetBrains Mono
---
## When To Use
- Anything that should feel like an art-biennale poster or a museum's annual programme: exhibition decks, arts-institution announcements, design conference brochures, curatorial pitches, literary publications, studio retrospectives. Equally good for any deck wanting Dutch-editorial atmosphere with an unmistakable single-color signature.
- Use when the requested mood overlaps with: editorial, atmospheric, warm, cultural-institution, poster-like.
- Use when the occasion is close to: exhibition or biennale, arts institution programme, design or typography conference, literary or curatorial publication, studio annual report, museum season announcement.
- Good fit for high formality, medium density, and a light color scheme.

## When Not To Use
- Decks that need visual punch or saturated multi-color energy — the warm-paper canvas and one-yellow palette are intentionally quiet and atmospheric.
- Do not use when the audience expects a materially different formality level or content density.
- Do not use if the deck needs a conflicting visual language; pick a different template direction instead.

## Good Structure
- Visual thesis: Solar yellow on warm parchment with deep indigo serif and atmospheric sun-glow gradients.
- Palette discipline: paper: #E9E5DB; ink: #1B2566; sun: #F1EE2E; ember: #E26B4A; haze: #F0DA7C; description: warm parchment ground with a signature solar-yellow accent, deep indigo navy ink, and a soft peach/ember edge that bleeds out of corner gradients
- Typography discipline: display: Instrument Serif; body: Archivo; mono: JetBrains Mono; style: transitional Didone-flavored display serif paired with a clean grotesk sans for micro-typography and a mono for tabular data
- Layout grammar: stage, s-cover, date-rail, ftag, quote, kicker, s-chapter, vrail, stat, s-quote, qkicker, qbody, ktag.
- Slide grammar: s-cover, active, s-manifesto, s-programme, s-chapter, s-data, s-quote, s-cal, s-colophon.
- Convert the original full-template system into SlideLeaf fragments: one section.slide per file, shared CSS in themes/deck.css, and no project-level navigation code inside slide fragments.
- Extend missing layouts by reusing the same fonts, palette, spacing rhythm, decorative vocabulary, and component grammar.

## CSS Tokens
```css
.style-template-biennale-yellow {
--paper: #E9E5DB;
--paper-deep: #DCD6C4;
--sun: #F1EE2E;
--sun-soft: #F8F39B;
--ink: #1B2566;
--ember: #E26B4A;
--haze: #F0DA7C;
--line: #1B2566;
--template-paper: #E9E5DB;
--template-ink: #1B2566;
--template-sun: #F1EE2E;
--template-ember: #E26B4A;
--template-haze: #F0DA7C;
--template-font-display: "Instrument Serif", system-ui, sans-serif;
--template-font-body: "Archivo", system-ui, sans-serif;
--template-font-mono: "JetBrains Mono", system-ui, sans-serif;
}
```

## Core CSS Grammar
```css
.stage{ position: relative; width: 100vw; height: 100vh; overflow: hidden; background: var(--paper); }

.micro-label{ font-family: 'Archivo', sans-serif; font-weight: 600; text-transform: uppercase; letter-spacing: 0.18em; }

.s-cover{ background: var(--paper); }

.s-cover .blocks{ position: absolute; inset: 0; pointer-events: none; display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; grid-template-rows: repeat(8, 1fr); }

.s-cover .blocks div{ background: transparent; }

.s-cover .blocks .b1{ background: rgba(241, 238, 46, 0.55); grid-column: 1; grid-row: 3 / 6; }

.s-cover .blocks .b2{ background: rgba(241, 238, 46, 0.4); grid-column: 4; grid-row: 1 / 4; }

.s-cover .blocks .b3{ background: rgba(241, 238, 46, 0.7); grid-column: 1 / 3; grid-row: 6 / 9; }

.s-cover .blocks .b4{ background: rgba(241, 238, 46, 0.45); grid-column: 3 / 5; grid-row: 6 / 8; }

.s-cover .sunglow{ position: absolute; inset: 0; pointer-events: none; background: radial-gradient(ellipse 42% 38% at 52% 42%, rgba(241, 238, 46, 0.95) 0%, rgba(241, 238, 46, 0.65) 38%, rgba(240, 218, 124, 0.22) 65%, rgba(233, 229, 219, 0) 88%), radial-gradient(ellipse 28% 30% at 88% 16%, rgba(226, 107, 74, 0.22) 0%, rgba(226, 107, 74, 0) 70%); }

.s-cover .date-rail{ position: absolute; top: clamp(28px, 3.2vh, 56px); right: clamp(40px, 4vw, 76px); font-family: 'Instrument Serif', Georgia, serif; font-size: clamp(48px, min(5.2vw, 9vh), 96px); color: var(--ink); line-height: 0.96; text-align: right; letter-spacing: -0.005em; z-index: 5; }

.s-cover .titlewrap{ position: absolute; left: clamp(40px, 4vw, 76px); bottom: clamp(132px, 16vh, 220px); z-index: 5; max-width: 88%; }

.s-cover .title{ font-family: 'Instrument Serif', Georgia, serif; font-size: clamp(120px, min(14.6vw, 22vh), 240px); line-height: 0.86; color: var(--ink); letter-spacing: -0.018em; }

.s-cover .title em{ font-style: italic; }

.s-cover .subline{ margin-top: clamp(8px, 1vh, 18px); font-family: 'Archivo', sans-serif; font-weight: 600; text-transform: uppercase; letter-spacing: 0.18em; font-size: clamp(11px, 0.85vw, 13px); color: var(--ink); }

.s-cover .footer-row{ position: absolute; left: clamp(40px, 4vw, 76px); right: clamp(40px, 4vw, 76px); bottom: clamp(28px, 3vh, 52px); display: grid; grid-template-columns: 1.1fr 1fr 1.4fr 2fr; gap: clamp(20px, 2.4vw, 44px); z-index: 5; }

.s-cover .footer-row> div{ border-top: 1px solid var(--ink); padding-top: clamp(10px, 1.2vh, 16px); }

.s-cover .footer-row .ftag{ text-transform: uppercase; letter-spacing: 0.16em; font-weight: 600; font-size: clamp(10px, 0.72vw, 12px); margin-bottom: 6px; }
```

## Motion And Effects
- Decorative effect classes worth preserving as CSS-only motifs: sunglow, glow.
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
<section class="slide style-template-biennale-yellow" data-motion="progressive-reveal" data-visual="executive-summary">
  <div class="slide-content">
    <p class="eyebrow">Biennale Yellow</p>
    <h1>Biennale Yellow gives serious arguments a distinctive editorial system</h1>
    <div class="card-grid">
      <article class="card" data-reveal>
        <h3>Visual thesis</h3>
        <p>Solar yellow on warm parchment with deep indigo serif and atmospheric sun-glow gradients.</p>
      </article>
      <article class="card" data-reveal>
        <h3>Best use</h3>
        <p>Anything that should feel like an art-biennale poster or a museum's annual programme: exhibition decks, arts-institution announcements, design conference brochures, curatorial pitches, literary publications, studio retrospectives.</p>
      </article>
    </div>
  </div>
</section>
```

## QA Checklist
- The generated slide clearly belongs to Biennale Yellow, not to a generic SlideLeaf default.
- The palette, typography, spacing, and decorative vocabulary remain internally consistent.
- The slide uses SlideLeaf fragment rules: one section.slide root, no script, no style tag, no remote assets.
- Renderer-owned navigation is not duplicated.
- Content density, formality, and tone match the user's brief and audience.
