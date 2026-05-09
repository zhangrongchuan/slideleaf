import { createHash } from "node:crypto";

export const ANALYSIS_OPERATORS = [
  "comparison",
  "decomposition",
  "trend",
  "segmentation",
  "causality",
  "prioritization",
  "scenario",
  "roadmap",
  "risk",
  "synthesis"
] as const;

export const RECOMMENDED_VISUALS = [
  "bar-chart",
  "line-chart",
  "waterfall",
  "2x2-matrix",
  "issue-tree",
  "roadmap",
  "comparison-table",
  "executive-summary",
  "risk-matrix",
  "architecture-diagram",
  "metric-system",
  "narrative-timeline"
] as const;

export const MOTION_PRESETS = [
  "static",
  "progressive-reveal",
  "chart-build",
  "matrix-positioning",
  "flow-draw",
  "focus-highlight",
  "timeline-step",
  "roadmap-build"
] as const;

export type AnalysisOperator = (typeof ANALYSIS_OPERATORS)[number];
export type RecommendedVisual = (typeof RECOMMENDED_VISUALS)[number];
export type MotionPreset = (typeof MOTION_PRESETS)[number];

export type DeckBrief = {
  topic: string;
  audience: string;
  objective: string;
  tone: string;
  language: string;
  textDensity?: string;
};

export type DeckSectionPlan = {
  id: string;
  title: string;
  role: string;
  coreMessage: string;
  slides: DeckSlidePlan[];
};

export type DeckNarrativeArc = {
  startingBelief: string;
  tension: string;
  turningPoint: string;
  resolution: string;
  decisionAsk: string;
  storylineBeats: string[];
};

export type EvidenceItem = {
  id: string;
  statement: string;
  type: "user-provided" | "file-derived" | "assumption" | "placeholder";
  appliesTo: string[];
  confidence: "high" | "medium" | "low";
  source?: string;
};

export type EvidenceNeed = {
  id: string;
  label: string;
  purpose: string;
  preferredFormat: "number" | "range" | "benchmark" | "ranking" | "quote" | "source" | "case-example";
  fallbackIfMissing: string;
  appliesTo: string[];
};

export type SourceNote = {
  id: string;
  label: string;
  sourceType: string;
  note: string;
};

export type EvidencePack = {
  knownFacts: EvidenceItem[];
  userClaims: EvidenceItem[];
  assumptions: EvidenceItem[];
  missingEvidence: EvidenceNeed[];
  sourceNotes: SourceNote[];
};

export type SlideClaim = {
  claim: string;
  supportType: "metric" | "comparison" | "example" | "quote" | "case" | "logic";
  evidenceRequired: string;
  confidence: "known" | "assumption" | "placeholder";
};

export type EvidenceSlot = {
  id: string;
  purpose: string;
  evidenceIds: string[];
  fallbackIfMissing: string;
};

export type ContentBlockPlan = {
  role:
    | "headline"
    | "proof-point"
    | "counterpoint"
    | "metric"
    | "comparison"
    | "case-example"
    | "method"
    | "implication"
    | "source-note";
  contentIntent: string;
  mustInclude: string[];
};

export type DataNeed = {
  label: string;
  purpose: string;
  preferredFormat: "number" | "range" | "benchmark" | "ranking" | "quote" | "source" | "case-example";
  fallbackIfMissing: string;
};

export type DeckSlidePlan = {
  id: string;
  index: number;
  title: string;
  role: string;
  question: string;
  actionTitle: string;
  coreMessage: string;
  analysisOperator: AnalysisOperator;
  recommendedVisual: RecommendedVisual;
  requiredEvidence: string[];
  dependencies: string[];
  doNotCover: string[];
  motionPreset?: MotionPreset;
  narrativeFunction: string;
  transitionFromPrevious: string;
  transitionToNext: string;
  tension: string;
  implication: string;
  claims: SlideClaim[];
  evidenceSlots: EvidenceSlot[];
  contentBlocks: ContentBlockPlan[];
  dataNeeds: DataNeed[];
};

export type DeckPlan = {
  brief: DeckBrief;
  mainThesis: string;
  narrativeArc: DeckNarrativeArc;
  evidencePack: EvidencePack;
  sections: DeckSectionPlan[];
  globalStyle: Record<string, unknown>;
  terminology: string[];
  evidencePlan: Record<string, unknown>;
  generationRules: {
    maxRepeatedVisualType: number;
    maxBulletOnlySlides: number;
    requiredAnalysisOperators: string[];
    requiredSlideRoles: string[];
    titleStyle: "action-title";
    oneMessagePerSlide: true;
  };
};

export type DeckPlanValidation = {
  ok: boolean;
  errors: string[];
  warnings: string[];
};

export function normalizeDeckPlan(raw: unknown): DeckPlan {
  const record = asRecord(raw);
  const mainThesis = readable(record.mainThesis) || readable(record.narrativeArc) || "The deck should present a clear, evidence-backed recommendation.";
  const flatSlides = Array.isArray(record.slides) ? record.slides.map(asRecord) : [];
  const sectionsRaw = Array.isArray(record.sections) ? record.sections.map(asRecord) : [];
  const sections =
    sectionsRaw.length > 0
      ? sectionsRaw.map((section, index) => normalizeSection(section, index))
      : [
          {
            id: "section-1",
            title: "Deck flow",
            role: "analysis",
            coreMessage: readable(record.narrativeArc) || readable(record.mainThesis) || "Structured presentation flow",
            slides: flatSlides.map((slide, index) => normalizeSlide(slide, index))
          }
        ];

  return {
    brief: normalizeBrief(record.brief ?? record),
    mainThesis,
    narrativeArc: normalizeNarrativeArc(record.narrativeArc, mainThesis),
    evidencePack: normalizeEvidencePack(record.evidencePack ?? record.evidencePlan),
    sections,
    globalStyle: Object.keys(asRecord(record.globalStyle)).length ? asRecord(record.globalStyle) : asRecord(record.designSystem),
    terminology: listOfStrings(record.terminology),
    evidencePlan: asRecord(record.evidencePlan),
    generationRules: normalizeGenerationRules(record.generationRules)
  };
}

export function validateDeckPlan(plan: DeckPlan): DeckPlanValidation {
  const errors: string[] = [];
  const warnings: string[] = [];
  const slides = flattenDeckSlides(plan);
  const ids = new Set<string>();

  if (!plan.mainThesis.trim()) errors.push("DeckPlan.mainThesis is required");
  if (!slides.length) errors.push("DeckPlan must contain at least one slide");
  if (!plan.narrativeArc.tension || !plan.narrativeArc.turningPoint || !plan.narrativeArc.resolution) {
    warnings.push("DeckPlan.narrativeArc should include tension, turningPoint, and resolution for stronger storytelling");
  }
  if (
    plan.evidencePack.knownFacts.length + plan.evidencePack.userClaims.length + plan.evidencePack.assumptions.length === 0 &&
    plan.evidencePack.missingEvidence.length === 0
  ) {
    warnings.push("DeckPlan.evidencePack is empty; generated slides may lack information density");
  }

  for (const slide of slides) {
    if (ids.has(slide.id)) errors.push(`Duplicate slide id: ${slide.id}`);
    ids.add(slide.id);
    if (isWeakActionTitle(slide.actionTitle)) {
      errors.push(`${slide.id}: actionTitle must be a specific conclusion, not a short topic label`);
    }
    if (!slide.question) errors.push(`${slide.id}: question is required`);
    if (!slide.coreMessage) errors.push(`${slide.id}: coreMessage is required`);
    if (!ANALYSIS_OPERATORS.includes(slide.analysisOperator)) {
      errors.push(`${slide.id}: unsupported analysisOperator ${slide.analysisOperator}`);
    }
    if (!RECOMMENDED_VISUALS.includes(slide.recommendedVisual)) {
      errors.push(`${slide.id}: unsupported recommendedVisual ${slide.recommendedVisual}`);
    }
    if (!slide.requiredEvidence.length) warnings.push(`${slide.id}: requiredEvidence is empty`);
    if (!slide.doNotCover.length) warnings.push(`${slide.id}: doNotCover is empty; repetition risk is higher`);
    if (!slide.claims.length) warnings.push(`${slide.id}: claims are empty; slide may become too shallow`);
    if (!slide.contentBlocks.length) warnings.push(`${slide.id}: contentBlocks are empty; slide lacks a detailed content skeleton`);
    if (!slide.implication) warnings.push(`${slide.id}: implication is empty`);
  }

  for (const slide of slides) {
    for (const dependency of slide.dependencies) {
      if (!ids.has(dependency)) errors.push(`${slide.id}: dependency does not exist: ${dependency}`);
    }
  }
  if (hasCycle(slides)) errors.push("Slide dependencies must form a DAG");

  for (let index = 1; index < slides.length; index += 1) {
    const prev = slides[index - 1]!;
    const current = slides[index]!;
    if (prev.recommendedVisual === current.recommendedVisual) {
      warnings.push(`${current.id}: repeats visual type from previous slide (${current.recommendedVisual})`);
    }
    if (prev.analysisOperator === current.analysisOperator) {
      warnings.push(`${current.id}: repeats analysis operator from previous slide (${current.analysisOperator})`);
    }
  }

  return { ok: errors.length === 0, errors, warnings };
}

function isWeakActionTitle(actionTitle: string): boolean {
  const title = actionTitle.trim().replace(/\s+/g, " ");
  if (!title) return true;

  const cleaned = title
    .replace(/[：:|/\\\-–—·•,，.。!?！？（）()[\]【】{}]/g, "")
    .trim();
  const lower = cleaned.toLowerCase();
  if (!cleaned) return true;

  const topicLabels = new Set([
    "agenda",
    "summary",
    "overview",
    "context",
    "problem",
    "solution",
    "market",
    "product",
    "architecture",
    "workflow",
    "roadmap",
    "competition",
    "team",
    "financials",
    "funding",
    "ask",
    "next steps",
    "introduction",
    "conclusion",
    "目录",
    "总结",
    "概览",
    "背景",
    "问题",
    "解决方案",
    "市场",
    "产品",
    "架构",
    "工作流",
    "路线图",
    "竞品",
    "竞争",
    "团队",
    "融资",
    "财务",
    "下一步",
    "结论"
  ]);
  if (topicLabels.has(lower) || topicLabels.has(cleaned)) return true;

  const cjkCount = (cleaned.match(/[\u3400-\u9fff]/g) ?? []).length;
  const words = cleaned.match(/[a-z0-9]+(?:'[a-z0-9]+)?/gi) ?? [];
  const mostlyCjk = cjkCount >= Math.max(4, words.length);

  if (mostlyCjk) {
    return cjkCount < 8 && cleaned.length < 14;
  }

  return words.length < 5 && cleaned.length < 28;
}

export function flattenDeckSlides(plan: DeckPlan): DeckSlidePlan[] {
  return plan.sections
    .flatMap((section) => section.slides)
    .sort((a, b) => a.index - b.index);
}

export function deckPlanHash(plan: DeckPlan): string {
  return createHash("sha256").update(JSON.stringify(plan)).digest("hex").slice(0, 24);
}

export function slideFilePath(slide: DeckSlidePlan): string {
  const index = String(slide.index).padStart(2, "0");
  const slug = slugify(slide.title || slide.actionTitle || slide.id);
  return `slides/${index}-${slug || slide.id}.html`;
}

export function sanitizeSlideHtmlFragment(html: string, slide: DeckSlidePlan): string {
  const cleaned = html
    .replace(/<!doctype[\s\S]*?>/gi, "")
    .replace(/<\/?(?:html|head|body)\b[^>]*>/gi, "")
    .replace(/<style\b[\s\S]*?<\/style>/gi, "")
    .replace(/<script\b[\s\S]*?<\/script>/gi, "")
    .replace(/<svg\b[\s\S]*?<\/svg>/gi, "")
    .replace(/<svg\b[^>]*\/?>/gi, "")
    .replace(/<foreignObject\b[\s\S]*?<\/foreignObject>/gi, "")
    .replace(/<foreignObject\b[^>]*\/?>/gi, "")
    .replace(/<(animate|animateMotion|animateTransform|set)\b[^>]*(?:\/>|>[\s\S]*?<\/\1>)/gi, "")
    .replace(/<(?:iframe|object|embed|link|meta|base)\b[\s\S]*?>/gi, "")
    .replace(/\s+on[a-z]+\s*=\s*"[^"]*"/gi, "")
    .replace(/\s+on[a-z]+\s*=\s*'[^']*'/gi, "")
    .replace(/\b(href|src)\s*=\s*(["'])\s*javascript:[\s\S]*?\2/gi, '$1="#"')
    .trim();

  if (isCompleteSingleSlideRoot(cleaned)) {
    return ensureSlideMetadata(cleaned, slide);
  }

  const recoveredRoot = recoverFirstSlideRoot(cleaned);
  if (recoveredRoot && isCompleteSingleSlideRoot(recoveredRoot)) {
    return ensureSlideMetadata(recoveredRoot, slide);
  }

  return `<section class="slide" data-slide-id="${escapeAttr(slide.id)}" data-motion="${escapeAttr(
    slide.motionPreset ?? motionPresetFor(slide)
  )}" data-visual="${escapeAttr(slide.recommendedVisual)}">
${stripBrokenSlideRootTags(cleaned)}
</section>
`;
}

export function buildProjectConfig(plan: DeckPlan): string {
  return JSON.stringify(
    {
      name: plan.brief.topic || "SlideLeaf Presentation",
      slides: flattenDeckSlides(plan).map(slideFilePath),
      theme: "themes/deck.css",
      runtime: "runtime/deck.js",
      slideSize: "16:9",
      generationMode: "multi-slide",
      planHash: deckPlanHash(plan)
    },
    null,
    2
  );
}

export function buildDefaultDeckCss(plan: DeckPlan): string {
  const palette = Array.isArray(plan.globalStyle.palette)
    ? plan.globalStyle.palette.map(readable).filter(Boolean)
    : [];
  const accent = palette.find((color) => /^#[0-9a-f]{6}$/i.test(color)) ?? "#2563eb";
  return `:root {
  --bg: #f8fafc;
  --fg: #0f172a;
  --muted: #64748b;
  --accent: ${accent};
  --accent-soft: color-mix(in srgb, var(--accent) 14%, white);
  --panel: #ffffff;
  --border: #dbe3ef;
}

body {
  margin: 0;
  background: #07111f;
  color: var(--fg);
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  overflow: hidden;
}

.slide {
  width: 100vw;
  height: 100vh;
  height: 100dvh;
  overflow: hidden;
  box-sizing: border-box;
  background:
    radial-gradient(circle at 84% 14%, color-mix(in srgb, var(--accent) 16%, transparent), transparent 30%),
    linear-gradient(135deg, #ffffff 0%, #f3f7fb 100%);
}

.slide-content {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  padding: clamp(40px, 5.8vw, 76px);
}

.slide-content.narrow {
  display: grid;
  place-items: center;
  text-align: center;
}

.content-frame {
  width: min(1120px, 100%);
  margin: 0 auto;
}

.content-frame.narrow {
  width: min(900px, 100%);
}

.two-column {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(360px, 0.9fr);
  gap: clamp(28px, 5vw, 64px);
  align-items: center;
}

.eyebrow,
.kicker {
  display: inline-flex;
  margin-bottom: 18px;
  border-radius: 999px;
  background: var(--accent-soft);
  color: var(--accent);
  padding: 8px 13px;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0;
  text-transform: uppercase;
}

h1 {
  margin: 0;
  max-width: 980px;
  font-size: clamp(40px, 5.4vw, 74px);
  line-height: 0.98;
  letter-spacing: 0;
}

h2 {
  margin: 0;
  font-size: clamp(30px, 4vw, 52px);
  line-height: 1.04;
  letter-spacing: 0;
}

p {
  margin: 20px 0 0;
  max-width: 760px;
  color: var(--muted);
  font-size: clamp(17px, 1.8vw, 23px);
  line-height: 1.5;
}

.card-grid,
.metric-grid,
.matrix-grid {
  display: grid;
  gap: 18px;
  margin-top: 32px;
}

.card-grid.three,
.metric-grid.three {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.card,
.metric,
.callout,
.flow-node,
.matrix-cell {
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--panel);
  box-shadow: 0 16px 38px rgba(15, 23, 42, 0.08);
  padding: 22px;
}

.metric strong {
  display: block;
  color: var(--accent);
  font-size: clamp(34px, 4vw, 58px);
  line-height: 1;
}

.metric span,
.card span {
  display: block;
  margin-top: 10px;
  color: var(--muted);
  line-height: 1.45;
}

.matrix-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.flow-stack {
  display: grid;
  gap: 12px;
}

.flow-node {
  font-weight: 800;
}

.visual-panel,
.chart-panel,
.diagram-panel {
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--panel);
  box-shadow: 0 16px 38px rgba(15, 23, 42, 0.08);
  padding: clamp(18px, 2.4vw, 28px);
}

.bar-list,
.timeline-list,
.roadmap-list {
  display: grid;
  gap: 14px;
}

.bar-row {
  display: grid;
  grid-template-columns: minmax(120px, 0.38fr) minmax(0, 1fr) auto;
  gap: 12px;
  align-items: center;
  color: var(--muted);
  font-weight: 700;
}

.bar-track {
  height: 14px;
  overflow: hidden;
  border-radius: 999px;
  background: color-mix(in srgb, var(--muted) 14%, white);
}

.bar-fill {
  height: 100%;
  border-radius: inherit;
  background: var(--accent);
}

.timeline-item,
.roadmap-item {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 14px;
  align-items: start;
}

.timeline-marker,
.roadmap-marker {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border-radius: 999px;
  background: var(--accent-soft);
  color: var(--accent);
  font-weight: 900;
}

table {
  width: 100%;
  border-collapse: collapse;
  overflow: hidden;
  border-radius: 12px;
  background: white;
  box-shadow: 0 16px 38px rgba(15, 23, 42, 0.08);
}

th,
td {
  border-bottom: 1px solid var(--border);
  padding: 14px 16px;
  text-align: left;
  vertical-align: top;
}

th {
  background: #f8fafc;
  color: #334155;
  font-size: 13px;
  text-transform: uppercase;
}

[data-reveal] {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

@media (max-width: 900px) {
  .two-column,
  .card-grid.three,
  .metric-grid.three,
  .matrix-grid {
    grid-template-columns: 1fr;
  }
}
`;
}

export function buildDefaultDeckRuntime(): string {
  return `(() => {
  // SlideLeaf renderer owns slide navigation, counters, progress, and active state.
  // Keep project runtime as an optional extension surface for non-navigation behavior.
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    document.documentElement.dataset.reducedMotion = "true";
  }
})();`;
}

function normalizeSection(section: Record<string, unknown>, index: number): DeckSectionPlan {
  const slides = Array.isArray(section.slides) ? section.slides.map(asRecord).map(normalizeSlide) : [];
  return {
    id: readable(section.id) || `section-${index + 1}`,
    title: readable(section.title) || `Section ${index + 1}`,
    role: readable(section.role) || "analysis",
    coreMessage: readable(section.coreMessage) || readable(section.message) || readable(section.title) || "",
    slides
  };
}

function normalizeNarrativeArc(raw: unknown, mainThesis: string): DeckNarrativeArc {
  const record = asRecord(raw);
  const text = readable(raw);
  return {
    startingBelief: readable(record.startingBelief) || "",
    tension: readable(record.tension) || "",
    turningPoint: readable(record.turningPoint) || "",
    resolution: readable(record.resolution) || text || mainThesis,
    decisionAsk: readable(record.decisionAsk) || "",
    storylineBeats: listOfStrings(record.storylineBeats ?? record.beats)
  };
}

function normalizeEvidencePack(raw: unknown): EvidencePack {
  const record = asRecord(raw);
  return {
    knownFacts: normalizeEvidenceItems(record.knownFacts ?? record.knownEvidence, "user-provided"),
    userClaims: normalizeEvidenceItems(record.userClaims, "user-provided"),
    assumptions: normalizeEvidenceItems(record.assumptions, "assumption"),
    missingEvidence: normalizeEvidenceNeeds(record.missingEvidence ?? record.dataNeeds),
    sourceNotes: normalizeSourceNotes(record.sourceNotes ?? record.sources)
  };
}

function normalizeEvidenceItems(raw: unknown, fallbackType: EvidenceItem["type"]): EvidenceItem[] {
  const items = Array.isArray(raw) ? raw : readable(raw) ? [raw] : [];
  return items.map((item, index) => {
    const record = asRecord(item);
    const statement = readable(record.statement) || readable(record.text) || readable(record.claim) || readable(item);
    return {
      id: readable(record.id) || `e${index + 1}`,
      statement,
      type: normalizeEnum(readable(record.type), ["user-provided", "file-derived", "assumption", "placeholder"] as const, fallbackType),
      appliesTo: listOfStrings(record.appliesTo),
      confidence: normalizeEnum(readable(record.confidence), ["high", "medium", "low"] as const, "medium"),
      source: readable(record.source) || undefined
    };
  }).filter((item) => item.statement);
}

function normalizeEvidenceNeeds(raw: unknown): EvidenceNeed[] {
  const items = Array.isArray(raw) ? raw : readable(raw) ? [raw] : [];
  return items.map((item, index) => {
    const record = asRecord(item);
    const label = readable(record.label) || readable(record.name) || readable(item);
    return {
      id: readable(record.id) || `need${index + 1}`,
      label,
      purpose: readable(record.purpose) || readable(record.reason) || label,
      preferredFormat: normalizePreferredFormat(record.preferredFormat ?? record.format),
      fallbackIfMissing: readable(record.fallbackIfMissing) || "Use an explicit placeholder or assumption label.",
      appliesTo: listOfStrings(record.appliesTo)
    };
  }).filter((item) => item.label);
}

function normalizeSourceNotes(raw: unknown): SourceNote[] {
  const items = Array.isArray(raw) ? raw : readable(raw) ? [raw] : [];
  return items.map((item, index) => {
    const record = asRecord(item);
    const label = readable(record.label) || readable(record.name) || readable(item);
    return {
      id: readable(record.id) || `source${index + 1}`,
      label,
      sourceType: readable(record.sourceType) || readable(record.type) || "unspecified",
      note: readable(record.note) || readable(record.description) || label
    };
  }).filter((item) => item.label || item.note);
}

function normalizeSlideClaims(raw: unknown, fallbackClaim: string): SlideClaim[] {
  const items = Array.isArray(raw) ? raw : readable(raw) ? [raw] : [];
  const claims = items.map((item) => {
    const record = asRecord(item);
    const claim = readable(record.claim) || readable(record.statement) || readable(item);
    return {
      claim,
      supportType: normalizeEnum(readable(record.supportType), ["metric", "comparison", "example", "quote", "case", "logic"] as const, "logic"),
      evidenceRequired: readable(record.evidenceRequired) || readable(record.evidence) || "",
      confidence: normalizeEnum(readable(record.confidence), ["known", "assumption", "placeholder"] as const, "placeholder")
    };
  }).filter((item) => item.claim);

  if (claims.length) return claims;
  return fallbackClaim
    ? [
        {
          claim: fallbackClaim,
          supportType: "logic",
          evidenceRequired: "Evidence or a clearly marked assumption is needed.",
          confidence: "placeholder"
        }
      ]
    : [];
}

function normalizeEvidenceSlots(raw: unknown): EvidenceSlot[] {
  const items = Array.isArray(raw) ? raw : readable(raw) ? [raw] : [];
  return items.map((item, index) => {
    const record = asRecord(item);
    const purpose = readable(record.purpose) || readable(record.label) || readable(item);
    return {
      id: readable(record.id) || `slot${index + 1}`,
      purpose,
      evidenceIds: listOfStrings(record.evidenceIds ?? record.evidenceId),
      fallbackIfMissing: readable(record.fallbackIfMissing) || "Mark this as an assumption or placeholder."
    };
  }).filter((item) => item.purpose);
}

function normalizeContentBlocks(raw: unknown): ContentBlockPlan[] {
  const items = Array.isArray(raw) ? raw : readable(raw) ? [raw] : [];
  return items.map((item) => {
    const record = asRecord(item);
    const contentIntent = readable(record.contentIntent) || readable(record.intent) || readable(record.content) || readable(item);
    return {
      role: normalizeEnum(
        readable(record.role),
        ["headline", "proof-point", "counterpoint", "metric", "comparison", "case-example", "method", "implication", "source-note"] as const,
        "proof-point"
      ),
      contentIntent,
      mustInclude: listOfStrings(record.mustInclude)
    };
  }).filter((item) => item.contentIntent);
}

function normalizeDataNeeds(raw: unknown): DataNeed[] {
  const items = Array.isArray(raw) ? raw : readable(raw) ? [raw] : [];
  return items.map((item) => {
    const record = asRecord(item);
    const label = readable(record.label) || readable(record.name) || readable(item);
    return {
      label,
      purpose: readable(record.purpose) || readable(record.reason) || label,
      preferredFormat: normalizePreferredFormat(record.preferredFormat ?? record.format),
      fallbackIfMissing: readable(record.fallbackIfMissing) || "Use a labeled placeholder."
    };
  }).filter((item) => item.label);
}

function normalizePreferredFormat(raw: unknown): DataNeed["preferredFormat"] {
  return normalizeEnum(
    readable(raw),
    ["number", "range", "benchmark", "ranking", "quote", "source", "case-example"] as const,
    "source"
  );
}

function normalizeSlide(slide: Record<string, unknown>, index: number): DeckSlidePlan {
  const operator = normalizeEnum(readable(slide.analysisOperator) || readable(slide.operator), ANALYSIS_OPERATORS, "synthesis");
  const visual = normalizeEnum(readable(slide.recommendedVisual) || readable(slide.visualPattern) || readable(slide.layout), RECOMMENDED_VISUALS, "executive-summary");
  return {
    id: readable(slide.id) || `s${String(index + 1).padStart(2, "0")}`,
    index: Number.parseInt(readable(slide.index), 10) || index + 1,
    title: readable(slide.title) || readable(slide.actionTitle) || `Slide ${index + 1}`,
    role: readable(slide.role) || readable(slide.visualRole) || "analysis",
    question: readable(slide.question) || `What should the audience understand on slide ${index + 1}?`,
    actionTitle: readable(slide.actionTitle) || readable(slide.title) || `Slide ${index + 1} advances the deck argument`,
    coreMessage: readable(slide.coreMessage) || readable(slide.message) || readable(slide.actionTitle) || "",
    analysisOperator: operator,
    recommendedVisual: visual,
    requiredEvidence: listOfStrings(slide.requiredEvidence),
    dependencies: listOfStrings(slide.dependencies),
    doNotCover: listOfStrings(slide.doNotCover),
    motionPreset: normalizeEnum(readable(slide.motionPreset), MOTION_PRESETS, motionPresetForVisual(visual)),
    narrativeFunction:
      readable(slide.narrativeFunction) ||
      readable(slide.role) ||
      "Advance the deck argument with one evidence-backed message.",
    transitionFromPrevious: readable(slide.transitionFromPrevious),
    transitionToNext: readable(slide.transitionToNext),
    tension: readable(slide.tension),
    implication: readable(slide.implication) || readable(slide.coreMessage) || readable(slide.actionTitle) || "",
    claims: normalizeSlideClaims(slide.claims ?? slide.supportingClaims, readable(slide.coreMessage) || readable(slide.actionTitle)),
    evidenceSlots: normalizeEvidenceSlots(slide.evidenceSlots ?? slide.requiredEvidence),
    contentBlocks: normalizeContentBlocks(slide.contentBlocks),
    dataNeeds: normalizeDataNeeds(slide.dataNeeds)
  };
}

function normalizeBrief(raw: unknown): DeckBrief {
  const record = asRecord(raw);
  return {
    topic: readable(record.topic) || readable(record.summary) || "SlideLeaf Presentation",
    audience: readable(record.audience) || "executive audience",
    objective: readable(record.objective) || readable(record.purpose) || "make a clear, evidence-backed decision case",
    tone: readable(record.tone) || "professional, crisp, investor-grade",
    language: readable(record.language) || "match the user's language",
    textDensity: readable(record.textDensity) || "balanced"
  };
}

function normalizeGenerationRules(raw: unknown): DeckPlan["generationRules"] {
  const record = asRecord(raw);
  return {
    maxRepeatedVisualType: Number.parseInt(readable(record.maxRepeatedVisualType), 10) || 2,
    maxBulletOnlySlides: Number.parseInt(readable(record.maxBulletOnlySlides), 10) || 1,
    requiredAnalysisOperators: listOfStrings(record.requiredAnalysisOperators),
    requiredSlideRoles: listOfStrings(record.requiredSlideRoles),
    titleStyle: "action-title",
    oneMessagePerSlide: true
  };
}

function motionPresetFor(slide: DeckSlidePlan): MotionPreset {
  return slide.motionPreset ?? motionPresetForVisual(slide.recommendedVisual);
}

function motionPresetForVisual(visual: RecommendedVisual): MotionPreset {
  if (visual === "line-chart" || visual === "bar-chart" || visual === "waterfall") return "chart-build";
  if (visual === "2x2-matrix") return "matrix-positioning";
  if (visual === "roadmap") return "roadmap-build";
  if (visual === "architecture-diagram" || visual === "issue-tree") return "flow-draw";
  if (visual === "risk-matrix" || visual === "comparison-table") return "focus-highlight";
  return "progressive-reveal";
}

function isCompleteSingleSlideRoot(html: string): boolean {
  const cleaned = html.trim();
  const rootMatches = [
    ...cleaned.matchAll(/<(section|article)\b[^>]*\bclass=(["'])[^"']*\bslide\b[^"']*\2[^>]*>/gi)
  ];
  return (
    rootMatches.length === 1 &&
    /^\s*<(section|article)\b[^>]*\bclass=(["'])[^"']*\bslide\b[^"']*\2[^>]*>[\s\S]*<\/\1>\s*$/i.test(cleaned)
  );
}

function stripBrokenSlideRootTags(html: string): string {
  return html
    .replace(/^\s*<(section|article)\b[^>]*\bclass=(["'])[^"']*\bslide\b[^"']*\2[^>]*>/i, "")
    .replace(/<\/(section|article)>\s*$/i, "")
    .replace(/<\/?(section|article)\b[^>]*\bclass=(["'])[^"']*\bslide\b[^"']*\2[^>]*>/gi, "")
    .trim();
}

function recoverFirstSlideRoot(html: string): string | null {
  const match = /<(section|article)\b[^>]*\bclass=(["'])[^"']*\bslide\b[^"']*\2[^>]*>/i.exec(html);
  if (!match || match.index === undefined) return null;
  const tag = match[1]!;
  const start = match.index;
  const afterOpen = start + match[0].length;
  const closeMatch = new RegExp(`</${tag}>`, "i").exec(html.slice(afterOpen));
  if (!closeMatch || closeMatch.index === undefined) return null;
  const end = afterOpen + closeMatch.index + closeMatch[0].length;
  return html.slice(start, end).trim();
}

function ensureSlideMetadata(html: string, slide: DeckSlidePlan): string {
  return html.replace(/<(section|article)\b([^>]*)>/i, (match, tag: string, attrs: string) => {
    const withId = /\sdata-slide-id=/.test(attrs) ? attrs : `${attrs} data-slide-id="${escapeAttr(slide.id)}"`;
    const withMotion = /\sdata-motion=/.test(withId)
      ? withId
      : `${withId} data-motion="${escapeAttr(motionPresetFor(slide))}"`;
    const withVisual = /\sdata-visual=/.test(withMotion)
      ? withMotion
      : `${withMotion} data-visual="${escapeAttr(slide.recommendedVisual)}"`;
    return `<${tag}${withVisual}>`;
  });
}

function hasCycle(slides: DeckSlidePlan[]): boolean {
  const byId = new Map(slides.map((slide) => [slide.id, slide]));
  const visiting = new Set<string>();
  const visited = new Set<string>();
  const visit = (id: string): boolean => {
    if (visited.has(id)) return false;
    if (visiting.has(id)) return true;
    visiting.add(id);
    for (const dependency of byId.get(id)?.dependencies ?? []) {
      if (visit(dependency)) return true;
    }
    visiting.delete(id);
    visited.add(id);
    return false;
  };
  return slides.some((slide) => visit(slide.id));
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function listOfStrings(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(readable).filter(Boolean);
  const text = readable(value);
  return text ? [text] : [];
}

function readable(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return "";
}

function normalizeEnum<const T extends readonly string[]>(input: string, values: T, fallback: T[number]): T[number] {
  const normalized = input.toLowerCase().replace(/_/g, "-");
  return (values.find((value) => value === normalized) ?? fallback) as T[number];
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fff]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

function escapeAttr(input: string): string {
  return input.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}
