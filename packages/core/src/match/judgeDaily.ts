import type { DailyResult, DailyTally } from "./matchTypes";

/**
 * 일일 승패 판정. 기준은 운영자가 고정한다. (01-service-plan.md 6.3)
 *
 *   50% 초과 → 승 / 정확히 50% → 무 / 50% 미만 → 패
 *
 * 비율을 실수로 비교하지 않고 정수로 비교한다.
 * `winCount / totalCount === 0.5` 는 분모에 따라 부동소수점 오차가 생길 수 있는데,
 * 무승부 판정이 한 번 어긋나면 전적과 연승이 통째로 틀어진다.
 */
export function judgeDailyResult(tally: DailyTally): Exclude<DailyResult, "IN_PROGRESS"> {
  if (tally.totalCount === 0) return "REST";

  const doubled = tally.winCount * 2;

  if (doubled > tally.totalCount) return "WIN";
  if (doubled === tally.totalCount) return "DRAW";

  return "LOSE";
}

/**
 * 자정 전이라도 승리가 확정됐는가. (05-screens.md 4.2)
 *
 * 달성률의 분모가 그날 전체 미션 수로 고정이므로,
 * 남은 미션을 하나도 못 해도 결과가 바뀌지 않는 시점이 온다.
 * 좋은 소식은 자정까지 미루지 않는다.
 */
export function isWinConfirmed(tally: DailyTally): boolean {
  if (tally.totalCount === 0) return false;

  return tally.winCount * 2 > tally.totalCount;
}

/** 달성률. 표시용이며 판정에는 쓰지 않는다. */
export function calculateRate(tally: DailyTally): number {
  if (tally.totalCount === 0) return 0;

  return tally.winCount / tally.totalCount;
}
