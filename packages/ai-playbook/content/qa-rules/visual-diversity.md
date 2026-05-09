---
id: qa-visual-diversity
category: qa-rule
title: Visual Diversity QA
tags: qa, diversity, visual, repetition, layout, deckplan
motionPreset: static
sourceInfluences: FT visual vocabulary, IBM chart taxonomy, consulting deck pacing
---
## When To Use
- DeckPlan validation.
- Global deck QA.
- Any generation run with more than five slides.

## When Not To Use
- Single-slide generation.

## Good Structure
- Check repeated visual types, repeated page composition, and repeated analysis operators.
- Force slides to match their analytical role.
- Ensure bullet-only slides are rare and intentional.

## Anti Patterns
- Title plus bullets repeated across deck.
- Every analysis represented as cards.
- Visual variety without analytical reason.
- Changing style every slide.

## Evidence Requirements
- DeckPlan slide list.
- Visual type per slide.
- Analysis operator per slide.

## Suggested Visual Components
- deck-plan-audit
- visual-rhythm-map
- operator-distribution

## Example Markup
```html
<section class="slide" data-motion="static">
  <h1>QA rule: visual diversity must follow analytical diversity</h1>
</section>
```

## QA Checklist
- No more than two repeated visual types in a row.
- Bullet-only slides are limited.
- Visual type fits operator.
- Style remains coherent across variation.

