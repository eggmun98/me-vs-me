import { describe, expect, it } from "vitest";
import { toRepeatPayload, toRepeatRule } from "./repeatPayload";
import { LAST_WEEK_ORDER, type RepeatRule } from "./repeatTypes";

describe("RepeatPayload 왕복", () => {
  const rules: Array<[string, RepeatRule]> = [
    ["하루만", { type: "ONCE", startDate: "2026-08-26" }],
    ["매일", { type: "DAILY", startDate: "2026-08-26", interval: 1 }],
    ["3일마다", { type: "DAILY", startDate: "2026-08-26", interval: 3 }],
    [
      "주중 매일",
      { type: "WEEKLY", startDate: "2026-08-26", interval: 1, weekdays: [1, 2, 3, 4, 5] },
    ],
    [
      "격주 주말",
      { type: "WEEKLY", startDate: "2026-08-26", interval: 2, weekdays: [0, 6] },
    ],
    [
      "매월 28일",
      {
        type: "MONTHLY",
        startDate: "2026-08-28",
        interval: 1,
        monthly: { kind: "DAY_OF_MONTH", monthDay: 28 },
      },
    ],
    [
      "매월 셋째 주 수요일",
      {
        type: "MONTHLY",
        startDate: "2026-08-19",
        interval: 1,
        monthly: { kind: "NTH_WEEKDAY", weekOrder: 3, weekday: 3 },
      },
    ],
    [
      "매월 마지막 주 수요일",
      {
        type: "MONTHLY",
        startDate: "2026-08-26",
        interval: 1,
        monthly: { kind: "NTH_WEEKDAY", weekOrder: LAST_WEEK_ORDER, weekday: 3 },
      },
    ],
    [
      "매년 8월 28일",
      { type: "YEARLY", startDate: "2026-08-28", interval: 1, month: 8, monthDay: 28 },
    ],
  ];

  it.each(rules)("%s 는 payload 를 거쳐도 그대로다", (_name, rule) => {
    expect(toRepeatRule(toRepeatPayload(rule))).toEqual(rule);
  });
});
