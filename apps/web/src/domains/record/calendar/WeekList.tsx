"use client";

import { WEEKDAY_LABELS } from "@nadaena/core";
import { getGrassColorClass } from "../grassColors";
import type { CalendarDay } from "@nadaena/api-client";

export function WeekList({
  days,
  onSelect,
}: {
  days: CalendarDay[];
  onSelect: (day: CalendarDay) => void;
}) {
  return (
    <ul className="flex flex-col gap-1">
      {days.map((day) => (
        <li key={day.date}>
          <WeekRow day={day} onSelect={onSelect} />
        </li>
      ))}
    </ul>
  );
}

function WeekRow({
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
      className={`flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-surface-hover ${
        isToday ? "bg-surface-hover" : ""
      }`}
    >
      <span className="flex w-10 shrink-0 flex-col items-center">
        <span className="text-[10px] text-content-dim">
          {WEEKDAY_LABELS[new Date(`${day.date}T00:00:00Z`).getUTCDay()]}
        </span>
        <span className={`text-sm tnum ${isToday ? "font-bold" : "text-content-muted"}`}>
          {day.dayOfMonth}
        </span>
      </span>

      <span className="min-w-0 flex-1 pt-1">
        <DayContent day={day} />
      </span>
    </button>
  );
}

function DayContent({ day }: { day: CalendarDay }) {
  if (day.record) {
    return (
      <span className="flex items-center gap-2">
        <span
          className={`h-1.5 w-8 shrink-0 rounded-full ${getGrassColorClass(
            day.record.result,
            day.record.rate,
          )}`}
        />
        <span className="text-xs text-content-muted tnum">
          {day.record.totalCount > 0
            ? `${day.record.winCount}/${day.record.totalCount}`
            : "쉬는 날"}
        </span>
      </span>
    );
  }

  if (day.planned.length === 0) {
    return <span className="text-xs text-content-dim">쉬는 날</span>;
  }

  return (
    <span className="flex flex-wrap gap-1">
      {day.planned.map((mission) => (
        <span
          key={mission.id}
          className="rounded bg-surface-hover px-1.5 py-0.5 text-[11px] text-content-muted"
        >
          {mission.name}
        </span>
      ))}
    </span>
  );
}
