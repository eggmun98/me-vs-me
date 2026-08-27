import { getAccessToken, setAccessToken } from "@/domains/auth/authStorage";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";
const REFRESH_PATH = "/auth/refresh";

export type ApiError = {
  code: string;
  message: string;
  status: number;
};

export class ApiRequestError extends Error {
  constructor(readonly detail: ApiError) {
    super(detail.message);
    this.name = "ApiRequestError";
  }
}

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
  const response = await fetch(`${BASE_URL}${path}`, {
    ...init,
    // refresh 는 httpOnly 쿠키로 오간다.
    credentials: "include",
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
function tryRefresh(): Promise<boolean> {
  refreshing ??= (async () => {
    try {
      const response = await fetch(`${BASE_URL}${REFRESH_PATH}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      });

      if (!response.ok) {
        setAccessToken(null);

        return false;
      }

      const json = (await response.json()) as { accessToken: string };
      setAccessToken(json.accessToken);

      return true;
    } catch {
      setAccessToken(null);

      return false;
    } finally {
      refreshing = null;
    }
  })();

  return refreshing;
}

async function toApiError(response: Response): Promise<ApiError> {
  const fallback = { code: "UNKNOWN", message: "요청을 처리하지 못했습니다.", status: response.status };

  try {
    const body = (await response.json()) as Partial<ApiError> & { message?: string | string[] };

    return {
      code: body.code ?? fallback.code,
      message: Array.isArray(body.message) ? body.message.join("\n") : (body.message ?? fallback.message),
      status: response.status,
    };
  } catch {
    return fallback;
  }
}
