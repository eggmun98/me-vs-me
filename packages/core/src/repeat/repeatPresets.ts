import { getWeekday, getWeekdayOrdinal, parseLocalDate } from "../day/localDate";
import type { RepeatRule, Weekday } from "./repeatTypes";

/**
 * 프리셋은 별도 타입이 아니라 규칙의 프리필이다.
 * 저장 구조가 하나여야 프리셋으로 만들고 맞춤으로 고치는 흐름이 자연스럽다.
 */
export type RepeatPresetId =
  | "DAILY"
  | "WEEKLY_SAME_DAY"
  | "MONTHLY_NTH_WEEKDAY"
  | "YEARLY_SAME_DATE"
  | "WEEKDAYS";

const WEEKDAY_MON_TO_FRI: Weekday[] = [1, 2, 3, 4, 5];

/** 기준 날짜(보통 오늘)를 받아 프리셋을 규칙으로 편다. */
export function buildRepeatPreset(preset: RepeatPresetId, baseDate: string): RepeatRule {
  const date = parseLocalDate(baseDate);
  const weekday = getWeekday(date) as Weekday;

  switch (preset) {
    case "DAILY":
      return { type: "DAILY", startDate: baseDate, interval: 1 };

    case "WEEKLY_SAME_DAY":
      return { type: "WEEKLY", startDate: baseDate, interval: 1, weekdays: [weekday] };

    case "MONTHLY_NTH_WEEKDAY":
      return {
        type: "MONTHLY",
        startDate: baseDate,
        interval: 1,
        monthly: { kind: "NTH_WEEKDAY", weekOrder: getWeekdayOrdinal(date), weekday },
      };

    case "YEARLY_SAME_DATE":
      return {
        type: "YEARLY",
        startDate: baseDate,
        interval: 1,
        month: date.month,
        monthDay: date.day,
      };

    case "WEEKDAYS":
      return {
        type: "WEEKLY",
        startDate: baseDate,
        interval: 1,
        weekdays: WEEKDAY_MON_TO_FRI,
      };
  }
}
