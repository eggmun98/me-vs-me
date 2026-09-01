import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteAccount } from "../auth/authApi";
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

/**
 * 회원탈퇴.
 *
 * 성공하면 캐시를 통째로 비운다. 남겨두면 로그인 화면으로 돌아간 뒤에도
 * 지워진 계정의 미션과 기록이 잠깐 비쳐 보인다.
 */
export function useDeleteAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => deleteAccount(),
    onSuccess() {
      queryClient.clear();
    },
  });
}
