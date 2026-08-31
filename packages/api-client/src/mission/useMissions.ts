import { toRepeatPayload } from "@nadaena/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiDelete, apiGet, apiPatch, apiPost } from "../client/apiClient";
import { queryKeys } from "../queryKeys";
import type { Category, Mission, MissionDraft, MissionListResponse } from "./missionTypes";

export function useMissions() {
  return useQuery({
    queryKey: queryKeys.missions,
    queryFn: () => apiGet<MissionListResponse>("/missions"),
  });
}

export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories,
    queryFn: () => apiGet<Category[]>("/categories"),
    staleTime: Number.POSITIVE_INFINITY,
  });
}

export function useCreateMission() {
  return useInvalidatingMutation((draft: MissionDraft) =>
    apiPost<Mission>("/missions", toRequestBody(draft)),
  );
}

export function useUpdateMission() {
  return useInvalidatingMutation(({ id, draft }: { id: string; draft: MissionDraft }) =>
    apiPatch<Mission>(`/missions/${id}`, toRequestBody(draft)),
  );
}

function toRequestBody(draft: MissionDraft) {
  return { ...draft, repeat: toRepeatPayload(draft.repeat) };
}

/** 오늘 승부에는 남고 내일부터 빠진다. 응답의 appliedFrom 이 그 날짜다. (01-service-plan 6.5) */
export function useDeleteMission() {
  return useInvalidatingMutation((id: string) =>
    apiDelete<{ appliedFrom: string }>(`/missions/${id}`),
  );
}

/**
 * 미션이 바뀌면 오늘 화면과 기록이 함께 달라진다.
 * 화면마다 따로 갱신하면 어긋나므로 관련 쿼리를 한꺼번에 무효화한다.
 */
function useInvalidatingMutation<TVariables, TResult>(
  mutationFn: (variables: TVariables) => Promise<TResult>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: queryKeys.missions });
      queryClient.invalidateQueries({ queryKey: queryKeys.today });
      queryClient.invalidateQueries({ queryKey: queryKeys.records });
    },
  });
}
