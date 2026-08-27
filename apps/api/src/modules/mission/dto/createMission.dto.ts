import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from "class-validator";
import { RepeatDto } from "./repeat.dto";

const DIFFICULTIES = ["EASY", "NORMAL", "HARD"] as const;

export class CreateMissionDto {
  @ApiProperty({ example: "영어 공부" })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  categoryId: string | null = null;

  @ApiPropertyOptional({ example: 30 })
  @IsOptional()
  @IsInt()
  @Min(1)
  targetAmount: number | null = null;

  @ApiPropertyOptional({ example: "분" })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  unit: string | null = null;

  @ApiPropertyOptional({ enum: DIFFICULTIES, default: "NORMAL" })
  @IsOptional()
  @IsIn(DIFFICULTIES)
  difficulty: (typeof DIFFICULTIES)[number] = "NORMAL";

  @ApiProperty({ type: RepeatDto })
  @ValidateNested()
  @Type(() => RepeatDto)
  repeat!: RepeatDto;
}
