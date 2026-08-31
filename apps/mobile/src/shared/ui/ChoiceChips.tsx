import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing } from "@/shared/theme/colors";

/**
 * 좁은 화면에서 select 를 대신한다.
 * 항목이 적고(카테고리·난이도·단위) 값이 하나만 선택될 때 쓴다.
 */
export function ChoiceChips<T extends string | null>({
  options,
  value,
  onChange,
}: {
  options: ReadonlyArray<{ value: T; label: string }>;
  value: T;
  onChange: (next: T) => void;
}) {
  return (
    <View style={styles.root}>
      {options.map((option) => {
        const isActive = option.value === value;

        return (
          <Pressable
            key={String(option.value)}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
            onPress={() => onChange(option.value)}
            style={[styles.chip, isActive && styles.chipActive]}
          >
            <Text style={[styles.label, isActive && styles.labelActive]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  chipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  label: { fontSize: 13, color: colors.contentMuted },
  labelActive: { color: colors.onAccent, fontWeight: "600" },
});
