import type { GrassDay } from "@/domains/today/todayTypes";
import { getGrassColorClass } from "./grassColors";

const WEEKDAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

const RESULT_LABELS: Record<string, string> = {
  WIN: "승",
  DRAW: "무",
  LOSE: "패",
  REST: "쉬는 날",
  IN_PROGRESS: "진행 중",
  NONE: "기록 없음",
};

/**
 * 잔디 한 칸.
 *
 * 툴팁은 CSS 만으로 띄운다. 서버 컴포넌트(랜딩)에서도 쓰이기 때문이다.
 * 브라우저 기본 `title` 은 1초쯤 기다려야 뜨고, 잔디처럼 훑어보는 화면에는 느리다.
 */
export function GrassCell({
  day,
  size = "sm",
  onClick,
}: {
  day: GrassDay;
  size?: "sm" | "md";
  onClick?: (day: GrassDay) => void;
}) {
  const sizeClass = size === "sm" ? "size-[9px] sm:size-[11px]" : "aspect-square w-full";
  const cell = (
    <span
      className={`block rounded-[2px] ${sizeClass} ${getGrassColorClass(day.result, day.rate)}`}
    />
  );

  return (
    <span className="group relative inline-flex">
      {onClick ? (
        <button
          type="button"
          onClick={() => onClick(day)}
          className="inline-flex transition-opacity hover:opacity-70"
        >
          {cell}
        </button>
      ) : (
        cell
      )}

      <GrassTooltip day={day} />
    </span>
  );
}

function GrassTooltip({ day }: { day: GrassDay }) {
  return (
    <span className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded-lg bg-accent px-2 py-1.5 text-[11px] leading-tight text-on-accent opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
      <span className="block font-semibold tnum">{formatDate(day.date)}</span>
      <span className="mt-0.5 block text-on-accent/70 tnum">{formatResult(day)}</span>
    </span>
  );
}

function formatDate(isoDate: string): string {
  const [year, month, dayOfMonth] = isoDate.split("-").map(Number);
  const weekday = WEEKDAY_LABELS[new Date(`${isoDate}T00:00:00Z`).getUTCDay()];

  return `${year}년 ${month}월 ${dayOfMonth}일 (${weekday})`;
}

function formatResult(day: GrassDay): string {
  const label = RESULT_LABELS[day.result] ?? day.result;

  if (day.totalCount === 0) return label;

  return `${day.winCount}/${day.totalCount} · ${label}`;
}
