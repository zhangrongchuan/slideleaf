import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export type PlaybookCategory =
  | "deck-archetype"
  | "analysis-operator"
  | "visual-pattern"
  | "motion-preset"
  | "style-direction"
  | "qa-rule"
  | "example";

export type PlaybookEntry = {
  id: string;
  category: PlaybookCategory;
  title: string;
  tags: string[];
  sourceInfluences: string[];
  whenToUse: string[];
  whenNotToUse: string[];
  goodStructure: string[];
  antiPatterns: string[];
  evidenceRequirements: string[];
  suggestedVisualComponents: string[];
  motionPreset: string;
  cssTokens: string;
  coreCssGrammar: string;
  motionAndEffects: string;
  exampleMarkup: string;
  qaChecklist: string[];
  filePath: string;
  body: string;
};

export type PlaybookQuery = {
  deckArchetype?: string;
  analysisOperator?: string;
  visualPattern?: string;
  motionPreset?: string;
  slideRole?: string;
  styleDirection?: string;
  mood?: string | string[];
  tone?: string | string[];
  occasion?: string;
  audience?: string;
  textDensity?: string;
  scheme?: string;
  brief?: string;
  extraTerms?: Array<string | undefined>;
  limit?: number;
};

export type PlaybookIndex = {
  categories: Record<PlaybookCategory, string[]>;
  tags: Record<string, string[]>;
  entries: Array<{
    id: string;
    category: PlaybookCategory;
    title: string;
    tags: string[];
    sourceInfluences: string[];
    filePath: string;
  }>;
};

export type PlaybookSelection = {
  selected: PlaybookEntry[];
  alternates: PlaybookEntry[];
};

type Frontmatter = Record<string, string>;

type ParsedMarkdown = {
  metadata: Frontmatter;
  body: string;
};

const CONTENT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../content");

const CATEGORY_SET = new Set<PlaybookCategory>([
  "deck-archetype",
  "analysis-operator",
  "visual-pattern",
  "motion-preset",
  "style-direction",
  "qa-rule",
  "example"
]);

const LIST_SECTIONS = {
  "when to use": "whenToUse",
  "when not to use": "whenNotToUse",
  "good structure": "goodStructure",
  "anti patterns": "antiPatterns",
  "anti-patterns": "antiPatterns",
  "evidence requirements": "evidenceRequirements",
  "suggested visual components": "suggestedVisualComponents",
  "qa checklist": "qaChecklist"
} as const;

type ListSectionName = keyof typeof LIST_SECTIONS;
type ListFieldName = (typeof LIST_SECTIONS)[ListSectionName];

export const PLAYBOOK_ENTRIES: PlaybookEntry[] = loadPlaybookEntries();
export const PLAYBOOK_INDEX: PlaybookIndex = buildPlaybookIndex(PLAYBOOK_ENTRIES);

export function loadPlaybookEntries(contentRoot = CONTENT_ROOT): PlaybookEntry[] {
  if (!existsSync(contentRoot)) return [];

  return listMarkdownFiles(contentRoot)
    .map((filePath) => parsePlaybookEntry(contentRoot, filePath))
    .filter((entry): entry is PlaybookEntry => Boolean(entry))
    .sort((a, b) => a.category.localeCompare(b.category) || a.id.localeCompare(b.id));
}

export function selectPlaybookEntries(query: PlaybookQuery): PlaybookEntry[] {
  return selectPlaybookEntriesWithAlternates(query).selected;
}

export function selectPlaybookEntriesWithAlternates(query: PlaybookQuery, alternateLimit = 30): PlaybookSelection {
  const limit = query.limit ?? 10;
  const ranked = rankPlaybookEntries(query);
  const selected = selectRankedEntries(ranked, limit);
  const selectedIds = new Set(selected.map((entry) => entry.id));
  const alternates = ranked
    .map((item) => item.entry)
    .filter((entry) => !selectedIds.has(entry.id))
    .slice(0, alternateLimit);

  return { selected, alternates };
}

export function getPlaybookEntriesByIds(ids: string[]): PlaybookEntry[] {
  const byId = new Map(PLAYBOOK_ENTRIES.map((entry) => [entry.id, entry]));
  const seen = new Set<string>();
  const entries: PlaybookEntry[] = [];
  for (const id of ids) {
    if (seen.has(id)) continue;
    seen.add(id);
    const entry = byId.get(id);
    if (entry) entries.push(entry);
  }
  return entries;
}

export function renderPlaybookCandidateIndex(entries: PlaybookEntry[]): string {
  if (!entries.length) return "No additional candidates.";
  return entries
    .map((entry) => {
      const whenToUse = entry.whenToUse.slice(0, 2).join("; ") || "No usage notes.";
      const components = entry.suggestedVisualComponents.slice(0, 4).join(", ") || "No component notes.";
      const tags = entry.tags.slice(0, 8).join(", ") || "no-tags";
      return `- id: ${entry.id}
  category: ${entry.category}
  title: ${entry.title}
  tags: ${tags}
  whenToUse: ${clipCandidateText(whenToUse)}
  suggestedComponents: ${clipCandidateText(components)}
  motionPreset: ${entry.motionPreset}`;
    })
    .join("\n");
}

function rankPlaybookEntries(query: PlaybookQuery): Array<{ entry: PlaybookEntry; score: number }> {
  const terms = new Set(
    [
      query.deckArchetype,
      query.analysisOperator,
      query.visualPattern,
      query.motionPreset,
      query.slideRole,
      query.styleDirection,
      query.occasion,
      query.audience,
      query.textDensity,
      query.scheme,
      query.brief,
      ...(Array.isArray(query.mood) ? query.mood : [query.mood]),
      ...(Array.isArray(query.tone) ? query.tone : [query.tone]),
      ...(query.extraTerms ?? [])
    ]
      .filter(Boolean)
      .flatMap((value) => normalizeTerms(value!))
  );

  return [...PLAYBOOK_ENTRIES]
    .map((entry) => ({ entry, score: scoreEntry(entry, terms) }))
    .filter((item) => item.score > 0 || item.entry.category === "qa-rule")
    .sort(
      (a, b) =>
        b.score - a.score ||
        categoryRank(a.entry.category) - categoryRank(b.entry.category) ||
        a.entry.id.localeCompare(b.entry.id)
    );
}

function selectRankedEntries(ranked: Array<{ entry: PlaybookEntry; score: number }>, limit: number): PlaybookEntry[] {
  const selected = ranked.slice(0, limit).map((item) => item.entry);
  if (limit > 0 && selected.length && !selected.some((entry) => entry.category === "qa-rule")) {
    const qaEntry = ranked.find((item) => item.entry.category === "qa-rule")?.entry;
    if (qaEntry) selected[selected.length - 1] = qaEntry;
  }
  return selected;
}

export function renderPlaybookContext(entries: PlaybookEntry[]): string {
  if (!entries.length) return "No playbook entries selected.";
  return entries
    .map((entry) => {
      const sources = entry.sourceInfluences.length ? `\nSource influences: ${entry.sourceInfluences.join("; ")}` : "";
      return `## ${entry.title} (${entry.category}:${entry.id})${sources}
When to use: ${entry.whenToUse.join("; ")}
When not to use: ${entry.whenNotToUse.join("; ")}
Good structure: ${entry.goodStructure.join("; ")}
Anti-patterns: ${entry.antiPatterns.join("; ")}
Evidence requirements: ${entry.evidenceRequirements.join("; ")}
Suggested components: ${entry.suggestedVisualComponents.join(", ")}
Motion preset: ${entry.motionPreset}
CSS tokens: ${clipPromptSection(entry.cssTokens)}
Core CSS grammar: ${clipPromptSection(entry.coreCssGrammar)}
Motion and effects: ${clipPromptSection(entry.motionAndEffects)}
Example markup: ${entry.exampleMarkup}
QA checklist: ${entry.qaChecklist.join("; ")}`;
    })
    .join("\n\n");
}

export function buildPlaybookIndex(entries: PlaybookEntry[]): PlaybookIndex {
  const categories: Record<PlaybookCategory, string[]> = {
    "deck-archetype": [],
    "analysis-operator": [],
    "visual-pattern": [],
    "motion-preset": [],
    "style-direction": [],
    "qa-rule": [],
    example: []
  };
  const tags: Record<string, string[]> = {};

  for (const entry of entries) {
    categories[entry.category].push(entry.id);
    for (const tag of entry.tags) {
      tags[tag] = tags[tag] ?? [];
      tags[tag].push(entry.id);
    }
  }

  return {
    categories,
    tags,
    entries: entries.map((entry) => ({
      id: entry.id,
      category: entry.category,
      title: entry.title,
      tags: entry.tags,
      sourceInfluences: entry.sourceInfluences,
      filePath: entry.filePath
    }))
  };
}

function parsePlaybookEntry(contentRoot: string, filePath: string): PlaybookEntry | null {
  const raw = readFileSync(filePath, "utf8");
  const parsed = parseMarkdown(raw);
  if (!parsed) return null;

  const id = parsed.metadata.id?.trim();
  const category = parsed.metadata.category?.trim() as PlaybookCategory | undefined;
  const title = parsed.metadata.title?.trim();
  if (!id || !category || !title || !CATEGORY_SET.has(category)) return null;

  const sections = parseSections(parsed.body);
  const lists = parseListSections(sections);
  const relativePath = normalizePath(path.relative(contentRoot, filePath));

  return {
    id,
    category,
    title,
    tags: parseCsv(parsed.metadata.tags),
    sourceInfluences: parseCsv(parsed.metadata.sourceInfluences),
    whenToUse: lists.whenToUse,
    whenNotToUse: lists.whenNotToUse,
    goodStructure: lists.goodStructure,
    antiPatterns: lists.antiPatterns,
    evidenceRequirements: lists.evidenceRequirements,
    suggestedVisualComponents: lists.suggestedVisualComponents,
    motionPreset: parsed.metadata.motionPreset?.trim() || "static",
    cssTokens: extractExampleMarkup(sections.get("css tokens") ?? ""),
    coreCssGrammar: extractExampleMarkup(sections.get("core css grammar") ?? ""),
    motionAndEffects: (sections.get("motion and effects") ?? "").trim(),
    exampleMarkup: extractExampleMarkup(sections.get("example markup") ?? ""),
    qaChecklist: lists.qaChecklist,
    filePath: relativePath,
    body: parsed.body.trim()
  };
}

function clipPromptSection(input: string): string {
  const cleaned = input.trim();
  if (!cleaned) return "None.";
  return cleaned.length > 1800 ? `${cleaned.slice(0, 1800)}...` : cleaned;
}

function clipCandidateText(input: string): string {
  const cleaned = input.replace(/\s+/g, " ").trim();
  return cleaned.length > 260 ? `${cleaned.slice(0, 260)}...` : cleaned;
}

function parseMarkdown(raw: string): ParsedMarkdown | null {
  const normalized = raw.replace(/\r\n/g, "\n");
  if (!normalized.startsWith("---\n")) return null;
  const end = normalized.indexOf("\n---\n", 4);
  if (end === -1) return null;

  const frontmatter = normalized.slice(4, end);
  const body = normalized.slice(end + 5);
  const metadata: Frontmatter = {};

  for (const line of frontmatter.split("\n")) {
    const separatorIndex = line.indexOf(":");
    if (separatorIndex === -1) continue;
    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim();
    if (key) metadata[key] = value;
  }

  return { metadata, body };
}

function parseSections(body: string): Map<string, string> {
  const sections = new Map<string, string>();
  let currentSection = "";
  let currentLines: string[] = [];

  const flush = () => {
    if (currentSection) sections.set(currentSection, currentLines.join("\n").trim());
  };

  for (const line of body.split("\n")) {
    const headingMatch = /^##\s+(.+?)\s*$/.exec(line);
    if (headingMatch) {
      flush();
      currentSection = normalizeHeading(headingMatch[1]!);
      currentLines = [];
      continue;
    }
    currentLines.push(line);
  }
  flush();

  return sections;
}

function parseListSections(sections: Map<string, string>): Record<ListFieldName, string[]> {
  const result: Record<ListFieldName, string[]> = {
    whenToUse: [],
    whenNotToUse: [],
    goodStructure: [],
    antiPatterns: [],
    evidenceRequirements: [],
    suggestedVisualComponents: [],
    qaChecklist: []
  };

  for (const [sectionName, fieldName] of Object.entries(LIST_SECTIONS) as Array<[ListSectionName, ListFieldName]>) {
    const sectionBody = sections.get(sectionName);
    if (sectionBody !== undefined) {
      result[fieldName] = extractListItems(sectionBody);
    }
  }

  return result;
}

function extractListItems(sectionBody: string): string[] {
  const items: string[] = [];
  let inFence = false;

  for (const rawLine of sectionBody.split("\n")) {
    const line = rawLine.trim();
    if (line.startsWith("```")) {
      inFence = !inFence;
      continue;
    }
    if (inFence || !line) continue;
    items.push(line.replace(/^[-*]\s+/, "").trim());
  }

  return items;
}

function extractExampleMarkup(sectionBody: string): string {
  const fenceMatch = /```(?:html)?\n([\s\S]*?)```/i.exec(sectionBody);
  return (fenceMatch?.[1] ?? sectionBody).trim();
}

function listMarkdownFiles(root: string): string[] {
  const files: string[] = [];
  for (const item of readdirSync(root, { withFileTypes: true })) {
    const itemPath = path.join(root, item.name);
    if (item.isDirectory()) {
      files.push(...listMarkdownFiles(itemPath));
    } else if (item.isFile() && item.name.endsWith(".md")) {
      files.push(itemPath);
    }
  }
  return files;
}

function scoreEntry(entry: PlaybookEntry, terms: Set<string>): number {
  let score = entry.category === "qa-rule" ? 1 : 0;
  const textTerms = new Set(
    [
      entry.id,
      entry.category,
      entry.title,
      ...entry.tags,
      ...entry.sourceInfluences,
      entry.motionPreset,
      entry.filePath
    ].flatMap(normalizeTerms)
  );

  const bodyTerms = new Set(normalizeTerms(entry.body));
  for (const term of terms) {
    if (textTerms.has(term)) score += 5;
    else if (bodyTerms.has(term)) score += 2;
    else if ([...textTerms].some((candidate) => candidate.includes(term) || term.includes(candidate))) score += 1;
  }

  return score;
}

function categoryRank(category: PlaybookCategory): number {
  return (
    [
      "deck-archetype",
      "analysis-operator",
      "visual-pattern",
      "style-direction",
      "motion-preset",
      "qa-rule",
      "example"
    ] as PlaybookCategory[]
  ).indexOf(category);
}

function normalizeTerms(input: string): string[] {
  return input
    .toLowerCase()
    .replace(/_/g, "-")
    .split(/[^\p{L}\p{N}-]+/u)
    .map((term) => term.trim())
    .filter(Boolean);
}

function normalizeHeading(input: string): string {
  return input.toLowerCase().replace(/\s+/g, " ").trim();
}

function parseCsv(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizePath(input: string): string {
  return input.split(path.sep).join("/");
}
