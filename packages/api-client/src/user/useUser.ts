import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPatch, apiPost } from "../client/apiClient";
import { queryKeys } from "../queryKeys";
import type { Me, OnboardingRequest } from "./userTypes";

export function useMe(enabled = true) {
  return useQuery({
    queryKey: queryKeys.me,
    queryFn: () => apiGet<Me>("/users/me"),
    enabled,
  });
}

export function useSuggestNickname() {
  return useMutation({
    mutationFn: () => apiGet<{ nickname: string }>("/users/nickname/random"),
  });
}

export function useCheckNickname() {
  return useMutation({
    mutationFn: (nickname: string) =>
      apiGet<{ available: boolean }>(
        `/users/nickname/check?nickname=${encodeURIComponent(nickname)}`,
      ),
  });
}

export function useCompleteOnboarding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: OnboardingRequest) => apiPost<Me>("/users/me/onboarding", request),
    onSuccess() {
      queryClient.invalidateQueries();
    },
  });
}

export function useUpdateMe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (patch: { nickname?: string; bio?: string; timezone?: string }) =>
      apiPatch<Me>("/users/me", patch),
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: queryKeys.me });
      queryClient.invalidateQueries({ queryKey: queryKeys.today });
    },
  });
}
