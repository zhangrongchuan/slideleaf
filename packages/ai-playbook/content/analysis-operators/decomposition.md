---
id: decomposition
category: analysis-operator
title: Decomposition
tags: decomposition, issue-tree, drivers, root-cause, mece, waterfall
motionPreset: flow-draw
sourceInfluences: consulting issue trees, IBM relationship charts, Tufte data-ink restraint
---
## When To Use
- Breaking a problem into drivers.
- Explaining root causes.
- Showing how parts create the whole.
- Turning a broad strategic question into workstreams.

## When Not To Use
- Simple chronological narrative.
- Emotional keynote page.
- A slide where the parts are not meaningfully independent.

## Good Structure
- State the whole problem in the action title.
- Split into three to five MECE branches.
- Show magnitude, evidence, or priority per branch.
- Highlight the branch that drives the recommendation.

## Anti Patterns
- Non-MECE branches.
- Nested text walls.
- Branches that are process steps rather than drivers.
- No priority signal.

## Evidence Requirements
- Driver definitions.
- Magnitude or qualitative support per branch.
- Link between dominant branch and next slide.

## Suggested Visual Components
- issue-tree
- driver-stack
- waterfall
- cause-map
- branch-scorecard

## Example Markup
```html
<section class="slide" data-motion="flow-draw" data-visual="issue-tree">
  <p class="eyebrow">Root cause</p>
  <h1>Retention pressure decomposes into onboarding, activation, and habit formation</h1>
  <div class="issue-tree" data-reveal></div>
</section>
```

## QA Checklist
- Branches are mutually distinct.
- The dominant driver is called out.
- Labels are short.
- The next slide follows from the highlighted branch.

