import { getGrassTier, type GrassResult, type GrassTier } from "@nadaena/api-client";

export type { GrassResult };

/**
 * 단계는 공유(`getGrassTier`)하고, 여기서는 칠하기만 한다.
 *
 * 쉬는 날은 채우지 않고 테두리만 둔다.
 * 흰 바탕에서 패배와 명도로 벌리려면 둘 중 하나가 너무 진해지는데,
 * 채움 여부로 구분하면 그럴 필요가 없다.
 */
const TIER_CLASS: Record<GrassTier, string> = {
  REST: "bg-surface ring-1 ring-inset ring-border",
  LOSE: "bg-lose",
  DRAW: "bg-draw",
  WIN_1: "bg-win-1",
  WIN_2: "bg-win-2",
  WIN_3: "bg-win-3",
};

export function getGrassColorClass(result: GrassResult, rate: number | null): string {
  return TIER_CLASS[getGrassTier(result, rate)];
}
