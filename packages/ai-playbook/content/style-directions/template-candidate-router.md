---
id: template-candidate-router
category: style-direction
title: Template Candidate Router
tags: template, beautiful-html-templates, visual-direction, candidate-selection, mood, tone, occasion, formality, density, 风格, 模板, 视觉方向
motionPreset: static
sourceInfluences: beautiful-html-templates index.json, tone-first template matching
---
## When To Use
- Before generating visual directions when the user has supplied enough brief information.
- When the user wants a polished deck but has not chosen a concrete style.
- When the model should propose three differentiated directions instead of one generic visual system.

## When Not To Use
- When the user has already chosen a named template/style direction.
- When the deck must strictly follow an existing brand system supplied by the user.
- When only a tiny one-slide utility output is needed.

## Good Structure
- Generate three candidates: safest fit, more distinctive fit, and wildcard fit.
- Score candidates by audience formality, topic occasion, desired mood, text density, and light/dark preference.
- Explain each candidate as a visual thesis, not as a theme name alone.
- Use template entries as design-system guidance; do not copy their full HTML or runtime mechanics.
- After a direction is selected, keep all generated slides inside that direction's typography, color, spacing, chrome, and component grammar.

## Anti Patterns
- Selecting only by industry keyword and ignoring mood.
- Offering three nearly identical editorial templates.
- Choosing a playful low-formality direction for a board or investor deck without an explicit user request.
- Choosing a low-density poster style for a data-heavy strategy report.
- Treating template names as decorations rather than design systems.

## Evidence Requirements
- Brief must contain audience, occasion, tone or emotional goal, density, and language.
- If any of those are unknown, ask clarification questions before locking style.
- For each candidate, state why it fits and what risk it carries.

## Suggested Visual Components
- visual-direction-preview
- style-comparison-table
- formality-density-matrix
- template-fit-scorecard

## Example Markup
```html
<section class="slide" data-motion="static" data-visual="comparison-table">
  <div class="slide-content">
    <p class="eyebrow">Visual direction selection</p>
    <h1>Choose a style by audience fit, not decoration</h1>
  </div>
</section>
```

## QA Checklist
- Three candidates are genuinely different.
- Each candidate maps to mood, tone, formality, density, and audience.
- The recommended candidate explains the tradeoff.
- No candidate asks the model to duplicate navigation or full-document template structure.
