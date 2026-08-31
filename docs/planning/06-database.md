# DB 스키마 — MVP

> v0.2 (2026-08-27)
> PostgreSQL + Prisma. 범위는 **MVP만**.
> 기준: `01-service-plan.md` v0.3 확정 규칙, `05-screens.md` v0.1

---

## 1. 설계 원칙

### 1.1 하루 안에서 닫히는 값은 저장, 여러 날에 걸친 집계는 계산

7일 소급 수정(6.7) 때문에 과거가 바뀔 수 있다. 그래서 집계를 저장하면 무효화 대상이 계속 늘어난다.

| 값 | 처리 | 이유 |
| --- | --- | --- |
| 그날의 승패 · 달성률 | **저장** | 하루 안에서 닫힌다. 재계산 범위가 그 하루뿐 |
| 연승 · 승률 · 통산 전적 · 시즌 | **계산** | 여러 날에 걸쳐 있어 한 번의 수정이 전체에 번진다 |

연승과 승률을 저장했다가 재계산이 한 번 어긋나면 **화면마다 다른 숫자가 뜬다.** 그게 이 서비스에서 가장 신뢰를 깎는 버그다.

계산으로 가도 되는 근거: 사용자당 연 365행이다. 몇 년을 써도 1,000행 남짓이라 윈도우 함수로 즉시 나온다.

### 1.2 그날의 기록은 미션 정의와 분리한다

미션 이름을 `영어 공부 30분` → `영어 공부 1시간`으로 바꾸면, **과거 기록까지 1시간으로 보인다.** 3개월 전에 30분 하고 이긴 날이 1시간 한 날로 둔갑한다.

→ `daily_missions`에 그날의 **이름·목표량·난이도를 복사해 둔다.**

같은 이유로 미션은 **soft delete**한다. 삭제해도 과거 기록과 미션별 통계가 살아 있어야 한다.

### 1.3 네이밍: DB는 snake_case

집계 쿼리를 raw SQL로 직접 쓰기 때문에(`03-tech-stack.md` 7장) DB 이름이 그대로 눈에 들어온다.

- Prisma 모델 `PascalCase`, 필드 `camelCase`
- 실제 테이블·컬럼은 `@@map` / `@map`으로 **snake_case**

---

## 2. ERD

```
User ─┬─< AuthProvider          로그인 수단 (구글/카카오)
      ├─< RefreshToken          기기별 세션
      ├─< Category              사용자 생성 카테고리
      ├─< Mission               미션 정의
      ├─< DailyMission          그날 확정된 승부  ← 핵심
      └─< DailyRecord           하루 결과 + 회고

Category ─< Mission
Mission  ─< DailyMission        (soft delete 후에도 유지)
```

---

## 3. 스키마

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─────────────────────────────────────────────
// 사용자 · 인증
// ─────────────────────────────────────────────

model User {
  id        String   @id @default(cuid())

  nickname  String   @unique
  imageUrl  String?  @map("image_url")
  bio       String?

  // 하루의 경계 (01-service-plan 6.4)
  timezone        String @default("Asia/Seoul")
  dayStartOffset  Int    @default(0) @map("day_start_offset")

  createdAt DateTime  @default(now()) @map("created_at")
  updatedAt DateTime  @updatedAt      @map("updated_at")
  deletedAt DateTime? @map("deleted_at")

  authProviders AuthProvider[]
  refreshTokens RefreshToken[]
  categories    Category[]
  missions      Mission[]
  dailyMissions DailyMission[]
  dailyRecords  DailyRecord[]

  @@map("users")
}

model AuthProvider {
  id     String @id @default(cuid())
  userId String @map("user_id")

  provider       AuthProviderType
  providerUserId String  @map("provider_user_id")
  email          String?

  createdAt DateTime @default(now()) @map("created_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerUserId])
  @@index([userId])
  @@map("auth_providers")
}

enum AuthProviderType {
  GOOGLE
  KAKAO
  APPLE   // 앱 출시 시 필수

  @@map("auth_provider_type")
}

model RefreshToken {
  id     String @id @default(cuid())
  userId String @map("user_id")

  tokenHash  String    @unique @map("token_hash")
  deviceInfo String?   @map("device_info")

  expiresAt DateTime  @map("expires_at")
  rotatedAt DateTime? @map("rotated_at")
  revokedAt DateTime? @map("revoked_at")
  createdAt DateTime  @default(now()) @map("created_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([expiresAt])
  @@map("refresh_tokens")
}

// ─────────────────────────────────────────────
// 미션 정의
// ─────────────────────────────────────────────

model Category {
  id     String  @id @default(cuid())
  userId String? @map("user_id")   // null이면 시스템 기본 카테고리

  name  String
  order Int     @default(0)

  createdAt DateTime @default(now()) @map("created_at")

  user     User?     @relation(fields: [userId], references: [id], onDelete: Cascade)
  missions Mission[]

  @@unique([userId, name])
  @@map("categories")
}

model Mission {
  id         String  @id @default(cuid())
  userId     String  @map("user_id")
  categoryId String? @map("category_id")

  name         String
  targetAmount Int?    @map("target_amount")   // 30, 2 …
  unit         String? // "분", "문제" …
  difficulty   Difficulty @default(NORMAL)

  // 반복 규칙 — packages/core 의 RepeatRule 과 대응한다.
  // repeatWeekOrder 가 있으면 "매월 N째 주 요일", 없으면 "매월 N일"이다.
  repeatType      RepeatType @default(DAILY) @map("repeat_type")
  repeatInterval  Int        @default(1) @map("repeat_interval")
  repeatWeekdays  Int[]      @map("repeat_weekdays")
  repeatWeekOrder Int?       @map("repeat_week_order")
  repeatMonthDay  Int?       @map("repeat_month_day")
  repeatMonth     Int?       @map("repeat_month")
  repeatStartDate DateTime   @map("repeat_start_date") @db.Date

  isActive  Boolean   @default(true) @map("is_active")
  createdAt DateTime  @default(now()) @map("created_at")
  updatedAt DateTime  @updatedAt      @map("updated_at")
  deletedAt DateTime? @map("deleted_at")

  user          User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  category      Category?      @relation(fields: [categoryId], references: [id], onDelete: SetNull)
  dailyMissions DailyMission[]

  @@index([userId, isActive, deletedAt])
  @@map("missions")
}

enum RepeatType {
  ONCE
  DAILY
  WEEKLY
  MONTHLY
  YEARLY

  @@map("repeat_type")
}

enum Difficulty {
  EASY
  NORMAL
  HARD

  @@map("difficulty")
}

// ─────────────────────────────────────────────
// 그날의 승부
// ─────────────────────────────────────────────

model DailyMission {
  id        String @id @default(cuid())
  userId    String @map("user_id")
  missionId String @map("mission_id")

  date DateTime @db.Date   // 사용자 로컬 날짜

  // 그날의 스냅샷 (미션이 나중에 바뀌어도 고정)
  name         String
  categoryName String?    @map("category_name")
  targetAmount Int?       @map("target_amount")
  unit         String?
  difficulty   Difficulty

  result      MissionResult @default(PENDING)
  completedAt DateTime?     @map("completed_at")

  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt      @map("updated_at")

  user    User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  mission Mission @relation(fields: [missionId], references: [id])

  @@unique([userId, date, missionId])
  @@index([userId, date])
  @@index([userId, missionId])
  @@map("daily_missions")
}

enum MissionResult {
  PENDING
  WIN
  LOSE

  @@map("mission_result")
}

model DailyRecord {
  id     String @id @default(cuid())
  userId String @map("user_id")

  date DateTime @db.Date

  result     DailyResult
  totalCount Int @default(0) @map("total_count")   // 그날 확정된 미션 수
  winCount   Int @default(0) @map("win_count")     // 완료한 미션 수

  reflection String?

  settledAt DateTime? @map("settled_at")   // 자정 정산 시각
  createdAt DateTime  @default(now()) @map("created_at")
  updatedAt DateTime  @updatedAt      @map("updated_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, date])
  @@index([userId, date(sort: Desc)])
  @@map("daily_records")
}

enum DailyResult {
  IN_PROGRESS
  WIN
  DRAW
  LOSE
  REST

  @@map("daily_result")
}
```

---

## 4. 기획서 34장과 다른 점

기획서의 Entity 후보를 그대로 쓰지 않은 곳과 이유.

| 기획서 | 이 스키마 | 이유 |
| --- | --- | --- |
| `Profile` 별도 | **`User`에 통합** | 1:1인데 테이블을 나누면 항상 조인해야 하고 얻는 게 없다. Phase 2 공개 설정도 컬럼 추가로 해결된다 |
| `MissionSchedule` 별도 | **`Mission` 의 반복 컬럼들** | 반복 규칙은 집계 대상이 아니라 조인이 필요 없다. 컬럼 구성이 core 의 `RepeatPayload` 와 같아 매핑이 1:1이다 |
| `Reflection` 별도 | **`DailyRecord.reflection`** | 하루에 하나뿐인 텍스트다. 1:1 분리는 조인만 늘린다 |
| — | **`Category` 추가** | 12장 카테고리. 시스템 기본 8개(`userId = null`) + 사용자 생성 |
| — | **`RefreshToken` 추가** | 무효화 가능한 세션 (`03-tech-stack.md` 8장) |

`Season` · `Achievement` · `Follow` · `Reaction` · `Challenge` · `Goal`은 **Phase 2 이후라 만들지 않는다.**

---

## 5. 핵심 테이블 설명

### 5.1 `daily_missions` — 이 서비스의 사실 기록

**하루가 시작될 때 확정되고, 그 뒤 목록이 바뀌지 않는다.** (6.5)

미션을 삭제하거나 비활성화해도 이미 만들어진 행은 남는다. 그래서 "질 것 같으면 미션을 지운다"가 통하지 않는다.

**스냅샷 필드**(`name` · `targetAmount` · `unit` · `difficulty` · `categoryName`)를 복사해 두는 이유는 1.2에 적었다. 미션 정의가 바뀌어도 과거 기록은 그날의 모습 그대로 남는다.

`missionId`는 유지한다. 미션별 성공률 통계(`05-screens.md` S6)에 필요하기 때문이다. 미션은 soft delete하므로 FK가 깨지지 않는다.

### 5.2 `daily_records` — 하루 하나

`total_count`와 `win_count`를 저장하고 **달성률은 계산한다.**

```
달성률 = win_count / total_count
```

비율을 저장하지 않는 이유는, 승리 기준이나 계산식이 바뀌었을 때 원본 수치가 남아 있어야 재계산이 가능하기 때문이다.

`result`는 저장한다. 잔디 365칸을 조회할 때 매번 판정을 다시 하지 않기 위해서다. 체크가 바뀌면 **같은 트랜잭션에서 갱신**한다.

`REST`(쉬는 날)도 행으로 남긴다. 그래야 "쉰 날"과 "가입 전"이 구분된다.

### 5.3 날짜 타입 — `DATE`와 `timestamptz`를 구분한다

| 대상 | 타입 | 이유 |
| --- | --- | --- |
| `date` | **`DATE`** | 사용자 로컬 날짜. "8월 26일"은 타임존과 무관한 개념이다 |
| `completedAt` · `settledAt` | **`timestamptz`** | 실제 발생 시각. UTC로 저장한다 |

**하루의 경계는 로컬, 이벤트 시각은 절대시각.** 이걸 섞으면 타임존이 다른 사용자의 잔디가 하루씩 밀린다.

로컬 날짜 계산은 `packages/core/day`가 담당하고, 서버는 그 결과를 받아 `DATE`로 저장한다.

---

## 6. 인덱스

| 인덱스 | 쓰이는 곳 |
| --- | --- |
| `daily_records (user_id, date DESC)` | 연승 계산, 최근 기록 조회 |
| `daily_records (user_id, date)` unique | 잔디 · 캘린더 |
| `daily_missions (user_id, date)` | 오늘 화면 |
| `daily_missions (user_id, mission_id)` | 미션별 성공률 |
| `missions (user_id, is_active, deleted_at)` | 미션 목록, 스냅샷 생성 |
| `auth_providers (provider, provider_user_id)` unique | 로그인 |

**잔디는 `generate_series`로 날짜를 만들고 `daily_records`를 LEFT JOIN 한다.** 기록 없는 날까지 365칸을 채워야 하기 때문이다. (`03-tech-stack.md` 3장에서 Postgres를 고른 이유)

---

## 7. 정산 배치

타임존이 사용자마다 달라 "자정"이 하나가 아니다.

**매시 정각에 실행하고, 그 시각에 자정을 지난 타임존의 사용자만 처리한다.**

```
1. 어제 daily_missions 가 없으면 생성          (접속하지 않은 사용자)
2. PENDING → LOSE 확정
3. daily_record 갱신 · settled_at 기록
4. 오늘 daily_missions 생성 (요일에 해당하는 활성 미션)
```

**접속하지 않은 날도 기록이 남아야 한다.** 미션이 있었는데 안 했으면 패배다. 배치가 없으면 그날이 통째로 비고 전적이 비어 버린다.

오늘치 생성을 배치에서 같이 하는 이유는, 사용자가 접속하는 시점에 만들면(lazy) **생성 경로가 둘이 되어 규칙이 갈리기 쉽기** 때문이다.

> `@nestjs/schedule`을 쓰는 이유가 이것이다. (`03-tech-stack.md` 4장)

---

## 8. 주의사항

### 8.1 승리 기준을 바꾸면 과거를 재계산해야 한다

`daily_records.result`가 저장값이므로, 50% 기준이 바뀌면 **전체 재계산이 필요하다.**

`total_count`와 `win_count`를 남겨둔 덕에 재계산 자체는 가능하다. 다만 마이그레이션 작업이므로 가볍게 바꿀 수 없다.

→ 기준은 코드 상수(`packages/core`)로 한 곳에만 둔다.

### 8.2 7일 잠금은 컬럼이 아니라 계산이다

`date + 7일`로 판정한다. 컬럼을 두지 않는 이유는, 정책이 바뀌었을 때 이미 저장된 값이 남아 서로 다른 규칙이 섞이기 때문이다.

### 8.3 닉네임 unique는 지금 걸어둔다

Phase 2 공개 프로필이 `/@닉네임` 경로를 쓴다. 나중에 걸려면 이미 중복된 데이터를 정리해야 한다.

### 8.4 `Mission.deletedAt`과 `isActive`는 다르다

| 필드 | 의미 | 오늘 승부 |
| --- | --- | --- |
| `isActive = false` | 잠시 쉼. 목록에 남음 | 내일부터 제외 |
| `deletedAt != null` | 삭제. 목록에서 사라짐 | 내일부터 제외 |

둘 다 **오늘 것은 이미 만들어졌으므로 빠지지 않는다.** (6.5)

---

## 9. 변경에 얼마나 견디는가

스키마는 나중에 바꾸는 비용이 가장 큰 부분이라 미리 점검한다.

**원칙: 컬럼 추가와 테이블 추가는 싸다. 테이블을 쪼개거나 합치는 것은 비싸다.**

### 9.1 Phase 2·3 기능을 대조한 결과

| 기능 | 필요한 변경 | 비용 |
| --- | --- | --- |
| 시즌 · 업적 · 팔로우 · 응원 · 친구 대결 · 장기 목표 | 새 테이블 추가 | 낮음 |
| 공개 설정 | `users` 컬럼 추가 | 낮음 |
| 랭킹 | 계산 또는 집계 테이블 추가 | 낮음 |
| 루틴 공유 | 새 테이블 + `missions.source_routine_id` | 낮음 |
| 알림 (푸시) | 새 테이블 (기기 토큰) | 낮음 |
| 앱 (React Native) | **없음** | — |

**기존 테이블을 재구성해야 하는 기능이 없다.**

### 9.2 실제로 바뀔 수 있는 것

| 시나리오 | 대응 | 비용 |
| --- | --- | --- |
| 부분 달성 도입 | `daily_missions.actual_amount` 컬럼 추가 (과거는 null) | 낮음 |
| 승리 기준 변경 | `result` 재계산 — `total_count` · `win_count`가 원본이라 가능 | 중간 |
| ~~반복 규칙 확장~~ | **완료** — 구글 캘린더식 반복(일/주/월/년 + 맞춤)을 컬럼 추가로 반영했다 | — |

> `MissionSchedule` 테이블을 만들지 않은 것이 걸릴 수 있으나,
> **"주 3회" 같은 반복은 이 서비스 모델과 구조적으로 맞지 않는다.** 어느 날 승부가 열리는지 정해져야 하는데 횟수 기반 반복은 날짜가 정해지지 않는다.
> 요일 기반이 이 서비스에서는 맞는 선택이다.

### 9.3 유일하게 대비가 필요한 지점 — `daily_records.result`

`result`는 저장값이다. 판정 규칙이 바뀌면 **저장된 값이 전부 옛 규칙**이 된다.

**대비: 재계산 함수를 처음부터 하나만 둔다.**

```
recalculateDailyRecord(userId, date)
```

- 미션을 체크할 때 호출
- 소급 수정할 때 호출
- 자정 정산에서 호출
- **규칙이 바뀌면 전체를 순회하며 이것만 호출**

경로가 하나로 모여 있으면 규칙 변경이 마이그레이션 스크립트 한 번으로 끝난다.
없으면 그때 가서 새로 만들게 되고, 기존 판정 로직과 미묘하게 달라진다.

판정 자체는 `packages/core`의 순수 함수를 쓰고, 이 함수는 조회·저장만 담당한다.

### 9.4 일부러 유연하게 만들지 않은 것

`jsonb`로 설정을 담거나 EAV 구조를 두지 않았다.

지금 필요 없는 유연성은 **쿼리도 못 하고 타입도 안 잡히는 비용**만 남긴다. 이 서비스의 집계는 전부 SQL로 도는데, 값이 `jsonb` 안에 있으면 인덱스도 통계도 어려워진다.

컬럼 추가로 해결되는 변경이라면 그때 추가하는 편이 싸다.

---

## 10. 다음 단계

- 시스템 기본 카테고리 8개 seed
- 추천 미션 목록 seed (`05-screens.md` S2)
- 집계 raw SQL 작성 — 잔디 / 연승 / 카테고리별 · 미션별 성공률 / 월별 승률
- API 명세 (`07-api.md`)
