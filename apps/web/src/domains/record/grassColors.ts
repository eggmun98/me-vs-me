import type { DailyResult } from "@nadaena/core";

export type GrassResult = DailyResult | "NONE";

/**
 * 승리만 농도를 셋으로 나눈다. 패와 무는 각 한 단계.
 * 흰 바탕에서는 진할수록 강하다. 색 규칙과 근거는 01-service-plan.md 8장.
 *
 * 쉬는 날은 채우지 않고 테두리만 둔다.
 * 흰 바탕에서 패배(옅은 회색)와 명도로 벌리려면 둘 중 하나가 너무 진해지는데,
 * 채움 여부로 구분하면 그럴 필요가 없다.
 */
const WIN_SHADE = {
  PERFECT: 1,
  HIGH: 0.75,
} as const;

const REST_CLASS = "bg-surface ring-1 ring-inset ring-border";

export function getGrassColorClass(result: GrassResult, rate: number | null): string {
  if (result === "REST" || result === "IN_PROGRESS" || result === "NONE") return REST_CLASS;
  if (result === "LOSE") return "bg-lose";
  if (result === "DRAW") return "bg-draw";

  if (rate === null) return REST_CLASS;
  if (rate >= WIN_SHADE.PERFECT) return "bg-win-3";
  if (rate >= WIN_SHADE.HIGH) return "bg-win-2";

  return "bg-win-1";
}
