import type { GrassDay } from "@/domains/today/todayTypes";
import { GrassCell } from "./GrassCell";

export function MonthGrass({ days }: { days: GrassDay[] }) {
  return (
    <div className="grid grid-cols-7 gap-1">
      {days.map((day) => (
        <GrassCell key={day.date} day={day} size="md" />
      ))}
    </div>
  );
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
