import type { ReactNode } from "react";
import { KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, radius, spacing } from "@/shared/theme/colors";

/**
 * 웹의 가운데 모달 대신 아래에서 올라오는 시트를 쓴다.
 * 한 손으로 쥐는 화면에서는 확인 버튼이 손가락 가까이 있어야 한다.
 */
export function Sheet({
  isOpen,
  title,
  onClose,
  children,
  footer,
}: {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={isOpen} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={styles.backdropFill} onPress={onClose} accessibilityLabel="닫기" />
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.lg }]}>
            <View style={styles.grabber} />
            <Text style={styles.title}>{title}</Text>
            <View style={styles.body}>{children}</View>
            {footer && <View style={styles.footer}>{footer}</View>}
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(1, 22, 56, 0.35)",
  },
  backdropFill: { flex: 1 },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    gap: spacing.md,
    maxHeight: "88%",
  },
  grabber: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: radius.full,
    backgroundColor: colors.border,
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.content,
  },
  body: { gap: spacing.md },
  footer: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingTop: spacing.sm,
  },
});
