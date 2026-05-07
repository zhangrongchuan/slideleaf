import { BadRequestException, Controller, Get, NotFoundException, Param, Req, Res } from "@nestjs/common";
import { contentTypeForPath } from "@slideleaf/storage";
import { validateWorkspacePath } from "@slideleaf/workspace";
import type { Request, Response } from "express";
import { PrismaService } from "../prisma/prisma.service.js";
import { StorageService } from "../storage.service.js";

@Controller("share")
export class ShareController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService
  ) {}

  @Get(":shareSlug")
  async show(@Param("shareSlug") shareSlug: string, @Res() response: Response) {
    const job = await this.prisma.compileJob.findFirst({
      where: {
        shareSlug,
        status: "success"
      }
    });

    if (!job?.outputStorageKey) {
      throw new NotFoundException("Shared presentation not found");
    }

    const html = await this.storage.storage.download(job.outputStorageKey);
    response.setHeader("content-type", "text/html; charset=utf-8");
    response.send(html.toString("utf8"));
  }

  @Get(":shareSlug/assets/*")
  async asset(
    @Param("shareSlug") shareSlug: string,
    @Req() request: Request,
    @Res() response: Response
  ) {
    const job = await this.prisma.compileJob.findFirst({
      where: {
        shareSlug,
        status: "success"
      }
    });

    if (!job?.outputStorageKey) {
      throw new NotFoundException("Shared presentation not found");
    }

    const marker = `/share/${shareSlug}/`;
    const relativePath = decodeURIComponent(request.path.slice(request.path.indexOf(marker) + marker.length));
    let safePath: string;
    try {
      safePath = validateWorkspacePath(relativePath);
    } catch (error) {
      throw new BadRequestException(error instanceof Error ? error.message : String(error));
    }

    const prefix = job.outputStorageKey.replace(/\/index\.html$/, "");
    const buffer = await this.storage.storage.download(`${prefix}/${safePath}`);
    response.setHeader("content-type", contentTypeForPath(safePath));
    response.send(buffer);
  }
}
