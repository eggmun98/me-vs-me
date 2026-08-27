import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { SocialProfile, SocialProvider } from "./socialProvider";

const TOKEN_URL = "https://kauth.kakao.com/oauth/token";
const PROFILE_URL = "https://kapi.kakao.com/v2/user/me";

type KakaoTokenResponse = { access_token?: string; error_description?: string };

type KakaoProfileResponse = {
  id: number;
  kakao_account?: {
    email?: string;
    profile?: { nickname?: string; profile_image_url?: string };
  };
};

@Injectable()
export class KakaoProvider implements SocialProvider {
  readonly name = "KAKAO" as const;

  constructor(private readonly config: ConfigService) {}

  async fetchProfile(code: string, redirectUri: string): Promise<SocialProfile> {
    const accessToken = await this.exchangeCode(code, redirectUri);
    const profile = await this.fetchKakaoProfile(accessToken);

    return {
      providerUserId: String(profile.id),
      nickname: profile.kakao_account?.profile?.nickname ?? null,
      imageUrl: profile.kakao_account?.profile?.profile_image_url ?? null,
      email: profile.kakao_account?.email ?? null,
    };
  }

  private async exchangeCode(code: string, redirectUri: string): Promise<string> {
    const restApiKey = this.config.get<string>("KAKAO_REST_API_KEY");

    if (!restApiKey) {
      throw new UnauthorizedException("KAKAO_REST_API_KEY 가 설정되지 않았습니다.");
    }

    const body = new URLSearchParams({
      grant_type: "authorization_code",
      client_id: restApiKey,
      redirect_uri: redirectUri,
      code,
    });

    const clientSecret = this.config.get<string>("KAKAO_CLIENT_SECRET");
    if (clientSecret) body.set("client_secret", clientSecret);

    const response = await fetch(TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded;charset=utf-8" },
      body,
    });

    const json = (await response.json()) as KakaoTokenResponse;

    if (!response.ok || !json.access_token) {
      throw new UnauthorizedException(
        json.error_description ?? "카카오 인가 코드를 토큰으로 바꾸지 못했습니다.",
      );
    }

    return json.access_token;
  }

  private async fetchKakaoProfile(accessToken: string): Promise<KakaoProfileResponse> {
    const response = await fetch(PROFILE_URL, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) throw new UnauthorizedException("카카오 프로필을 가져오지 못했습니다.");

    return (await response.json()) as KakaoProfileResponse;
  }
}
