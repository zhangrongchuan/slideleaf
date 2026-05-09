---
id: editorial-mono-intelligence
category: style-direction
title: Editorial Mono Intelligence
tags: editorial, mono, intelligence, research, data, premium
motionPreset: progressive-reveal
sourceInfluences: Financial Times visual storytelling, Tufte annotation discipline, Observable notebooks
---
## When To Use
- Research-backed market analysis.
- Data journalism style investor or strategy deck.
- Technical topic that benefits from annotation and footnote discipline.

## When Not To Use
- Consumer lifestyle brand.
- Sales pitch requiring warm imagery.
- Extremely dense board appendix.

## Good Structure
- Pair confident serif or clean sans titles with monospaced labels and source notes.
- Use annotations directly on charts.
- Keep palette warm-neutral plus one sharp accent.
- Make source labels visible but quiet.

## Anti Patterns
- Faux newspaper clutter.
- Too many annotations.
- Monospace body copy everywhere.
- Tiny chart labels.

## Evidence Requirements
- Source labels on all charts.
- Clear definitions for metrics and units.

## Suggested Visual Components
- annotated-line-chart
- metric-sparkline
- market-map
- narrative-timeline

## Example Markup
```html
<section class="slide style-editorial-mono" data-motion="chart-build">
  <p class="eyebrow">Market signal</p>
  <h1>Budget adoption accelerated after category language stabilized</h1>
  <div class="annotated-chart"></div>
</section>
```

## QA Checklist
- Annotations clarify, not clutter.
- Sources are visible.
- Typography contrast feels intentional.
- Chart remains the main evidence.

