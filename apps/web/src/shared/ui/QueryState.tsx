"use client";

import type { ReactNode } from "react";

/**
 * 로딩·에러를 한 군데서 다룬다.
 * 오늘 화면은 매일 여는 화면이라 첫 진입에 스피너가 여러 번 뜨면 그것만으로 이탈한다.
 */
export function QueryState({
  isLoading,
  error,
  children,
}: {
  isLoading: boolean;
  error: unknown;
  children: ReactNode;
}) {
  if (isLoading) return <Skeleton />;
  if (error) return <ErrorNotice error={error} />;

  return <>{children}</>;
}

function Skeleton() {
  return (
    <div className="flex flex-col gap-3">
      <div className="h-28 animate-pulse rounded-2xl bg-surface-hover" />
      <div className="h-14 animate-pulse rounded-xl bg-surface-hover" />
      <div className="h-14 animate-pulse rounded-xl bg-surface-hover" />
      <div className="h-14 animate-pulse rounded-xl bg-surface-hover" />
    </div>
  );
}

function ErrorNotice({ error }: { error: unknown }) {
  const message = error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.";

  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <p className="text-sm font-semibold">불러오지 못했습니다</p>
      <p className="mt-1.5 text-xs leading-relaxed text-content-muted">{message}</p>
      <p className="mt-3 text-[11px] text-content-dim">
        API 서버가 켜져 있는지 확인하세요. (pnpm dev:api)
      </p>
    </div>
  );
}
