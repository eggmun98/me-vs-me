import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing } from "@/shared/theme/colors";

export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: ReadonlyArray<{ value: T; label: string }>;
  value: T;
  onChange: (next: T) => void;
}) {
  return (
    <View style={styles.track}>
      {options.map((option) => {
        const isActive = option.value === value;

        return (
          <Pressable
            key={option.value}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            onPress={() => onChange(option.value)}
            style={[styles.item, isActive && styles.itemActive]}
          >
            <Text style={[styles.label, isActive && styles.labelActive]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: "row",
    backgroundColor: colors.surfaceHover,
    borderRadius: radius.md,
    padding: 3,
    gap: 3,
  },
  item: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    alignItems: "center",
  },
  itemActive: {
    backgroundColor: colors.surface,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.contentDim,
  },
  labelActive: {
    color: colors.content,
  },
});
