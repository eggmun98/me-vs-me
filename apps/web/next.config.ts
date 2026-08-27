import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // core 는 빌드 산출물이 아니라 TS 소스를 그대로 내보낸다.
  transpilePackages: ["@nadaena/core"],
};

export default nextConfig;
