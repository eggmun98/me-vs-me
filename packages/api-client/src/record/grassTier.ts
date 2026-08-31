import type { DailyResult } from "@nadaena/core";

export type GrassResult = DailyResult | "NONE";

/**
 * 잔디 한 칸의 단계. 색이 아니라 단계만 여기서 정한다.
 *
 * 웹은 Tailwind 클래스로, 앱은 색상값으로 칠한다. 형태는 달라도
 * "어떤 날이 몇 단계인가"는 한 곳에서만 정해야 두 화면이 어긋나지 않는다.
 * 색 규칙과 근거는 01-service-plan.md 8장.
 */
export type GrassTier = "REST" | "LOSE" | "DRAW" | "WIN_1" | "WIN_2" | "WIN_3";

const WIN_SHADE = {
  PERFECT: 1,
  HIGH: 0.75,
} as const;

export function getGrassTier(result: GrassResult, rate: number | null): GrassTier {
  if (result === "REST" || result === "IN_PROGRESS" || result === "NONE") return "REST";
  if (result === "LOSE") return "LOSE";
  if (result === "DRAW") return "DRAW";

  if (rate === null) return "REST";
  if (rate >= WIN_SHADE.PERFECT) return "WIN_3";
  if (rate >= WIN_SHADE.HIGH) return "WIN_2";

  return "WIN_1";
}
