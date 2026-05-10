import { BadRequestException, Body, Controller, Get, Patch, Post, Query, Req, Res } from "@nestjs/common";
import { randomBytes } from "node:crypto";
import type { Request, Response } from "express";
import { AuthService } from "./auth.service.js";

const GOOGLE_STATE_COOKIE = "slideleaf_google_oauth_state";

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

  @Get("google")
  google(@Res() response: Response) {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) throw new BadRequestException("GOOGLE_CLIENT_ID is not configured");

    const state = randomBytes(24).toString("hex");
    response.cookie(GOOGLE_STATE_COOKIE, state, {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 10,
      path: "/auth/google/callback"
    });

    const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    url.searchParams.set("client_id", clientId);
    url.searchParams.set("redirect_uri", googleCallbackUrl());
    url.searchParams.set("response_type", "code");
    url.searchParams.set("scope", "openid email profile");
    url.searchParams.set("state", state);
    url.searchParams.set("prompt", "select_account");

    response.redirect(url.toString());
  }

  @Get("google/callback")
  async googleCallback(
    @Req() request: Request,
    @Query("code") code: string | undefined,
    @Query("state") state: string | undefined,
    @Query("error") error: string | undefined,
    @Res() response: Response
  ) {
    if (error) throw new BadRequestException(error);
    if (!code) throw new BadRequestException("Missing Google authorization code");
    if (!state || state !== request.cookies?.[GOOGLE_STATE_COOKIE]) {
      throw new BadRequestException("Invalid Google OAuth state");
    }

    const profile = await fetchGoogleProfile(code);
    const user = await this.auth.loginWithGoogleProfile(profile);
    this.auth.setSessionCookie(response, user);
    response.clearCookie(GOOGLE_STATE_COOKIE, { path: "/auth/google/callback" });
    response.redirect(`${webUrl()}/dashboard`);
  }

  @Get("me")
  async me(@Req() request: Request) {
    return { user: await this.auth.me(request) };
  }

  @Patch("me")
  async updateMe(
    @Req() request: Request,
    @Body() body: { email?: string; name?: string | null },
    @Res({ passthrough: true }) response: Response
  ) {
    const user = await this.auth.updateProfile(request, body);
    this.auth.setSessionCookie(response, user);
    return { user };
  }
}

async function fetchGoogleProfile(code: string) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new BadRequestException("Google OAuth is not configured");
  }

  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      grant_type: "authorization_code",
      redirect_uri: googleCallbackUrl()
    })
  });

  if (!tokenResponse.ok) {
    throw new BadRequestException(`Google token exchange failed: ${await tokenResponse.text()}`);
  }

  const tokenJson = (await tokenResponse.json()) as { access_token?: string };
  if (!tokenJson.access_token) {
    throw new BadRequestException("Google token response did not include an access token");
  }

  const profileResponse = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: { authorization: `Bearer ${tokenJson.access_token}` }
  });
  if (!profileResponse.ok) {
    throw new BadRequestException(`Google profile request failed: ${await profileResponse.text()}`);
  }

  return (await profileResponse.json()) as { email?: string; email_verified?: boolean; name?: string };
}

function googleCallbackUrl(): string {
  return process.env.GOOGLE_CALLBACK_URL || `${absoluteUrl(process.env.API_URL, "http://localhost:4000")}/auth/google/callback`;
}

function webUrl(): string {
  return absoluteUrl(process.env.WEB_URL, "http://localhost:3000");
}

function absoluteUrl(input: string | undefined, fallback: string): string {
  const value = input?.trim() || fallback;
  return /^https?:\/\//i.test(value) ? value.replace(/\/+$/, "") : `https://${value.replace(/\/+$/, "")}`;
}
