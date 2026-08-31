const { getDefaultConfig } = require("expo/metro-config");
const path = require("node:path");

/**
 * 모노레포 + pnpm 설정. (04-folder-convention.md 5장)
 *
 * Metro 는 기본적으로 앱 폴더 밖을 보지 않는다.
 * `packages/core` 와 `packages/api-client` 를 고치면 앱이 바로 다시 뜨도록 감시 폴더를 넓히고,
 * pnpm 이 루트에 올려둔 node_modules 도 해석 경로에 넣는다.
 */
const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];

/**
 * `disableHierarchicalLookup` 은 켜지 않는다.
 *
 * npm·yarn 처럼 의존성이 평평하게 올라오는 구조에서는 켜는 게 맞다.
 * pnpm 은 `.pnpm/<패키지>/node_modules` 안에 각자의 의존성을 숨겨두기 때문에,
 * 상위 폴더 탐색을 끄면 `expo` 가 자기 `expo-modules-core` 를 못 찾는다.
 */

/**
 * 한 벌만 존재해야 하는 패키지들.
 *
 * `packages/api-client` 는 CommonJS 로 빌드된다(`tsconfig.build.json`). 그래서 Metro 가
 * 그 안의 `require` 를 해석할 때 **`require` 조건**으로 `@tanstack/react-query` 의
 * `.cjs` 진입점을 고르고, ESM 인 앱 코드는 **`import` 조건**으로 `.js` 진입점을 고른다.
 * 같은 패키지인데 파일이 달라 모듈이 두 벌 만들어진다.
 *
 * 그러면 Provider 가 만든 Context 와 훅이 읽는 Context 가 달라져 `No QueryClient set` 이
 * 난다. react 가 두 벌이면 훅 자체가 깨진다.
 *
 * 그래서 이 패키지들만 **앱 기준 · ESM 진입점**으로 고정한다. 공유 패키지의 빌드 형식을
 * 바꾸면 웹까지 영향을 받으므로 해석 단계에서만 손댄다.
 */
const SINGLETONS = new Set(["react", "react-dom", "@tanstack/react-query"]);

/** 앱 폴더에서 해석한 것처럼 만들기 위한 기준점. 실제로 존재하는 파일이어야 한다. */
const appAnchor = path.join(projectRoot, "package.json");

const upstreamResolveRequest = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  const packageName = moduleName.startsWith("@")
    ? moduleName.split("/").slice(0, 2).join("/")
    : moduleName.split("/")[0];

  const resolve = upstreamResolveRequest ?? context.resolveRequest;

  if (!SINGLETONS.has(packageName)) return resolve(context, moduleName, platform);

  return resolve(
    {
      ...context,
      originModulePath: appAnchor,
      // `require` 를 빼야 CJS 쪽에서도 같은 ESM 파일로 모인다.
      unstable_conditionNames: ["react-native", "import"],
    },
    moduleName,
    platform,
  );
};

module.exports = config;
