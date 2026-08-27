"use client";

import { MissionListView } from "@/domains/mission/MissionListView";
import {
  useCreateMission,
  useDeleteMission,
  useMissions,
  useUpdateMission,
} from "@/domains/mission/useMissions";
import { useToday } from "@/domains/today/useToday";
import { QueryState } from "@/shared/ui/QueryState";

export default function MissionsPage() {
  const { data, isLoading, error } = useMissions();
  const { data: today } = useToday();
  const createMission = useCreateMission();
  const updateMission = useUpdateMission();
  const deleteMission = useDeleteMission();

  return (
    <div className="mx-auto max-w-2xl px-6 py-8">
      <QueryState isLoading={isLoading} error={error}>
        {data && today && (
          <MissionListView
            baseDate={today.date}
            missions={[...data.active, ...data.inactive]}
            onCreate={(draft) => createMission.mutate(draft)}
            onUpdate={(id, draft) => updateMission.mutate({ id, draft })}
            onDelete={(id) => deleteMission.mutate(id)}
          />
        )}
      </QueryState>
    </div>
  );
}
