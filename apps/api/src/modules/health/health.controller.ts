import { Controller, Get } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { Public } from "@/common/publicRoute.decorator";
import { PrismaService } from "@/prisma/prisma.service";

@ApiTags("health")
@Controller("health")
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  /** 배포 파이프라인의 헬스체크가 쓴다. DB 연결까지 확인한다. (03-tech-stack.md 15장) */
  @Public()
  @Get()
  @ApiOperation({ summary: "서버와 DB 상태" })
  async check(): Promise<{ status: string; database: string }> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;

      return { status: "ok", database: "ok" };
    } catch {
      return { status: "degraded", database: "down" };
    }
  }
}
