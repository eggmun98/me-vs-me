# 소셜 로그인이 서버에서 거부된다 — 낡은 빌드가 떠 있었다

> 2026-08-31 · API

## 증상

앱에서 카카오 로그인은 성공하는데 서버가 400 을 준다.

```
status  : 400
message : property token should not exist
          code should not be empty
          code must be a string
```

앱은 `{ token }` 을 보내는데 서버는 `code` 를 요구하고 있었다.

## 원인

**소스는 멀쩡했다.** `socialLogin.dto.ts` 에 `token?: string` 이 `@IsOptional()` 로 있다.
문제는 실행 중인 프로세스였다.

| | 내용 | 시각 |
| --- | --- | --- |
| `dist/.../socialLogin.dto.js` | `IsNotEmpty()`, `token` 필드 없음 | 8/27 15:22 |
| `src/.../socialLogin.dto.ts` | `token?` 있음, 전부 `IsOptional` | 8/27 17:05 |

```
$ ps -o pid,lstart,command -p 73238
73238 Thu Aug 27 15:23:01 2026   node dist/main.js
```

**빌드 2초 뒤에 뜬 프로세스가 나흘째 살아 있었다.** 그 사이 소스만 고쳐졌다.

## 해결

프로세스를 죽이고 `pnpm dev:api` 로 다시 띄웠다.

```
"dev":   "nest start --watch"    ← src 를 직접 본다
"start": "node dist/main.js"     ← dist 를 읽는다. 개발 중에는 쓰지 않는다
```

## 재발 방지

개발 중에는 `pnpm start` 를 쓰지 않는다. 응답이 소스와 어긋나면 **먼저 실행 중인 프로세스의
시작 시각과 `dist` 빌드 시각을 비교한다.** 코드를 읽는 것보다 빠르다.

```bash
lsof -nP -iTCP:4000 -sTCP:LISTEN
ps -o pid,lstart,command -p <PID>
```
