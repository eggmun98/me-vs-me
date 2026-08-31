import type { RepeatPayload, RepeatRule } from "@nadaena/core";

export type Difficulty = "EASY" | "NORMAL" | "HARD";

export type Mission = {
  id: string;
  name: string;
  categoryId: string | null;
  categoryName: string | null;
  targetAmount: number | null;
  unit: string | null;
  difficulty: Difficulty;
  repeat: RepeatPayload;
  isActive: boolean;
};

/**
 * 생성·수정 폼이 다루는 값.
 *
 * 폼은 판정하기 좋은 `RepeatRule` 로 다루고, API 는 평평한 `RepeatPayload` 로 주고받는다.
 * 변환은 경계(useMissions)에서 한 번만 한다.
 */
export type MissionDraft = Omit<Mission, "id" | "isActive" | "categoryName" | "repeat"> & {
  repeat: RepeatRule;
};

export type MissionListResponse = {
  active: Mission[];
  inactive: Mission[];
};

export type Category = {
  id: string;
  name: string;
};
