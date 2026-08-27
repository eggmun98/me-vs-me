import type { TodayMission, TodayResponse } from "./todayTypes";

/**
 * 디자인 확인용 상태 모음.
 *
 * 승·무·패는 자정 정산이 끝나야 나오는 상태라 실제 데이터로는 오늘 화면에서 만들 수 없다.
 * 요약(summary)은 실제 데이터를 그대로 쓰므로 여기서는 다루지 않는다.
 */
export type TodayScenario = Omit<TodayResponse, "summary">;

const TODAY = "2026-08-26";

function mission(
  id: string,
  name: string,
  categoryName: string,
  targetAmount: number,
  unit: string,
  result: TodayMission["result"],
): TodayMission {
  return { id, missionId: `ms_${id}`, name, categoryName, targetAmount, unit, result };
}

const FIVE = (results: TodayMission["result"][]) => [
  mission("1", "영어 공부", "외국어", 30, "분", results[0] ?? "PENDING"),
  mission("2", "헬스", "운동", 90, "분", results[1] ?? "PENDING"),
  mission("3", "알고리즘", "개발", 2, "문제", results[2] ?? "PENDING"),
  mission("4", "독서", "독서", 30, "분", results[3] ?? "PENDING"),
  mission("5", "프로그래밍 공부", "개발", 60, "분", results[4] ?? "PENDING"),
];

function build(partial: Partial<TodayScenario>): TodayScenario {
  return {
    date: TODAY,
    result: "IN_PROGRESS",
    totalCount: 5,
    winCount: 0,
    rate: 0,
    isWinConfirmed: false,
    missions: [],
    reflection: null,
    editableDates: [],
    ...partial,
  };
}

export const TODAY_SCENARIOS = {
  진행중: build({
    winCount: 2,
    rate: 0.4,
    missions: FIVE(["WIN", "WIN", "PENDING", "PENDING", "PENDING"]),
    editableDates: [{ date: "2026-08-25", loseCount: 2, editableUntil: "2026-09-01" }],
  }),
  승리확정: build({
    winCount: 3,
    rate: 0.6,
    isWinConfirmed: true,
    missions: FIVE(["WIN", "WIN", "PENDING", "WIN", "PENDING"]),
  }),
  승: build({
    result: "WIN",
    winCount: 4,
    rate: 0.8,
    isWinConfirmed: true,
    missions: FIVE(["WIN", "WIN", "LOSE", "WIN", "WIN"]),
    reflection: "알고리즘은 못 했지만 운동과 영어는 계획대로 끝냈다.",
  }),
  무: build({
    result: "DRAW",
    totalCount: 4,
    winCount: 2,
    rate: 0.5,
    missions: FIVE(["WIN", "WIN", "LOSE", "LOSE"]).slice(0, 4),
  }),
  패: build({
    result: "LOSE",
    winCount: 1,
    rate: 0.2,
    missions: FIVE(["WIN", "LOSE", "LOSE", "LOSE", "LOSE"]),
  }),
  쉬는날: build({ date: "2026-08-30", result: "REST", totalCount: 0 }),
  미션없음: build({ totalCount: 0 }),
} satisfies Record<string, TodayScenario>;

export type TodayScenarioName = keyof typeof TODAY_SCENARIOS;
