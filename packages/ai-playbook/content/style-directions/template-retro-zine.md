---
id: template-retro-zine
category: style-direction
title: Template Style - Retro Zine
tags: template, beautiful-html-templates, retro-zine, light, medium-low, medium, crafted, lo-fi, underground, warm-retro, scrappy, warm, intentional, DIY, indie zine / publication, music or arts brand, creator portfolio, small-batch / craft launch, cultural / community deck, 技术, 开发者, 产品, SaaS, 研究, 报告, 学术, 白皮书, 品牌, 创意, 设计, 编辑感, 温暖, 活泼, 社区, 工作坊
motionPreset: progressive-reveal
sourceInfluences: beautiful-html-templates/retro-zine, Bebas Neue, Space Grotesk
---
## When To Use
- Anything that should feel printed, lo-fi, and crafted: indie zines and publications, music / arts brands, creator portfolios, small-batch craft launches, community decks. Also a great underdog choice for tech, research, or business decks that want a riso-print warmth instead of digital polish.
- Use when the requested mood overlaps with: crafted, lo-fi, underground, warm-retro.
- Use when the occasion is close to: indie zine / publication, music or arts brand, creator portfolio, small-batch / craft launch, cultural / community deck.
- Good fit for medium-low formality, medium density, and a light color scheme.

## When Not To Use
- Contexts that demand digital-native polish or fast modern-tech energy — the layered zine aesthetic intentionally feels handmade.
- Do not use when the audience expects a materially different formality level or content density.
- Do not use if the deck needs a conflicting visual language; pick a different template direction instead.

## Good Structure
- Visual thesis: Beige paper with green accent and Bebas Neue + Caveat: a riso-printed zine in HTML form.
- Palette discipline: bg: #C8B99A; bg_dark: #B8A98A; green: #008F4D; green_light: #00A85D; black: #1A1A1A; white: #F4EFE6; description: warm beige / khaki paper with one saturated forest green; dark ink and off-white cream; reads like a two-color riso print
- Typography discipline: display: Bebas Neue; script: Caveat; body: Space Grotesk; style: tall condensed display + handwritten script + clean grotesk body; layered like a printed zine page
- Layout grammar: slide-hero, hero-label, hero-title, hero-illustration, hero-sub, hero-date, split-body, split-stat, split-stat-label, slide-statement, statement-line-top, statement-quote, statement-line-bottom, statement-author, slide-grid, grid-header, grid-boxes, grid-box.
- Slide grammar: cover, section, proof, comparison, quote, and closing variants.
- Convert the original full-template system into SlideLeaf fragments: one section.slide per file, shared CSS in themes/deck.css, and no project-level navigation code inside slide fragments.
- Extend missing layouts by reusing the same fonts, palette, spacing rhythm, decorative vocabulary, and component grammar.

## CSS Tokens
```css
.style-template-retro-zine {
--bg: #C8B99A;
--bg-dark: #B8A98A;
--green: #008F4D;
--green-light: #00A85D;
--black: #1A1A1A;
--white: #F4EFE6;
--line: #1A1A1A;
--template-bg: #C8B99A;
--template-bg-dark: #B8A98A;
--template-green: #008F4D;
--template-green-light: #00A85D;
--template-black: #1A1A1A;
--template-white: #F4EFE6;
--template-font-display: "Bebas Neue", system-ui, sans-serif;
--template-font-script: "Caveat", system-ui, sans-serif;
--template-font-body: "Space Grotesk", system-ui, sans-serif;
}
```

## Core CSS Grammar
```css
.grain-overlay{ position: fixed; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 9999; opacity: 0.07; background-image: url(/* embedded texture omitted */); background-size: 200px 200px; }

.stamp{ display: inline-block; transform: rotate(-8deg); }

.stamp-alt{ display: inline-block; transform: rotate(6deg); }

.slide-hero{ background: var(--bg); justify-content: center; align-items: center; text-align: center; }

.slide-hero .hero-label{ font-family: 'Space Grotesk', sans-serif; font-size: 14px; font-weight: 600; letter-spacing: 4px; text-transform: uppercase; color: var(--green); margin-bottom: 12px; }

.slide-hero .hero-title{ font-family: 'Bebas Neue', sans-serif; font-size: clamp(48px, 10vw, 140px); line-height: 0.88; color: var(--green); text-transform: uppercase; letter-spacing: 4px; }

.slide-hero .hero-illustration{ width: clamp(120px, 18vw, 240px); height: auto; margin: 16px 0; }

.slide-hero .hero-sub{ font-family: 'Space Grotesk', sans-serif; font-size: clamp(12px, 1.2vw, 16px); font-weight: 500; letter-spacing: 3px; text-transform: uppercase; color: var(--black); margin-top: 12px; }

.slide-hero .hero-date{ font-family: 'Bebas Neue', sans-serif; font-size: clamp(32px, 5vw, 72px); color: var(--green); margin-top: 8px; line-height: 1; }

.slide-split .split-label{ font-family: 'Bebas Neue', sans-serif; font-size: 14px; letter-spacing: 3px; color: var(--green); margin-bottom: 20px; }

.slide-split .split-body{ font-family: 'Space Grotesk', sans-serif; font-size: clamp(14px, 1.3vw, 18px); line-height: 1.6; color: var(--black); max-width: 480px; }

.slide-split .split-stat{ font-family: 'Bebas Neue', sans-serif; font-size: clamp(80px, 12vw, 160px); color: var(--green); line-height: 1; }

.slide-split .split-stat-label{ font-family: 'Caveat', cursive; font-size: clamp(24px, 3vw, 36px); color: var(--black); margin-top: 8px; }

.slide-statement{ text-align: center; background: var(--green); color: var(--white); }

.slide-statement .statement-line-top, .slide-statement .statement-line-bottom{ width: 60px; height: 4px; background: var(--white); margin: 0 auto; }

.slide-statement .statement-quote{ font-family: 'Bebas Neue', sans-serif; font-size: clamp(36px, 6vw, 90px); line-height: 1.1; text-transform: uppercase; letter-spacing: 2px; margin: 40px auto; max-width: 900px; }

.slide-statement .statement-author{ font-family: 'Caveat', cursive; font-size: clamp(24px, 3vw, 36px); margin-top: 20px; }

.slide-grid{ padding: 60px; justify-content: center; }
```

## Motion And Effects
- Decorative effect classes worth preserving as CSS-only motifs: grain-overlay, stamp, rsvp-stamp.
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
<section class="slide style-template-retro-zine" data-motion="progressive-reveal" data-visual="comparison-table">
  <div class="slide-content">
    <p class="eyebrow">Retro Zine</p>
    <h1>Retro Zine gives serious arguments a distinctive editorial system</h1>
    <div class="card-grid">
      <article class="card" data-reveal>
        <h3>Visual thesis</h3>
        <p>Beige paper with green accent and Bebas Neue + Caveat: a riso-printed zine in HTML form.</p>
      </article>
      <article class="card" data-reveal>
        <h3>Best use</h3>
        <p>Anything that should feel printed, lo-fi, and crafted: indie zines and publications, music / arts brands, creator portfolios, small-batch craft launches, community decks.</p>
      </article>
    </div>
  </div>
</section>
```

## QA Checklist
- The generated slide clearly belongs to Retro Zine, not to a generic SlideLeaf default.
- The palette, typography, spacing, and decorative vocabulary remain internally consistent.
- The slide uses SlideLeaf fragment rules: one section.slide root, no script, no style tag, no remote assets.
- Renderer-owned navigation is not duplicated.
- Content density, formality, and tone match the user's brief and audience.
