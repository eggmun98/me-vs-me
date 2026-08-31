import { GrassLegend, MonthGrass } from "./MonthGrass";
import { type RecordSummary, type WinLoseCount } from "@nadaena/api-client";

export function SummarySide({ summary }: { summary: RecordSummary }) {
  return (
    <div className="flex flex-col gap-6">
      <Block title="통산">
        <RecordLine record={summary.total} />
      </Block>

      <Block title="연승">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-win-3 tnum">
            🔥 {summary.streak.current}
          </span>
          <span className="text-sm text-content-muted">연승</span>
        </div>
        <p className="mt-1 text-xs text-content-dim tnum">
          최장 {summary.streak.longest}연승
        </p>
      </Block>

      <Block title={`${formatMonthLabel(summary.month.month)} 시즌`}>
        <RecordLine record={summary.month} />
      </Block>

      <Block title="이번 달">
        <MonthGrass days={summary.monthGrass} />
        <div className="mt-3">
          <GrassLegend />
        </div>
      </Block>
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-2 text-xs font-semibold text-content-dim">{title}</h2>
      {children}
    </section>
  );
}

function RecordLine({ record }: { record: WinLoseCount }) {
  return (
    <div>
      <p className="text-[15px] font-semibold tnum">
        {record.count}전 {record.win}승
        {record.draw > 0 && ` ${record.draw}무`} {record.lose}패
      </p>
      <p className="mt-0.5 text-xs text-content-muted tnum">
        승률 {(record.winRate * 100).toFixed(1)}%
      </p>
    </div>
  );
}

function formatMonthLabel(month: string): string {
  return `${Number(month.split("-")[1])}월`;
}
