import { describe, expect, it } from "vitest";
import { occursOn } from "./occursOn";
import { LAST_WEEK_ORDER, type RepeatRule } from "./repeatTypes";

/** 2026-08-26 은 수요일. 8월의 수요일은 5·12·19·26 로 넷째가 마지막이다. */
const WEDNESDAY = "2026-08-26";

function expectOpenDays(rule: RepeatRule, dates: string[], expected: boolean[]) {
  expect(dates.map((date) => occursOn(rule, date))).toEqual(expected);
}

describe("시작일 이전", () => {
  it("어떤 규칙이든 시작일 전에는 열리지 않는다", () => {
    const rule: RepeatRule = { type: "DAILY", startDate: WEDNESDAY, interval: 1 };

    expect(occursOn(rule, "2026-08-25")).toBe(false);
    expect(occursOn(rule, WEDNESDAY)).toBe(true);
  });
});

describe("ONCE — 하루만", () => {
  it("지정한 날짜에만 열린다", () => {
    const rule: RepeatRule = { type: "ONCE", startDate: WEDNESDAY };

    expectOpenDays(rule, ["2026-08-25", "2026-08-26", "2026-08-27"], [false, true, false]);
  });
});

describe("DAILY — 매일", () => {
  it("interval 1 이면 매일 열린다", () => {
    const rule: RepeatRule = { type: "DAILY", startDate: WEDNESDAY, interval: 1 };

    expectOpenDays(rule, ["2026-08-26", "2026-08-27", "2026-08-28"], [true, true, true]);
  });

  it("interval 3 이면 시작일 기준 3일마다 열린다", () => {
    const rule: RepeatRule = { type: "DAILY", startDate: WEDNESDAY, interval: 3 };

    expectOpenDays(
      rule,
      ["2026-08-26", "2026-08-27", "2026-08-28", "2026-08-29"],
      [true, false, false, true],
    );
  });

  it("달을 넘어가도 간격이 유지된다", () => {
    const rule: RepeatRule = { type: "DAILY", startDate: "2026-08-30", interval: 3 };

    expectOpenDays(rule, ["2026-08-30", "2026-09-02", "2026-09-03"], [true, true, false]);
  });
});

describe("WEEKLY — 매주", () => {
  it("지정한 요일에만 열린다", () => {
    const rule: RepeatRule = {
      type: "WEEKLY",
      startDate: WEDNESDAY,
      interval: 1,
      weekdays: [3],
    };

    expectOpenDays(
      rule,
      ["2026-08-26", "2026-08-27", "2026-09-02"],
      [true, false, true],
    );
  });

  it("주중 매일은 월~금에만 열린다", () => {
    const rule: RepeatRule = {
      type: "WEEKLY",
      startDate: "2026-08-24",
      interval: 1,
      weekdays: [1, 2, 3, 4, 5],
    };

    expectOpenDays(
      rule,
      ["2026-08-24", "2026-08-28", "2026-08-29", "2026-08-30", "2026-08-31"],
      [true, true, false, false, true],
    );
  });

  it("격주는 시작일이 속한 주를 기준으로 센다", () => {
    const rule: RepeatRule = {
      type: "WEEKLY",
      startDate: WEDNESDAY,
      interval: 2,
      weekdays: [3],
    };

    expectOpenDays(
      rule,
      ["2026-08-26", "2026-09-02", "2026-09-09"],
      [true, false, true],
    );
  });
});

describe("MONTHLY — 매월 N일", () => {
  it("지정한 날짜에만 열린다", () => {
    const rule: RepeatRule = {
      type: "MONTHLY",
      startDate: "2026-08-28",
      interval: 1,
      monthly: { kind: "DAY_OF_MONTH", monthDay: 28 },
    };

    expectOpenDays(rule, ["2026-08-28", "2026-09-27", "2026-09-28"], [true, false, true]);
  });

  it("31일 규칙은 31일이 없는 달을 건너뛴다 (말일로 당기지 않는다)", () => {
    const rule: RepeatRule = {
      type: "MONTHLY",
      startDate: "2026-08-31",
      interval: 1,
      monthly: { kind: "DAY_OF_MONTH", monthDay: 31 },
    };

    expectOpenDays(
      rule,
      ["2026-08-31", "2026-09-30", "2026-10-31", "2026-11-30"],
      [true, false, true, false],
    );
  });

  it("2개월마다는 시작 달 기준으로 센다", () => {
    const rule: RepeatRule = {
      type: "MONTHLY",
      startDate: "2026-08-15",
      interval: 2,
      monthly: { kind: "DAY_OF_MONTH", monthDay: 15 },
    };

    expectOpenDays(
      rule,
      ["2026-08-15", "2026-09-15", "2026-10-15"],
      [true, false, true],
    );
  });
});

describe("MONTHLY — 매월 N째 주 요일", () => {
  it("셋째 주 수요일에만 열린다", () => {
    const rule: RepeatRule = {
      type: "MONTHLY",
      startDate: "2026-08-19",
      interval: 1,
      monthly: { kind: "NTH_WEEKDAY", weekOrder: 3, weekday: 3 },
    };

    expectOpenDays(
      rule,
      ["2026-08-19", "2026-08-26", "2026-09-16", "2026-10-21"],
      [true, false, true, true],
    );
  });

  it("다섯째 주 수요일은 그 주가 없는 달을 건너뛴다", () => {
    const rule: RepeatRule = {
      type: "MONTHLY",
      startDate: "2026-09-30",
      interval: 1,
      monthly: { kind: "NTH_WEEKDAY", weekOrder: 5, weekday: 3 },
    };

    // 9월은 수요일이 5번(2·9·16·23·30), 10월은 4번(7·14·21·28)뿐이다.
    expectOpenDays(rule, ["2026-09-30", "2026-10-28"], [true, false]);
  });

  it("마지막 주 수요일은 달마다 날짜가 달라진다", () => {
    const rule: RepeatRule = {
      type: "MONTHLY",
      startDate: "2026-08-26",
      interval: 1,
      monthly: { kind: "NTH_WEEKDAY", weekOrder: LAST_WEEK_ORDER, weekday: 3 },
    };

    expectOpenDays(
      rule,
      ["2026-08-26", "2026-09-23", "2026-09-30", "2026-10-28"],
      [true, false, true, true],
    );
  });
});

describe("YEARLY — 매년", () => {
  it("지정한 월·일에만 열린다", () => {
    const rule: RepeatRule = {
      type: "YEARLY",
      startDate: "2026-08-28",
      interval: 1,
      month: 8,
      monthDay: 28,
    };

    expectOpenDays(
      rule,
      ["2026-08-28", "2026-08-29", "2027-08-28"],
      [true, false, true],
    );
  });

  it("2월 29일 규칙은 윤년에만 열린다", () => {
    const rule: RepeatRule = {
      type: "YEARLY",
      startDate: "2028-02-29",
      interval: 1,
      month: 2,
      monthDay: 29,
    };

    expectOpenDays(
      rule,
      ["2028-02-29", "2029-02-28", "2029-03-01", "2032-02-29"],
      [true, false, false, true],
    );
  });

  it("2년마다는 시작 연도 기준으로 센다", () => {
    const rule: RepeatRule = {
      type: "YEARLY",
      startDate: "2026-08-28",
      interval: 2,
      month: 8,
      monthDay: 28,
    };

    expectOpenDays(
      rule,
      ["2026-08-28", "2027-08-28", "2028-08-28"],
      [true, false, true],
    );
  });
});
