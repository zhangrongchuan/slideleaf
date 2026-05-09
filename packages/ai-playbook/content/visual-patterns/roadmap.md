---
id: roadmap
category: visual-pattern
title: Roadmap
tags: roadmap, timeline, milestones, execution, sequencing
motionPreset: roadmap-build
sourceInfluences: product roadmaps, Material duration and easing, consulting implementation plans
---
## When To Use
- Showing phased execution.
- Translating recommendation into plan.
- Sequencing milestones and dependencies.

## When Not To Use
- Listing every task.
- Diagnostic slide.
- Timeline where dates are unknown and should not be invented.

## Good Structure
- Name phases by objective.
- Use three to five phases or lanes.
- Show proof milestones and decision gates.
- Keep exact dates only where useful.

## Anti Patterns
- Calendar wallpaper.
- Too many swimlanes.
- No owner or definition of done.
- Visual emphasis on dates rather than outcomes.

## Evidence Requirements
- Dependencies.
- Milestone criteria.
- Owners or accountable groups.
- Assumption notes for timing.

## Suggested Visual Components
- phased-roadmap
- milestone-marker
- dependency-connector
- decision-gate

## Example Markup
```html
<section class="slide" data-motion="roadmap-build" data-visual="roadmap">
  <p class="eyebrow">Implementation roadmap</p>
  <h1>Expansion should wait until deployment repeatability is proven in the first wedge</h1>
  <ol class="roadmap"></ol>
</section>
```

## QA Checklist
- Phases are outcome-based.
- Milestones are measurable.
- Timeline fits without tiny text.
- Dependencies are visually clear.

