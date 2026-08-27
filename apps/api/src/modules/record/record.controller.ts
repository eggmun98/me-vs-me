import { Controller, Get, Param, ParseIntPipe, Query } from "@nestjs/common";
import { ApiOperation, ApiQuery, ApiTags } from "@nestjs/swagger";
import { RecordService } from "./record.service";

@ApiTags("records")
@Controller("records")
export class RecordController {
  constructor(private readonly recordService: RecordService) {}

  @Get("grass")
  @ApiOperation({ summary: "연간 잔디 — 기록 없는 날까지 채워서 내려준다" })
  @ApiQuery({ name: "year", example: 2026 })
  getGrass(@Query("year", ParseIntPipe) year: number) {
    return this.recordService.getGrass(year);
  }

  @Get("calendar")
  @ApiOperation({ summary: "월간 캘린더" })
  getCalendar(
    @Query("year", ParseIntPipe) year: number,
    @Query("month", ParseIntPipe) month: number,
  ) {
    return this.recordService.getCalendar(year, month);
  }

  @Get("stats")
  @ApiOperation({ summary: "통계 — 카테고리별 · 미션별 · 월별" })
  @ApiQuery({ name: "period", enum: ["MONTH", "ALL"], required: false })
  getStats(@Query("period") period?: "MONTH" | "ALL") {
    return this.recordService.getStats(period === "MONTH" ? "MONTH" : "ALL");
  }

  @Get(":date")
  @ApiOperation({ summary: "날짜 상세 — 수정 가능 여부는 서버가 판단한다" })
  getDay(@Param("date") date: string) {
    return this.recordService.getDay(date);
  }
}
