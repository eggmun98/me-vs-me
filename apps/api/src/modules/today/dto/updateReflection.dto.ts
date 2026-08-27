import { ApiProperty } from "@nestjs/swagger";
import { IsString, MaxLength } from "class-validator";

export class UpdateReflectionDto {
  @ApiProperty({ example: "알고리즘은 못 했지만 운동과 영어는 계획대로 끝냈다." })
  @IsString()
  @MaxLength(500)
  reflection!: string;
}
