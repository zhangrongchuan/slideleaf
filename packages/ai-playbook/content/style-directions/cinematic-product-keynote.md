---
id: cinematic-product-keynote
category: style-direction
title: Cinematic Product Keynote
tags: cinematic, product, keynote, launch, visual, premium
motionPreset: progressive-reveal
sourceInfluences: Apple keynote restraint, Duarte contrast, Stripe product clarity
---
## When To Use
- Product launch or high-stakes demo deck.
- Founder pitch where product experience is the differentiator.
- Visual narrative with strong product screenshots or generated imagery.

## When Not To Use
- Board appendix.
- Dense financial analysis.
- Deck with no product or image assets.

## Good Structure
- Use full-bleed or strong product visuals only when they reveal the actual product.
- Keep text minimal and large.
- Use motion to reveal product value, not decorate.
- Move analytical proof into later structured slides.

## Anti Patterns
- Dark blurred stock background.
- Hero text inside cards.
- Vague atmospheric imagery.
- Product screenshots too small to inspect.

## Evidence Requirements
- Product image or screenshot source.
- Clear user outcome evidence if making performance claims.

## Suggested Visual Components
- product-demo-flow
- before-after-flow
- narrative-timeline
- proof-card-stack

## Example Markup
```html
<section class="slide style-cinematic-product" data-motion="progressive-reveal" data-visual="product-demo-flow">
  <p class="eyebrow">Product moment</p>
  <h1>The workflow collapses handoff time at the point of decision</h1>
  <figure class="product-stage"></figure>
</section>
```

## QA Checklist
- Primary visual reveals the product.
- Text does not sit inside a card.
- Motion remains subtle.
- The slide still works if assets are placeholders.

