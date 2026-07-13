import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
} from "@nestjs/common";
import type { Request, Response } from "express";

import { AuthService, type TokenPair } from "./auth.service";
import { Public } from "../../common/decorators/public.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";

/** Opciones comunes de cookie: httpOnly + Secure + SameSite=Lax. */
const COOKIE_BASE = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

const ACCESS_MAX_AGE = 15 * 60 * 1000; // 15 min
const REFRESH_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 días

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post("login")
  @HttpCode(200)
  async login(
    @Body() body: unknown,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const ip = (req.headers["x-forwarded-for"] as string) ?? req.ip;
    const userAgent = req.headers["user-agent"];
    const { user, tokens } = await this.authService.login(body, { ip, userAgent });
    this.setAuthCookies(res, tokens);
    return { user };
  }

  @Public()
  @Post("registro")
  @HttpCode(201)
  async registro(
    @Body() body: unknown,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const ip = (req.headers["x-forwarded-for"] as string) ?? req.ip;
    const userAgent = req.headers["user-agent"];
    const { user, tokens } = await this.authService.registro(body, { ip, userAgent });
    this.setAuthCookies(res, tokens);
    return { user };
  }

  @Public()
  @Post("refresh")
  @HttpCode(200)
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = (req as Request & { cookies?: Record<string, string> }).cookies?.[
      "refresh_token"
    ];
    const { user, tokens } = await this.authService.refresh(refreshToken);
    this.setAuthCookies(res, tokens);
    return { user };
  }

  @Post("logout")
  @HttpCode(200)
  async logout(
    @CurrentUser("sub") usuarioId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.logout(usuarioId);
    res.clearCookie("access_token", { path: "/" });
    res.clearCookie("refresh_token", { path: "/" });
    return { ok: true };
  }

  @Get("me")
  async me(@CurrentUser("sub") usuarioId: string) {
    return this.authService.me(usuarioId);
  }

  private setAuthCookies(res: Response, tokens: TokenPair): void {
    res.cookie("access_token", tokens.accessToken, {
      ...COOKIE_BASE,
      maxAge: ACCESS_MAX_AGE,
    });
    res.cookie("refresh_token", tokens.refreshToken, {
      ...COOKIE_BASE,
      maxAge: REFRESH_MAX_AGE,
    });
  }
}
