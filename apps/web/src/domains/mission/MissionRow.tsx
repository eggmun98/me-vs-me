"use client";

import { describeRepeat, toRepeatRule } from "@nadaena/core";
import { type Mission } from "@nadaena/api-client";

export function MissionRow({
  mission,
  onEdit,
  onDelete,
}: {
  mission: Mission;
  onEdit: (mission: Mission) => void;
  onDelete: (mission: Mission) => void;
}) {
  const target =
    mission.targetAmount !== null && mission.unit !== null
      ? `${mission.targetAmount}${mission.unit}`
      : null;

  return (
    <div
      className={`flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3.5 ${
        mission.isActive ? "" : "opacity-55"
      }`}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="truncate text-[15px] font-semibold">{mission.name}</span>
          {target && <span className="shrink-0 text-xs text-content-dim tnum">{target}</span>}
        </div>
        <div className="mt-1 flex items-center gap-2 text-xs text-content-muted">
          <span className="rounded bg-surface-hover px-1.5 py-0.5 text-[11px] text-content-dim">
            {mission.categoryName}
          </span>
          <span>{describeRepeat(toRepeatRule(mission.repeat))}</span>
        </div>
      </div>

      <button
        type="button"
        onClick={() => onEdit(mission)}
        className="shrink-0 rounded-lg px-2.5 py-1.5 text-xs text-content-muted transition-colors hover:bg-surface-hover hover:text-content"
      >
        수정
      </button>
      <button
        type="button"
        onClick={() => onDelete(mission)}
        className="shrink-0 rounded-lg px-2.5 py-1.5 text-xs text-content-dim transition-colors hover:bg-surface-hover hover:text-content"
      >
        삭제
      </button>
    </div>
  );
}
