---
id: qa-motion-restraint
category: qa-rule
title: Motion Restraint QA
tags: qa, motion, animation, reduced-motion, accessibility, runtime
motionPreset: static
sourceInfluences: Apple motion accessibility, Material duration and easing, D3 transition clarity
---
## When To Use
- Slide animation QA.
- Global motion pass.
- Any slide with data-motion other than static.

## When Not To Use
- Never omit if the runtime has animation enabled.

## Good Structure
- Confirm motion serves narrative purpose.
- Verify reduced-motion shows final state.
- Limit reveal steps.
- Keep similar components using similar motion.

## Anti Patterns
- Animation as decoration.
- Hiding critical context.
- Long transitions.
- Different animation styles for identical components.

## Evidence Requirements
- Animation purpose.
- Slide reading order.
- Component type.

## Suggested Visual Components
- motion-audit
- reveal-sequence
- runtime-preset-map

## Example Markup
```html
<section class="slide" data-motion="static">
  <h1>QA rule: motion should clarify sequence, emphasis, or change</h1>
</section>
```

## QA Checklist
- Reduced-motion is respected.
- Motion preset matches slide role.
- No more than six reveal steps.
- Critical labels are never hidden until late.

