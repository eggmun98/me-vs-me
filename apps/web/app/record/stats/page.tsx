"use client";

import { useState } from "react";
import { RecordTabs } from "@/domains/record/RecordTabs";
import { StatsView } from "@/domains/record/stats/StatsView";
import type { StatsPeriod } from "@/domains/record/stats/statsTypes";
import { useStats } from "@/domains/record/useRecords";
import { QueryState } from "@/shared/ui/QueryState";

export default function StatsPage() {
  const [period, setPeriod] = useState<StatsPeriod>("ALL");
  const { data: stats, isLoading, error } = useStats(period);

  return (
    <div className="mx-auto max-w-2xl px-6 py-8">
      <RecordTabs />

      <QueryState isLoading={isLoading} error={error}>
        {stats && <StatsView stats={stats} period={period} onPeriodChange={setPeriod} />}
      </QueryState>
    </div>
  );
}
