import { Body, Controller, Delete, Get, Param, Patch, Post, Req } from "@nestjs/common";
import type { Request } from "express";
import { AuthService } from "../auth/auth.service.js";
import { FilesService } from "./files.service.js";

@Controller("projects/:projectId/files")
export class FilesController {
  constructor(
    private readonly auth: AuthService,
    private readonly files: FilesService
  ) {}

  @Get()
  async list(@Req() request: Request, @Param("projectId") projectId: string) {
    const user = await this.auth.requireUser(request);
    return { files: await this.files.list(user.id, projectId) };
  }

  @Get(":fileId")
  async get(
    @Req() request: Request,
    @Param("projectId") projectId: string,
    @Param("fileId") fileId: string
  ) {
    const user = await this.auth.requireUser(request);
    return { file: await this.files.get(user.id, projectId, fileId) };
  }

  @Post()
  async create(
    @Req() request: Request,
    @Param("projectId") projectId: string,
    @Body()
    body: { path?: string; kind?: "file" | "folder"; mimeType?: string; contentText?: string }
  ) {
    const user = await this.auth.requireUser(request);
    return { file: await this.files.create(user.id, projectId, body) };
  }

  @Patch(":fileId")
  async update(
    @Req() request: Request,
    @Param("projectId") projectId: string,
    @Param("fileId") fileId: string,
    @Body() body: { contentText?: string; path?: string; mimeType?: string | null }
  ) {
    const user = await this.auth.requireUser(request);
    return { file: await this.files.update(user.id, projectId, fileId, body) };
  }

  @Delete(":fileId")
  async remove(
    @Req() request: Request,
    @Param("projectId") projectId: string,
    @Param("fileId") fileId: string
  ) {
    const user = await this.auth.requireUser(request);
    return this.files.remove(user.id, projectId, fileId);
  }
}
