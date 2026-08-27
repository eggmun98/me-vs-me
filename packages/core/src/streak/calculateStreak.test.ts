import { describe, expect, it } from "vitest";
import type { DailyResult } from "../match/matchTypes";
import { calculateStreak } from "./calculateStreak";

const W: DailyResult = "WIN";
const L: DailyResult = "LOSE";
const D: DailyResult = "DRAW";
const R: DailyResult = "REST";
const P: DailyResult = "IN_PROGRESS";

describe("현재 연승", () => {
  it("최근부터 연속된 승리를 센다", () => {
    expect(calculateStreak([W, L, W, W, W]).current).toBe(3);
  });

  it("패배가 연승을 끊는다", () => {
    expect(calculateStreak([W, W, W, L]).current).toBe(0);
  });

  it("무승부도 연승을 끊는다", () => {
    expect(calculateStreak([W, W, W, D]).current).toBe(0);
  });

  it("쉬는 날은 연승을 끊지 않는다", () => {
    expect(calculateStreak([W, W, R, W]).current).toBe(3);
  });

  it("쉬는 날만으로는 연승이 늘지 않는다", () => {
    expect(calculateStreak([W, R, R, R]).current).toBe(1);
  });

  it("아직 끝나지 않은 오늘은 건너뛴다", () => {
    expect(calculateStreak([W, W, W, P]).current).toBe(3);
  });

  it("기록이 없으면 0이다", () => {
    expect(calculateStreak([]).current).toBe(0);
  });
});

describe("최장 연승", () => {
  it("전체 구간에서 가장 긴 연승을 찾는다", () => {
    expect(calculateStreak([W, W, W, L, W, W]).longest).toBe(3);
  });

  it("현재 연승이 최장이면 같은 값이 된다", () => {
    const streak = calculateStreak([W, L, W, W, W, W]);

    expect(streak.current).toBe(4);
    expect(streak.longest).toBe(4);
  });

  it("쉬는 날을 사이에 두고도 이어진다", () => {
    expect(calculateStreak([W, W, R, R, W, W, L]).longest).toBe(4);
  });

  it("승리가 없으면 0이다", () => {
    expect(calculateStreak([L, D, R, L]).longest).toBe(0);
  });
});
