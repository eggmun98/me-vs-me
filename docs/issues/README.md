# 이슈 기록

막혔던 문제와 그 원인을 남긴다. **증상이 아니라 원인으로 찾을 수 있게** 쓴다.

| 문서 | 한 줄 |
| --- | --- |
| [01-eas-dynamic-config.md](./01-eas-dynamic-config.md) | `app.config.ts` 는 코드라서 eas-cli 가 값을 못 써넣는다 |
| [02-android-kakao-maven.md](./02-android-kakao-maven.md) | 카카오 SDK 는 Maven Central 에 없다 |
| [03-android-splash-drawable.md](./03-android-splash-drawable.md) | `expo-splash-screen` 이 `image` 없이 기본 이미지를 지운다 |
| [04-react-query-duplicate-context.md](./04-react-query-duplicate-context.md) | CJS·ESM 진입점이 갈려 Context 가 두 벌 생긴다 |
| [05-stale-api-build.md](./05-stale-api-build.md) | 나흘 된 `dist` 프로세스가 떠 있었다 |
| [06-android-emulator-networking.md](./06-android-emulator-networking.md) | 에뮬레이터에서 `localhost` 는 에뮬레이터 자신이다 |
| [07-social-login-console-setup.md](./07-social-login-console-setup.md) | 카카오 키 해시 형식, 구글 URL 스킴, EAS 환경변수 |

## 쓰는 방식

- **증상 → 원인 → 근거 → 해결** 순서로 적는다. 근거는 실제 로그와 명령 출력을 붙인다.
- 틀린 가설도 남긴다. 왜 아니었는지가 다음 사람에게 시간을 아껴준다. (04 번)
- 추측으로 끝내지 않는다. 번들을 뜯든 프로세스를 조회하든 **확인한 것만** 원인으로 적는다.
