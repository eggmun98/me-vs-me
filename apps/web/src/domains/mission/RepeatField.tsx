"use client";

import { describeRepeat, type RepeatRule } from "@nadaena/core";
import { useState } from "react";
import { Field, inputClassName } from "@/shared/ui/Field";
import { RepeatCustomModal } from "./RepeatCustomModal";
import {
  buildRepeatOptions,
  buildRuleFromOption,
  type RepeatOptionId,
  resolveSelectedOption,
} from "@nadaena/api-client";

export function RepeatField({
  baseDate,
  rule,
  onChange,
}: {
  baseDate: string;
  rule: RepeatRule;
  onChange: (rule: RepeatRule) => void;
}) {
  const [isCustomOpen, setIsCustomOpen] = useState(false);
  const options = buildRepeatOptions(baseDate);
  const currentLabel = describeRepeat(rule);
  const selectedId = resolveSelectedOption(rule, baseDate);

  function handleSelect(id: RepeatOptionId) {
    const nextRule = buildRuleFromOption(id, baseDate);

    if (nextRule === null) {
      setIsCustomOpen(true);
      return;
    }

    onChange(nextRule);
  }

  return (
    <>
      <Field label="반복">
        <select
          value={selectedId}
          onChange={(event) => handleSelect(event.target.value as RepeatOptionId)}
          className={inputClassName}
        >
          {selectedId === "CUSTOM" && <option value="CUSTOM">{currentLabel}</option>}
          {options.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
      </Field>

      {isCustomOpen && (
        <RepeatCustomModal
          baseDate={baseDate}
          onConfirm={(nextRule) => {
            onChange(nextRule);
            setIsCustomOpen(false);
          }}
          onClose={() => setIsCustomOpen(false)}
        />
      )}
    </>
  );
}
