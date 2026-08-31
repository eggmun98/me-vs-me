import { getResultText, type DailyResult } from "@nadaena/api-client";

/** 문구는 공유하고, 색은 여기서 웹의 Tailwind 클래스로 붙인다. */
const RESULT_TONE: Record<DailyResult, string> = {
  IN_PROGRESS: "text-content-muted",
  WIN: "text-win-3",
  DRAW: "text-draw",
  LOSE: "text-content-muted",
  REST: "text-content-muted",
};

export function getResultLabel(result: DailyResult): { text: string; toneClassName: string } {
  return { text: getResultText(result), toneClassName: RESULT_TONE[result] };
}

export { formatKoreanDate, formatMissionTarget } from "@nadaena/api-client";
