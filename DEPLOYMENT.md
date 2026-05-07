# SlideLeaf Deployment Guide

SlideLeaf is a multi-service app:

- `apps/web`: Next.js frontend
- `apps/api`: NestJS API
- `apps/worker`: BullMQ compile / AI worker
- PostgreSQL
- Redis
- S3-compatible object storage

Do not deploy the whole project as a static website. The API and worker are long-running Node.js services.

## Recommended Production Architecture

For the first public deployment, use managed services for state:

- Web: Vercel, Render, Railway, or a VPS container
- API: Docker service on Railway, Render, Fly.io, or VPS
- Worker: separate Docker service on the same platform as API
- PostgreSQL: Neon, Supabase, Railway Postgres, Render Postgres, or RDS
- Redis: Railway Redis, Redis Cloud, Render Redis, or another Redis TCP provider
- Storage: Cloudflare R2, AWS S3, or another S3-compatible provider

Important: this code uses BullMQ, so Redis should provide a normal Redis TCP URL such as `redis://...` or `rediss://...`. Do not use a REST-only Redis API unless the queue code is changed.

## Required Environment Variables

Copy `.env.example` and fill real values in your deployment platform's secret manager. Never commit `.env`.

Core:

```env
DATABASE_URL="postgresql://..."
REDIS_URL="redis://..."
JWT_SECRET="long-random-production-secret"
SESSION_COOKIE_NAME="slideleaf_session"
SESSION_COOKIE_SAME_SITE="none"
WEB_URL="https://your-web-domain.com"
API_URL="https://your-api-domain.com"
NEXT_PUBLIC_API_URL="https://your-api-domain.com"
```

Google OAuth:

```env
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
GOOGLE_CALLBACK_URL="https://your-api-domain.com/auth/google/callback"
```

Add the same callback URL to the Google Cloud OAuth client. If your web and API are on different domains, keep `SESSION_COOKIE_SAME_SITE="none"` and deploy over HTTPS.

Storage:

```env
S3_ENDPOINT="https://..."
S3_PUBLIC_ENDPOINT="https://..."
S3_REGION="auto"
S3_BUCKET="slideleaf"
S3_ACCESS_KEY_ID="..."
S3_SECRET_ACCESS_KEY="..."
S3_FORCE_PATH_STYLE="true"
```

AI:

```env
AI_PROVIDER="deepseek"
DEEPSEEK_API_KEY="..."
DEEPSEEK_MODEL="deepseek-v4-pro"
GEMINI_API_KEY="..."
GEMINI_MODEL="gemini-3-flash-preview"
AI_MAX_TOKENS="8192"
AI_CONTEXT_MAX_CHARS="180000"
```

## Option A: Split Managed Deployment

This is the best long-term shape.

1. Push the repository to GitHub.
2. Create a managed PostgreSQL database and copy its `DATABASE_URL`.
3. Create a managed Redis instance and copy its `REDIS_URL`.
4. Create an R2 or S3 bucket and generate S3-compatible credentials.
5. Deploy `apps/api` as a Docker service:
   - Build context: repository root
   - Dockerfile: `apps/api/Dockerfile`
   - Port: use the platform-provided `PORT` if available, otherwise `4000`
6. Deploy `apps/worker` as a separate Docker worker/background service:
   - Build context: repository root
   - Dockerfile: `apps/worker/Dockerfile`
   - No public HTTP port required
7. Deploy `apps/web`:
   - Vercel is fine for the web only
   - Set `NEXT_PUBLIC_API_URL` to your production API URL
8. Set CORS-related URLs:
   - `WEB_URL=https://your-web-domain.com`
   - `API_URL=https://your-api-domain.com`

## Option B: Railway

Railway is convenient for a first full-stack deployment.

Create these services from the same GitHub repo:

- `api`: Dockerfile `apps/api/Dockerfile`
- `worker`: Dockerfile `apps/worker/Dockerfile`
- `web`: Dockerfile `apps/web/Dockerfile`, or use Vercel instead
- PostgreSQL plugin
- Redis plugin

Set all environment variables from `.env.example`. For object storage, prefer Cloudflare R2 or AWS S3 instead of running MinIO in production.

## Option C: Render

Render can host:

- API as a Web Service from `apps/api/Dockerfile`
- Worker as a Background Worker from `apps/worker/Dockerfile`
- PostgreSQL and Redis as managed services
- Web either on Render or Vercel

Set environment variables through Render dashboard or an environment group.

## Option D: VPS + Docker Compose

This is the most direct deployment because the project already has `docker-compose.yml`.

1. Create a VPS.
2. Install Docker and Docker Compose.
3. Clone the GitHub repo.
4. Create `.env` from `.env.example`.
5. Replace local URLs with production URLs.
6. Start services:

```bash
docker compose up -d --build
```

7. Put Caddy, Nginx, or Traefik in front for HTTPS and domains.

For production, use external R2/S3 storage instead of public MinIO unless you specifically want to operate object storage yourself.

## GitHub Push Checklist

Before pushing:

```bash
git status --ignored
git add .
git status
```

Verify these are ignored:

- `.env`
- `node_modules/`
- `.next/`
- `dist/`
- `*.tsbuildinfo`
- local database dumps
- local storage or upload folders
- private keys or certificates

If `.env` was ever committed by mistake:

```bash
git rm --cached .env
git commit -m "Remove local env file"
```

Then rotate every exposed API key.
