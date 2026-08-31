export type SocialProfile = {
  providerUserId: string;
  nickname: string | null;
  imageUrl: string | null;
  /** 카카오는 선택 동의라 없을 수 있다. 식별에 쓰지 않는다. (03-tech-stack.md 8장) */
  email: string | null;
};

export interface SocialProvider {
  readonly name: "KAKAO" | "GOOGLE" | "APPLE";

  /**
   * 웹 — 인가 코드를 프로필로 바꾼다.
   *
   * 브라우저는 네이티브 SDK 를 못 쓰니 리다이렉트로 코드를 받아 온다.
   * client secret 이 필요해 교환은 반드시 서버에서 한다.
   */
  fetchProfileByCode(code: string, redirectUri: string): Promise<SocialProfile>;

  /**
   * 앱 — 네이티브 SDK 가 이미 받아둔 토큰으로 프로필만 가져온다.
   *
   * 앱에는 리다이렉트도 client secret 도 없다. 카카오톡 앱으로 넘어갔다 돌아오는 흐름이라
   * 코드 교환 단계 자체가 없다. 토큰의 종류는 provider 마다 다르다.
   */
  fetchProfileByToken(token: string): Promise<SocialProfile>;
}
