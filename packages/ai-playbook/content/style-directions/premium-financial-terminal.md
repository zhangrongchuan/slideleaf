---
id: premium-financial-terminal
category: style-direction
title: Premium Financial Terminal
tags: financial, premium, terminal, metrics, investor, data
motionPreset: chart-build
sourceInfluences: financial dashboards, FT visual vocabulary, Tufte compact data design
---
## When To Use
- Investor, board, financial, or market analysis deck.
- Metric-heavy slides where sophistication comes from precision.
- Technical-financial topic such as unit economics or market signals.

## When Not To Use
- Warm customer story deck.
- Consumer brand narrative.
- Slide where human imagery is central.

## Good Structure
- Use compact metrics, thin rules, muted dark or light surfaces, and precise labels.
- Make data tables and charts feel intentional, not dashboard dumps.
- Use one or two status colors and clear source notes.

## Anti Patterns
- Fake Bloomberg terminal aesthetic.
- Neon green everywhere.
- Small illegible numbers.
- Too many metrics without a title-level implication.

## Evidence Requirements
- Metric definitions.
- Source and time window on all financial visuals.

## Suggested Visual Components
- metric-system
- waterfall
- unit-economics-stack
- metric-sparkline
- comparison-table

## Example Markup
```html
<section class="slide style-financial-terminal" data-motion="chart-build">
  <p class="eyebrow">Financial signal</p>
  <h1>Margin expansion depends more on service mix than raw volume growth</h1>
  <div class="terminal-grid"></div>
</section>
```

## QA Checklist
- Metrics are legible.
- Data density has hierarchy.
- Visual style does not imply unsourced precision.
- Palette is controlled.

