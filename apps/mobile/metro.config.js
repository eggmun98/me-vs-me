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

module.exports = config;
