import { Body, Controller, Get, Param, Post, Req } from "@nestjs/common";
import type { Request } from "express";
import { AuthService } from "../auth/auth.service.js";
import { AiService } from "./ai.service.js";

@Controller("projects/:projectId/ai")
export class AiController {
  constructor(
    private readonly auth: AuthService,
    private readonly ai: AiService
  ) {}

  @Get("conversation")
  async conversation(@Req() request: Request, @Param("projectId") projectId: string) {
    const user = await this.auth.requireUser(request);
    return this.ai.getConversation(user.id, projectId);
  }

  @Get("workflow")
  async workflow(@Req() request: Request, @Param("projectId") projectId: string) {
    const user = await this.auth.requireUser(request);
    return this.ai.getWorkflow(user.id, projectId);
  }

  @Post("workflow/stage")
  async setWorkflowStage(
    @Req() request: Request,
    @Param("projectId") projectId: string,
    @Body() body: { conversationId?: string; stage?: string }
  ) {
    const user = await this.auth.requireUser(request);
    return this.ai.setWorkflowStage(user.id, projectId, body);
  }

  @Post("workflow/artifacts")
  async generateArtifact(
    @Req() request: Request,
    @Param("projectId") projectId: string,
    @Body() body: { conversationId?: string; type?: string; instruction?: string; provider?: string }
  ) {
    const user = await this.auth.requireUser(request);
    return this.ai.generateArtifact(user.id, projectId, body);
  }

  @Post("workflow/artifacts/:artifactId/approve")
  async approveArtifact(
    @Req() request: Request,
    @Param("projectId") projectId: string,
    @Param("artifactId") artifactId: string
  ) {
    const user = await this.auth.requireUser(request);
    return this.ai.approveArtifact(user.id, projectId, artifactId);
  }

  @Post("edit-file")
  async editFile(
    @Req() request: Request,
    @Param("projectId") projectId: string,
    @Body()
    body: {
      conversationId?: string;
      fileId?: string;
      instruction?: string;
      selectedText?: string | null;
      provider?: string;
    }
  ) {
    const user = await this.auth.requireUser(request);
    return { task: await this.ai.editFile(user.id, projectId, body) };
  }

  @Get("tasks/:taskId")
  async get(
    @Req() request: Request,
    @Param("projectId") projectId: string,
    @Param("taskId") taskId: string
  ) {
    const user = await this.auth.requireUser(request);
    return { task: await this.ai.get(user.id, projectId, taskId) };
  }

  @Post("tasks/:taskId/apply")
  async apply(
    @Req() request: Request,
    @Param("projectId") projectId: string,
    @Param("taskId") taskId: string
  ) {
    const user = await this.auth.requireUser(request);
    return { task: await this.ai.apply(user.id, projectId, taskId) };
  }

  @Post("tasks/:taskId/reject")
  async reject(
    @Req() request: Request,
    @Param("projectId") projectId: string,
    @Param("taskId") taskId: string
  ) {
    const user = await this.auth.requireUser(request);
    return { task: await this.ai.reject(user.id, projectId, taskId) };
  }
}
