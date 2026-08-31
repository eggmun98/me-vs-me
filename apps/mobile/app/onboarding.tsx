import {
  countRequiredWins,
  RECOMMENDED_COUNT,
  RECOMMENDED_MISSIONS,
  toOnboardingMission,
  useCategories,
  useCompleteOnboarding,
  useMe,
  useSuggestNickname,
} from "@nadaena/api-client";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing } from "@/shared/theme/colors";
import { AppButton } from "@/shared/ui/AppButton";
import { AppTextInput, Field } from "@/shared/ui/Field";
import { Card } from "@/shared/ui/Card";
import { Screen } from "@/shared/ui/Screen";

/** 기기 설정을 그대로 쓴다. 바꿀 일이 드물어 MY 에서 고치게 둔다. */
const DEVICE_TIMEZONE = Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Seoul";

export default function OnboardingScreen() {
  const { data: me } = useMe();
  const { data: categories = [] } = useCategories();
  const suggestNickname = useSuggestNickname();
  const completeOnboarding = useCompleteOnboarding();

  const [nickname, setNickname] = useState("");
  const [picked, setPicked] = useState<string[]>(
    RECOMMENDED_MISSIONS.slice(0, RECOMMENDED_COUNT.max).map((preset) => preset.name),
  );

  // 소셜에서 받아온 닉네임을 기본값으로 채운다. 대부분 그대로 쓴다.
  useEffect(() => {
    if (me && nickname === "") setNickname(me.nickname);
  }, [me, nickname]);

  const canSubmit = nickname.trim().length > 0 && picked.length > 0;

  function handleSubmit() {
    const today = new Date().toISOString().slice(0, 10);
    const missions = RECOMMENDED_MISSIONS.filter((preset) => picked.includes(preset.name)).map(
      (preset) =>
        toOnboardingMission(
          preset,
          categories.find((category) => category.name === preset.categoryName)?.id ?? null,
          today,
        ),
    );

    completeOnboarding.mutate(
      { nickname: nickname.trim(), timezone: DEVICE_TIMEZONE, missions },
      { onSuccess: () => router.replace("/today") },
    );
  }

  return (
    <Screen>
      <View style={styles.intro}>
        <Text style={styles.title}>어떻게 부를까요?</Text>
        <Text style={styles.body}>공개 프로필 주소에 쓰입니다. 나중에 바꿀 수 있습니다.</Text>
      </View>

      <Field label="닉네임">
        <AppTextInput
          value={nickname}
          onChangeText={setNickname}
          placeholder="도전자"
          maxLength={20}
          autoCapitalize="none"
        />
        <AppButton
          label="추천 닉네임 받기"
          tone="ghost"
          isLoading={suggestNickname.isPending}
          onPress={() =>
            suggestNickname.mutate(undefined, {
              onSuccess: (result) => setNickname(result.nickname),
            })
          }
        />
      </Field>

      <View style={styles.intro}>
        <Text style={styles.title}>무엇으로 겨룰까요?</Text>
        <Text style={styles.body}>
          {RECOMMENDED_COUNT.min}~{RECOMMENDED_COUNT.max}개를 권합니다. 미션이 많을수록 이기기
          어려워집니다.
        </Text>
      </View>

      <View style={styles.presets}>
        {RECOMMENDED_MISSIONS.map((preset) => {
          const isPicked = picked.includes(preset.name);

          return (
            <Pressable
              key={preset.name}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: isPicked }}
              onPress={() =>
                setPicked((prev) =>
                  prev.includes(preset.name)
                    ? prev.filter((name) => name !== preset.name)
                    : [...prev, preset.name],
                )
              }
              style={[styles.preset, isPicked && styles.presetPicked]}
            >
              <Text style={[styles.presetName, isPicked && styles.presetNamePicked]}>
                {preset.name}
              </Text>
              <Text style={[styles.presetMeta, isPicked && styles.presetMetaPicked]}>
                {preset.targetAmount ? `${preset.targetAmount}${preset.unit}` : "완료 체크"}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Card>
        <Text style={styles.rule}>
          미션 {picked.length}개 중 <Text style={styles.ruleStrong}>{countRequiredWins(picked.length)}개</Text>{" "}
          이상 해내면 그날은 승리입니다.
        </Text>
        <Text style={styles.ruleSub}>정확히 절반이면 무승부, 그보다 적으면 패배입니다.</Text>
      </Card>

      <AppButton
        label="시작하기"
        disabled={!canSubmit}
        isLoading={completeOnboarding.isPending}
        onPress={handleSubmit}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: { gap: spacing.xs },
  title: { fontSize: 20, fontWeight: "800", color: colors.content },
  body: { fontSize: 14, lineHeight: 21, color: colors.contentMuted },
  presets: { gap: spacing.sm },
  preset: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: 2,
  },
  presetPicked: { borderColor: colors.accent, backgroundColor: colors.accent },
  presetName: { fontSize: 15, color: colors.content },
  presetNamePicked: { color: colors.onAccent, fontWeight: "600" },
  presetMeta: { fontSize: 12, color: colors.contentDim },
  presetMetaPicked: { color: colors.onAccent, opacity: 0.7 },
  rule: { fontSize: 14, color: colors.contentMuted, lineHeight: 21 },
  ruleStrong: { color: colors.content, fontWeight: "700" },
  ruleSub: { fontSize: 12, color: colors.contentDim },
});
