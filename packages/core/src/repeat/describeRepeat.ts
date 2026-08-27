import { LAST_WEEK_ORDER, type RepeatRule, WEEKDAY_LABELS } from "./repeatTypes";

const WEEKDAYS_MON_TO_FRI = [1, 2, 3, 4, 5];
const WEEK_ORDER_LABELS = ["", "첫째", "둘째", "셋째", "넷째", "다섯째"] as const;

/**
 * 반복 규칙을 사람이 읽는 문장으로 바꾼다.
 * 미션 목록에서 "언제 하는 미션인가"가 한 줄로 보여야 한다. (05-screens.md S9)
 */
export function describeRepeat(rule: RepeatRule): string {
  switch (rule.type) {
    case "ONCE":
      return formatOnce(rule.startDate);
    case "DAILY":
      return rule.interval === 1 ? "매일" : `${rule.interval}일마다`;
    case "WEEKLY":
      return describeWeekly(rule.interval, rule.weekdays);
    case "MONTHLY":
      return describeMonthly(rule.interval, rule.monthly);
    case "YEARLY":
      return describeYearly(rule.interval, rule.month, rule.monthDay);
  }
}

function describeWeekly(interval: number, weekdays: number[]): string {
  const cycle = interval === 1 ? "매주" : `${interval}주마다`;

  if (isWeekdaysOnly(weekdays)) return interval === 1 ? "주중 매일" : `${cycle} 평일`;

  return `${cycle} ${formatWeekdays(weekdays)}`;
}

function describeMonthly(
  interval: number,
  monthly: Extract<RepeatRule, { type: "MONTHLY" }>["monthly"],
): string {
  const cycle = interval === 1 ? "매월" : `${interval}개월마다`;

  if (monthly.kind === "DAY_OF_MONTH") return `${cycle} ${monthly.monthDay}일`;

  const order =
    monthly.weekOrder === LAST_WEEK_ORDER
      ? "마지막"
      : (WEEK_ORDER_LABELS[monthly.weekOrder] ?? `${monthly.weekOrder}번째`);

  return `${cycle} ${order} 주 ${WEEKDAY_LABELS[monthly.weekday]}요일`;
}

function describeYearly(interval: number, month: number, monthDay: number): string {
  const cycle = interval === 1 ? "매년" : `${interval}년마다`;

  return `${cycle} ${month}월 ${monthDay}일`;
}

function formatOnce(isoDate: string): string {
  const [, month, day] = isoDate.split("-").map(Number);

  return `${month}월 ${day}일 하루만`;
}

function formatWeekdays(weekdays: number[]): string {
  return [...weekdays]
    .sort((a, b) => a - b)
    .map((weekday) => WEEKDAY_LABELS[weekday])
    .join(", ");
}

function isWeekdaysOnly(weekdays: number[]): boolean {
  if (weekdays.length !== WEEKDAYS_MON_TO_FRI.length) return false;

  return WEEKDAYS_MON_TO_FRI.every((weekday) => weekdays.includes(weekday));
}
