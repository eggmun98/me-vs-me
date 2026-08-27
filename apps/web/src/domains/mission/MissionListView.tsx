"use client";

import { toRepeatRule } from "@nadaena/core";
import { useState } from "react";
import { MissionDeleteModal } from "./MissionDeleteModal";
import { MissionFormModal } from "./MissionFormModal";
import { MissionRow } from "./MissionRow";
import type { Mission, MissionDraft } from "./missionTypes";

export function MissionListView({
  baseDate,
  missions,
  onCreate,
  onUpdate,
  onDelete,
}: {
  baseDate: string;
  missions: Mission[];
  onCreate: (draft: MissionDraft) => void;
  onUpdate: (id: string, draft: MissionDraft) => void;
  onDelete: (id: string) => void;
}) {
  const [editing, setEditing] = useState<Mission | null>(null);
  const [deleting, setDeleting] = useState<Mission | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const active = missions.filter((mission) => mission.isActive);
  const inactive = missions.filter((mission) => !mission.isActive);

  return (
    <>
      <header className="mb-5 flex items-center justify-between">
        <h1 className="text-lg font-bold">내 미션</h1>
        <button
          type="button"
          onClick={() => setIsCreating(true)}
          className="rounded-lg bg-accent px-3.5 py-2 text-sm font-semibold text-on-accent transition-opacity hover:opacity-85"
        >
          + 추가
        </button>
      </header>

      <div className="flex flex-col gap-6">
        <MissionGroup title="활성" missions={active} onEdit={setEditing} onDelete={setDeleting} />
        {inactive.length > 0 && (
          <MissionGroup
            title="비활성"
            missions={inactive}
            onEdit={setEditing}
            onDelete={setDeleting}
          />
        )}
      </div>

      {isCreating && (
        <MissionFormModal
          baseDate={baseDate}
          onSubmit={(draft) => {
            onCreate(draft);
            setIsCreating(false);
          }}
          onClose={() => setIsCreating(false)}
        />
      )}

      {editing && (
        <MissionFormModal
          baseDate={baseDate}
          initial={toDraft(editing)}
          onSubmit={(draft) => {
            onUpdate(editing.id, draft);
            setEditing(null);
          }}
          onClose={() => setEditing(null)}
        />
      )}

      {deleting && (
        <MissionDeleteModal
          mission={deleting}
          appliedFrom={formatNextDay(baseDate)}
          onConfirm={() => {
            onDelete(deleting.id);
            setDeleting(null);
          }}
          onClose={() => setDeleting(null)}
        />
      )}
    </>
  );
}

function MissionGroup({
  title,
  missions,
  onEdit,
  onDelete,
}: {
  title: string;
  missions: Mission[];
  onEdit: (mission: Mission) => void;
  onDelete: (mission: Mission) => void;
}) {
  return (
    <section>
      <h2 className="mb-2 text-xs font-semibold text-content-dim tnum">
        {title} ({missions.length})
      </h2>
      <div className="flex flex-col gap-2">
        {missions.map((mission) => (
          <MissionRow
            key={mission.id}
            mission={mission}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </section>
  );
}

function toDraft(mission: Mission): MissionDraft {
  const { id: _id, isActive: _isActive, categoryName: _categoryName, ...rest } = mission;

  return { ...rest, repeat: toRepeatRule(mission.repeat) };
}

function formatNextDay(isoDate: string): string {
  const next = new Date(`${isoDate}T00:00:00Z`);
  next.setUTCDate(next.getUTCDate() + 1);

  return `${next.getUTCMonth() + 1}월 ${next.getUTCDate()}일`;
}
