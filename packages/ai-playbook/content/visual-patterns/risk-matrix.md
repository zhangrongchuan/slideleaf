---
id: risk-matrix
category: visual-pattern
title: Risk Matrix
tags: risk-matrix, risk, mitigation, likelihood, impact, governance
motionPreset: focus-highlight
sourceInfluences: board risk registers, consulting risk assessment, Apple motion restraint
---
## When To Use
- Prioritizing execution, market, operational, or technical risks.
- Showing board-level risk movement.
- Linking top risks to mitigations.

## When Not To Use
- Low-stakes issue list.
- Risks that cannot be compared by likelihood and impact.
- Opening slide unless risk is the topic.

## Good Structure
- Use likelihood and impact axes.
- Plot only material risks.
- Highlight top risk and mitigation.
- Add residual risk or trigger if space allows.

## Anti Patterns
- Every risk in the red zone.
- Vague risk names.
- No mitigation owner.
- Excessive color saturation that creates alarm.

## Evidence Requirements
- Basis for likelihood and impact.
- Mitigation owner.
- Trigger condition.
- Residual risk note.

## Suggested Visual Components
- risk-matrix
- risk-dot
- mitigation-callout
- trigger-label

## Example Markup
```html
<section class="slide" data-motion="focus-highlight" data-visual="risk-matrix">
  <p class="eyebrow">Risk review</p>
  <h1>Adoption velocity is the only high-impact risk without a proven control yet</h1>
  <div class="risk-matrix"></div>
</section>
```

## QA Checklist
- Top risk is visible.
- Mitigation is specific.
- Color does not overwhelm the deck style.
- Axes are defined.

