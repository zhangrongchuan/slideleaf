---
id: risk
category: analysis-operator
title: Risk
tags: risk, mitigation, likelihood, impact, decision, governance
motionPreset: focus-highlight
sourceInfluences: board governance updates, consulting risk matrices, Apple motion restraint
---
## When To Use
- Showing downside and mitigations.
- Preparing an executive or board decision.
- Stress-testing execution plan or investment thesis.

## When Not To Use
- Opening slide unless the deck is a risk review.
- Pure inspiration or brand narrative.
- Situations where every listed risk is minor.

## Good Structure
- Identify top risks, not every possible concern.
- Assess likelihood, impact, velocity, and controllability.
- Attach mitigation, owner, and trigger.
- Separate residual risk after mitigation.

## Anti Patterns
- Laundry list of fears.
- Risks without owners.
- Mitigation that repeats the risk.
- Treating compliance, adoption, and execution risks identically.

## Evidence Requirements
- Risk basis.
- Impact estimate or qualitative rationale.
- Mitigation owner.
- Trigger threshold or monitoring cadence.

## Suggested Visual Components
- risk-matrix
- risk-register
- mitigation-table
- trigger-map
- residual-risk-bar

## Example Markup
```html
<section class="slide" data-motion="focus-highlight" data-visual="risk-matrix">
  <p class="eyebrow">Risk assessment</p>
  <h1>The highest risk is adoption velocity, not technical feasibility</h1>
  <div class="risk-matrix" data-reveal></div>
</section>
```

## QA Checklist
- Top risks are prioritized.
- Mitigations are specific.
- Residual risk is clear.
- Risk language does not undermine the core recommendation unnecessarily.

