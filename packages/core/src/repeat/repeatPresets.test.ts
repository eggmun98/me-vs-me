import { describe, expect, it } from "vitest";
import { describeRepeat } from "./describeRepeat";
import { occursOn } from "./occursOn";
import { buildRepeatPreset } from "./repeatPresets";

/** 2026-08-26 은 8월의 넷째 수요일 */
const BASE_DATE = "2026-08-26";

describe("buildRepeatPreset", () => {
  it("기준 날짜의 요일을 그대로 쓴다", () => {
    const rule = buildRepeatPreset("WEEKLY_SAME_DAY", BASE_DATE);

    expect(describeRepeat(rule)).toBe("매주 수");
  });

  it("기준 날짜가 그 달의 몇째 주 요일인지를 그대로 쓴다", () => {
    const rule = buildRepeatPreset("MONTHLY_NTH_WEEKDAY", BASE_DATE);

    expect(describeRepeat(rule)).toBe("매월 넷째 주 수요일");
  });

  it("기준 날짜의 월·일을 그대로 쓴다", () => {
    const rule = buildRepeatPreset("YEARLY_SAME_DATE", BASE_DATE);

    expect(describeRepeat(rule)).toBe("매년 8월 26일");
  });

  it("모든 프리셋은 기준 날짜에 열린다", () => {
    const presets = [
      "DAILY",
      "WEEKLY_SAME_DAY",
      "MONTHLY_NTH_WEEKDAY",
      "YEARLY_SAME_DATE",
      "WEEKDAYS",
    ] as const;

    for (const preset of presets) {
      expect(occursOn(buildRepeatPreset(preset, BASE_DATE), BASE_DATE)).toBe(true);
    }
  });
});
