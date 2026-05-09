---
id: product-strategy
category: deck-archetype
title: Product Strategy
tags: product, strategy, roadmap, users, differentiation, prioritization
motionPreset: roadmap-build
sourceInfluences: Primer product foundations, Stripe app design constraints, Duarte audience stakes
---
## When To Use
- Product direction review.
- Roadmap prioritization discussion.
- Executive alignment around where product effort should concentrate.

## When Not To Use
- Sprint planning detail.
- Pure engineering architecture review.
- Brand campaign deck.

## Good Structure
- State the user problem and business objective.
- Segment users by job-to-be-done, frequency, pain, and willingness to switch.
- Connect product bets to evidence, differentiation, and operating constraints.
- Show roadmap as a learning sequence, not a task calendar.

## Anti Patterns
- Feature list without strategy.
- Personas that do not affect roadmap choices.
- Roadmap wallpaper with too many small tasks.
- Confusing design polish with product differentiation.

## Evidence Requirements
- User research or usage data.
- Adoption, retention, activation, or revenue metric.
- Prioritization criteria.
- Dependency or feasibility notes.

## Suggested Visual Components
- user-segment-map
- product-principles-stack
- opportunity-solution-tree
- priority-matrix
- roadmap

## Example Markup
```html
<section class="slide" data-motion="roadmap-build" data-visual="roadmap">
  <p class="eyebrow">Product strategy</p>
  <h1>The roadmap should sequence proof of habit before breadth of features</h1>
  <ol class="roadmap">
    <li data-reveal>Activation proof</li>
    <li data-reveal>Workflow depth</li>
    <li data-reveal>Expansion loops</li>
  </ol>
</section>
```

## QA Checklist
- Strategy is a choice, not a catalog.
- User evidence is connected to roadmap priority.
- Every roadmap phase has a learning goal or business outcome.
- Differentiation is concrete.

