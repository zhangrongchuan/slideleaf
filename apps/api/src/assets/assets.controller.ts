import { Controller, Get, Param, Post, Req, UploadedFile, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import type { Request } from "express";
import { AuthService } from "../auth/auth.service.js";
import { AssetsService } from "./assets.service.js";

@Controller("projects/:projectId/assets")
export class AssetsController {
  constructor(
    private readonly auth: AuthService,
    private readonly assets: AssetsService
  ) {}

  @Get()
  async list(@Req() request: Request, @Param("projectId") projectId: string) {
    const user = await this.auth.requireUser(request);
    return { assets: await this.assets.list(user.id, projectId) };
  }

  @Post()
  @UseInterceptors(FileInterceptor("file"))
  async upload(
    @Req() request: Request,
    @Param("projectId") projectId: string,
    @UploadedFile() file: Express.Multer.File
  ) {
    const user = await this.auth.requireUser(request);
    return this.assets.upload(user.id, projectId, file);
  }
}
