import type { ReactNode } from "react";
import { StyleSheet, Text, TextInput, View, type TextInputProps } from "react-native";
import { colors, radius, spacing } from "@/shared/theme/colors";

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
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      {children}
      {hint && <Text style={styles.hint}>{hint}</Text>}
    </View>
  );
}

export function AppTextInput(props: TextInputProps) {
  return (
    <TextInput
      {...props}
      placeholderTextColor={colors.contentDim}
      style={[styles.input, props.style]}
    />
  );
}

const styles = StyleSheet.create({
  field: { gap: spacing.xs },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.contentMuted,
  },
  hint: {
    fontSize: 12,
    color: colors.contentDim,
  },
  input: {
    minHeight: 46,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    fontSize: 15,
    color: colors.content,
    backgroundColor: colors.surface,
  },
});
