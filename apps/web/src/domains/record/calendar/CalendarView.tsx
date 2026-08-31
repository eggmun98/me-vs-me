"use client";

import { addDays, formatLocalDate, parseLocalDate } from "@nadaena/core";
import { useMemo, useState } from "react";
import {
  buildCalendarDays,
  type CalendarDay,
  type CalendarSource,
  type CalendarViewMode,
  getMonthGridStart,
  getWeekStartDate,
  type GrassDay,
  type Mission,
  MONTH_GRID_CELLS,
  VIEW_MODE_OPTIONS,
} from "@nadaena/api-client";
import { DayDetailModal } from "./DayDetailModal";
import { DayPanel } from "./DayPanel";
import { MonthGrid } from "./MonthGrid";
import { WeekList } from "./WeekList";
import { YearGrass } from "./YearGrass";

const DAYS_PER_WEEK = 7;
const YEAR_GRID_WEEKS = 53;

export function CalendarView({
  today,
  missions,
  records,
  onAddOnce,
}: {
  today: string;
  missions: Mission[];
  records: Record<string, GrassDay>;
  onAddOnce: (date: string) => void;
}) {
  const [mode, setMode] = useState<CalendarViewMode>("MONTH");
  const [anchor, setAnchor] = useState(today);
  const [selected, setSelected] = useState<CalendarDay | null>(null);

  const source: CalendarSource = useMemo(
    () => ({ today, missions, records }),
    [today, missions, records],
  );
  const days = useMemo(() => buildDaysForMode(mode, anchor, source), [mode, anchor, source]);

  function move(direction: number) {
    setAnchor((prev) => shiftAnchor(mode, prev, direction));
  }

  return (
    <>
      <header className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-lg font-bold tnum">{formatHeading(mode, anchor)}</h1>

        <div className="flex items-center gap-2">
          <ModeSwitcher mode={mode} onChange={setMode} />
          <div className="ml-auto flex gap-1 sm:ml-0">
            <StepButton label="‹" onClick={() => move(-1)} />
            <StepButton label="›" onClick={() => move(1)} />
          </div>
        </div>
      </header>

      <div className="rounded-2xl border border-border bg-surface p-4">
        {mode === "MONTH" && <MonthGrid days={days} onSelect={setSelected} />}
        {mode === "WEEK" && <WeekList days={days} onSelect={setSelected} />}
        {mode === "YEAR" && <YearGrass days={days} onSelect={setSelected} />}
        {mode === "DAY" && days[0] && <DayPanel day={days[0]} onAddOnce={onAddOnce} />}

        {mode !== "DAY" && <Legend />}
      </div>

      {selected && mode !== "DAY" && (
        <DayDetailModal
          day={selected}
          today={today}
          onClose={() => setSelected(null)}
          onAddOnce={(date) => {
            onAddOnce(date);
            setSelected(null);
          }}
        />
      )}
    </>
  );
}

function buildDaysForMode(
  mode: CalendarViewMode,
  anchor: string,
  source: CalendarSource,
): CalendarDay[] {
  switch (mode) {
    case "DAY":
      return buildCalendarDays(anchor, 1, source);
    case "WEEK":
      return buildCalendarDays(getWeekStartDate(anchor), DAYS_PER_WEEK, source);
    case "MONTH": {
      const { year, month } = parseLocalDate(anchor);

      // 항상 6주를 그린다. 달마다 높이가 바뀌면 화면이 출렁인다.
      return buildCalendarDays(
        getMonthGridStart(year, month),
        MONTH_GRID_CELLS,
        source,
        month,
      );
    }
    case "YEAR": {
      const { year } = parseLocalDate(anchor);
      const start = getWeekStartDate(formatLocalDate({ year, month: 1, day: 1 }));

      return buildCalendarDays(start, YEAR_GRID_WEEKS * DAYS_PER_WEEK, source);
    }
  }
}

function shiftAnchor(mode: CalendarViewMode, anchor: string, direction: number): string {
  const date = parseLocalDate(anchor);

  if (mode === "DAY") return formatLocalDate(addDays(date, direction));
  if (mode === "WEEK") return formatLocalDate(addDays(date, direction * DAYS_PER_WEEK));

  if (mode === "YEAR") {
    return formatLocalDate({ ...date, year: date.year + direction, day: 1 });
  }

  const shifted = date.month + direction;

  if (shifted < 1) return formatLocalDate({ year: date.year - 1, month: 12, day: 1 });
  if (shifted > 12) return formatLocalDate({ year: date.year + 1, month: 1, day: 1 });

  return formatLocalDate({ ...date, month: shifted, day: 1 });
}

function formatHeading(mode: CalendarViewMode, anchor: string): string {
  const { year, month, day } = parseLocalDate(anchor);

  if (mode === "YEAR") return `${year}년`;
  if (mode === "MONTH") return `${year}년 ${month}월`;
  if (mode === "DAY") return `${year}년 ${month}월 ${day}일`;

  const weekStart = parseLocalDate(getWeekStartDate(anchor));
  const weekEnd = parseLocalDate(
    formatLocalDate(addDays(parseLocalDate(getWeekStartDate(anchor)), 6)),
  );

  return `${weekStart.month}월 ${weekStart.day}일 – ${weekEnd.month}월 ${weekEnd.day}일`;
}

function ModeSwitcher({
  mode,
  onChange,
}: {
  mode: CalendarViewMode;
  onChange: (mode: CalendarViewMode) => void;
}) {
  return (
    <div className="flex rounded-lg border border-border p-0.5">
      {VIEW_MODE_OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`rounded-md px-2.5 py-1 text-xs transition-colors ${
            mode === option.value
              ? "bg-accent font-semibold text-on-accent"
              : "text-content-muted hover:text-content"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function Legend() {
  return (
    <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-border pt-3 text-[10px] text-content-dim">
      <span className="flex items-center gap-1">
        <span className="h-1.5 w-5 rounded-full bg-win-3" />승
      </span>
      <span className="flex items-center gap-1">
        <span className="h-1.5 w-5 rounded-full bg-draw" />무
      </span>
      <span className="flex items-center gap-1">
        <span className="h-1.5 w-5 rounded-full bg-lose" />패
      </span>
      <span className="flex items-center gap-1">
        <span className="flex gap-0.5">
          <span className="size-1 rounded-full bg-border-strong" />
          <span className="size-1 rounded-full bg-border-strong" />
        </span>
        예정
      </span>
    </div>
  );
}

function StepButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="size-8 rounded-lg border border-border text-content-muted transition-colors hover:bg-surface-hover hover:text-content"
    >
      {label}
    </button>
  );
}
