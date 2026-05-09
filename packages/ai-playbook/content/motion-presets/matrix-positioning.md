---
id: matrix-positioning
category: motion-preset
title: Matrix Positioning
tags: matrix-positioning, 2x2-matrix, segmentation, competitor, whitespace
motionPreset: matrix-positioning
sourceInfluences: consulting matrix storytelling, Material easing, Swiss grid discipline
---
## When To Use
- 2x2 matrix or positioning map.
- Segment, competitor, portfolio, or whitespace analysis.
- Slide where placement is the argument.

## When Not To Use
- Table comparison.
- Precise scatterplot with many points.
- Axes are not defined.

## Good Structure
- Render axes first.
- Place neutral items.
- Place target item last with highlight.
- Add quadrant implication after positions are visible.

## Anti Patterns
- Flying dots with no axis context.
- Target highlighted before the map is understood.
- Too many points.

## Evidence Requirements
- Axis definitions.
- Placement basis.
- Highlight rationale.

## Suggested Visual Components
- 2x2-matrix
- competitor-map
- segment-priority-matrix

## Example Markup
```html
<section class="slide" data-motion="matrix-positioning" data-visual="2x2-matrix">
  <h1>The target segment is attractive because urgency and fit move together</h1>
  <div class="matrix"></div>
</section>
```

## QA Checklist
- Axes appear before points.
- Target placement is last or most prominent.
- Reduced-motion shows final matrix.

