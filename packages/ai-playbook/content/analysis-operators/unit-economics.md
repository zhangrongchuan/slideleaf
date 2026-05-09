---
id: unit-economics
category: analysis-operator
title: Unit Economics
tags: unit-economics, cac, ltv, margin, payback, financial
motionPreset: chart-build
sourceInfluences: investor metrics, board variance analysis, IBM part-to-whole and comparison charts
---
## When To Use
- Explaining business model quality.
- Showing margin improvement, CAC payback, LTV, retention, or cohort economics.
- Investor or board proof page.

## When Not To Use
- When financial data is unavailable and cannot be labeled as assumption.
- Brand positioning deck.
- Technical architecture explanation.

## Good Structure
- Define the economic model.
- Show drivers of revenue, cost, retention, and payback.
- Highlight the driver that changes the investment decision.
- Label actuals versus assumptions.

## Anti Patterns
- Vanity revenue with no margin or retention.
- LTV:CAC without cohort or payback context.
- Hidden assumptions.
- Overly complex spreadsheet screenshot.

## Evidence Requirements
- Metric definitions.
- Cohort or time-window source.
- Cost allocation assumptions.
- Sensitivity or caveat if model is early.

## Suggested Visual Components
- unit-economics-stack
- waterfall
- cohort-table
- margin-bridge
- sensitivity-band

## Example Markup
```html
<section class="slide" data-motion="chart-build" data-visual="waterfall">
  <p class="eyebrow">Unit economics</p>
  <h1>Payback improves when onboarding labor is replaced by repeatable workflow data</h1>
  <div class="waterfall" data-chart-build></div>
</section>
```

## QA Checklist
- Actuals and assumptions are separated.
- Financial definitions are consistent.
- The visual shows drivers, not only outputs.
- No invented precision.

