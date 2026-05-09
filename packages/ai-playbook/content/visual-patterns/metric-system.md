---
id: metric-system
category: visual-pattern
title: Metric System
tags: metric-system, dashboard, kpi, board, qbr, operating
motionPreset: chart-build
sourceInfluences: IBM chart categories, Primer focused layout, Stripe constrained UI
---
## When To Use
- Board summary.
- QBR outcome page.
- Operating review where a small set of KPIs need interpretation.

## When Not To Use
- When metrics are not comparable or not defined.
- Dense dashboard screenshot.
- Narrative page with no numeric basis.

## Good Structure
- Use three to six metrics.
- Include value, direction, benchmark or target, and interpretation.
- Group metrics by decision or outcome.
- Highlight metric that changes the decision.

## Anti Patterns
- KPI wallpaper.
- Numbers without target or time window.
- Mixing lagging and leading indicators without labels.
- Color-coded status with no explanation.

## Evidence Requirements
- Metric definitions.
- Time window.
- Target, benchmark, or prior period.
- Data source.

## Suggested Visual Components
- metric-row
- delta-token
- target-line
- mini-sparkline
- status-band

## Example Markup
```html
<section class="slide" data-motion="chart-build" data-visual="metric-system">
  <p class="eyebrow">Operating health</p>
  <h1>Topline growth is healthy, but activation quality is now the constraint</h1>
  <div class="metric-row"></div>
</section>
```

## QA Checklist
- Every metric has a definition.
- Time windows are visible.
- The most important metric is prioritized.
- Status colors are accessible.

