---
id: metric-sparkline
category: visual-pattern
title: Metric Sparkline
tags: sparkline, metric, trend, compact, dashboard, qbr
motionPreset: chart-build
sourceInfluences: Duarte sparkline concept, Tufte small multiples, Observable line marks
---
## When To Use
- Compact trend next to a metric.
- Executive summary with multiple KPIs.
- Showing direction without requiring full chart treatment.

## When Not To Use
- When exact values are central.
- When trend needs annotations.
- When the metric has no time window.

## Good Structure
- Pair one value with one compact trend.
- Use clear delta and time window.
- Keep axes minimal but not misleading.
- Use sparklines as support, not decoration.

## Anti Patterns
- Tiny unlabeled lines.
- Multiple colors without meaning.
- Sparklines replacing a chart that needs detail.
- No baseline or period label.

## Evidence Requirements
- Time window.
- Metric definition.
- Prior period or target.

## Suggested Visual Components
- metric-card
- sparkline
- delta-token
- target-dot

## Example Markup
```html
<section class="slide" data-motion="chart-build" data-visual="metric-sparkline">
  <p class="eyebrow">Metric trend</p>
  <h1>Activation recovered only after setup friction was removed</h1>
  <div class="metric-row">
    <article><strong>42%</strong><span>Activation, last 12 weeks</span><div class="sparkline"></div></article>
  </div>
</section>
```

## QA Checklist
- The sparkline has a time window.
- It supports, not replaces, the main message.
- Direction is visually clear.
- No false precision.

