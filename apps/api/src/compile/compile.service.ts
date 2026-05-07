import { BadRequestException, Injectable, NotFoundException, OnModuleDestroy } from "@nestjs/common";
import { Queue } from "bullmq";
import type { CompileTargetFormat } from "@slideleaf/shared";
import { PrismaService } from "../prisma/prisma.service.js";
import { ProjectsService } from "../projects/projects.service.js";
import { redisConnectionFromEnv } from "../redis.js";

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
    private readonly projects: ProjectsService
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
}
