---
id: ceo-strategy-review
category: deck-archetype
title: CEO Strategy Review
tags: ceo, strategy, executive, decision, operating-model, tradeoff
motionPreset: focus-highlight
sourceInfluences: Pyramid Principle, Duarte 3-act business communication, Primer focused layout
---
## When To Use
- Executive decision memo where leadership must choose a path.
- Quarterly or annual strategy review that needs diagnosis, options, and recommendation.
- CEO staff meeting deck with explicit resource tradeoffs.

## When Not To Use
- Broad awareness presentation with no decision.
- Brand keynote where persuasion is emotional rather than analytical.
- Detailed project status readout better handled as an operating dashboard.

## Good Structure
- State the decision required in the opening slide.
- Separate current state, strategic diagnosis, options, recommendation, execution path, and risks.
- Show tradeoffs visibly instead of pretending every option is equal.
- Use action titles that read as conclusions in a skim.

## Anti Patterns
- Balanced but noncommittal option summaries.
- Hiding the recommendation until the end when the audience expects answer-first.
- Mixing facts, opinions, and asks in the same visual block.
- Too many equal-weight metrics with no judgment.

## Evidence Requirements
- Baseline operating metrics.
- Decision criteria with priority order.
- Option impact estimates or qualitative rationale.
- Named constraints such as budget, talent, time, regulatory, or technical readiness.

## Suggested Visual Components
- executive-summary
- option-scorecard
- constraint-map
- risk-matrix
- decision-roadmap

## Example Markup
```html
<section class="slide" data-motion="focus-highlight" data-visual="option-scorecard">
  <p class="eyebrow">Decision required</p>
  <h1>The choice is not whether to expand, but which constraint to relax first</h1>
  <div class="scorecard" data-reveal>
    <div>Speed</div><div>Control</div><div>Capital intensity</div>
  </div>
</section>
```

## QA Checklist
- Recommendation is explicit before supporting details.
- Tradeoffs are named, not implied.
- The deck distinguishes what is known, assumed, and requested.
- Each slide can be read in boardroom skim mode.

