import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { SocialProfile, SocialProvider } from "./socialProvider";

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const PROFILE_URL = "https://www.googleapis.com/oauth2/v3/userinfo";
const TOKENINFO_URL = "https://oauth2.googleapis.com/tokeninfo";

type GoogleTokenResponse = { access_token?: string; error_description?: string };

type GoogleProfileResponse = {
  sub: string;
  name?: string;
  picture?: string;
  email?: string;
};

/** tokeninfo 가 검증까지 끝내고 돌려주는 클레임 */
type GoogleIdTokenClaims = GoogleProfileResponse & {
  aud?: string;
  error_description?: string;
};

@Injectable()
export class GoogleProvider implements SocialProvider {
  readonly name = "GOOGLE" as const;
  private audienceCache: Set<string> | null = null;

  constructor(private readonly config: ConfigService) {}

  async fetchProfileByCode(code: string, redirectUri: string): Promise<SocialProfile> {
    const accessToken = await this.exchangeCode(code, redirectUri);

    return toProfile(await this.fetchGoogleProfile(accessToken));
  }

  /**
   * 앱이 넘기는 값은 구글 SDK 가 받아온 **ID token** 이다.
   *
   * 카카오와 달리 서명된 JWT 라 서버가 직접 검증할 수 있다.
   * 검증은 구글의 tokeninfo 에 맡긴다 — 공개키를 직접 받아다 캐싱하는 코드를 안 짜도 된다.
   */
  async fetchProfileByToken(idToken: string): Promise<SocialProfile> {
    const response = await fetch(`${TOKENINFO_URL}?id_token=${encodeURIComponent(idToken)}`);
    const claims = (await response.json()) as GoogleIdTokenClaims;

    if (!response.ok || !claims.sub) {
      throw new UnauthorizedException(
        claims.error_description ?? "구글 토큰을 확인하지 못했습니다.",
      );
    }

    /**
     * 서명이 맞아도 **우리 앱에 발급된 토큰인지**는 별개다.
     * aud 를 안 보면 남의 구글 앱에서 받은 토큰으로도 로그인이 된다.
     */
    if (!claims.aud || !this.allowedAudiences().has(claims.aud)) {
      throw new UnauthorizedException("다른 앱에 발급된 구글 토큰입니다.");
    }

    return toProfile(claims);
  }

  /**
   * 안드로이드는 webClientId, iOS 는 iOS 클라이언트 ID 로 aud 가 잡힌다.
   * 둘 다 허용해야 두 플랫폼이 같은 계정으로 들어온다.
   */
  private allowedAudiences(): Set<string> {
    this.audienceCache ??= new Set(
      [
        this.config.get<string>("GOOGLE_CLIENT_ID"),
        ...(this.config.get<string>("GOOGLE_ALLOWED_AUDIENCES") ?? "").split(","),
      ]
        .map((value) => value?.trim())
        .filter((value): value is string => Boolean(value)),
    );

    return this.audienceCache;
  }

  private async exchangeCode(code: string, redirectUri: string): Promise<string> {
    const clientId = this.config.get<string>("GOOGLE_CLIENT_ID");
    const clientSecret = this.config.get<string>("GOOGLE_CLIENT_SECRET");

    if (!clientId || !clientSecret) {
      throw new UnauthorizedException("GOOGLE_CLIENT_ID / SECRET 이 설정되지 않았습니다.");
    }

    const response = await fetch(TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        code,
      }),
    });

    const json = (await response.json()) as GoogleTokenResponse;

    if (!response.ok || !json.access_token) {
      throw new UnauthorizedException(
        json.error_description ?? "구글 인가 코드를 토큰으로 바꾸지 못했습니다.",
      );
    }

    return json.access_token;
  }

  private async fetchGoogleProfile(accessToken: string): Promise<GoogleProfileResponse> {
    const response = await fetch(PROFILE_URL, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) throw new UnauthorizedException("구글 프로필을 가져오지 못했습니다.");

    return (await response.json()) as GoogleProfileResponse;
  }
}

function toProfile(profile: GoogleProfileResponse): SocialProfile {
  return {
    providerUserId: profile.sub,
    nickname: profile.name ?? null,
    imageUrl: profile.picture ?? null,
    email: profile.email ?? null,
  };
}
