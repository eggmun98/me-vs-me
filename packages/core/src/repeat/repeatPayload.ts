import { type MonthlyMode, type RepeatRule, type RepeatType, type Weekday } from "./repeatTypes";

/**
 * 반복 규칙의 전송·저장 형태.
 *
 * `RepeatRule` 은 판정하기 좋은 판별 유니온이지만, 중첩이 있어 폼 검증과 컬럼 매핑에 불편하다.
 * 평평한 이 모양을 API 요청과 DB 컬럼이 함께 쓴다.
 *
 * `weekOrder` 가 있으면 "매월 N째 주 요일", 없으면 "매월 N일"이다.
 */
export type RepeatPayload = {
  type: RepeatType;
  interval: number;
  weekdays: number[];
  weekOrder: number | null;
  monthDay: number | null;
  month: number | null;
  startDate: string;
};

export function toRepeatRule(payload: RepeatPayload): RepeatRule {
  const { startDate, interval } = payload;

  switch (payload.type) {
    case "ONCE":
      return { type: "ONCE", startDate };

    case "DAILY":
      return { type: "DAILY", startDate, interval };

    case "WEEKLY":
      return { type: "WEEKLY", startDate, interval, weekdays: toWeekdays(payload.weekdays) };

    case "MONTHLY":
      return { type: "MONTHLY", startDate, interval, monthly: toMonthlyMode(payload) };

    case "YEARLY":
      return {
        type: "YEARLY",
        startDate,
        interval,
        month: payload.month ?? 1,
        monthDay: payload.monthDay ?? 1,
      };
  }
}

export function toRepeatPayload(rule: RepeatRule): RepeatPayload {
  const base: RepeatPayload = {
    type: rule.type,
    interval: rule.type === "ONCE" ? 1 : rule.interval,
    weekdays: [],
    weekOrder: null,
    monthDay: null,
    month: null,
    startDate: rule.startDate,
  };

  if (rule.type === "WEEKLY") return { ...base, weekdays: rule.weekdays };

  if (rule.type === "MONTHLY") {
    return rule.monthly.kind === "DAY_OF_MONTH"
      ? { ...base, monthDay: rule.monthly.monthDay }
      : { ...base, weekOrder: rule.monthly.weekOrder, weekdays: [rule.monthly.weekday] };
  }

  if (rule.type === "YEARLY") {
    return { ...base, month: rule.month, monthDay: rule.monthDay };
  }

  return base;
}

function toMonthlyMode(payload: RepeatPayload): MonthlyMode {
  if (payload.weekOrder === null) {
    return { kind: "DAY_OF_MONTH", monthDay: payload.monthDay ?? 1 };
  }

  return {
    kind: "NTH_WEEKDAY",
    weekOrder: payload.weekOrder,
    weekday: (payload.weekdays[0] ?? 0) as Weekday,
  };
}

function toWeekdays(values: number[]): Weekday[] {
  return values.filter((value) => value >= 0 && value <= 6) as Weekday[];
}
