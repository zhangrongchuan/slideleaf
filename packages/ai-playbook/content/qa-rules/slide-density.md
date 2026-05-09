---
id: qa-slide-density
category: qa-rule
title: Slide Density QA
tags: qa, density, readability, overflow, text, layout
motionPreset: static
sourceInfluences: Swiss typography, Primer responsive layout, executive skim design
---
## When To Use
- Static HTML QA.
- Visual QA pass.
- Any slide with more than five visible text blocks.

## When Not To Use
- Minimal title slide unless text still risks overflow.

## Good Structure
- Count text blocks, line lengths, and label sizes.
- Preserve 16:9 safe area.
- Use summary plus appendix instead of compressing too much.
- Ensure mobile preview does not create incoherent overlap.

## Anti Patterns
- Tiny text.
- Many equal-weight blocks.
- Labels that wrap unpredictably.
- Text inside containers that cannot fit.

## Evidence Requirements
- None beyond the slide content.

## Suggested Visual Components
- density-audit
- safe-area-check
- text-block-map

## Example Markup
```html
<section class="slide" data-motion="static">
  <h1>QA rule: a slide that needs zooming is not executive-ready</h1>
</section>
```

## QA Checklist
- No text overlap.
- No content outside safe area.
- Long labels wrap cleanly.
- Main title remains dominant.

