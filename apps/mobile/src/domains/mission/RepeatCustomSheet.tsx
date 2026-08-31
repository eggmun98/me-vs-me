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
import { describeRepeat, type RepeatRule, WEEKDAY_LABELS, type Weekday } from "@nadaena/core";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing } from "@/shared/theme/colors";
import { AppButton } from "@/shared/ui/AppButton";
import { ChoiceChips } from "@/shared/ui/ChoiceChips";
import { AppTextInput, Field } from "@/shared/ui/Field";
import { Sheet } from "@/shared/ui/Sheet";

const ALL_WEEKDAYS: Weekday[] = [0, 1, 2, 3, 4, 5, 6];

const MONTHLY_MODES = [
  { value: "DAY_OF_MONTH", label: "날짜 기준" },
  { value: "NTH_WEEKDAY", label: "몇째 주 요일" },
] as const;

/** 구글 캘린더의 "맞춤" 반복. 주기 · 요일 · 월 기준을 직접 고른다. */
export function RepeatCustomSheet({
  isOpen,
  baseDate,
  onConfirm,
  onClose,
}: {
  isOpen: boolean;
  baseDate: string;
  onConfirm: (rule: RepeatRule) => void;
  onClose: () => void;
}) {
  const [state, setState] = useState<CustomRepeatState>(() => createInitialCustomState(baseDate));
  const preview = describeRepeat(buildCustomRule(state, baseDate));

  return (
    <Sheet
      isOpen={isOpen}
      title="맞춤 반복"
      onClose={onClose}
      footer={
        <>
          <AppButton label="취소" tone="outline" onPress={onClose} style={styles.action} />
          <AppButton
            label="완료"
            onPress={() => onConfirm(buildCustomRule(state, baseDate))}
            style={styles.action}
          />
        </>
      }
    >
      <Field label="반복 주기">
        <View style={styles.intervalRow}>
          <AppTextInput
            value={String(state.interval)}
            onChangeText={(text) =>
              setState((prev) => ({ ...prev, interval: clampInterval(text) }))
            }
            keyboardType="number-pad"
            style={styles.intervalInput}
          />
          <ChoiceChips
            options={FREQ_UNIT_LABELS}
            value={state.freq}
            onChange={(freq) => setState((prev) => ({ ...prev, freq }))}
          />
        </View>
      </Field>

      {isFreqUsingWeekdays(state.freq) && (
        <Field label="반복 요일">
          <View style={styles.weekdays}>
            {ALL_WEEKDAYS.map((weekday) => {
              const isActive = state.weekdays.includes(weekday);

              return (
                <Pressable
                  key={weekday}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isActive }}
                  onPress={() =>
                    setState((prev) => ({
                      ...prev,
                      weekdays: toggleWeekday(prev.weekdays, weekday),
                    }))
                  }
                  style={[styles.weekday, isActive && styles.weekdayActive]}
                >
                  <Text style={[styles.weekdayText, isActive && styles.weekdayTextActive]}>
                    {WEEKDAY_LABELS[weekday]}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Field>
      )}

      {isFreqUsingMonthlyMode(state.freq) && (
        <Field label="월 반복 기준">
          <ChoiceChips
            options={MONTHLY_MODES}
            value={state.monthlyMode}
            onChange={(monthlyMode) => setState((prev) => ({ ...prev, monthlyMode }))}
          />
        </Field>
      )}

      <View style={styles.preview}>
        <Text style={styles.previewText}>{preview}</Text>
      </View>
    </Sheet>
  );
}

function clampInterval(text: string): number {
  const value = Number(text.replace(/[^0-9]/g, ""));

  if (!Number.isFinite(value) || value < 1) return 1;

  return Math.min(value, REPEAT_INTERVAL_MAX);
}

const styles = StyleSheet.create({
  action: { flex: 1 },
  intervalRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm, flexWrap: "wrap" },
  intervalInput: { width: 72, textAlign: "center" },
  weekdays: { flexDirection: "row", gap: spacing.xs },
  weekday: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  weekdayActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  weekdayText: { fontSize: 13, color: colors.contentMuted },
  weekdayTextActive: { color: colors.onAccent, fontWeight: "700" },
  preview: {
    backgroundColor: colors.surfaceHover,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  previewText: { fontSize: 13, color: colors.contentMuted },
});
