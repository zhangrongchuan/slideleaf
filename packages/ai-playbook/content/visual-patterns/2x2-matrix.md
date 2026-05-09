---
id: 2x2-matrix
category: visual-pattern
title: 2x2 Matrix
tags: 2x2-matrix, quadrant, segmentation, competitor, priority, whitespace
motionPreset: matrix-positioning
sourceInfluences: consulting market maps, IBM comparison and correlation charts, Swiss grid discipline
---
## When To Use
- Prioritizing segments.
- Mapping competitors or portfolio options.
- Showing strategic whitespace.
- Communicating tradeoff between two decision dimensions.

## When Not To Use
- Precise quantitative comparison.
- More than eight plotted items.
- Axes are vague or subjective with no basis.

## Good Structure
- Use two independent, decision-relevant axes.
- Label target quadrant and implication.
- Limit plotted items and group labels.
- Use restrained color to highlight only the chosen segment or option.

## Anti Patterns
- "High value / low value" axes without definitions.
- Dots placed to force a desired story.
- Too many quadrants labels and callouts.
- Treating matrix as evidence instead of interpretation.

## Evidence Requirements
- Axis definitions.
- Basis for each placement.
- Source or assumption behind relative position.

## Suggested Visual Components
- matrix
- quadrant-callout
- target-marker
- competitor-dot
- evidence-footnote

## Example Markup
```html
<section class="slide" data-motion="matrix-positioning" data-visual="2x2-matrix">
  <p class="eyebrow">Whitespace</p>
  <h1>The premium fleet niche is underserved because urgency is high and incumbent fit is low</h1>
  <div class="matrix" aria-label="Competitive whitespace matrix"></div>
</section>
```

## QA Checklist
- Axes are labeled with meaningful extremes.
- Target quadrant is obvious.
- Placement is defensible.
- No more than one primary highlight color.

