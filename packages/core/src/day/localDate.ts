/**
 * 하루의 경계는 사용자 로컬 날짜다. 여기서는 타임존을 다루지 않고
 * `YYYY-MM-DD` 문자열만 계산한다. 타임존 변환은 호출하는 쪽 책임이다.
 *
 * Date 의 로컬 타임존 해석에 걸리지 않도록 전부 UTC 로 계산한다.
 */

const MS_PER_DAY = 86_400_000;
const MONTHS_PER_YEAR = 12;
const DAYS_PER_WEEK = 7;

export type LocalDate = {
  year: number;
  /** 1~12 */
  month: number;
  /** 1~31 */
  day: number;
};

/**
 * 절대시각을 그 타임존의 로컬 날짜로 바꾼다.
 *
 * "이 사용자에게 지금이 며칠인가"를 답하는 함수다.
 * 자정 정산 배치가 타임존마다 다른 "오늘"을 구할 때 쓴다. (06-database.md 7장)
 *
 * 현재 시각을 안에서 읽지 않고 인자로 받는다.
 * 그래야 "새벽 3시에 어떻게 되나"를 테스트할 수 있다.
 */
export function toLocalDate(at: Date, timeZone: string): LocalDate {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(at);

  const read = (type: string): number =>
    Number(parts.find((part) => part.type === type)?.value ?? 0);

  return { year: read("year"), month: read("month"), day: read("day") };
}

export function parseLocalDate(isoDate: string): LocalDate {
  const [year, month, day] = isoDate.split("-").map(Number);

  if (year === undefined || month === undefined || day === undefined) {
    throw new Error(`날짜 형식이 올바르지 않습니다: ${isoDate}`);
  }

  return { year, month, day };
}

export function formatLocalDate(date: LocalDate): string {
  const month = String(date.month).padStart(2, "0");
  const day = String(date.day).padStart(2, "0");

  return `${date.year}-${month}-${day}`;
}

export function getWeekday(date: LocalDate): number {
  return new Date(toUtcTime(date)).getUTCDay();
}

export function compareLocalDate(a: LocalDate, b: LocalDate): number {
  return toUtcTime(a) - toUtcTime(b);
}

export function countDaysBetween(from: LocalDate, to: LocalDate): number {
  return Math.round((toUtcTime(to) - toUtcTime(from)) / MS_PER_DAY);
}

export function countMonthsBetween(from: LocalDate, to: LocalDate): number {
  return (to.year - from.year) * MONTHS_PER_YEAR + (to.month - from.month);
}

export function countYearsBetween(from: LocalDate, to: LocalDate): number {
  return to.year - from.year;
}

/** 그 주의 일요일. 주 간격을 셀 때 기준점으로 쓴다. */
export function getWeekStart(date: LocalDate): LocalDate {
  return addDays(date, -getWeekday(date));
}

export function addDays(date: LocalDate, days: number): LocalDate {
  const shifted = new Date(toUtcTime(date) + days * MS_PER_DAY);

  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth() + 1,
    day: shifted.getUTCDate(),
  };
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

/**
 * 그 달에서 이 날짜가 같은 요일 중 몇 번째인지. 1부터 센다.
 * 예: 2026-08-19(수)는 8월의 세 번째 수요일이므로 3.
 */
export function getWeekdayOrdinal(date: LocalDate): number {
  return Math.floor((date.day - 1) / DAYS_PER_WEEK) + 1;
}

/** 그 달에서 이 날짜가 같은 요일 중 마지막인지 */
export function isLastWeekdayOfMonth(date: LocalDate): boolean {
  return date.day + DAYS_PER_WEEK > getDaysInMonth(date.year, date.month);
}

function toUtcTime(date: LocalDate): number {
  return Date.UTC(date.year, date.month - 1, date.day);
}
