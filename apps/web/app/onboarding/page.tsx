"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useCategories } from "@/domains/mission/useMissions";
import {
  countRequiredWins,
  RECOMMENDED_COUNT,
  RECOMMENDED_MISSIONS,
  toOnboardingMission,
} from "@/domains/user/onboardingPresets";
import { useCompleteOnboarding, useMe, useSuggestNickname } from "@/domains/user/useUser";
import { Field, inputClassName } from "@/shared/ui/Field";

const TIMEZONES = ["Asia/Seoul", "Asia/Tokyo", "America/New_York", "Europe/London", "UTC"];

export default function OnboardingPage() {
  const router = useRouter();
  const { data: me } = useMe();
  const { data: categories = [] } = useCategories();
  const suggestNickname = useSuggestNickname();
  const completeOnboarding = useCompleteOnboarding();

  const [nickname, setNickname] = useState("");
  const [timezone, setTimezone] = useState("Asia/Seoul");
  const [selected, setSelected] = useState<string[]>(["운동"]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (me?.isOnboarded) router.replace("/today");
  }, [me?.isOnboarded, router]);

  // 타임존은 브라우저가 아는 값을 기본으로 두고 확인만 받는다.
  useEffect(() => {
    const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (detected) setTimezone(detected);
  }, []);

  useEffect(() => {
    if (me?.nickname && !nickname) setNickname(me.nickname);
  }, [me?.nickname, nickname]);

  function toggleMission(name: string) {
    setSelected((prev) =>
      prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name],
    );
  }

  function submit() {
    setError(null);

    const today = new Date().toISOString().slice(0, 10);
    const missions = RECOMMENDED_MISSIONS.filter((preset) => selected.includes(preset.name)).map(
      (preset) =>
        toOnboardingMission(
          preset,
          categories.find((category) => category.name === preset.categoryName)?.id ?? null,
          today,
        ),
    );

    completeOnboarding.mutate(
      { nickname: nickname.trim(), timezone, missions },
      {
        onSuccess: () => router.replace("/today"),
        onError: (caught) =>
          setError(caught instanceof Error ? caught.message : "저장하지 못했습니다."),
      },
    );
  }

  const isTooMany = selected.length > RECOMMENDED_COUNT.max;
  const canSubmit = nickname.trim().length > 0 && selected.length > 0;

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
      <header className="mb-8">
        <p className="text-xs font-semibold text-content-dim">시작하기</p>
        <h1 className="mt-1.5 text-xl font-bold tracking-tight">오늘부터 나와 싸웁니다</h1>
      </header>

      <div className="flex flex-col gap-6">
        <Field label="닉네임" hint="기록을 공개할 때 보이는 이름입니다.">
          <div className="flex gap-2">
            <input
              value={nickname}
              onChange={(event) => setNickname(event.target.value)}
              maxLength={20}
              placeholder="문성진"
              className={inputClassName}
            />
            <button
              type="button"
              onClick={() =>
                suggestNickname.mutate(undefined, {
                  onSuccess: (result) => setNickname(result.nickname),
                })
              }
              className="shrink-0 rounded-lg border border-border px-3 text-xs text-content-muted transition-colors hover:bg-surface-hover"
            >
              추천
            </button>
          </div>
        </Field>

        <Field label="하루의 기준" hint="자정이 지나면 그날 승부가 확정됩니다.">
          <select
            value={timezone}
            onChange={(event) => setTimezone(event.target.value)}
            className={inputClassName}
          >
            {[...new Set([timezone, ...TIMEZONES])].map((zone) => (
              <option key={zone} value={zone}>
                {zone}
              </option>
            ))}
          </select>
        </Field>

        <Field label="첫 미션">
          <div className="flex flex-wrap gap-2">
            {RECOMMENDED_MISSIONS.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => toggleMission(preset.name)}
                className={`rounded-lg border px-3 py-2 text-sm transition-colors ${
                  selected.includes(preset.name)
                    ? "border-accent bg-surface-hover font-semibold"
                    : "border-border text-content-muted hover:bg-surface-hover"
                }`}
              >
                {preset.name}
                {preset.targetAmount && (
                  <span className="ml-1 text-[11px] text-content-dim tnum">
                    {preset.targetAmount}
                    {preset.unit}
                  </span>
                )}
              </button>
            ))}
          </div>
        </Field>

        <WinConditionNote count={selected.length} isTooMany={isTooMany} />

        {error && (
          <p className="rounded-lg border border-border bg-surface px-3 py-2.5 text-xs text-content-muted">
            {error}
          </p>
        )}

        <button
          type="button"
          disabled={!canSubmit || completeOnboarding.isPending}
          onClick={submit}
          className="rounded-xl bg-accent px-4 py-3.5 text-sm font-semibold text-on-accent transition-opacity hover:opacity-85 disabled:opacity-40"
        >
          {completeOnboarding.isPending ? "만드는 중…" : "시작하기"}
        </button>

        <p className="text-center text-[11px] text-content-dim">
          미션은 언제든 추가하거나 바꿀 수 있습니다.
        </p>
      </div>
    </main>
  );
}

/**
 * 미션이 많을수록 승리 조건이 올라간다는 걸 숫자로 보여준다.
 * 이 서비스에서 첫날 과욕이 가장 큰 이탈 요인이다. (05-screens.md S2)
 */
function WinConditionNote({ count, isTooMany }: { count: number; isTooMany: boolean }) {
  if (count === 0) {
    return <p className="text-xs text-content-dim">하나 이상 골라 주세요.</p>;
  }

  return (
    <div
      className={`rounded-xl border px-3.5 py-3 text-xs leading-relaxed ${
        isTooMany ? "border-draw bg-draw/10" : "border-border bg-surface"
      }`}
    >
      <p className="text-content">
        미션 <span className="font-semibold tnum">{count}개</span> 중{" "}
        <span className="font-semibold tnum">{countRequiredWins(count)}개</span> 를 해내면 그날
        승리입니다.
      </p>
      {isTooMany && (
        <p className="mt-1.5 text-content-muted">
          처음에는 {RECOMMENDED_COUNT.min}~{RECOMMENDED_COUNT.max}개를 권합니다. 미션이 많을수록
          승리 조건도 올라갑니다.
        </p>
      )}
    </div>
  );
}
