---
id: static
category: motion-preset
title: Static
tags: static, reduced-motion, reference, board, dense
motionPreset: static
sourceInfluences: Apple motion restraint, board deck readability
---
## When To Use
- Dense reference slide.
- Board or appendix material where all information must be available immediately.
- Any slide where animation would hide context.

## When Not To Use
- Narrative build that needs stepwise logic.
- Flow explanation where sequence matters.
- Product demo where change over time is the point.

## Good Structure
- Render all key content at load.
- Use visual hierarchy rather than animation to guide reading.
- Preserve reduced-motion behavior by default.

## Anti Patterns
- Hidden content in static mode.
- No hierarchy because nothing moves.
- Treating static as unpolished.

## Evidence Requirements
- None beyond slide evidence.

## Suggested Visual Components
- metric-system
- comparison-table
- executive-summary
- appendix-table

## Example Markup
```html
<section class="slide" data-motion="static" data-visual="metric-system">
  <h1>Growth is on plan, but margin variance requires a decision</h1>
</section>
```

## QA Checklist
- All content is visible without interaction.
- Reading order is clear.
- Reduced-motion mode behaves identically.

