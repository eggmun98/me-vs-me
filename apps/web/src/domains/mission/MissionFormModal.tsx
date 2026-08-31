"use client";

import { buildRepeatPreset, type RepeatRule } from "@nadaena/core";
import { useState } from "react";
import { Field, inputClassName } from "@/shared/ui/Field";
import { Modal, ModalButton } from "@/shared/ui/Modal";
import { DIFFICULTY_OPTIONS, type MissionDraft, UNITS, useCategories } from "@nadaena/api-client";
import { RepeatField } from "./RepeatField";

export function MissionFormModal({
  baseDate,
  initial,
  defaultRepeat,
  title,
  onSubmit,
  onClose,
}: {
  baseDate: string;
  initial?: MissionDraft;
  /** 들어온 경로에 따라 기본 반복이 다르다. 달력에서 왔으면 그날 하루만. */
  defaultRepeat?: RepeatRule;
  title?: string;
  onSubmit: (draft: MissionDraft) => void;
  onClose: () => void;
}) {
  const { data: categories = [] } = useCategories();
  const [draft, setDraft] = useState<MissionDraft>(
    () => initial ?? createEmptyDraft(baseDate, defaultRepeat),
  );
  const isEditing = initial !== undefined;

  function update(patch: Partial<MissionDraft>) {
    setDraft((prev) => ({ ...prev, ...patch }));
  }

  return (
    <Modal
      title={title ?? (isEditing ? "미션 수정" : "미션 만들기")}
      onClose={onClose}
      footer={
        <>
          <ModalButton onClick={onClose}>취소</ModalButton>
          <ModalButton
            variant="primary"
            disabled={draft.name.trim() === ""}
            onClick={() => onSubmit(draft)}
          >
            {isEditing ? "저장" : "만들기"}
          </ModalButton>
        </>
      }
    >
      <div className="flex flex-col gap-5">
        <Field label="이름">
          <input
            value={draft.name}
            onChange={(event) => update({ name: event.target.value })}
            placeholder="영어 공부"
            className={inputClassName}
          />
        </Field>

        <Field label="카테고리">
          <select
            value={draft.categoryId ?? ""}
            onChange={(event) => update({ categoryId: event.target.value || null })}
            className={inputClassName}
          >
            <option value="">선택 안 함</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="목표량" hint="표시용입니다. 완료 여부만으로 승패를 정합니다.">
          <div className="flex gap-2">
            <input
              type="number"
              min={1}
              value={draft.targetAmount ?? ""}
              onChange={(event) =>
                update({
                  targetAmount: event.target.value === "" ? null : Number(event.target.value),
                })
              }
              placeholder="30"
              className={`${inputClassName} w-28 tnum`}
            />
            <select
              value={draft.unit ?? ""}
              onChange={(event) => update({ unit: event.target.value || null })}
              className={inputClassName}
            >
              <option value="">단위 없음</option>
              {UNITS.map((unit) => (
                <option key={unit} value={unit}>
                  {unit}
                </option>
              ))}
            </select>
          </div>
        </Field>

        <RepeatField
          baseDate={baseDate}
          rule={draft.repeat}
          onChange={(repeat) => update({ repeat })}
        />

        <Field label="난이도" hint="난이도는 승패에 영향을 주지 않습니다.">
          <div className="flex gap-2">
            {DIFFICULTY_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => update({ difficulty: option.value })}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm transition-colors ${
                  draft.difficulty === option.value
                    ? "border-accent bg-surface-hover font-semibold"
                    : "border-border text-content-muted hover:bg-surface-hover"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </Field>

        <p className="text-[11px] leading-relaxed text-content-dim">
          {draft.repeat.type === "ONCE"
            ? `${formatDayLabel(draft.repeat.startDate)} 하루만 열립니다.`
            : "만든 미션은 오늘부터 반영됩니다."}
        </p>
      </div>
    </Modal>
  );
}

function createEmptyDraft(baseDate: string, defaultRepeat?: RepeatRule): MissionDraft {
  return {
    name: "",
    categoryId: null,
    targetAmount: null,
    unit: null,
    difficulty: "NORMAL",
    repeat: defaultRepeat ?? buildRepeatPreset("DAILY", baseDate),
  };
}

function formatDayLabel(isoDate: string): string {
  const [, month, day] = isoDate.split("-").map(Number);

  return `${month}월 ${day}일`;
}
