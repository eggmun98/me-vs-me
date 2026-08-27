"use client";

import { ProgressGauge } from "./ProgressGauge";
import { TodayMissionList } from "./TodayMissionList";
import { formatKoreanDate, getResultLabel } from "./todayLabels";
import type { TodayResponse } from "./todayTypes";

export function TodayView({
  today,
  onToggleMission,
}: {
  today: TodayResponse;
  onToggleMission: (id: string) => void;
}) {
  if (today.result === "REST") return <RestState today={today} />;
  if (today.missions.length === 0) return <NoMissionState today={today} />;

  return (
    <section className="flex flex-col gap-5">
      <EditableDatesNotice today={today} />

      <div className="rounded-2xl border border-border bg-surface p-5">
        <p className="text-sm text-content-dim tnum">{formatKoreanDate(today.date)}</p>

        <div className="mt-2 mb-5 flex items-baseline justify-between">
          <h1 className="text-lg font-bold">오늘의 승부</h1>
          <ResultBadge today={today} />
        </div>

        <ProgressGauge
          result={today.result}
          winCount={today.winCount}
          totalCount={today.totalCount}
          rate={today.rate}
        />

        {today.isWinConfirmed && today.result === "IN_PROGRESS" && (
          <div className="mt-5">
            <WinConfirmedNote today={today} />
          </div>
        )}
      </div>

      <TodayMissionList missions={today.missions} onToggle={onToggleMission} />

      <ReflectionBox reflection={today.reflection} />
    </section>
  );
}

function ResultBadge({ today }: { today: TodayResponse }) {
  const isWin = today.isWinConfirmed || today.result === "WIN";
  const isPerfect = today.rate >= 1;
  const label = getResultLabel(isWin ? "WIN" : today.result);

  return (
    <span
      className={`text-sm font-bold tracking-wide ${
        isPerfect ? "text-win-3" : label.toneClassName
      }`}
    >
      {isWin && "🏆 "}
      {isPerfect ? "PERFECT" : label.text}
    </span>
  );
}

/**
 * 달성률의 분모가 고정이라 완료 수만으로 승리가 결정된다.
 * 좋은 소식은 자정까지 미루지 않는다. (05-screens 4.2)
 */
function WinConfirmedNote({ today }: { today: TodayResponse }) {
  const remaining = today.totalCount - today.winCount;

  return (
    <p className="rounded-xl border border-win-1 bg-win-1/25 px-4 py-3 text-sm text-content-muted">
      <span className="font-semibold text-win-3">오늘 승리했습니다.</span>{" "}
      남은 {remaining}개는 더 해도 좋습니다.
    </p>
  );
}

/** 없으면 7일 수정 규칙이 사실상 죽는다. 사용자는 기록 화면에 잘 들어가지 않는다. (05-screens 4.6) */
function EditableDatesNotice({ today }: { today: TodayResponse }) {
  const target = today.editableDates[0];
  if (!target) return null;

  // 기한은 앱이 아는 "오늘"로 센다. 기기 시계를 믿지 않는다. (07-api.md 8장)
  const daysLeft = countDaysLeft(target.editableUntil, today.date);

  return (
    <button
      type="button"
      className="flex items-center justify-between rounded-2xl border border-border bg-surface px-4 py-3 text-left text-sm transition-colors hover:bg-surface-hover"
    >
      <span className="text-content-muted">
        {formatShortDate(target.date, today.date)}에 체크하지 않은 미션이 {target.loseCount}개
        있습니다.
      </span>
      <span className="shrink-0 text-xs text-content-dim tnum">D-{daysLeft}</span>
    </button>
  );
}

function RestState({ today }: { today: TodayResponse }) {
  return (
    <section className="flex flex-col gap-6 rounded-2xl border border-border bg-surface p-6">
      <header>
        <p className="text-sm text-content-dim tnum">{formatKoreanDate(today.date)}</p>
        <h1 className="mt-2 text-lg font-bold">오늘은 쉬는 날입니다</h1>
      </header>

      <p className="text-sm leading-relaxed text-content-muted">
        예정된 미션이 없습니다.
        <br />
        <span className="text-content">연승은 그대로 유지됩니다.</span>
      </p>

      <button
        type="button"
        className="self-start rounded-lg border border-border-strong px-4 py-2.5 text-sm text-content transition-colors hover:bg-surface-hover"
      >
        오늘 미션 추가하기
      </button>
    </section>
  );
}

function NoMissionState({ today }: { today: TodayResponse }) {
  return (
    <section className="flex flex-col gap-6 rounded-2xl border border-border bg-surface p-6">
      <header>
        <p className="text-sm text-content-dim tnum">{formatKoreanDate(today.date)}</p>
        <h1 className="mt-2 text-lg font-bold">아직 승부가 없습니다</h1>
      </header>

      <p className="text-sm leading-relaxed text-content-muted">
        매일 할 일을 정하면 오늘부터 기록이 시작됩니다.
      </p>

      <button
        type="button"
        className="self-start rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-on-accent transition-opacity hover:opacity-85"
      >
        첫 미션 만들기
      </button>
    </section>
  );
}

function ReflectionBox({ reflection }: { reflection: string | null }) {
  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-sm font-semibold text-content-muted">한 줄 회고</h2>
      <textarea
        defaultValue={reflection ?? ""}
        rows={2}
        placeholder="오늘 하루는 어땠나요?"
        className="w-full resize-none rounded-2xl border border-border bg-surface px-4 py-3.5 text-sm leading-relaxed text-content placeholder:text-content-dim focus:border-border-strong focus:outline-none"
      />
    </div>
  );
}

/** 어제면 "어제", 아니면 날짜로 쓴다. 5일 전 기록을 어제라고 하면 안 된다. */
function formatShortDate(date: string, today: string): string {
  if (countDaysBetween(date, today) === 1) return "어제";

  const [, month, day] = date.split("-").map(Number);

  return `${month}월 ${day}일`;
}

function countDaysBetween(from: string, to: string): number {
  return Math.round(
    (new Date(`${to}T00:00:00Z`).getTime() - new Date(`${from}T00:00:00Z`).getTime()) /
      86_400_000,
  );
}

function countDaysLeft(untilDate: string, today: string): number {
  const diff =
    new Date(`${untilDate}T00:00:00Z`).getTime() - new Date(`${today}T00:00:00Z`).getTime();

  return Math.max(0, Math.round(diff / 86_400_000));
}
