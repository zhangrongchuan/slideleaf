import { BadRequestException, Injectable } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import { contentTypeForPath } from "@slideleaf/storage";
import { PrismaService } from "../prisma/prisma.service.js";
import { ProjectsService } from "../projects/projects.service.js";
import { StorageService } from "../storage.service.js";
import { nameFor, normalizeClientPath, parentPathFor } from "../workspace-paths.js";

const MAX_ASSET_BYTES = 10 * 1024 * 1024;
const ALLOWED_IMAGE_MIME_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp"
]);

@Injectable()
export class AssetsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly projects: ProjectsService,
    private readonly storage: StorageService
  ) {}

  async list(userId: string, projectId: string) {
    await this.projects.assertAccess(userId, projectId, "viewer");
    return this.prisma.asset.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" }
    });
  }

  async upload(userId: string, projectId: string, file: Express.Multer.File) {
    await this.projects.assertAccess(userId, projectId, "editor");
    if (!file) throw new BadRequestException("Upload file is required");
    if (file.size > MAX_ASSET_BYTES) {
      throw new BadRequestException("Asset file is too large");
    }
    if (!ALLOWED_IMAGE_MIME_TYPES.has(file.mimetype)) {
      throw new BadRequestException("Only image assets are supported in the MVP");
    }

    const assetId = randomUUID();
    const safeFileName = sanitizeFileName(file.originalname);
    const workspacePath = normalizeClientPath(`assets/${safeFileName}`);
    const storageKey = `projects/${projectId}/assets/${assetId}/${safeFileName}`;

    await this.storage.storage.upload(storageKey, file.buffer, file.mimetype || contentTypeForPath(safeFileName));

    return this.prisma.$transaction(async (tx) => {
      const parentPath = parentPathFor(workspacePath);
      const parent = parentPath
        ? await tx.file.findFirst({ where: { projectId, path: parentPath, kind: "folder" } })
        : null;

      const projectFile = await tx.file.upsert({
        where: {
          projectId_path: {
            projectId,
            path: workspacePath
          }
        },
        create: {
          projectId,
          parentId: parent?.id ?? null,
          name: nameFor(workspacePath),
          path: workspacePath,
          kind: "file",
          mimeType: file.mimetype,
          isBinary: true,
          storageKey
        },
        update: {
          mimeType: file.mimetype,
          isBinary: true,
          storageKey,
          contentText: null
        }
      });

      const asset = await tx.asset.create({
        data: {
          id: assetId,
          projectId,
          fileId: projectFile.id,
          storageKey,
          mimeType: file.mimetype,
          sizeBytes: file.size
        }
      });

      await tx.project.update({ where: { id: projectId }, data: { updatedAt: new Date() } });
      return { asset, file: projectFile };
    });
  }
}

function sanitizeFileName(input: string): string {
  const name = input.split(/[\\/]/).at(-1)?.trim() || "asset";
  return name.replace(/[^a-zA-Z0-9._-]/g, "-").replace(/-+/g, "-").slice(0, 120);
}
