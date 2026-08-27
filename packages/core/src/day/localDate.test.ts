import { describe, expect, it } from "vitest";
import { formatLocalDate, toLocalDate } from "./localDate";

describe("toLocalDate", () => {
  it("같은 순간이라도 타임존에 따라 날짜가 다르다", () => {
    // 2026-08-26 15:30 UTC — 서울은 이미 27일, 뉴욕은 아직 26일이다.
    const at = new Date("2026-08-26T15:30:00Z");

    expect(formatLocalDate(toLocalDate(at, "Asia/Seoul"))).toBe("2026-08-27");
    expect(formatLocalDate(toLocalDate(at, "America/New_York"))).toBe("2026-08-26");
    expect(formatLocalDate(toLocalDate(at, "UTC"))).toBe("2026-08-26");
  });

  it("자정 직전과 직후가 하루 차이가 난다", () => {
    const before = new Date("2026-08-26T14:59:59Z");
    const after = new Date("2026-08-26T15:00:00Z");

    expect(formatLocalDate(toLocalDate(before, "Asia/Seoul"))).toBe("2026-08-26");
    expect(formatLocalDate(toLocalDate(after, "Asia/Seoul"))).toBe("2026-08-27");
  });

  it("새벽 시간대도 그날 날짜로 나온다", () => {
    // 서울 새벽 3시. 하루 시작 시각을 0시로 두면 이미 다음 날이다.
    const at = new Date("2026-08-26T18:00:00Z");

    expect(formatLocalDate(toLocalDate(at, "Asia/Seoul"))).toBe("2026-08-27");
  });
});
