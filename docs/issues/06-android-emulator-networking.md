# 안드로이드 에뮬레이터가 Metro·API 에 닿지 못한다

> 2026-08-31 · 모바일

## 증상 1 — 로딩에서 멈춘다

앱이 뜨긴 하는데 흰 화면에서 진행되지 않는다. Metro 로그에는 아무것도 안 찍힌다.

기기 로그를 보니 JS 가 아예 시작되지 않았다.

```
E ReactHost: raiseSoftException(onNewIntent(...)): Tried to access onNewIntent while context is not ready
```

`ReactNativeJS` 로그가 **한 줄도 없었다.** 번들을 받지 못한 것이다.

## 증상 2 — 로그인 마지막에 실패한다

번들이 뜬 뒤에는 소셜 로그인이 서버 단계에서 죽었다.

```
step    : 서버 검증
message : fetch failed: java.net.ConnectException: Failed to connect to localhost/127.0.0.1:4000
tokenLength : 1093
aud : 790180940072-...apps.googleusercontent.com
```

**네이티브 로그인은 성공하고 있었다.** 토큰까지 정상적으로 받았다.

## 원인

에뮬레이터에서 `localhost` 는 **에뮬레이터 자신**이다. 개발 PC 가 아니다.
Metro 가 LAN 주소(`192.168.0.186:8081`)로 떠 있었는데 에뮬레이터가 거기에 닿지 못했다.
(맥 방화벽은 꺼져 있었다.)

## 해결

`adb reverse` 로 두 포트를 기기 쪽으로 연결한다.

```bash
adb reverse tcp:8081 tcp:8081   # Metro
adb reverse tcp:4000 tcp:4000   # API
```

이렇게 하면 `.env` 를 `10.0.2.2` 로 바꾸지 않아도 된다.
**iOS 시뮬레이터와 같은 `.env` 를 그대로 쓸 수 있어서 이 방식이 낫다.**

## 자꾸 끊긴다

`adb reverse --list` 의 헤더가 `host-26` → `host-15` 로 바뀌면 adb 연결이 새로 맺어진 것이고,
그때 포워딩이 전부 날아간다. 에뮬레이터 재시작이나 `expo start` 가 adb 를 다시 잡을 때 그렇게 된다.
로딩에서 멈추면 먼저 `adb reverse --list` 를 확인한다.

`ANDROID_HOME` 이 설정돼 있지 않으면 전체 경로를 쓴다.

```bash
~/Library/Android/sdk/platform-tools/adb reverse --list
```
