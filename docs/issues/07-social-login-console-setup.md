# 소셜 로그인 콘솔 설정에서 걸린 것들

> 2026-08-31 · 카카오 개발자센터 · Google Cloud Console

## 카카오 안드로이드 키 해시 — 형식이 다르다

콘솔에 SHA-1 지문을 그대로 붙여넣으면 저장이 안 된다.

```
PUT .../appkey/5607090/native
400 Bad Request
```

**구글은 16진수, 카카오는 base64 다.** 같은 지문을 다르게 표현한 것뿐이라 변환하면 된다.

```bash
echo "E7:10:ED:7C:2E:1C:7B:E7:A9:26:A3:A9:1E:1B:1C:9C:E9:FC:C3:09" \
  | tr -d ':' | xxd -r -p | base64
# → 5xDtfC4ce+epJqOpHhscnOn8wwk=
```

`=` 까지 포함해 28자다. 앱을 띄우면 `socialLogin.ts` 가 같은 값을 콘솔에 찍어주므로 대조할 수 있다.

**서명키마다 값이 다르다.** EAS 키스토어와 로컬 디버그 키스토어가 다르므로, 둘 다 쓸 거면
카카오 콘솔에 키 해시를 두 개 등록한다.

```bash
keytool -exportcert -alias androiddebugkey \
  -keystore ~/.android/debug.keystore -storepass android \
  | openssl sha1 -binary | openssl base64
```

## 구글 iOS — URL 스킴이 빠진 채로 빌드됐다

```
Your app is missing support for the following URL schemes:
com.googleusercontent.apps.790180940072-...
```

`app.config.ts` 의 `socialPlugins()` 는 키가 없으면 플러그인을 끼우지 않는다.
`EXPO_PUBLIC_GOOGLE_IOS_URL_SCHEME` 이 비어 있던 시점에 빌드해서 Info.plist 에 스킴이 안 들어갔다.

**JS 리로드로는 안 고쳐진다.** Info.plist 는 네이티브 산출물이라 다시 빌드해야 한다.

## 클라우드 빌드에 `.env` 는 올라가지 않는다

```
No environment variables with visibility "Plain text" and "Sensitive" found
for the "development" environment on EAS.
```

`.env` 는 gitignore 대상이라 EAS 로 전송되지 않는다. 그래서 첫 빌드는 카카오 `nativeAppKey`
없이 돌았고, config plugin 이 통째로 빠졌다.

**설정을 만들 때 쓰이는 값은 EAS 에도 올려야 한다.**

```bash
eas env:create --scope project --environment development \
  --name EXPO_PUBLIC_KAKAO_NATIVE_APP_KEY --value <키> --visibility plaintext
```

| 값 | EAS 에 필요한가 |
| --- | --- |
| `EXPO_PUBLIC_KAKAO_NATIVE_APP_KEY` | **필요** — config plugin 이 빌드 시점에 읽는다 |
| `EXPO_PUBLIC_GOOGLE_IOS_URL_SCHEME` | **필요** — 같은 이유 |
| `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` | 개발 빌드는 불필요 — JS 가 Metro 에서 온다 |
| `EXPO_PUBLIC_API_URL` | 개발 빌드는 불필요 — 값이 `localhost` 라 운영에 넣으면 위험하다 |

## 안드로이드 클라이언트 ID 는 앱에 넣지 않는다

구글은 안드로이드 앱을 **패키지명 + 서명 SHA-1** 로 식별한다. 콘솔에 클라이언트가 등록만 되어
있으면 되고, 그 ID 를 `.env` 에 넣을 곳은 없다.

안드로이드에서 로그인해도 **ID 토큰의 `aud` 는 웹 클라이언트 ID** 로 발급된다.
실제 로그로 확인했다.

```
aud : 790180940072-ge5trrvk...apps.googleusercontent.com   ← 웹 클라이언트
iss : https://accounts.google.com
```

서버는 이 `aud` 를 검증하므로(`google.provider.ts`), iOS 클라이언트 ID 는
`GOOGLE_ALLOWED_AUDIENCES` 에 따로 넣어야 한다.
