import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

/**
 * 웹과 앱이 같은 엔드포인트를 쓰되 들고 오는 게 다르다.
 *
 * - 웹: 리다이렉트로 받은 **인가 코드**. 교환에 client secret 이 필요해 서버가 한다.
 * - 앱: 네이티브 SDK 가 이미 받아둔 **토큰**. 교환 단계가 없다.
 *
 * 둘 중 하나만 온다. 검증은 서비스에서 한다 — 어느 쪽인지에 따라 흐름이 갈리기 때문이다.
 */
export class SocialLoginDto {
  @ApiPropertyOptional({ description: "웹 — 소셜 로그인에서 받은 인가 코드" })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({ description: "웹 — 인가 요청에 쓴 콜백 주소. 없으면 기본값을 쓴다" })
  @IsOptional()
  @IsString()
  redirectUri?: string;

  @ApiPropertyOptional({
    description: "앱 — 네이티브 SDK 토큰 (카카오는 access token, 구글은 ID token)",
  })
  @IsOptional()
  @IsString()
  token?: string;
}
