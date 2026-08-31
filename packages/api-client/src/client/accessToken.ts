/**
 * access 토큰은 메모리에만 둔다. (03-tech-stack.md 8장)
 *
 * 웹은 localStorage 에 두면 XSS 한 번에 털리고,
 * 앱은 디스크에 둘 이유가 없다 — refresh 로 언제든 다시 받는다.
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
