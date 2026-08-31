import { logout, useMe, useToday } from "@nadaena/api-client";
import { useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { Alert, StyleSheet, Text, View } from "react-native";
import { RecordLine } from "@/domains/record/SummaryCard";
import { colors, spacing } from "@/shared/theme/colors";
import { AppButton } from "@/shared/ui/AppButton";
import { Card } from "@/shared/ui/Card";
import { QueryState } from "@/shared/ui/QueryState";
import { Screen } from "@/shared/ui/Screen";

export default function MyScreen() {
  const me = useMe();
  const today = useToday();
  const queryClient = useQueryClient();

  async function handleLogout() {
    await logout();
    queryClient.clear();
    router.replace("/login");
  }

  return (
    <Screen onRefresh={() => void me.refetch()} isRefreshing={me.isRefetching}>
      <QueryState
        data={me.data}
        isLoading={me.isLoading}
        error={me.error}
        onRetry={() => me.refetch()}
      >
        {(profile) => (
          <View style={styles.root}>
            <Card>
              <Text style={styles.nickname}>{profile.nickname}</Text>
              {profile.bio && <Text style={styles.bio}>{profile.bio}</Text>}
              <Text style={styles.meta}>
                미션 {profile.missionCount}개 · {profile.timezone}
              </Text>
            </Card>

            <Card title="통산 전적">
              <RecordLine record={profile.summary.total} />
              <Text style={styles.meta}>
                현재 {profile.summary.streak.current}연승 · 최장{" "}
                {profile.summary.streak.longest}연승
              </Text>
            </Card>

            <AppButton
              label="미션 관리"
              tone="outline"
              onPress={() => router.push("/missions")}
            />

            <AppButton label="설정" tone="outline" onPress={() => router.push("/settings")} />

            <AppButton
              label="로그아웃"
              tone="ghost"
              onPress={() =>
                Alert.alert("로그아웃할까요?", "이 기기에서만 로그아웃됩니다.", [
                  { text: "취소", style: "cancel" },
                  { text: "로그아웃", style: "destructive", onPress: () => void handleLogout() },
                ])
              }
            />

            {today.data && (
              <Text style={styles.footnote}>오늘 기준 {today.data.date}</Text>
            )}
          </View>
        )}
      </QueryState>
    </Screen>
  );
}

const styles = StyleSheet.create({
  root: { gap: spacing.lg },
  nickname: { fontSize: 20, fontWeight: "800", color: colors.content },
  bio: { fontSize: 14, color: colors.contentMuted, lineHeight: 21 },
  meta: { fontSize: 12, color: colors.contentDim },
  footnote: { fontSize: 11, color: colors.contentDim, textAlign: "center" },
});
