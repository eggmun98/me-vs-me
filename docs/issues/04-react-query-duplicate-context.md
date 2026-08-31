# `No QueryClient set` — react-query 가 두 벌 들어간다

> 2026-08-31 · 모바일

## 증상

`QueryClientProvider` 가 최상단에 멀쩡히 걸려 있는데도 화면이 뜨자마자 터진다.

```
ERROR  [Error: No QueryClient set, use QueryClientProvider to set one]
```

웹은 멀쩡하고 앱만 그랬다.

## 두 번 잘못 짚었다

### 1차 — react 버전이 갈려 있었다 (맞지만 부족했다)

```
react@19.2.3  ← apps/mobile
react@19.2.8  ← apps/web, packages/api-client(devDep)
```

pnpm 은 peer 를 버전별로 키잉하므로 `@tanstack+react-query@5.102.6_react@19.2.3` 과
`..._react@19.2.8` **두 벌**이 깔려 있었다. 웹이 멀쩡했던 이유도 이걸로 설명된다 —
웹은 19.2.8 이라 api-client 와 키가 같았다.

루트 `pnpm.overrides` 로 19.2.3 에 고정했다. store 사본은 하나로 줄었는데 **증상은 그대로였다.**

### 2차 — pnpm 심링크 경로 (틀렸다)

Metro 가 심링크를 realpath 로 합치지 않아 중복된다고 봤다. 확인해보니 realpath 는 이미 동일했다.

## 진짜 원인

번들을 직접 뜯어서 문자열을 셌다.

```bash
grep -o "No QueryClient set" ios.bundle | wc -l    # → 2
```

두 사본의 경로를 뽑아보니 **같은 디렉터리의 다른 진입점**이었다.

```
.../build/modern/QueryClientProvider.cjs   ← api-client(CJS)가 require 조건으로 가져옴
.../build/modern/QueryClientProvider.js    ← 앱(ESM)이 import 조건으로 가져옴
```

`packages/api-client/tsconfig.build.json` 이 `module: "commonjs"` 라 `dist` 가 CJS 로 나온다.
Metro 는 그 안의 `require` 를 **`require` 조건**으로 해석해 `.cjs` 를 고르고,
ESM 인 앱 코드는 **`import` 조건**으로 `.js` 를 고른다.
파일이 다르니 모듈도 다르고, Provider 가 만든 Context 와 훅이 읽는 Context 가 갈렸다.

## 해결

싱글턴이어야 하는 패키지만 **앱 기준 · ESM 진입점**으로 고정했다. (`apps/mobile/metro.config.js`)

```js
const SINGLETONS = new Set(["react", "react-dom", "@tanstack/react-query"]);
// ...
unstable_conditionNames: ["react-native", "import"]   // require 를 빼서 CJS 쪽도 같은 파일로 모은다
```

공유 패키지의 빌드 형식을 ESM 으로 바꾸는 방법도 있었지만 웹까지 영향을 받아 해석 단계에서만 손댔다.

## 검증

```bash
npx expo export -p ios --dev --no-bytecode --output-dir /tmp/out
grep -o "No QueryClient set" /tmp/out/_expo/static/js/ios/*.js | wc -l    # → 1
```

## 교훈

**Provider 가 걸려 있는데 Context 를 못 찾으면 사본 수를 세라.** 추측하지 말고 번들을 뜯는다.
`--clear` 를 해도 번들 크기가 바이트 단위로 같으면 Metro 가 캐시를 준 것이다.
