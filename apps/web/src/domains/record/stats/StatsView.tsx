"use client";

import { useState } from "react";
import { type RecordStats, type StatsPeriod } from "@nadaena/api-client";

const PERIOD_OPTIONS: Array<{ value: StatsPeriod; label: string }> = [
  { value: "MONTH", label: "이번 달" },
  { value: "ALL", label: "전체" },
];

export function StatsView({
  stats,
  period,
  onPeriodChange,
}: {
  stats: RecordStats;
  period: StatsPeriod;
  onPeriodChange: (period: StatsPeriod) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <div className="flex rounded-lg border border-border p-0.5">
          {PERIOD_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onPeriodChange(option.value)}
              className={`rounded-md px-2.5 py-1 text-xs transition-colors ${
                period === option.value
                  ? "bg-accent font-semibold text-on-accent"
                  : "text-content-muted hover:text-content"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <Card>
        <Row
          label="일일 전적"
          value={`${stats.daily.count}전 ${stats.daily.win}승 ${stats.daily.draw}무 ${stats.daily.lose}패`}
          sub={`승률 ${toPercent(stats.daily.winRate)}`}
        />
        <Row
          label="미션 전적"
          value={`${stats.mission.total}전 ${stats.mission.win}승 ${stats.mission.lose}패`}
          sub={`승률 ${toPercent(stats.mission.rate)}`}
        />
        <Row
          label="활동일"
          value={`${stats.activeDays}일`}
          sub={`현재 ${stats.streak.current}연승 · 최장 ${stats.streak.longest}연승`}
        />
      </Card>

      <Card title="카테고리별 성공률">
        {stats.byCategory.map((category) => (
          <RateBar
            key={category.categoryName}
            label={category.categoryName}
            rate={category.rate}
            detail={`${category.win}/${category.total}`}
          />
        ))}
      </Card>

      <Card title="미션별 성공률">
        {stats.byMission.map((mission, index) => (
          <RateBar
            key={mission.missionId}
            label={mission.name}
            rate={mission.rate}
            detail={`${mission.win}/${mission.total}`}
            note={index === 0 && stats.byMission.length > 1 ? "가장 어려움" : undefined}
          />
        ))}
      </Card>

      <Card title="월별 승률">
        <MonthTrend months={stats.byMonth} />
      </Card>
    </div>
  );
}

function Card({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-surface p-5">
      {title && <h2 className="mb-3.5 text-xs font-semibold text-content-dim">{title}</h2>}
      <div className="flex flex-col gap-3">{children}</div>
    </section>
  );
}

function Row({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-sm text-content-muted">{label}</span>
      <span className="text-right">
        <span className="block text-sm font-semibold tnum">{value}</span>
        <span className="block text-xs text-content-dim tnum">{sub}</span>
      </span>
    </div>
  );
}

function RateBar({
  label,
  rate,
  detail,
  note,
}: {
  label: string;
  rate: number;
  detail: string;
  note?: string;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-2">
        <span className="truncate text-sm">
          {label}
          {note && <span className="ml-1.5 text-[11px] text-content-dim">{note}</span>}
        </span>
        <span className="shrink-0 text-xs text-content-muted tnum">
          {toPercent(rate)} <span className="text-content-dim">({detail})</span>
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-rest">
        <div
          className="h-full rounded-full bg-win-2"
          style={{ width: `${Math.round(rate * 100)}%` }}
        />
      </div>
    </div>
  );
}

function MonthTrend({ months }: { months: Array<{ month: string; winRate: number }> }) {
  if (months.length === 0) {
    return <p className="text-sm text-content-dim">기록이 없습니다.</p>;
  }

  return (
    <div className="flex items-end gap-2">
      {months.map((month) => (
        <div key={month.month} className="flex flex-1 flex-col items-center gap-1.5">
          <span className="text-[10px] text-content-muted tnum">
            {toPercent(month.winRate)}
          </span>
          <div className="flex h-20 w-full items-end">
            <div
              className="w-full rounded-t bg-win-2"
              style={{ height: `${Math.max(4, Math.round(month.winRate * 100))}%` }}
            />
          </div>
          <span className="text-[10px] text-content-dim tnum">
            {Number(month.month.split("-")[1])}월
          </span>
        </div>
      ))}
    </div>
  );
}

function toPercent(rate: number): string {
  return `${(rate * 100).toFixed(1)}%`;
}
