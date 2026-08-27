# 폴더 구조 · 코드 작성 규칙

> v1.0 (2026-08-26)
> 기준: **응집도는 높이고 결합도는 낮춘다.**
> 코드 규칙은 `frontend-clean-code-guide.md`(v4)를 따르고, 이 문서는 **이 프로젝트에 적용한 결과**만 적는다.

---

## 0. 한 줄 원칙

> **한 도메인을 고칠 때 폴더 하나만 열면 된다.**
> **한 기능을 지울 때 폴더 하나만 지우면 된다.**

이 두 문장으로 판단이 안 되는 경우에만 아래 세부 규칙을 본다.

---

## 1. 왜 이렇게 잡는가 (bookbla와 다른 점)

bookbla의 `screens/<Domain>/` 안에서 `units` / `hooks`를 colocate 하는 방식은 좋다. **그대로 가져온다.**

가져오지 않는 건 `commons/`다. bookbla에서 Party 기능 하나를 고치려면 이렇게 돌아다녀야 한다.

```
screens/Party/           화면
commons/api/parties/     API
commons/store/party/     상태
commons/hooks/queries/   쿼리 훅
commons/types/           타입
```

같은 도메인이 다섯 군데에 흩어져 있다. 이건 **기술 계층 기준** 분리다(api는 api끼리, store는 store끼리). 도메인 기준이 아니다.

증상은 `commons/` 밑에 폴더가 12개까지 늘어난 것이다. "공용"이라는 이름이 붙으면 뭐든 들어가고, 새 파일을 만들 때마다 "이거 어디 두지"가 매번 고민이 된다.

→ **도메인이 먼저, 계층은 그 도메인 안에서.**

이건 클린코드 가이드의 `같이 수정되는 파일 위치 기준`과 같은 내용이다.

> 파일 위치는 파일 종류보다 변경 이유를 우선한다.
> 한 기능을 삭제할 때 관련 파일을 같이 삭제할 수 있어야 한다.

---

## 2. 레포 전체 구조

```
nadaena/
├─ apps/
│  ├─ api/          NestJS
│  ├─ web/          Vite + React
│  └─ mobile/       Expo (React Native)   ← Phase 2 이후
├─ packages/
│  ├─ core/         승패 · 달성률 · 연승 · 날짜 경계 (순수 함수)
│  ├─ types/        앱 간 공유 타입
│  └─ apiClient/    HTTP 호출 (web / mobile 공유)
└─ docs/
```

---

## 3. 도메인 목록

기획서 기준. **이 이름을 web / mobile / api에서 동일하게 쓴다.** 이름이 갈리면 대응 관계를 매번 머리로 변환해야 한다.

| 도메인 | 내용 | 도입 |
| --- | --- | --- |
| `auth` | 소셜 로그인, 토큰 | MVP |
| `user` | 프로필, 설정, 타임존 | MVP |
| `mission` | 미션 CRUD, 반복 일정 | MVP |
| `today` | 오늘의 승부, 미션 체크 | MVP |
| `record` | 잔디 · 캘린더 · 통계 | MVP |
| `reflection` | 한 줄 회고 | MVP |
| `season` | 월별 시즌 | Phase 2 |
| `achievement` | 업적 | Phase 2 |
| `ranking` | 랭킹 | Phase 2 |
| `social` | 팔로우 · 피드 · 응원 | Phase 2~3 |
| `routine` | 루틴 공유 | Phase 3 |
| `challenge` | 친구 대결 | Phase 3 |
| `goal` | 장기 목표 | Phase 3 |

`today`와 `record`를 `mission`에서 분리한 이유: **변경 이유가 다르다.** 미션 정의(무엇을 할 것인가)와 오늘의 수행(했는가), 누적 기록(어땠는가)은 서로 다른 이유로 바뀐다.

---

## 4. apps/web — Vite + React

```
apps/web/
├─ app/                  Next App Router — 라우트 (얇게)
│  ├─ layout.tsx
│  ├─ globals.css        디자인 토큰
│  ├─ page.tsx           오늘
│  ├─ record/page.tsx
│  └─ my/page.tsx
└─ src/
├─ domains/
│  ├─ mission/
│  │  ├─ MissionCard.tsx
│  │  ├─ MissionForm.tsx
│  │  ├─ MissionList.tsx
│  │  ├─ missionTypes.ts
│  │  ├─ missionConstants.ts
│  │  ├─ useMissionList.ts
│  │  └─ useCreateMission.ts
│  ├─ today/
│  │  ├─ TodayMatch.tsx
│  │  ├─ TodayMissionRow.tsx
│  │  ├─ WinLoseBadge.tsx
│  │  ├─ ProgressGauge.tsx
│  │  ├─ todayTypes.ts
│  │  └─ useTodayMatch.ts
│  └─ record/
│     ├─ grass/
│     │  ├─ GrassGrid.tsx
│     │  ├─ GrassCell.tsx
│     │  ├─ GrassDayDetail.tsx
│     │  └─ grassConstants.ts
│     ├─ calendar/
│     └─ stats/
└─ shared/
   ├─ ui/                Button, Modal, Skeleton …
   ├─ lib/               formatDate, clamp …
   └─ config/            axios, queryClient, env
```

### app/ 은 얇게

`app/`은 **라우트와 레이아웃만** 담당한다. 도메인 컴포넌트를 조합해서 배치하는 것까지가 역할이다.

로직이 들어가기 시작하면 도메인으로 내린다. `app/page.tsx`가 100줄을 넘으면 신호다.

Expo Router를 쓰는 mobile 과 같은 모양이 된다. **웹과 앱 모두 `app/`이 라우트, `src/domains/`가 기능이다.**

### 도메인 안이 커지면 한 단계만 더 판다

`record`처럼 하위 개념이 뚜렷하면 `grass/`, `calendar/`, `stats/`로 나눈다.
**그 이상은 파지 않는다.** 3단계를 넘어가면 경로가 길어져서 오히려 찾기 어려워진다.

기준은 개수가 아니라 **하위 개념이 독립적으로 변경되는가**다.

---

## 5. apps/mobile — Expo (React Native)

**Expo Router를 쓴다.** 파일 기반 라우팅이라 웹의 `pages`와 같은 모양이 된다.

```
apps/mobile/
├─ app/                  Expo Router 라우트 (얇게)
│  ├─ (tabs)/
│  │  ├─ index.tsx       오늘
│  │  ├─ record.tsx      기록
│  │  └─ my.tsx          MY
│  └─ _layout.tsx
└─ src/
   ├─ domains/           web과 같은 도메인 이름
   │  ├─ mission/
   │  ├─ today/
   │  └─ record/
   └─ shared/
      ├─ ui/
      ├─ lib/
      └─ config/
```

### 웹과 같은 구조를 유지하는 이유

**`domains/` 아래 도메인 이름과 파일 이름을 웹과 같게 맞춘다.** 웹에서 `today` 로직을 고친 사람이 앱에서 같은 걸 찾을 때 헤매지 않는다.

UI는 공유되지 않는다(RN은 DOM이 없다). **공유되는 건 계산과 API 호출뿐**이고, 그건 `packages/`로 간다.

### bookbla의 Stack 구조를 안 쓰는 이유

bookbla는 `screens/Party/PartyStack.tsx`처럼 도메인마다 네비게이터 파일을 둔다. React Navigation을 직접 쓰면 필요한 방식이다.

Expo Router는 **파일 위치가 곧 라우트**라 그 파일이 필요 없다. 라우트 정의가 `app/`에 모이고 도메인 폴더는 순수하게 기능만 남는다. 관심사가 더 깔끔하게 갈린다.

### Expo + pnpm 주의

Metro 번들러가 pnpm의 심볼릭 링크를 잘 못 씹는다. `apps/mobile`만 `node-linker=hoisted`로 두거나 Metro의 `watchFolders` / `nodeModulesPaths`를 손봐야 한다. (`03-tech-stack.md` 18장)

---

## 6. apps/api — NestJS

Nest는 모듈이 곧 도메인이라 구조가 이미 맞다.

```
apps/api/src/
├─ main.ts
├─ appModule.ts
├─ modules/
│  ├─ mission/
│  │  ├─ mission.module.ts
│  │  ├─ mission.controller.ts
│  │  ├─ mission.service.ts
│  │  ├─ dto/
│  │  │  ├─ createMission.dto.ts
│  │  │  └─ updateMission.dto.ts
│  │  └─ missionTypes.ts
│  ├─ today/
│  ├─ record/
│  │  ├─ record.module.ts
│  │  ├─ record.controller.ts
│  │  ├─ record.service.ts
│  │  └─ queries/              ← 집계 raw SQL
│  │     ├─ grassQuery.ts
│  │     ├─ streakQuery.ts
│  │     └─ categoryRateQuery.ts
│  └─ auth/
├─ common/                     guards, filters, interceptors, decorators
├─ config/                     env 검증(Zod), 설정
└─ prisma/
```

### 집계 raw SQL은 `queries/`에 모은다

`03-tech-stack.md` 7장의 결정에 따라 집계는 raw SQL로 쓴다. 이 파일들은 **한 도메인 폴더 안의 `queries/`에 모은다.**

- 느려졌을 때 어디를 튜닝할지 한눈에 보인다
- 타입이 자동으로 안 붙는 구간이라 **테스트로 덮어야 할 대상이 명확해진다**
- 서비스 코드 사이에 SQL이 흩어지지 않는다

반환 타입은 파일 안에 명시한다.

### 서비스가 다른 도메인을 필요로 할 때

컨트롤러/서비스에서 다른 모듈의 내부를 직접 import 하지 않는다. **모듈의 `exports`에 올린 것만 쓴다.**

Nest는 `imports: []`에 의존을 명시적으로 적게 만든다. 여기가 길어지면 그 모듈이 너무 많은 걸 알고 있다는 신호다.

---

## 7. packages

### `packages/core` — 이 프로젝트의 심장

서버와 클라이언트가 **같은 계산을 해야 한다.** 사용자가 체크하는 순간 화면이 즉시 갱신되려면(낙관적 UI) 클라이언트도 같은 판정을 할 수 있어야 한다.

여기가 갈라지면 **서버가 판정한 승패와 화면에 뜬 승패가 어긋난다.** 이 서비스에서 가장 치명적인 버그다.

```
packages/core/src/
├─ match/       일일 승패 판정 · 달성률        judgeDailyResult · isWinConfirmed · calculateRate
├─ streak/      연승 계산                      calculateStreak
├─ repeat/      반복 규칙                      occursOn · describeRepeat · buildRepeatPreset
└─ day/         하루 경계 · 로컬 날짜 계산     addDays · getWeekday · getDaysInMonth
```

`repeat/` 의 `occursOn` 이 정산 배치의 심장이다. 이 미션이 그날 열리는가를 판정한다.
경계 케이스(매월 31일, 다섯째 수요일, 2월 29일, 격주 기준점)가 전부 테스트로 잠겨 있다.

**규칙**
- **전부 순수 함수다.** API 호출, 스토어 접근, 날짜 `now()` 직접 호출 금지
- 현재 시각이 필요하면 **인자로 받는다.** 테스트가 가능해진다
- 이 패키지가 다른 패키지나 앱을 import 하지 않는다
- **테스트를 가장 촘촘하게 덮는다** (`03-tech-stack.md` 16장)

### 패키지 이름

npm 스코프는 도메인과 맞춘다.

```
@nadaena/core
@nadaena/types
@nadaena/apiClient
```

### `packages/types`

앱 간에 실제로 오가는 타입만 둔다. 한 도메인에서만 쓰는 타입은 그 도메인 폴더에 둔다.

### `packages/apiClient`

**아직 만들지 않았다.** 웹 하나뿐이라 지금은 이렇게 두고 있다.

```
apps/web/src/shared/api/     apiClient · QueryProvider · queryKeys
apps/web/src/domains/*/use*  도메인별 React Query 훅
```

mobile 을 붙일 때, 실제로 양쪽이 쓰는 것만 올린다. React Query 훅은 UI 가 없어서 그대로 공유된다.

> 미리 올리지 않는 이유: 사용처가 하나일 때 만든 추상화는 두 번째 사용처가 생기면 거의 항상 틀려 있다.

### 반복 규칙은 두 가지 모양을 쓴다

| 모양 | 쓰는 곳 | 이유 |
| --- | --- | --- |
| `RepeatRule` (판별 유니온) | 폼 · 판정(`occursOn`) · 문장 변환 | 분기가 타입으로 잠긴다 |
| `RepeatPayload` (평평) | API 요청 · DB 컬럼 | 검증과 컬럼 매핑이 쉽다 |

**변환은 경계에서 한 번만 한다.** 웹은 `useMissions` 에서, 서버는 `repeatMapping` 에서.
가운데 코드가 두 모양을 다 알면 어느 쪽인지 매번 확인해야 한다.

---

## 8. `shared/`에 올리는 기준

여기가 무너지면 bookbla의 `commons/`와 같아진다. **두 조건을 모두 만족해야 한다.**

1. **2개 이상 도메인이 실제로 쓰고 있다** (쓸 것 같다 ✕)
2. **특정 도메인 개념을 모른다**

```
✓ shared     Button, Modal, formatDate, clamp, apiClient
✗ shared     MissionCard, GrassGrid, WinLoseBadge, calculateWinRate
```

한 도메인에서만 쓰는데 "공용스러워 보여서" 올리는 게 가장 흔한 실수다.
**두 번째 도메인이 실제로 쓸 때 그때 올린다.**

`shared/lib`은 클린코드 가이드의 `utils.ts 기준`을 그대로 적용한다. side effect가 있는 함수는 둘 수 없다.

---

## 9. import 방향 — 결합도

```
app  →  pages  →  domains  →  shared  →  packages
```

**금지**

| 금지 | 이유 |
| --- | --- |
| `domains/a` → `domains/b` | 도메인끼리 엮이면 하나를 못 지운다 |
| `shared` → `domains` | 역방향. shared가 도메인을 알면 shared가 아니다 |
| `packages/core` → 앱 | core는 아무것도 몰라야 한다 |
| 다른 도메인의 내부 파일 직접 import | 가이드의 명시 규칙 |

**도메인을 조합해야 하면 `pages`에서 한다.**

예: 오늘 화면이 `today`와 `record`(이번 달 잔디)를 같이 보여준다면, `TodayPage`가 두 도메인 컴포넌트를 나란히 배치한다. `today`가 `record`를 import 하지 않는다.

### 규칙은 강제해야 지켜진다

말로만 두면 반드시 깨진다. **Biome의 import 제한 규칙이나 dependency-cruiser로 CI에서 막는다.** 위반하면 빌드가 깨지게 한다.

---

## 10. 파일 이름

### 도메인 프리픽스를 붙인다

```
✓  missionTypes.ts    missionConstants.ts    grassConstants.ts
✗  types.ts           constants.ts           utils.ts
```

폴더 경로에 이미 도메인이 있어도 붙인다. **에디터에 `types.ts` 탭이 여섯 개 열리면 구분이 안 된다.**

가이드의 규칙과 같다.

> `types.ts`, `constants.ts` 같은 범용 파일에 모든 타입과 상수를 계속 추가하지 않는다.
> 가능하면 파일명에 도메인이 드러나게 작성한다.

### 케이스

| 대상 | 규칙 | 예 |
| --- | --- | --- |
| 폴더 | camelCase | `mission/`, `record/grass/` |
| 컴포넌트 | PascalCase | `MissionCard.tsx` |
| 훅 | `use` + PascalCase | `useTodayMatch.ts` |
| 그 외 ts | camelCase | `missionTypes.ts`, `grassQuery.ts` |
| Nest 파일 | Nest 관례 유지 | `mission.service.ts`, `createMission.dto.ts` |

### 파일 크기

로직 파일 **150줄**을 넘으면 분리를 검토하고, 못 하면 이유를 주석으로 남긴다.
타입 / 상수 파일은 줄 수 제한 없음. 단 **도메인이 섞이면 분리한다.**

---

## 11. 어디에 둘지 헷갈릴 때

순서대로 묻는다. 처음 걸리는 데서 멈춘다.

1. **이 기능을 지울 때 같이 지워지나?** → 그 도메인 폴더
2. **한 화면에서만 쓰나?** → 그 화면 폴더
3. **한 도메인 안 여러 화면이 쓰나?** → 그 도메인 루트
4. **2개 이상 도메인이 *지금* 쓰고 있고 도메인 개념을 모르나?** → `shared`
5. **서버도 같은 계산을 하나?** → `packages/core`

**애매하면 도메인 안에 둔다.** 나중에 올리는 건 쉽고, 내리는 건 이미 여러 곳이 import 한 뒤라 어렵다.

---

## 12. 코드 작성 규칙

전체는 `frontend-clean-code-guide.md`(v4)를 따른다. 아래는 **이 서비스에 적용했을 때 특히 걸리는 것들**만 적는다.

### 12.1 승패 상태를 boolean으로 만들지 않는다

가이드의 `상태 모델링 기준` / `도메인 개념 승격 기준`이 이 프로젝트에서 가장 크게 걸리는 지점이다.

기획서 24장의 미션 상태는 **세 가지**다 — `진행 전 / WIN / LOSE`.

```ts
// ✗ 금지
type Mission = {
  isCompleted: boolean;
  isFailed: boolean;   // 둘 다 false인 "진행 전"이 표현 불가
};

// ✓ 권장
type MissionResult = 'PENDING' | 'WIN' | 'LOSE';
```

일일 승패도 같다. 휴식일(수행 요일이 아닌 날)이 있으므로 `isWin` 하나로는 부족하다.

```ts
type DailyResult = 'WIN' | 'LOSE' | 'REST' | 'IN_PROGRESS';
```

**boolean 두 개로 세 상태를 표현하려는 순간 멈춘다.** 불가능한 조합이 생기고, 그 조합을 처리하는 코드가 여기저기 붙는다.

### 12.2 승패 규칙의 숫자는 전부 상수로

가이드의 `매직 넘버 기준`. 이 서비스에선 특히 중요한데, **이 숫자들이 나중에 사용자 설정값이 되기 때문이다**(기획서 6.2).

```ts
// ✗
if (rate >= 0.8) return 'WIN';

// ✓
const DEFAULT_WIN_THRESHOLD = 0.8;
```

잔디 5구간 경계(8장)도 마찬가지다. 코드에 `0.4`, `0.6`, `0.8`이 흩어지면 나중에 구간을 바꿀 때 다 찾아다녀야 한다.

### 12.3 계산은 순수 함수, 시각은 인자로

`packages/core`의 함수는 **현재 시각을 직접 읽지 않는다.**

```ts
// ✗ 테스트 불가
function isToday(date: Date) {
  return isSameDay(date, new Date());
}

// ✓
function isSameDay(a: Date, b: Date, timezone: string) { ... }
```

이 서비스는 **날짜 경계가 핵심 로직**이다(`day_start_offset`, 타임존). `new Date()`가 함수 안에 숨으면 "새벽 3시에 어떻게 되나"를 테스트할 방법이 없어진다.

### 12.4 함수 이름으로 side effect가 보이게

가이드의 `숨은 side effect 금지 기준`.

```ts
getTodayMatch()          // 조회만
calculateWinRate()       // 계산만
applyMissionResult()     // 상태를 바꾼다
saveMissionResult()      // 저장한다
handleMissionCheck()     // 사용자 클릭을 받는다
```

`getXxx`가 저장까지 하면 안 된다. 이 서비스는 **체크 한 번에 미션 승패 → 일일 승패 → 잔디 → 전적 → 연승이 연쇄로 갱신**되므로, 어디서 무엇이 바뀌는지 이름으로 보이지 않으면 금방 추적이 안 된다.

### 12.5 코드 배치는 위에서 아래로

가이드의 `코드 배치 순서 기준`. 진입점을 위에, 그 함수가 호출하는 헬퍼를 아래에 호출 순서대로 둔다.

---

## 13. 아직 안 정한 것

- 도메인 이름의 최종 한글 대응(UI 문구)은 화면설계서에서
- `record` 하위를 `grass` / `calendar` / `stats`로 나눌지 여부는 화면설계서 이후 확정
- import 방향을 강제할 도구 (Biome 규칙 vs dependency-cruiser)
