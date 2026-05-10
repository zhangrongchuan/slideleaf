<p align="center">
  <img src="apps/web/public/logo.png" alt="SlideLeaf logo" width="96" />
</p>

<p align="center">
  <a href="./README.md">English</a>
  ·
  <a href="./README.zh-CN.md"><strong>简体中文</strong></a>
</p>

# SlideLeaf

面向高质量演示文稿的 AI-native HTML slide workspace。它让用户用自然语言描述内容，再把 deck 生成成可编辑、可审查、可编译、可分享的源文件。

SlideLeaf 不是一次性生成一份不可控的 PPT。它把演示文稿生产拆成一个清晰流程：AI 先追问缺失信息，再给出视觉方向，生成 DeckPlan，经过确认后逐页生成模块化 HTML slide 文件。

它适合产品演示、技术分享、开源项目展示、创业 pitch 初稿、课程材料，以及任何希望把 slides 当作可编辑源文件来管理的演示场景。

## 为什么做 SlideLeaf

- **先提问，再生成**：AI 会先澄清受众、目标、语言、语气、约束、缺失事实和叙事意图。
- **先设计，再输出**：先给 visual directions 和 DeckPlan，再生成 slide 文件。
- **HTML-first slides**：输出是源文件，不是截图，也不是锁死的导出文件。
- **AI patch 可审查**：AI 修改不会直接落盘，用户可以 review、apply 或 reject。
- **开源，可自托管**：可以本地运行，也可以部署到自己的服务器。
- **支持自带 API key**：用户可以在浏览器中配置自己的 DeepSeek、Gemini 或 Claude key；使用自己的 key 不消耗 SlideLeaf credits。
- **团队协作**：可以邀请队友进入同一个项目共同查看和编辑。
- **可移植输出**：deck 可以编译成带本地 theme/runtime 的静态 HTML。

## 工作流

```text
描述 deck 需求
  -> AI 追问缺失信息
  -> AI 提出视觉方向
  -> AI 创建 DeckPlan
  -> 用户确认 Plan
  -> AI 生成模块化 slide 文件
  -> 用户 review patch
  -> 编译并分享静态 HTML
```

生成后的 deck 是普通项目文件：

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

每一页 slide 是一个 HTML fragment：

```html
<section class="slide" data-slide-id="s01" data-motion="progressive-reveal">
  ...
</section>
```

`project.config.json` 是编译索引。renderer 会读取其中的 slide 列表，注入共享 theme/runtime，并产出可分享的 HTML deck。

## 核心概念

### DeckPlan

DeckPlan 是整份 deck 的冻结蓝图，包含 brief、main thesis、章节、slide roles、action titles、证据需求、视觉建议、依赖关系和 `doNotCover` 约束。逐页生成时会遵循这个计划，而不是在一个 prompt 里临场发挥整份 deck。

### AI Playbook

SlideLeaf 在 `packages/ai-playbook` 中维护本地 Markdown playbook，覆盖 deck archetypes、analysis operators、visual patterns、style directions、motion presets、QA rules 和 examples。后端会按当前任务检索相关条目，只把需要的上下文注入模型。

### Review Patches

AI 输出不会直接覆盖项目文件。系统会生成一个 workspace patch，用户可以审查、应用或拒绝。这让 AI 编辑更接近代码审查，而不是盲目覆盖。

## 技术栈

- **Monorepo**：pnpm workspaces, TypeScript
- **Web**：Next.js 15, React 19, Tailwind CSS, Monaco editor
- **API**：NestJS, Prisma, PostgreSQL, cookie/JWT auth
- **Worker**：BullMQ, Redis
- **Storage**：S3-compatible storage，本地开发使用 MinIO
- **Renderer**：自研静态 HTML deck compiler
- **AI**：DeepSeek, Gemini, Anthropic Claude, OpenAI-compatible routes

## 项目结构

```text
apps/
  web/       Next.js app 和 workspace UI
  api/       NestJS API、认证、项目管理、AI orchestration
  worker/    编译/渲染 worker
packages/
  ai-playbook/   本地 AI 生成知识库
  renderer/      静态 HTML deck compiler
  shared/        共享类型
  storage/       S3-compatible storage adapter
  workspace/     workspace 工具
prisma/
  schema.prisma
```

## 快速开始

要求：

- Node.js 22+
- 通过 Corepack 使用 pnpm
- Docker，用于 PostgreSQL、Redis 和 MinIO

```bash
corepack enable
corepack prepare pnpm@9.15.4 --activate
pnpm install
cp .env.example .env
docker compose up postgres redis minio
pnpm prisma:push
pnpm prisma:generate
```

分别启动服务：

```bash
pnpm --filter @slideleaf/api dev
pnpm --filter @slideleaf/worker dev
pnpm --filter @slideleaf/web dev
```

打开：

```text
http://localhost:3000
```

也可以直接运行本地 Docker stack：

```bash
docker compose up --build
```

## AI Providers

官方 server models 通过 API 环境变量配置：

```env
AI_PROVIDER="deepseek"
DEEPSEEK_API_KEY="..."
DEEPSEEK_MODEL="deepseek-v4-pro"

GEMINI_API_KEY="..."
GEMINI_MODEL="gemini-3-flash-preview"

ANTHROPIC_API_KEY="..."
ANTHROPIC_SONNET_MODEL="claude-sonnet-4-6"
ANTHROPIC_OPUS_MODEL="claude-opus-4-7"
```

用户也可以在 dashboard Settings 中添加自己的 provider key。这些 key 只保存在浏览器 local storage 中，只会在用户选择对应模型时发送给 API。

## 部署

推荐使用 Docker 部署。Docker 可以把 web、API、worker、database、Redis 和 object storage 的连接关系显式管理，同时让 web app 通过 `/api/...` 代理浏览器请求，避免跨域 cookie 问题。

从 `.env.example` 创建 `.env`，配置生产环境 secrets 和 provider keys，然后运行：

```bash
docker compose up --build
```

## Roadmap / 尚未实现

- 更稳定的 AI run 恢复和后台任务可见性
- 更强的 compiled deck 视觉 QA
- 从 HTML deck 导出 PDF
- 上传文档/图片并基于证据生成 deck
- Preview 中直接编辑文字，并生成源文件 patch
- Preview 中进行简单布局调整，例如移动或缩放选中的 block
- 更多 deck archetypes 和 golden example decks
- 实时协同编辑

## Contributing

欢迎贡献。

## License

见 [LICENSE](./LICENSE)。
