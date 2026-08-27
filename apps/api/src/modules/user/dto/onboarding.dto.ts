import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from "class-validator";
import { CreateMissionDto } from "@/modules/mission/dto/createMission.dto";

/** 첫날에 너무 많이 만들면 승리 조건(50% 초과)이 올라가 바로 진다. (05-screens.md S2) */
const MAX_FIRST_MISSIONS = 10;

export class OnboardingDto {
  @ApiProperty({ example: "문성진" })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  nickname!: string;

  @ApiProperty({ example: "Asia/Seoul" })
  @IsString()
  @IsNotEmpty()
  timezone!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(60)
  bio?: string;

  @ApiProperty({ type: [CreateMissionDto] })
  @IsArray()
  @ArrayMinSize(1, { message: "미션을 하나 이상 만들어 주세요." })
  @ArrayMaxSize(MAX_FIRST_MISSIONS)
  @ValidateNested({ each: true })
  @Type(() => CreateMissionDto)
  missions!: CreateMissionDto[];
}
