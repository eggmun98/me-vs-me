import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { CreateMissionDto } from "./dto/createMission.dto";
import { UpdateMissionDto } from "./dto/updateMission.dto";
import { MissionService, type MissionResponse } from "./mission.service";

@ApiTags("missions")
@Controller("missions")
export class MissionController {
  constructor(private readonly missionService: MissionService) {}

  @Get()
  @ApiOperation({ summary: "미션 목록 (활성 / 비활성)" })
  findAll() {
    return this.missionService.findAll();
  }

  @Post()
  @ApiOperation({ summary: "미션 생성 — 오늘부터 반영된다" })
  create(@Body() dto: CreateMissionDto): Promise<MissionResponse> {
    return this.missionService.create(dto);
  }

  @Patch(":id")
  @ApiOperation({ summary: "미션 수정" })
  update(@Param("id") id: string, @Body() dto: UpdateMissionDto): Promise<MissionResponse> {
    return this.missionService.update(id, dto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "미션 삭제 — 오늘 승부에는 남고 내일부터 빠진다" })
  remove(@Param("id") id: string): Promise<{ appliedFrom: string }> {
    return this.missionService.remove(id);
  }
}
