---
id: roadmap
category: analysis-operator
title: Roadmap
tags: roadmap, execution, sequencing, milestones, dependency, plan
motionPreset: roadmap-build
sourceInfluences: product strategy sequencing, Material motion timing, consulting implementation plans
---
## When To Use
- Showing phased execution.
- Connecting recommendation to action.
- Sequencing dependencies and proof milestones.

## When Not To Use
- Diagnosing current state.
- Showing a one-time decision.
- Listing every project task.

## Good Structure
- Name phases by objective, not only dates.
- Show major milestones, owners, and proof points.
- Tie each phase to a decision or learning gate.
- Keep the timeline visually calm and sparse.

## Anti Patterns
- Calendar wallpaper.
- Too many tasks.
- No owner or success criterion.
- Dates without dependency logic.

## Evidence Requirements
- Milestone definitions.
- Dependencies.
- Owner or accountable team.
- Definition of done.

## Suggested Visual Components
- roadmap
- timeline
- phase-gate
- milestone-ladder
- dependency-flow

## Example Markup
```html
<section class="slide" data-motion="roadmap-build" data-visual="roadmap">
  <p class="eyebrow">Execution plan</p>
  <h1>The first 90 days should prove demand before scaling operations</h1>
  <ol class="roadmap" data-reveal></ol>
</section>
```

## QA Checklist
- Phases are sequenced.
- Milestones are measurable.
- Dependencies are visible.
- The roadmap supports the recommendation.

