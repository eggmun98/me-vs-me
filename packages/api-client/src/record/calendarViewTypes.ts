export type CalendarViewMode = "DAY" | "WEEK" | "MONTH" | "YEAR";

export const VIEW_MODE_OPTIONS: Array<{ value: CalendarViewMode; label: string }> = [
  { value: "DAY", label: "일" },
  { value: "WEEK", label: "주" },
  { value: "MONTH", label: "월" },
  { value: "YEAR", label: "년" },
];

/** 이전·다음 버튼이 한 번에 움직이는 폭 */
export const VIEW_STEP_DAYS: Record<Exclude<CalendarViewMode, "MONTH" | "YEAR">, number> = {
  DAY: 1,
  WEEK: 7,
};
