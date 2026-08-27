"use client";

import { WEEKDAY_LABELS } from "@nadaena/core";
import { Modal, ModalButton } from "@/shared/ui/Modal";
import type { CalendarDay } from "./calendarTypes";

const EDITABLE_DAYS = 7;

export function DayDetailModal({
  day,
  today,
  onClose,
  onAddOnce,
}: {
  day: CalendarDay;
  today: string;
  onClose: () => void;
  onAddOnce: (date: string) => void;
}) {
  return (
    <Modal
      title={formatTitle(day.date)}
      onClose={onClose}
      footer={
        day.kind === "FUTURE" ? (
          <ModalButton variant="primary" onClick={() => onAddOnce(day.date)}>
            이 날 미션 추가
          </ModalButton>
        ) : undefined
      }
    >
      {day.kind === "FUTURE" ? <PlannedBody day={day} /> : <RecordBody day={day} today={today} />}
    </Modal>
  );
}

function PlannedBody({ day }: { day: CalendarDay }) {
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
    <div className="flex flex-col gap-3">
      <p className="text-sm text-content-muted tnum">
        예정된 미션 {day.planned.length}개
      </p>
      <ul className="flex flex-col gap-2">
        {day.planned.map((mission) => (
          <li
            key={mission.id}
            className="flex items-center gap-2 rounded-lg border border-border px-3.5 py-2.5 text-sm"
          >
            <span className="flex-1">{mission.name}</span>
            <span className="rounded bg-surface-hover px-1.5 py-0.5 text-[11px] text-content-dim">
              {mission.categoryName}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function RecordBody({ day, today }: { day: CalendarDay; today: string }) {
  if (!day.record) {
    return <p className="text-sm text-content-muted">기록이 없습니다.</p>;
  }

  const { record } = day;
  const daysLeft = countEditableDaysLeft(day.date, today);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-baseline justify-between">
        <span className="text-sm text-content-muted tnum">
          {record.totalCount}전 {record.winCount}승 {record.totalCount - record.winCount}패
        </span>
        <span className="text-sm font-bold">{formatResult(record.result)}</span>
      </div>

      {record.rate !== null && (
        <p className="text-2xl font-bold tnum">{Math.round(record.rate * 100)}%</p>
      )}

      <p className="border-t border-border pt-3 text-xs text-content-dim">
        {daysLeft > 0
          ? `수정 가능 (D-${daysLeft})`
          : "7일이 지나 수정할 수 없습니다."}
      </p>
    </div>
  );
}

function formatTitle(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  const weekday = WEEKDAY_LABELS[new Date(`${isoDate}T00:00:00Z`).getUTCDay()];

  return `${year}년 ${month}월 ${day}일 (${weekday})`;
}

function formatResult(result: string): string {
  const labels: Record<string, string> = {
    WIN: "🏆 WIN",
    DRAW: "⚖ DRAW",
    LOSE: "LOSE",
    REST: "쉬는 날",
    IN_PROGRESS: "진행 중",
  };

  return labels[result] ?? result;
}

function countEditableDaysLeft(date: string, today: string): number {
  const elapsed = Math.round(
    (new Date(`${today}T00:00:00Z`).getTime() - new Date(`${date}T00:00:00Z`).getTime()) /
      86_400_000,
  );

  return Math.max(0, EDITABLE_DAYS - elapsed);
}
