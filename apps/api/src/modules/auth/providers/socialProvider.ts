export type SocialProfile = {
  providerUserId: string;
  nickname: string | null;
  imageUrl: string | null;
  /** 카카오는 선택 동의라 없을 수 있다. 식별에 쓰지 않는다. (03-tech-stack.md 8장) */
  email: string | null;
};

export interface SocialProvider {
  readonly name: "KAKAO" | "GOOGLE" | "APPLE";
  /** 인가 코드를 프로필로 바꾼다. */
  fetchProfile(code: string, redirectUri: string): Promise<SocialProfile>;
}
