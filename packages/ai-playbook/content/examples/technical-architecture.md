---
id: example-technical-architecture
category: example
title: Technical Architecture Example Sequence
tags: example, technical, architecture, system, enterprise, security
motionPreset: flow-draw
sourceInfluences: IBM technical visualization, developer docs, Bret Victor guided explanation
---
## When To Use
- Retrieval context for architecture deck or appendix.
- Enterprise technical diligence.
- CTO-level product explanation.

## When Not To Use
- Nontechnical investor opening.
- Simple sales proposal.

## Good Structure
- Slide 1: architecture claim.
- Slide 2: user-to-system workflow.
- Slide 3: control plane and data plane split.
- Slide 4: data flow and trust boundary.
- Slide 5: reliability, security, or observability proof.
- Slide 6: implementation roadmap or integration path.

## Anti Patterns
- Every service on one slide.
- No trust boundary.
- Technical detail with no business implication.

## Evidence Requirements
- Component definitions.
- Boundary assumptions.
- Performance or security evidence.
- Integration dependencies.

## Suggested Visual Components
- architecture-diagram
- flow-draw
- sequence-flow
- metric-system
- roadmap

## Example Markup
```html
<section class="slide" data-motion="flow-draw" data-visual="architecture-diagram">
  <h1>The architecture keeps policy, execution, and audit data independently governable</h1>
</section>
```

## QA Checklist
- Architecture proves a specific capability.
- Diagrams are layered and legible.
- Claims are not overspecified beyond known architecture.

