"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { loginWithSocial } from "@/domains/auth/authApi";
import type { SocialProviderId } from "@/domains/auth/authTypes";

export default function AuthCallbackPage() {
  const params = useParams<{ provider: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  // React 18 개발 모드는 effect 를 두 번 실행한다. 인가 코드는 한 번만 쓸 수 있다.
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const code = searchParams.get("code");
    const provider = params.provider as SocialProviderId;

    if (searchParams.get("error")) {
      setError("로그인이 취소되었습니다.");
      return;
    }

    if (!code) {
      setError("인가 코드가 없습니다.");
      return;
    }

    loginWithSocial(provider, code)
      .then((result) => router.replace(result.isNewUser ? "/onboarding" : "/today"))
      .catch((caught: unknown) => {
        setError(caught instanceof Error ? caught.message : "로그인에 실패했습니다.");
      });
  }, [params.provider, router, searchParams]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      {error ? (
        <>
          <p className="text-sm font-semibold">로그인하지 못했습니다</p>
          <p className="max-w-xs text-xs leading-relaxed text-content-muted">{error}</p>
          <button
            type="button"
            onClick={() => router.replace("/login")}
            className="rounded-lg border border-border-strong px-4 py-2 text-sm transition-colors hover:bg-surface-hover"
          >
            다시 시도
          </button>
        </>
      ) : (
        <p className="text-sm text-content-dim">로그인 중…</p>
      )}
    </main>
  );
}
