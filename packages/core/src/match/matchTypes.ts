/** 미션 하나의 결과. 진행 중에는 LOSE 가 없다 — 패배는 자정 정산이 확정한다. */
export type MissionResult = "PENDING" | "WIN" | "LOSE";

export type DailyResult = "IN_PROGRESS" | "WIN" | "DRAW" | "LOSE" | "REST";

export type DailyTally = {
  /** 그날 확정된 전체 미션 수. 진행 전 미션도 포함한다. */
  totalCount: number;
  /** 완료한 미션 수 */
  winCount: number;
};
