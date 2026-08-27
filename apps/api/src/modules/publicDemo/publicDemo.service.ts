import { Injectable, NotFoundException } from "@nestjs/common";
import { calculateRate, calculateStreak, isWinConfirmed, type DailyResult } from "@nadaena/core";
import { fromDateOnly } from "@/common/dateOnly";
import { DailyService } from "@/modules/daily/daily.service";
import { selectDayRange } from "@/modules/record/queries/grassQuery";
import {
  countDailyResults,
  countMissionResults,
  selectCategoryRates,
  selectMissionRates,
  selectMonthRates,
  selectResultsInOrder,
} from "@/modules/record/queries/statsQuery";
import { PrismaService } from "@/prisma/prisma.service";

/**
 * 로그인 없이 둘러보는 화면에 쓰는 읽기 전용 데이터.
 *
 * `isDemo` 계정만 읽는다. 조건을 계정 속성으로 두면
 * 실제 사용자 데이터가 실수로 공개될 여지가 없다.
 *
 * 집계 쿼리들이 이미 userId 를 인자로 받게 되어 있어 그대로 재사용한다.
 */
@Injectable()
export class PublicDemoService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly daily: DailyService,
  ) {}

  async getTour() {
    const user = await this.findDemoUser();
    const today = this.daily.resolveToday(user.timezone);

    const [record, missions, monthGrass, dailyRows, missionRows, categoryRows, missionRates, monthRows, ordered] =
      await Promise.all([
        this.prisma.dailyRecord.findUnique({
          where: { userId_date: { userId: user.id, date: fromDateOnly(today) } },
        }),
        this.prisma.dailyMission.findMany({
          where: { userId: user.id, date: fromDateOnly(today) },
          orderBy: { createdAt: "asc" },
        }),
        selectDayRange(this.prisma, user.id, `${today.slice(0, 7)}-01`, today),
        countDailyResults(this.prisma, user.id, null),
        countMissionResults(this.prisma, user.id, null),
        selectCategoryRates(this.prisma, user.id, null),
        selectMissionRates(this.prisma, user.id, null),
        selectMonthRates(this.prisma, user.id),
        selectResultsInOrder(this.prisma, user.id),
      ]);

    const tally = {
      totalCount: record?.totalCount ?? 0,
      winCount: record?.winCount ?? 0,
    };
    const daily = toWinLoseCount(dailyRows);
    const missionWin = pick(missionRows, "WIN");
    const missionLose = pick(missionRows, "LOSE");
    const missionTotal = missionWin + missionLose;

    return {
      profile: { nickname: user.nickname, bio: user.bio },
      today: {
        date: today,
        result: record?.result ?? "REST",
        ...tally,
        rate: calculateRate(tally),
        isWinConfirmed: isWinConfirmed(tally),
        missions: missions.map((mission) => ({
          id: mission.id,
          missionId: mission.missionId,
          name: mission.name,
          categoryName: mission.categoryName,
          targetAmount: mission.targetAmount,
          unit: mission.unit,
          result: mission.result,
        })),
        reflection: record?.reflection ?? null,
        editableDates: [],
      },
      summary: {
        total: daily,
        month: { ...toWinLoseCount(dailyRows), month: today.slice(0, 7) },
        streak: calculateStreak(ordered.map((row) => row.result as DailyResult)),
        monthGrass: monthGrass.map((row) => ({
          date: row.date,
          result: (row.result as DailyResult | null) ?? "NONE",
          rate: row.totalCount ? (row.winCount ?? 0) / row.totalCount : null,
          totalCount: row.totalCount ?? 0,
          winCount: row.winCount ?? 0,
        })),
      },
      stats: {
        period: "ALL" as const,
        daily,
        mission: {
          total: missionTotal,
          win: missionWin,
          lose: missionLose,
          rate: missionTotal === 0 ? 0 : missionWin / missionTotal,
        },
        activeDays: daily.count,
        streak: calculateStreak(ordered.map((row) => row.result as DailyResult)),
        byCategory: categoryRows.map((row) => ({
          categoryName: row.label,
          total: row.total,
          win: row.win,
          rate: row.total === 0 ? 0 : row.win / row.total,
        })),
        byMission: missionRates.map((row) => ({
          missionId: row.key,
          name: row.label,
          total: row.total,
          win: row.win,
          rate: row.total === 0 ? 0 : row.win / row.total,
        })),
        byMonth: monthRows.map((row) => ({
          month: row.month,
          winRate: row.total === 0 ? 0 : row.win / row.total,
        })),
      },
    };
  }

  async getGrass(year: number) {
    const user = await this.findDemoUser();
    const rows = await selectDayRange(this.prisma, user.id, `${year}-01-01`, `${year}-12-31`);

    return {
      year,
      days: rows.map((row) => ({
        date: row.date,
        result: (row.result as DailyResult | null) ?? "NONE",
        rate: row.totalCount ? (row.winCount ?? 0) / row.totalCount : null,
        totalCount: row.totalCount ?? 0,
        winCount: row.winCount ?? 0,
      })),
    };
  }

  private async findDemoUser() {
    const user = await this.prisma.user.findFirst({
      where: { isDemo: true, deletedAt: null },
    });

    if (!user) throw new NotFoundException("데모 계정이 없습니다. seed 를 실행하세요.");

    return user;
  }
}

function toWinLoseCount(rows: Array<{ result: string; count: number }>) {
  const win = pick(rows, "WIN");
  const draw = pick(rows, "DRAW");
  const lose = pick(rows, "LOSE");
  const count = win + draw + lose;

  return { count, win, draw, lose, winRate: count === 0 ? 0 : win / count };
}

function pick(rows: Array<{ result: string; count: number }>, result: string): number {
  return rows.find((row) => row.result === result)?.count ?? 0;
}
