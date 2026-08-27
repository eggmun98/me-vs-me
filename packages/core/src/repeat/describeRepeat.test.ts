import { describe, expect, it } from "vitest";
import { describeRepeat } from "./describeRepeat";
import { LAST_WEEK_ORDER, type RepeatRule } from "./repeatTypes";

describe("describeRepeat", () => {
  const cases: Array<[string, RepeatRule, string]> = [
    ["하루만", { type: "ONCE", startDate: "2026-08-28" }, "8월 28일 하루만"],
    ["매일", { type: "DAILY", startDate: "2026-08-26", interval: 1 }, "매일"],
    ["3일마다", { type: "DAILY", startDate: "2026-08-26", interval: 3 }, "3일마다"],
    [
      "매주 수요일",
      { type: "WEEKLY", startDate: "2026-08-26", interval: 1, weekdays: [3] },
      "매주 수",
    ],
    [
      "주중 매일",
      { type: "WEEKLY", startDate: "2026-08-24", interval: 1, weekdays: [1, 2, 3, 4, 5] },
      "주중 매일",
    ],
    [
      "격주 월수금",
      { type: "WEEKLY", startDate: "2026-08-26", interval: 2, weekdays: [5, 1, 3] },
      "2주마다 월, 수, 금",
    ],
    [
      "매월 28일",
      {
        type: "MONTHLY",
        startDate: "2026-08-28",
        interval: 1,
        monthly: { kind: "DAY_OF_MONTH", monthDay: 28 },
      },
      "매월 28일",
    ],
    [
      "매월 셋째 주 수요일",
      {
        type: "MONTHLY",
        startDate: "2026-08-19",
        interval: 1,
        monthly: { kind: "NTH_WEEKDAY", weekOrder: 3, weekday: 3 },
      },
      "매월 셋째 주 수요일",
    ],
    [
      "매월 마지막 주 수요일",
      {
        type: "MONTHLY",
        startDate: "2026-08-26",
        interval: 1,
        monthly: { kind: "NTH_WEEKDAY", weekOrder: LAST_WEEK_ORDER, weekday: 3 },
      },
      "매월 마지막 주 수요일",
    ],
    [
      "매년 8월 28일",
      { type: "YEARLY", startDate: "2026-08-28", interval: 1, month: 8, monthDay: 28 },
      "매년 8월 28일",
    ],
  ];

  it.each(cases)("%s", (_name, rule, expected) => {
    expect(describeRepeat(rule)).toBe(expected);
  });
});
