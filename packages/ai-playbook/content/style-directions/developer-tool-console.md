---
id: developer-tool-console
category: style-direction
title: Developer Tool Console
tags: developer, console, api, sdk, technical, product
motionPreset: flow-draw
sourceInfluences: GitHub Primer, developer documentation interfaces, Observable notebook clarity
---
## When To Use
- Developer platform, API, SDK, or infrastructure product deck.
- Technical product strategy.
- Architecture plus workflow narrative.

## When Not To Use
- Nontechnical buyer committee unless translated into outcomes.
- Board financial section.
- Consumer lifestyle story.

## Good Structure
- Use real code-like snippets only when they prove simplicity.
- Pair interface or terminal visuals with outcome labels.
- Keep monospace text limited and readable.
- Use diagrams for flows, not decorative terminal windows.

## Anti Patterns
- Fake code blocks.
- Matrix-style visual noise.
- Tiny monospace labels.
- Technical cleverness without buyer value.

## Evidence Requirements
- API or workflow behavior should be real or clearly placeholder.
- Performance claims need benchmarks or assumptions.

## Suggested Visual Components
- architecture-diagram
- product-demo-flow
- sequence-flow
- metric-system

## Example Markup
```html
<section class="slide style-dev-console" data-motion="flow-draw">
  <p class="eyebrow">Developer workflow</p>
  <h1>The API collapses orchestration into one auditable call path</h1>
  <div class="console-flow"></div>
</section>
```

## QA Checklist
- Code-like content is legible.
- Technical detail maps to user value.
- Console styling is restrained.
- No fake implementation details.

