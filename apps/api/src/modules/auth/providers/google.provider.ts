import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { SocialProfile, SocialProvider } from "./socialProvider";

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const PROFILE_URL = "https://www.googleapis.com/oauth2/v3/userinfo";

type GoogleTokenResponse = { access_token?: string; error_description?: string };

type GoogleProfileResponse = {
  sub: string;
  name?: string;
  picture?: string;
  email?: string;
};

@Injectable()
export class GoogleProvider implements SocialProvider {
  readonly name = "GOOGLE" as const;

  constructor(private readonly config: ConfigService) {}

  async fetchProfile(code: string, redirectUri: string): Promise<SocialProfile> {
    const accessToken = await this.exchangeCode(code, redirectUri);
    const profile = await this.fetchGoogleProfile(accessToken);

    return {
      providerUserId: profile.sub,
      nickname: profile.name ?? null,
      imageUrl: profile.picture ?? null,
      email: profile.email ?? null,
    };
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
