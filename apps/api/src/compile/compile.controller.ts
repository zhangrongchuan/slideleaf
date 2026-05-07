import { Body, Controller, Get, Param, Post, Req } from "@nestjs/common";
import type { Request } from "express";
import type { CompileTargetFormat } from "@slideleaf/shared";
import { AuthService } from "../auth/auth.service.js";
import { CompileService } from "./compile.service.js";

@Controller("projects/:projectId")
export class CompileController {
  constructor(
    private readonly auth: AuthService,
    private readonly compile: CompileService
  ) {}

  @Post("compile")
  async enqueue(
    @Req() request: Request,
    @Param("projectId") projectId: string,
    @Body() body: { targetFormat?: CompileTargetFormat; entryFileId?: string | null }
  ) {
    const user = await this.auth.requireUser(request);
    const job = await this.compile.enqueue(user.id, projectId, body);
    return { jobId: job.id, status: job.status };
  }

  @Get("compile-jobs/:jobId")
  async get(
    @Req() request: Request,
    @Param("projectId") projectId: string,
    @Param("jobId") jobId: string
  ) {
    const user = await this.auth.requireUser(request);
    return { job: await this.compile.get(user.id, projectId, jobId) };
  }
}
