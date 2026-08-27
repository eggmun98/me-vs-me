"use client";

import { GrassCell } from "../GrassCell";
import type { CalendarDay } from "./calendarTypes";

const DAYS_PER_WEEK = 7;
const MONTH_LABELS = ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"];

/**
 * 연간 뷰는 잔디로 보여준다.
 * 12개월 미니 달력은 정보량이 적고, 잔디가 이 서비스의 시그니처다.
 */
export function YearGrass({
  days,
  onSelect,
}: {
  days: CalendarDay[];
  onSelect: (day: CalendarDay) => void;
}) {
  const weeks = toWeeks(days);

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[640px]">
        <MonthAxis weeks={weeks} />

        <div className="flex gap-[3px]">
          {weeks.map((week) => (
            <div key={week[0]?.date ?? ""} className="flex flex-col gap-[3px]">
              {week.map((day) => (
                <GrassCell
                  key={day.date}
                  day={
                    day.record ?? {
                      date: day.date,
                      result: "NONE",
                      rate: null,
                      totalCount: 0,
                      winCount: 0,
                    }
                  }
                  onClick={() => onSelect(day)}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MonthAxis({ weeks }: { weeks: CalendarDay[][] }) {
  return (
    <div className="mb-1 flex gap-[3px]">
      {weeks.map((week, index) => (
        <span
          key={week[0]?.date ?? index}
          className="w-[11px] text-[9px] text-content-dim"
        >
          {isFirstWeekOfMonth(weeks, index) ? MONTH_LABELS[monthOf(week)] : ""}
        </span>
      ))}
    </div>
  );
}

function toWeeks(days: CalendarDay[]): CalendarDay[][] {
  const weeks: CalendarDay[][] = [];

  for (let index = 0; index < days.length; index += DAYS_PER_WEEK) {
    weeks.push(days.slice(index, index + DAYS_PER_WEEK));
  }

  return weeks;
}

function monthOf(week: CalendarDay[]): number {
  const first = week[0];
  if (!first) return 0;

  return Number(first.date.split("-")[1]) - 1;
}

function isFirstWeekOfMonth(weeks: CalendarDay[][], index: number): boolean {
  if (index === 0) return false;

  const previous = weeks[index - 1];
  const current = weeks[index];
  if (!previous || !current) return false;

  return monthOf(previous) !== monthOf(current);
}
