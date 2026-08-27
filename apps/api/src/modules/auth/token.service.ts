import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { createHash, randomBytes } from "node:crypto";
import { PrismaService } from "@/prisma/prisma.service";

const ACCESS_TOKEN_TTL = "30m";
const REFRESH_TOKEN_DAYS = 90;
/**
 * 회전 직후 유예.
 * 동시 요청이나 재시도로 같은 토큰이 두 번 오는 건 정상 상황이다.
 * 이걸 탈취로 보고 끊으면 멀쩡한 사용자가 로그아웃된다. (03-tech-stack.md 8장)
 */
const ROTATION_GRACE_MS = 60_000;

export type TokenPair = {
  accessToken: string;
  refreshToken: string;
};

@Injectable()
export class TokenService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async issue(userId: string, deviceInfo: string | null): Promise<TokenPair> {
    const refreshToken = randomBytes(48).toString("base64url");

    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash: hash(refreshToken),
        deviceInfo,
        expiresAt: daysFromNow(REFRESH_TOKEN_DAYS),
      },
    });

    return { accessToken: await this.signAccessToken(userId), refreshToken };
  }

  /** 쓸 때마다 회전한다. 매일 여는 서비스라 실질적으로 로그인이 유지된다. */
  async rotate(refreshToken: string): Promise<TokenPair> {
    const stored = await this.prisma.refreshToken.findUnique({
      where: { tokenHash: hash(refreshToken) },
    });

    if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
      throw new UnauthorizedException({
        code: "INVALID_REFRESH_TOKEN",
        message: "다시 로그인해 주세요.",
      });
    }

    if (stored.rotatedAt) {
      if (Date.now() - stored.rotatedAt.getTime() > ROTATION_GRACE_MS) {
        // 유예를 넘긴 재사용은 탈취로 본다. 그 사용자의 모든 세션을 끊는다.
        await this.revokeAll(stored.userId);

        throw new UnauthorizedException({
          code: "INVALID_REFRESH_TOKEN",
          message: "다시 로그인해 주세요.",
        });
      }
    } else {
      await this.prisma.refreshToken.update({
        where: { id: stored.id },
        data: { rotatedAt: new Date() },
      });
    }

    return this.issue(stored.userId, stored.deviceInfo);
  }

  async revoke(refreshToken: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash: hash(refreshToken), revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async revokeAll(userId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  verifyAccessToken(token: string): { userId: string } {
    try {
      return this.jwt.verify<{ userId: string }>(token, {
        secret: this.config.getOrThrow<string>("JWT_ACCESS_SECRET"),
      });
    } catch {
      throw new UnauthorizedException({ code: "UNAUTHORIZED", message: "인증이 필요합니다." });
    }
  }

  get refreshTokenMaxAgeMs(): number {
    return REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000;
  }

  private signAccessToken(userId: string): Promise<string> {
    return this.jwt.signAsync(
      { userId },
      {
        secret: this.config.getOrThrow<string>("JWT_ACCESS_SECRET"),
        expiresIn: ACCESS_TOKEN_TTL,
      },
    );
  }
}

/** 평문을 저장하지 않는다. DB 가 유출돼도 토큰을 쓸 수 없어야 한다. */
function hash(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function daysFromNow(days: number): Date {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}
