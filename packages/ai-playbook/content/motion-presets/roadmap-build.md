---
id: roadmap-build
category: motion-preset
title: Roadmap Build
tags: roadmap-build, roadmap, execution, phases, milestones
motionPreset: roadmap-build
sourceInfluences: product roadmap reviews, Material motion timing, Apple reduced-motion guidance
---
## When To Use
- Phased execution plan.
- Product roadmap.
- Implementation sequence with gates.

## When Not To Use
- Current-state diagnosis.
- Dense project task list.
- Roadmap is purely decorative.

## Good Structure
- Reveal phases left to right or top to bottom.
- Reveal milestones within each phase.
- End on the decision gate or expected proof.

## Anti Patterns
- Animating every task.
- Calendar units dominate phase objectives.
- No final milestone.

## Evidence Requirements
- Milestone basis.
- Dependencies.
- Timing assumptions.

## Suggested Visual Components
- roadmap
- phase-gate
- milestone-ladder

## Example Markup
```html
<section class="slide" data-motion="roadmap-build" data-visual="roadmap">
  <h1>The plan proves repeatability before expanding the footprint</h1>
  <ol class="roadmap"></ol>
</section>
```

## QA Checklist
- Phase reveal order is logical.
- Reduced-motion shows the complete roadmap.
- Milestones fit without shrinking text.

