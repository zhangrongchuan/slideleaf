---
id: qa-investor-grade
category: qa-rule
title: Investor-grade QA
tags: qa, investor, ceo, polish, evidence, executive
motionPreset: static
sourceInfluences: investor memo discipline, consulting action-title standards, Duarte audience stakes
---
## When To Use
- Every generated deck intended for investors, CEOs, or board audiences.
- Final global QA pass.
- Single-slide regenerate QA.

## When Not To Use
- Never omit for production-quality deck generation.

## Good Structure
- Check thesis, evidence, density, visual diversity, compile safety, and executive readability.
- Reject toy-like layouts, generic claims, and repeated title-plus-bullets.
- Force one message per slide.

## Anti Patterns
- Vague claims.
- Repeated decorative card layouts.
- Content that looks plausible but has no evidence.
- Slides that cannot survive a 15-second skim.

## Evidence Requirements
- Every metric or business claim needs a source, assumption label, or explicit placeholder.
- Every recommendation needs at least one supporting evidence anchor.

## Suggested Visual Components
- qa-checklist
- evidence-log
- slide-summary

## Example Markup
```html
<section class="slide" data-motion="static">
  <h1>QA rule: every slide must earn its place</h1>
</section>
```

## QA Checklist
- One message per slide.
- Action title is a conclusion.
- No unsupported market, financial, or product claims.
- No obvious overflow, overlap, or visual emptiness.

