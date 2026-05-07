FROM node:22-bookworm-slim

WORKDIR /app
RUN apt-get update -y && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*
RUN corepack enable

COPY . .
RUN find . -name "*.tsbuildinfo" -delete \
  && pnpm install --frozen-lockfile \
  && find . -name "*.tsbuildinfo" -delete \
  && node node_modules/typescript/bin/tsc -p packages/shared/tsconfig.json \
  && node node_modules/typescript/bin/tsc -p packages/storage/tsconfig.json \
  && node node_modules/typescript/bin/tsc -p packages/workspace/tsconfig.json \
  && node node_modules/typescript/bin/tsc -p apps/api/tsconfig.json

EXPOSE 4000
CMD ["sh", "-c", "until pnpm prisma:push; do echo 'Waiting for database...'; sleep 2; done; pnpm --filter @slideleaf/api start"]
