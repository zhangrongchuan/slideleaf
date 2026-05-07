import { Body, Controller, Get, Post, Req, Res } from "@nestjs/common";
import type { Request, Response } from "express";
import { AuthService } from "./auth.service.js";

@Controller("auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post("register")
  async register(
    @Body() body: { email?: string; password?: string; name?: string },
    @Res({ passthrough: true }) response: Response
  ) {
    const user = await this.auth.register(body);
    this.auth.setSessionCookie(response, user);
    return { user };
  }

  @Post("login")
  async login(
    @Body() body: { email?: string; password?: string },
    @Res({ passthrough: true }) response: Response
  ) {
    const user = await this.auth.login(body);
    this.auth.setSessionCookie(response, user);
    return { user };
  }

  @Post("logout")
  logout(@Res({ passthrough: true }) response: Response) {
    this.auth.clearSessionCookie(response);
    return { ok: true };
  }

  @Get("me")
  async me(@Req() request: Request) {
    return { user: await this.auth.me(request) };
  }
}
