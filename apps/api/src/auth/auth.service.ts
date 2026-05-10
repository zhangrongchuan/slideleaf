import {
  BadRequestException,
  Injectable,
  UnauthorizedException
} from "@nestjs/common";
import { randomUUID } from "node:crypto";
import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaService } from "../prisma/prisma.service.js";

type SessionPayload = {
  sub: string;
  email: string;
};

export type RequestUser = {
  id: string;
  email: string;
  name: string | null;
  credits: number;
  creditsMilli: number;
};

export type GoogleProfile = {
  email?: string;
  email_verified?: boolean;
  name?: string;
};

const COOKIE_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 14;

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async register(input: { email?: string; password?: string; name?: string | null }): Promise<RequestUser> {
    const email = normalizeEmail(input.email);
    const password = input.password ?? "";
    if (password.length < 8) {
      throw new BadRequestException("Password must be at least 8 characters long");
    }

    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new BadRequestException("Email is already registered");
    }

    const user = await this.prisma.user.create({
      data: {
        email,
        name: input.name?.trim() || null,
        password: await bcrypt.hash(password, 12),
        creditsMilli: startingCreditsMilli()
      }
    });

    return toRequestUser(user);
  }

  async login(input: { email?: string; password?: string }): Promise<RequestUser> {
    const email = normalizeEmail(input.email);
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(input.password ?? "", user.password))) {
      throw new UnauthorizedException("Invalid email or password");
    }

    return toRequestUser(user);
  }

  async loginWithGoogleProfile(profile: GoogleProfile): Promise<RequestUser> {
    const email = normalizeEmail(profile.email);
    if (profile.email_verified === false) {
      throw new UnauthorizedException("Google email is not verified");
    }

    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      return toRequestUser(existing);
    }

    const user = await this.prisma.user.create({
      data: {
        email,
        name: profile.name?.trim() || null,
        password: await bcrypt.hash(`google:${randomUUID()}`, 12),
        creditsMilli: startingCreditsMilli()
      }
    });

    return toRequestUser(user);
  }

  async me(request: Request): Promise<RequestUser> {
    return this.requireUser(request);
  }

  async updateProfile(
    request: Request,
    input: { email?: string; name?: string | null }
  ): Promise<RequestUser> {
    const currentUser = await this.requireUser(request);
    const email = normalizeEmail(input.email ?? currentUser.email);
    const name = typeof input.name === "string" ? input.name.trim() || null : null;

    if (email !== currentUser.email) {
      const existing = await this.prisma.user.findUnique({ where: { email } });
      if (existing && existing.id !== currentUser.id) {
        throw new BadRequestException("Email is already registered");
      }
    }

    const user = await this.prisma.user.update({
      where: { id: currentUser.id },
      data: { email, name }
    });

    return toRequestUser(user);
  }

  async requireUser(request: Request): Promise<RequestUser> {
    const token = this.readToken(request);
    if (!token) {
      throw new UnauthorizedException("Not signed in");
    }

    try {
      const payload = jwt.verify(token, jwtSecret()) as SessionPayload;
      const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
      if (!user) {
        throw new UnauthorizedException("User not found");
      }
      return toRequestUser(user);
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      throw new UnauthorizedException("Invalid session");
    }
  }

  setSessionCookie(response: Response, user: RequestUser): void {
    const token = jwt.sign({ sub: user.id, email: user.email } satisfies SessionPayload, jwtSecret(), {
      expiresIn: "14d"
    });
    response.cookie(cookieName(), token, {
      httpOnly: true,
      sameSite: sameSitePolicy(),
      secure: secureCookie(),
      maxAge: COOKIE_MAX_AGE_MS,
      path: "/"
    });
  }

  clearSessionCookie(response: Response): void {
    response.clearCookie(cookieName(), {
      path: "/",
      sameSite: sameSitePolicy(),
      secure: secureCookie()
    });
  }

  private readToken(request: Request): string | undefined {
    const cookieToken = request.cookies?.[cookieName()];
    if (typeof cookieToken === "string" && cookieToken) return cookieToken;

    const header = request.headers.authorization;
    if (header?.startsWith("Bearer ")) return header.slice("Bearer ".length);

    return undefined;
  }
}

function normalizeEmail(email: string | undefined): string {
  const normalized = email?.trim().toLowerCase();
  if (!normalized || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(normalized)) {
    throw new BadRequestException("A valid email is required");
  }
  return normalized;
}

function jwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret === "replace-me") {
    throw new Error("JWT_SECRET must be configured");
  }
  return secret;
}

function cookieName(): string {
  return process.env.SESSION_COOKIE_NAME || "slideleaf_session";
}

function sameSitePolicy(): "lax" | "strict" | "none" {
  const configured = process.env.SESSION_COOKIE_SAME_SITE?.toLowerCase();
  if (configured === "strict" || configured === "none") return configured;
  if (process.env.NODE_ENV === "production") return "none";
  return "lax";
}

function secureCookie(): boolean {
  return process.env.NODE_ENV === "production" || sameSitePolicy() === "none";
}

function toRequestUser(user: { id: string; email: string; name: string | null; creditsMilli?: number | null }): RequestUser {
  const credits = Math.max(0, user.creditsMilli ?? 0);
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    credits,
    creditsMilli: credits
  };
}

function startingCreditsMilli(): number {
  const parsed = Number.parseFloat(process.env.STARTING_CREDITS ?? "0");
  return Number.isFinite(parsed) && parsed > 0 ? Math.round(parsed) : 0;
}
