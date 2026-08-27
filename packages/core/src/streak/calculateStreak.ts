import type { DailyResult } from "../match/matchTypes";

export type StreakSummary = {
  current: number;
  longest: number;
};

/**
 * 연승 계산. (01-service-plan.md 9장)
 *
 *   승        → +1
 *   무 · 패   → 끊김
 *   쉬는 날   → 유지 (증가도 없음)
 *
 * 쉬는 날이 연승을 끊으면 주말에 쉬는 사용자는 연승을 쌓을 수 없다.
 * 아직 끝나지 않은 오늘(IN_PROGRESS)도 결과가 정해지지 않았으므로 건너뛴다.
 *
 * 연승은 저장하지 않고 매번 계산한다. 7일 소급 수정 때문에 과거가 바뀌면
 * 저장된 값이 조용히 틀어지기 때문이다. (06-database.md 1.1)
 *
 * @param results 오래된 날부터 최근 날 순서
 */
export function calculateStreak(results: DailyResult[]): StreakSummary {
  return {
    current: countCurrentStreak(results),
    longest: countLongestStreak(results),
  };
}

function countCurrentStreak(results: DailyResult[]): number {
  let streak = 0;

  for (let index = results.length - 1; index >= 0; index -= 1) {
    const result = results[index];

    if (result === undefined || isTransparent(result)) continue;
    if (result !== "WIN") break;

    streak += 1;
  }

  return streak;
}

function countLongestStreak(results: DailyResult[]): number {
  let longest = 0;
  let running = 0;

  for (const result of results) {
    if (isTransparent(result)) continue;

    running = result === "WIN" ? running + 1 : 0;
    longest = Math.max(longest, running);
  }

  return longest;
}

/** 연승에 영향을 주지 않고 지나가는 상태 */
function isTransparent(result: DailyResult): boolean {
  return result === "REST" || result === "IN_PROGRESS";
}
