import { ApiRequestError } from "@nadaena/api-client";
import { Platform } from "react-native";
import { env } from "@/shared/config/env";

/**
 * 소셜 로그인은 실패 지점이 다섯 군데다 — SDK 초기화 · 네이티브 로그인 창 ·
 * 토큰 수령 · 서버 검증 · 세션 저장. 화면에는 마지막 message 한 줄만 남아서
 * 어디서 끊겼는지 알 수 없다. 그래서 실패할 때마다 한 덩어리로 찍는다.
 *
 * `console.log` 를 한 번만 부른다. 여러 번 나누면 Metro 로그에서 다른 줄과
 * 섞여서 복사가 어려워진다.
 */
export type SocialStep =
  | "설정 확인"
  | "SDK 초기화"
  | "네이티브 로그인"
  | "토큰 수령"
  | "서버 검증";

export function logSocialFailure(
  provider: string,
  step: SocialStep,
  error: unknown,
  extra?: Record<string, unknown>,
): void {
  if (!__DEV__) return;

  console.log(
    [
      "",
      "━━━━━━━━━━ 소셜 로그인 실패 ━━━━━━━━━━",
      `provider : ${provider}`,
      `step     : ${step}`,
      `platform : ${Platform.OS} ${String(Platform.Version)}`,
      "",
      ...describeError(error),
      ...describeExtra(extra),
      "── 설정 ──",
      `apiUrl        : ${env.apiUrl}`,
      `kakaoAppKey   : ${mask(env.kakaoNativeAppKey)}`,
      `googleWebId   : ${mask(env.googleWebClientId)}`,
      `googleIosId   : ${mask(env.googleIosClientId)}`,
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "",
    ].join("\n"),
  );
}

/**
 * 네이티브 SDK 의 오류는 `message` 만 봐서는 알 수 없다.
 * 원인은 `code`(구글) 나 `userInfo`(카카오) 에 들어 있다.
 */
function describeError(error: unknown): string[] {
  if (error instanceof ApiRequestError) {
    return [
      "── 서버 응답 ──",
      `status  : ${error.detail.status}`,
      `code    : ${error.detail.code}`,
      `message : ${error.detail.message}`,
      "",
    ];
  }

  if (!(error instanceof Error)) {
    return ["── 오류 ──", `raw : ${safeJson(error)}`, ""];
  }

  const native = error as Error & Record<string, unknown>;

  return [
    "── 오류 ──",
    `name    : ${error.name}`,
    `message : ${error.message}`,
    ...optional("code", native.code),
    ...optional("domain", native.domain),
    ...optional("userInfo", native.userInfo),
    ...optional("nativeStackIOS", native.nativeStackIOS),
    "",
  ];
}

function describeExtra(extra?: Record<string, unknown>): string[] {
  const entries = Object.entries(extra ?? {});

  if (entries.length === 0) return [];

  return ["── 그 밖에 ──", ...entries.map(([k, v]) => `${k} : ${safeJson(v)}`), ""];
}

function optional(label: string, value: unknown): string[] {
  return value === undefined || value === null ? [] : [`${label.padEnd(7)} : ${safeJson(value)}`];
}

/** 키 자체는 비밀이 아니지만 로그를 그대로 붙여넣게 되므로 가운데를 가린다. */
function mask(value: string): string {
  if (!value) return "(비어 있음)";

  return value.length <= 12
    ? `${value.slice(0, 4)}… (${value.length}자)`
    : `${value.slice(0, 6)}…${value.slice(-6)} (${value.length}자)`;
}

/**
 * 토큰 전체는 찍지 않는다. 구글 ID 토큰은 `aud` 만 꺼낸다 —
 * 서버가 aud 로 검증하므로 불일치가 실패 원인일 때 이 한 줄이면 끝난다.
 */
export function describeToken(provider: string, token: string): Record<string, unknown> {
  if (provider !== "google") return { tokenLength: token.length };

  return { tokenLength: token.length, ...decodeAudience(token) };
}

function decodeAudience(idToken: string): Record<string, unknown> {
  try {
    const payload = idToken.split(".")[1];

    if (!payload) return {};

    const claims = JSON.parse(globalThis.atob(payload.replace(/-/g, "+").replace(/_/g, "/"))) as {
      aud?: string;
      iss?: string;
    };

    return { aud: claims.aud, iss: claims.iss };
  } catch {
    return { aud: "(디코딩 실패)" };
  }
}

function safeJson(value: unknown): string {
  try {
    return typeof value === "string" ? value : JSON.stringify(value);
  } catch {
    return String(value);
  }
}
