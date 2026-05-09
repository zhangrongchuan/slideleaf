---
id: scenario
category: analysis-operator
title: Scenario
tags: scenario, sensitivity, downside, upside, uncertainty, forecast
motionPreset: progressive-reveal
sourceInfluences: board risk planning, consulting scenario planning, IBM comparison charts
---
## When To Use
- Stress-testing a plan under uncertainty.
- Showing base, upside, and downside cases.
- Preparing leadership for trigger-based decisions.

## When Not To Use
- When one path is already fixed and uncertainty is low.
- When the audience needs root cause diagnosis.
- When the model assumptions cannot be explained succinctly.

## Good Structure
- Define the uncertainty drivers.
- Show two to four scenarios.
- Make trigger conditions explicit.
- Tie each scenario to action or contingency.

## Anti Patterns
- Fake precision.
- Too many scenarios.
- Upside/downside without management action.
- No assumption table.

## Evidence Requirements
- Key assumptions.
- Range basis for uncertain variables.
- Trigger metric or threshold.
- Decision rule for each scenario.

## Suggested Visual Components
- scenario-table
- sensitivity-band
- decision-tree
- trigger-dashboard
- forecast-range

## Example Markup
```html
<section class="slide" data-motion="progressive-reveal" data-visual="scenario-table">
  <p class="eyebrow">Scenario planning</p>
  <h1>The plan is viable in base case, but hiring pace must flex if conversion lags</h1>
  <div class="scenario-table" data-reveal></div>
</section>
```

## QA Checklist
- Assumptions are visible.
- Scenarios are meaningfully different.
- Each scenario has an action.
- The audience can identify trigger points.

