import {
  DIFFICULTY_OPTIONS,
  type Category,
  type Mission,
  type MissionDraft,
  UNITS,
  useCategories,
} from "@nadaena/api-client";
import { buildRepeatPreset, toRepeatRule, type RepeatRule } from "@nadaena/core";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "@/shared/theme/colors";
import { AppButton } from "@/shared/ui/AppButton";
import { ChoiceChips } from "@/shared/ui/ChoiceChips";
import { AppTextInput, Field } from "@/shared/ui/Field";
import { Sheet } from "@/shared/ui/Sheet";
import { RepeatField } from "./RepeatField";

export function MissionFormSheet({
  isOpen,
  today,
  mission,
  isSaving,
  onSubmit,
  onClose,
}: {
  isOpen: boolean;
  today: string;
  /** 없으면 새로 만드는 중이다. */
  mission?: Mission;
  isSaving: boolean;
  onSubmit: (draft: MissionDraft) => void;
  onClose: () => void;
}) {
  const { data: categories = [] } = useCategories();
  const [draft, setDraft] = useState<MissionDraft>(() => createDraft(today, mission));

  // 시트를 다시 열면 이전에 쓰던 값이 남아 있으면 안 된다.
  useEffect(() => {
    if (isOpen) setDraft(createDraft(today, mission));
  }, [isOpen, mission, today]);

  const canSubmit = draft.name.trim().length > 0;

  return (
    <Sheet
      isOpen={isOpen}
      title={mission ? "미션 수정" : "미션 추가"}
      onClose={onClose}
      footer={
        <>
          <AppButton label="취소" tone="outline" onPress={onClose} style={styles.action} />
          <AppButton
            label="저장"
            isLoading={isSaving}
            disabled={!canSubmit}
            onPress={() => onSubmit({ ...draft, name: draft.name.trim() })}
            style={styles.action}
          />
        </>
      }
    >
      <Field label="미션 이름">
        <AppTextInput
          value={draft.name}
          onChangeText={(name) => setDraft((prev) => ({ ...prev, name }))}
          placeholder="예) 30분 달리기"
          autoFocus={!mission}
        />
      </Field>

      <Field label="카테고리">
        <ChoiceChips
          options={toCategoryOptions(categories)}
          value={draft.categoryId}
          onChange={(categoryId) => setDraft((prev) => ({ ...prev, categoryId }))}
        />
      </Field>

      <Field label="목표량" hint="숫자를 비우면 완료 여부만 체크합니다.">
        <View style={styles.amountRow}>
          <AppTextInput
            value={draft.targetAmount === null ? "" : String(draft.targetAmount)}
            onChangeText={(text) =>
              setDraft((prev) => ({ ...prev, targetAmount: toAmount(text) }))
            }
            keyboardType="number-pad"
            placeholder="30"
            style={styles.amountInput}
          />
          <ChoiceChips
            options={UNIT_OPTIONS}
            value={draft.unit}
            onChange={(unit) => setDraft((prev) => ({ ...prev, unit }))}
          />
        </View>
      </Field>

      <Field label="난이도" hint="달성률에는 반영되지 않습니다. 통계에서만 씁니다.">
        <ChoiceChips
          options={DIFFICULTY_OPTIONS}
          value={draft.difficulty}
          onChange={(difficulty) => setDraft((prev) => ({ ...prev, difficulty }))}
        />
      </Field>

      <RepeatField
        baseDate={today}
        rule={draft.repeat}
        onChange={(repeat) => setDraft((prev) => ({ ...prev, repeat }))}
      />

      {mission && (
        <Text style={styles.note}>
          반복을 바꾸면 내일부터 적용됩니다. 오늘 승부는 그대로 유지됩니다.
        </Text>
      )}
    </Sheet>
  );
}

/** 수정이면 서버가 준 평평한 payload 를, 새로 만들면 매일 반복을 기본값으로 쓴다. */
function createDraft(today: string, mission?: Mission): MissionDraft {
  if (!mission) {
    return {
      name: "",
      categoryId: null,
      targetAmount: null,
      unit: null,
      difficulty: "NORMAL",
      repeat: buildRepeatPreset("DAILY", today),
    };
  }

  return {
    name: mission.name,
    categoryId: mission.categoryId,
    targetAmount: mission.targetAmount,
    unit: mission.unit,
    difficulty: mission.difficulty,
    repeat: toRepeatRule(mission.repeat) as RepeatRule,
  };
}

function toCategoryOptions(categories: Category[]): Array<{ value: string | null; label: string }> {
  return [
    { value: null, label: "없음" },
    ...categories.map((category) => ({ value: category.id, label: category.name })),
  ];
}

const UNIT_OPTIONS: Array<{ value: string | null; label: string }> = [
  { value: null, label: "없음" },
  ...UNITS.map((unit) => ({ value: unit as string | null, label: unit })),
];

function toAmount(text: string): number | null {
  const digits = text.replace(/[^0-9]/g, "");

  return digits === "" ? null : Number(digits);
}

const styles = StyleSheet.create({
  action: { flex: 1 },
  amountRow: { flexDirection: "row", alignItems: "flex-start", gap: spacing.sm, flexWrap: "wrap" },
  amountInput: { width: 84, textAlign: "center" },
  note: { fontSize: 12, color: colors.contentDim, lineHeight: 18 },
});
