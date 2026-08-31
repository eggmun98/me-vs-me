import type { RepeatPayload } from "@nadaena/core";
import type { RecordSummary } from "../today/todayTypes";

export type Me = {
  id: string;
  nickname: string;
  imageUrl: string | null;
  bio: string | null;
  timezone: string;
  isOnboarded: boolean;
  missionCount: number;
  summary: RecordSummary;
};

export type OnboardingMission = {
  name: string;
  categoryId: string | null;
  targetAmount: number | null;
  unit: string | null;
  difficulty: "EASY" | "NORMAL" | "HARD";
  repeat: RepeatPayload;
};

export type OnboardingRequest = {
  nickname: string;
  timezone: string;
  bio?: string;
  missions: OnboardingMission[];
};
