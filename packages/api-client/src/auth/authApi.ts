import { setAccessToken } from "../client/accessToken";
import { apiDelete, apiPost, tryRefresh } from "../client/apiClient";
import { getRefreshTokenStore } from "../client/config";
import type { LoginResponse, SocialCredential, SocialProviderId } from "./authTypes";

/**
 * 소셜 로그인. 웹과 앱이 들고 오는 게 다르다.
 *
 * - 웹: 리다이렉트로 받은 **인가 코드**. `redirectUri` 는 인가 요청에 쓴 값과 글자 그대로 같아야 한다.
 * - 앱: 네이티브 SDK 가 받아온 **토큰**. 리다이렉트를 거치지 않아 콜백 주소가 없다.
 *
 * 어느 쪽이든 client secret 은 서버에만 있다.
 */
export async function loginWithSocial(
  provider: SocialProviderId,
  credential: SocialCredential,
): Promise<LoginResponse> {
  const result = await apiPost<LoginResponse>(`/auth/social/${provider}`, credential);

  setAccessToken(result.accessToken);
  await getRefreshTokenStore()?.write(result.refreshToken);

  return result;
}

/**
 * 저장된 refresh 로 세션을 되살린다.
 *
 * 웹은 새로고침 때, 앱은 켤 때마다 부른다.
 * 되살릴 수 없으면 `false` 다 — 호출한 쪽이 로그인으로 보낸다.
 */
export function restoreSession(): Promise<boolean> {
  return tryRefresh();
}

export async function logout(): Promise<void> {
  const store = getRefreshTokenStore();
  const refreshToken = await store?.read();

  try {
    await apiPost("/auth/logout", refreshToken ? { refreshToken } : {});
  } catch {
    // 서버에 못 닿아도 이 기기에서는 나가야 한다.
  } finally {
    setAccessToken(null);
    await store?.clear();
  }
}

/** 탈퇴가 받아들여졌을 때 서버가 알려주는 것 — 언제 실제로 지워지는지. */
export type AccountDeletion = {
  deletedAt: string;
  purgeAt: string;
  retentionDays: number;
};

/**
 * 회원탈퇴. 성공하면 이 기기의 세션도 함께 끊는다.
 *
 * `logout` 과 달리 실패를 삼키지 않는다. 서버가 못 받았는데 화면만 로그아웃되면
 * 사용자는 탈퇴됐다고 믿지만 계정은 그대로 남는다.
 */
export async function deleteAccount(): Promise<AccountDeletion> {
  const result = await apiDelete<AccountDeletion>("/users/me");

  setAccessToken(null);
  await getRefreshTokenStore()?.clear();

  return result;
}
