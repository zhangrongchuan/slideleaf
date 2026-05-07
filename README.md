# SlideLeaf

SlideLeaf is an HTML-first presentation workspace: projects are file trees, users edit HTML/config source files, and workers compile them into static HTML presentations with shareable links. Markdown slide files are still supported for compatibility, but new projects default to a single standalone `slides/deck.html` file.

## Stack

- Next.js web app in `apps/web`
- NestJS API in `apps/api`
- BullMQ worker in `apps/worker`
- Prisma + PostgreSQL
- Redis queue
- MinIO through an S3-compatible storage adapter
- TypeScript packages for shared types, storage, workspace materialization, and rendering

## Local Setup

1. Enable pnpm through Corepack:

   ```bash
   corepack enable
   corepack prepare pnpm@9.15.4 --activate
   ```

2. Create an environment file:

   ```bash
   cp .env.example .env
   ```

3. Install dependencies:

   ```bash
   pnpm install
   ```

4. Start backing services:

   ```bash
   docker compose up postgres redis minio
   ```

5. Push the Prisma schema and generate the client:

   ```bash
   pnpm prisma:push
   pnpm prisma:generate
   ```

6. Start the apps:

   ```bash
   pnpm --filter @slideleaf/api dev
   pnpm --filter @slideleaf/worker dev
   pnpm --filter @slideleaf/web dev
   ```

The web app runs at `http://localhost:3000`, and the API runs at `http://localhost:4000`.

## Docker Compose

After creating `.env`, the full local stack can be started with:

```bash
docker compose up --build
```

The API container runs `prisma db push` before booting so a fresh local database is usable.

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for GitHub publishing, production environment variables, and deployment options across Vercel, Railway, Render, and VPS/Docker Compose.

Before pushing to GitHub, confirm `.env` is ignored:

```bash
git status --ignored
```

## MVP Workflow

1. Register or log in.
2. Create a project from the default template.
3. Open the project workspace.
4. Edit `slides/deck.html` or `project.config.json`.
5. Save the file.
6. Click Compile.
7. Open the generated share preview.

## Useful Commands

```bash
pnpm build
pnpm typecheck
pnpm test
pnpm prisma:push
```

## AI Provider

AI workspace generation can use Claude/Anthropic, Gemini, DeepSeek, or OpenAI. Claude uses Anthropic's native Messages API; Gemini, DeepSeek, and OpenAI use OpenAI-compatible Chat Completions APIs.

Set these values in `.env`:

```env
AI_PROVIDER="anthropic"
ANTHROPIC_API_KEY="your-anthropic-api-key"
ANTHROPIC_BASE_URL="https://api.anthropic.com/v1"
ANTHROPIC_MODEL="claude-sonnet-4-6"
ANTHROPIC_VERSION="2023-06-01"
AI_MAX_TOKENS="8192"
AI_CONTEXT_MAX_CHARS="60000"
```

To switch to Gemini, set:

```env
AI_PROVIDER="gemini"
GEMINI_API_KEY="your-gemini-api-key"
GEMINI_BASE_URL="https://generativelanguage.googleapis.com/v1beta/openai"
GEMINI_MODEL="gemini-3-flash-preview"
```

To switch to DeepSeek, set:

```env
AI_PROVIDER="deepseek"
DEEPSEEK_API_KEY="your-deepseek-api-key"
DEEPSEEK_BASE_URL="https://api.deepseek.com"
DEEPSEEK_MODEL="deepseek-v4-pro"
```

The API sends all current text files as context, then asks the model to return reviewable workspace file blocks. This avoids putting large HTML documents inside JSON strings, which is fragile when a model returns raw newlines or quotes.

```xml
<slideleaf-workspace>
<summary>What changed</summary>
<file path="project.config.json">
{ "entry": "slides/deck.html", "slideSize": "16:9" }
</file>
<file path="slides/deck.html">
<!doctype html>
<html>...</html>
</file>
</slideleaf-workspace>
```

AI-generated slides should default to one complete `slides/deck.html` file with embedded CSS and small inline navigation JavaScript. The project only writes files after the user reviews and applies the generated workspace patch.

## Implemented MVP Surface

- Cookie-based register/login/logout.
- Project dashboard with template project creation.
- Overleaf-style project workspace with file tree, Monaco editor, iframe preview, compile log, asset upload, version snapshot, and AI patch review panel.
- Text file create/update/rename/delete APIs.
- Direct image upload into `assets/`.
- BullMQ compile queue and worker-based HTML rendering.
- MinIO-backed static `index.html` upload and `/share/:shareSlug` rendering.
- Manual version snapshot storage as `snapshot.tar.gz`.
- Workspace-level AI generation with review/apply/reject flow.

PDF export and real-time Yjs collaboration are intentionally deferred.
