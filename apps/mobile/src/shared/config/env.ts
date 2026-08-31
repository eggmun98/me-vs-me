/**
 * `EXPO_PUBLIC_` 접두사가 붙은 값만 번들에 들어간다.
 *
 * 기기에서는 `localhost` 가 기기 자신을 가리킨다.
 * 실기기로 붙일 때는 `.env` 에 개발 PC 의 LAN 주소를 넣어야 한다.
 */
export const env = {
  apiUrl: process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:4000/api/v1",
  kakaoNativeAppKey: process.env.EXPO_PUBLIC_KAKAO_NATIVE_APP_KEY ?? "",
  googleWebClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? "",
  googleIosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? "",
};
