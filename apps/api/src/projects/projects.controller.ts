import { Body, Controller, Delete, Get, Param, Patch, Post, Req } from "@nestjs/common";
import type { Request } from "express";
import { AuthService } from "../auth/auth.service.js";
import { ProjectsService } from "./projects.service.js";

@Controller("projects")
export class ProjectsController {
  constructor(
    private readonly auth: AuthService,
    private readonly projects: ProjectsService
  ) {}

  @Get()
  async list(@Req() request: Request) {
    const user = await this.auth.requireUser(request);
    return { projects: await this.projects.list(user.id) };
  }

  @Post()
  async create(@Req() request: Request, @Body() body: { title?: string; description?: string }) {
    const user = await this.auth.requireUser(request);
    return { project: await this.projects.create(user.id, body) };
  }

  @Get(":projectId")
  async get(@Req() request: Request, @Param("projectId") projectId: string) {
    const user = await this.auth.requireUser(request);
    return { project: await this.projects.get(user.id, projectId) };
  }

  @Patch(":projectId")
  async update(
    @Req() request: Request,
    @Param("projectId") projectId: string,
    @Body() body: { title?: string; description?: string | null }
  ) {
    const user = await this.auth.requireUser(request);
    return { project: await this.projects.update(user.id, projectId, body) };
  }

  @Delete(":projectId")
  async remove(@Req() request: Request, @Param("projectId") projectId: string) {
    const user = await this.auth.requireUser(request);
    return this.projects.remove(user.id, projectId);
  }

  @Get(":projectId/members")
  async members(@Req() request: Request, @Param("projectId") projectId: string) {
    const user = await this.auth.requireUser(request);
    return { members: await this.projects.listMembers(user.id, projectId) };
  }

  @Post(":projectId/members")
  async inviteMember(
    @Req() request: Request,
    @Param("projectId") projectId: string,
    @Body() body: { email?: string; role?: string }
  ) {
    const user = await this.auth.requireUser(request);
    return { member: await this.projects.inviteMember(user.id, projectId, body) };
  }

  @Patch(":projectId/members/:memberId")
  async updateMember(
    @Req() request: Request,
    @Param("projectId") projectId: string,
    @Param("memberId") memberId: string,
    @Body() body: { role?: string }
  ) {
    const user = await this.auth.requireUser(request);
    return { member: await this.projects.updateMemberRole(user.id, projectId, memberId, body) };
  }

  @Delete(":projectId/members/:memberId")
  async removeMember(
    @Req() request: Request,
    @Param("projectId") projectId: string,
    @Param("memberId") memberId: string
  ) {
    const user = await this.auth.requireUser(request);
    return this.projects.removeMember(user.id, projectId, memberId);
  }
}
