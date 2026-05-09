FROM node:22-bookworm-slim

WORKDIR /app
RUN apt-get update -y && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*
RUN corepack enable

COPY . .
RUN echo "USING UPDATED SLIDELEAF WORKER DOCKERFILE" \
  && find . -name "*.tsbuildinfo" -delete \
  && pnpm install --frozen-lockfile \
  && find . -name "*.tsbuildinfo" -delete \
  && node node_modules/typescript/bin/tsc -p packages/ai-playbook/tsconfig.json \
  && node node_modules/typescript/bin/tsc -p packages/shared/tsconfig.json \
  && node node_modules/typescript/bin/tsc -p packages/storage/tsconfig.json \
  && node node_modules/typescript/bin/tsc -p packages/renderer/tsconfig.json \
  && node node_modules/typescript/bin/tsc -p packages/workspace/tsconfig.json \
  && test -f packages/renderer/dist/index.d.ts \
  && test -f packages/workspace/dist/index.d.ts \
  && node node_modules/typescript/bin/tsc -p apps/worker/tsconfig.json

CMD ["pnpm", "--filter", "@slideleaf/worker", "start"]
