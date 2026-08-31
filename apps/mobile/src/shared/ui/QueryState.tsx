import type { ReactNode } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "@/shared/theme/colors";
import { AppButton } from "./AppButton";

/**
 * 로딩·에러·빈 상태를 화면마다 따로 쓰면 문구와 여백이 제각각이 된다.
 * 데이터가 있을 때만 children 을 부른다 — 화면 코드에서 널 체크가 사라진다.
 */
export function QueryState<T>({
  data,
  isLoading,
  error,
  onRetry,
  children,
}: {
  data: T | undefined;
  isLoading: boolean;
  error: unknown;
  onRetry?: () => void;
  children: (value: T) => ReactNode;
}) {
  if (isLoading) {
    return (
      <View style={styles.box}>
        <ActivityIndicator color={colors.contentDim} />
      </View>
    );
  }

  if (error || !data) {
    return (
      <View style={styles.box}>
        <Text style={styles.message}>
          {error instanceof Error ? error.message : "불러오지 못했습니다."}
        </Text>
        {onRetry && <AppButton label="다시 시도" tone="outline" onPress={onRetry} />}
      </View>
    );
  }

  return <>{children(data)}</>;
}

export function EmptyState({ message, action }: { message: string; action?: ReactNode }) {
  return (
    <View style={styles.box}>
      <Text style={styles.message}>{message}</Text>
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    paddingVertical: spacing.xxl,
    alignItems: "center",
    gap: spacing.md,
  },
  message: {
    fontSize: 14,
    color: colors.contentDim,
    textAlign: "center",
  },
});
