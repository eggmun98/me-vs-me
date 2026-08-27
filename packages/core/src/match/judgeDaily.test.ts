import { describe, expect, it } from "vitest";
import { calculateRate, isWinConfirmed, judgeDailyResult } from "./judgeDaily";

describe("judgeDailyResult", () => {
  it("미션이 없으면 쉬는 날이다", () => {
    expect(judgeDailyResult({ totalCount: 0, winCount: 0 })).toBe("REST");
  });

  it("50%를 넘으면 승이다", () => {
    expect(judgeDailyResult({ totalCount: 5, winCount: 3 })).toBe("WIN");
    expect(judgeDailyResult({ totalCount: 4, winCount: 3 })).toBe("WIN");
  });

  it("정확히 50%면 무승부다", () => {
    expect(judgeDailyResult({ totalCount: 4, winCount: 2 })).toBe("DRAW");
    expect(judgeDailyResult({ totalCount: 2, winCount: 1 })).toBe("DRAW");
  });

  it("50% 미만이면 패다", () => {
    expect(judgeDailyResult({ totalCount: 5, winCount: 2 })).toBe("LOSE");
    expect(judgeDailyResult({ totalCount: 3, winCount: 0 })).toBe("LOSE");
  });

  it("미션 개수가 홀수인 날에는 무승부가 나올 수 없다", () => {
    const oddTotals = [1, 3, 5, 7, 9];

    for (const totalCount of oddTotals) {
      for (let winCount = 0; winCount <= totalCount; winCount += 1) {
        expect(judgeDailyResult({ totalCount, winCount })).not.toBe("DRAW");
      }
    }
  });

  it("분모가 커도 정확히 절반이면 무승부다 (부동소수점에 흔들리지 않는다)", () => {
    expect(judgeDailyResult({ totalCount: 6, winCount: 3 })).toBe("DRAW");
    expect(judgeDailyResult({ totalCount: 10, winCount: 5 })).toBe("DRAW");
    expect(judgeDailyResult({ totalCount: 100, winCount: 50 })).toBe("DRAW");
  });
});

describe("isWinConfirmed", () => {
  it("5개 중 3개를 끝내면 남은 2개와 무관하게 승리가 확정된다", () => {
    expect(isWinConfirmed({ totalCount: 5, winCount: 2 })).toBe(false);
    expect(isWinConfirmed({ totalCount: 5, winCount: 3 })).toBe(true);
  });

  it("무승부 상태는 아직 확정이 아니다", () => {
    expect(isWinConfirmed({ totalCount: 4, winCount: 2 })).toBe(false);
  });

  it("미션이 없으면 확정되지 않는다", () => {
    expect(isWinConfirmed({ totalCount: 0, winCount: 0 })).toBe(false);
  });
});

describe("calculateRate", () => {
  it("완료 수를 전체 미션 수로 나눈다", () => {
    expect(calculateRate({ totalCount: 5, winCount: 3 })).toBeCloseTo(0.6);
  });

  it("미션이 없으면 0이다", () => {
    expect(calculateRate({ totalCount: 0, winCount: 0 })).toBe(0);
  });
});
