# nadaena — 문서

「나 VS 나」 서비스 문서 모음.

| 문서 | 내용 | 상태 |
| --- | --- | --- |
| [01-service-plan.md](./planning/01-service-plan.md) | 서비스 기획서 (원문 1~38장 + 승패 규칙 + 팔레트) | v0.5 |
| [02-open-questions.md](./planning/02-open-questions.md) | 확정된 규칙 + 남은 항목 | A·B·C 닫힘 |
| [03-tech-stack.md](./planning/03-tech-stack.md) | 기술 스택 · 인프라 결정 + 근거 | v1.0 |
| [04-folder-convention.md](./planning/04-folder-convention.md) | 폴더 구조 · 코드 작성 규칙 | v1.0 |
| [05-screens.md](./planning/05-screens.md) | 화면설계서 (MVP) | v0.3 |
| [06-database.md](./planning/06-database.md) | DB 스키마 (MVP) | v0.2 |
| [07-api.md](./planning/07-api.md) | API 명세 (MVP) | v0.2 |

## 폴더

| 폴더 | 내용 |
| --- | --- |
| [planning/](./planning/) | 기획 · 설계 문서. 무엇을 왜 만드는지 |
| [issues/](./issues/README.md) | 막혔던 문제와 원인. 같은 곳에 두 번 빠지지 않기 위해 |

## 작업 순서

```
기획서 ✓ → 스택/인프라 ✓ → 폴더 규칙 ✓ → 승패 규칙 ✓
   → 화면설계서 ✓ → DB 스키마 ✓ → API 명세 ✓ → 개발
```

**설계 완료. 웹 · 앱 MVP 구현 완료. 배포 남음.**

## 구현 현황 (2026-08-27)

```
nadaena/
├─ apps/web/            Next.js 16
├─ apps/mobile/         Expo SDK 57 + Expo Router
├─ apps/api/            NestJS + Prisma + PostgreSQL
├─ packages/core/       승패 판정 · 연승 · 반복 규칙 · 날짜  (테스트 65개)
└─ packages/api-client/ API 호출 · 도메인 타입 · React Query 훅  (웹 · 앱 공유)
```

| 영역 | 상태 |
| --- | --- |
| 화면 — 오늘 / 기록 / MY / 미션 / 설정 | ✅ |
| 반복 규칙 (프리셋 5 + 맞춤) | ✅ |
| API — 미션 · 오늘 · 기록 · 통계 | ✅ |
| 자정 정산 배치 | ✅ |
| 웹 ↔ API 연결 | ✅ |
| 인증 (카카오 · 구글) | ✅ 웹 동작 확인 완료 |
| 랜딩 · 둘러보기 · 온보딩 | ✅ 웹 |
| **앱 — 오늘 / 기록 / MY / 미션 / 온보딩 / 설정** | ✅ 번들 확인, 실기기 미확인 |
| 앱 소셜 로그인 | ✅ 코드 완료 — 콘솔 키 등록 후 개발 빌드에서 확인 필요 |
| 설정 (닉네임 · 소개 · 타임존) | ✅ 웹 · 앱 |
| 배포 (Oracle VM) | ⬜ |

### 웹과 앱이 공유하는 것

UI 는 공유되지 않는다(RN 에는 DOM 이 없다). 그 아래는 전부 공유한다.

```
packages/core         승패 판정 · 반복 규칙 · 날짜 계산
packages/api-client   HTTP 호출 · 토큰 회전 · 도메인 타입 · React Query 훅
                      + 달력 격자 계산 · 잔디 단계 · 반복 옵션
```

`configureApiClient()` 에 넘기는 값만 다르다 — 주소와 refresh 저장 위치.

## 소셜 로그인 설정

`apps/api/.env` 와 `apps/web/.env.local` 에 키를 넣는다. **커밋하지 않는다.**

### 웹

| 콘솔 | 등록할 Redirect URI |
| --- | --- |
| [카카오](https://developers.kakao.com) | `http://localhost:3000/auth/callback/kakao` |
| [구글](https://console.cloud.google.com) | `http://localhost:3000/auth/callback/google` |

구글은 OAuth 클라이언트 유형을 **웹 애플리케이션**으로 만들어야 한다.
데스크톱 유형은 `http://localhost` 만 허용해서 콜백 경로를 등록할 수 없다.

### 앱 — 콜백 주소가 없다

앱은 **네이티브 SDK 로 토큰을 받아 서버에 넘긴다.** Redirect URI 를 등록하지 않는다.
(브라우저 흐름은 구글이 커스텀 스킴을 거절해서 쓸 수 없다.)

| 콘솔 | 필요한 것 | `.env` |
| --- | --- | --- |
| 카카오 | **네이티브 앱 키** (REST API 키 아님) | `EXPO_PUBLIC_KAKAO_NATIVE_APP_KEY` |
| 카카오 | 플랫폼에 iOS 번들 ID · Android 패키지명 등록 (`com.nadaena.app`) | — |
| 구글 | 웹 클라이언트 ID (ID 토큰의 `aud` 가 된다) | `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` |
| 구글 | iOS 클라이언트 → 역방향 URL 스킴 | `EXPO_PUBLIC_GOOGLE_IOS_URL_SCHEME` |
| 구글 | Android 클라이언트 (SHA-1 지문 필요) | — |

안드로이드 키 해시는 `getKeyHashAndroid()` 로 뽑는다. 서버는 iOS 클라이언트 ID 를
`GOOGLE_ALLOWED_AUDIENCES` 에 넣어야 iOS 로그인이 통과한다.

JWT 시크릿은 이렇게 만든다.

```bash
openssl rand -base64 48
```

## 실행

```bash
pnpm install
pnpm seed            # DB 초기 데이터 (사용자 1명 + 180일 기록)

pnpm dev             # 웹  http://localhost:3000
pnpm dev:api         # API http://localhost:4000/api/v1
                     #     문서 http://localhost:4000/api/v1/docs
pnpm dev:app         # 앱  Expo
pnpm test            # packages/core
pnpm typecheck       # 전체
```

로컬 PostgreSQL 을 쓴다. `apps/api/.env` 의 `DATABASE_URL` 을 맞춘다.

### 앱 실행

`packages/` 를 먼저 빌드해야 한다. 앱은 `dist` 를 읽는다.

```bash
pnpm --filter @nadaena/core build
pnpm --filter @nadaena/api-client build
pnpm dev:app
```

**소셜 로그인은 개발 빌드에서만 된다.** Expo Go 는 `exp://` 로 돌아오는데
카카오·구글이 그 주소를 받아주지 않는다. `pnpm --filter @nadaena/mobile ios` 로 개발 빌드를 만든다.

실기기로 붙일 때는 `apps/mobile/.env` 의 `EXPO_PUBLIC_API_URL` 을 개발 PC 의 LAN 주소로 바꾼다.
기기에서 `localhost` 는 기기 자신이다.

안드로이드 에뮬레이터는 `.env` 를 고치는 대신 포트를 연결한다. iOS 와 같은 설정을 그대로 쓸 수 있다.

```bash
adb reverse tcp:8081 tcp:8081   # Metro
adb reverse tcp:4000 tcp:4000   # API
```

로딩에서 멈추면 이 연결부터 확인한다. [issues/06](./issues/06-android-emulator-networking.md)
