# 안드로이드 빌드 — 카카오 SDK 를 찾지 못한다

> 2026-08-31 · EAS 안드로이드 빌드

## 증상

```
> Could not find com.kakao.sdk:v2-common:2.20.1.
  Searched in the following locations:
    - https://dl.google.com/dl/android/maven2/...
    - https://repo.maven.apache.org/maven2/...
    - https://www.jitpack.io/...
  Required by: project ':app' > project :react-native-kakao_core
```

iOS 는 성공하고 안드로이드만 실패했다.

## 원인

`@react-native-kakao/core` 의 `android/build.gradle` 이 의존성만 선언하고 **저장소는 등록하지 않는다.**

```gradle
implementation "com.kakao.sdk:v2-common:${Versions.core}"
```

카카오 SDK 는 Maven Central 에 없다. 확인한 결과:

```
repo1.maven.org   .../com/kakao/sdk/v2-common/maven-metadata.xml  → 404
devrepo.kakao.com .../v2-common/2.20.1/v2-common-2.20.1.pom       → 200
```

iOS 가 통과한 이유는 CocoaPods 로 받기 때문이다. Gradle 만 저장소를 몰랐다.

## 해결

`expo-build-properties` 로 카카오 저장소를 추가했다.

```ts
["expo-build-properties", {
  android: { extraMavenRepos: ["https://devrepo.kakao.com/nexus/content/groups/public/"] },
}],
```

## 주의

이 플러그인은 **`socialPlugins()` 바깥**에 둔다. 네이티브 모듈은 `package.json` 에 있으면
키 유무와 무관하게 항상 autolink 되므로, 저장소도 항상 등록돼 있어야 한다.
조건부로 넣으면 키가 없는 환경에서 똑같이 터진다.
