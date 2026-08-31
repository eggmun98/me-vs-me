import {
  getWeekdayOrdinalOf,
  type CustomRepeatFreq,
  type CustomRepeatState,
} from "./repeatCustomTypes";
import type { RepeatRule, Weekday } from "@nadaena/core";

export function buildCustomRule(state: CustomRepeatState, baseDate: string): RepeatRule {
  const [, month, day] = baseDate.split("-").map(Number);
  const interval = clampInterval(state.interval);

  switch (state.freq) {
    case "DAILY":
      return { type: "DAILY", startDate: baseDate, interval };

    case "WEEKLY":
      return {
        type: "WEEKLY",
        startDate: baseDate,
        interval,
        weekdays: state.weekdays.length > 0 ? state.weekdays : [baseWeekday(baseDate)],
      };

    case "MONTHLY":
      return {
        type: "MONTHLY",
        startDate: baseDate,
        interval,
        monthly:
          state.monthlyMode === "DAY_OF_MONTH"
            ? { kind: "DAY_OF_MONTH", monthDay: day ?? 1 }
            : {
                kind: "NTH_WEEKDAY",
                weekOrder: getWeekdayOrdinalOf(baseDate),
                weekday: baseWeekday(baseDate),
              },
      };

    case "YEARLY":
      return {
        type: "YEARLY",
        startDate: baseDate,
        interval,
        month: month ?? 1,
        monthDay: day ?? 1,
      };
  }
}

export function createInitialCustomState(baseDate: string): CustomRepeatState {
  return {
    freq: "WEEKLY",
    interval: 1,
    weekdays: [baseWeekday(baseDate)],
    monthlyMode: "DAY_OF_MONTH",
  };
}

export function toggleWeekday(weekdays: Weekday[], weekday: Weekday): Weekday[] {
  if (weekdays.includes(weekday)) {
    const next = weekdays.filter((day) => day !== weekday);

    // 요일을 전부 끄면 규칙이 성립하지 않는다. 마지막 하나는 남긴다.
    return next.length > 0 ? next : weekdays;
  }

  return [...weekdays, weekday];
}

export function isFreqUsingWeekdays(freq: CustomRepeatFreq): boolean {
  return freq === "WEEKLY";
}

export function isFreqUsingMonthlyMode(freq: CustomRepeatFreq): boolean {
  return freq === "MONTHLY";
}

function baseWeekday(baseDate: string): Weekday {
  return new Date(`${baseDate}T00:00:00Z`).getUTCDay() as Weekday;
}

function clampInterval(value: number): number {
  if (!Number.isFinite(value) || value < 1) return 1;

  return Math.min(Math.floor(value), 999);
}
