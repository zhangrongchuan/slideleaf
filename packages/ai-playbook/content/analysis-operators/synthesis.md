---
id: synthesis
category: analysis-operator
title: Synthesis
tags: synthesis, summary, implication, recommendation, executive-summary
motionPreset: progressive-reveal
sourceInfluences: Pyramid Principle, Duarte resolution, consulting executive summaries
---
## When To Use
- Bringing several analyses into one recommendation.
- Executive summary or closing slide.
- Transition from diagnosis to decision.

## When Not To Use
- Detailed evidence slide.
- Early exploratory slide before analysis exists.
- Slide that introduces new unsupported claims.

## Good Structure
- State the integrated conclusion.
- Support it with three to four evidence-backed pillars.
- Name the decision or next action.
- Avoid introducing new analysis that was not shown elsewhere.

## Anti Patterns
- Generic agenda summary.
- New claims in the final slide.
- Four unrelated points with no hierarchy.
- Repeating slide titles rather than synthesizing implications.

## Evidence Requirements
- References to prior SlidePlan messages and generated slide files.
- Evidence links for each pillar.
- Decision ask or recommendation basis.

## Suggested Visual Components
- executive-summary
- thesis-panel
- message-stack
- decision-callout
- evidence-pillars

## Example Markup
```html
<section class="slide" data-motion="progressive-reveal" data-visual="executive-summary">
  <p class="eyebrow">Synthesis</p>
  <h1>The path forward is focused proof in one wedge, then controlled expansion</h1>
  <div class="message-stack" data-reveal></div>
</section>
```

## QA Checklist
- It reflects actual prior slides.
- It does not add unsupported facts.
- The decision is obvious.
- It can be read in 30 seconds.
