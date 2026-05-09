---
id: decision-tree
category: visual-pattern
title: Decision Tree
tags: decision-tree, scenario, trigger, path, options, governance
motionPreset: flow-draw
sourceInfluences: scenario planning, Bret Victor guided explanation, consulting decision logic
---
## When To Use
- Showing conditional decisions.
- Explaining trigger-based execution.
- Comparing paths under uncertainty.

## When Not To Use
- Simple recommendation with no conditions.
- Very deep branching logic.
- Audience needs numeric forecast first.

## Good Structure
- Start with the decision node.
- Use two to three branches per decision.
- Attach trigger condition and action to each branch.
- Highlight recommended default path.

## Anti Patterns
- Branch explosion.
- Conditions without actions.
- Equal emphasis on unlikely paths.
- Tiny labels on connectors.

## Evidence Requirements
- Decision criteria.
- Trigger thresholds.
- Expected action by branch.
- Assumptions for probability or impact if shown.

## Suggested Visual Components
- decision-node
- branch-connector
- trigger-label
- recommended-path

## Example Markup
```html
<section class="slide" data-motion="flow-draw" data-visual="decision-tree">
  <p class="eyebrow">Decision logic</p>
  <h1>Hiring pace should flex only if conversion falls below the trigger band</h1>
  <div class="decision-tree"></div>
</section>
```

## QA Checklist
- Branches are few and meaningful.
- Trigger conditions are explicit.
- Recommended path is visible.
- The tree answers a real decision.

