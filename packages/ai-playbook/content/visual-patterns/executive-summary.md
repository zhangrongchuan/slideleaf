---
id: executive-summary
category: visual-pattern
title: Executive Summary
tags: executive-summary, synthesis, ceo, board, investor, decision
motionPreset: progressive-reveal
sourceInfluences: Pyramid Principle, Duarte resolution, Primer focused layout
---
## When To Use
- Opening synthesis after DeckPlan is frozen.
- Final summary after the deck structure and generated slide files exist.
- CEO, board, or investor audience that needs answer-first logic.

## When Not To Use
- Detailed evidence page.
- Slide that must teach a complex mechanism.
- Placeholder agenda.

## Good Structure
- One action title with the decision-level answer.
- Three to four message blocks with evidence anchors.
- One visible implication, ask, or next move.
- No decorative hero image unless it proves context.

## Anti Patterns
- Generic agenda.
- Long paragraphs.
- New claims not supported by generated slides.
- Equal-weight messages with no hierarchy.

## Evidence Requirements
- References to prior SlidePlan messages, generated slide files, or explicit evidence notes for each claim.
- Source labels for metrics.
- Explicit assumption labels if evidence is not available.

## Suggested Visual Components
- thesis-panel
- evidence-pillars
- decision-callout
- message-stack

## Example Markup
```html
<section class="slide" data-motion="progressive-reveal" data-visual="executive-summary">
  <p class="eyebrow">Executive summary</p>
  <h1>The next phase is focused proof in one wedge, not broad expansion</h1>
  <div class="message-stack">
    <article data-reveal><strong>Where to play</strong><span>Premium fleet operators.</span></article>
    <article data-reveal><strong>Why now</strong><span>Budget and urgency moved together.</span></article>
    <article data-reveal><strong>What to do</strong><span>Prove repeatable deployment in 90 days.</span></article>
  </div>
</section>
```

## QA Checklist
- Reads clearly without presenter narration.
- Does not introduce unsupported evidence.
- Uses the same terminology as the rest of the deck.
- Stays under four message blocks.
