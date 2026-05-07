import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
import { ProjectsService } from "../projects/projects.service.js";
import { nameFor, normalizeClientPath, parentPathFor } from "../workspace-paths.js";

@Injectable()
export class FilesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly projects: ProjectsService
  ) {}

  async list(userId: string, projectId: string) {
    await this.projects.assertAccess(userId, projectId, "viewer");
    return this.prisma.file.findMany({
      where: { projectId },
      orderBy: [{ kind: "desc" }, { path: "asc" }]
    });
  }

  async get(userId: string, projectId: string, fileId: string) {
    await this.projects.assertAccess(userId, projectId, "viewer");
    const file = await this.prisma.file.findFirst({ where: { id: fileId, projectId } });
    if (!file) throw new NotFoundException("File not found");
    return file;
  }

  async create(
    userId: string,
    projectId: string,
    body: {
      path?: string;
      kind?: "file" | "folder";
      mimeType?: string | null;
      contentText?: string | null;
    }
  ) {
    await this.projects.assertAccess(userId, projectId, "editor");
    const filePath = normalizeClientPath(body.path ?? "");
    const kind = body.kind === "folder" ? "folder" : "file";
    const parentPath = parentPathFor(filePath);
    const parent = parentPath
      ? await this.prisma.file.findFirst({ where: { projectId, path: parentPath, kind: "folder" } })
      : null;

    if (parentPath && !parent) {
      throw new BadRequestException(`Parent folder does not exist: ${parentPath}`);
    }

    const file = await this.prisma.file.create({
      data: {
        projectId,
        parentId: parent?.id ?? null,
        name: nameFor(filePath),
        path: filePath,
        kind,
        mimeType: body.mimeType ?? guessMimeType(filePath),
        isBinary: false,
        contentText: kind === "folder" ? null : body.contentText ?? ""
      }
    });

    await this.touchProject(projectId);
    return file;
  }

  async update(
    userId: string,
    projectId: string,
    fileId: string,
    body: {
      contentText?: string | null;
      path?: string;
      mimeType?: string | null;
    }
  ) {
    await this.projects.assertAccess(userId, projectId, "editor");
    const current = await this.prisma.file.findFirst({ where: { id: fileId, projectId } });
    if (!current) throw new NotFoundException("File not found");
    if (current.isBinary && body.contentText !== undefined) {
      throw new BadRequestException("Binary files cannot be edited as text");
    }

    const nextPath = body.path ? normalizeClientPath(body.path) : current.path;
    const parentPath = parentPathFor(nextPath);
    const parent = parentPath
      ? await this.prisma.file.findFirst({ where: { projectId, path: parentPath, kind: "folder" } })
      : null;

    if (parentPath && !parent) {
      throw new BadRequestException(`Parent folder does not exist: ${parentPath}`);
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const file = await tx.file.update({
        where: { id: fileId },
        data: {
          path: nextPath,
          name: nameFor(nextPath),
          parentId: parent?.id ?? null,
          mimeType: body.mimeType === undefined ? undefined : body.mimeType,
          contentText: body.contentText === undefined ? undefined : body.contentText ?? ""
        }
      });

      if (current.kind === "folder" && nextPath !== current.path) {
        const descendants = await tx.file.findMany({
          where: {
            projectId,
            path: { startsWith: `${current.path}/` }
          }
        });

        for (const descendant of descendants) {
          const rewrittenPath = `${nextPath}/${descendant.path.slice(current.path.length + 1)}`;
          await tx.file.update({
            where: { id: descendant.id },
            data: {
              path: rewrittenPath,
              name: nameFor(rewrittenPath)
            }
          });
        }
      }

      await tx.project.update({ where: { id: projectId }, data: { updatedAt: new Date() } });
      return file;
    });

    return updated;
  }

  async remove(userId: string, projectId: string, fileId: string) {
    await this.projects.assertAccess(userId, projectId, "editor");
    const current = await this.prisma.file.findFirst({ where: { id: fileId, projectId } });
    if (!current) throw new NotFoundException("File not found");

    await this.prisma.$transaction(async (tx) => {
      if (current.kind === "folder") {
        await tx.file.deleteMany({
          where: {
            projectId,
            OR: [{ id: current.id }, { path: { startsWith: `${current.path}/` } }]
          }
        });
      } else {
        await tx.file.delete({ where: { id: fileId } });
      }
      await tx.project.update({ where: { id: projectId }, data: { updatedAt: new Date() } });
    });

    return { ok: true };
  }

  private async touchProject(projectId: string): Promise<void> {
    await this.prisma.project.update({ where: { id: projectId }, data: { updatedAt: new Date() } });
  }
}

function guessMimeType(filePath: string): string {
  const lower = filePath.toLowerCase();
  if (lower.endsWith(".md")) return "text/markdown";
  if (lower.endsWith(".css")) return "text/css";
  if (lower.endsWith(".json")) return "application/json";
  if (lower.endsWith(".html")) return "text/html";
  if (lower.endsWith(".txt")) return "text/plain";
  return "text/plain";
}
