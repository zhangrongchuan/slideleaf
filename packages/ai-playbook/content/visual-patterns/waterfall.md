---
id: waterfall
category: visual-pattern
title: Waterfall
tags: waterfall, bridge, variance, financial, margin, drivers
motionPreset: chart-build
sourceInfluences: IBM comparison and part-to-whole charts, board variance analysis, Tufte data-ink
---
## When To Use
- Explaining bridge from baseline to outcome.
- Showing variance drivers.
- Breaking revenue, margin, cost, or forecast movement into contributions.

## When Not To Use
- More than eight drivers.
- Drivers are not additive.
- Audience needs trend over time rather than bridge.

## Good Structure
- Start with baseline and end with outcome.
- Order drivers by sequence or magnitude.
- Highlight largest controllable driver.
- Use labels on bars, not a separate legend if possible.

## Anti Patterns
- Confusing positive and negative directions.
- Too many tiny bars.
- No total.
- Decorative 3D or heavy gridlines.

## Evidence Requirements
- Baseline and ending value.
- Calculation basis for each driver.
- Notes for estimates or allocations.

## Suggested Visual Components
- waterfall-chart
- variance-callout
- driver-label
- total-bar

## Example Markup
```html
<section class="slide" data-motion="chart-build" data-visual="waterfall">
  <p class="eyebrow">Margin bridge</p>
  <h1>Service mix explains most of the margin gap and is controllable next quarter</h1>
  <div class="waterfall" data-chart-build></div>
</section>
```

## QA Checklist
- Positive and negative drivers are clear.
- Largest driver is identified.
- Totals reconcile.
- Text labels remain legible.

