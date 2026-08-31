export type SocialProviderId = "kakao" | "google";

/** 웹은 인가 코드로, 앱은 네이티브 SDK 토큰으로 로그인한다. */
export type SocialCredential =
  | { code: string; redirectUri?: string }
  | { token: string };

export type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  isNewUser: boolean;
};
