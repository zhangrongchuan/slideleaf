---
id: quarterly-business-review
category: deck-archetype
title: Quarterly Business Review
tags: qbr, customer-success, account, metrics, renewal, expansion
motionPreset: chart-build
sourceInfluences: IBM trend and comparison charts, Primer focused layout, consulting variance diagnosis
---
## When To Use
- Customer QBR.
- Renewal or expansion meeting.
- Account health review with outcomes and next-quarter plan.

## When Not To Use
- First sales pitch before usage exists.
- Internal board update.
- Technical postmortem.

## Good Structure
- Start with business outcomes achieved.
- Show adoption, value realized, unresolved gaps, benchmarks, and next-quarter plan.
- Tie product usage to the customer's operating goals.
- Make expansion recommendation feel earned by evidence.

## Anti Patterns
- Usage metric dump with no business interpretation.
- Celebratory tone that ignores unresolved risks.
- Expansion ask before value proof.
- Charts without baselines.

## Evidence Requirements
- Usage by role, workflow, or team.
- Outcome metrics or proxy value.
- Support, adoption, or risk signals.
- Agreed goals and next steps.

## Suggested Visual Components
- outcome-scorecard
- adoption-trend
- benchmark-table
- renewal-risk-matrix
- next-quarter-roadmap

## Example Markup
```html
<section class="slide" data-motion="chart-build" data-visual="metric-system">
  <p class="eyebrow">Quarterly business review</p>
  <h1>Usage matured from trial behavior to repeatable operating rhythm this quarter</h1>
  <div class="metric-row" data-reveal></div>
</section>
```

## QA Checklist
- Metrics are tied to customer outcomes.
- Risks are not hidden behind positive usage.
- Expansion logic follows proof.
- Next-quarter plan has owners.

