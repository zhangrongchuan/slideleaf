---
id: template-scatterbrain
category: style-direction
title: Template Style - Scatterbrain
tags: template, beautiful-html-templates, scatterbrain, light, low, high, playful, creative, warm, messy-on-purpose, workshop, informal, expressive, human, brainstorm / workshop, creative agency credentials, design-thinking session, ideation pitch, art-direction review, 投资人, 融资, 路演, 创业, CEO, 董事会, 战略, 咨询, 技术, 开发者, 产品, SaaS, 研究, 报告, 学术, 白皮书, 品牌, 创意, 设计, 编辑感, 温暖, 活泼, 社区, 工作坊, 专业, 正式, 高级
motionPreset: progressive-reveal
sourceInfluences: beautiful-html-templates/scatterbrain, Shrikhand, Zilla Slab
---
## When To Use
- Anything that should feel like a designer's whiteboard: brainstorms, workshops, creative-agency credentials, design-thinking sessions, ideation pitches, art-direction reviews. Equally fun for any deck — including tech, research, or business — that wants to read as in-progress thinking rather than polished conclusions.
- Use when the requested mood overlaps with: playful, creative, warm, messy-on-purpose, workshop.
- Use when the occasion is close to: brainstorm / workshop, creative agency credentials, design-thinking session, ideation pitch, art-direction review.
- Good fit for low formality, high density, and a light color scheme.

## When Not To Use
- Contexts that demand precision and institutional weight — the post-it sticky-note aesthetic intentionally reads as warm and unfinished.
- Do not use when the audience expects a materially different formality level or content density.
- Do not use if the deck needs a conflicting visual language; pick a different template direction instead.

## Good Structure
- Visual thesis: Post-it inspired: pastel sticky notes, Caveat handwriting, Shrikhand and Zilla Slab type stack.
- Palette discipline: yellow: #FFE066; blue: #A5D8FF; pink: #FFC9C9; green: #B2F2BB; orange: #FFCC80; purple: #D0BFFF; paper: #F7F5F0; ink: #2D2A26; description: off-white paper with a full pastel sticky-note palette (yellow, blue, pink, green, orange, purple) and ink-brown text; soft drop shadows everywhere
- Typography discipline: display: Shrikhand; script: Caveat; body: Zilla Slab; style: groovy display + handwritten script + warm slab body; reads like a designer's whiteboard
- Layout grammar: slide-content, statement-layout, statement-postit, side-note, two-col-layout, chart-layout, three-col-layout, feature-postit, feature-icon, timeline-layout, timeline-row, timeline-node, timeline-connector, timeline-content, imgtext-layout, mini-note, diagram-layout, diagram-note.
- Slide grammar: bg-cork, slide-title, active, bg-paper, bg-warm.
- Convert the original full-template system into SlideLeaf fragments: one section.slide per file, shared CSS in themes/deck.css, and no project-level navigation code inside slide fragments.
- Extend missing layouts by reusing the same fonts, palette, spacing rhythm, decorative vocabulary, and component grammar.

## CSS Tokens
```css
.style-template-scatterbrain {
--yellow: #ffe066;
--yellow-deep: #ffd43b;
--blue: #a5d8ff;
--blue-deep: #74c0fc;
--pink: #ffc9c9;
--pink-deep: #ff9f9f;
--green: #b2f2bb;
--green-deep: #8ce99a;
--orange: #ffcc80;
--purple: #d0bfff;
--cream: #faf8f3;
--paper: #f7f5f0;
--ink: #2d2a26;
--ink-light: #5c5750;
--shadow: rgba(45, 42, 38, 0.15);
--shadow-deep: rgba(45, 42, 38, 0.25);
--template-yellow: #FFE066;
--template-blue: #A5D8FF;
--template-pink: #FFC9C9;
--template-green: #B2F2BB;
--template-orange: #FFCC80;
--template-purple: #D0BFFF;
--template-paper: #F7F5F0;
--template-ink: #2D2A26;
--template-font-display: "Shrikhand", system-ui, sans-serif;
--template-font-script: "Caveat", system-ui, sans-serif;
--template-font-body: "Zilla Slab", system-ui, sans-serif;
}
```

## Core CSS Grammar
```css
.bg-cork::before{ background: radial-gradient(ellipse at 20% 30%, rgba(210, 170, 120, 0.3) 0%, transparent 50%), radial-gradient(ellipse at 80% 70%, rgba(190, 150, 100, 0.2) 0%, transparent 40%), linear-gradient(135deg, #e8ddd0 0%, #d4c5b0 50%, #c9b8a0 100%); background-size: 100% 100%, 100% 100%, 100% 100%; }

.bg-cork::after{ content: ''; position: absolute; inset: 0; background-image: url(/* embedded texture omitted */); opacity: 0.5; z-index: 0; }

.bg-paper::before{ background: linear-gradient(180deg, #faf8f3 0%, #f5f2ec 100%); }

.bg-paper::after{ content: ''; position: absolute; inset: 0; background-image: linear-gradient(rgba(200, 190, 175, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(200, 190, 175, 0.08) 1px, transparent 1px); background-size: 40px 40px; z-index: 0; }

.bg-warm::before{ background: radial-gradient(ellipse at 30% 20%, rgba(255, 224, 102, 0.4) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(165, 216, 255, 0.3) 0%, transparent 50%), radial-gradient(ellipse at 50% 50%, rgba(255, 201, 201, 0.15) 0%, transparent 60%), linear-gradient(160deg, #fdf8f0 0%, #f7f0e6 100%); }

.label{ font-family: 'Caveat', cursive; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.15em; color: var(--ink-light); }

.slide-content{ position: relative; z-index: 1; max-width: 1200px; width: 100%; }

.slide-title{ flex-direction: column; text-align: center; }

.statement-layout{ display: flex; align-items: center; justify-content: center; gap: 3rem; flex-wrap: wrap; }

.statement-postit{ max-width: 700px; padding: 3.5rem 4rem; transform: rotate(1deg); text-align: center; }

.statement-postit h2{ font-size: clamp(2rem, 4vw, 3.5rem); margin-bottom: 1.5rem; }

.side-note{ position: absolute; right: 5%; top: 15%; padding: 1.5rem; max-width: 200px; transform: rotate(8deg); }

.two-col-layout{ display: grid; grid-template-columns: 1fr 1fr; gap: 3rem; align-items: start; }

.chart-layout{ display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 3rem; align-items: center; }

.chart-container{ background: #fff; padding: 2.5rem; box-shadow: 2px 3px 15px var(--shadow); transform: rotate(-1deg); }

.chart-legend{ padding: 2rem; transform: rotate(2deg); }

.chart-legend h3{ margin-bottom: 1.5rem; }

.sketch-chart{ width: 100%; height: auto; }

@keyframes growBar{ from{ transform: scaleY(0); } to{ transform: scaleY(1); } }
```

## Motion And Effects
- Reusable keyframe names detected: growBar. Keep subtle entrance, rule-reveal, scale-in, glow, or float effects; avoid motion that competes with reading.
- Decorative effect classes worth preserving as CSS-only motifs: bg-paper.
- Forbidden JS from source template: slide navigation, keyboard handlers, deck transform, page counters, progress bars, active class toggles, custom elements that own the deck stage.
- If runtime/deck.js is needed, use it only as a non-navigation extension and listen to the renderer's slideleaf:slidechange event.

## Anti Patterns
- Mixing this template with another template family in the same deck.
- Recoloring the palette or replacing the type system because it feels convenient.
- Removing signature decoration, chrome, texture, mono labels, or page furniture that carries the template identity.
- Copying the source template's deck navigation, keyboard handler, or slide-stage runtime into SlideLeaf; the renderer owns navigation.
- Turning the style into generic cards, centered bullets, purple gradients, or glassmorphism.

## Evidence Requirements
- Match density to evidence: high density means proof blocks should be specific, compact, and numerous enough for analytical slides.
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
<section class="slide style-template-scatterbrain" data-motion="progressive-reveal" data-visual="metric-system">
  <div class="slide-content">
    <p class="eyebrow">Scatterbrain</p>
    <h1>Scatterbrain gives serious arguments a distinctive editorial system</h1>
    <div class="card-grid">
      <article class="card" data-reveal>
        <h3>Visual thesis</h3>
        <p>Post-it inspired: pastel sticky notes, Caveat handwriting, Shrikhand and Zilla Slab type stack.</p>
      </article>
      <article class="card" data-reveal>
        <h3>Best use</h3>
        <p>Anything that should feel like a designer's whiteboard: brainstorms, workshops, creative-agency credentials, design-thinking sessions, ideation pitches, art-direction reviews.</p>
      </article>
    </div>
  </div>
</section>
```

## QA Checklist
- The generated slide clearly belongs to Scatterbrain, not to a generic SlideLeaf default.
- The palette, typography, spacing, and decorative vocabulary remain internally consistent.
- The slide uses SlideLeaf fragment rules: one section.slide root, no script, no style tag, no remote assets.
- Renderer-owned navigation is not duplicated.
- Content density, formality, and tone match the user's brief and audience.
