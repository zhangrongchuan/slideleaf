---
id: investor-deck
category: deck-archetype
title: Investor Deck
tags: investor, fundraising, venture, market, traction, business-model, ceo
motionPreset: progressive-reveal
sourceInfluences: Duarte contrast narrative, consulting action titles, FT visual vocabulary, IBM chart taxonomy
---
## When To Use
- Fundraising narrative for seed through growth rounds.
- CEO-ready business case where the deck must prove why now, why this team, and why this market.
- Investor update or memo that needs strong thesis, evidence, and ask.

## When Not To Use
- Pure internal operating review where no capital allocation decision is being requested.
- Technical architecture walkthrough without market or business model proof.
- Product launch one-pager where the audience already accepts the investment thesis.

## Good Structure
- Open with the investment thesis in one action title, not a generic company intro.
- Move through pain, timing, market wedge, product advantage, traction, economics, go-to-market, team, ask.
- Reserve detailed product feature lists, cohort tables, and data room material for appendix pages.
- Use quantified evidence sparingly and visibly: one metric should dominate each proof slide.

## Anti Patterns
- TAM-first storytelling that never proves reachable wedge.
- Beautiful product screenshots with no customer pain or monetization logic.
- Repeated title-plus-bullets slides that read like a memo pasted into a deck.
- Unsupported claims about market size, margins, or competitor weakness.

## Evidence Requirements
- Market size source or explicit placeholder.
- Customer pain evidence from interviews, usage, support, churn, or willingness-to-pay signal.
- Traction metric with time window and denominator.
- Business model assumption such as ACV, gross margin, payback, or retention.

## Suggested Visual Components
- thesis-panel
- market-map
- traction-metrics
- segment-priority-matrix
- business-model-waterfall
- roadmap

## Example Markup
```html
<section class="slide" data-motion="progressive-reveal" data-visual="executive-summary">
  <p class="eyebrow">Investment thesis</p>
  <h1>Category timing and product pull create a narrow window to own the workflow layer</h1>
  <div class="proof-grid">
    <article data-reveal><strong>Demand</strong><span>Customers already budget for the pain.</span></article>
    <article data-reveal><strong>Wedge</strong><span>The first segment has urgent, concentrated needs.</span></article>
    <article data-reveal><strong>Moat</strong><span>Workflow data compounds with every deployment.</span></article>
  </div>
</section>
```

## QA Checklist
- The first three slides answer why now, why this, and why us.
- Every financial or market claim has evidence or a visible assumption label.
- No slide introduces more than one core investor takeaway.
- The ask is explicit and connected to milestones.

