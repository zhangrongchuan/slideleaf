import { Injectable } from "@nestjs/common";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import * as tar from "tar";
import { materializeWorkspace } from "@slideleaf/workspace";
import { PrismaService } from "../prisma/prisma.service.js";
import { ProjectsService } from "../projects/projects.service.js";
import { StorageService } from "../storage.service.js";

@Injectable()
export class VersionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly projects: ProjectsService,
    private readonly storage: StorageService
  ) {}

  async list(userId: string, projectId: string) {
    await this.projects.assertAccess(userId, projectId, "viewer");
    return this.prisma.version.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" }
    });
  }

  async create(userId: string, projectId: string, body: { message?: string | null }) {
    await this.projects.assertAccess(userId, projectId, "editor");
    const baseDir = await mkdtemp(path.join(os.tmpdir(), "slideleaf-version-"));
    const workspaceDir = path.join(baseDir, "workspace");
    const archivePath = path.join(baseDir, "snapshot.tar.gz");

    try {
      const version = await this.prisma.version.create({
        data: {
          projectId,
          createdBy: userId,
          message: body.message?.trim() || null,
          snapshotStorageKey: "pending"
        }
      });
      const storageKey = `projects/${projectId}/snapshots/${version.id}/snapshot.tar.gz`;

      await materializeWorkspace({
        projectId,
        targetDir: workspaceDir,
        prisma: this.prisma,
        storage: this.storage.storage
      });
      await tar.c({ gzip: true, cwd: workspaceDir, file: archivePath }, ["."]);
      await this.storage.storage.upload(storageKey, await readFile(archivePath), "application/gzip");

      return this.prisma.version.update({
        where: { id: version.id },
        data: { snapshotStorageKey: storageKey }
      });
    } finally {
      await rm(baseDir, { recursive: true, force: true });
    }
  }
}
