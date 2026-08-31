import type { Difficulty } from "./missionTypes";

export const UNITS = ["분", "시간", "문제", "쪽", "개", "회"] as const;

export const DIFFICULTY_OPTIONS: Array<{ value: Difficulty; label: string }> = [
  { value: "EASY", label: "쉬움" },
  { value: "NORMAL", label: "보통" },
  { value: "HARD", label: "어려움" },
];

export const REPEAT_INTERVAL_MAX = 999;
