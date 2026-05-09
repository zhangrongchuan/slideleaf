---
id: scientific-lab-report
category: style-direction
title: Scientific Lab Report
tags: scientific, lab, experiment, technical, evidence, research
motionPreset: chart-build
sourceInfluences: scientific posters, Tufte evidence density, Observable analysis notebooks
---
## When To Use
- Experiment results.
- Model evaluation or technical benchmark.
- Research or evidence-heavy product claim.

## When Not To Use
- Broad fundraising story.
- Brand keynote.
- Deck without actual experimental evidence.

## Good Structure
- Separate hypothesis, method, result, and implication.
- Use charts with clear sample, units, and caveats.
- Keep visual style clean and evidence-forward.
- Show uncertainty where appropriate.

## Anti Patterns
- Scientific styling without method.
- Overstating sample results.
- Tiny tables.
- Hiding negative results.

## Evidence Requirements
- Method and sample.
- Metric definitions.
- Baseline or control.
- Caveats and confidence limits if relevant.

## Suggested Visual Components
- experiment-card
- line-chart
- comparison-table
- confidence-band
- metric-system

## Example Markup
```html
<section class="slide style-lab-report" data-motion="chart-build">
  <p class="eyebrow">Experiment result</p>
  <h1>The new retrieval policy improves answer quality without increasing latency variance</h1>
  <div class="experiment-results"></div>
</section>
```

## QA Checklist
- Method is visible.
- Results and implications are separated.
- Uncertainty is not hidden.
- Chart labels are readable.

