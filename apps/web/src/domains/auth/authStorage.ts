/**
 * access 토큰은 메모리에만 둔다. (03-tech-stack.md 8장)
 *
 * localStorage 에 두면 XSS 한 번에 털린다.
 * 새로고침하면 사라지지만, refresh 는 httpOnly 쿠키에 있어 다시 받아올 수 있다.
 */
let accessToken: string | null = null;

const listeners = new Set<() => void>();

export function getAccessToken(): string | null {
  return accessToken;
}

export function setAccessToken(token: string | null): void {
  accessToken = token;
  for (const listen of listeners) listen();
}

export function subscribeAccessToken(listener: () => void): () => void {
  listeners.add(listener);

  return () => listeners.delete(listener);
}
