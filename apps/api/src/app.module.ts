import { Module } from "@nestjs/common";
import { AiController } from "./ai/ai.controller.js";
import { AiService } from "./ai/ai.service.js";
import { AssetsController } from "./assets/assets.controller.js";
import { AssetsService } from "./assets/assets.service.js";
import { AuthController } from "./auth/auth.controller.js";
import { AuthService } from "./auth/auth.service.js";
import { CompileController } from "./compile/compile.controller.js";
import { CompileService } from "./compile/compile.service.js";
import { ShareController } from "./compile/share.controller.js";
import { FilesController } from "./files/files.controller.js";
import { FilesService } from "./files/files.service.js";
import { PrismaService } from "./prisma/prisma.service.js";
import { ProjectsController } from "./projects/projects.controller.js";
import { ProjectsService } from "./projects/projects.service.js";
import { StorageService } from "./storage.service.js";
import { VersionsController } from "./versions/versions.controller.js";
import { VersionsService } from "./versions/versions.service.js";

@Module({
  controllers: [
    AiController,
    AssetsController,
    AuthController,
    CompileController,
    FilesController,
    ProjectsController,
    ShareController,
    VersionsController
  ],
  providers: [
    AiService,
    AssetsService,
    AuthService,
    CompileService,
    FilesService,
    PrismaService,
    ProjectsService,
    StorageService,
    VersionsService
  ]
})
export class AppModule {}
