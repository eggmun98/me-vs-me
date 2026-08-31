import { useToday, useUpdateMissionResult } from "@nadaena/api-client";
import { router } from "expo-router";
import { TodayView } from "@/domains/today/TodayView";
import { Screen } from "@/shared/ui/Screen";
import { QueryState } from "@/shared/ui/QueryState";

export default function TodayScreen() {
  const today = useToday();
  const updateResult = useUpdateMissionResult();

  return (
    <Screen onRefresh={() => void today.refetch()} isRefreshing={today.isRefetching}>
      <QueryState
        data={today.data}
        isLoading={today.isLoading}
        error={today.error}
        onRetry={() => today.refetch()}
      >
        {(data) => (
          <TodayView
            today={data}
            onAddMission={() => router.push("/missions")}
            onToggleMission={(id) => {
              const mission = data.missions.find((item) => item.id === id);
              if (!mission) return;

              // 토글이 아니라 상태 지정이다. 같은 요청을 두 번 보내도 결과가 같다. (07-api.md 4장)
              updateResult.mutate({ id, result: mission.result === "WIN" ? "PENDING" : "WIN" });
            }}
          />
        )}
      </QueryState>
    </Screen>
  );
}
