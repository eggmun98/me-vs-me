"use client";

/**
 * 디자인 확인용. 실제 기능이 붙으면 제거한다.
 * 승·무·패처럼 자정이 지나야 나오는 상태는 실제 데이터로 만들 수 없다.
 */
export function ScenarioSwitcher<T extends string>({
  names,
  selected,
  onSelect,
}: {
  names: T[];
  selected: T | null;
  onSelect: (name: T | null) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5 border-b border-border bg-surface px-4 py-2.5 sm:px-6">
      <span className="mr-1 text-[11px] text-content-dim">상태</span>

      <SwitcherButton isOn={selected === null} onClick={() => onSelect(null)}>
        실제 데이터
      </SwitcherButton>

      {names.map((name) => (
        <SwitcherButton key={name} isOn={name === selected} onClick={() => onSelect(name)}>
          {name}
        </SwitcherButton>
      ))}
    </div>
  );
}

function SwitcherButton({
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
      className={`rounded-md px-2.5 py-1 text-[11px] transition-colors ${
        isOn
          ? "bg-accent text-on-accent font-semibold"
          : "text-content-muted hover:bg-surface-hover"
      }`}
    >
      {children}
    </button>
  );
}
