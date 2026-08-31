"use client";

import { formatMissionTarget } from "./todayLabels";
import { type TodayMission } from "@nadaena/api-client";

export function TodayMissionRow({
  mission,
  onToggle,
}: {
  mission: TodayMission;
  onToggle: (id: string) => void;
}) {
  const target = formatMissionTarget(mission.targetAmount, mission.unit);
  const isWin = mission.result === "WIN";
  const isLose = mission.result === "LOSE";

  return (
    <button
      type="button"
      onClick={() => onToggle(mission.id)}
      disabled={isLose}
      className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3.5 text-left transition-colors ${
        isWin
          ? "border-win-1 bg-win-1/25"
          : isLose
            ? "border-border bg-transparent"
            : "border-border bg-surface hover:bg-surface-hover"
      } ${isLose ? "cursor-default" : "cursor-pointer"}`}
    >
      <CheckMark result={mission.result} />

      <span className="min-w-0 flex-1">
        <span
          className={`block truncate text-[15px] ${
            isLose ? "text-content-dim line-through" : "text-content"
          }`}
        >
          {mission.name}
        </span>
        {target && (
          <span className="mt-0.5 block text-xs text-content-dim tnum">{target}</span>
        )}
      </span>

      {mission.categoryName && (
        <span className="shrink-0 rounded-md bg-surface-hover px-2 py-1 text-[11px] text-content-dim">
          {mission.categoryName}
        </span>
      )}
    </button>
  );
}

function CheckMark({ result }: { result: TodayMission["result"] }) {
  if (result === "WIN") {
    return (
      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-win-3 text-on-accent">
        <svg viewBox="0 0 20 20" fill="none" className="size-3.5" aria-hidden>
          <path
            d="M4 10.5l4 4 8-9"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    );
  }

  if (result === "LOSE") {
    return (
      <span className="flex size-6 shrink-0 items-center justify-center rounded-full border border-border-strong text-content-dim">
        <svg viewBox="0 0 20 20" fill="none" className="size-3" aria-hidden>
          <path
            d="M5 5l10 10M15 5L5 15"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </svg>
      </span>
    );
  }

  return <span className="size-6 shrink-0 rounded-full border-2 border-border-strong" />;
}
