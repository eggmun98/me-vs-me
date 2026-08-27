# API 명세 — MVP

> v0.1 (2026-08-26)
> 기준: `05-screens.md` v0.1, `06-database.md` v0.1
> 실제 문서는 `@nestjs/swagger`로 DTO에서 생성한다. 이 문서는 **설계 결정과 계약**을 남긴다.

---

## 1. 공통 규약

### 1.1 Base URL

```
https://nadaena.com/api/v1
```

**버전을 처음부터 붙인다.** 앱은 강제 업데이트가 어려워 구버전이 오래 남는다. 나중에 붙이려면 기존 경로를 전부 옮겨야 한다.

### 1.2 인증

```
Authorization: Bearer <access token>
```

| 토큰 | 수명 | 보관 |
| --- | --- | --- |
| access | 30분 | 메모리 |
| refresh | 90일, 회전 | 웹: httpOnly 쿠키 / 앱: SecureStore |

refresh 엔드포인트는 **쿠키와 요청 바디를 모두 받는다.** 웹과 앱이 같은 엔드포인트를 쓴다.

### 1.3 날짜

```
date: "2026-08-26"    // YYYY-MM-DD, 사용자 로컬 날짜
```

**"오늘"은 서버가 결정한다.** 클라이언트가 보낸 날짜를 오늘로 신뢰하지 않는다. 기기 시계를 바꿔 승부를 조작할 수 있기 때문이다.

서버는 `user.timezone`으로 현재 로컬 날짜를 구한다.

시각이 필요한 필드는 ISO 8601 UTC.

```
completedAt: "2026-08-26T13:20:11.000Z"
```

### 1.4 에러

```json
{
  "code": "RECORD_LOCKED",
  "message": "7일이 지난 기록은 수정할 수 없습니다.",
  "status": 409
}
```

| code | status | 상황 |
| --- | --- | --- |
| `UNAUTHORIZED` | 401 | 토큰 없음/만료 |
| `INVALID_REFRESH_TOKEN` | 401 | refresh 무효·재사용 |
| `FORBIDDEN` | 403 | 남의 리소스 |
| `NOT_FOUND` | 404 | — |
| `NICKNAME_TAKEN` | 409 | 닉네임 중복 |
| `RECORD_LOCKED` | 409 | 7일 경과 기록 수정 시도 |
| `MISSION_NOT_IN_DAY` | 409 | 그날 확정되지 않은 미션 조작 |
| `VALIDATION_FAILED` | 400 | DTO 검증 실패 |

응답은 래핑하지 않는다. 성공은 리소스를 그대로, 실패만 위 포맷.

---

## 2. 엔드포인트 목록

| 화면 | Method | 경로 |
| --- | --- | --- |
| S1 | POST | `/auth/social/:provider` |
| — | POST | `/auth/refresh` |
| — | POST | `/auth/logout` |
| S2 | GET | `/users/nickname/random` |
| S2 | GET | `/users/nickname/check` |
| S2 | POST | `/users/me/onboarding` |
| S2 | GET | `/missions/recommended` |
| S8 S11 | GET | `/users/me` |
| S11 | PATCH | `/users/me` |
| S11 | DELETE | `/users/me` |
| S10 | GET | `/categories` |
| S10 | POST | `/categories` |
| S9 | GET | `/missions` |
| S10 | POST | `/missions` |
| S10 | PATCH | `/missions/:id` |
| S9 | DELETE | `/missions/:id` |
| **S3** | **GET** | **`/today`** |
| **S3** | **PATCH** | **`/daily-missions/:id`** |
| S3 S7 | PUT | `/daily-records/:date/reflection` |
| S4 | GET | `/records/grass` |
| S5 | GET | `/records/calendar` |
| S6 | GET | `/records/stats` |
| S7 | GET | `/records/:date` |

---

## 3. 인증

### `POST /auth/social/:provider`

`provider`: `google` | `kakao`

```json
// Request — redirectUri 는 보내지 않는다. 서버가 OAUTH_REDIRECT_BASE 로 만든다.
{ "code": "..." }

// Response 200
{
  "accessToken": "...",
  "refreshToken": "...",       // 앱용. 웹은 httpOnly 쿠키로도 내려간다
  "isNewUser": true            // true면 온보딩으로 보낸다
}
```

**`redirectUri` 를 클라이언트가 보내지 않는다.** 토큰 교환에 쓰이는 값이라 클라이언트가 정하게 하면
공격자가 자기 서버로 코드를 흘릴 수 있다. 서버가 `OAUTH_REDIRECT_BASE + /auth/callback/{provider}` 로 만든다.

콜백 경로는 소셜 콘솔에 등록한 Redirect URI 와 정확히 같아야 한다.

```
http://localhost:3000/auth/callback/kakao
http://localhost:3000/auth/callback/google
```

**카카오는 이메일을 주지 않을 수 있다.** 식별은 `provider + providerUserId`로 한다. (`03-tech-stack.md` 8장)

### `POST /auth/refresh`

```json
// Request (앱). 웹은 쿠키로 전달되므로 바디 없이 호출한다.
{ "refreshToken": "..." }

// Response 200
{ "accessToken": "...", "refreshToken": "..." }
```

**회전한다.** 호출할 때마다 새 refresh를 발급하고 이전 것을 만료시킨다.

**회전 직후 1분간은 이전 토큰도 받는다.** 동시 요청이나 네트워크 재시도로 같은 토큰이 두 번 오는 것은 정상 상황이며, 이를 탈취로 판단해 끊으면 멀쩡한 사용자가 로그아웃된다.

유예 시간이 지난 뒤의 재사용은 탈취로 보고 **해당 사용자의 모든 refresh를 폐기**한다.

---

## 4. 오늘 (핵심)

### `GET /today`

**파라미터가 없다.** 서버가 `user.timezone`으로 오늘을 결정한다.

```json
{
  "date": "2026-08-26",
  "result": "IN_PROGRESS",
  "totalCount": 5,
  "winCount": 3,
  "rate": 0.6,
  "isWinConfirmed": true,

  "missions": [
    {
      "id": "dm_01",
      "missionId": "ms_01",
      "name": "영어 공부",
      "categoryName": "외국어",
      "targetAmount": 30,
      "unit": "분",
      "difficulty": "NORMAL",
      "result": "WIN",
      "completedAt": "2026-08-26T13:20:11.000Z"
    }
  ],

  "reflection": null,

  "summary": {
    "total":  { "count": 127, "win": 94, "draw": 5, "lose": 28, "winRate": 0.740 },
    "streak": { "current": 7, "longest": 12 },
    "month":  { "month": "2026-08", "count": 21, "win": 16, "draw": 1, "lose": 4, "winRate": 0.762 },
    "monthGrass": [
      { "date": "2026-08-01", "result": "WIN",  "rate": 0.8 },
      { "date": "2026-08-02", "result": "REST", "rate": null }
    ]
  },

  "editableDates": [
    { "date": "2026-08-25", "loseCount": 2, "editableUntil": "2026-09-01" }
  ]
}
```

### 한 번에 다 내려주는 이유

오늘 화면은 **진입 속도가 이 서비스의 전부**다. 매일 여는 화면인데 스피너가 네 번 뜨면 그 자체로 이탈 요인이 된다.

우측 패널(전적·연승·이번 달 잔디·시즌)까지 한 응답에 담는다. 데이터가 작아 응답 크기가 문제되지 않는다.

### `isWinConfirmed`

`05-screens.md` 4.2의 **승리 조기 확정**. 분모가 고정이라 완료 수만으로 결정된다.

```
완료 수 > 전체 수 ÷ 2
```

계산은 `packages/core`가 하고, 서버와 클라이언트가 같은 함수를 쓴다.

### `editableDates`

`05-screens.md` 4.6의 어제 기록 유도. 최근 7일 중 **LOSE가 있고 아직 수정 가능한 날**이다.

이게 응답에 없으면 사용자는 기록 화면에 들어가지 않아 7일 규칙이 사실상 죽는다.

---

### `PATCH /daily-missions/:id`

```json
// Request
{ "result": "WIN" }     // "WIN" | "PENDING"

// Response 200
{
  "dailyMission": { "id": "dm_01", "result": "WIN", "completedAt": "..." },
  "daily": {
    "date": "2026-08-26",
    "result": "IN_PROGRESS",
    "totalCount": 5,
    "winCount": 3,
    "rate": 0.6,
    "isWinConfirmed": true
  },
  "summary": { "total": {...}, "streak": {...}, "month": {...} }
}
```

### 토글이 아니라 상태를 지정한다

`POST /check` + `DELETE /check`나 토글 방식을 쓰지 않는다.

**멱등해야 하기 때문이다.** 네트워크가 끊겨 재시도되면 토글은 상태가 뒤집힌다. 사용자는 체크했는데 해제돼 있고, 그 결과 승부가 뒤집힌다. 명시적 상태 지정이면 몇 번을 보내도 같다.

`result: "LOSE"`는 받지 않는다. 패배는 자정 정산이 확정한다. 사용자가 스스로 패배를 선언하게 만들지 않는다. (`05-screens.md` 3장)

### 응답에 재계산 결과를 함께 내려주는 이유

체크 한 번에 **미션 승패 → 일일 승패 → 달성률 → 연승 → 전적**이 연쇄로 바뀐다.

응답에 갱신값이 없으면 클라이언트가 `GET /today`를 다시 부른다. 체크할 때마다 왕복이 두 번이 되고, 그 사이에 화면 숫자가 잠시 어긋난다.

서버는 이미 재계산했으므로 그대로 내려준다.

### 7일 규칙

과거 날짜의 `dailyMission`도 이 엔드포인트로 수정한다. 7일이 지났으면 `409 RECORD_LOCKED`.

**미션 목록 자체는 수정할 수 없다.** 그날의 미션은 `DailyMission`으로 확정돼 있다(6.5). 없는 미션을 추가하려 하면 `409 MISSION_NOT_IN_DAY`.

---

### `PUT /daily-records/:date/reflection`

```json
// Request
{ "reflection": "알고리즘은 못 했지만 운동과 영어는 계획대로 끝냈다." }
```

`PUT`인 이유: 하루에 하나뿐이고 덮어쓰기다. 7일 규칙이 동일하게 적용된다.

---

## 5. 기록

### `GET /records/grass?year=2026`

```json
{
  "year": 2026,
  "days": [
    { "date": "2026-01-01", "result": "WIN",  "rate": 0.8 },
    { "date": "2026-01-02", "result": "REST", "rate": null },
    { "date": "2026-01-03", "result": "LOSE", "rate": 0.2 }
  ],
  "summary": { "count": 287, "win": 214, "draw": 12, "lose": 61, "winRate": 0.746, "activeDays": 312 }
}
```

**기록이 없는 날도 배열에 포함한다.** 클라이언트가 빈 날짜를 채우게 하면 타임존과 윤년 처리가 클라이언트마다 갈린다.

서버는 `generate_series`로 날짜를 만들고 `daily_records`를 LEFT JOIN 한다. (`06-database.md` 6장)

### `GET /records/calendar?year=2026&month=8`

```json
{
  "year": 2026, "month": 8,
  "days": [ { "date": "2026-08-01", "result": "WIN", "rate": 0.8, "totalCount": 5, "winCount": 4 } ],
  "summary": { "count": 21, "win": 16, "draw": 1, "lose": 4, "winRate": 0.762, "longestStreak": 9 }
}
```

### `GET /records/stats?period=month|all`

```json
{
  "period": "all",
  "daily":   { "count": 127, "win": 94, "draw": 5, "lose": 28, "winRate": 0.740 },
  "mission": { "count": 583, "win": 421, "lose": 162, "winRate": 0.722 },
  "activeDays": 132,
  "streak": { "current": 7, "longest": 12 },

  "byCategory": [ { "categoryName": "운동", "total": 135, "win": 127, "rate": 0.940 } ],
  "byMission":  [ { "missionId": "ms_03", "name": "독서 30분", "total": 135, "win": 82, "rate": 0.607 } ],
  "byMonth":    [ { "month": "2026-05", "winRate": 0.68 }, { "month": "2026-06", "winRate": 0.71 } ]
}
```

`byMission`은 **삭제된 미션도 포함한다.** 미션은 soft delete이고 과거 기록이 남아 있기 때문이다. (`06-database.md` 1.2)

`05-screens.md` S6에서 가장 낮은 미션을 강조하므로 `rate` 오름차순으로 내려준다.

### `GET /records/:date`

`05-screens.md` S7 날짜 상세.

```json
{
  "date": "2026-08-26",
  "result": "WIN",
  "totalCount": 4, "winCount": 3, "rate": 0.75,
  "missions": [ { "id": "dm_01", "name": "영어 공부", "targetAmount": 30, "unit": "분", "result": "WIN" } ],
  "reflection": "...",
  "editable": true,
  "editableUntil": "2026-09-02"
}
```

`editable`을 서버가 판단해 내려준다. 클라이언트가 7일을 계산하면 기기 시계에 따라 달라진다.

---

## 6. 미션

### `GET /missions`

```json
{
  "active":   [ { "id": "ms_01", "name": "영어 공부", "categoryId": "ct_03", "categoryName": "외국어",
                  "targetAmount": 30, "unit": "분", "difficulty": "NORMAL",
                  "repeat": { "type": "WEEKLY", "interval": 1, "weekdays": [1,2,3,4,5], ... },
                  "isActive": true } ],
  "inactive": [ ... ]
}
```

`weekdays`: `0=일 … 6=토`. 프리셋은 규칙의 프리필일 뿐이라 저장 구조가 하나다.

### `POST /missions` · `PATCH /missions/:id`

```json
{
  "name": "영어 공부",
  "categoryId": "ct_03",
  "targetAmount": 30,
  "unit": "분",
  "difficulty": "NORMAL",
  "repeat": {
    "type": "WEEKLY",
    "interval": 1,
    "weekdays": [1, 2, 3, 4, 5],
    "weekOrder": null,
    "monthDay": null,
    "month": null,
    "startDate": "2026-08-26"
  }
}
```

`repeat` 은 core 의 `RepeatPayload` 와 같은 평평한 모양이다.
API 요청 · DB 컬럼 · 폼 검증이 모두 이 한 가지 모양을 쓴다.

| type | 쓰는 필드 |
| --- | --- |
| `ONCE` | `startDate` |
| `DAILY` | `interval` |
| `WEEKLY` | `interval` · `weekdays` |
| `MONTHLY` | `interval` + (`monthDay`) 또는 (`weekOrder` · `weekdays[0]`) |
| `YEARLY` | `interval` · `month` · `monthDay` |

`weekOrder` 가 `-1` 이면 마지막 주다.

**생성은 오늘부터 반영된다.** 오늘 요일에 해당하면 `daily_mission`을 즉시 만든다.
분모가 늘어 자신에게 불리하므로 악용될 수 없다. (`01-service-plan.md` 6.5)

### `DELETE /missions/:id` · 비활성화

```json
// Response 200
{ "appliedFrom": "2026-08-27" }
```

**오늘 승부에서는 빠지지 않는다.** soft delete이며 다음 날부터 반영된다.

응답에 `appliedFrom`을 담아 `05-screens.md` S9의 안내 문구("내일부터 적용됩니다")를 서버 기준 날짜로 표시하게 한다.

### `GET /missions/recommended`

온보딩용 기본 목록. 루틴 공유가 Phase 3라 MVP에는 공유된 루틴이 없다.

---

## 7. 사용자

### `GET /users/me`

```json
{
  "id": "us_01",
  "nickname": "문성진",
  "imageUrl": "https://...",
  "bio": "...",
  "timezone": "Asia/Seoul",
  "summary": {
    "total":  { "count": 127, "win": 94, "draw": 5, "lose": 28, "winRate": 0.740 },
    "month":  { "count": 21, "win": 16, "draw": 1, "lose": 4, "winRate": 0.762 },
    "streak": { "current": 7, "longest": 12 }
  },
  "missionCount": 5
}
```

### `POST /users/me/onboarding`

```json
{
  "nickname": "문성진",
  "timezone": "Asia/Seoul",
  "missions": [ { "name": "영어 공부", "categoryId": "ct_03", "targetAmount": 30, "unit": "분",
                  "difficulty": "NORMAL", "repeat": { "type": "WEEKLY", "interval": 1, "weekdays": [1,2,3,4,5], "startDate": "2026-08-26" } } ]
}
```

닉네임·타임존·첫 미션을 **한 트랜잭션**으로 처리한다. 중간에 끊겨 미션만 있고 닉네임이 없는 상태가 생기지 않게 한다.

### `PATCH /users/me` — 타임존 변경

```json
{ "timezone": "America/New_York" }
```

**오늘부터 적용된다. 지난 기록의 날짜는 재계산하지 않는다.** (`05-screens.md` S11)

### 이미지 업로드

```
POST /users/me/image/upload-url   →  { uploadUrl, imageUrl }
PATCH /users/me                   →  { imageUrl }
```

presigned URL을 발급하고 **클라이언트가 R2로 직접 올린다.** 이미지 바이트가 API 서버를 거치지 않는다. (`03-tech-stack.md` 12장)

---

## 8. 설계 결정 요약

| # | 결정 | 이유 |
| --- | --- | --- |
| 1 | `/api/v1` 버전을 처음부터 붙인다 | 앱은 구버전이 오래 남는다 |
| 2 | "오늘"은 서버가 결정한다 | 기기 시계로 승부를 조작할 수 없게 한다 |
| 3 | `GET /today` 하나로 화면 전체를 내려준다 | 매일 여는 화면의 진입 속도 |
| 4 | 체크는 토글이 아니라 상태 지정 | 재시도해도 결과가 같아야 한다 (멱등) |
| 5 | 체크 응답에 재계산 결과를 포함한다 | 왕복 2회와 화면 불일치를 없앤다 |
| 6 | `result: "LOSE"`는 받지 않는다 | 패배는 자정 정산이 확정한다 |
| 7 | `editable` 여부를 서버가 판단한다 | 클라이언트 시계에 좌우되지 않게 한다 |
| 8 | 잔디는 빈 날짜까지 서버가 채운다 | 클라이언트마다 윤년·타임존 처리가 갈린다 |
| 9 | 응답을 래핑하지 않는다 | Swagger 타입이 단순해진다 |
| 10 | 이미지 업로드는 presigned URL | 이미지 트래픽이 API 서버를 거치지 않는다 |

---

## 9. 구현 상태 (2026-08-27)

| 엔드포인트 | 상태 |
| --- | --- |
| `GET /health` | ✅ DB 연결까지 확인 |
| `GET /categories` | ✅ |
| `GET · POST · PATCH · DELETE /missions` | ✅ |
| `GET /today` | ✅ 미션·요약·수정 가능한 날까지 한 응답 |
| `PATCH /daily-missions/:id` | ✅ 재계산 결과 함께 반환 · 7일 잠금 |
| `PUT /daily-records/:date/reflection` | ✅ |
| `GET /records/grass · calendar · stats · :date` | ✅ 집계 raw SQL |
| 자정 정산 배치 | ✅ 매시 정각, 멱등 |
| `POST /auth/social/:provider` · `refresh` · `logout` | ✅ 카카오 · 구글 |
| 전역 `JwtAuthGuard` | ✅ `@Public()` 만 열려 있다 |

**토큰**

| | 수명 | 보관 | 저장 |
| --- | --- | --- | --- |
| access | 30분 | 메모리 (웹) | 저장 안 함 |
| refresh | 90일, 쓸 때마다 회전 | httpOnly 쿠키 (웹) / SecureStore (앱) | **해시**로 DB 저장 |

refresh 는 불투명 랜덤 값이며 평문을 저장하지 않는다. DB 가 유출돼도 토큰을 쓸 수 없다.
회전 직후 1분은 이전 토큰도 받는다 — 동시 요청과 재시도는 정상 상황이다.
유예를 넘긴 재사용은 탈취로 보고 그 사용자의 모든 세션을 끊는다.

Swagger: `http://localhost:4000/api/v1/docs`

---

## 10. 다음 단계

- Swagger 설정 (`@nestjs/swagger`) — 이 문서와 실제 스펙이 어긋나지 않게 코드에서 생성
- 집계 raw SQL 구현 (`records/*`)
- `packages/core` 판정 함수 + 테스트
- 자정 정산 배치 (`06-database.md` 7장)
