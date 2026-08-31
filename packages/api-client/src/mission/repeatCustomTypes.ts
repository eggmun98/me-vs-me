import type { Weekday } from "@nadaena/core";

export type CustomRepeatFreq = "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";

export type MonthlyModeKind = "DAY_OF_MONTH" | "NTH_WEEKDAY";

export type CustomRepeatState = {
  freq: CustomRepeatFreq;
  interval: number;
  weekdays: Weekday[];
  monthlyMode: MonthlyModeKind;
};

export const FREQ_UNIT_LABELS: Array<{ value: CustomRepeatFreq; label: string }> = [
  { value: "DAILY", label: "일" },
  { value: "WEEKLY", label: "주" },
  { value: "MONTHLY", label: "개월" },
  { value: "YEARLY", label: "년" },
];

const DAYS_PER_WEEK = 7;

/** 그 달에서 이 날짜가 같은 요일 중 몇 번째인지 */
export function getWeekdayOrdinalOf(isoDate: string): number {
  const day = Number(isoDate.split("-")[2]);

  return Math.floor((day - 1) / DAYS_PER_WEEK) + 1;
}
