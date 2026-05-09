---
id: sales-proposal
category: deck-archetype
title: Sales Proposal
tags: sales, proposal, buyer, value, roi, implementation
motionPreset: progressive-reveal
sourceInfluences: Duarte audience stakes, Stripe consistency constraints, consulting value cases
---
## When To Use
- Enterprise sales deck.
- Account-specific proposal.
- Solution narrative for buyer committee.

## When Not To Use
- Investor fundraising deck.
- Internal roadmap decision.
- Technical architecture deep dive without buyer value framing.

## Good Structure
- Open with buyer context and desired business outcome.
- Show current pain, value hypothesis, proposed solution, proof, implementation path, ROI, and next steps.
- Tailor examples to the account or industry.
- Make the ask and procurement path explicit.

## Anti Patterns
- Generic company intro before buyer problem.
- Feature tour without value.
- ROI math with hidden assumptions.
- Too many logos or testimonials without relevance.

## Evidence Requirements
- Buyer-specific pain or industry benchmark.
- Current cost, risk, or missed opportunity.
- Proof from case studies, usage data, or pilot results.
- Implementation assumptions and decision timeline.

## Suggested Visual Components
- buyer-context-panel
- before-after-flow
- roi-waterfall
- implementation-roadmap
- proof-card-stack

## Example Markup
```html
<section class="slide" data-motion="progressive-reveal" data-visual="before-after-flow">
  <p class="eyebrow">Proposal</p>
  <h1>The fastest ROI comes from automating the handoff that currently delays every renewal</h1>
  <div class="before-after" data-reveal></div>
</section>
```

## QA Checklist
- The deck reads as buyer-specific.
- ROI assumptions are visible.
- Proof points match the buyer's risk profile.
- Next step is concrete.

