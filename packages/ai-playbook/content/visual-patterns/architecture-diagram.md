---
id: architecture-diagram
category: visual-pattern
title: Architecture Diagram
tags: architecture-diagram, technical, system, data-flow, engineering, enterprise
motionPreset: flow-draw
sourceInfluences: IBM technical diagrams, Primer layout, Observable layered grammar
---
## When To Use
- Explaining system structure.
- Showing data, control, or trust boundaries.
- Communicating technical differentiation to executives or buyers.

## When Not To Use
- Nontechnical opening slide.
- Diagram with no clear system claim.
- Implementation docs that need exhaustive detail.

## Good Structure
- Layer by user, application, orchestration, data, infrastructure, external services.
- Use arrows only for meaningful flows.
- Label trust boundaries.
- Highlight the differentiating component.

## Anti Patterns
- Box soup.
- Every microservice on one slide.
- Mixed metaphors: deployment, user journey, and data model in one diagram.
- Tiny labels.

## Evidence Requirements
- Component list.
- Flow semantics.
- Boundary assumptions.
- Basis for performance or security claims.

## Suggested Visual Components
- layered-diagram
- flow-arrows
- trust-boundary
- control-plane-callout
- data-store

## Example Markup
```html
<section class="slide" data-motion="flow-draw" data-visual="architecture-diagram">
  <p class="eyebrow">System architecture</p>
  <h1>The control plane keeps enterprise policy separate from execution workers</h1>
  <div class="architecture-diagram" aria-label="Layered architecture"></div>
</section>
```

## QA Checklist
- Flow direction is clear.
- Layers match real responsibilities.
- No label requires zooming.
- Differentiator is visually isolated.

