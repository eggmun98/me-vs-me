/** 0=일요일 … 6=토요일 */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type RepeatType = "ONCE" | "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";

/** 매월 반복은 두 가지 모드가 있다. 하나만 채운다. */
export type MonthlyMode =
  /** 매월 28일 */
  | { kind: "DAY_OF_MONTH"; monthDay: number }
  /** 매월 셋째 주 수요일. weekOrder -1 은 마지막 주. */
  | { kind: "NTH_WEEKDAY"; weekOrder: number; weekday: Weekday };

export type RepeatRule =
  | { type: "ONCE"; startDate: string }
  | { type: "DAILY"; startDate: string; interval: number }
  | { type: "WEEKLY"; startDate: string; interval: number; weekdays: Weekday[] }
  | { type: "MONTHLY"; startDate: string; interval: number; monthly: MonthlyMode }
  | {
      type: "YEARLY";
      startDate: string;
      interval: number;
      month: number;
      monthDay: number;
    };

/** 마지막 주를 뜻하는 weekOrder 값 */
export const LAST_WEEK_ORDER = -1;

export const WEEKDAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"] as const;
