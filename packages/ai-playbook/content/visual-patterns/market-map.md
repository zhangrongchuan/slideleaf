---
id: market-map
category: visual-pattern
title: Market Map
tags: market-map, ecosystem, competitors, categories, landscape, whitespace
motionPreset: progressive-reveal
sourceInfluences: consulting landscape maps, IBM relationship charts, Swiss grid layout
---
## When To Use
- Showing ecosystem structure.
- Grouping competitors or solution categories.
- Locating a company's position in a complex market.

## When Not To Use
- Proving precise market share.
- Simple two-option comparison.
- When categories are arbitrary.

## Good Structure
- Define category boundaries.
- Cluster players by buyer need or workflow role.
- Highlight whitespace or chosen wedge.
- Keep logos or labels legible and restrained.

## Anti Patterns
- Logo soup.
- Unclear category boxes.
- Market map with no conclusion.
- Too many colors.

## Evidence Requirements
- Category definitions.
- Inclusion criteria.
- Source or assumption for competitor placement.

## Suggested Visual Components
- market-landscape
- category-band
- competitor-cluster
- whitespace-callout

## Example Markup
```html
<section class="slide" data-motion="progressive-reveal" data-visual="market-map">
  <p class="eyebrow">Market landscape</p>
  <h1>Incumbents cluster around broad coverage, leaving workflow depth underserved</h1>
  <div class="market-map"></div>
</section>
```

## QA Checklist
- Category logic is clear.
- Highlighted wedge is visible.
- Labels are readable.
- The map is not a logo collection without analysis.

