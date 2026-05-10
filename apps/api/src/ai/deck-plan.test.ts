import { describe, expect, it } from "vitest";
import {
  normalizeDeckPlan,
  sanitizeSlideHtmlFragment,
  validateDeckPlan
} from "./deck-plan.js";

describe("DeckPlan v1", () => {
  it("normalizes and validates a sectioned DeckPlan", () => {
    const plan = normalizeDeckPlan({
      brief: { topic: "Market entry", audience: "CEO" },
      mainThesis: "Premium fleet operators are the best wedge.",
      narrativeArc: {
        startingBelief: "The broad fleet market looks attractive.",
        tension: "Broad aftermarket providers miss premium complexity.",
        turningPoint: "Premium fleets show both urgency and willingness to pay.",
        resolution: "Enter through the premium fleet wedge.",
        decisionAsk: "Approve a focused wedge strategy.",
        storylineBeats: ["Market looks broad", "Complexity creates whitespace", "Premium wedge wins"]
      },
      evidencePack: {
        knownFacts: [
          {
            id: "e1",
            statement: "Premium fleets have unresolved maintenance complexity.",
            type: "user-provided",
            appliesTo: ["s01"],
            confidence: "medium"
          }
        ],
        missingEvidence: [
          {
            id: "need1",
            label: "segment margin benchmark",
            purpose: "prove attractiveness",
            preferredFormat: "benchmark",
            fallbackIfMissing: "mark as assumption",
            appliesTo: ["s01"]
          }
        ]
      },
      sections: [
        {
          id: "diagnosis",
          title: "Diagnosis",
          role: "diagnosis",
          coreMessage: "The market has a clear underserved niche.",
          slides: [
            {
              id: "s01",
              index: 1,
              title: "Whitespace",
              role: "analysis",
              question: "Where is the whitespace?",
              actionTitle: "Premium fleet operators remain underserved by broad aftermarket players",
              coreMessage: "The attractive whitespace sits in premium fleet service.",
              analysisOperator: "comparison",
              recommendedVisual: "2x2-matrix",
              requiredEvidence: ["competitor coverage"],
              dependencies: [],
              doNotCover: ["roadmap"],
              narrativeFunction: "Identify the wedge",
              tension: "Incumbents cover broad low-cost needs but not premium complexity.",
              implication: "The first wedge should target premium fleets.",
              claims: [
                {
                  claim: "Premium fleet operators remain underserved.",
                  supportType: "comparison",
                  evidenceRequired: "competitor coverage",
                  confidence: "known"
                }
              ],
              contentBlocks: [
                {
                  role: "comparison",
                  contentIntent: "Compare incumbent coverage against premium fleet needs.",
                  mustInclude: ["axis labels", "target segment"]
                }
              ],
              dataNeeds: [
                {
                  label: "competitor coverage benchmark",
                  purpose: "support the matrix position",
                  preferredFormat: "benchmark",
                  fallbackIfMissing: "use assumption marker"
                }
              ]
            }
          ]
        }
      ]
    });

    expect(validateDeckPlan(plan).ok).toBe(true);
    expect(plan.narrativeArc.tension).toContain("Broad aftermarket");
    expect(plan.evidencePack.knownFacts[0]!.id).toBe("e1");
    expect(plan.sections[0]!.slides[0]!.recommendedVisual).toBe("2x2-matrix");
    expect(plan.sections[0]!.slides[0]!.motionPreset).toBe("matrix-positioning");
    expect(plan.sections[0]!.slides[0]!.claims[0]!.supportType).toBe("comparison");
    expect(plan.sections[0]!.slides[0]!.contentBlocks[0]!.role).toBe("comparison");
  });

  it("accepts concise Chinese action titles when they state a conclusion", () => {
    const plan = normalizeDeckPlan({
      mainThesis: "SlideLeaf turns presentation creation into a controllable engineering workflow.",
      slides: [
        {
          id: "s01",
          index: 1,
          title: "Architecture",
          role: "analysis",
          question: "Why is the architecture defensible?",
          actionTitle: "自研编译架构构筑技术护城河",
          coreMessage: "The compiler-owned architecture makes generated decks stable and portable.",
          analysisOperator: "decomposition",
          recommendedVisual: "architecture-diagram",
          requiredEvidence: ["architecture notes"],
          dependencies: [],
          doNotCover: ["funding"],
          claims: [
            {
              claim: "The compiler architecture improves portability.",
              supportType: "logic",
              evidenceRequired: "architecture notes",
              confidence: "known"
            }
          ],
          contentBlocks: [
            {
              role: "method",
              contentIntent: "Show the compiler pipeline.",
              mustInclude: ["config", "slides", "theme", "runtime"]
            }
          ]
        }
      ]
    });

    expect(validateDeckPlan(plan).ok).toBe(true);
  });

  it("rejects short topic-label action titles", () => {
    const plan = normalizeDeckPlan({
      mainThesis: "SlideLeaf turns presentation creation into a controllable engineering workflow.",
      slides: [
        {
          id: "s01",
          index: 1,
          title: "Architecture",
          actionTitle: "架构",
          coreMessage: "The architecture is important.",
          analysisOperator: "decomposition",
          recommendedVisual: "architecture-diagram",
          requiredEvidence: ["architecture notes"],
          doNotCover: ["funding"]
        }
      ]
    });

    expect(validateDeckPlan(plan).errors).toContain(
      "s01: actionTitle must be a specific conclusion, not a short topic label"
    );
  });

  it("sanitizes slide fragments and adds required metadata", () => {
    const plan = normalizeDeckPlan({
      mainThesis: "Thesis",
      slides: [
        {
          id: "s01",
          index: 1,
          title: "Title",
          actionTitle: "This page proves the main thesis clearly",
          coreMessage: "Message",
          analysisOperator: "synthesis",
          recommendedVisual: "executive-summary",
          requiredEvidence: ["input"],
          doNotCover: ["details"]
        }
      ]
    });
    const slide = plan.sections[0]!.slides[0]!;
    const html = sanitizeSlideHtmlFragment(`<script>alert(1)</script><h1>Hello</h1>`, slide);
    expect(html).toContain('class="slide"');
    expect(html).toContain('data-slide-id="s01"');
    expect(html).not.toContain("<script");
    expect(html.trim()).toMatch(/<\/section>$/);
  });

  it("stabilizes template-root fragments into the shared slide contract", () => {
    const plan = normalizeDeckPlan({
      mainThesis: "Thesis",
      slides: [
        {
          id: "s01",
          index: 1,
          title: "Title",
          actionTitle: "This page proves the main thesis clearly",
          coreMessage: "Message",
          analysisOperator: "synthesis",
          recommendedVisual: "executive-summary",
          requiredEvidence: ["input"],
          doNotCover: ["details"]
        }
      ]
    });
    const slide = plan.sections[0]!.slides[0]!;
    const html = sanitizeSlideHtmlFragment(
      `<section class="slide style-template-loud" data-motion="static"><div class="content"><h1>Hello</h1></div></section>`,
      slide
    );
    expect(html).toContain('<section class="slide" data-slide-id="s01"');
    expect(html).not.toContain("style-template-loud");
    expect(html).toContain('class="slide-content"');
    expect(html).toContain('<div class="content"><h1>Hello</h1></div>');
  });

  it("repairs incomplete slide roots into a valid fragment wrapper", () => {
    const plan = normalizeDeckPlan({
      mainThesis: "Thesis",
      slides: [
        {
          id: "s01",
          index: 1,
          title: "Title",
          actionTitle: "This page proves the main thesis clearly",
          coreMessage: "Message",
          analysisOperator: "synthesis",
          recommendedVisual: "executive-summary",
          requiredEvidence: ["input"],
          doNotCover: ["details"]
        }
      ]
    });
    const slide = plan.sections[0]!.slides[0]!;
    const html = sanitizeSlideHtmlFragment(`<section class="slide"><h1>Incomplete`, slide);
    expect(html.trim()).toMatch(/^<section class="slide"/);
    expect(html).toContain("<h1>Incomplete");
    expect(html.trim()).toMatch(/<\/section>$/);
  });

  it("recovers the first slide when a model returns multiple slide roots", () => {
    const plan = normalizeDeckPlan({
      mainThesis: "Thesis",
      slides: [
        {
          id: "s01",
          index: 1,
          title: "Title",
          actionTitle: "This page proves the main thesis clearly",
          coreMessage: "Message",
          analysisOperator: "synthesis",
          recommendedVisual: "executive-summary",
          requiredEvidence: ["input"],
          doNotCover: ["details"]
        }
      ]
    });
    const slide = plan.sections[0]!.slides[0]!;
    const html = sanitizeSlideHtmlFragment(
      `<section class="slide"><h1>Generated slide</h1></section><section class="slide active"><h1>Old template</h1></section>`,
      slide
    );

    expect(html).toContain("Generated slide");
    expect(html).not.toContain("Old template");
    expect(html.match(/<section\b[^>]*class="slide/g)?.length).toBe(1);
  });

  it("removes inline SVG fragments while preserving valid slide wrappers", () => {
    const plan = normalizeDeckPlan({
      mainThesis: "Thesis",
      slides: [
        {
          id: "s02",
          index: 2,
          title: "Architecture",
          actionTitle: "The architecture separates policy control from execution",
          coreMessage: "Architecture is governed through a control plane.",
          analysisOperator: "decomposition",
          recommendedVisual: "architecture-diagram",
          requiredEvidence: ["architecture notes"],
          doNotCover: ["roadmap"]
        }
      ]
    });
    const slide = plan.sections[0]!.slides[0]!;
    const html = sanitizeSlideHtmlFragment(
      `<section class="slide"><svg viewBox="0 0 100 100"><foreignObject><div>bad</div></foreignObject><animate attributeName="x" /></svg></section>`,
      slide
    );

    expect(html).not.toContain("<svg");
    expect(html).not.toContain("foreignObject");
    expect(html).not.toContain("animate");
    expect(html.trim()).toMatch(/<\/section>$/);
  });
});
