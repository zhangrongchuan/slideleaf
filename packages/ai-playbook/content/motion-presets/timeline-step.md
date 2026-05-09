---
id: timeline-step
category: motion-preset
title: Timeline Step
tags: timeline-step, milestones, narrative-timeline, inflection, sequence
motionPreset: timeline-step
sourceInfluences: Duarte narrative arc, Material duration and easing, IBM trend storytelling
---
## When To Use
- Historical narrative.
- Milestone sequence.
- Explaining category or product inflection.

## When Not To Use
- Detailed project schedule.
- More than six milestones.
- No meaningful sequence.

## Good Structure
- Reveal milestones in chronological order.
- Use the final reveal for the inflection or implication.
- Keep date labels quiet and consequence labels dominant.

## Anti Patterns
- Dates dominate the story.
- Too many milestones.
- Every milestone appears equally important.

## Evidence Requirements
- Date or sequence source.
- Basis for inflection claim.

## Suggested Visual Components
- narrative-timeline
- milestone-line
- inflection-marker

## Example Markup
```html
<section class="slide" data-motion="timeline-step" data-visual="narrative-timeline">
  <h1>Buyer behavior changed when experiments became annual budget lines</h1>
  <ol class="timeline"></ol>
</section>
```

## QA Checklist
- Milestones build to a conclusion.
- Inflection is highlighted.
- Reduced-motion displays the full timeline.

