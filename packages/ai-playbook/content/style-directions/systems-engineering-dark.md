---
id: systems-engineering-dark
category: style-direction
title: Systems Engineering Dark
tags: engineering, dark, technical, architecture, enterprise, system
motionPreset: flow-draw
sourceInfluences: developer tool interfaces, Primer foundations, IBM technical visualization
---
## When To Use
- Technical architecture and infrastructure decks.
- Enterprise buyer explanation of security, control, or orchestration.
- Developer tool product strategy.

## When Not To Use
- Board financial update.
- Warm sales proposal for nontechnical buyers.
- Deck where dark theme hurts readability in projected rooms.

## Good Structure
- Use dark base with high-contrast labels and restrained accent colors.
- Treat diagrams like product interfaces: structured, readable, calm.
- Use code-like labels sparingly for authenticity.
- Keep boxes and connectors aligned to grid.

## Anti Patterns
- Neon overload.
- Terminal aesthetic without substance.
- Too many nested boxes.
- Low-contrast gray text.

## Evidence Requirements
- Technical claims must cite architecture assumptions or benchmark placeholders.

## Suggested Visual Components
- architecture-diagram
- data-flow-diagram
- control-plane-callout
- metric-system

## Example Markup
```html
<section class="slide style-systems-dark" data-motion="flow-draw" data-visual="architecture-diagram">
  <p class="eyebrow">Control plane</p>
  <h1>Policy and execution are separated so enterprises can govern every automated step</h1>
  <div class="architecture-diagram"></div>
</section>
```

## QA Checklist
- Contrast passes visual inspection.
- Diagram hierarchy is clear.
- Accent colors encode meaning.
- The dark theme does not feel like a toy dashboard.

