import { getAccessToken, setAccessToken } from "./accessToken";
import { ApiRequestError, toApiError } from "./apiError";
import { getApiClientConfig, getRefreshTokenStore, type RefreshTokenStore } from "./config";

const REFRESH_PATH = "/auth/refresh";

export async function apiGet<T>(path: string): Promise<T> {
  return request<T>(path, { method: "GET" });
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, { method: "POST", body: JSON.stringify(body) });
}

export async function apiPatch<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, { method: "PATCH", body: JSON.stringify(body) });
}

export async function apiPut<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, { method: "PUT", body: JSON.stringify(body) });
}

export async function apiDelete<T>(path: string): Promise<T> {
  return request<T>(path, { method: "DELETE" });
}

async function request<T>(path: string, init: RequestInit, isRetry = false): Promise<T> {
  const { baseUrl, refreshTokenStore } = getApiClientConfig();

  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    // 쿠키 모드(웹)에서만 의미가 있다. 앱은 refresh 를 바디로 보낸다.
    ...(refreshTokenStore ? {} : { credentials: "include" as const }),
    headers: {
      "Content-Type": "application/json",
      ...authHeader(),
      ...init.headers,
    },
  });

  if (response.ok) return (await response.json()) as T;

  // access 가 만료됐으면 한 번만 조용히 갱신하고 다시 시도한다.
  if (response.status === 401 && !isRetry && path !== REFRESH_PATH) {
    if (await tryRefresh()) return request<T>(path, init, true);
  }

  throw new ApiRequestError(await toApiError(response));
}

function authHeader(): Record<string, string> {
  const token = getAccessToken();

  return token ? { Authorization: `Bearer ${token}` } : {};
}

let refreshing: Promise<boolean> | null = null;

/** 동시에 여러 요청이 401 을 받아도 갱신은 한 번만 한다. */
export function tryRefresh(): Promise<boolean> {
  refreshing ??= runRefresh().finally(() => {
    refreshing = null;
  });

  return refreshing;
}

async function runRefresh(): Promise<boolean> {
  const { baseUrl } = getApiClientConfig();
  const store = getRefreshTokenStore();

  try {
    const stored = store ? await store.read() : null;

    // 앱인데 저장된 토큰이 없으면 서버에 물어볼 게 없다.
    if (store && !stored) {
      setAccessToken(null);

      return false;
    }

    const response = await fetch(`${baseUrl}${REFRESH_PATH}`, {
      method: "POST",
      ...(store ? {} : { credentials: "include" as const }),
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(stored ? { refreshToken: stored } : {}),
    });

    if (!response.ok) return await clearSession(store);

    const pair = (await response.json()) as { accessToken: string; refreshToken?: string };

    // 서버는 쓸 때마다 회전시킨다. 새 토큰을 안 받아두면 다음 갱신이 실패한다.
    if (store && pair.refreshToken) await store.write(pair.refreshToken);

    setAccessToken(pair.accessToken);

    return true;
  } catch {
    return await clearSession(store);
  }
}

async function clearSession(store: RefreshTokenStore | null): Promise<false> {
  setAccessToken(null);
  await store?.clear();

  return false;
}
