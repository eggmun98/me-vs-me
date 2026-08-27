import type { SocialProviderId } from "./authTypes";

const KAKAO_AUTHORIZE = "https://kauth.kakao.com/oauth/authorize";
const GOOGLE_AUTHORIZE = "https://accounts.google.com/o/oauth2/v2/auth";

/** 콜백 경로는 서버의 OAUTH_REDIRECT_BASE 와 같아야 한다. 다르면 토큰 교환이 실패한다. */
export function buildRedirectUri(provider: SocialProviderId): string {
  return `${window.location.origin}/auth/callback/${provider}`;
}

export function buildSocialLoginUrl(provider: SocialProviderId): string {
  const redirectUri = buildRedirectUri(provider);

  if (provider === "kakao") {
    return `${KAKAO_AUTHORIZE}?${new URLSearchParams({
      client_id: requireEnv("NEXT_PUBLIC_KAKAO_REST_API_KEY"),
      redirect_uri: redirectUri,
      response_type: "code",
    })}`;
  }

  return `${GOOGLE_AUTHORIZE}?${new URLSearchParams({
    client_id: requireEnv("NEXT_PUBLIC_GOOGLE_CLIENT_ID"),
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    prompt: "consent",
  })}`;
}

function requireEnv(name: "NEXT_PUBLIC_KAKAO_REST_API_KEY" | "NEXT_PUBLIC_GOOGLE_CLIENT_ID"): string {
  const value =
    name === "NEXT_PUBLIC_KAKAO_REST_API_KEY"
      ? process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY
      : process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  if (!value) throw new Error(`${name} 이 설정되지 않았습니다. .env.local 을 확인하세요.`);

  return value;
}
