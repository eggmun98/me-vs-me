import {
  addDays,
  formatLocalDate,
  getWeekday,
  occursOn,
  parseLocalDate,
  toRepeatRule,
} from "@nadaena/core";
import type { Mission } from "../mission/missionTypes";
import type { GrassDay } from "../today/todayTypes";
import type { CalendarDay, CalendarDayKind } from "./calendarTypes";

const DAYS_PER_WEEK = 7;
/** 월 뷰는 항상 6주를 그린다. 달마다 높이가 달라지면 화면이 출렁인다. */
export const WEEKS_IN_MONTH_GRID = 6;
export const MONTH_GRID_CELLS = WEEKS_IN_MONTH_GRID * DAYS_PER_WEEK;

export type CalendarSource = {
  today: string;
  missions: Mission[];
  /** 서버가 내려준 날짜별 기록 */
  records: Record<string, GrassDay>;
};

/**
 * 시작일부터 length 일치의 칸을 만든다.
 * 일·주·월·년 뷰가 모두 이 함수를 쓴다. 범위만 다르다.
 */
export function buildCalendarDays(
  startDate: string,
  length: number,
  source: CalendarSource,
  focusMonth?: number,
): CalendarDay[] {
  const start = parseLocalDate(startDate);

  return Array.from({ length }, (_, index) => {
    const date = formatLocalDate(addDays(start, index));

    return buildCalendarDay(date, source, focusMonth);
  });
}

export function buildCalendarDay(
  date: string,
  source: CalendarSource,
  focusMonth?: number,
): CalendarDay {
  const kind = compareToToday(date, source.today);
  const month = Number(date.split("-")[1]);

  return {
    date,
    dayOfMonth: Number(date.split("-")[2]),
    isCurrentMonth: focusMonth === undefined || month === focusMonth,
    kind,
    record: kind === "FUTURE" ? null : (source.records[date] ?? null),
    planned: kind === "FUTURE" ? findPlannedMissions(source.missions, date) : [],
  };
}

export function findPlannedMissions(missions: Mission[], date: string) {
  return missions
    .filter((mission) => mission.isActive && occursOn(toRepeatRule(mission.repeat), date))
    .map((mission) => ({
      id: mission.id,
      name: mission.name,
      categoryName: mission.categoryName,
    }));
}

/** 그 날짜가 속한 주의 일요일 */
export function getWeekStartDate(isoDate: string): string {
  const date = parseLocalDate(isoDate);

  return formatLocalDate(addDays(date, -getWeekday(date)));
}

/** 그 달 1일이 속한 주의 일요일 */
export function getMonthGridStart(year: number, month: number): string {
  return getWeekStartDate(formatLocalDate({ year, month, day: 1 }));
}

function compareToToday(date: string, today: string): CalendarDayKind {
  if (date === today) return "TODAY";

  return date < today ? "PAST" : "FUTURE";
}
