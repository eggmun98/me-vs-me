# EAS CLI 가 `app.config.ts` 에 값을 써넣지 못한다

> 2026-08-31 · 앱 첫 빌드

## 증상

`eas build` 가 단계마다 다른 이유로 죽는다. 매번 "이 값을 설정에 추가하라"는 안내가 나온다.

```
Cannot automatically write to dynamic config at: app.config.ts
    Error: build command failed.
```

네 번 걸렸다.

| 요구한 값 | 죽은 단계 |
| --- | --- |
| `extra.eas.projectId` | EAS 프로젝트 연결 |
| `updates.url` | `expo-updates` 설치 직후 |
| `ios.infoPlist.ITSAppUsesNonExemptEncryption` | 암호화 수출 규정 신고 |
| — | `autoIncrement option is not supported when using app.config.js` |

## 원인

`app.json` 은 정적 JSON 이라 CLI 가 키를 찾아 끼워 넣을 수 있다.
`app.config.ts` 는 **함수를 실행해 설정을 만드는 코드**라 CLI 가 어디에 무엇을 넣어야 할지 알 수 없다.

`autoIncrement` 도 같은 뿌리다. `cli.appVersionSource` 가 `local` 이면 EAS 가 올린 빌드 번호를
설정 파일에 **되써야** 하는데, 동적 설정에는 쓸 수 없어서 아예 거부한다.

## 해결

값을 직접 적었다. 빌드 번호는 EAS 서버가 들고 있게 바꿨다.

```jsonc
// eas.json
"cli": { "appVersionSource": "remote" }
```

```ts
// app.config.ts
owner: "eggmun",
ios: { infoPlist: { ITSAppUsesNonExemptEncryption: false } },
updates: { url: "https://u.expo.dev/<projectId>" },
extra: { eas: { projectId: "<projectId>" } },
```

## 삽질한 지점

암호화 플래그를 `ios.config.usesNonExemptEncryption` 에 먼저 넣었다.
둘 다 같은 Info.plist 키로 번역되지만 **eas-cli 는 `infoPlist` 만 들여다봐서** 계속 다시 물었다.
`expo config --type public` 에는 `ios.config` 가 안 보인다 — `--type prebuild` 로 봐야 한다.

## 이 값들을 환경변수로 빼지 않는 이유

`owner` 와 `projectId` 를 `.env` 로 옮겼더니 모든 eas 명령이 죽었다.

```
EAS project not configured.
Must configure EAS project by running 'eas init' before this command can be run in non-interactive mode.
```

**`expo` CLI 는 `.env` 를 읽지만 `eas` CLI 는 읽지 않는다.** 셸에 직접 export 하면 동작한다.
비밀값도 아니다 — 업데이트 주소로 공개되고 앱 바이너리에도 들어간다. 그래서 파일에 두기로 했다.
