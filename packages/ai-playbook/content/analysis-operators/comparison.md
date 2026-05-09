---
id: comparison
category: analysis-operator
title: Comparison
tags: comparison, competitor, benchmark, tradeoff, option, scorecard
motionPreset: focus-highlight
sourceInfluences: IBM comparison charts, consulting option scorecards, Datawrapper bar and table patterns
---
## When To Use
- Choosing between strategic options.
- Showing competitive whitespace.
- Benchmarking products, segments, geographies, vendors, or operating models.

## When Not To Use
- Explaining a causal chain.
- Showing a time-series inflection.
- Presenting a single recommendation with no meaningful alternative.

## Good Structure
- Define evaluation criteria before showing the table or matrix.
- Compare two to five options in the main flow.
- Highlight the implication or winner directly in the visual.
- Keep criteria parallel and decision-relevant.

## Anti Patterns
- Too many columns.
- Criteria that are vague or overlapping.
- Green-check decoration with no basis.
- All options appear equally good.

## Evidence Requirements
- Comparable metric or qualitative basis for each criterion.
- Source or assumption for rankings.
- Tie-breaker criterion if options are close.

## Suggested Visual Components
- 2x2-matrix
- comparison-table
- option-scorecard
- grouped-bar
- benchmark-strip

## Example Markup
```html
<section class="slide" data-motion="focus-highlight" data-visual="comparison-table">
  <p class="eyebrow">Option comparison</p>
  <h1>Option B wins on speed without giving up control</h1>
  <table class="comparison-table" data-reveal></table>
</section>
```

## QA Checklist
- Criteria are explicit.
- Winner or implication is visible.
- Rankings are supported.
- Table density is readable at 16:9.

