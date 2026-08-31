import { type DailyResult } from "@nadaena/api-client";
import { colors } from "@/shared/theme/colors";

/** 문구는 `getResultText` 가 공유한다. 여기서는 앱의 색만 정한다. */
export const RESULT_COLOR: Record<DailyResult, string> = {
  IN_PROGRESS: colors.contentMuted,
  WIN: colors.win3,
  DRAW: colors.draw,
  LOSE: colors.contentMuted,
  REST: colors.contentMuted,
};

export const GAUGE_COLOR: Record<DailyResult, string> = {
  IN_PROGRESS: colors.win2,
  WIN: colors.win3,
  DRAW: colors.draw,
  LOSE: colors.lose,
  REST: colors.rest,
};
