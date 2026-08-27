# nadaena — 문서

「나 VS 나」 서비스 문서 모음.

| 문서 | 내용 | 상태 |
| --- | --- | --- |
| [01-service-plan.md](./01-service-plan.md) | 서비스 기획서 (원문 1~38장 + 승패 규칙 + 팔레트) | v0.5 |
| [02-open-questions.md](./02-open-questions.md) | 확정된 규칙 + 남은 항목 | A·B·C 닫힘 |
| [03-tech-stack.md](./03-tech-stack.md) | 기술 스택 · 인프라 결정 + 근거 | v1.0 |
| [04-folder-convention.md](./04-folder-convention.md) | 폴더 구조 · 코드 작성 규칙 | v1.0 |
| [05-screens.md](./05-screens.md) | 화면설계서 (MVP) | v0.3 |
| [06-database.md](./06-database.md) | DB 스키마 (MVP) | v0.2 |
| [07-api.md](./07-api.md) | API 명세 (MVP) | v0.2 |

## 작업 순서

```
기획서 ✓ → 스택/인프라 ✓ → 폴더 규칙 ✓ → 승패 규칙 ✓
   → 화면설계서 ✓ → DB 스키마 ✓ → API 명세 ✓ → 개발
```

**설계 완료. 프론트엔드 MVP 구현 중.**

## 구현 현황 (2026-08-27)

```
nadaena/
├─ apps/web/          Next.js — MVP 화면 (아직 mock 데이터)
├─ apps/api/          NestJS + Prisma + PostgreSQL
└─ packages/core/     승패 판정 · 연승 · 반복 규칙 · 날짜  (테스트 65개)
```

| 영역 | 상태 |
| --- | --- |
| 화면 — 오늘 / 기록 / MY / 미션 / 설정 | ✅ |
| 반복 규칙 (프리셋 5 + 맞춤) | ✅ |
| API — 미션 · 오늘 · 기록 · 통계 | ✅ |
| 자정 정산 배치 | ✅ |
| **웹 ↔ API 연결** | ✅ mock 제거, React Query |
| 인증 (카카오 · 구글) | ✅ 동작 확인 완료 |
| 배포 (Oracle VM) | ⬜ |

## 소셜 로그인 설정

`apps/api/.env` 와 `apps/web/.env.local` 에 키를 넣는다. **커밋하지 않는다.**

| 콘솔 | 등록할 Redirect URI |
| --- | --- |
| [카카오](https://developers.kakao.com) | `http://localhost:3000/auth/callback/kakao` |
| [구글](https://console.cloud.google.com) | `http://localhost:3000/auth/callback/google` |

구글은 OAuth 클라이언트 유형을 **웹 애플리케이션**으로 만들어야 한다.
데스크톱 유형은 `http://localhost` 만 허용해서 콜백 경로를 등록할 수 없다.

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
pnpm test            # packages/core
```

로컬 PostgreSQL 을 쓴다. `apps/api/.env` 의 `DATABASE_URL` 을 맞춘다.
