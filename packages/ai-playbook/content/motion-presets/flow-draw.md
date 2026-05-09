---
id: flow-draw
category: motion-preset
title: Flow Draw
tags: flow-draw, architecture, issue-tree, causal-chain, process
motionPreset: flow-draw
sourceInfluences: D3 transition sequencing, Bret Victor guided explanation, Apple purposeful motion
---
## When To Use
- Architecture flow.
- Issue tree.
- Causal chain.
- Process or decision tree where sequence matters.

## When Not To Use
- Static scorecard.
- Flow has more than seven major nodes.
- Arrows do not carry meaning.

## Good Structure
- Show starting node.
- Draw connectors in reading order.
- Reveal dependent nodes after connectors.
- Highlight final implication.

## Anti Patterns
- Moving arrows without labels.
- Too many nodes.
- Direction ambiguity.
- Animation longer than the point it explains.

## Evidence Requirements
- Flow semantics.
- Component or step definitions.
- Basis for causal or system relationships.

## Suggested Visual Components
- architecture-diagram
- issue-tree
- causal-chain
- decision-tree

## Example Markup
```html
<section class="slide" data-motion="flow-draw" data-visual="architecture-diagram">
  <h1>Policy decisions flow through the control plane before execution</h1>
  <div class="flow-diagram"></div>
</section>
```

## QA Checklist
- Direction is obvious.
- Reduced-motion shows all nodes and connectors.
- Flow order matches the action title.

