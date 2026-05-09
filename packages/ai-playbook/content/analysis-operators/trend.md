---
id: trend
category: analysis-operator
title: Trend
tags: trend, line-chart, growth, time-series, inflection, timing
motionPreset: chart-build
sourceInfluences: IBM trend charts, Datawrapper line chart guidance, Observable layered marks
---
## When To Use
- Showing change over time.
- Proving acceleration, slowdown, seasonality, or inflection.
- Establishing why timing matters now.

## When Not To Use
- Comparing unrelated static options.
- Showing precise composition of a whole.
- A slide with only one current metric and no time dimension.

## Good Structure
- Name the time window and unit.
- Show one dominant trend or inflection.
- Annotate the event or driver behind the change.
- End with the implication for the decision.

## Anti Patterns
- Cherry-picked start or end date.
- Decorative line chart with no axis logic.
- Too many series.
- No explanation of anomaly.

## Evidence Requirements
- Time-series source.
- Definition of metric and time interval.
- Caveats for anomalies, cohort changes, or data gaps.

## Suggested Visual Components
- line-chart
- area-chart
- slope-chart
- timeline
- metric-sparkline

## Example Markup
```html
<section class="slide" data-motion="chart-build" data-visual="line-chart">
  <p class="eyebrow">Market timing</p>
  <h1>Adoption crossed from experimentation to budgeted deployment in 2026</h1>
  <div class="chart line-chart" data-chart-build></div>
</section>
```

## QA Checklist
- Axis labels are readable.
- The inflection or trend is annotated.
- Caveats are not hidden.
- The title states the implication.

