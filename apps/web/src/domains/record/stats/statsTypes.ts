import type { StreakSummary } from "@nadaena/core";
import type { WinLoseCount } from "@/domains/today/todayTypes";

export type StatsPeriod = "MONTH" | "ALL";

export type MissionRate = {
  missionId: string;
  name: string;
  categoryName: string;
  total: number;
  win: number;
  rate: number;
};

export type CategoryRate = {
  categoryName: string;
  total: number;
  win: number;
  rate: number;
};

export type MonthRate = {
  month: string;
  winRate: number;
};

export type RecordStats = {
  period: StatsPeriod;
  daily: WinLoseCount;
  mission: { total: number; win: number; lose: number; rate: number };
  activeDays: number;
  streak: StreakSummary;
  byCategory: CategoryRate[];
  byMission: MissionRate[];
  byMonth: MonthRate[];
};
