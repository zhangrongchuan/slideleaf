---
id: chart-build
category: motion-preset
title: Chart Build
tags: chart-build, data, line-chart, bar-chart, waterfall, metrics
motionPreset: chart-build
sourceInfluences: D3 transitions, Observable chart grammar, Material duration and easing
---
## When To Use
- Building a chart so the audience understands axes, then signal, then implication.
- Trend, waterfall, metric-system, or unit-economics slide.
- Data reveal where the final chart must remain readable.

## When Not To Use
- Static reference table.
- Chart with many series.
- When animation would imply data changing over time incorrectly.

## Good Structure
- Show axes and labels first.
- Build primary marks.
- Add annotation or highlight last.
- Keep duration short and restrained.

## Anti Patterns
- Animated decoration unrelated to data.
- Lines drawing without labels.
- Too many simultaneous transitions.

## Evidence Requirements
- Chart data source.
- Axis units.
- Annotation basis.

## Suggested Visual Components
- line-chart
- waterfall
- metric-sparkline
- grouped-bar

## Example Markup
```html
<section class="slide" data-motion="chart-build" data-visual="line-chart">
  <h1>The inflection happened after procurement budgets opened</h1>
  <div class="chart" data-chart-build></div>
</section>
```

## QA Checklist
- Final state is complete and readable.
- Animation does not distort data meaning.
- Reduced-motion skips transition but shows chart.

