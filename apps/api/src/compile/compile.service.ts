import { BadRequestException, Injectable, NotFoundException, OnModuleDestroy } from "@nestjs/common";
import { Queue } from "bullmq";
import { contentTypeForPath } from "@slideleaf/storage";
import type { CompileTargetFormat } from "@slideleaf/shared";
import { PrismaService } from "../prisma/prisma.service.js";
import { ProjectsService } from "../projects/projects.service.js";
import { redisConnectionFromEnv } from "../redis.js";
import { StorageService } from "../storage.service.js";

type CompileJobData = {
  jobId: string;
  projectId: string;
  userId: string;
  targetFormat: CompileTargetFormat;
};

@Injectable()
export class CompileService implements OnModuleDestroy {
  private readonly queue = new Queue<CompileJobData>("compile", {
    connection: redisConnectionFromEnv()
  });

  constructor(
    private readonly prisma: PrismaService,
    private readonly projects: ProjectsService,
    private readonly storage: StorageService
  ) {}

  async onModuleDestroy(): Promise<void> {
    await this.queue.close();
  }

  async enqueue(
    userId: string,
    projectId: string,
    body: { targetFormat?: CompileTargetFormat; entryFileId?: string | null }
  ) {
    const startedAt = Date.now();
    await this.projects.assertAccess(userId, projectId, "viewer");
    const targetFormat = body.targetFormat ?? "html";
    if (targetFormat !== "html" && targetFormat !== "pdf") {
      throw new BadRequestException("targetFormat must be html or pdf");
    }

    const job = await this.prisma.compileJob.create({
      data: {
        projectId,
        userId,
        entryFileId: body.entryFileId ?? null,
        targetFormat,
        status: "queued",
        log: "Queued compile job"
      }
    });

    await this.queue.add(
      "compile-project",
      {
        jobId: job.id,
        projectId,
        userId,
        targetFormat
      },
      {
        jobId: job.id,
        attempts: 1,
        removeOnComplete: 50,
        removeOnFail: 50
      }
    );

    console.log(
      `[timing][compile-enqueue] project=${projectId} job=${job.id} target=${targetFormat} ms=${Date.now() - startedAt}`
    );
    return job;
  }

  async get(userId: string, projectId: string, jobId: string) {
    await this.projects.assertAccess(userId, projectId, "viewer");
    const job = await this.prisma.compileJob.findFirst({ where: { id: jobId, projectId } });
    if (!job) throw new NotFoundException("Compile job not found");
    return {
      ...job,
      shareUrl: job.shareSlug ? `${process.env.API_URL ?? "http://localhost:4000"}/share/${job.shareSlug}` : null
    };
  }

  async downloadHtml(userId: string, projectId: string, jobId: string) {
    await this.projects.assertAccess(userId, projectId, "viewer");
    const job = await this.prisma.compileJob.findFirst({
      where: { id: jobId, projectId },
      include: { project: true }
    });
    if (!job) throw new NotFoundException("Compile job not found");
    if (job.status !== "success" || !job.outputStorageKey) {
      throw new BadRequestException("Compile the project successfully before downloading HTML");
    }

    const htmlBuffer = await this.storage.storage.download(job.outputStorageKey);
    const prefix = job.outputStorageKey.replace(/\/index\.html$/, "");
    const html = await inlineCompiledAssets(htmlBuffer.toString("utf8"), async (assetPath) => {
      const buffer = await this.storage.storage.download(`${prefix}/${assetPath}`);
      return {
        contentType: contentTypeForPath(assetPath).replace(/\s+/g, ""),
        data: buffer
      };
    });

    return {
      filename: `${safeDownloadName(job.project.title || "slideleaf-deck")}.html`,
      html
    };
  }
}

async function inlineCompiledAssets(
  html: string,
  loadAsset: (assetPath: string) => Promise<{ contentType: string; data: Buffer }>
): Promise<string> {
  const assetPaths = collectCompiledAssetPaths(html);
  const dataUrls = new Map<string, string>();

  for (const assetPath of assetPaths) {
    try {
      const safePath = sanitizeCompiledAssetPath(assetPath);
      if (!safePath) continue;
      const asset = await loadAsset(safePath);
      dataUrls.set(assetPath, `data:${asset.contentType};base64,${asset.data.toString("base64")}`);
    } catch {
      // Keep the original reference if an optional asset cannot be inlined.
    }
  }

  if (!dataUrls.size) return html;

  return html.replace(/(\b(?:src|href)\s*=\s*)(["'])(assets\/[^"']+)\2/gi, (match, prefix, quote, value) => {
    const dataUrl = dataUrls.get(value);
    return dataUrl ? `${prefix}${quote}${dataUrl}${quote}` : match;
  }).replace(/url\(\s*(["']?)(assets\/[^"')]+)\1\s*\)/gi, (match, quote, value) => {
    const dataUrl = dataUrls.get(value);
    return dataUrl ? `url(${quote}${dataUrl}${quote})` : match;
  });
}

function collectCompiledAssetPaths(html: string): string[] {
  const paths = new Set<string>();
  for (const match of html.matchAll(/\b(?:src|href)\s*=\s*(["'])(assets\/[^"']+)\1/gi)) {
    if (match[2]) paths.add(match[2]);
  }
  for (const match of html.matchAll(/url\(\s*(["']?)(assets\/[^"')]+)\1\s*\)/gi)) {
    if (match[2]) paths.add(match[2]);
  }
  return [...paths];
}

function sanitizeCompiledAssetPath(pathValue: string): string | null {
  const pathOnly = decodeURIComponent(pathValue.split(/[?#]/, 1)[0] ?? "").replace(/\\/g, "/");
  if (!pathOnly.startsWith("assets/")) return null;
  const segments = pathOnly.split("/").filter(Boolean);
  if (segments.length < 2 || segments.includes(".") || segments.includes("..")) return null;
  return segments.join("/");
}

function safeDownloadName(input: string): string {
  const normalized = input
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fff]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return normalized || "slideleaf-deck";
}
