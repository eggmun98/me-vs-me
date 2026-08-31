import { BadRequestException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { AuthProviderType } from "@prisma/client";
import { PrismaService } from "@/prisma/prisma.service";
import { GoogleProvider } from "./providers/google.provider";
import { KakaoProvider } from "./providers/kakao.provider";
import type { SocialProfile, SocialProvider } from "./providers/socialProvider";
import { TokenService, type TokenPair } from "./token.service";

export type LoginResult = TokenPair & { isNewUser: boolean };

/** 웹은 `code`, 앱은 `token` 을 들고 온다. */
export type SocialCredential = {
  code?: string;
  redirectUri?: string;
  token?: string;
};

@Injectable()
export class AuthService {
  private readonly providers: Map<string, SocialProvider>;
  private allowedRedirectUriCache: Set<string> | null = null;

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
    credential: SocialCredential,
    deviceInfo: string | null,
  ): Promise<LoginResult> {
    const social = this.providers.get(provider);

    if (!social) throw new BadRequestException(`지원하지 않는 로그인 방식입니다: ${provider}`);

    const profile = await this.fetchProfile(social, provider, credential);
    const { userId, isNewUser } = await this.findOrCreateUser(social.name, profile);

    return { ...(await this.tokens.issue(userId, deviceInfo)), isNewUser };
  }

  /**
   * 앱이면 토큰으로, 웹이면 인가 코드로 프로필을 가져온다.
   * 토큰이 오면 콜백 주소를 볼 이유가 없다 — 리다이렉트를 거치지 않았기 때문이다.
   */
  private fetchProfile(
    social: SocialProvider,
    provider: string,
    credential: SocialCredential,
  ): Promise<SocialProfile> {
    if (credential.token) return social.fetchProfileByToken(credential.token);

    if (!credential.code) {
      throw new BadRequestException("code 또는 token 중 하나가 필요합니다.");
    }

    return social.fetchProfileByCode(
      credential.code,
      this.resolveRedirectUri(provider, credential.redirectUri),
    );
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

  /**
   * 콜백 주소를 클라이언트가 정한다. 대신 허용 목록에 있는 것만 받는다.
   *
   * 웹은 `https://nadaena.com/auth/callback/kakao`, 앱은 `nadaena://auth/callback/kakao` 로
   * 서로 다른 주소를 쓴다. 그렇다고 아무 값이나 받으면 인가 코드를 남의 주소로 흘릴 수 있다.
   */
  private resolveRedirectUri(provider: string, requested?: string): string {
    const fallback = this.buildWebRedirectUri(provider);

    if (!requested || requested === fallback) return fallback;

    if (!this.allowedRedirectUris().has(requested)) {
      throw new BadRequestException(`허용되지 않은 콜백 주소입니다: ${requested}`);
    }

    return requested;
  }

  private buildWebRedirectUri(provider: string): string {
    const base = this.config.getOrThrow<string>("OAUTH_REDIRECT_BASE");

    return `${base}/auth/callback/${provider}`;
  }

  private allowedRedirectUris(): Set<string> {
    this.allowedRedirectUriCache ??= new Set(
      (this.config.get<string>("OAUTH_ALLOWED_REDIRECT_URIS") ?? "")
        .split(",")
        .map((uri) => uri.trim())
        .filter(Boolean),
    );

    return this.allowedRedirectUriCache;
  }
}

function randomSuffix(): string {
  return String(Math.floor(Math.random() * 9000) + 1000);
}
