export type SocialProviderId = "kakao" | "google";

export type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  isNewUser: boolean;
};
