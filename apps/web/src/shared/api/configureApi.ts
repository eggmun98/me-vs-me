import { configureApiClient } from "@nadaena/api-client";

/**
 * 웹은 refresh 를 httpOnly 쿠키로 주고받는다. 그래서 저장소를 넘기지 않는다.
 * (앱은 쿠키가 없어 SecureStore 를 넘긴다 — 그 차이만으로 같은 호출 코드를 공유한다.)
 */
configureApiClient({
  baseUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1",
});
