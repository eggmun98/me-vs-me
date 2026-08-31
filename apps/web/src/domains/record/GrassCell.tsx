import { describeGrassDay, type GrassDay } from "@nadaena/api-client";
import { getGrassColorClass } from "./grassColors";

/**
 * 잔디 한 칸.
 *
 * 툴팁은 CSS 만으로 띄운다. 서버 컴포넌트(랜딩)에서도 쓰이기 때문이다.
 * 브라우저 기본 `title` 은 1초쯤 기다려야 뜨고, 잔디처럼 훑어보는 화면에는 느리다.
 *
 * 터치에는 hover 가 없다. 툴팁만 두면 모바일에서 날짜를 볼 방법이 없어지므로,
 * `onClick` 을 받는 쪽(`MonthGrass`)이 격자 아래 한 줄로 대신 보여준다.
 */
export function GrassCell({
  day,
  size = "sm",
  isSelected = false,
  onClick,
}: {
  day: GrassDay;
  size?: "sm" | "md";
  isSelected?: boolean;
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
          aria-pressed={isSelected}
          onClick={() => onClick(day)}
          className={`inline-flex rounded-[3px] transition-opacity hover:opacity-70 ${
            isSelected ? "ring-2 ring-accent ring-offset-1" : ""
          }`}
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
  const text = describeGrassDay(day);

  return (
    <span className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded-lg bg-accent px-2 py-1.5 text-[11px] leading-tight text-on-accent opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
      <span className="block font-semibold tnum">{text.date}</span>
      <span className="mt-0.5 block text-on-accent/70 tnum">{text.result}</span>
    </span>
  );
}
