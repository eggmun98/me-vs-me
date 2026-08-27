import Link from "next/link";
import { DemoGrassPreview } from "@/domains/landing/DemoGrassPreview";
import { fetchDemoGrass, fetchDemoTour } from "@/domains/landing/landingApi";

export const metadata = {
  title: "나 VS 나 — 오늘도 나와 싸운다",
  description:
    "매일의 목표를 승패로 기록하며 나 자신과 경쟁합니다. 실패도 지우지 않고 전적으로 남깁니다.",
};

export default async function LandingPage() {
  const year = new Date().getFullYear();
  const [tour, grass] = await Promise.all([fetchDemoTour(), fetchDemoGrass(year)]);

  return (
    <main className="mx-auto max-w-3xl px-6 py-20">
      <section className="text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">나 VS 나</h1>
        <p className="mt-3 text-base text-content-muted">오늘도 나와 싸운다.</p>
        <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-content-muted">
          해야 할 일을 해내면 <span className="font-semibold text-win-3">승</span>, 못 하면{" "}
          <span className="font-semibold text-lose">패</span>.
          <br />
          실패도 지우지 않고 전적으로 남깁니다.
        </p>

        <div className="mt-8 flex justify-center gap-2.5">
          <Link
            href="/login"
            className="rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-on-accent transition-opacity hover:opacity-85"
          >
            시작하기
          </Link>
          <Link
            href="/demo"
            className="rounded-xl border border-border-strong px-5 py-3 text-sm font-semibold transition-colors hover:bg-surface-hover"
          >
            둘러보기
          </Link>
        </div>
      </section>

      {grass && tour && (
        <section className="mt-16 rounded-2xl border border-border bg-surface p-5 sm:p-6">
          <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
            <p className="text-sm font-semibold">{tour.profile.nickname}님의 {year}년</p>
            <p className="text-xs text-content-muted tnum">
              {tour.summary.total.count}전 {tour.summary.total.win}승{" "}
              {tour.summary.total.draw}무 {tour.summary.total.lose}패 · 승률{" "}
              {(tour.summary.total.winRate * 100).toFixed(1)}%
            </p>
          </div>

          <div className="overflow-x-auto">
            <DemoGrassPreview days={grass.days} />
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-border pt-3 text-[10px] text-content-dim">
            <Legend className="bg-win-3" label="승" />
            <Legend className="bg-draw" label="무" />
            <Legend className="bg-lose" label="패" />
            <Legend className="bg-surface ring-1 ring-inset ring-border" label="쉬는 날" />
          </div>
        </section>
      )}

      <section className="mt-16 grid gap-4 sm:grid-cols-3">
        <Feature
          title="체크가 아닌 승부"
          body="해야 할 일을 체크하는 게 아니라, 매일 자신과 한 경기를 치릅니다."
        />
        <Feature
          title="실패도 기록이다"
          body="하루의 패배가 이전의 승리를 무효화하지 않습니다. 29승 1패는 여전히 29승입니다."
        />
        <Feature
          title="비교보다 자기 경쟁"
          body="경쟁 상대는 다른 사람이 아니라 어제의 나입니다."
        />
      </section>

      <footer className="mt-20 text-center text-[11px] text-content-dim">
        어제 졌다면 오늘 다시 붙으면 됩니다.
      </footer>
    </main>
  );
}

function Feature({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <h2 className="text-sm font-bold">{title}</h2>
      <p className="mt-2 text-xs leading-relaxed text-content-muted">{body}</p>
    </div>
  );
}

function Legend({ className, label }: { className: string; label: string }) {
  return (
    <span className="flex items-center gap-1">
      <span className={`size-2.5 rounded-[2px] ${className}`} />
      {label}
    </span>
  );
}
