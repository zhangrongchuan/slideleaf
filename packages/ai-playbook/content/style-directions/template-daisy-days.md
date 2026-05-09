---
id: template-daisy-days
category: style-direction
title: Template Style - Daisy Days
tags: template, beautiful-html-templates, daisy-days, light, low, medium, cheerful, playful, warm, sunny, wholesome, friendly, soft, encouraging, approachable, lighthearted, education / classroom, kids product launch, wellness program, community workshop, creator portfolio (craft / illustration), team kickoff, wedding / baby shower planning, 技术, 开发者, 产品, SaaS, 温暖, 活泼, 社区, 工作坊
motionPreset: progressive-reveal
sourceInfluences: beautiful-html-templates/daisy-days, Fredoka One, Quicksand
---
## When To Use
- Anything that should feel friendly, soft, and joyful: educational content, kids and family, wellness programs, community workshops, creator portfolios for craft / illustration. Also lovely for an unexpected playful internal kickoff, a wedding planning deck, or any moment where warmth is the message — including across tech or business contexts.
- Use when the requested mood overlaps with: cheerful, playful, warm, sunny, wholesome.
- Use when the occasion is close to: education / classroom, kids product launch, wellness program, community workshop, creator portfolio (craft / illustration), team kickoff, wedding / baby shower planning.
- Good fit for low formality, medium density, and a light color scheme.

## When Not To Use
- Contexts where the audience explicitly expects authority and precision — the hand-drawn pastel SVG decorations are the opposite of buttoned-up.
- Do not use when the audience expects a materially different formality level or content density.
- Do not use if the deck needs a conflicting visual language; pick a different template direction instead.

## Good Structure
- Visual thesis: Cheerful pastel deck with hand-drawn daisies, stars, and rainbows. Friendly, soft, and warm.
- Palette discipline: cream: #F5F0E6; turquoise: #7ECDC0; soft_pink: #F7C8D4; butter: #FDE68A; mint: #A8E6CF; lavender: #D4A5E8; peach: #FFCBA4; sky: #A8D8F0; coral: #F8635F; ink: #2D2D2D; description: warm cream base with a full pastel rainbow (mint, lavender, peach, sky, soft pink, butter, turquoise, coral) and ink-black 3px outlines plus chunky 6px offset shadows
- Typography discipline: display: Fredoka One; body: Quicksand; style: rounded sans display + friendly geometric sans body; warm and informal
- Layout grammar: welcome-body, weekly-grid, day-card, day-body, slide-timeline, timeline-wrap, timeline-row, timeline-dot, timeline-card, slide-cards, cards-grid, info-card, card-icon, slide-quote, quote-box, quote-mark, quote-text, quote-author.
- Slide grammar: slide-title, slide-welcome, slide-weekly, slide-timeline, slide-chart-bar, slide-cards, slide-quote, slide-team, slide-process, slide-donut.
- Convert the original full-template system into SlideLeaf fragments: one section.slide per file, shared CSS in themes/deck.css, and no project-level navigation code inside slide fragments.
- Extend missing layouts by reusing the same fonts, palette, spacing rhythm, decorative vocabulary, and component grammar.

## CSS Tokens
```css
.style-template-daisy-days {
--cream: #F5F0E6;
--turquoise: #7ECDC0;
--soft-pink: #F7C8D4;
--butter: #FDE68A;
--mint: #A8E6CF;
--lavender: #D4A5E8;
--peach: #FFCBA4;
--sky: #A8D8F0;
--coral: #F8635F;
--text-dark: #2D2D2D;
--text-muted: #6B6B6B;
--border: #2D2D2D;
--border-width: 3px;
--radius: 20px;
--radius-lg: 28px;
--shadow: 6px 6px 0 var(--border);
--shadow-sm: 4px 4px 0 var(--border);
--font-display: 'Fredoka One',cursive;
--font-body: 'Quicksand',sans-serif;
--template-cream: #F5F0E6;
--template-turquoise: #7ECDC0;
--template-soft-pink: #F7C8D4;
--template-butter: #FDE68A;
--template-mint: #A8E6CF;
--template-lavender: #D4A5E8;
--template-peach: #FFCBA4;
--template-sky: #A8D8F0;
--template-coral: #F8635F;
--template-ink: #2D2D2D;
--template-font-display: "Fredoka One", system-ui, sans-serif;
--template-font-body: "Quicksand", system-ui, sans-serif;
}
```

## Core CSS Grammar
```css
.card{ background:#fff; border:var(--border-width) solid var(--border); border-radius:var(--radius); box-shadow:var(--shadow)}

.slide-title{ background:var(--cream)}

.slide-title .title-box{ text-align:center; z-index:2; position:relative}

.slide-title h1{ color:var(--text-dark); margin-bottom:12px; font-size:clamp(3.2rem, 7vw, 6.5rem)}

.slide-title .subtitle{ font-family:var(--font-body); font-weight:600; font-size:clamp(1rem, 1.8vw, 1.4rem); color:var(--text-muted); margin-top:16px}

.slide-title .deco-daisy-tl{ top:-30px; left:-30px; width:220px; height:220px}

.slide-title .deco-daisy-tr{ top:20px; right:-20px; width:180px; height:180px}

.slide-title .deco-daisy-bl{ bottom:-40px; left:20px; width:200px; height:200px}

.slide-title .deco-daisy-br{ bottom:10px; right:-30px; width:210px; height:210px}

.slide-title .deco-star-1{ top:12%; left:6%; width:90px; height:90px}

.slide-title .deco-star-2{ bottom:18%; left:10%; width:70px; height:70px}

.slide-title .deco-star-3{ top:18%; right:8%; width:80px; height:80px}

.slide-welcome{ background:var(--cream)}

.welcome-body{ background:#fff; border:var(--border-width) solid var(--border); border-radius:0 0 var(--radius-lg) var(--radius-lg); padding:36px 48px; box-shadow:var(--shadow)}

.slide-welcome .deco-sun{ top:6%; left:4%; width:140px; height:140px}

.slide-welcome .deco-rainbow{ bottom:4%; right:3%; width:180px; height:130px}

.slide-welcome .deco-star-1{ top:14%; right:7%; width:75px; height:75px}

.slide-welcome .deco-star-2{ bottom:16%; left:6%; width:60px; height:60px}
```

## Motion And Effects
- Decorative effect classes worth preserving as CSS-only motifs: deco-star-1, deco-star-2, deco-star-3.
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
- product-demo-flow
- roadmap
- architecture-diagram

## Example Markup
```html
<section class="slide style-template-daisy-days" data-motion="progressive-reveal" data-visual="comparison-table">
  <div class="slide-content">
    <p class="eyebrow">Daisy Days</p>
    <h1>Daisy Days creates a clear visual point of view for this story</h1>
    <div class="card-grid">
      <article class="card" data-reveal>
        <h3>Visual thesis</h3>
        <p>Cheerful pastel deck with hand-drawn daisies, stars, and rainbows. Friendly, soft, and warm.</p>
      </article>
      <article class="card" data-reveal>
        <h3>Best use</h3>
        <p>Anything that should feel friendly, soft, and joyful: educational content, kids and family, wellness programs, community workshops, creator portfolios for craft / illustration.</p>
      </article>
    </div>
  </div>
</section>
```

## QA Checklist
- The generated slide clearly belongs to Daisy Days, not to a generic SlideLeaf default.
- The palette, typography, spacing, and decorative vocabulary remain internally consistent.
- The slide uses SlideLeaf fragment rules: one section.slide root, no script, no style tag, no remote assets.
- Renderer-owned navigation is not duplicated.
- Content density, formality, and tone match the user's brief and audience.
