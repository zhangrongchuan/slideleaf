---
id: comparison-table
category: visual-pattern
title: Comparison Table
tags: comparison-table, scorecard, benchmark, options, vendor, competitor
motionPreset: focus-highlight
sourceInfluences: Stripe constrained UI, Primer table discipline, consulting scorecards
---
## When To Use
- Comparing options across consistent criteria.
- Showing vendor, competitor, feature, or segment differences.
- Supporting a recommendation with structured evaluation.

## When Not To Use
- More than six columns.
- Text-heavy feature dump.
- Precise time trend.

## Good Structure
- Put criteria in rows and options in columns or vice versa based on scanning width.
- Keep cells terse with status tokens, scores, or short labels.
- Highlight one row or option as the decision driver.
- Add source or assumption notes for scores.

## Anti Patterns
- Huge table screenshot.
- Checkmarks everywhere.
- Hidden scoring logic.
- Decorative color on every cell.

## Evidence Requirements
- Criteria definitions.
- Score basis.
- Source or assumption for each non-obvious claim.

## Suggested Visual Components
- comparison-table
- score-token
- selected-column
- criteria-legend

## Example Markup
```html
<section class="slide" data-motion="focus-highlight" data-visual="comparison-table">
  <p class="eyebrow">Option scorecard</p>
  <h1>Partner-led launch is slower but materially reduces execution risk</h1>
  <table class="comparison-table" aria-label="Launch option comparison"></table>
</section>
```

## QA Checklist
- Column count is readable.
- Highlight explains the recommendation.
- Criteria are not redundant.
- Scores do not imply false precision.

