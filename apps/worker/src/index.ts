import "dotenv/config";
import { randomUUID } from "node:crypto";
import { mkdir, readdir, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { PrismaClient } from "@prisma/client";
import { Worker } from "bullmq";
import { renderProject } from "@slideleaf/renderer";
import { contentTypeForPath, createStorageFromEnv } from "@slideleaf/storage";
import { materializeWorkspace } from "@slideleaf/workspace";

type CompileJobData = {
  jobId: string;
  projectId: string;
  userId: string;
  targetFormat: "html" | "pdf";
};

type RenderErrorLike = {
  file?: string;
  message: string;
  line?: number;
};

const prisma = new PrismaClient();
const storage = createStorageFromEnv();

async function main(): Promise<void> {
  await storage.ensureBucket?.();

  const worker = new Worker<CompileJobData>(
    "compile",
    async (job) => {
      const data = job.data;
      const logs: string[] = [`Worker picked up job ${data.jobId}`];
      const jobStartedAt = Date.now();
      const timer = new TimingLogger("compile", data.jobId);
      const baseDir = path.join(os.tmpdir(), "slideleaf-workspaces", data.projectId, data.jobId);
      const workspaceDir = path.join(baseDir, "workspace");
      const outputDir = path.join(baseDir, "dist");

      await prisma.compileJob.update({
        where: { id: data.jobId },
        data: {
          status: "running",
          startedAt: new Date(),
          log: logs.join("\n")
        }
      });
      timer.mark("mark_running", { projectId: data.projectId, targetFormat: data.targetFormat });

      try {
        if (data.targetFormat !== "html") {
          throw new Error("PDF export is not enabled in this MVP build");
        }

        await rm(baseDir, { recursive: true, force: true });
        await mkdir(workspaceDir, { recursive: true });
        logs.push("Materializing workspace");
        const materializeStartedAt = Date.now();
        await materializeWorkspace({
          projectId: data.projectId,
          targetDir: workspaceDir,
          prisma,
          storage
        });
        logs.push(`Materialized workspace in ${Date.now() - materializeStartedAt}ms`);
        timer.mark("materialize_workspace");

        const compileJob = await prisma.compileJob.findUnique({ where: { id: data.jobId } });
        const entryFile = compileJob?.entryFileId
          ? await prisma.file.findFirst({
              where: { id: compileJob.entryFileId, projectId: data.projectId }
            })
          : null;
        timer.mark("load_entry_file", { entry: entryFile?.path ?? "config" });

        logs.push("Rendering static HTML");
        const renderStartedAt = Date.now();
        const result = await renderProject({
          workspaceDir,
          outputDir,
          entry: entryFile?.path
        });
        logs.push(`Rendered static HTML in ${Date.now() - renderStartedAt}ms`);
        logs.push(...result.logs);
        timer.mark("render_project", { success: result.success });

        if (!result.success || !result.entryHtmlPath) {
          const renderedErrors = result.errors?.map((error: RenderErrorLike) => {
            const location = error.file ? `${error.file}${error.line ? `:${error.line}` : ""}` : "renderer";
            return `${location}: ${error.message}`;
          });
          throw new Error(renderedErrors?.join("\n") || "Renderer failed");
        }

        const prefix = `projects/${data.projectId}/exports/${data.jobId}`;
        const uploadStartedAt = Date.now();
        await uploadDirectory(outputDir, prefix);
        logs.push(`Uploaded ${prefix} in ${Date.now() - uploadStartedAt}ms`);
        timer.mark("upload_dist", { prefix });

        const shareSlug = randomUUID();
        const outputStorageKey = `${prefix}/index.html`;
        await prisma.compileJob.update({
          where: { id: data.jobId },
          data: {
            status: "success",
            log: logs.join("\n"),
            outputStorageKey,
            shareSlug,
            finishedAt: new Date()
          }
        });
        timer.end("success");
        console.log(`Compile job completed: ${data.jobId} in ${Date.now() - jobStartedAt}ms`);
      } catch (error) {
        timer.fail(error);
        logs.push(error instanceof Error ? error.message : String(error));
        await prisma.compileJob.update({
          where: { id: data.jobId },
          data: {
            status: "failed",
            log: logs.join("\n"),
            finishedAt: new Date()
          }
        });
        throw error;
      } finally {
        await rm(baseDir, { recursive: true, force: true });
        timer.mark("cleanup");
      }
    },
    {
      connection: redisConnectionFromEnv(),
      concurrency: 2
    }
  );

  worker.on("completed", (job) => {
    console.log(`Compile queue completed: ${job.id}`);
  });
  worker.on("failed", (job, error) => {
    console.error(`Compile job failed: ${job?.id}`, error);
  });

  console.log("SlideLeaf worker listening for compile jobs");

  const shutdown = async () => {
    await worker.close();
    await prisma.$disconnect();
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

async function uploadDirectory(dir: string, keyPrefix: string): Promise<void> {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await uploadDirectory(fullPath, `${keyPrefix}/${entry.name}`);
      continue;
    }

    const key = `${keyPrefix}/${entry.name}`;
    await storage.upload(key, await readFile(fullPath), contentTypeForPath(entry.name));
  }
}

class TimingLogger {
  private readonly startedAt = Date.now();
  private lastMarkAt = this.startedAt;

  constructor(
    private readonly scope: string,
    private readonly id: string
  ) {
    this.mark("start");
  }

  mark(step: string, details?: Record<string, unknown> | string): void {
    const now = Date.now();
    console.log(
      `[timing][${this.scope}] id=${this.id} step=${step} +${now - this.lastMarkAt}ms total=${now - this.startedAt}ms${formatTimingDetails(details)}`
    );
    this.lastMarkAt = now;
  }

  end(step = "done"): void {
    this.mark(step);
  }

  fail(error: unknown): void {
    const message = error instanceof Error ? error.message : String(error);
    this.mark("failed", message);
  }
}

function formatTimingDetails(details?: Record<string, unknown> | string): string {
  if (!details) return "";
  if (typeof details === "string") return ` message=${JSON.stringify(details)}`;
  const entries = Object.entries(details).map(([key, value]) => `${key}=${JSON.stringify(value)}`);
  return entries.length ? ` ${entries.join(" ")}` : "";
}

function redisConnectionFromEnv() {
  const raw = process.env.REDIS_URL ?? "redis://localhost:6379";
  const url = new URL(raw);
  return {
    host: url.hostname,
    port: Number(url.port || 6379),
    username: url.username || undefined,
    password: url.password || undefined
  };
}

main().catch(async (error) => {
  console.error(error);
  await prisma.$disconnect();
  process.exit(1);
});
