"use client";

import { WEEKDAY_LABELS } from "@nadaena/core";
import { CalendarCell } from "./CalendarCell";
import type { CalendarDay } from "./calendarTypes";

export function MonthGrid({
  days,
  onSelect,
}: {
  days: CalendarDay[];
  onSelect: (day: CalendarDay) => void;
}) {
  return (
    <>
      <div className="mb-1 grid grid-cols-7">
        {WEEKDAY_LABELS.map((label) => (
          <span key={label} className="py-1 text-center text-[11px] text-content-dim">
            {label}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-0.5">
        {days.map((day) => (
          <CalendarCell key={day.date} day={day} onSelect={onSelect} />
        ))}
      </div>
    </>
  );
}
