import { getGrassTier, type GrassResult, type GrassTier } from "@nadaena/api-client";
import { colors } from "./colors";

/**
 * 단계는 공유(`getGrassTier`)하고, 여기서는 칠하기만 한다.
 * 쉬는 날만 채우지 않고 테두리로 표시한다 — 웹과 같은 규칙이다.
 */
const TIER_FILL: Record<GrassTier, string> = {
  REST: "transparent",
  LOSE: colors.lose,
  DRAW: colors.draw,
  WIN_1: colors.win1,
  WIN_2: colors.win2,
  WIN_3: colors.win3,
};

export function getGrassStyle(
  result: GrassResult,
  rate: number | null,
): { backgroundColor: string; borderColor: string; borderWidth: number } {
  const tier = getGrassTier(result, rate);

  return tier === "REST"
    ? { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }
    : { backgroundColor: TIER_FILL[tier], borderColor: "transparent", borderWidth: 1 };
}
