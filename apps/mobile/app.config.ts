import type { ExpoConfig } from "expo/config";

/**
 * app.json 대신 이 파일을 쓴다.
 *
 * 네이티브 SDK 키를 소스에 박지 않고 `.env` 에서 읽기 위해서다.
 * (키 자체는 앱 번들에 들어가므로 비밀이 아니지만, 개발/운영을 갈라 쓰려면 환경변수여야 한다.)
 */
const kakaoNativeAppKey = process.env.EXPO_PUBLIC_KAKAO_NATIVE_APP_KEY;
const googleIosUrlScheme = process.env.EXPO_PUBLIC_GOOGLE_IOS_URL_SCHEME;

export default (): ExpoConfig => ({
  /**
   * 네이티브 프로젝트 이름이 여기서 나온다. 한글이 섞이면 Expo 가 ASCII 만 남겨
   * "나 VS 나" → `VS` 라는 엉뚱한 프로젝트가 만들어진다. 그래서 영문으로 둔다.
   * 서비스 이름(「나 VS 나」)은 앱 안에서 쓴다.
   */
  name: "Nadaena",
  slug: "nadaena",
  version: "0.1.0",
  orientation: "portrait",
  userInterfaceStyle: "light",
  scheme: "nadaena",

  ios: {
    supportsTablet: false,
    bundleIdentifier: "com.nadaena.app",
    infoPlist: {
      CFBundleDevelopmentRegion: "ko",
    },
  },

  android: {
    package: "com.nadaena.app",
  },

  plugins: [
    "expo-router",
    "expo-secure-store",
    ["expo-splash-screen", { backgroundColor: "#fafafa", resizeMode: "contain" }],
    ...socialPlugins(),
  ],

  /**
   * OTA 업데이트가 붙을 때를 대비한다.
   * 네이티브가 바뀌지 않은 버전끼리만 업데이트를 주고받아야 앱이 깨지지 않는다.
   */
  runtimeVersion: {
    policy: "appVersion",
  },

  experiments: {
    typedRoutes: true,
  },
});

/**
 * 키가 없으면 플러그인을 끼우지 않는다.
 *
 * 빈 값으로 넣으면 `expo prebuild` 가 알아보기 힘든 네이티브 오류로 죽는다.
 * 키 없이도 앱은 뜨고, 로그인만 안 된다 — 화면 작업은 그대로 할 수 있다.
 */
function socialPlugins(): NonNullable<ExpoConfig["plugins"]> {
  const plugins: NonNullable<ExpoConfig["plugins"]> = [];

  if (kakaoNativeAppKey) {
    plugins.push([
      "@react-native-kakao/core",
      {
        nativeAppKey: kakaoNativeAppKey,
        android: { authCodeHandlerActivity: true },
        ios: { handleKakaoOpenUrl: true },
      },
    ]);
  }

  if (googleIosUrlScheme) {
    plugins.push(["@react-native-google-signin/google-signin", { iosUrlScheme: googleIosUrlScheme }]);
  }

  return plugins;
}
