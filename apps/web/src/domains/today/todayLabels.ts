import type { DailyResult } from "@nadaena/core";

type ResultLabel = {
  text: string;
  toneClassName: string;
};

const RESULT_LABELS: Record<DailyResult, ResultLabel> = {
  IN_PROGRESS: { text: "진행 중", toneClassName: "text-content-muted" },
  WIN: { text: "WIN", toneClassName: "text-win-3" },
  DRAW: { text: "DRAW", toneClassName: "text-draw" },
  LOSE: { text: "LOSE", toneClassName: "text-content-muted" },
  REST: { text: "쉬는 날", toneClassName: "text-content-muted" },
};

export function getResultLabel(result: DailyResult): ResultLabel {
  return RESULT_LABELS[result];
}

export function formatKoreanDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  const weekday = ["일", "월", "화", "수", "목", "금", "토"][
    new Date(year, month - 1, day).getDay()
  ];

  return `${year}.${String(month).padStart(2, "0")}.${String(day).padStart(2, "0")} (${weekday})`;
}

export function formatMissionTarget(
  targetAmount: number | null,
  unit: string | null,
): string | null {
  if (targetAmount === null || unit === null) return null;

  return `${targetAmount}${unit}`;
}
