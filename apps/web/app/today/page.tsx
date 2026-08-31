"use client";

import { useState } from "react";
import { SummarySide } from "@/domains/record/SummarySide";
import { TODAY_SCENARIOS, type TodayScenarioName } from "@/domains/today/todayMock";
import { TodayView } from "@/domains/today/TodayView";
import { useToday, useUpdateMissionResult } from "@nadaena/api-client";
import { ScenarioSwitcher } from "@/shared/ui/ScenarioSwitcher";
import { QueryState } from "@/shared/ui/QueryState";

export default function TodayPage() {
  const { data: live, isLoading, error } = useToday();
  const updateMission = useUpdateMissionResult();
  // 디자인 확인용. 승·무·패는 자정이 지나야 나오는 상태라 실제 데이터로 만들 수 없다.
  const [scenario, setScenario] = useState<TodayScenarioName | null>(null);

  const today =
    live && scenario !== null ? { ...TODAY_SCENARIOS[scenario], summary: live.summary } : live;

  return (
    <>
      <ScenarioSwitcher
        names={Object.keys(TODAY_SCENARIOS) as TodayScenarioName[]}
        selected={scenario}
        onSelect={setScenario}
      />

      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8 lg:flex-row lg:gap-8">
        <div className="min-w-0 flex-1">
          <QueryState isLoading={isLoading} error={error}>
            {today && (
              <TodayView
                today={today}
                onToggleMission={(id) => {
                  const mission = today.missions.find((item) => item.id === id);
                  if (!mission || scenario !== null) return;

                  updateMission.mutate({
                    id,
                    result: mission.result === "WIN" ? "PENDING" : "WIN",
                  });
                }}
              />
            )}
          </QueryState>
        </div>

        <aside className="w-full shrink-0 lg:w-60">
          <div className="rounded-2xl border border-border bg-surface p-5">
            {today && <SummarySide summary={today.summary} />}
          </div>
        </aside>
      </div>
    </>
  );
}
