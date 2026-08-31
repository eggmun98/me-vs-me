/** `GET /today` 응답 계약. (07-api.md 4장) */

import type { DailyResult, MissionResult } from "@nadaena/core";

export type { DailyResult, MissionResult };

export type TodayMission = {
  id: string;
  missionId: string;
  name: string;
  categoryName: string | null;
  targetAmount: number | null;
  unit: string | null;
  result: MissionResult;
};

export type EditableDate = {
  date: string;
  loseCount: number;
  editableUntil: string;
};

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

export type RecordSummary = {
  total: WinLoseCount;
  month: WinLoseCount & { month: string };
  streak: { current: number; longest: number };
  monthGrass: GrassDay[];
};

export type TodayResponse = {
  date: string;
  result: DailyResult;
  totalCount: number;
  winCount: number;
  rate: number;
  /** 남은 미션을 못 해도 이미 승리가 확정된 상태 (05-screens 4.2) */
  isWinConfirmed: boolean;
  missions: TodayMission[];
  reflection: string | null;
  editableDates: EditableDate[];
  summary: RecordSummary;
};

export type UpdateMissionResultResponse = {
  dailyMission: { id: string; result: MissionResult; date: string };
  daily: {
    date: string;
    result: DailyResult;
    totalCount: number;
    winCount: number;
    rate: number;
    isWinConfirmed: boolean;
  };
  summary: RecordSummary;
};
