"use client";

import { getGrassColorClass } from "../grassColors";
import type { CalendarDay } from "@nadaena/api-client";

export function DayPanel({
  day,
  onAddOnce,
}: {
  day: CalendarDay;
  onAddOnce: (date: string) => void;
}) {
  return (
    <div className="flex flex-col gap-5">
      {day.record ? <RecordSummary day={day} /> : <PlannedSummary day={day} />}

      {day.kind === "FUTURE" && (
        <button
          type="button"
          onClick={() => onAddOnce(day.date)}
          className="self-start rounded-lg border border-border-strong px-3.5 py-2 text-sm transition-colors hover:bg-surface-hover"
        >
          이 날 미션 추가
        </button>
      )}
    </div>
  );
}

function RecordSummary({ day }: { day: CalendarDay }) {
  const record = day.record;
  if (!record) return null;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <span
          className={`h-2 w-12 rounded-full ${getGrassColorClass(record.result, record.rate)}`}
        />
        <span className="text-sm text-content-muted tnum">
          {record.totalCount}전 {record.winCount}승 {record.totalCount - record.winCount}패
        </span>
      </div>

      {record.rate !== null && (
        <p className="text-3xl font-bold tnum">{Math.round(record.rate * 100)}%</p>
      )}
    </div>
  );
}

function PlannedSummary({ day }: { day: CalendarDay }) {
  if (day.planned.length === 0) {
    return (
      <p className="text-sm leading-relaxed text-content-muted">
        예정된 미션이 없습니다.
        <br />
        지금 상태로는 <span className="text-content">쉬는 날</span>이 됩니다.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-content-muted tnum">예정된 미션 {day.planned.length}개</p>
      <ul className="flex flex-col gap-2">
        {day.planned.map((mission) => (
          <li
            key={mission.id}
            className="flex items-center gap-2 rounded-lg border border-border px-3.5 py-2.5 text-sm"
          >
            <span className="flex-1">{mission.name}</span>
            {mission.categoryName && (
              <span className="rounded bg-surface-hover px-1.5 py-0.5 text-[11px] text-content-dim">
                {mission.categoryName}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
