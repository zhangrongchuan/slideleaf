import { Body, Controller, Get, Param, Post, Req, Res } from "@nestjs/common";
import type { Request, Response } from "express";
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

  @Get("compile-jobs/:jobId/download-html")
  async downloadHtml(
    @Req() request: Request,
    @Param("projectId") projectId: string,
    @Param("jobId") jobId: string,
    @Res() response: Response
  ) {
    const user = await this.auth.requireUser(request);
    const download = await this.compile.downloadHtml(user.id, projectId, jobId);
    response.setHeader("content-type", "text/html; charset=utf-8");
    response.setHeader("content-disposition", contentDisposition(download.filename));
    response.send(download.html);
  }
}

function contentDisposition(filename: string): string {
  const asciiName = filename.replace(/[^\x20-\x7e]/g, "_").replace(/["\\]/g, "_");
  return `attachment; filename="${asciiName}"; filename*=UTF-8''${encodeURIComponent(filename)}`;
}
