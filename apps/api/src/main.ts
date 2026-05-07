import "reflect-metadata";
import "dotenv/config";
import { NestFactory } from "@nestjs/core";
import cookieParser from "cookie-parser";
import type { NextFunction, Request, Response } from "express";
import { AppModule } from "./app.module.js";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.use((request: Request, response: Response, next: NextFunction) => {
    const startedAt = Date.now();
    response.on("finish", () => {
      const elapsedMs = Date.now() - startedAt;
      console.log(`[http] ${request.method} ${request.originalUrl} ${response.statusCode} ${elapsedMs}ms`);
    });
    next();
  });
  app.enableCors({
    origin: [
      process.env.WEB_URL ?? "http://localhost:3000",
      "http://127.0.0.1:3000"
    ],
    credentials: true
  });

  const port = Number(process.env.PORT ?? 4000);
  await app.listen(port, "0.0.0.0");
  console.log(`SlideLeaf API listening on http://localhost:${port}`);
}

bootstrap().catch((error) => {
  console.error(error);
  process.exit(1);
});
