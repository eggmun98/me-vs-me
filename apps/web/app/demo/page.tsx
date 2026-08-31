"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { SummarySide } from "@/domains/record/SummarySide";
import { StatsView } from "@/domains/record/stats/StatsView";
import { TodayView } from "@/domains/today/TodayView";
import { apiGet, queryKeys } from "@nadaena/api-client";
import type { DemoTour } from "@/domains/landing/landingApi";
import { QueryState } from "@/shared/ui/QueryState";

type DemoTab = "TODAY" | "STATS";

export default function DemoPage() {
  const [tab, setTab] = useState<DemoTab>("TODAY");
  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.demoTour,
    queryFn: () => apiGet<DemoTour>("/public/demo/tour"),
  });

  return (
    <div className="min-h-screen">
      <DemoBanner />

      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
        <nav className="mb-5 flex gap-1">
          <TabButton isOn={tab === "TODAY"} onClick={() => setTab("TODAY")}>
            오늘
          </TabButton>
          <TabButton isOn={tab === "STATS"} onClick={() => setTab("STATS")}>
            통계
          </TabButton>
        </nav>

        <QueryState isLoading={isLoading} error={error}>
          {data && tab === "TODAY" && (
            <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
              <div className="min-w-0 flex-1">
                <TodayView
                  today={{ ...data.today, summary: data.summary }}
                  onToggleMission={() => undefined}
                />
              </div>
              <aside className="w-full shrink-0 lg:w-60">
                <div className="rounded-2xl border border-border bg-surface p-5">
                  <SummarySide summary={data.summary} />
                </div>
              </aside>
            </div>
          )}

          {data && tab === "STATS" && (
            <StatsView stats={data.stats} period="ALL" onPeriodChange={() => undefined} />
          )}
        </QueryState>
      </div>
    </div>
  );
}

/** 남의 기록을 보고 있다는 걸 계속 알려준다. 자기 기록으로 착각하면 안 된다. */
function DemoBanner() {
  return (
    <div className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-3 border-b border-border bg-surface px-6 py-3">
      <p className="text-xs text-content-muted">
        둘러보기 — 다른 사람의 기록입니다. 체크는 되지 않습니다.
      </p>
      <div className="flex gap-2">
        <Link
          href="/"
          className="rounded-lg px-3 py-1.5 text-xs text-content-muted transition-colors hover:bg-surface-hover"
        >
          돌아가기
        </Link>
        <Link
          href="/login"
          className="rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-on-accent transition-opacity hover:opacity-85"
        >
          내 기록 시작하기
        </Link>
      </div>
    </div>
  );
}

function TabButton({
  isOn,
  onClick,
  children,
}: {
  isOn: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
        isOn
          ? "bg-accent font-semibold text-on-accent"
          : "text-content-muted hover:bg-surface-hover hover:text-content"
      }`}
    >
      {children}
    </button>
  );
}
