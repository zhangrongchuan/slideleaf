---
id: qa-ceo-decision-grade
category: qa-rule
title: CEO Decision-grade QA
tags: qa, ceo, decision, strategy, executive, tradeoff
motionPreset: static
sourceInfluences: Pyramid Principle, consulting decision memos, board governance clarity
---
## When To Use
- Strategy review.
- CEO operating review.
- Recommendation or option selection deck.

## When Not To Use
- Decorative marketing deck with no decision.

## Good Structure
- Confirm the deck states the decision, recommendation, tradeoffs, and next action.
- Ensure options are not presented as equal if the analysis recommends one.
- Make constraints and risks explicit.

## Anti Patterns
- Balanced summary with no judgment.
- Hiding the ask.
- Confusing information update with decision support.
- Recommendation not tied to resources.

## Evidence Requirements
- Decision criteria.
- Option evidence.
- Risk and mitigation basis.
- Resource implication.

## Suggested Visual Components
- decision-callout
- option-scorecard
- risk-matrix
- roadmap

## Example Markup
```html
<section class="slide" data-motion="static">
  <h1>QA rule: the CEO should know what decision is required by slide one</h1>
</section>
```

## QA Checklist
- Decision is explicit.
- Recommendation is visible.
- Tradeoffs are named.
- Next action has owner or owner placeholder.

