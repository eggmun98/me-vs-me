"use client";

import Link from "next/link";
import type { WinLoseCount } from "@/domains/today/todayTypes";
import { useToday } from "@/domains/today/useToday";
import { QueryState } from "@/shared/ui/QueryState";

export default function MyPage() {
  const { data: today, isLoading, error } = useToday();

  return (
    <div className="mx-auto max-w-2xl px-6 py-8">
      <QueryState isLoading={isLoading} error={error}>
        {today && (
          <section className="mb-4 rounded-2xl border border-border bg-surface p-5">
            <div className="flex items-center gap-4">
              <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-surface-hover text-lg">
                🙂
              </span>
              <div className="min-w-0">
                <p className="text-[15px] font-bold">문성진</p>
                <p className="mt-0.5 text-xs text-content-muted">오늘도 나와 싸운다</p>
                <p className="mt-1.5 text-sm font-bold text-win-3 tnum">
                  🔥 현재 {today.summary.streak.current}연승
                </p>
              </div>
            </div>

            <dl className="mt-5 grid grid-cols-2 gap-3 border-t border-border pt-4">
              <RecordStat label="이번 달" record={today.summary.month} />
              <RecordStat label="통산" record={today.summary.total} />
            </dl>
          </section>
        )}
      </QueryState>

      <nav className="flex flex-col gap-2">
        <MenuLink href="/my/missions" label="내 미션" />
        <MenuLink href="/record" label="내 기록" />
        <MenuLink href="/my/settings" label="설정" />
      </nav>
    </div>
  );
}

function RecordStat({ label, record }: { label: string; record: WinLoseCount }) {
  return (
    <div>
      <dt className="text-xs text-content-dim">{label}</dt>
      <dd className="mt-1 text-sm font-semibold tnum">
        {record.win}승 {record.draw > 0 && `${record.draw}무 `}
        {record.lose}패
      </dd>
      <dd className="text-xs text-content-muted tnum">
        승률 {(record.winRate * 100).toFixed(1)}%
      </dd>
    </div>
  );
}

function MenuLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3.5 text-sm transition-colors hover:bg-surface-hover"
    >
      {label}
      <span className="text-content-dim">›</span>
    </Link>
  );
}
