import { PartialType } from "@nestjs/swagger";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsOptional } from "class-validator";
import { CreateMissionDto } from "./createMission.dto";

export class UpdateMissionDto extends PartialType(CreateMissionDto) {
  @ApiPropertyOptional({ description: "비활성화하면 내일부터 승부에서 빠진다." })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
