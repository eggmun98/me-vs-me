# 안드로이드 빌드 — 없는 스플래시 이미지를 가리킨다

> 2026-08-31 · EAS 안드로이드 빌드

## 증상

카카오 저장소 문제를 고치자 다음 단계에서 죽었다.

```
Execution failed for task ':app:processDebugResources'.
> Android resource linking failed
  values.xml:7813: error: resource drawable/splashscreen_logo
                          (aka com.nadaena.app:drawable/splashscreen_logo) not found.
```

역시 iOS 는 통과했다.

## 원인

안드로이드 템플릿은 스플래시 테마가 이미지를 가리키게 만들어 두고, 기본 이미지도 density 별로 넣어준다.

```xml
<style name="Theme.App.SplashScreen" parent="AppTheme">
  <item name="android:windowBackground">@drawable/splashscreen_logo</item>
</style>
```

그런데 `expo-splash-screen` 플러그인은 적용되는 순간 **기존 splash 이미지를 전부 지우고**
`image` 가 주어졌을 때만 새로 넣는다. 우리 설정에는 `image` 가 없었다.

```ts
["expo-splash-screen", { backgroundColor: "#fafafa", resizeMode: "contain" }],
```

지우기만 하고 끝나서 **참조는 남고 파일은 없는** 상태가 됐다.

## 해결

플러그인 항목을 뺐다. 그러면 템플릿 기본 이미지가 살아남아 참조가 해결된다.

로컬 prebuild 로 확인했다.

```
android/app/src/main/res/drawable-mdpi/splashscreen_logo.png    12863 바이트
                          drawable-hdpi/...                     20754
                          drawable-xhdpi/...                    29081
                          drawable-xxhdpi/...                   47123
                          drawable-xxxhdpi/...                  66529
```

## 남은 것

스플래시 배경색 `#fafafa` 를 잃고 템플릿 기본값을 쓴다.
**로고 자산이 생기면 `image` 와 함께 플러그인을 다시 넣는다.** `image` 없이 넣으면 안 된다.
