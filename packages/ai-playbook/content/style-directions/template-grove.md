---
id: template-grove
category: style-direction
title: Template Style - Grove
tags: template, beautiful-html-templates, grove, mixed, medium-high, medium, organic, considered, warm, literary, natural, classical, patient, sustainability brand, wellness brand, outdoor / nature product, winery or restaurant, literary or arts deck, advisory deliverable, bilingual EN/CN deck, CEO, 董事会, 战略, 咨询, 技术, 开发者, 产品, SaaS, 研究, 报告, 学术, 白皮书, 品牌, 创意, 设计, 编辑感, 温暖, 活泼, 社区, 工作坊
motionPreset: progressive-reveal
sourceInfluences: beautiful-html-templates/grove, Playfair Display, Jost, JetBrains Mono
---
## When To Use
- Anything that should feel organic, considered, and grown-up: sustainability and wellness brands, outdoor / nature products, wineries and restaurants, literary or arts decks, advisory deliverables, bilingual EN/CN reports. Also a calm, distinctive choice for tech, research, or business decks that want patience over urgency.
- Use when the requested mood overlaps with: organic, considered, warm, literary, natural.
- Use when the occasion is close to: sustainability brand, wellness brand, outdoor / nature product, winery or restaurant, literary or arts deck, advisory deliverable, bilingual EN/CN deck.
- Good fit for medium-high formality, medium density, and a mixed color scheme.

## When Not To Use
- Decks that need neon energy or rapid-fire pop — the forest-green canvas and Playfair serif commit to a slow, classical voice.
- Do not use when the audience expects a materially different formality level or content density.
- Do not use if the deck needs a conflicting visual language; pick a different template direction instead.

## Good Structure
- Visual thesis: Forest-green canvas with cream type, classical Playfair serifs, and a single rust accent.
- Palette discipline: bg: #192b1b; bg_alt: #1e3221; fg: #d4cfbf; accent: #c8524a; bg_light: #e8e4d6; description: deep forest green canvas with warm bone type and a single rust-red accent; alternate cream-paper mode for breathing room
- Typography discipline: display: Playfair Display; body: Jost; mono: JetBrains Mono; serif_cn: Noto Serif SC; sans_cn: Noto Sans SC; style: transitional serif headlines + clean geometric sans body + technical mono; full Chinese serif/sans support
- Layout grammar: slide--cover, kicker, slide--chapter, chapter-num, chapter-rule, slide--statement, slide-chrome, slide-body, statement-body, slide--stats, stats-row, grove-stat, grove-stat-val, grove-stat-label, body, slide--quote, quote-mark, quote-text.
- Slide grammar: dark, slide--cover, slide--chapter, slide--statement, light, slide--split, slide--stats, slide--list, slide--quote, slide--compare, slide--chart, slide--end.
- Convert the original full-template system into SlideLeaf fragments: one section.slide per file, shared CSS in themes/deck.css, and no project-level navigation code inside slide fragments.
- Extend missing layouts by reusing the same fonts, palette, spacing rhythm, decorative vocabulary, and component grammar.

## CSS Tokens
```css
.style-template-grove {
--c-bg: #192b1b;
--c-bg-alt: #1e3221;
--c-bg-light: #e8e4d6;
--c-bg-light-alt: #dedad0;
--c-fg: #d4cfbf;
--c-fg-2: rgba(212, 207, 191, 0.6);
--c-fg-3: rgba(212, 207, 191, 0.32);
--c-fg-light: #192b1b;
--c-fg-light-2: rgba(25, 43, 27, 0.58);
--c-fg-light-3: rgba(25, 43, 27, 0.33);
--c-accent: #c8524a;
--c-border: rgba(212, 207, 191, 0.12);
--c-border-light: rgba(25, 43, 27, 0.14);
--f-display: "Playfair Display", "Noto Serif SC", Georgia, serif;
--f-heading: "Playfair Display", "Noto Serif SC", Georgia, serif;
--f-body: "Jost", "Noto Sans SC", system-ui, sans-serif;
--f-mono: "JetBrains Mono", monospace;
--sz-display: 10vw;
--sz-h1: 5.5vw;
--sz-h2: 3.2vw;
--sz-h3: 2vw;
--sz-lead: 1.45vw;
--template-bg: #192b1b;
--template-bg-alt: #1e3221;
--template-fg: #d4cfbf;
--template-accent: #c8524a;
--template-bg-light: #e8e4d6;
--template-font-display: "Playfair Display", system-ui, sans-serif;
--template-font-body: "Jost", system-ui, sans-serif;
--template-font-mono: "JetBrains Mono", system-ui, sans-serif;
--template-font-serif-cn: "Noto Serif SC", system-ui, sans-serif;
--template-font-sans-cn: "Noto Sans SC", system-ui, sans-serif;
}
```

## Core CSS Grammar
```css
.slide-body{ min-height: 0; }

[data-anim]{ opacity: 0; }

.body{ font-family: var(--f-body); font-size: var(--sz-body); font-weight: 300; line-height: 1.75; }

.label{ font-family: var(--f-mono); font-size: var(--sz-label); font-weight: 300; letter-spacing: 0.12em; }

.light .muted{ color: var(--c-fg-light-2); }

.slide-chrome, .slide-foot{ display: flex; justify-content: space-between; align-items: center; }

.slide-chrome{ padding-bottom: var(--gap-sm); border-bottom: 1px solid var(--c-border); margin-bottom: var(--gap-md); }

.light .slide-chrome, .light .slide-foot{ border-color: var(--c-border-light); }

.slide--cover .slide-chrome, .slide--cover .slide-foot, .slide--chapter .slide-chrome, .slide--chapter .slide-foot, .slide--quote .slide-chrome, .slide--quote .slide-foot, .slide--end .slide-chrome, .slide--end .slide-foot{ display: none; }

.light .grove-num{ color: rgba(25, 43, 27, 0.06); }

.light .grove-sidebar{ color: var(--c-fg-light-3); }

.grove-stat{ display: flex; flex-direction: column; gap: var(--gap-sm); padding-bottom: var(--gap-md); border-bottom: 1px solid var(--c-border); }

.grove-stat-val{ font-family: var(--f-display); font-size: 4.5vw; font-weight: 400; line-height: 1; color: var(--c-accent); letter-spacing: -0.02em; }

.grove-stat-val em{ font-style: italic; }

.grove-stat-label{ font-family: var(--f-mono); font-size: var(--sz-label); letter-spacing: 0.12em; text-transform: uppercase; color: var(--c-fg-2); }

.light .grove-stat-label{ color: var(--c-fg-light-2); }

.light .grove-stat{ border-color: var(--c-border-light); }

.light .img-placeholder{ background: var(--c-border-light); color: var(--c-fg-light-3); }

@keyframes kFadeUp{ from{ opacity: 0; transform: translateY(28px); } to{ opacity: 1; transform: none; } }

@keyframes kFadeIn{ from{ opacity: 0; } to{ opacity: 1; } }

@keyframes kRevealRight{ from{ clip-path: inset(0 100% 0 0); opacity: 1; } to{ clip-path: inset(0 0% 0 0); opacity: 1; } }
```

## Motion And Effects
- CSS reveal vocabulary from source template: fade-up, fade-in, reveal-right, reveal-left, scale-in. In SlideLeaf, map these to data-reveal or CSS selectors under .slide.active; do not add a custom slide activator.
- Reusable keyframe names detected: kFadeUp, kFadeIn, kRevealRight, kRevealLeft, kScaleIn. Keep subtle entrance, rule-reveal, scale-in, glow, or float effects; avoid motion that competes with reading.
- Decorative effect classes worth preserving as CSS-only motifs: rule, chapter-rule.
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
<section class="slide style-template-grove" data-motion="progressive-reveal" data-visual="comparison-table">
  <div class="slide-content">
    <p class="eyebrow">Grove</p>
    <h1>Grove gives serious arguments a distinctive editorial system</h1>
    <div class="card-grid">
      <article class="card" data-reveal>
        <h3>Visual thesis</h3>
        <p>Forest-green canvas with cream type, classical Playfair serifs, and a single rust accent.</p>
      </article>
      <article class="card" data-reveal>
        <h3>Best use</h3>
        <p>Anything that should feel organic, considered, and grown-up: sustainability and wellness brands, outdoor / nature products, wineries and restaurants, literary or arts decks, advisory deliverables, bilingual EN/CN reports.</p>
      </article>
    </div>
  </div>
</section>
```

## QA Checklist
- The generated slide clearly belongs to Grove, not to a generic SlideLeaf default.
- The palette, typography, spacing, and decorative vocabulary remain internally consistent.
- The slide uses SlideLeaf fragment rules: one section.slide root, no script, no style tag, no remote assets.
- Renderer-owned navigation is not duplicated.
- Content density, formality, and tone match the user's brief and audience.
