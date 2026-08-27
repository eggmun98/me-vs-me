import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  ArrayMaxSize,
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  Matches,
  Max,
  Min,
} from "class-validator";

const REPEAT_TYPES = ["ONCE", "DAILY", "WEEKLY", "MONTHLY", "YEARLY"] as const;
const MAX_INTERVAL = 999;
const LAST_WEEK_ORDER = -1;

/** core 의 RepeatPayload 와 같은 모양. 평평해서 검증과 컬럼 매핑에 편하다. */
export class RepeatDto {
  @ApiProperty({ enum: REPEAT_TYPES })
  @IsIn(REPEAT_TYPES)
  type!: (typeof REPEAT_TYPES)[number];

  @ApiPropertyOptional({ default: 1, minimum: 1, maximum: MAX_INTERVAL })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(MAX_INTERVAL)
  interval: number = 1;

  @ApiPropertyOptional({ description: "0=일 … 6=토", example: [1, 2, 3, 4, 5] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(7)
  @IsInt({ each: true })
  @Min(0, { each: true })
  @Max(6, { each: true })
  weekdays: number[] = [];

  @ApiPropertyOptional({ description: "1~5 또는 -1(마지막 주)" })
  @IsOptional()
  @IsInt()
  @Min(LAST_WEEK_ORDER)
  @Max(5)
  weekOrder: number | null = null;

  @ApiPropertyOptional({ minimum: 1, maximum: 31 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(31)
  monthDay: number | null = null;

  @ApiPropertyOptional({ minimum: 1, maximum: 12 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(12)
  month: number | null = null;

  @ApiProperty({ example: "2026-08-26" })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: "startDate 는 YYYY-MM-DD 형식이어야 합니다." })
  startDate!: string;
}
