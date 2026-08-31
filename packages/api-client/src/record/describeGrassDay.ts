import type { GrassDay } from "../today/todayTypes";

const WEEKDAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"] as const;

/**
 * 잔디 칸 하나를 읽을 수 있는 문구로 바꾼다.
 *
 * 결과 문구가 `getResultText` 와 다르다. 저건 점수판이라 `WIN`, 이건 설명이라 `승`이다.
 * 같은 화면에 둘이 같이 나오지 않는다.
 */
const RESULT_LABELS: Record<GrassDay["result"], string> = {
  WIN: "승",
  DRAW: "무",
  LOSE: "패",
  REST: "쉬는 날",
  IN_PROGRESS: "진행 중",
  NONE: "기록 없음",
};

export type GrassDayText = {
  /** `8월 21일 (목)` */
  date: string;
  /** `3/4 · 승` — 미션이 없던 날은 결과만 */
  result: string;
};

/**
 * 두 조각으로 나눠서 준다.
 *
 * 데스크톱 툴팁은 두 줄로 쌓고, 모바일은 한 줄로 붙인다.
 * 문구를 각자 만들면 같은 날이 화면마다 다르게 읽힌다.
 */
export function describeGrassDay(day: GrassDay): GrassDayText {
  return { date: formatGrassDate(day.date), result: formatGrassResult(day) };
}

/** 모바일에서 잔디 아래 한 줄로 붙일 때. hover 가 없어 탭한 날을 여기에 띄운다. */
export function describeGrassDayLine(day: GrassDay): string {
  const text = describeGrassDay(day);

  return `${text.date} · ${text.result}`;
}

function formatGrassDate(isoDate: string): string {
  const [, month, dayOfMonth] = isoDate.split("-").map(Number);
  const weekday = WEEKDAY_LABELS[new Date(`${isoDate}T00:00:00Z`).getUTCDay()];

  return `${month}월 ${dayOfMonth}일 (${weekday})`;
}

function formatGrassResult(day: GrassDay): string {
  const label = RESULT_LABELS[day.result];

  if (day.totalCount === 0) return label;

  return `${day.winCount}/${day.totalCount} · ${label}`;
}
