---
id: template-signal
category: style-direction
title: Template Style - Signal
tags: template, beautiful-html-templates, signal, mixed, high, institutional, trustworthy, considered, weighty, sober, polished, established, literary, investor deck, consulting deliverable, board presentation, legal / policy brief, academic deck, advisory pitch, bilingual EN/CN deck, 投资人, 融资, 路演, 创业, CEO, 董事会, 战略, 咨询, 技术, 开发者, 产品, SaaS, 研究, 报告, 学术, 白皮书, 品牌, 创意, 设计, 编辑感, 暗色, 高级, 科技感, 专业, 正式
motionPreset: progressive-reveal
sourceInfluences: beautiful-html-templates/signal, Source Serif 4, DM Sans, IBM Plex Mono
---
## When To Use
- Anything that should feel weighty, considered, and credibly institutional: investor decks, board presentations, consulting deliverables, legal / policy briefs, advisory pitches. Also a strong choice for tech, research, or brand work that wants to read as quietly authoritative rather than loud.
- Use when the requested mood overlaps with: institutional, trustworthy, considered, weighty.
- Use when the occasion is close to: investor deck, consulting deliverable, board presentation, legal / policy brief, academic deck, advisory pitch, bilingual EN/CN deck.
- Good fit for high formality, high density, and a mixed color scheme.

## When Not To Use
- Contexts that should feel hot, fast, or intentionally playful — the navy + gold restraint commits to a sober voice.
- Do not use when the audience expects a materially different formality level or content density.
- Do not use if the deck needs a conflicting visual language; pick a different template direction instead.

## Good Structure
- Visual thesis: Deep navy canvas with bone paper and a single muted-gold accent; institutional with quiet weight.
- Palette discipline: bg: #1c2644; bg_alt: #232f55; fg: #e2dcd0; accent: #c8a870; bg_light: #f0ece3; description: deep navy primary with warm bone paper alternate and a single muted-gold accent; restrained, institutional, no decorative color
- Typography discipline: display: Source Serif 4; body: DM Sans; mono: IBM Plex Mono; serif_cn: Noto Serif SC; sans_cn: Noto Sans SC; style: transitional serif headlines + clean sans body + technical mono captions; full Chinese serif/sans support
- Layout grammar: slide--cover, cover-body, cover-meta, slide--chapter, chapter-num, chapter-rule, slide--statement, slide-chrome, slide-body, statement-body, kicker, slide--stats, stats-grid, stat-card, stat-value, stat-label, stat-note, slide--quote.
- Slide grammar: dark, slide--cover, slide--chapter, slide--statement, light, slide--split, slide--stats, slide--quote, slide--list, slide--compare, slide--editorial, slide--dense, slide--end, slide--chart, slide--diagram, slide--pie.
- Convert the original full-template system into SlideLeaf fragments: one section.slide per file, shared CSS in themes/deck.css, and no project-level navigation code inside slide fragments.
- Extend missing layouts by reusing the same fonts, palette, spacing rhythm, decorative vocabulary, and component grammar.

## CSS Tokens
```css
.style-template-signal {
--c-bg: #1c2644;
--c-bg-alt: #232f55;
--c-bg-light: #f0ece3;
--c-bg-light-alt: #e6e0d4;
--c-fg: #e2dcd0;
--c-fg-2: #8a96a8;
--c-fg-3: #4e5a6e;
--c-fg-light: #1a2030;
--c-fg-light-2: #5a6270;
--c-fg-light-3: #9aa0a8;
--c-accent: #c8a870;
--c-border: #2e3d5c;
--c-border-light: #cac4b4;
--f-display: "Source Serif 4", "Noto Serif SC", Georgia, serif;
--f-heading: "Source Serif 4", "Noto Serif SC", Georgia, serif;
--f-body: "DM Sans", "Noto Sans SC", system-ui, sans-serif;
--f-mono: "IBM Plex Mono", "JetBrains Mono", monospace;
--sz-display: 9.5vw;
--sz-h1: 5.2vw;
--sz-h2: 3vw;
--sz-h3: 1.9vw;
--sz-lead: 1.4vw;
--template-bg: #1c2644;
--template-bg-alt: #232f55;
--template-fg: #e2dcd0;
--template-accent: #c8a870;
--template-bg-light: #f0ece3;
--template-font-display: "Source Serif 4", system-ui, sans-serif;
--template-font-body: "DM Sans", system-ui, sans-serif;
--template-font-mono: "IBM Plex Mono", system-ui, sans-serif;
--template-font-serif-cn: "Noto Serif SC", system-ui, sans-serif;
--template-font-sans-cn: "Noto Sans SC", system-ui, sans-serif;
}
```

## Core CSS Grammar
```css
.slide-body{ min-height: 0; }

[data-anim]{ opacity: 0; }

.label{ font-family: var(--f-mono); font-size: var(--sz-label); font-weight: 500; letter-spacing: 0.14em; text-transform: uppercase; }

.dark .muted{ color: var(--c-fg-2); }

.light .muted{ color: var(--c-fg-light-2); }

.slide-chrome, .slide-foot{ display: flex; justify-content: space-between; align-items: center; }

.slide-chrome{ padding-bottom: var(--gap-sm); border-bottom: 1px solid var(--c-border); margin-bottom: var(--gap-md); }

.light .slide-chrome, .light .slide-foot{ border-color: var(--c-border-light); }

.slide--cover .slide-chrome, .slide--cover .slide-foot, .slide--chapter .slide-chrome, .slide--chapter .slide-foot, .slide--quote .slide-chrome, .slide--quote .slide-foot, .slide--end .slide-chrome, .slide--end .slide-foot{ display: none; }

.slide--cover{ display: flex; flex-direction: column; justify-content: flex-end; }

.cover-body{ display: flex; flex-direction: column; flex: 1; justify-content: flex-end; gap: var(--gap-md); }

.cover-meta{ display: flex; justify-content: space-between; align-items: flex-end; margin-top: var(--gap-lg); padding-top: var(--gap-sm); border-top: 1px solid var(--c-border); }

.light .cover-meta{ border-color: var(--c-border-light); }

.slide--chapter{ display: flex; flex-direction: column; justify-content: center; }

.chapter-num{ font-family: var(--f-mono); font-size: var(--sz-label); letter-spacing: 0.2em; text-transform: uppercase; color: var(--c-accent); margin-bottom: var(--gap-md); }

.chapter-rule{ width: 36px; height: 1px; background: var(--c-accent); margin-bottom: var(--gap-md); }

.slide--statement .statement-body{ display: flex; flex-direction: column; justify-content: center; gap: var(--gap-md); }

.slide--split .slide-body{ display: grid; grid-template-columns: 1fr 1fr; gap: calc(var(--pad-x) * 0.7); align-items: center; }

@keyframes kFadeUp{ from{ opacity: 0; transform: translateY(28px); } to{ opacity: 1; transform: none; } }

@keyframes kFadeIn{ from{ opacity: 0; } to{ opacity: 1; } }

@keyframes kRevealRight{ from{ clip-path: inset(0 100% 0 0); opacity: 1; } to{ clip-path: inset(0 0% 0 0); opacity: 1; } }
```

## Motion And Effects
- CSS reveal vocabulary from source template: fade-up, fade-in, reveal-right, reveal-left, scale-in. In SlideLeaf, map these to data-reveal or CSS selectors under .slide.active; do not add a custom slide activator.
- Reusable keyframe names detected: kFadeUp, kFadeIn, kRevealRight, kRevealLeft, kScaleIn. Keep subtle entrance, rule-reveal, scale-in, glow, or float effects; avoid motion that competes with reading.
- Decorative effect classes worth preserving as CSS-only motifs: rule, chapter-rule, editorial-stamp.
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
<section class="slide style-template-signal" data-motion="progressive-reveal" data-visual="metric-system">
  <div class="slide-content">
    <p class="eyebrow">Signal</p>
    <h1>Signal gives serious arguments a distinctive editorial system</h1>
    <div class="card-grid">
      <article class="card" data-reveal>
        <h3>Visual thesis</h3>
        <p>Deep navy canvas with bone paper and a single muted-gold accent; institutional with quiet weight.</p>
      </article>
      <article class="card" data-reveal>
        <h3>Best use</h3>
        <p>Anything that should feel weighty, considered, and credibly institutional: investor decks, board presentations, consulting deliverables, legal / policy briefs, advisory pitches.</p>
      </article>
    </div>
  </div>
</section>
```

## QA Checklist
- The generated slide clearly belongs to Signal, not to a generic SlideLeaf default.
- The palette, typography, spacing, and decorative vocabulary remain internally consistent.
- The slide uses SlideLeaf fragment rules: one section.slide root, no script, no style tag, no remote assets.
- Renderer-owned navigation is not duplicated.
- Content density, formality, and tone match the user's brief and audience.
