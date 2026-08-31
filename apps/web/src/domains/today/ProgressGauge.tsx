import { type DailyResult } from "@nadaena/api-client";

const BAR_COLOR: Record<DailyResult, string> = {
  IN_PROGRESS: "bg-win-2",
  WIN: "bg-win-3",
  DRAW: "bg-draw",
  LOSE: "bg-lose",
  REST: "bg-rest",
};

export function ProgressGauge({
  result,
  winCount,
  totalCount,
  rate,
}: {
  result: DailyResult;
  winCount: number;
  totalCount: number;
  rate: number;
}) {
  return (
    <div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-rest">
        <div
          className={`h-full rounded-full transition-all duration-500 ${BAR_COLOR[result]}`}
          style={{ width: `${Math.round(rate * 100)}%` }}
        />
      </div>

      <div className="mt-2 flex items-baseline gap-2 tnum">
        <span className="text-2xl font-bold">{Math.round(rate * 100)}%</span>
        <span className="text-sm text-content-muted">
          {winCount} / {totalCount}
        </span>
      </div>
    </div>
  );
}
