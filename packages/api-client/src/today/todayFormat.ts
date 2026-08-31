import type { DailyResult } from "@nadaena/core";

/**
 * 결과 문구만 공유한다. 색은 각 앱이 정한다 — 웹은 Tailwind 클래스, 앱은 색상값이라 형태가 다르다.
 */
const RESULT_TEXT: Record<DailyResult, string> = {
  IN_PROGRESS: "진행 중",
  WIN: "WIN",
  DRAW: "DRAW",
  LOSE: "LOSE",
  REST: "쉬는 날",
};

export function getResultText(result: DailyResult): string {
  return RESULT_TEXT[result];
}

const WEEKDAY_NAMES = ["일", "월", "화", "수", "목", "금", "토"] as const;

export function formatKoreanDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  const weekday = WEEKDAY_NAMES[new Date(year ?? 0, (month ?? 1) - 1, day ?? 1).getDay()];

  return `${year}.${String(month).padStart(2, "0")}.${String(day).padStart(2, "0")} (${weekday})`;
}

export function formatMissionTarget(
  targetAmount: number | null,
  unit: string | null,
): string | null {
  if (targetAmount === null || unit === null) return null;

  return `${targetAmount}${unit}`;
}
