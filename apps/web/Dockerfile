FROM node:22-bookworm-slim

WORKDIR /app
RUN apt-get update -y && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*
RUN corepack enable

COPY . .
RUN pnpm install --frozen-lockfile && pnpm --filter @slideleaf/web build

EXPOSE 3000
CMD ["pnpm", "--filter", "@slideleaf/web", "start"]
