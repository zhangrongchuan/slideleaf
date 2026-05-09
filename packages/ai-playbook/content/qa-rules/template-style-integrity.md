---
id: qa-template-style-integrity
category: qa-rule
title: Template Style Integrity QA
tags: qa, template, style-direction, beautiful-html-templates, visual-consistency, design-system, 三选一, 风格
motionPreset: static
sourceInfluences: beautiful-html-templates AGENTS.md, template adaptation workflow, SlideLeaf renderer constraints
---
## When To Use
- When choosing visual directions from a brief.
- When translating a full HTML template into SlideLeaf fragments.
- When regenerating or polishing slides after a template-like direction has been chosen.
- When the user asks for a polished, investor-grade, CEO-grade, or social-media-ready visual result.

## When Not To Use
- Never omit when a style-direction entry with id `template-*` has been selected.
- Do not use to justify copying a full template document, navigation runtime, or page-level JavaScript.

## Good Structure
- Treat the style direction as a closed visual system: fonts, palette, spacing, chrome, decoration, and component grammar move together.
- Pick three visually distinct candidates when the user has not chosen a direction yet: one close fit, one professional alternative, and one tasteful wildcard.
- Match first on mood, tone, formality, density, and audience; use industry/occasion as a secondary signal.
- Once chosen, extend missing layouts inside the same grammar instead of mixing templates.
- Convert source templates into SlideLeaf shape: `project.config.json` index, one `section.slide` per file, shared `themes/deck.css`, optional non-navigation `runtime/deck.js`.

## Anti Patterns
- Mixing slides from multiple template families.
- Recoloring or refonting a template until its identity disappears.
- Removing signature details such as mono labels, paper grain, poster chrome, geometric frames, zine marks, or editorial rules.
- Copying template-owned keyboard navigation, deck-stage code, or progress UI into SlideLeaf.
- Offering three visual directions that are basically the same palette and layout.

## Evidence Requirements
- Direction choice should cite the brief's audience, occasion, mood, density, and desired level of formality.
- For executive decks, prove that the chosen visual system can hold analytical density, charts, comparisons, and source notes.
- For expressive decks, prove that the style supports the requested emotional outcome without weakening credibility.

## Suggested Visual Components
- template-candidate-router
- style-system-checklist
- density-formality-fit
- visual-direction-preview
- consistency-polish-pass

## Example Markup
```html
<section class="slide" data-motion="static" data-visual="executive-summary">
  <div class="slide-content">
    <p class="eyebrow">Style system QA</p>
    <h1>The selected template must govern every slide, not just the cover</h1>
  </div>
</section>
```

## QA Checklist
- The deck has one clear template family or derived visual system.
- Typography, palette, chrome, and spacing are consistent across all slides.
- No duplicate navigation or per-slide scripts are present.
- The chosen direction fits the audience's expected formality and the deck's density.
- Any new layout looks like it naturally belongs between existing slides.
