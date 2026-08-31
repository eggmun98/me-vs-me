"use client";

import { describeGrassDayLine, type GrassDay } from "@nadaena/api-client";
import { useState } from "react";
import { GrassCell } from "./GrassCell";

/**
 * 이번 달 잔디.
 *
 * 데스크톱은 hover 로 툴팁이 뜬다. 터치에는 hover 가 없어 그대로 두면
 * 모바일에서 며칠인지 볼 방법이 아예 없다. 그래서 탭한 날을 격자 아래 한 줄로 보여준다.
 *
 * 툴팁을 손가락 위에 띄우지 않는 이유는 단순하다 — 손가락이 그 자리를 가린다.
 */
export function MonthGrass({ days }: { days: GrassDay[] }) {
  const [selected, setSelected] = useState<GrassDay | null>(null);

  // 처음에는 가장 최근 기록을 보여준다. 빈 줄만 남겨두면 눌러야 하는 줄 모른다.
  const shown = selected ?? findLatestRecorded(days);

  return (
    <div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => (
          <GrassCell
            key={day.date}
            day={day}
            size="md"
            isSelected={selected?.date === day.date}
            onClick={setSelected}
          />
        ))}
      </div>

      {shown && (
        <p className="mt-2.5 min-h-[1.25rem] text-[11px] leading-5 text-content-muted tnum">
          {describeGrassDayLine(shown)}
        </p>
      )}
    </div>
  );
}

function findLatestRecorded(days: GrassDay[]): GrassDay | null {
  for (let index = days.length - 1; index >= 0; index -= 1) {
    const day = days[index];

    if (day && day.result !== "NONE") return day;
  }

  return null;
}

export function GrassLegend() {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[10px] text-content-dim">
      <span className="flex items-center gap-1">
        적음
        <span className="size-2.5 rounded-[2px] bg-win-1" />
        <span className="size-2.5 rounded-[2px] bg-win-2" />
        <span className="size-2.5 rounded-[2px] bg-win-3" />
        많음
      </span>
      <span className="flex items-center gap-1">
        <span className="size-2.5 rounded-[2px] bg-draw" />무
      </span>
      <span className="flex items-center gap-1">
        <span className="size-2.5 rounded-[2px] bg-lose" />패
      </span>
      <span className="flex items-center gap-1">
        <span className="size-2.5 rounded-[2px] bg-surface ring-1 ring-inset ring-border" />
        휴식
      </span>
    </div>
  );
}
