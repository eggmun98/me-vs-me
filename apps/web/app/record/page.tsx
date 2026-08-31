"use client";

import { useMemo, useState } from "react";
import { MissionFormModal } from "@/domains/mission/MissionFormModal";
import { type GrassDay, type MissionDraft, useCreateMission, useGrass, useMissions, useToday } from "@nadaena/api-client";
import { CalendarView } from "@/domains/record/calendar/CalendarView";
import { RecordTabs } from "@/domains/record/RecordTabs";
import { QueryState } from "@/shared/ui/QueryState";

export default function RecordPage() {
  const { data: today, isLoading: isTodayLoading, error: todayError } = useToday();
  const { data: missionList } = useMissions();
  const year = Number(today?.date.slice(0, 4) ?? new Date().getFullYear());
  const { data: grass, isLoading: isGrassLoading } = useGrass(year);
  const createMission = useCreateMission();
  const [onceDate, setOnceDate] = useState<string | null>(null);

  // 연간 기록을 한 번 받아두면 일·주·월 뷰가 모두 이 안에서 해결된다.
  const records = useMemo(() => toRecordMap(grass?.days ?? []), [grass]);
  const missions = useMemo(
    () => [...(missionList?.active ?? []), ...(missionList?.inactive ?? [])],
    [missionList],
  );

  function addOnceMission(draft: MissionDraft) {
    createMission.mutate(draft);
    setOnceDate(null);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-8">
      <RecordTabs />

      <QueryState isLoading={isTodayLoading || isGrassLoading} error={todayError}>
        {today && (
          <CalendarView
            today={today.date}
            missions={missions}
            records={records}
            onAddOnce={setOnceDate}
          />
        )}
      </QueryState>

      {onceDate && (
        <MissionFormModal
          baseDate={onceDate}
          defaultRepeat={{ type: "ONCE", startDate: onceDate }}
          title={`${formatDayLabel(onceDate)} 미션 추가`}
          onSubmit={addOnceMission}
          onClose={() => setOnceDate(null)}
        />
      )}
    </div>
  );
}

function toRecordMap(days: GrassDay[]): Record<string, GrassDay> {
  return Object.fromEntries(days.filter((day) => day.result !== "NONE").map((day) => [day.date, day]));
}

function formatDayLabel(isoDate: string): string {
  const [, month, day] = isoDate.split("-").map(Number);

  return `${month}월 ${day}일`;
}
