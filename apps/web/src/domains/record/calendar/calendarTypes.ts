import type { GrassDay } from "@/domains/today/todayTypes";

export type CalendarDayKind = "PAST" | "TODAY" | "FUTURE";

export type PlannedMission = {
  id: string;
  name: string;
  categoryName: string | null;
};

export type CalendarDay = {
  date: string;
  dayOfMonth: number;
  isCurrentMonth: boolean;
  kind: CalendarDayKind;
  /** 과거·오늘에만 있다. 서버가 내려준 기록. */
  record: GrassDay | null;
  /** 미래에만 채운다. occursOn 으로 클라이언트가 계산한다. */
  planned: PlannedMission[];
};
