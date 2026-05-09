---
id: segmentation
category: analysis-operator
title: Segmentation
tags: segmentation, customer, market, wedge, priority, personas
motionPreset: matrix-positioning
sourceInfluences: consulting market segmentation, IBM comparison charts, Duarte audience relevance
---
## When To Use
- Selecting a target segment.
- Explaining heterogeneous customer needs.
- Prioritizing a go-to-market wedge.
- Showing why one segment should come before another.

## When Not To Use
- When the audience only needs a single aggregate metric.
- When segments are invented for narrative flavor.
- When there is no decision tied to segment selection.

## Good Structure
- Define the segmentation basis.
- Compare attractiveness, urgency, willingness to pay, accessibility, and fit.
- Name the target segment.
- State what will not be pursued first.

## Anti Patterns
- Persona theater.
- Segments without criteria.
- All segments treated equally.
- Confusing channel, use case, and buyer type.

## Evidence Requirements
- Segment definitions.
- Need intensity or pain evidence.
- Willingness-to-pay or strategic fit signal.
- Segment size or reachable account count.

## Suggested Visual Components
- 2x2-matrix
- segment-scorecard
- market-map
- comparison-table
- priority-stack

## Example Markup
```html
<section class="slide" data-motion="matrix-positioning" data-visual="2x2-matrix">
  <p class="eyebrow">Target segment</p>
  <h1>Premium fleet operators combine urgency with high willingness to pay</h1>
  <div class="matrix" data-reveal></div>
</section>
```

## QA Checklist
- Target choice is justified.
- Axes are decision-relevant.
- No duplicate segments.
- The slide names the segment to deprioritize.

