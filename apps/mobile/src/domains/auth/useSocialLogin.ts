import { loginWithSocial, type SocialProviderId } from "@nadaena/api-client";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { requestSocialToken } from "./socialLogin";
import { describeToken, logSocialFailure } from "./socialLoginDebug";

export type SocialLoginState = {
  pendingProvider: SocialProviderId | null;
  error: string | null;
};

/**
 * 로그인 한 흐름을 담는다. 네이티브 SDK 로 토큰을 받고, 서버에 넘겨 우리 세션으로 바꾼다.
 * `isNewUser` 를 돌려주면 화면이 온보딩으로 보낼지 오늘로 보낼지 정한다.
 */
export function useSocialLogin() {
  const queryClient = useQueryClient();
  const [state, setState] = useState<SocialLoginState>({ pendingProvider: null, error: null });

  async function signIn(provider: SocialProviderId): Promise<{ isNewUser: boolean } | null> {
    setState({ pendingProvider: provider, error: null });

    const authorized = await requestSocialToken(provider);

    if (authorized.type !== "success") {
      // 사용자가 스스로 닫은 건 오류가 아니다. 빨간 문구를 띄우지 않는다.
      setState({
        pendingProvider: null,
        error: authorized.type === "error" ? authorized.message : null,
      });

      return null;
    }

    try {
      const result = await loginWithSocial(provider, { token: authorized.token });

      // 이전 계정의 캐시가 남아 있으면 남의 기록이 잠깐 보인다.
      queryClient.clear();
      setState({ pendingProvider: null, error: null });

      return { isNewUser: result.isNewUser };
    } catch (error) {
      // 토큰은 받았는데 서버가 거절한 경우다. 화면 문구만으로는 이유를 알 수 없다.
      logSocialFailure(provider, "서버 검증", error, describeToken(provider, authorized.token));

      setState({
        pendingProvider: null,
        error: error instanceof Error ? error.message : "로그인에 실패했습니다.",
      });

      return null;
    }
  }

  return { ...state, signIn };
}
