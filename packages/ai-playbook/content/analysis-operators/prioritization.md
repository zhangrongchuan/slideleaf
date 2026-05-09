---
id: prioritization
category: analysis-operator
title: Prioritization
tags: prioritization, ranking, tradeoff, scorecard, impact, effort
motionPreset: focus-highlight
sourceInfluences: consulting option scorecards, product strategy prioritization, Primer focused layout
---
## When To Use
- Selecting what to do first.
- Ranking opportunities, risks, roadmap items, markets, or accounts.
- Turning analysis into a resource allocation decision.

## When Not To Use
- When all items are mandatory compliance requirements.
- When the decision criteria are not agreed.
- When precise sequencing is more important than priority.

## Good Structure
- Define criteria and weights.
- Show a short list of candidates.
- Highlight top tier and deprioritized items.
- Explain the resource implication.

## Anti Patterns
- Impact-effort theater with no evidence.
- Ranking too many items.
- Criteria that overlap.
- No explicit tradeoff.

## Evidence Requirements
- Criteria definitions.
- Score basis.
- Constraints such as time, budget, talent, or dependency.
- Sensitivity note if rankings are close.

## Suggested Visual Components
- priority-matrix
- weighted-scorecard
- rank-ladder
- impact-effort-map
- decision-stack

## Example Markup
```html
<section class="slide" data-motion="focus-highlight" data-visual="priority-matrix">
  <p class="eyebrow">Prioritization</p>
  <h1>The top two bets create 70% of near-term value with half the execution risk</h1>
  <div class="priority-matrix" data-reveal></div>
</section>
```

## QA Checklist
- Criteria are named and non-overlapping.
- The priority choice is visible.
- Deprioritized items are not silently ignored.
- The recommendation maps to resources.

