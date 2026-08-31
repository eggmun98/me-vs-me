import { Body, Controller, Param, Post, Req, Res } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { Public } from "@/common/publicRoute.decorator";
import type { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { SocialLoginDto } from "./dto/socialLogin.dto";
import { TokenService } from "./token.service";

const REFRESH_COOKIE = "nadaena_refresh";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly tokens: TokenService,
  ) {}

  @Public()
  @Post("social/:provider")
  @ApiOperation({ summary: "소셜 로그인 — 인가 코드를 토큰으로 바꾼다" })
  async loginWithSocial(
    @Param("provider") provider: string,
    @Body() dto: SocialLoginDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.loginWithSocial(
      provider,
      { code: dto.code, redirectUri: dto.redirectUri, token: dto.token },
      request.headers["user-agent"] ?? null,
    );

    this.setRefreshCookie(response, result.refreshToken);

    return {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      isNewUser: result.isNewUser,
    };
  }

  /** 웹은 쿠키로, 앱은 바디로 보낸다. 엔드포인트는 하나다. (07-api.md 3장) */
  @Public()
  @Post("refresh")
  @ApiOperation({ summary: "토큰 회전" })
  async refresh(
    @Body() body: { refreshToken?: string },
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const token = body.refreshToken ?? readRefreshCookie(request);
    const pair = await this.tokens.rotate(token ?? "");

    this.setRefreshCookie(response, pair.refreshToken);

    return pair;
  }

  @Public()
  @Post("logout")
  @ApiOperation({ summary: "로그아웃 — 이 기기의 refresh 만 끊는다" })
  async logout(
    @Body() body: { refreshToken?: string },
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const token = body.refreshToken ?? readRefreshCookie(request);
    if (token) await this.tokens.revoke(token);

    response.clearCookie(REFRESH_COOKIE, { path: "/" });

    return { ok: true };
  }

  private setRefreshCookie(response: Response, refreshToken: string): void {
    response.cookie(REFRESH_COOKIE, refreshToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: this.tokens.refreshTokenMaxAgeMs,
      path: "/",
    });
  }
}

function readRefreshCookie(request: Request): string | null {
  const raw = request.headers.cookie;
  if (!raw) return null;

  const found = raw
    .split(";")
    .map((part) => part.trim().split("="))
    .find(([name]) => name === REFRESH_COOKIE);

  return found?.[1] ? decodeURIComponent(found[1]) : null;
}
