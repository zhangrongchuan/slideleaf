---
id: example-market-entry
category: example
title: Market Entry Example Sequence
tags: example, market-entry, segmentation, competitor, roadmap, consulting
motionPreset: progressive-reveal
sourceInfluences: consulting market entry flow, FT visual vocabulary, IBM chart taxonomy
---
## When To Use
- As retrieval context for market-entry deck generation.
- When the model needs a slide sequence example rather than a single pattern.

## When Not To Use
- Do not copy directly into final output.
- Do not use if the deck is a pure technical architecture review.

## Good Structure
- Slide 1: answer-first executive summary generated last.
- Slide 2: market timing trend.
- Slide 3: segmentation matrix.
- Slide 4: competitor whitespace map.
- Slide 5: recommended wedge.
- Slide 6: execution roadmap.
- Slide 7: risk and mitigation.

## Anti Patterns
- Recommendation before segmentation.
- Competitor map with no target segment.
- Roadmap unrelated to wedge.

## Evidence Requirements
- Market growth source.
- Segment need evidence.
- Competitor coverage evidence.
- Execution feasibility assumptions.

## Suggested Visual Components
- executive-summary
- line-chart
- 2x2-matrix
- market-map
- roadmap
- risk-matrix

## Example Markup
```html
<section class="slide" data-motion="progressive-reveal" data-visual="executive-summary">
  <h1>The entry path is a focused wedge where urgency is high and incumbent coverage is low</h1>
</section>
```

## QA Checklist
- Sequence moves from context to diagnosis to recommendation.
- Visuals vary by analytical role.
- Executive summary reflects the frozen plan and generated slide files.
