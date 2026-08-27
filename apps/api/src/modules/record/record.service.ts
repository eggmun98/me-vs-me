import { Injectable, NotFoundException } from "@nestjs/common";
import { calculateStreak, type DailyResult, type StreakSummary } from "@nadaena/core";
import { CurrentUserService } from "@/common/currentUser.service";
import { fromDateOnly } from "@/common/dateOnly";
import { DailyService } from "@/modules/daily/daily.service";
import { PrismaService } from "@/prisma/prisma.service";
import { selectDayRange, type GrassRow } from "./queries/grassQuery";
import {
  countDailyResults,
  countMissionResults,
  selectCategoryRates,
  selectMissionRates,
  selectMonthRates,
  selectResultsInOrder,
} from "./queries/statsQuery";

const EDITABLE_DAYS = 7;

export type WinLoseCount = {
  count: number;
  win: number;
  draw: number;
  lose: number;
  winRate: number;
};

export type GrassDay = {
  date: string;
  result: DailyResult | "NONE";
  rate: number | null;
  totalCount: number;
  winCount: number;
};

@Injectable()
export class RecordService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly currentUser: CurrentUserService,
    private readonly daily: DailyService,
  ) {}

  async getGrass(year: number) {
    const userId = await this.currentUser.getUserId();
    const rows = await selectDayRange(this.prisma, userId, `${year}-01-01`, `${year}-12-31`);

    return { year, days: rows.map(toGrassDay), summary: await this.getTotalCount(userId) };
  }

  async getCalendar(year: number, month: number) {
    const userId = await this.currentUser.getUserId();
    const from = `${year}-${String(month).padStart(2, "0")}-01`;
    const to = lastDayOfMonth(year, month);
    const rows = await selectDayRange(this.prisma, userId, from, to);

    return { year, month, days: rows.map(toGrassDay) };
  }

  async getStats(period: "MONTH" | "ALL") {
    const userId = await this.currentUser.getUserId();
    const user = await this.currentUser.getUser();
    const today = this.daily.resolveToday(user.timezone);
    const since = period === "MONTH" ? `${today.slice(0, 7)}-01` : null;

    const [dailyRows, missionRows, categoryRows, missionRates, monthRows, orderedResults] =
      await Promise.all([
        countDailyResults(this.prisma, userId, since),
        countMissionResults(this.prisma, userId, since),
        selectCategoryRates(this.prisma, userId, since),
        selectMissionRates(this.prisma, userId, since),
        selectMonthRates(this.prisma, userId),
        selectResultsInOrder(this.prisma, userId),
      ]);

    const daily = toWinLoseCount(dailyRows);
    const missionWin = pick(missionRows, "WIN");
    const missionLose = pick(missionRows, "LOSE");
    const missionTotal = missionWin + missionLose;

    return {
      period,
      daily,
      mission: {
        total: missionTotal,
        win: missionWin,
        lose: missionLose,
        rate: missionTotal === 0 ? 0 : missionWin / missionTotal,
      },
      activeDays: daily.count,
      streak: this.calculateStreakFrom(orderedResults.map((row) => row.result as DailyResult)),
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
    };
  }

  async getDay(date: string) {
    const userId = await this.currentUser.getUserId();
    const user = await this.currentUser.getUser();
    const today = this.daily.resolveToday(user.timezone);

    const record = await this.prisma.dailyRecord.findUnique({
      where: { userId_date: { userId, date: fromDateOnly(date) } },
    });

    if (!record) throw new NotFoundException("그날의 기록이 없습니다.");

    const missions = await this.prisma.dailyMission.findMany({
      where: { userId, date: fromDateOnly(date) },
      orderBy: { createdAt: "asc" },
    });

    const daysElapsed = countDaysBetween(date, today);

    return {
      date,
      result: record.result,
      totalCount: record.totalCount,
      winCount: record.winCount,
      rate: record.totalCount === 0 ? null : record.winCount / record.totalCount,
      reflection: record.reflection,
      missions: missions.map((mission) => ({
        id: mission.id,
        name: mission.name,
        categoryName: mission.categoryName,
        targetAmount: mission.targetAmount,
        unit: mission.unit,
        result: mission.result,
      })),
      // 기한 판단은 서버가 한다. 클라이언트 시계에 좌우되지 않게. (07-api.md 8장)
      editable: daysElapsed <= EDITABLE_DAYS,
      editableUntil: shiftDate(date, EDITABLE_DAYS),
    };
  }

  async getSummary(userId: string, today: string) {
    const month = today.slice(0, 7);
    const [total, monthCount, orderedResults, monthGrass] = await Promise.all([
      this.getTotalCount(userId),
      this.getMonthCount(userId, month),
      selectResultsInOrder(this.prisma, userId),
      selectDayRange(this.prisma, userId, `${month}-01`, lastDayOfMonthString(month)),
    ]);

    return {
      total,
      month: { ...monthCount, month },
      streak: this.calculateStreakFrom(orderedResults.map((row) => row.result as DailyResult)),
      monthGrass: monthGrass.map(toGrassDay),
    };
  }

  private calculateStreakFrom(results: DailyResult[]): StreakSummary {
    return calculateStreak(results);
  }

  private async getTotalCount(userId: string): Promise<WinLoseCount> {
    return toWinLoseCount(await countDailyResults(this.prisma, userId, null));
  }

  private async getMonthCount(userId: string, month: string): Promise<WinLoseCount> {
    return toWinLoseCount(await countDailyResults(this.prisma, userId, `${month}-01`));
  }
}

/** 쉬는 날은 전적에 넣지 않는다. 넣으면 승률이 의미를 잃는다. (01-service-plan.md 6.6) */
function toWinLoseCount(rows: Array<{ result: string; count: number }>): WinLoseCount {
  const win = pick(rows, "WIN");
  const draw = pick(rows, "DRAW");
  const lose = pick(rows, "LOSE");
  const count = win + draw + lose;

  return { count, win, draw, lose, winRate: count === 0 ? 0 : win / count };
}

function pick(rows: Array<{ result: string; count: number }>, result: string): number {
  return rows.find((row) => row.result === result)?.count ?? 0;
}

function toGrassDay(row: GrassRow): GrassDay {
  const totalCount = row.totalCount ?? 0;
  const winCount = row.winCount ?? 0;

  return {
    date: row.date,
    result: (row.result as DailyResult | null) ?? "NONE",
    rate: totalCount === 0 ? null : winCount / totalCount,
    totalCount,
    winCount,
  };
}

function lastDayOfMonth(year: number, month: number): string {
  const last = new Date(Date.UTC(year, month, 0));

  return last.toISOString().slice(0, 10);
}

function lastDayOfMonthString(month: string): string {
  const [year, monthNumber] = month.split("-").map(Number);

  return lastDayOfMonth(year ?? 2026, monthNumber ?? 1);
}

function countDaysBetween(from: string, to: string): number {
  return Math.round(
    (new Date(`${to}T00:00:00Z`).getTime() - new Date(`${from}T00:00:00Z`).getTime()) /
      86_400_000,
  );
}

function shiftDate(isoDate: string, days: number): string {
  const shifted = new Date(`${isoDate}T00:00:00Z`);
  shifted.setUTCDate(shifted.getUTCDate() + days);

  return shifted.toISOString().slice(0, 10);
}
