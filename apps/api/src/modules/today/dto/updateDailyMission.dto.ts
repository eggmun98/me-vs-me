import { ApiProperty } from "@nestjs/swagger";
import { IsIn } from "class-validator";

/**
 * 토글이 아니라 상태를 지정한다. 재시도해도 결과가 같아야 한다. (07-api.md 4장)
 * LOSE 는 받지 않는다. 패배는 자정 정산이 확정한다.
 */
const ALLOWED = ["WIN", "PENDING"] as const;

export class UpdateDailyMissionDto {
  @ApiProperty({ enum: ALLOWED })
  @IsIn(ALLOWED)
  result!: (typeof ALLOWED)[number];
}
