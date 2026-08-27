import { Injectable } from "@nestjs/common";
import { formatLocalDate, judgeDailyResult, occursOn, toLocalDate } from "@nadaena/core";
import type { Prisma } from "@prisma/client";
import { fromDateOnly, toDateOnly } from "@/common/dateOnly";
import { PrismaService } from "@/prisma/prisma.service";
import { columnsToRule } from "@/modules/mission/repeatMapping";

@Injectable()
export class DailyService {
  constructor(private readonly prisma: PrismaService) {}

  /** 그 사용자에게 오늘이 며칠인가. 기기 시계가 아니라 서버가 정한다. (07-api.md 1.3) */
  resolveToday(timezone: string, at: Date = new Date()): string {
    return formatLocalDate(toLocalDate(at, timezone));
  }

  /**
   * 그날의 승부를 확정한다. 없으면 만들고, 이미 있으면 건드리지 않는다.
   *
   * 한 번 만들어진 뒤에는 미션을 지워도 목록이 바뀌지 않는다. (01-service-plan.md 6.5)
   * 판을 바꿔서 결과를 피할 수 없어야 한다.
   */
  async ensureDailyMissions(userId: string, date: string): Promise<void> {
    const missions = await this.prisma.mission.findMany({
      where: { userId, isActive: true, deletedAt: null },
      include: { category: { select: { name: true } } },
    });

    const existing = await this.prisma.dailyMission.findMany({
      where: { userId, date: fromDateOnly(date) },
      select: { missionId: true },
    });
    const existingIds = new Set(existing.map((row) => row.missionId));

    const rows = missions
      .filter((mission) => !existingIds.has(mission.id))
      .filter((mission) => occursOn(columnsToRule(mission), date))
      .map((mission) => ({
        userId,
        missionId: mission.id,
        date: fromDateOnly(date),
        name: mission.name,
        categoryName: mission.category?.name ?? null,
        targetAmount: mission.targetAmount,
        unit: mission.unit,
        difficulty: mission.difficulty,
      }));

    if (rows.length === 0) return;

    await this.prisma.dailyMission.createMany({ data: rows, skipDuplicates: true });
  }

  /**
   * 하루 기록을 다시 계산한다.
   *
   * 체크할 때 · 소급 수정할 때 · 자정 정산할 때 모두 이 함수를 부른다.
   * 경로가 하나로 모여 있어야 판정 규칙이 바뀌어도 한 번에 따라온다. (06-database.md 9.3)
   */
  async recalculateDailyRecord(userId: string, date: string, isSettled: boolean): Promise<void> {
    const dailyMissions = await this.prisma.dailyMission.findMany({
      where: { userId, date: fromDateOnly(date) },
      select: { result: true },
    });

    const totalCount = dailyMissions.length;
    const winCount = dailyMissions.filter((row) => row.result === "WIN").length;
    const result = resolveDailyResult({ totalCount, winCount }, isSettled);

    const data = {
      result,
      totalCount,
      winCount,
      ...(isSettled && { settledAt: new Date() }),
    } satisfies Prisma.DailyRecordUpdateInput;

    await this.prisma.dailyRecord.upsert({
      where: { userId_date: { userId, date: fromDateOnly(date) } },
      create: { userId, date: fromDateOnly(date), ...data },
      update: data,
    });
  }

  /** 자정이 지난 날을 확정한다. 미완료는 패가 된다. (01-service-plan.md 6.4) */
  async settleDay(userId: string, date: string): Promise<void> {
    await this.ensureDailyMissions(userId, date);

    await this.prisma.dailyMission.updateMany({
      where: { userId, date: fromDateOnly(date), result: "PENDING" },
      data: { result: "LOSE" },
    });

    await this.recalculateDailyRecord(userId, date, true);
  }

  toDateString(date: Date): string {
    return toDateOnly(date);
  }
}

function resolveDailyResult(
  tally: { totalCount: number; winCount: number },
  isSettled: boolean,
) {
  if (tally.totalCount === 0) return "REST" as const;
  if (isSettled) return judgeDailyResult(tally);

  // 승리는 자정 전에도 확정된다. 패배와 무승부는 자정까지 기다린다. (05-screens.md 3장)
  return tally.winCount * 2 > tally.totalCount ? ("WIN" as const) : ("IN_PROGRESS" as const);
}
