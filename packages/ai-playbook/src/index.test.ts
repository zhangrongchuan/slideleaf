import { describe, expect, it } from "vitest";

import {
  PLAYBOOK_ENTRIES,
  PLAYBOOK_INDEX,
  getPlaybookEntriesByIds,
  renderPlaybookCandidateIndex,
  renderPlaybookContext,
  selectPlaybookEntries,
  selectPlaybookEntriesWithAlternates
} from "./index.js";

describe("ai playbook markdown loader", () => {
  it("loads the split markdown content library", () => {
    expect(PLAYBOOK_ENTRIES.length).toBeGreaterThanOrEqual(80);
    expect(PLAYBOOK_INDEX.categories["deck-archetype"]).toContain("investor-deck");
    expect(PLAYBOOK_INDEX.categories["style-direction"]).toContain("swiss-executive-grid");
    expect(PLAYBOOK_INDEX.categories["style-direction"]).toContain("template-signal");
    expect(PLAYBOOK_INDEX.categories["style-direction"]).toContain("template-neo-grid-bold");
    expect(PLAYBOOK_INDEX.categories["qa-rule"]).toContain("qa-evidence-integrity");
  });

  it("selects relevant entries for a slide context", () => {
    const entries = selectPlaybookEntries({
      deckArchetype: "consulting-market-entry",
      analysisOperator: "segmentation",
      visualPattern: "2x2-matrix",
      motionPreset: "matrix-positioning",
      slideRole: "market analysis",
      limit: 12
    });
    const ids = entries.map((entry) => entry.id);

    expect(ids).toContain("consulting-market-entry");
    expect(ids).toContain("segmentation");
    expect(ids).toContain("2x2-matrix");
    expect(ids).toContain("matrix-positioning");
    expect(ids.some((id) => id.startsWith("qa-"))).toBe(true);
  });

  it("renders compact model prompt context", () => {
    const context = renderPlaybookContext(
      selectPlaybookEntries({
        deckArchetype: "investor-deck",
        analysisOperator: "unit-economics",
        visualPattern: "waterfall",
        limit: 5
      })
    );

    expect(context).toContain("## Investor Deck");
    expect(context).toContain("Source influences:");
    expect(context).toContain("Evidence requirements:");
    expect(context).toContain("CSS tokens:");
    expect(context).toContain("Core CSS grammar:");
    expect(context).toContain("Motion and effects:");
    expect(context).toContain("<section class=\"slide\"");
  });

  it("selects template style entries from tone-first and Chinese brief terms", () => {
    const entries = selectPlaybookEntries({
      brief: "我要做一个面向投资人的高级科技感 pitch deck，给 CEO 和投资人看，内容要专业正式",
      audience: "投资人 CEO",
      tone: ["高级", "科技感", "专业", "正式"],
      occasion: "融资 pitch deck",
      limit: 12
    });
    const ids = entries.map((entry) => entry.id);

    expect(ids).toContain("template-signal");
    expect(ids.some((id) => id.startsWith("template-"))).toBe(true);
    expect(ids.some((id) => id.startsWith("qa-"))).toBe(true);
  });

  it("returns alternate candidates for model-directed playbook expansion", () => {
    const selection = selectPlaybookEntriesWithAlternates(
      {
        brief: "premium technical investor pitch deck, cobalt grid system, dense product architecture",
        tone: ["premium", "technical", "investor"],
        occasion: "pitch deck",
        limit: 6
      },
      12
    );
    const selectedIds = new Set(selection.selected.map((entry) => entry.id));

    expect(selection.selected.length).toBeGreaterThan(0);
    expect(selection.alternates.length).toBeGreaterThan(0);
    expect(selection.alternates.every((entry) => !selectedIds.has(entry.id))).toBe(true);

    const candidateIndex = renderPlaybookCandidateIndex(selection.alternates.slice(0, 3));
    expect(candidateIndex).toContain("id:");
    expect(candidateIndex).toContain("whenToUse:");

    const selectedById = getPlaybookEntriesByIds(selection.alternates.slice(0, 2).map((entry) => entry.id));
    expect(selectedById.map((entry) => entry.id)).toEqual(selection.alternates.slice(0, 2).map((entry) => entry.id));
  });
});
