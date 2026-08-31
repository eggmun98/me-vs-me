import { z } from "zod";

/**
 * 부팅 시점에 검증한다. 누락되면 즉시 죽는 편이
 * 런타임 중간에 undefined 로 터지는 것보다 낫다. (03-tech-stack.md 10장)
 */
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().min(1, "DATABASE_URL 이 필요합니다."),

  // 인증
  JWT_ACCESS_SECRET: z.string().min(32, "JWT_ACCESS_SECRET 은 32자 이상이어야 합니다."),
  JWT_REFRESH_SECRET: z.string().min(32, "JWT_REFRESH_SECRET 은 32자 이상이어야 합니다."),
  OAUTH_REDIRECT_BASE: z.string().url().default("http://localhost:3000"),
  /**
   * 웹 말고 다른 콜백 주소를 허용할 때 쓴다. 쉼표로 구분한다.
   * 앱은 `nadaena://auth/callback/kakao` 같은 커스텀 스킴으로 돌아온다.
   */
  OAUTH_ALLOWED_REDIRECT_URIS: z.string().optional(),

  KAKAO_REST_API_KEY: z.string().optional(),
  KAKAO_CLIENT_SECRET: z.string().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  /**
   * 앱이 보낸 ID 토큰의 `aud` 로 허용할 값. 쉼표로 구분한다.
   * `GOOGLE_CLIENT_ID` 는 항상 허용되므로 iOS 클라이언트 ID 만 추가하면 된다.
   */
  GOOGLE_ALLOWED_AUDIENCES: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

export function loadEnv(): Env {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");

    throw new Error(`환경변수가 올바르지 않습니다.\n${issues}`);
  }

  return parsed.data;
}
