import type { ReactNode } from "react";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, spacing } from "@/shared/theme/colors";

/**
 * 화면 바깥 여백과 스크롤을 한 곳에서 정한다.
 * 화면마다 SafeArea 를 다시 계산하면 기기가 바뀔 때마다 어긋난다.
 */
export function Screen({
  children,
  onRefresh,
  isRefreshing = false,
  scroll = true,
}: {
  children: ReactNode;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  scroll?: boolean;
}) {
  const insets = useSafeAreaInsets();
  const paddingBottom = insets.bottom + spacing.xxl;

  if (!scroll) {
    return <View style={[styles.root, { paddingBottom }]}>{children}</View>;
  }

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={[styles.content, { paddingBottom }]}
      keyboardShouldPersistTaps="handled"
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={colors.contentDim}
          />
        ) : undefined
      }
    >
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
});
