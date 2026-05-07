import { Body, Controller, Get, Param, Post, Req } from "@nestjs/common";
import type { Request } from "express";
import { AuthService } from "../auth/auth.service.js";
import { VersionsService } from "./versions.service.js";

@Controller("projects/:projectId/versions")
export class VersionsController {
  constructor(
    private readonly auth: AuthService,
    private readonly versions: VersionsService
  ) {}

  @Get()
  async list(@Req() request: Request, @Param("projectId") projectId: string) {
    const user = await this.auth.requireUser(request);
    return { versions: await this.versions.list(user.id, projectId) };
  }

  @Post()
  async create(
    @Req() request: Request,
    @Param("projectId") projectId: string,
    @Body() body: { message?: string | null }
  ) {
    const user = await this.auth.requireUser(request);
    return { version: await this.versions.create(user.id, projectId, body) };
  }
}
