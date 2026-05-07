import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException
} from "@nestjs/common";
import { DEFAULT_PROJECT_FILES } from "@slideleaf/shared";
import { PrismaService } from "../prisma/prisma.service.js";
import { nameFor, normalizeClientPath, parentPathFor } from "../workspace-paths.js";

export type ProjectRole = "owner" | "editor" | "viewer";
type AccessLevel = ProjectRole;

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: string) {
    const projects = await this.prisma.project.findMany({
      where: {
        OR: [{ ownerId: userId }, { members: { some: { userId } } }]
      },
      include: { members: { where: { userId } } },
      orderBy: { updatedAt: "desc" }
    });

    return projects.map((project) => ({
      id: project.id,
      title: project.title,
      description: project.description,
      currentUserRole: project.ownerId === userId ? "owner" : normalizeRole(project.members[0]?.role),
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
    const access = await this.assertAccess(userId, projectId, "viewer");
    const project = await this.prisma.project.findUnique({
      where: { id: projectId }
    });
    if (!project) throw new NotFoundException("Project not found");
    return { ...project, currentUserRole: access.currentUserRole };
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
    const project = await this.assertAccess(userId, projectId, "owner");
    if (project.ownerId !== userId && project.currentUserRole !== "owner") {
      throw new ForbiddenException("Only the owner can delete this project");
    }
    await this.prisma.project.delete({ where: { id: projectId } });
    return { ok: true };
  }

  async listMembers(userId: string, projectId: string) {
    await this.assertAccess(userId, projectId, "viewer");
    const members = await this.prisma.projectMember.findMany({
      where: { projectId },
      include: { user: true },
      orderBy: [{ role: "asc" }, { createdAt: "asc" }]
    });

    return members.map((member) => ({
      id: member.id,
      projectId: member.projectId,
      userId: member.userId,
      role: normalizeRole(member.role),
      createdAt: member.createdAt.toISOString(),
      user: {
        id: member.user.id,
        email: member.user.email,
        name: member.user.name
      }
    }));
  }

  async inviteMember(userId: string, projectId: string, body: { email?: string; role?: string }) {
    await this.assertAccess(userId, projectId, "owner");
    const email = normalizeEmail(body.email);
    const role = normalizeRoleInput(body.role);
    const invitedUser = await this.prisma.user.findUnique({ where: { email } });
    if (!invitedUser) {
      throw new BadRequestException("User must register before they can be invited");
    }

    const member = await this.prisma.projectMember.upsert({
      where: {
        projectId_userId: {
          projectId,
          userId: invitedUser.id
        }
      },
      create: {
        projectId,
        userId: invitedUser.id,
        role
      },
      update: { role },
      include: { user: true }
    });

    return {
      id: member.id,
      projectId: member.projectId,
      userId: member.userId,
      role: normalizeRole(member.role),
      createdAt: member.createdAt.toISOString(),
      user: {
        id: member.user.id,
        email: member.user.email,
        name: member.user.name
      }
    };
  }

  async updateMemberRole(userId: string, projectId: string, memberId: string, body: { role?: string }) {
    await this.assertAccess(userId, projectId, "owner");
    const role = normalizeRoleInput(body.role);
    const member = await this.prisma.projectMember.findFirst({
      where: { id: memberId, projectId },
      include: { project: true, user: true }
    });
    if (!member) throw new NotFoundException("Project member not found");
    if (member.userId === member.project.ownerId && role !== "owner") {
      throw new BadRequestException("Project creator must remain an owner");
    }
    if (normalizeRole(member.role) === "owner" && role !== "owner") {
      await this.assertAnotherOwner(projectId, member.userId);
    }

    const updated = await this.prisma.projectMember.update({
      where: { id: memberId },
      data: { role },
      include: { user: true }
    });

    return {
      id: updated.id,
      projectId: updated.projectId,
      userId: updated.userId,
      role: normalizeRole(updated.role),
      createdAt: updated.createdAt.toISOString(),
      user: {
        id: updated.user.id,
        email: updated.user.email,
        name: updated.user.name
      }
    };
  }

  async removeMember(userId: string, projectId: string, memberId: string) {
    await this.assertAccess(userId, projectId, "owner");
    const member = await this.prisma.projectMember.findFirst({
      where: { id: memberId, projectId },
      include: { project: true }
    });
    if (!member) throw new NotFoundException("Project member not found");
    if (member.userId === member.project.ownerId) {
      throw new BadRequestException("Project creator cannot be removed");
    }
    if (normalizeRole(member.role) === "owner") {
      await this.assertAnotherOwner(projectId, member.userId);
    }
    await this.prisma.projectMember.delete({ where: { id: memberId } });
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

    const currentUserRole = project.ownerId === userId ? "owner" : normalizeRole(project.members[0]?.role);
    if (roleRank(currentUserRole) < roleRank(level)) {
      throw new ForbiddenException(
        level === "owner"
          ? "You do not have owner access to this project"
          : level === "editor"
            ? "You do not have edit access to this project"
            : "You do not have access to this project"
      );
    }

    return { ...project, currentUserRole };
  }

  private async assertAnotherOwner(projectId: string, excludedUserId: string): Promise<void> {
    const anotherOwner = await this.prisma.projectMember.findFirst({
      where: {
        projectId,
        role: "owner",
        userId: { not: excludedUserId }
      }
    });
    if (!anotherOwner) {
      throw new BadRequestException("A project must keep at least one owner");
    }
  }
}

function normalizeRoleInput(input: string | undefined): ProjectRole {
  const value = input?.trim().toLowerCase();
  if (value === "owner") return "owner";
  if (value === "edit" || value === "editor") return "editor";
  if (value === "view" || value === "viewer") return "viewer";
  throw new BadRequestException("role must be owner, editor, or viewer");
}

function normalizeRole(input: string | undefined | null): ProjectRole {
  if (input === "owner" || input === "editor" || input === "viewer") return input;
  return "viewer";
}

function roleRank(role: ProjectRole): number {
  if (role === "owner") return 3;
  if (role === "editor") return 2;
  return 1;
}

function normalizeEmail(email: string | undefined): string {
  const normalized = email?.trim().toLowerCase();
  if (!normalized || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(normalized)) {
    throw new BadRequestException("A valid email is required");
  }
  return normalized;
}
