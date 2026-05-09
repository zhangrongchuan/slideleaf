# SlideLeaf

SlideLeaf is an AI-native HTML presentation workspace for teams that want investor, board, strategy, product, and technical decks to be generated as real source files instead of opaque screenshots or locked design exports.

The core idea is simple: a deck is a small web project. SlideLeaf stores editable files, uses AI to plan the narrative, generates modular slide fragments, compiles them into a portable static HTML presentation, and keeps every AI change behind a reviewable patch.

## Why SlideLeaf

Most AI presentation tools optimize for fast first drafts. SlideLeaf is built for decks where the final result needs to be credible in front of investors, CEOs, boards, customers, or technical decision makers.

- HTML-first output: slides are editable source files, not sealed images.
- DeckPlan-first generation: structure is planned before files are generated.
- Modular slides: each page is a standalone fragment listed in `project.config.json`.
- Local playbook guidance: AI uses SlideLeaf's deck archetypes, analysis operators, visual patterns, style directions, motion presets, QA rules, and examples.
- Template-style intelligence: the playbook includes adapted style metadata from 32 MIT-licensed beautiful-html-templates directions, used for tone-first visual direction selection.
- Review before apply: AI proposes workspace file patches; users decide what lands.
- Portable rendering: compiled decks become static HTML with local theme and runtime files.
- Provider flexible: Claude, Gemini, DeepSeek, and OpenAI-compatible providers are supported.

## Product Workflow

SlideLeaf treats high-quality deck creation as a production pipeline:

```text
User brief
-> Clarifying questions when information is missing
-> AI Playbook retrieval
-> Visual directions
-> DeckPlan / Ghost Deck
-> Freeze DeckPlan
-> Generate modular workspace files
-> Review generated patch
-> Apply
-> Compile and share
```

The generated project shape is intentionally file-based:

```text
project.config.json
slides/
  01-title.html
  02-market-context.html
  03-segmentation.html
themes/
  deck.css
runtime/
  deck.js
assets/
```

Each slide file should be a single fragment:

```html
<section class="slide" data-slide-id="s01" data-motion="progressive-reveal">
  ...
</section>
```

The renderer reads `project.config.json.slides` as the source of truth, assembles the slide fragments in order, injects the shared theme, adds stable navigation/runtime behavior, and produces a static `index.html`. Legacy standalone `slides/deck.html` projects are still supported.

## AI Workspace Modes

The AI panel has two kinds of controls: workflow artifact generation and file patching. This keeps early planning separate from later deck editing.

| Mode | What it does | Use it when |
| --- | --- | --- |
| `Auto` | Follows the current workflow stage stored on the conversation. It may create a brief, visual directions, a DeckPlan, or move toward deck generation depending on where the project is in the pipeline. | You want SlideLeaf to continue the normal staged workflow. |
| `Clarify` | Generates or updates the creative brief. It focuses on audience, purpose, language, tone, slide count, must-have content, unknowns, and clarification questions. | The deck request is still ambiguous, or you want the AI to re-understand the project before planning. |
| `Style` | Generates visual directions from the brief and relevant playbook entries. It explores palette, typography, layout personality, motion language, and sample direction previews. | You want to choose or revise the visual system before planning or regenerating slides. |
| `Plan` | Generates the DeckPlan / Ghost Deck. It defines storyline, sections, slide roles, action titles, evidence needs, analysis operators, recommended visuals, dependencies, and do-not-cover constraints. | You want to change the deck narrative, slide order, argument structure, or content strategy. |
| `Edit` | Reads the current workspace files and returns a reviewable patch. It can update `slides/*.html`, `themes/deck.css`, `runtime/deck.js`, `project.config.json`, or delete stale files when appropriate. | You want to tune the generated deck, fix layout issues, adjust wording, change styling, or repair compile problems without restarting the full workflow. |

The `Generate deck` action is separate from `Edit`. It uses the approved DeckPlan as the source of truth and creates the modular workspace files for review. After files exist, most refinements should use `Edit` unless the brief, style direction, or DeckPlan itself needs to change.

## AI Architecture

SlideLeaf does not depend on provider-native "skills". It implements its own provider-agnostic playbook layer in `packages/ai-playbook`.

The playbook content is stored as Markdown and compiled into a structured index:

```text
packages/ai-playbook/content/
  deck-archetypes/
  analysis-operators/
  visual-patterns/
  motion-presets/
  style-directions/
  qa-rules/
  examples/
```

During generation, the API selects relevant playbook entries from the current brief, slide role, deck archetype, analysis operator, visual pattern, and style direction. Only the selected entries are injected into the model prompt, which keeps context stable across multi-turn workflows.

The main deck artifact is a rich DeckPlan. It captures the storyline, evidence needs, audience, main thesis, section structure, slide roles, claims, transitions, content blocks, visual recommendations, dependencies, and `doNotCover` constraints. Once approved, the plan is frozen so later generation does not drift.

For visual direction work, SlideLeaf can retrieve template-style entries by mood, tone, occasion, formality, density, audience, and Chinese or English brief terms. These entries guide palette, typography, layout grammar, and style QA, while SlideLeaf still outputs its own fragment-based file structure and renderer-owned navigation.

## Renderer Rules

The renderer is deliberately strict so generated decks remain portable and easy to debug.

- `project.config.json.slides` controls the compile order.
- Multi-slide mode expects one complete slide root per file.
- Shared CSS belongs in `themes/deck.css`.
- Slide navigation, active state, counters, progress, keyboard controls, and basic reveal behavior are owned by the renderer so every compiled deck can move through all configured slides.
- `runtime/deck.js` is optional extension space for non-navigation behavior; it should not recreate slide navigation or duplicate progress UI.
- Per-slide `<script>` and `<style>` output is not allowed.
- Remote runtime dependencies are avoided for portable sharing.
- Markdown slides and `slides/deck.html` are kept for compatibility.

## Tech Stack

- Monorepo: pnpm workspaces, TypeScript
- Web app: Next.js 15, React 19, Tailwind CSS, Monaco editor, lucide-react
- API: NestJS, Prisma, PostgreSQL, JWT/cookie auth
- Worker: BullMQ, Redis, renderer jobs
- Storage: S3-compatible object storage, MinIO for local development
- Renderer: custom TypeScript renderer in `packages/renderer`
- AI playbook: Markdown content plus structured TypeScript index in `packages/ai-playbook`
- AI providers: Anthropic Claude Messages API plus OpenAI-compatible Gemini, DeepSeek, and OpenAI routes

## Repository Layout

```text
apps/
  web/       Next.js workspace UI
  api/       NestJS API, auth, projects, AI orchestration
  worker/    BullMQ worker for compile/render jobs
packages/
  ai-playbook/   Local deck generation knowledge base
  renderer/      Static HTML deck compiler
  shared/        Shared types
  storage/       S3-compatible storage adapter
  workspace/     Workspace materialization utilities
prisma/
  schema.prisma
```

## Local Development

Enable pnpm through Corepack:

```bash
corepack enable
corepack prepare pnpm@9.15.4 --activate
```

Create an environment file:

```bash
cp .env.example .env
```

Install dependencies:

```bash
pnpm install
```

Start backing services:

```bash
docker compose up postgres redis minio
```

Push the Prisma schema and generate the client:

```bash
pnpm prisma:push
pnpm prisma:generate
```

Start the apps in separate terminals:

```bash
pnpm --filter @slideleaf/api dev
pnpm --filter @slideleaf/worker dev
pnpm --filter @slideleaf/web dev
```

The web app runs at `http://localhost:3000`, and the API runs at `http://localhost:4000`.

You can also start the local Docker stack:

```bash
docker compose up --build
```

## AI Provider Setup

Set one provider in `.env`:

```env
AI_PROVIDER="anthropic"
ANTHROPIC_API_KEY="your-anthropic-api-key"
ANTHROPIC_MODEL="claude-sonnet-4-6"
```

Gemini, DeepSeek, and OpenAI-compatible routes are also supported:

```env
AI_PROVIDER="gemini"
GEMINI_API_KEY="your-gemini-api-key"
GEMINI_MODEL="gemini-3.1-flash-lite"
```

```env
AI_PROVIDER="deepseek"
DEEPSEEK_API_KEY="your-deepseek-api-key"
DEEPSEEK_MODEL="deepseek-v4-pro"
```

The UI currently exposes DeepSeek V4 Pro, Gemini 3.1 Flash Lite, Claude Sonnet 4.6, and Claude Opus 4.7. SlideLeaf's playbook layer is provider independent: the backend retrieves the relevant Markdown entries and injects them into the request context.

Users can also add own API keys from the dashboard Settings panel. These own-model credentials are stored only in the browser's local storage and are sent to the API only for the selected request; they are not written to the SlideLeaf database. Clearing browser cache or site data removes them.

## Useful Commands

```bash
pnpm build
pnpm typecheck
pnpm test
pnpm prisma:push
pnpm prisma:generate
```

Package-scoped examples:

```bash
pnpm --filter @slideleaf/web typecheck
pnpm --filter @slideleaf/api test
pnpm --filter @slideleaf/renderer test
```

## Implemented Surface

- Cookie-based register, login, logout, and Google OAuth hooks.
- Project dashboard with template project creation.
- Overleaf-style workspace with file tree, editor, preview, compile log, asset upload, and member roles.
- Text file create, update, rename, and delete APIs.
- Direct image upload into `assets/` for PNG, JPEG, GIF, and WebP.
- BullMQ compile queue and worker-based rendering.
- MinIO-backed static deck upload and `/share/:shareSlug` rendering.
- AI workspace generation with review, apply, and reject flow.
- DeckPlan-first AI workflow with visual directions and modular multi-slide output.
- Local AI Playbook with deck archetypes, analysis operators, visual patterns, style directions, motion presets, QA rules, and examples.

## Quality Principles

SlideLeaf is designed around a few constraints that make AI output more reliable:

- Plan before generating.
- Keep deck structure explicit and reviewable.
- Generate source files, not hidden artifacts.
- Use a stable file index instead of guessing which slides to compile.
- Keep style and runtime global.
- Prevent per-slide scripts and one-off styling from fragmenting the deck.
- Treat AI output as a patch until the user applies it.

## Roadmap

- Stronger persisted AI run recovery and background job visibility.
- More complete deck archetypes and visual pattern coverage.
- Provider-level tool calling for playbook lookup and context assembly.
- Golden example decks for investor, board, product strategy, technical architecture, and market entry workflows.
- Playwright visual checks for compiled deck overflow and responsiveness.
- PDF export.
- Real-time collaborative editing.

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for GitHub publishing, production environment variables, and deployment options across Vercel, Railway, Render, and VPS/Docker Compose.

Before pushing to GitHub, confirm local secrets are ignored:

```bash
git status --ignored
```

## License

See [LICENSE](./LICENSE).
