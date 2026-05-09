---
id: template-block-frame
category: style-direction
title: Template Style - BlockFrame
tags: template, beautiful-html-templates, block-frame, light, medium-low, high, bold, playful, graphic, fresh, confident, pop, design-led, creative agency pitch, indie SaaS launch, designer portfolio, brand redesign, modern startup deck, 投资人, 融资, 路演, 创业, 技术, 开发者, 产品, SaaS, 研究, 报告, 学术, 白皮书, 品牌, 创意, 设计, 编辑感, 温暖, 活泼, 社区, 工作坊
motionPreset: progressive-reveal
sourceInfluences: beautiful-html-templates/block-frame, Space Grotesk, Inter
---
## When To Use
- Anything that should feel pop-graphic and design-led: indie SaaS launches, agency credentials, creative reviews, brand redesigns. Also a strong unexpected pick for tech, finance, or research when the speaker wants to land as confident and contemporary rather than buttoned-up.
- Use when the requested mood overlaps with: bold, playful, graphic, fresh.
- Use when the occasion is close to: creative agency pitch, indie SaaS launch, designer portfolio, brand redesign, modern startup deck.
- Good fit for medium-low formality, high density, and a light color scheme.

## When Not To Use
- Contexts that require quiet institutional restraint or traditional weight (regulated disclosures, formal legal briefs).
- Do not use when the audience expects a materially different formality level or content density.
- Do not use if the deck needs a conflicting visual language; pick a different template direction instead.

## Good Structure
- Visual thesis: Neobrutalist deck with pastel-neon color blocks and chunky black borders.
- Palette discipline: pink: #FE90E8; blue: #C0F7FE; green: #99E885; yellow: #F7CB46; cream: #FFDC8B; black: #000000; offwhite: #FFFDF5; description: off-white background with neon pastel blocks (hot pink, sky blue, lime green, golden yellow) framed in heavy black borders
- Typography discipline: display: Space Grotesk; body: Inter; style: geometric sans display + neutral body, used in heavy weights for a poster-like feel
- Layout grammar: hero-frame, hero-label, hero-title, hero-subtitle, nb-body, stat-pill, intro-card, cards-row, feature-card, card-deco, feature-icon, chart-body, quote-frame, deco-quote-marks, quote-text, quote-author, split-content, content-list.
- Slide grammar: slide-1, active, slide-2, slide-3, slide-4, slide-5, slide-6, slide-7, slide-8, slide-9, slide-10.
- Convert the original full-template system into SlideLeaf fragments: one section.slide per file, shared CSS in themes/deck.css, and no project-level navigation code inside slide fragments.
- Extend missing layouts by reusing the same fonts, palette, spacing rhythm, decorative vocabulary, and component grammar.

## CSS Tokens
```css
.style-template-block-frame {
--pink: #FE90E8;
--blue: #C0F7FE;
--green: #99E885;
--yellow: #F7CB46;
--cream: #FFDC8B;
--black: #000000;
--white: #FFFFFF;
--offwhite: #FFFDF5;
--border: 4px solid var(--black);
--shadow: 8px 8px 0px var(--black);
--shadow-sm: 4px 4px 0px var(--black);
--radius: 0px;
--radius-sm: 4px;
--template-pink: #FE90E8;
--template-blue: #C0F7FE;
--template-green: #99E885;
--template-yellow: #F7CB46;
--template-cream: #FFDC8B;
--template-black: #000000;
--template-offwhite: #FFFDF5;
--template-font-display: "Space Grotesk", system-ui, sans-serif;
--template-font-body: "Inter", system-ui, sans-serif;
}
```

## Core CSS Grammar
```css
.nb-card{ border: var(--border); background: var(--white); box-shadow: var(--shadow); }

.nb-card-flat{ border: var(--border); background: var(--white); }

.nb-label{ display: inline-block; border: 3px solid var(--black); padding: 6px 16px; font-family: 'Space Grotesk', monospace; font-size: 13px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; background: var(--white); box-shadow: var(--shadow-sm); }

.nb-label-pink{ background: var(--pink); }

.nb-label-blue{ background: var(--blue); }

.nb-label-green{ background: var(--green); }

.nb-label-yellow{ background: var(--yellow); }

.nb-label-cream{ background: var(--cream); }

.nb-body{ font-family: 'Inter', sans-serif; font-size: clamp(16px, 1.2vw, 20px); line-height: 1.6; font-weight: 500; }

.slide-1{ flex-direction: column; justify-content: center; align-items: center; background: var(--cream); position: relative; }

.slide-1 .hero-frame{ position: relative; width: 100%; max-width: 900px; border: var(--border); background: var(--offwhite); padding: 60px; box-shadow: var(--shadow); }

.slide-1 .hero-label{ margin-bottom: 24px; }

.slide-1 .hero-title{ margin-bottom: 32px; }

.slide-1 .hero-subtitle{ font-family: 'Space Grotesk', monospace; font-size: 18px; font-weight: 500; max-width: 500px; }

.slide-1 .deco-pink-rect{ position: absolute; top: -30px; right: 80px; width: 100px; height: 100px; background: var(--pink); border: var(--border); box-shadow: var(--shadow-sm); transform: rotate(12deg); }

.slide-1 .deco-green-circle{ position: absolute; bottom: 60px; right: 120px; width: 60px; height: 60px; background: var(--green); border: var(--border); border-radius: 50%; }

.slide-1 .deco-yellow-bar{ position: absolute; bottom: -18px; left: 80px; width: 140px; height: 36px; background: var(--yellow); border: var(--border); box-shadow: var(--shadow-sm); transform: rotate(-3deg); display: flex; align-items: center; justify-content: center; font-family: 'Space Grotesk', monospace; font-size: 13px; font-weight: 600; z-index: 5; }

.slide-1 .deco-dots{ position: absolute; top: 60px; left: 60px; width: 120px; height: 80px; background-image: radial-gradient(circle, var(--black) 2px, transparent 2px); background-size: 20px 20px; opacity: 0.4; }
```

## Motion And Effects
- Decorative effect classes worth preserving as CSS-only motifs: deco-star.
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
<section class="slide style-template-block-frame" data-motion="progressive-reveal" data-visual="metric-system">
  <div class="slide-content">
    <p class="eyebrow">BlockFrame</p>
    <h1>BlockFrame gives serious arguments a distinctive editorial system</h1>
    <div class="card-grid">
      <article class="card" data-reveal>
        <h3>Visual thesis</h3>
        <p>Neobrutalist deck with pastel-neon color blocks and chunky black borders.</p>
      </article>
      <article class="card" data-reveal>
        <h3>Best use</h3>
        <p>Anything that should feel pop-graphic and design-led: indie SaaS launches, agency credentials, creative reviews, brand redesigns.</p>
      </article>
    </div>
  </div>
</section>
```

## QA Checklist
- The generated slide clearly belongs to BlockFrame, not to a generic SlideLeaf default.
- The palette, typography, spacing, and decorative vocabulary remain internally consistent.
- The slide uses SlideLeaf fragment rules: one section.slide root, no script, no style tag, no remote assets.
- Renderer-owned navigation is not duplicated.
- Content density, formality, and tone match the user's brief and audience.
