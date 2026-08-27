import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { fromDateOnly } from "@/common/dateOnly";
import { PrismaService } from "@/prisma/prisma.service";
import { DailyService } from "./daily.service";

/**
 * 자정 정산.
 *
 * 타임존이 사용자마다 달라 "자정"이 하나가 아니다.
 * 매시 정각에 돌면서 그 시각에 자정을 지난 사용자만 처리한다. (06-database.md 7장)
 *
 * 접속하지 않은 날도 기록이 남아야 한다. 미션이 있었는데 안 했으면 패다.
 * 배치가 없으면 그날이 통째로 비고 전적이 어긋난다.
 *
 * 여러 번 돌아도 결과가 같다. `settled_at` 이 있으면 건너뛴다.
 */
@Injectable()
export class SettlementService {
  private readonly logger = new Logger(SettlementService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly daily: DailyService,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async settleAllUsers(at: Date = new Date()): Promise<{ settled: number }> {
    const users = await this.prisma.user.findMany({
      where: { deletedAt: null },
      select: { id: true, timezone: true },
    });

    let settled = 0;

    for (const user of users) {
      const today = this.daily.resolveToday(user.timezone, at);
      const yesterday = shiftDate(today, -1);

      if (await this.isSettled(user.id, yesterday)) continue;

      await this.daily.settleDay(user.id, yesterday);
      await this.daily.ensureDailyMissions(user.id, today);
      settled += 1;
    }

    if (settled > 0) this.logger.log(`정산 완료: ${settled}명`);

    return { settled };
  }

  private async isSettled(userId: string, date: string): Promise<boolean> {
    const record = await this.prisma.dailyRecord.findUnique({
      where: { userId_date: { userId, date: fromDateOnly(date) } },
      select: { settledAt: true },
    });

    return record?.settledAt !== null && record?.settledAt !== undefined;
  }
}

function shiftDate(isoDate: string, days: number): string {
  const shifted = new Date(`${isoDate}T00:00:00Z`);
  shifted.setUTCDate(shifted.getUTCDate() + days);

  return shifted.toISOString().slice(0, 10);
}
