/**
 * 웹과 앱이 같은 호출 코드를 쓰되, 다른 건 두 가지뿐이다.
 *
 * - 주소: 웹은 `NEXT_PUBLIC_API_URL`, 앱은 `EXPO_PUBLIC_API_URL`
 * - refresh 토큰을 어디에 두는가: 웹은 httpOnly 쿠키(클라이언트가 모른다), 앱은 SecureStore
 *
 * 두 가지를 주입받으면 나머지는 전부 공유된다. (04-folder-convention.md 7장)
 */

export type RefreshTokenStore = {
  read(): Promise<string | null>;
  write(token: string): Promise<void>;
  clear(): Promise<void>;
};

export type ApiClientConfig = {
  baseUrl: string;
  /**
   * 앱만 넘긴다. 없으면 쿠키 모드로 동작한다.
   *
   * 앱에는 쿠키 저장소가 없어 refresh 를 직접 들고 다녀야 한다.
   * 그래서 XSS 가 없는 대신 기기 저장소가 방어선이 된다 — 반드시 SecureStore 다.
   */
  refreshTokenStore?: RefreshTokenStore;
};

let config: ApiClientConfig | null = null;

export function configureApiClient(next: ApiClientConfig): void {
  config = next;
}

export function getApiClientConfig(): ApiClientConfig {
  if (!config) {
    throw new Error("configureApiClient() 를 먼저 호출해야 합니다. 앱 진입점에서 설정하세요.");
  }

  return config;
}

export function getRefreshTokenStore(): RefreshTokenStore | null {
  return getApiClientConfig().refreshTokenStore ?? null;
}
