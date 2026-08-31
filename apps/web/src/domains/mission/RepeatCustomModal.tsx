"use client";

import { describeRepeat, WEEKDAY_LABELS, type RepeatRule, type Weekday } from "@nadaena/core";
import { useState } from "react";
import { Field, inputClassName } from "@/shared/ui/Field";
import { Modal, ModalButton } from "@/shared/ui/Modal";
import {
  buildCustomRule,
  createInitialCustomState,
  type CustomRepeatState,
  FREQ_UNIT_LABELS,
  isFreqUsingMonthlyMode,
  isFreqUsingWeekdays,
  REPEAT_INTERVAL_MAX,
  toggleWeekday,
} from "@nadaena/api-client";

const ALL_WEEKDAYS: Weekday[] = [0, 1, 2, 3, 4, 5, 6];

export function RepeatCustomModal({
  baseDate,
  onConfirm,
  onClose,
}: {
  baseDate: string;
  onConfirm: (rule: RepeatRule) => void;
  onClose: () => void;
}) {
  const [state, setState] = useState<CustomRepeatState>(() =>
    createInitialCustomState(baseDate),
  );
  const rule = buildCustomRule(state, baseDate);

  function update(patch: Partial<CustomRepeatState>) {
    setState((prev) => ({ ...prev, ...patch }));
  }

  return (
    <Modal
      title="맞춤 반복"
      onClose={onClose}
      footer={
        <>
          <ModalButton onClick={onClose}>취소</ModalButton>
          <ModalButton variant="primary" onClick={() => onConfirm(rule)}>
            완료
          </ModalButton>
        </>
      }
    >
      <div className="flex flex-col gap-5">
        <Field label="반복 주기">
          <div className="flex gap-2">
            <input
              type="number"
              min={1}
              max={REPEAT_INTERVAL_MAX}
              value={state.interval}
              onChange={(event) => update({ interval: Number(event.target.value) })}
              className={`${inputClassName} w-24 tnum`}
            />
            <select
              value={state.freq}
              onChange={(event) =>
                update({ freq: event.target.value as CustomRepeatState["freq"] })
              }
              className={inputClassName}
            >
              {FREQ_UNIT_LABELS.map((unit) => (
                <option key={unit.value} value={unit.value}>
                  {unit.label}
                </option>
              ))}
            </select>
          </div>
        </Field>

        {isFreqUsingWeekdays(state.freq) && (
          <Field label="반복 요일">
            <div className="flex gap-1.5">
              {ALL_WEEKDAYS.map((weekday) => (
                <WeekdayToggle
                  key={weekday}
                  weekday={weekday}
                  isOn={state.weekdays.includes(weekday)}
                  onClick={() => update({ weekdays: toggleWeekday(state.weekdays, weekday) })}
                />
              ))}
            </div>
          </Field>
        )}

        {isFreqUsingMonthlyMode(state.freq) && (
          <Field label="반복 기준">
            <div className="flex flex-col gap-2">
              <MonthlyModeRadio
                isOn={state.monthlyMode === "DAY_OF_MONTH"}
                label={describeRepeat(
                  buildCustomRule({ ...state, monthlyMode: "DAY_OF_MONTH" }, baseDate),
                )}
                onClick={() => update({ monthlyMode: "DAY_OF_MONTH" })}
              />
              <MonthlyModeRadio
                isOn={state.monthlyMode === "NTH_WEEKDAY"}
                label={describeRepeat(
                  buildCustomRule({ ...state, monthlyMode: "NTH_WEEKDAY" }, baseDate),
                )}
                onClick={() => update({ monthlyMode: "NTH_WEEKDAY" })}
              />
            </div>
          </Field>
        )}

        <Field label="종료" hint="반복 종료 조건은 준비 중입니다. 지금은 계속 반복됩니다.">
          <div className={`${inputClassName} text-content-dim`}>없음</div>
        </Field>

        <div className="rounded-lg border border-border bg-surface-hover px-3 py-2.5">
          <span className="text-[11px] text-content-dim">미리보기</span>
          <p className="mt-0.5 text-sm font-semibold">{describeRepeat(rule)}</p>
        </div>
      </div>
    </Modal>
  );
}

function WeekdayToggle({
  weekday,
  isOn,
  onClick,
}: {
  weekday: Weekday;
  isOn: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`size-9 rounded-full text-xs font-semibold transition-colors ${
        isOn
          ? "bg-accent text-on-accent"
          : "border border-border text-content-muted hover:bg-surface-hover"
      }`}
    >
      {WEEKDAY_LABELS[weekday]}
    </button>
  );
}

function MonthlyModeRadio({
  isOn,
  label,
  onClick,
}: {
  isOn: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors ${
        isOn ? "border-accent bg-surface-hover" : "border-border hover:bg-surface-hover"
      }`}
    >
      <span
        className={`size-4 shrink-0 rounded-full border-2 ${
          isOn ? "border-accent bg-accent" : "border-border-strong"
        }`}
      />
      {label}
    </button>
  );
}
