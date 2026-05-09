---
id: progressive-reveal
category: motion-preset
title: Progressive Reveal
tags: progressive-reveal, narrative, build, summary, proof
motionPreset: progressive-reveal
sourceInfluences: Duarte sequential contrast, Apple purposeful motion
---
## When To Use
- Building a logic chain.
- Introducing three to five message blocks.
- Executive summary, product demo, or synthesis slide.

## When Not To Use
- Dense reference table.
- Slide where hidden content would confuse the audience.
- More than six reveal steps.

## Good Structure
- Mark reveal items with data-reveal.
- Reveal in natural reading order.
- Keep each reveal meaningful.
- End with all content visible.

## Anti Patterns
- Animating every tiny label.
- Reveal order that contradicts layout.
- Hiding axis labels or context until late.

## Evidence Requirements
- None beyond slide evidence.

## Suggested Visual Components
- message-stack
- proof-cards
- product-demo-flow
- executive-summary

## Example Markup
```html
<section class="slide" data-motion="progressive-reveal">
  <h1>Three proof points support the wedge</h1>
  <article data-reveal>Urgency</article>
  <article data-reveal>Budget</article>
  <article data-reveal>Competitive gap</article>
</section>
```

## QA Checklist
- Reveal count is under six.
- Reduced-motion displays all content.
- Sequence matches the narration.

