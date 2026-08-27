import { type RepeatPayload, toRepeatPayload, toRepeatRule, type RepeatRule } from "@nadaena/core";
import { fromDateOnly, toDateOnly } from "@/common/dateOnly";

/** missions 테이블의 반복 관련 컬럼 */
export type RepeatColumns = {
  repeatType: RepeatPayload["type"];
  repeatInterval: number;
  repeatWeekdays: number[];
  repeatWeekOrder: number | null;
  repeatMonthDay: number | null;
  repeatMonth: number | null;
  repeatStartDate: Date;
};

/**
 * DB 컬럼과 core 의 규칙 사이를 잇는다.
 *
 * 컬럼 구성은 core 의 RepeatPayload 와 같고, 날짜 타입만 다르다.
 * 판정 규칙 자체는 core 가 갖고 있어야 서버와 화면이 어긋나지 않는다.
 */
export function columnsToRule(columns: RepeatColumns): RepeatRule {
  return toRepeatRule(columnsToPayload(columns));
}

export function ruleToColumns(rule: RepeatRule): RepeatColumns {
  return payloadToColumns(toRepeatPayload(rule));
}

export function columnsToPayload(columns: RepeatColumns): RepeatPayload {
  return {
    type: columns.repeatType,
    interval: columns.repeatInterval,
    weekdays: columns.repeatWeekdays,
    weekOrder: columns.repeatWeekOrder,
    monthDay: columns.repeatMonthDay,
    month: columns.repeatMonth,
    startDate: toDateOnly(columns.repeatStartDate),
  };
}

export function payloadToColumns(payload: RepeatPayload): RepeatColumns {
  return {
    repeatType: payload.type,
    repeatInterval: payload.interval,
    repeatWeekdays: payload.weekdays,
    repeatWeekOrder: payload.weekOrder,
    repeatMonthDay: payload.monthDay,
    repeatMonth: payload.month,
    repeatStartDate: fromDateOnly(payload.startDate),
  };
}
