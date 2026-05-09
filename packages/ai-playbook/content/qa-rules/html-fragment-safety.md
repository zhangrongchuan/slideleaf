---
id: qa-html-fragment-safety
category: qa-rule
title: HTML Fragment Safety QA
tags: qa, html, fragment, script, renderer, portable
motionPreset: static
sourceInfluences: portable static site constraints, renderer sandboxing, design system governance
---
## When To Use
- Every slide HTML generation.
- Static QA before creating patch.
- Any regenerate request.

## When Not To Use
- Never omit for generated slide fragments.

## Good Structure
- Slide output must be exactly one section root with class slide.
- Use data-motion and data-visual attributes for runtime behavior.
- No script tags, remote CSS, remote JS, iframe, or external dependency.
- Use semantic HTML and classes that deck.css can style.

## Anti Patterns
- Full HTML document per slide.
- Inline script.
- Remote fonts or libraries.
- Per-slide animation code.

## Evidence Requirements
- None.

## Suggested Visual Components
- fragment-lint
- sanitizer-report
- runtime-preset-map

## Example Markup
```html
<section class="slide" data-motion="progressive-reveal" data-visual="executive-summary">
  <h1>A valid slide is a portable fragment, not a full document</h1>
</section>
```

## QA Checklist
- One section.slide root.
- No script tag.
- No remote resource.
- Motion uses runtime preset only.

