import {
  ForbiddenException,
  Injectable,
  NotFoundException
} from "@nestjs/common";
import { DEFAULT_PROJECT_FILES } from "@slideleaf/shared";
import { PrismaService } from "../prisma/prisma.service.js";
import { nameFor, normalizeClientPath, parentPathFor } from "../workspace-paths.js";

type AccessLevel = "viewer" | "editor";

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: string) {
    const projects = await this.prisma.project.findMany({
      where: {
        OR: [{ ownerId: userId }, { members: { some: { userId } } }]
      },
      orderBy: { updatedAt: "desc" }
    });

    return projects.map((project) => ({
      id: project.id,
      title: project.title,
      description: project.description,
      updatedAt: project.updatedAt.toISOString()
    }));
  }

  async create(userId: string, body: { title?: string; description?: string | null }) {
    const title = body.title?.trim() || "Untitled Presentation";
    const description = body.description?.trim() || null;

    return this.prisma.$transaction(async (tx) => {
      const project = await tx.project.create({
        data: { title, description, ownerId: userId }
      });

      await tx.projectMember.create({
        data: {
          projectId: project.id,
          userId,
          role: "owner"
        }
      });

      const createdByPath = new Map<string, { id: string }>();
      const sortedFiles = [...DEFAULT_PROJECT_FILES].sort((a, b) => {
        const depth = (input: string) => input.split("/").length;
        return depth(a.path) - depth(b.path) || a.path.localeCompare(b.path);
      });

      for (const templateFile of sortedFiles) {
        const filePath = normalizeClientPath(templateFile.path);
        const parentPath = parentPathFor(filePath);
        const parent = parentPath ? createdByPath.get(parentPath) : undefined;
        const created = await tx.file.create({
          data: {
            projectId: project.id,
            parentId: parent?.id,
            name: nameFor(filePath),
            path: filePath,
            kind: templateFile.kind,
            mimeType: templateFile.mimeType,
            isBinary: templateFile.isBinary ?? false,
            contentText: templateFile.contentText ?? null
          }
        });
        createdByPath.set(filePath, created);
      }

      const entry = createdByPath.get("slides/deck.html");
      const updated = entry
        ? await tx.project.update({
            where: { id: project.id },
            data: { defaultEntryFileId: entry.id }
          })
        : project;

      return updated;
    });
  }

  async get(userId: string, projectId: string) {
    await this.assertAccess(userId, projectId, "viewer");
    const project = await this.prisma.project.findUnique({
      where: { id: projectId }
    });
    if (!project) throw new NotFoundException("Project not found");
    return project;
  }

  async update(
    userId: string,
    projectId: string,
    body: { title?: string; description?: string | null }
  ) {
    await this.assertAccess(userId, projectId, "editor");
    return this.prisma.project.update({
      where: { id: projectId },
      data: {
        title: body.title?.trim() || undefined,
        description: body.description === undefined ? undefined : body.description?.trim() || null
      }
    });
  }

  async remove(userId: string, projectId: string) {
    const project = await this.assertAccess(userId, projectId, "editor");
    if (project.ownerId !== userId) {
      throw new ForbiddenException("Only the owner can delete this project");
    }
    await this.prisma.project.delete({ where: { id: projectId } });
    return { ok: true };
  }

  async assertAccess(userId: string, projectId: string, level: AccessLevel) {
    const project = await this.prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [{ ownerId: userId }, { members: { some: { userId } } }]
      },
      include: { members: { where: { userId } } }
    });

    if (!project) {
      throw new NotFoundException("Project not found");
    }

    if (level === "editor" && project.ownerId !== userId) {
      const role = project.members[0]?.role;
      if (role !== "owner" && role !== "editor") {
        throw new ForbiddenException("You do not have edit access to this project");
      }
    }

    return project;
  }
}
