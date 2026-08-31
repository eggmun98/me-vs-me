import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPatch, apiPut } from "../client/apiClient";
import { queryKeys } from "../queryKeys";
import type { TodayResponse, UpdateMissionResultResponse } from "./todayTypes";

export function useToday() {
  return useQuery({
    queryKey: queryKeys.today,
    queryFn: () => apiGet<TodayResponse>("/today"),
  });
}

/**
 * 체크는 토글이 아니라 상태 지정이다. 재시도해도 결과가 같아야 한다. (07-api.md 4장)
 *
 * 응답에 재계산된 값이 들어 있어 다시 조회하지 않는다.
 * 다시 부르면 왕복이 두 번이 되고 그 사이 화면 숫자가 어긋난다.
 */
export function useUpdateMissionResult() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, result }: { id: string; result: "WIN" | "PENDING" }) =>
      apiPatch<UpdateMissionResultResponse>(`/daily-missions/${id}`, { result }),

    onSuccess(response) {
      queryClient.setQueryData<TodayResponse>(queryKeys.today, (previous) => {
        if (!previous) return previous;

        return {
          ...previous,
          ...response.daily,
          missions: previous.missions.map((mission) =>
            mission.id === response.dailyMission.id
              ? { ...mission, result: response.dailyMission.result }
              : mission,
          ),
          summary: response.summary,
        };
      });

      // 기록·통계는 서버가 다시 집계해야 한다.
      queryClient.invalidateQueries({ queryKey: queryKeys.records });
    },
  });
}

export function useUpdateReflection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ date, reflection }: { date: string; reflection: string }) =>
      apiPut<{ date: string; reflection: string }>(`/daily-records/${date}/reflection`, {
        reflection,
      }),

    onSuccess(response) {
      queryClient.setQueryData<TodayResponse>(queryKeys.today, (previous) =>
        previous ? { ...previous, reflection: response.reflection } : previous,
      );
    },
  });
}
