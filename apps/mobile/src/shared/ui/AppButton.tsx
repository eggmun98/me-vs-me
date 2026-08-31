import { ActivityIndicator, Pressable, StyleSheet, Text, type ViewStyle } from "react-native";
import { colors, radius, spacing } from "@/shared/theme/colors";

type Tone = "accent" | "outline" | "ghost";

export function AppButton({
  label,
  onPress,
  tone = "accent",
  isLoading = false,
  disabled = false,
  style,
}: {
  label: string;
  onPress: () => void;
  tone?: Tone;
  isLoading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}) {
  const isBlocked = disabled || isLoading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isBlocked, busy: isLoading }}
      disabled={isBlocked}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        TONE_STYLES[tone],
        pressed && !isBlocked && styles.pressed,
        isBlocked && styles.blocked,
        style,
      ]}
    >
      {isLoading ? (
        <ActivityIndicator color={tone === "accent" ? colors.onAccent : colors.content} />
      ) : (
        <Text style={[styles.label, TONE_LABEL[tone]]}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  pressed: { opacity: 0.82 },
  blocked: { opacity: 0.45 },
  label: { fontSize: 15, fontWeight: "600" },
});

const TONE_STYLES: Record<Tone, ViewStyle> = {
  accent: { backgroundColor: colors.accent, borderColor: colors.accent },
  outline: { backgroundColor: colors.surface, borderColor: colors.borderStrong },
  ghost: { backgroundColor: "transparent", borderColor: "transparent" },
};

const TONE_LABEL = StyleSheet.create({
  accent: { color: colors.onAccent },
  outline: { color: colors.content },
  ghost: { color: colors.contentMuted },
});
