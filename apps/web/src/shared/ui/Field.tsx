import type { ReactNode } from "react";

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold text-content-muted">{label}</span>
      {children}
      {hint && <span className="text-[11px] text-content-dim">{hint}</span>}
    </div>
  );
}

export const inputClassName =
  "w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-content placeholder:text-content-dim focus:border-border-strong focus:outline-none";
