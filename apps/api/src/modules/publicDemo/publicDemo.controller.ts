import { Controller, Get, ParseIntPipe, Query } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { Public } from "@/common/publicRoute.decorator";
import { PublicDemoService } from "./publicDemo.service";

@ApiTags("public")
@Controller("public/demo")
export class PublicDemoController {
  constructor(private readonly demo: PublicDemoService) {}

  @Public()
  @Get("tour")
  @ApiOperation({ summary: "둘러보기 — 로그인 없이 보는 데모 계정 기록" })
  getTour() {
    return this.demo.getTour();
  }

  @Public()
  @Get("grass")
  @ApiOperation({ summary: "둘러보기 — 연간 잔디" })
  getGrass(@Query("year", ParseIntPipe) year: number) {
    return this.demo.getGrass(year);
  }
}
