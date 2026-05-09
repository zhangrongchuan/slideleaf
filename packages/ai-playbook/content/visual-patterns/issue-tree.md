---
id: issue-tree
category: visual-pattern
title: Issue Tree
tags: issue-tree, decomposition, mece, root-cause, strategy
motionPreset: flow-draw
sourceInfluences: consulting issue trees, IBM relationship charts, Tufte restraint
---
## When To Use
- Breaking a strategic question into workstreams.
- Explaining root-cause structure.
- Showing which driver matters most.

## When Not To Use
- A simple list is enough.
- Branches are not logically parallel.
- The slide requires precise numeric comparison.

## Good Structure
- Put the governing question or problem at the left or top.
- Split into three to five branches.
- Keep each branch label concise.
- Highlight the branch that drives the next slide.

## Anti Patterns
- Pyramid of tiny text.
- Nonparallel branch types.
- Multiple nested depths in one slide.
- No "so what" after decomposition.

## Evidence Requirements
- Branch definitions.
- Evidence signal per branch.
- Priority or magnitude marker.

## Suggested Visual Components
- issue-tree
- branch-score
- root-node
- driver-callout

## Example Markup
```html
<section class="slide" data-motion="flow-draw" data-visual="issue-tree">
  <p class="eyebrow">Driver decomposition</p>
  <h1>Three drivers explain the margin gap, but service mix is the controllable lever</h1>
  <div class="issue-tree" data-reveal></div>
</section>
```

## QA Checklist
- Branches are mutually distinct.
- Reading order is obvious.
- Highlighted branch links to next slide.
- No branch label wraps more than two lines.

