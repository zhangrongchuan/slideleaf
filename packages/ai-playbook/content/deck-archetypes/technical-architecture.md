---
id: technical-architecture
category: deck-archetype
title: Technical Architecture
tags: technical, architecture, system, engineering, enterprise, data-flow
motionPreset: flow-draw
sourceInfluences: IBM technical diagrams, Primer layout, Observable layered marks, Bret Victor explorable explanation
---
## When To Use
- Architecture review for CTO, engineering, security, or enterprise buyer.
- Technical diligence appendix for investors.
- Product architecture explanation where system boundaries matter.

## When Not To Use
- Investor opening unless architecture is the differentiator.
- Marketing overview for nontechnical buyers.
- Detailed implementation plan better handled in docs.

## Good Structure
- Start with the system claim: what the architecture enables.
- Separate user surface, application services, orchestration, data, infrastructure, and external systems.
- Label trust boundaries and data movement.
- Use animation to draw flow only when it improves understanding.

## Anti Patterns
- Box soup with no hierarchy.
- Mixing deployment, data flow, and product modules in one ambiguous diagram.
- Tiny labels that cannot be read in presentation mode.
- Over-animating every connector.

## Evidence Requirements
- Named components and boundaries.
- Flow semantics such as read, write, event, inference, policy, or audit.
- Performance, reliability, or security claims with basis.
- Assumptions for external services.

## Suggested Visual Components
- layered-architecture
- data-flow-diagram
- control-plane-callout
- trust-boundary
- sequence-flow

## Example Markup
```html
<section class="slide" data-motion="flow-draw" data-visual="architecture-diagram">
  <p class="eyebrow">Architecture</p>
  <h1>The system separates orchestration from execution for enterprise control</h1>
  <div class="architecture-layers" aria-label="Layered technical architecture"></div>
</section>
```

## QA Checklist
- Flow direction is obvious.
- Layers map to real system responsibilities.
- Labels are concise and legible.
- The diagram proves a technical point rather than decorating the slide.

