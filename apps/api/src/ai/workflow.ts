export const WORKFLOW_STAGES = ["consultation", "slide_plan", "generate"] as const;
export const ARTIFACT_TYPES = ["brief", "slide_plan"] as const;

export type WorkflowStage = (typeof WORKFLOW_STAGES)[number];
export type ArtifactType = (typeof ARTIFACT_TYPES)[number];

export function isWorkflowStage(value: unknown): value is WorkflowStage {
  return typeof value === "string" && WORKFLOW_STAGES.includes(value as WorkflowStage);
}

export function normalizeWorkflowStage(value: unknown): WorkflowStage {
  if (value === "storyline") return "slide_plan";
  return isWorkflowStage(value) ? value : "consultation";
}

export function isArtifactType(value: unknown): value is ArtifactType {
  return typeof value === "string" && ARTIFACT_TYPES.includes(value as ArtifactType);
}

export function nextStageAfterApproval(type: ArtifactType): WorkflowStage {
  if (type === "brief") return "slide_plan";
  return "generate";
}

export function stageForArtifact(type: ArtifactType): WorkflowStage {
  if (type === "brief") return "consultation";
  return "slide_plan";
}

export function artifactLabel(type: ArtifactType): string {
  if (type === "brief") return "Consultation brief";
  return "Plan";
}

export function buildArtifactSystemPrompt(type: ArtifactType): string {
  const base = `You are helping build an AI-native HTML Slide Studio deck through controlled generation.
Return only valid JSON. Do not include markdown fences or explanation.
The user must review and approve this artifact before later stages can continue.`;

  if (type === "brief") {
    return `${base}

Generate a consultation brief. If important information is missing, include concise clarification questions.
Schema:
{
  "summary": "1-2 sentence understanding of the deck request",
  "topic": "deck topic",
  "audience": "target audience or unknown",
  "purpose": "presentation purpose",
  "tone": "visual/content tone",
  "language": "language preference",
  "slideCount": "number or range",
  "mustInclude": ["important content"],
  "unknowns": ["missing inputs"],
  "clarifyingQuestions": ["question"]
}`;
  }

  return `${base}

Generate one integrated plan. Do not write HTML.
The plan must combine narrative logic, action titles, slide structure, layout choices, content blocks, and design direction.
Schema:
{
  "narrativeArc": "overall argument or story logic",
  "designDirection": "overall visual system",
  "slides": [
    {
      "id": "s1",
      "index": 1,
      "layout": "hero | two-column | 2x2-matrix | timeline | comparison-table | roadmap | architecture-diagram | kpi-cards | closing",
      "visualPattern": "specific pattern",
      "actionTitle": "clear claim, not a topic label",
      "message": "main idea",
      "supportingPoints": ["point"],
      "evidenceNeeded": ["optional data/source"],
      "contentBlocks": [
        { "type": "headline | paragraph | bullets | metric | table | diagram-node", "text": "content" }
      ],
      "designNotes": {
        "mood": "specific mood",
        "avoid": ["visual mistakes to avoid"]
      }
    }
  ]
}`;
}
