import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { getKeyHashAndroid, initializeKakaoSDK } from "@react-native-kakao/core";
import { login as kakaoLogin } from "@react-native-kakao/user";
import type { SocialProviderId } from "@nadaena/api-client";
import { Platform } from "react-native";
import { env } from "@/shared/config/env";
import { logSocialFailure, type SocialStep } from "./socialLoginDebug";

export const PROVIDER_LABELS: Record<SocialProviderId, string> = {
  kakao: "카카오로 시작하기",
  google: "Google로 시작하기",
};

export type SocialTokenResult =
  | { type: "success"; token: string }
  | { type: "cancelled" }
  | { type: "error"; message: string };

/** 어느 단계에서 끊겼는지 로그에 남기기 위한 표식. 흐름 자체는 바꾸지 않는다. */
type TrackStep = (step: SocialStep) => void;

/**
 * 앱은 **네이티브 SDK 로 토큰까지 받아서** 서버에 넘긴다.
 *
 * 웹처럼 브라우저를 띄워 인가 코드를 받는 방식은 앱에서 쓰지 않는다.
 * 커스텀 스킴 콜백을 각 콘솔에 등록해야 하고, 구글은 그마저도 웹 클라이언트로는 거절한다.
 * 네이티브 SDK 를 쓰면 카카오톡 앱으로 넘어갔다 돌아오는 흐름이 그대로 되고,
 * client secret 은 계속 서버에만 남는다.
 */
export async function requestSocialToken(
  provider: SocialProviderId,
): Promise<SocialTokenResult> {
  let step: SocialStep = "설정 확인";
  const track: TrackStep = (next) => {
    step = next;
  };

  try {
    const result =
      provider === "kakao" ? await requestKakaoToken(track) : await requestGoogleToken(track);

    if (result.type === "error") logSocialFailure(provider, step, new Error(result.message));

    return result;
  } catch (error) {
    logSocialFailure(provider, step, error);

    return { type: "error", message: toMessage(error) };
  }
}

/** 카카오는 **access token** 을 준다. 서버가 이걸로 프로필을 조회한다. */
async function requestKakaoToken(track: TrackStep): Promise<SocialTokenResult> {
  if (!env.kakaoNativeAppKey) {
    return { type: "error", message: "카카오 네이티브 앱 키가 없습니다. .env 를 확인하세요." };
  }

  track("SDK 초기화");
  await ensureKakaoReady();

  track("네이티브 로그인");
  const result = await kakaoLogin();

  track("토큰 수령");

  return result.accessToken
    ? { type: "success", token: result.accessToken }
    : { type: "error", message: "카카오 토큰을 받지 못했습니다." };
}

/** 구글은 **ID token** 을 준다. 서명된 JWT 라 서버가 직접 검증한다. */
async function requestGoogleToken(track: TrackStep): Promise<SocialTokenResult> {
  if (!env.googleWebClientId) {
    return { type: "error", message: "구글 클라이언트 ID 가 없습니다. .env 를 확인하세요." };
  }

  track("SDK 초기화");
  ensureGoogleConfigured();
  await GoogleSignin.hasPlayServices();

  track("네이티브 로그인");
  const result = await GoogleSignin.signIn();

  if (result.type !== "success") return { type: "cancelled" };

  track("토큰 수령");

  return result.data.idToken
    ? { type: "success", token: result.data.idToken }
    : { type: "error", message: "구글 토큰을 받지 못했습니다." };
}

let isKakaoReady = false;

/** SDK 초기화는 한 번이면 된다. 로그인 화면에 다시 들어올 때마다 부르지 않는다. */
async function ensureKakaoReady(): Promise<void> {
  if (isKakaoReady) return;

  await initializeKakaoSDK(env.kakaoNativeAppKey);
  isKakaoReady = true;

  await logAndroidKeyHash();
}

/**
 * 안드로이드 카카오 로그인은 **키 해시**를 콘솔에 등록해야 통과한다.
 *
 * 구글이 요구하는 SHA-1(16진수)과 다른 값이다 — 같은 지문을 base64 로 쓴 것이라
 * 콘솔에 잘못 넣으면 원인을 찾기 어렵다. 그래서 앱이 직접 찍어준다.
 * 빌드마다(개발/스토어) 서명키가 달라 값도 달라진다.
 */
async function logAndroidKeyHash(): Promise<void> {
  if (!__DEV__ || Platform.OS !== "android") return;

  console.log("[카카오] 이 값을 개발자센터 > 플랫폼 > Android 키 해시에 등록:", await getKeyHashAndroid());
}

let isGoogleConfigured = false;

function ensureGoogleConfigured(): void {
  if (isGoogleConfigured) return;

  GoogleSignin.configure({
    // ID 토큰의 aud 가 이 값이 된다. 서버의 GOOGLE_CLIENT_ID 와 같아야 한다.
    webClientId: env.googleWebClientId,
    ...(env.googleIosClientId ? { iosClientId: env.googleIosClientId } : {}),
  });
  isGoogleConfigured = true;
}

/** 사용자가 창을 닫은 것도 SDK 에 따라 예외로 온다. 오류로 보여주지 않는다. */
function toMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);

  return message || "로그인에 실패했습니다.";
}
