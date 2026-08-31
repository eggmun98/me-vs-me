import { configureApiClient } from "@nadaena/api-client";
import { secureRefreshStore } from "@/domains/auth/secureRefreshStore";
import { env } from "./env";

/**
 * 웹과 앱의 차이는 여기 두 줄이 전부다.
 * 주소와 refresh 저장 위치만 다르고, 호출·재시도·회전 로직은 `@nadaena/api-client` 가 공유한다.
 */
configureApiClient({
  baseUrl: env.apiUrl,
  refreshTokenStore: secureRefreshStore,
});
