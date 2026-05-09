---
id: qa-evidence-integrity
category: qa-rule
title: Evidence Integrity QA
tags: qa, evidence, claims, data, sources, hallucination
motionPreset: static
sourceInfluences: Tufte evidence discipline, Datawrapper chart literacy, scientific lab report standards
---
## When To Use
- Any slide with metrics, market claims, financial claims, customer evidence, or architecture claims.
- Provider retry pass after malformed or unsupported output.

## When Not To Use
- Pure section divider with no claims.

## Good Structure
- Classify each claim as sourced, assumed, inferred, or placeholder.
- Prefer fewer, stronger claims over many weak ones.
- Attach time window, denominator, and unit to data.

## Anti Patterns
- Invented percentages.
- Market sizing without source.
- Customer quote without context.
- Technical performance claim without benchmark or assumption.

## Evidence Requirements
- Source name or placeholder.
- Metric definition.
- Assumption label.
- Caveat when inference is being made.

## Suggested Visual Components
- evidence-footnote
- source-strip
- assumption-label
- caveat-callout

## Example Markup
```html
<section class="slide" data-motion="static">
  <h1>QA rule: unsupported claims must be downgraded to hypotheses or placeholders</h1>
</section>
```

## QA Checklist
- No unsourced metrics.
- Assumptions are visible.
- Caveats are attached to claims, not buried.
- Evidence matches the slide question.

