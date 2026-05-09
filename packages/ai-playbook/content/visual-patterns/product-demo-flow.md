---
id: product-demo-flow
category: visual-pattern
title: Product Demo Flow
tags: product-demo, workflow, screenshots, buyer, before-after, user-journey
motionPreset: progressive-reveal
sourceInfluences: Stripe UI consistency, Duarte contrast, Primer focused interaction layout
---
## When To Use
- Showing how a product solves a specific workflow.
- Sales proposal or investor product proof.
- Demonstrating before-and-after user value.

## When Not To Use
- Architecture slide.
- When screenshots are unavailable and should not be fabricated.
- Generic feature tour.

## Good Structure
- Start with the user's current pain.
- Show three to five steps of the improved workflow.
- Use real or clearly placeholder UI frames.
- End with the outcome metric or saved decision.

## Anti Patterns
- Screenshot collage.
- Tiny UI details.
- Feature names instead of user outcomes.
- Fake product state with no placeholder label.

## Evidence Requirements
- User workflow evidence.
- Screenshot or wireframe source.
- Outcome metric or qualitative proof.

## Suggested Visual Components
- workflow-strip
- before-after-flow
- annotated-screenshot
- outcome-callout

## Example Markup
```html
<section class="slide" data-motion="progressive-reveal" data-visual="product-demo-flow">
  <p class="eyebrow">Product workflow</p>
  <h1>The new flow compresses a four-step handoff into one accountable workspace</h1>
  <div class="workflow-strip"></div>
</section>
```

## QA Checklist
- Workflow is legible.
- UI frames do not dominate the message.
- Outcome is visible.
- Placeholder assets are labeled.

