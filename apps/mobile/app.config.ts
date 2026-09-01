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
	/**
	 * EAS 프로젝트가 @eggmun 계정 아래에 있다. 조직 계정과 헷갈리지 않게 못 박는다.
	 *
	 * 이 값과 아래 `projectId` 는 환경변수로 빼지 않는다. `expo` CLI 와 달리
	 * `eas` CLI 는 `.env` 를 읽지 않아서, 빼면 모든 eas 명령이
	 * `EAS project not configured` 로 죽는다. 비밀값도 아니다 —
	 * 업데이트 주소로 공개되고 앱 바이너리에도 들어간다.
	 */
	owner: "eggmun",
	version: "0.1.0",
	orientation: "portrait",
	userInterfaceStyle: "light",
	scheme: "nadaena",
	icon: "./assets/icon.png",

	ios: {
		supportsTablet: false,
		bundleIdentifier: "com.nadaena.app",
		infoPlist: {
			CFBundleDevelopmentRegion: "ko",
			/**
			 * 미국 수출 규정상 암호화 자체분류 신고를 면제받는다.
			 *
			 * HTTPS · JWT · 키체인(expo-secure-store) 만 쓰고 독자 암호화를 구현하지 않았다.
			 * 자체 암호화를 넣는 순간 이 값을 되돌리고 신고해야 한다.
			 *
			 * `ios.config.usesNonExemptEncryption` 도 같은 키로 번역되지만,
			 * eas-cli 는 infoPlist 만 들여다보고 없으면 매번 다시 묻는다.
			 */
			ITSAppUsesNonExemptEncryption: false,
		},
	},

	android: {
		package: "com.nadaena.app",
		adaptiveIcon: {
			foregroundImage: "./assets/icon.png",
			backgroundColor: "#FAFAFA",
		},
	},

	plugins: [
		"expo-router",
		"expo-secure-store",
		[
			"expo-splash-screen",
			{
				image: "./assets/nadaena-mark.png",
				backgroundColor: "#FAFAFA",
				imageWidth: 160,
			},
		],
		/**
		 * 카카오 안드로이드 SDK 는 Maven Central 에 없고 카카오 저장소에만 있다.
		 *
		 * `@react-native-kakao/core` 가 `com.kakao.sdk:v2-common` 을 의존성으로 걸면서
		 * 저장소는 등록해주지 않아서, 이걸 빼면 Gradle 이 아티팩트를 못 찾고 죽는다.
		 * 네이티브 모듈은 키 유무와 상관없이 항상 링크되므로 `socialPlugins()` 밖에 둔다.
		 */
		[
			"expo-build-properties",
			{
				android: {
					extraMavenRepos: [
						"https://devrepo.kakao.com/nexus/content/groups/public/",
					],
				},
			},
		],
		...socialPlugins(),
	],

	/**
	 * OTA 업데이트가 붙을 때를 대비한다.
	 * 네이티브가 바뀌지 않은 버전끼리만 업데이트를 주고받아야 앱이 깨지지 않는다.
	 */
	runtimeVersion: {
		policy: "appVersion",
	},

	/** 앱이 업데이트를 받아올 주소. 프로젝트 ID 에서 그대로 만들어진다. */
	updates: {
		url: "https://u.expo.dev/fe400a3c-45bc-4087-9b0a-5fa27d612ae8",
	},

	/**
	 * EAS 프로젝트 ID 를 직접 넣는다.
	 *
	 * `app.json` 이면 eas-cli 가 알아서 써넣지만, 이 파일은 함수를 실행해 설정을 만드는
	 * 동적 설정이라 CLI 가 어디에 끼워야 할지 알 수 없다. 없으면 빌드가 프로젝트 연결
	 * 단계에서 죽는다.
	 */
	extra: {
		eas: {
			projectId: "fe400a3c-45bc-4087-9b0a-5fa27d612ae8",
		},
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
		plugins.push([
			"@react-native-google-signin/google-signin",
			{ iosUrlScheme: googleIosUrlScheme },
		]);
	}

	return plugins;
}
