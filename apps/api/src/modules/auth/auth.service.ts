import { BadRequestException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { AuthProviderType } from "@prisma/client";
import { PrismaService } from "@/prisma/prisma.service";
import { GoogleProvider } from "./providers/google.provider";
import { KakaoProvider } from "./providers/kakao.provider";
import type { SocialProfile, SocialProvider } from "./providers/socialProvider";
import { TokenService, type TokenPair } from "./token.service";

export type LoginResult = TokenPair & { isNewUser: boolean };

@Injectable()
export class AuthService {
  private readonly providers: Map<string, SocialProvider>;

  constructor(
    private readonly prisma: PrismaService,
    private readonly tokens: TokenService,
    private readonly config: ConfigService,
    kakao: KakaoProvider,
    google: GoogleProvider,
  ) {
    this.providers = new Map<string, SocialProvider>([
      ["kakao", kakao],
      ["google", google],
    ]);
  }

  async loginWithSocial(
    provider: string,
    code: string,
    deviceInfo: string | null,
  ): Promise<LoginResult> {
    const social = this.providers.get(provider);

    if (!social) throw new BadRequestException(`지원하지 않는 로그인 방식입니다: ${provider}`);

    const profile = await social.fetchProfile(code, this.buildRedirectUri(provider));
    const { userId, isNewUser } = await this.findOrCreateUser(social.name, profile);

    return { ...(await this.tokens.issue(userId, deviceInfo)), isNewUser };
  }

  /**
   * 식별은 `provider + providerUserId` 로 한다.
   *
   * 카카오는 이메일이 선택 동의라 안 올 수 있어 식별 키로 쓸 수 없다.
   * 같은 사람이 다른 provider 로 들어오면 별개 계정이 된다 — 계정 연결은 나중에 붙인다.
   * (03-tech-stack.md 8장)
   */
  private async findOrCreateUser(
    provider: AuthProviderType,
    profile: SocialProfile,
  ): Promise<{ userId: string; isNewUser: boolean }> {
    const existing = await this.prisma.authProvider.findUnique({
      where: {
        provider_providerUserId: { provider, providerUserId: profile.providerUserId },
      },
      select: { userId: true },
    });

    if (existing) return { userId: existing.userId, isNewUser: false };

    const user = await this.prisma.user.create({
      data: {
        nickname: await this.buildAvailableNickname(profile.nickname),
        imageUrl: profile.imageUrl,
        authProviders: {
          create: {
            provider,
            providerUserId: profile.providerUserId,
            email: profile.email,
          },
        },
      },
      select: { id: true },
    });

    return { userId: user.id, isNewUser: true };
  }

  /** 닉네임은 unique 다. 공개 프로필이 `/@닉네임` 을 쓰기 때문. (06-database.md 8.3) */
  private async buildAvailableNickname(desired: string | null): Promise<string> {
    const base = (desired ?? "도전자").trim().slice(0, 20) || "도전자";

    for (let attempt = 0; attempt < 20; attempt += 1) {
      const candidate = attempt === 0 ? base : `${base}${randomSuffix()}`;
      const taken = await this.prisma.user.findUnique({
        where: { nickname: candidate },
        select: { id: true },
      });

      if (!taken) return candidate;
    }

    return `${base}${Date.now().toString(36)}`;
  }

  private buildRedirectUri(provider: string): string {
    const base = this.config.getOrThrow<string>("OAUTH_REDIRECT_BASE");

    return `${base}/auth/callback/${provider}`;
  }
}

function randomSuffix(): string {
  return String(Math.floor(Math.random() * 9000) + 1000);
}
