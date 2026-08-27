import { Body, Controller, Get, Param, Patch, Put } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { UpdateDailyMissionDto } from "./dto/updateDailyMission.dto";
import { UpdateReflectionDto } from "./dto/updateReflection.dto";
import { TodayService } from "./today.service";

@ApiTags("today")
@Controller()
export class TodayController {
  constructor(private readonly todayService: TodayService) {}

  @Get("today")
  @ApiOperation({ summary: "오늘 화면 전체 — 파라미터 없음. 오늘은 서버가 정한다" })
  getToday() {
    return this.todayService.getToday();
  }

  @Patch("daily-missions/:id")
  @ApiOperation({ summary: "미션 체크 — 토글이 아니라 상태 지정" })
  updateMissionResult(@Param("id") id: string, @Body() dto: UpdateDailyMissionDto) {
    return this.todayService.updateMissionResult(id, dto.result);
  }

  @Put("daily-records/:date/reflection")
  @ApiOperation({ summary: "한 줄 회고" })
  updateReflection(@Param("date") date: string, @Body() dto: UpdateReflectionDto) {
    return this.todayService.updateReflection(date, dto.reflection);
  }
}
