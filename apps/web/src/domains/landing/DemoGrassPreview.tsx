import { GrassCell } from "@/domains/record/GrassCell";
import { type GrassDay } from "@nadaena/api-client";

const DAYS_PER_WEEK = 7;

/**
 * 랜딩의 주인공.
 *
 * 이 서비스의 매력은 설명이 아니라 그림이다.
 * 문장 스무 줄보다 채워진 잔디 한 장이 빠르다.
 */
export function DemoGrassPreview({ days }: { days: GrassDay[] }) {
  return (
    <div className="flex gap-[3px]">
      {toWeeks(days).map((week) => (
        <div key={week[0]?.date ?? ""} className="flex flex-col gap-[3px]">
          {week.map((day) => (
            <GrassCell key={day.date} day={day} />
          ))}
        </div>
      ))}
    </div>
  );
}

function toWeeks(days: GrassDay[]): GrassDay[][] {
  const weeks: GrassDay[][] = [];

  for (let index = 0; index < days.length; index += DAYS_PER_WEEK) {
    weeks.push(days.slice(index, index + DAYS_PER_WEEK));
  }

  return weeks;
}
