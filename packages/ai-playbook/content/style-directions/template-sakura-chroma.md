---
id: template-sakura-chroma
category: style-direction
title: Template Style - Sakura Chroma
tags: template, beautiful-html-templates, sakura-chroma, light, low, medium, retro, playful, kawaii-tech, warm, tactile, product-catalogue, confident, 80s-Japanese-tech, product launch or catalogue, indie hardware or analog studio brand, music label or release schedule, creative studio annual report, magazine or zine pitch, vintage-flavored brand campaign, 投资人, 融资, 路演, 创业, 技术, 开发者, 产品, SaaS, 研究, 报告, 学术, 白皮书, 品牌, 创意, 设计, 编辑感, 温暖, 活泼, 社区, 工作坊, 暗色, 高级, 科技感
motionPreset: progressive-reveal
sourceInfluences: beautiful-html-templates/sakura-chroma, Big Shoulders Display, Albert Sans, JetBrains Mono
---
## When To Use
- Anything that should feel like a vintage Japanese cassette package or a TDK / Sony / Sakura Color product catalogue: indie hardware brand decks, music-label release schedules, analog studio retrospectives, zine and magazine pitches, kawaii-tech product launches, creative-studio annual reports. Equally good for any deck wanting bold colour, condensed display type, and a tactile printed-product personality.
- Use when the requested mood overlaps with: retro, playful, kawaii-tech, warm, tactile, product-catalogue.
- Use when the occasion is close to: product launch or catalogue, indie hardware or analog studio brand, music label or release schedule, creative studio annual report, magazine or zine pitch, vintage-flavored brand campaign.
- Good fit for low formality, medium density, and a light color scheme.

## When Not To Use
- Decks that need restrained, corporate, or quiet typography — the bold condensed lockups, ribbon stripes, and primary-colour palette are intentionally loud and product-page-y.
- Do not use when the audience expects a materially different formality level or content density.
- Do not use if the deck needs a conflicting visual language; pick a different template direction instead.

## Good Structure
- Visual thesis: Vintage Japanese cassette-package aesthetic: cream paper, diagonal rainbow ribbons, condensed bold type, JIS-style spec checkboxes.
- Palette discipline: paper: #F1E6CB; ink: #3A2516; red: #E5392A; pink: #E54489; orange: #F09131; yellow: #F0BC2A; green: #3D9F47; blue: #3F8BC4; description: warm cream paper canvas with dark warm-brown ink and a six-colour primary palette (red, pink, orange, yellow, green, blue) used as bold flat blocks, ribbons, and product-strip accents
- Typography discipline: display: Big Shoulders Display; body: Albert Sans; mono: JetBrains Mono; jp: Noto Sans JP; style: condensed black grotesk display in red and brown for hero type, paired with a clean modern sans for body and a mono for spec-sheet listings; Japanese kanji used as decorative micro-type
- Layout grammar: stage, s-cover, hero, kicker, grid, card, body, quote-wrap, qkicker, qbody, stat, lab-tag, s-quote, who-tag, meta-tag, date-tag, ktag, ftag.
- Slide grammar: s-cover, active, s-manifesto, s-catalogue, s-stripe, s-data, s-quote, s-cal, s-colophon.
- Convert the original full-template system into SlideLeaf fragments: one section.slide per file, shared CSS in themes/deck.css, and no project-level navigation code inside slide fragments.
- Extend missing layouts by reusing the same fonts, palette, spacing rhythm, decorative vocabulary, and component grammar.

## CSS Tokens
```css
.style-template-sakura-chroma {
--paper: #F1E6CB;
--paper-dk: #E5D6B0;
--ink: #3A2516;
--red: #E5392A;
--pink: #E54489;
--orange: #F09131;
--green: #3D9F47;
--blue: #3F8BC4;
--yellow: #F0BC2A;
--line: #3A2516;
--template-paper: #F1E6CB;
--template-ink: #3A2516;
--template-red: #E5392A;
--template-pink: #E54489;
--template-orange: #F09131;
--template-yellow: #F0BC2A;
--template-green: #3D9F47;
--template-blue: #3F8BC4;
--template-font-display: "Big Shoulders Display", system-ui, sans-serif;
--template-font-body: "Albert Sans", system-ui, sans-serif;
--template-font-mono: "JetBrains Mono", system-ui, sans-serif;
--template-font-jp: "Noto Sans JP", system-ui, sans-serif;
}
```

## Core CSS Grammar
```css
.stage{ position: relative; width: 100vw; height: 100vh; overflow: hidden; background: var(--paper); }

.stage::before{ content: ''; position: absolute; inset: 0; pointer-events: none; opacity: 0.16; background-image: radial-gradient(circle at 1px 1px, rgba(58, 37, 22, 0.55) 1px, transparent 1.6px); background-size: 4px 4px; z-index: 1; }

.body-tx{ font-family: 'Albert Sans', sans-serif; font-weight: 400; line-height: 1.5; }

.stamp{ position: absolute; background: var(--red); color: var(--paper); z-index: 5; padding: clamp(8px, 1vh, 14px) clamp(12px, 1.4vw, 22px); font-family: 'Big Shoulders Display', sans-serif; font-weight: 900; line-height: 1; transform: rotate(-3deg); }

.s-cover{ background: var(--paper); }

.s-cover .cover-frame{ position: absolute; inset: clamp(36px, 3.6vw, 72px) clamp(36px, 3.6vw, 72px) clamp(80px, 8vh, 120px); z-index: 4; display: grid; grid-template-columns: 1fr; grid-template-rows: auto 1fr auto; }

.s-cover .petals{ top: clamp(36px, 4vh, 64px); left: clamp(36px, 3.6vw, 72px); width: clamp(280px, 22vw, 380px); height: clamp(220px, 17.6vw, 304px); }

.s-cover .petals .p1{ background: var(--red); width: 50%; left: 0; top: 28%; }

.s-cover .petals .p2{ background: var(--orange); width: 38%; left: 14%; top: 50%; }

.s-cover .petals .p3{ background: var(--blue); width: 44%; left: 28%; top: 0; }

.s-cover .petals .p4{ background: var(--green); width: 50%; left: 50%; top: 22%; }

.s-cover .petals .p5{ background: var(--yellow); width: 32%; left: 36%; top: 50%; }

.s-cover .brand{ position: absolute; top: clamp(80px, 9vh, 140px); left: clamp(280px, 28vw, 460px); z-index: 5; }

.s-cover .brand .b1{ font-family: 'Big Shoulders Display', sans-serif; font-weight: 900; font-size: clamp(32px, min(3.4vw, 5.4vh), 56px); color: var(--ink); line-height: 0.92; letter-spacing: -0.02em; }

.s-cover .brand .b2{ margin-top: 4px; font-family: 'Albert Sans', sans-serif; font-weight: 600; font-size: clamp(15px, 1.1vw, 20px); color: var(--ink); letter-spacing: 0.02em; }

.s-cover .hero{ position: absolute; left: clamp(36px, 3.6vw, 72px); top: clamp(290px, 30vh, 440px); font-family: 'Big Shoulders Display', sans-serif; font-weight: 900; font-size: clamp(120px, min(14vw, 22vh), 280px); color: var(--ink); line-height: 0.84; letter-spacing: -0.025em; z-index: 4; }

.s-cover .lockup{ position: absolute; left: clamp(36px, 3.6vw, 72px); bottom: clamp(150px, 16vh, 240px); font-family: 'Big Shoulders Display', sans-serif; font-weight: 900; font-size: clamp(56px, min(7vw, 11vh), 130px); color: var(--paper); -webkit-text-stroke: 0; line-height: 0.9; letter-spacing: -0.015em; background: var(--pink); padding: clamp(8px, 1.2vh, 18px) clamp(18px, 1.8vw, 32px) clamp(6px, 0.8vh, 12px); z-index: 4; }

.s-cover .ribbons{ position: absolute; right: 0; top: clamp(160px, 18vh, 280px); bottom: clamp(180px, 18vh, 280px); width: 52%; z-index: 3; pointer-events: none; overflow: hidden; }
```

## Motion And Effects
- Decorative effect classes worth preserving as CSS-only motifs: stamp, red-stamp.
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
<section class="slide style-template-sakura-chroma" data-motion="progressive-reveal" data-visual="comparison-table">
  <div class="slide-content">
    <p class="eyebrow">Sakura Chroma</p>
    <h1>Sakura Chroma gives serious arguments a distinctive editorial system</h1>
    <div class="card-grid">
      <article class="card" data-reveal>
        <h3>Visual thesis</h3>
        <p>Vintage Japanese cassette-package aesthetic: cream paper, diagonal rainbow ribbons, condensed bold type, JIS-style spec checkboxes.</p>
      </article>
      <article class="card" data-reveal>
        <h3>Best use</h3>
        <p>Anything that should feel like a vintage Japanese cassette package or a TDK / Sony / Sakura Color product catalogue: indie hardware brand decks, music-label release schedules, analog studio retrospectives, zine and magazine pitches, kawaii-tech product launches, creative-studio annual reports.</p>
      </article>
    </div>
  </div>
</section>
```

## QA Checklist
- The generated slide clearly belongs to Sakura Chroma, not to a generic SlideLeaf default.
- The palette, typography, spacing, and decorative vocabulary remain internally consistent.
- The slide uses SlideLeaf fragment rules: one section.slide root, no script, no style tag, no remote assets.
- Renderer-owned navigation is not duplicated.
- Content density, formality, and tone match the user's brief and audience.
