---
id: board-update
category: deck-archetype
title: Board Update
tags: board, governance, quarterly, metrics, risk, actuals-vs-plan
motionPreset: static
sourceInfluences: consulting executive summaries, Stripe constrained interface discipline, IBM metric categories
---
## When To Use
- Board meeting package.
- Investor update with actuals versus plan.
- Governance review where risks and decisions must be unambiguous.

## When Not To Use
- Sales proposal or product marketing deck.
- Early brainstorming deck where the team is still exploring.
- Highly visual keynote that needs stage energy rather than governance clarity.

## Good Structure
- Start with a board-level summary and decisions needed.
- Show performance versus plan, explain variance, then isolate the management response.
- Keep operating detail in appendix or backup pages.
- Make risk movement visible across meetings.

## Anti Patterns
- Metrics with no interpretation.
- Surprises buried late in the deck.
- Explaining misses with activity instead of root cause.
- Dense operational tables as main-flow slides.

## Evidence Requirements
- Actuals, plan, and variance.
- Definitions of core metrics.
- Known risk register and movement since last meeting.
- Decision requests with owner, date, and implication.

## Suggested Visual Components
- board-summary
- metric-system
- variance-waterfall
- risk-matrix
- decision-log

## Example Markup
```html
<section class="slide" data-motion="static" data-visual="metric-system">
  <p class="eyebrow">Board summary</p>
  <h1>Growth remains on plan, but margin risk moved from watchlist to decision item</h1>
  <div class="metric-row">
    <article><span>ARR</span><strong>+18%</strong></article>
    <article><span>Gross margin</span><strong>-420 bps</strong></article>
    <article><span>Runway</span><strong>19 mo.</strong></article>
  </div>
</section>
```

## QA Checklist
- Decision asks are visible in the first section.
- Variance is explained by driver, not anecdote.
- No critical risk is hidden in appendix.
- Metrics use consistent definitions across slides.

