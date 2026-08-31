import { buildRepeatPreset, toRepeatPayload } from "@nadaena/core";
import type { OnboardingMission } from "./userTypes";

/**
 * 추천 미션.
 *
 * 루틴 공유(기획서 20장)는 Phase 3라 MVP 에는 공유된 루틴이 없다.
 * 그래서 서비스가 기본 목록을 제공한다. (05-screens.md S2)
 */
export const RECOMMENDED_MISSIONS: Array<{
  name: string;
  categoryName: string;
  targetAmount: number | null;
  unit: string | null;
}> = [
  { name: "운동", categoryName: "운동", targetAmount: 30, unit: "분" },
  { name: "독서", categoryName: "독서", targetAmount: 30, unit: "분" },
  { name: "영어 공부", categoryName: "외국어", targetAmount: 30, unit: "분" },
  { name: "알고리즘", categoryName: "개발", targetAmount: 1, unit: "문제" },
  { name: "일찍 일어나기", categoryName: "생활", targetAmount: null, unit: null },
];

/** 첫 미션은 매일 반복으로 시작한다. 요일 설정은 나중에 바꾸면 된다. */
export function toOnboardingMission(
  preset: (typeof RECOMMENDED_MISSIONS)[number],
  categoryId: string | null,
  today: string,
): OnboardingMission {
  return {
    name: preset.name,
    categoryId,
    targetAmount: preset.targetAmount,
    unit: preset.unit,
    difficulty: "NORMAL",
    repeat: toRepeatPayload(buildRepeatPreset("DAILY", today)),
  };
}

/**
 * 미션이 많을수록 승리 조건이 올라간다. 50% 초과가 승리라 8개면 5개를 해야 이긴다.
 * 첫 주에 계속 지면 그대로 이탈한다. 막지는 않고 권유만 한다. (05-screens.md S2)
 */
export const RECOMMENDED_COUNT = { min: 1, max: 3 } as const;

export function countRequiredWins(totalCount: number): number {
  return Math.floor(totalCount / 2) + 1;
}
