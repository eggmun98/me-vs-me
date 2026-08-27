import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class SocialLoginDto {
  @ApiProperty({ description: "소셜 로그인에서 받은 인가 코드" })
  @IsString()
  @IsNotEmpty()
  code!: string;
}
