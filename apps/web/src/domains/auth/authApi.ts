import { apiPost } from "@/shared/api/apiClient";
import { setAccessToken } from "./authStorage";
import type { LoginResponse, SocialProviderId } from "./authTypes";

export async function loginWithSocial(
  provider: SocialProviderId,
  code: string,
): Promise<LoginResponse> {
  const result = await apiPost<LoginResponse>(`/auth/social/${provider}`, { code });
  setAccessToken(result.accessToken);

  return result;
}

/** refresh 는 httpOnly 쿠키로 오간다. 바디에 담지 않는다. */
export async function refreshAccessToken(): Promise<string | null> {
  try {
    const result = await apiPost<{ accessToken: string }>("/auth/refresh", {});
    setAccessToken(result.accessToken);

    return result.accessToken;
  } catch {
    setAccessToken(null);

    return null;
  }
}

export async function logout(): Promise<void> {
  try {
    await apiPost("/auth/logout", {});
  } finally {
    setAccessToken(null);
  }
}
