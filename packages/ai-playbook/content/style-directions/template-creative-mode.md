---
id: template-creative-mode
category: style-direction
title: Template Style - Creative Mode
tags: template, beautiful-html-templates, creative-mode, light, medium, medium-high, creative, confident, playful, design-led, graphic, expressive, modern, creative agency pitch, design studio deck, ad shop credentials, brand creative review, concept presentation, 投资人, 融资, 路演, 创业, 技术, 开发者, 产品, SaaS, 研究, 报告, 学术, 白皮书, 品牌, 创意, 设计, 编辑感, 温暖, 活泼, 社区, 工作坊, 暗色, 高级, 科技感
motionPreset: progressive-reveal
sourceInfluences: beautiful-html-templates/creative-mode, Archivo Black, Space Grotesk, JetBrains Mono
---
## When To Use
- Anything that should feel design-led and confident: creative agency pitches, design studio decks, ad shop credentials, brand creative reviews, art-direction reviews. Also a great unexpected pick for a tech talk, research findings, or finance review when the speaker wants to lead with taste rather than convention.
- Use when the requested mood overlaps with: creative, confident, playful, design-led.
- Use when the occasion is close to: creative agency pitch, design studio deck, ad shop credentials, brand creative review, concept presentation.
- Good fit for medium formality, medium-high density, and a light color scheme.

## When Not To Use
- Contexts that demand institutional restraint and a quiet authority — the saturated multi-accent palette will read as expressive, not formal.
- Do not use when the audience expects a materially different formality level or content density.
- Do not use if the deck needs a conflicting visual language; pick a different template direction instead.

## Good Structure
- Visual thesis: Cream paper canvas with confident multi-color (green, pink, orange, yellow) accents and Archivo Black display.
- Palette discipline: cream: #EFE9D9; cream_2: #E4DCC4; green: #1F8A4C; pink: #F06CA8; orange: #E85A1F; yellow: #F5C518; ink: #0F0F0F; description: warm cream paper background with a saturated multi-accent palette (forest green, hot pink, orange, mustard yellow) on ink-black structure
- Typography discipline: display: Archivo Black; body: Space Grotesk; mono: JetBrains Mono; style: ultra-heavy poster sans + clean grotesk + technical mono
- Layout grammar: tagline, footnote, kicker, body-col, body, grid, tag, note, flow, table.
- Slide grammar: s1, s2, s3, s4, s5, s6, s7, s8.
- Convert the original full-template system into SlideLeaf fragments: one section.slide per file, shared CSS in themes/deck.css, and no project-level navigation code inside slide fragments.
- Extend missing layouts by reusing the same fonts, palette, spacing rhythm, decorative vocabulary, and component grammar.

## CSS Tokens
```css
.style-template-creative-mode {
--cream: #EFE9D9;
--cream-2: #E4DCC4;
--green: #1F8A4C;
--green-dark: #136636;
--pink: #F06CA8;
--pink-dark: #D14E8B;
--orange: #E85A1F;
--yellow: #F5C518;
--ink: #0F0F0F;
--ink-2: #2A2A2A;
--rule: #0F0F0F;
--template-cream: #EFE9D9;
--template-cream-2: #E4DCC4;
--template-green: #1F8A4C;
--template-pink: #F06CA8;
--template-orange: #E85A1F;
--template-yellow: #F5C518;
--template-ink: #0F0F0F;
--template-font-display: "Archivo Black", system-ui, sans-serif;
--template-font-body: "Space Grotesk", system-ui, sans-serif;
--template-font-mono: "JetBrains Mono", system-ui, sans-serif;
}
```

## Core CSS Grammar
```css
.body{ font-family:"Space Grotesk", sans-serif; }

.s1 .title{ position:absolute; left:96px; top:50%; transform:translateY(-50%); font-size:160px; color:var(--ink); width:900px; }

.s1 .title .row{ display:block; }

.s1 .poster{ position:absolute; right:96px; top:140px; bottom:140px; width:760px; background:var(--green); border:4px solid var(--ink); display:flex; align-items:center; justify-content:center; }

.s1 .poster .switch{ position:relative; width:380px; height:380px; background:var(--pink); border:4px solid var(--ink); box-shadow: 24px 24px 0 var(--orange), 24px 24px 0 4px var(--ink); }

.s1 .poster .switch .lever{ position:absolute; top:64px; left:64px; width:240px; height:170px; background:#FBD0E3; border:4px solid var(--ink); transform: skewY(-8deg); }

.s1 .poster .switch .lever:after{ content:""; position:absolute; left:0; right:0; bottom:-30px; height:30px; background:var(--pink-dark); border:4px solid var(--ink); border-top:0; }

.s1 .poster .switch .label-on{ position:absolute; top:78px; right:60px; font-family:"Archivo Black"; font-size:32px; color:var(--ink); }

.s1 .poster .switch .label-off{ position:absolute; bottom:48px; left:0; right:0; text-align:center; font-family:"Archivo Black"; font-size:32px; color:var(--ink); }

.s1 .tagline{ position:absolute; left:96px; top:160px; font-family:"JetBrains Mono", monospace; font-size:24px; letter-spacing:.16em; text-transform:uppercase; color:var(--ink); }

.s1 .tagline span{ display:inline-block; width:60px; height:3px; background:var(--ink); vertical-align:middle; margin-right:18px; transform:translateY(-3px); }

.s1 .footnote{ position:absolute; left:96px; bottom:140px; font-family:"Space Grotesk", sans-serif; font-size:24px; color:var(--ink-2); max-width:640px; line-height:1.4; }

.s2 .kicker{ position:absolute; left:96px; top:200px; font-family:"JetBrains Mono", monospace; font-size:24px; letter-spacing:.14em; text-transform:uppercase; background:var(--ink); color:var(--cream); padding:8px 16px; display:inline-block; white-space:nowrap; }

.s2 .h{ position:absolute; left:96px; top:300px; right:1000px; font-size:140px; line-height:.92; color:var(--ink); }

.s2 .body-col{ position:absolute; left:1020px; top:300px; right:480px; font-size:28px; line-height:1.4; color:var(--ink-2); }

.s2 .body-col p + p{ margin-top:24px; }

.s2 .body-col p:first-child{ margin-top:0; }

.s2 .marker{ position:absolute; left:96px; bottom:160px; width:560px; height:120px; background:var(--pink); border:4px solid var(--ink); display:flex; align-items:center; justify-content:center; font-family:"Archivo Black"; font-size:46px; }
```

## Motion And Effects
- Decorative effect classes worth preserving as CSS-only motifs: stamp.
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
- Match density to evidence: medium-high density means proof blocks should be balanced, with enough supporting detail to avoid empty cards.
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
<section class="slide style-template-creative-mode" data-motion="progressive-reveal" data-visual="comparison-table">
  <div class="slide-content">
    <p class="eyebrow">Creative Mode</p>
    <h1>Creative Mode gives serious arguments a distinctive editorial system</h1>
    <div class="card-grid">
      <article class="card" data-reveal>
        <h3>Visual thesis</h3>
        <p>Cream paper canvas with confident multi-color (green, pink, orange, yellow) accents and Archivo Black display.</p>
      </article>
      <article class="card" data-reveal>
        <h3>Best use</h3>
        <p>Anything that should feel design-led and confident: creative agency pitches, design studio decks, ad shop credentials, brand creative reviews, art-direction reviews.</p>
      </article>
    </div>
  </div>
</section>
```

## QA Checklist
- The generated slide clearly belongs to Creative Mode, not to a generic SlideLeaf default.
- The palette, typography, spacing, and decorative vocabulary remain internally consistent.
- The slide uses SlideLeaf fragment rules: one section.slide root, no script, no style tag, no remote assets.
- Renderer-owned navigation is not duplicated.
- Content density, formality, and tone match the user's brief and audience.
