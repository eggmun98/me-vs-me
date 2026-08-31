import {
  buildRepeatOptions,
  buildRuleFromOption,
  type RepeatOptionId,
  resolveSelectedOption,
} from "@nadaena/api-client";
import { describeRepeat, type RepeatRule } from "@nadaena/core";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing } from "@/shared/theme/colors";
import { ChoiceChips } from "@/shared/ui/ChoiceChips";
import { Field } from "@/shared/ui/Field";
import { RepeatCustomSheet } from "./RepeatCustomSheet";

export function RepeatField({
  baseDate,
  rule,
  onChange,
}: {
  baseDate: string;
  rule: RepeatRule;
  onChange: (next: RepeatRule) => void;
}) {
  const [isCustomOpen, setIsCustomOpen] = useState(false);
  const options = buildRepeatOptions(baseDate);
  const selected = resolveSelectedOption(rule, baseDate);

  function handleSelect(id: RepeatOptionId) {
    const next = buildRuleFromOption(id, baseDate);

    if (next) onChange(next);
    else setIsCustomOpen(true);
  }

  return (
    <Field label="반복">
      <ChoiceChips options={options.map(toChip)} value={selected} onChange={handleSelect} />

      <View style={styles.preview}>
        <Text style={styles.previewText}>{describeRepeat(rule)}</Text>
      </View>

      <RepeatCustomSheet
        isOpen={isCustomOpen}
        baseDate={baseDate}
        onClose={() => setIsCustomOpen(false)}
        onConfirm={(next) => {
          onChange(next);
          setIsCustomOpen(false);
        }}
      />
    </Field>
  );
}

function toChip(option: { id: RepeatOptionId; label: string }) {
  return { value: option.id, label: option.label };
}

const styles = StyleSheet.create({
  preview: {
    marginTop: spacing.xs,
    backgroundColor: colors.surfaceHover,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  previewText: { fontSize: 13, color: colors.contentMuted },
});
