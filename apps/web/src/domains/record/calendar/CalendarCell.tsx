"use client";

import { getGrassColorClass } from "../grassColors";
import type { CalendarDay } from "@nadaena/api-client";

const MAX_PLANNED_DOTS = 5;

export function CalendarCell({
  day,
  onSelect,
}: {
  day: CalendarDay;
  onSelect: (day: CalendarDay) => void;
}) {
  const isToday = day.kind === "TODAY";

  return (
    <button
      type="button"
      onClick={() => onSelect(day)}
      className={`flex aspect-square flex-col items-center justify-center gap-1.5 rounded-lg transition-colors ${
        day.isCurrentMonth ? "hover:bg-surface-hover" : "opacity-35"
      } ${isToday ? "ring-2 ring-inset ring-accent" : ""}`}
    >
      <span className={`text-xs tnum ${isToday ? "font-bold" : "text-content-muted"}`}>
        {day.dayOfMonth}
      </span>

      {day.record ? <ResultBar record={day.record} /> : <PlannedDots count={day.planned.length} />}
    </button>
  );
}

function ResultBar({ record }: { record: NonNullable<CalendarDay["record"]> }) {
  if (record.result === "NONE") return <span className="h-1.5" />;

  if (record.result === "IN_PROGRESS") {
    return <span className="h-1.5 w-6 rounded-full bg-win-1" />;
  }

  return (
    <span
      className={`h-1.5 w-6 rounded-full ${getGrassColorClass(record.result, record.rate)}`}
    />
  );
}

/** 미래는 결과가 없다. 그날 몇 개가 예정돼 있는지만 보여준다. */
function PlannedDots({ count }: { count: number }) {
  if (count === 0) return <span className="h-1.5" />;

  return (
    <span className="flex h-1.5 items-center gap-0.5">
      {Array.from({ length: Math.min(count, MAX_PLANNED_DOTS) }, (_, index) => (
        <span key={index} className="size-1 rounded-full bg-border-strong" />
      ))}
    </span>
  );
}
