---
id: focus-highlight
category: motion-preset
title: Focus Highlight
tags: focus-highlight, decision, table, scorecard, risk, comparison
motionPreset: focus-highlight
sourceInfluences: Apple focus motion, consulting scorecards, Stripe restrained emphasis
---
## When To Use
- Directing attention to a row, column, dot, risk, or option.
- Comparison table or risk matrix.
- Slide with dense context and one decisive element.

## When Not To Use
- Page has no clear primary element.
- Many elements need equal attention.
- Highlight would overstate uncertain evidence.

## Good Structure
- Show full context first.
- Highlight only the decisive element.
- Add callout that explains why it matters.

## Anti Patterns
- Multiple competing highlights.
- Pulsing or excessive glow.
- Highlighting decoration instead of evidence.

## Evidence Requirements
- Reason the highlighted element matters.
- Basis for relative ranking or risk.

## Suggested Visual Components
- comparison-table
- risk-matrix
- option-scorecard
- decision-callout

## Example Markup
```html
<section class="slide" data-motion="focus-highlight" data-visual="comparison-table">
  <h1>Option B is the only path that preserves speed and control</h1>
  <table class="comparison-table"></table>
</section>
```

## QA Checklist
- Only one primary highlight.
- Highlight is readable in grayscale.
- Reduced-motion still shows emphasis through styling.

