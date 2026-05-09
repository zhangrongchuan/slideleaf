---
id: causality
category: analysis-operator
title: Causality
tags: causality, cause-effect, driver, mechanism, why, diagnosis
motionPreset: flow-draw
sourceInfluences: issue-tree analysis, Bret Victor guided explanation, IBM relationship charts
---
## When To Use
- Explaining why a metric changed.
- Showing mechanism between actions and outcomes.
- Distinguishing symptom from root cause.

## When Not To Use
- When evidence only supports correlation.
- When the audience needs a simple comparison.
- When causal steps are speculative and should be framed as hypotheses.

## Good Structure
- State the observed outcome.
- Show the causal chain with evidence at each link.
- Label known facts versus hypotheses.
- End with the intervention point.

## Anti Patterns
- Claiming causality from correlation.
- Overlong arrows with no evidence.
- Treating every factor as equally causal.
- Hiding uncertainty.

## Evidence Requirements
- Baseline and changed outcome.
- Evidence for each causal link.
- Confounder or caveat notes.
- Proposed test if causality is uncertain.

## Suggested Visual Components
- causal-chain
- driver-tree
- before-after-flow
- mechanism-map
- intervention-callout

## Example Markup
```html
<section class="slide" data-motion="flow-draw" data-visual="causal-chain">
  <p class="eyebrow">Diagnosis</p>
  <h1>Activation fell because the new setup path delayed first value by two steps</h1>
  <div class="causal-chain" data-reveal></div>
</section>
```

## QA Checklist
- Causal language is justified.
- Unknowns are labeled as hypotheses.
- Intervention point is clear.
- Evidence supports every major link.

