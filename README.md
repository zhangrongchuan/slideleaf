<p align="center">
  <img src="apps/web/public/logo.png" alt="SlideLeaf logo" width="96" />
</p>

<p align="center">
  <a href="./README.md"><strong>English</strong></a>
  ·
  <a href="./README.zh-CN.md">简体中文</a>
</p>

# SlideLeaf

AI-native HTML slide workspaces for people who want serious decks as editable source files.

[![License](https://img.shields.io/badge/license-Non--Commercial-blue)](./LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-10-e0234e)](https://nestjs.com/)

SlideLeaf turns deck creation into a workflow instead of a one-shot prompt. Describe what you need, let AI ask the missing questions, choose a visual direction, approve a DeckPlan, then generate modular HTML slide files that can be reviewed, edited, compiled, and shared.

It is built for product demos, technical talks, open-source project showcases, startup pitch drafts, teaching materials, and other presentations where teams want editable source files instead of locked slide exports.

## Why SlideLeaf

- **Ask-first generation**: the AI clarifies audience, goal, language, tone, constraints, missing facts, and narrative intent before generating files.
- **Design before output**: visual directions and a DeckPlan are created before slide files are generated.
- **HTML-first slides**: slides are source files, not screenshots or locked exports.
- **Reviewable AI patches**: AI changes stay in review until a user applies or rejects them.
- **Open and self-hostable**: run the full stack locally or deploy it on your own infrastructure.
- **Bring your own API key**: configure your own DeepSeek, Gemini, or Claude key in the browser; own keys do not consume SlideLeaf credits.
- **Collaborative workspaces**: invite teammates to view or edit the same project.
- **Portable output**: compile decks into static HTML with local theme and runtime assets.

## How It Works

```text
Describe the deck
  -> AI asks clarifying questions
  -> AI proposes visual directions
  -> AI creates a DeckPlan
  -> You approve the plan
  -> AI generates modular slide files
  -> You review the patch
  -> Compile and share static HTML
```

Generated decks are ordinary project files:

```text
project.config.json
slides/
  01-title.html
  02-problem.html
  03-workflow.html
themes/
  deck.css
runtime/
  deck.js
assets/
```

Each generated slide is a fragment:

```html
<section class="slide" data-slide-id="s01" data-motion="progressive-reveal">
  ...
</section>
```

`project.config.json` is the compile index. The renderer reads the listed slide files, injects the shared theme/runtime, and produces a portable HTML deck.

## Core Concepts

### DeckPlan

The DeckPlan is the frozen blueprint for a deck. It contains the brief, main thesis, sections, slide roles, action titles, evidence needs, visual recommendations, dependencies, and `doNotCover` constraints. Slide generation follows this plan instead of improvising the whole deck in one prompt.

### AI Playbook

SlideLeaf ships with a local Markdown playbook in `packages/ai-playbook`. It includes deck archetypes, analysis operators, visual patterns, style directions, motion presets, QA rules, and examples. The backend retrieves relevant entries and injects only the needed context into each AI request.

### Review Patches

AI output is not applied directly. The system creates a workspace patch that can be reviewed, applied, or rejected. This makes AI editing closer to a code review workflow than a blind overwrite.

## Tech Stack

- **Monorepo**: pnpm workspaces, TypeScript
- **Web**: Next.js 15, React 19, Tailwind CSS, Monaco editor
- **API**: NestJS, Prisma, PostgreSQL, cookie/JWT auth
- **Worker**: BullMQ, Redis
- **Storage**: S3-compatible storage, MinIO for local development
- **Renderer**: custom static HTML deck compiler
- **AI**: DeepSeek, Gemini, Anthropic Claude, OpenAI-compatible routes

## Repository Layout

```text
apps/
  web/       Next.js app and workspace UI
  api/       NestJS API, auth, projects, AI orchestration
  worker/    compile/render worker
packages/
  ai-playbook/   local AI generation knowledge base
  renderer/      static HTML deck compiler
  shared/        shared types
  storage/       S3-compatible storage adapter
  workspace/     workspace utilities
prisma/
  schema.prisma
```

## Quick Start

Requirements:

- Node.js 22+
- pnpm via Corepack
- Docker, for PostgreSQL, Redis, and MinIO

```bash
corepack enable
corepack prepare pnpm@9.15.4 --activate
pnpm install
cp .env.example .env
docker compose up postgres redis minio
pnpm prisma:push
pnpm prisma:generate
```

Start the services in separate terminals:

```bash
pnpm --filter @slideleaf/api dev
pnpm --filter @slideleaf/worker dev
pnpm --filter @slideleaf/web dev
```

Open:

```text
http://localhost:3000
```

You can also run the local Docker stack:

```bash
docker compose up --build
```

## AI Providers

Official server models are configured through API environment variables:

```env
AI_PROVIDER="deepseek"
DEEPSEEK_API_KEY="..."
DEEPSEEK_MODEL="deepseek-v4-pro"

GEMINI_API_KEY="..."
GEMINI_MODEL="gemini-3.1-flash-lite"

ANTHROPIC_API_KEY="..."
ANTHROPIC_SONNET_MODEL="claude-sonnet-4-6"
ANTHROPIC_OPUS_MODEL="claude-opus-4-7"
```

Users can also add personal provider keys in the dashboard Settings panel. These keys are stored only in the browser's local storage and are sent to the API only for the selected request.


## Deployment

Docker is the recommended deployment path. It keeps the web app, API, worker, database, Redis, and object storage wiring explicit and avoids cross-domain cookie issues by letting the web app proxy browser API traffic through `/api/...`.

Create `.env` from the example, set production secrets and provider keys, then run:

```bash
docker compose up --build
```

## Roadmap / Not Yet Implemented

- Persisted AI run recovery and clearer background job visibility
- Stronger visual QA for compiled decks
- PDF export from compiled HTML decks
- Document/image ingestion for evidence-driven decks
- Preview inline text editing with source-file patches
- Simple visual layout adjustments in preview, such as moving or resizing selected blocks
- More deck archetypes and golden example decks
- Real-time collaborative editing

## Contributing

Contributions are welcome.

## License

See [LICENSE](./LICENSE).
