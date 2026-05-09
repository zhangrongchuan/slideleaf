---
id: narrative-timeline
category: visual-pattern
title: Narrative Timeline
tags: timeline, narrative, milestones, history, inflection
motionPreset: timeline-step
sourceInfluences: Duarte sparkline contrast, IBM trend charts, Material motion timing
---
## When To Use
- Showing sequence of events that created current state.
- Explaining inflection points.
- Building historical credibility or product evolution.

## When Not To Use
- Dense project schedule.
- Precise Gantt chart.
- Events do not causally connect.

## Good Structure
- Use five or fewer milestones in main flow.
- Label each milestone by consequence, not just date.
- Highlight the inflection point.
- Connect timeline to the next decision.

## Anti Patterns
- Chronology for its own sake.
- Too many dates.
- Milestones that all look equal.
- No implication.

## Evidence Requirements
- Dates or sequence basis.
- Source for major milestones.
- Explanation of the turning point.

## Suggested Visual Components
- milestone-line
- inflection-marker
- before-after-band
- timeline-caption

## Example Markup
```html
<section class="slide" data-motion="timeline-step" data-visual="narrative-timeline">
  <p class="eyebrow">Timing</p>
  <h1>The category shifted when buyers moved from experiments to annual budgets</h1>
  <ol class="timeline"></ol>
</section>
```

## QA Checklist
- Milestones are consequential.
- Date labels are not cluttered.
- The inflection point is highlighted.
- Timeline supports the action title.

