import {
  compareLocalDate,
  countDaysBetween,
  countMonthsBetween,
  countYearsBetween,
  getWeekday,
  getWeekdayOrdinal,
  getWeekStart,
  isLastWeekdayOfMonth,
  parseLocalDate,
  type LocalDate,
} from "../day/localDate";
import { LAST_WEEK_ORDER, type RepeatRule } from "./repeatTypes";

const DAYS_PER_WEEK = 7;

/**
 * 이 미션이 그날 열리는가.
 *
 * 정산 배치가 매일 이 함수로 그날의 승부를 만든다. (06-database.md 7장)
 * 여기가 틀리면 승부가 잘못 열리고, 사용자는 원인을 알 수 없다.
 *
 * @param rule 미션의 반복 규칙
 * @param isoDate 판정할 날짜 (사용자 로컬 날짜, `YYYY-MM-DD`)
 */
export function occursOn(rule: RepeatRule, isoDate: string): boolean {
  const date = parseLocalDate(isoDate);
  const start = parseLocalDate(rule.startDate);

  if (isBeforeStart(date, start)) return false;

  switch (rule.type) {
    case "ONCE":
      return compareLocalDate(date, start) === 0;
    case "DAILY":
      return matchesDaily(date, start, rule.interval);
    case "WEEKLY":
      return matchesWeekly(date, start, rule.interval, rule.weekdays);
    case "MONTHLY":
      return matchesMonthly(date, start, rule.interval, rule.monthly);
    case "YEARLY":
      return matchesYearly(date, start, rule.interval, rule.month, rule.monthDay);
  }
}

function isBeforeStart(date: LocalDate, start: LocalDate): boolean {
  return compareLocalDate(date, start) < 0;
}

function matchesDaily(date: LocalDate, start: LocalDate, interval: number): boolean {
  return isOnInterval(countDaysBetween(start, date), interval);
}

function matchesWeekly(
  date: LocalDate,
  start: LocalDate,
  interval: number,
  weekdays: number[],
): boolean {
  if (!weekdays.includes(getWeekday(date))) return false;

  const weeksApart = countDaysBetween(getWeekStart(start), getWeekStart(date)) / DAYS_PER_WEEK;

  return isOnInterval(weeksApart, interval);
}

function matchesMonthly(
  date: LocalDate,
  start: LocalDate,
  interval: number,
  monthly: Extract<RepeatRule, { type: "MONTHLY" }>["monthly"],
): boolean {
  if (!isOnInterval(countMonthsBetween(start, date), interval)) return false;

  if (monthly.kind === "DAY_OF_MONTH") {
    // 31일 규칙인데 그 달에 31일이 없으면 자연히 어긋난다. 말일로 당기지 않는다.
    return date.day === monthly.monthDay;
  }

  if (getWeekday(date) !== monthly.weekday) return false;

  if (monthly.weekOrder === LAST_WEEK_ORDER) return isLastWeekdayOfMonth(date);

  return getWeekdayOrdinal(date) === monthly.weekOrder;
}

function matchesYearly(
  date: LocalDate,
  start: LocalDate,
  interval: number,
  month: number,
  monthDay: number,
): boolean {
  if (!isOnInterval(countYearsBetween(start, date), interval)) return false;

  // 2월 29일 규칙은 윤년에만 맞는다. 3월 1일로 밀지 않는다.
  return date.month === month && date.day === monthDay;
}

function isOnInterval(distance: number, interval: number): boolean {
  if (distance < 0) return false;

  return distance % interval === 0;
}
