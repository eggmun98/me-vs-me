import { ApiRequestError, type Me, useDeleteAccount, useUpdateMe } from "@nadaena/api-client";
import { useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { useState } from "react";
import { Linking, StyleSheet, Text, View } from "react-native";
import { AccountDeleteSheet } from "./AccountDeleteSheet";
import { TIMEZONE_OPTIONS } from "./timezones";
import { WEB_URL } from "@/shared/config/urls";
import { colors, spacing } from "@/shared/theme/colors";
import { AppButton } from "@/shared/ui/AppButton";
import { Card } from "@/shared/ui/Card";
import { ChoiceChips } from "@/shared/ui/ChoiceChips";
import { AppTextInput, Field } from "@/shared/ui/Field";

export function SettingsView({ me }: { me: Me }) {
  const updateMe = useUpdateMe();
  const deleteAccount = useDeleteAccount();
  const queryClient = useQueryClient();
  const [nickname, setNickname] = useState(me.nickname);
  const [bio, setBio] = useState(me.bio ?? "");
  const [timezone, setTimezone] = useState(me.timezone);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteOpen, setDeleteOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  function handleDelete() {
    setDeleteError(null);
    deleteAccount.mutate(undefined, {
      onSuccess() {
        queryClient.clear();
        setDeleteOpen(false);
        router.replace("/login");
      },
      // 실패하면 시트를 닫지 않는다. 닫아버리면 탈퇴가 된 건지 아닌지 알 수 없다.
      onError: (caught) =>
        setDeleteError(
          caught instanceof ApiRequestError ? caught.message : "탈퇴하지 못했습니다.",
        ),
    });
  }

  const isDirty =
    nickname.trim() !== me.nickname || bio.trim() !== (me.bio ?? "") || timezone !== me.timezone;

  function handleSave() {
    setError(null);
    updateMe.mutate(
      { nickname: nickname.trim(), bio: bio.trim(), timezone },
      {
        // 닉네임은 unique 다. 중복이면 서버가 거절한다. (06-database 8.3)
        onError: (caught) =>
          setError(caught instanceof ApiRequestError ? caught.message : "저장하지 못했습니다."),
      },
    );
  }

  return (
    <View style={styles.root}>
      <Card title="프로필">
        <Field label="닉네임" hint="공개 프로필 주소에 쓰입니다.">
          <AppTextInput
            value={nickname}
            onChangeText={setNickname}
            maxLength={20}
            autoCapitalize="none"
          />
        </Field>
        <Field label="소개">
          <AppTextInput value={bio} onChangeText={setBio} placeholder="오늘도 나와 싸운다" />
        </Field>
      </Card>

      <Card title="하루의 기준">
        <Field
          label="타임존"
          hint="바꾸면 오늘부터 적용됩니다. 지난 기록의 날짜는 바뀌지 않습니다."
        >
          <ChoiceChips options={TIMEZONE_OPTIONS} value={timezone} onChange={setTimezone} />
        </Field>
      </Card>

      {error && <Text style={styles.error}>{error}</Text>}

      <AppButton
        label="저장"
        disabled={!isDirty || nickname.trim().length === 0}
        isLoading={updateMe.isPending}
        onPress={handleSave}
      />

      <Card title="약관">
        <AppButton
          label="이용약관"
          tone="ghost"
          onPress={() => void Linking.openURL(`${WEB_URL}/terms`)}
        />
        <AppButton
          label="개인정보처리방침"
          tone="ghost"
          onPress={() => void Linking.openURL(`${WEB_URL}/privacy`)}
        />
      </Card>

      <AppButton label="회원 탈퇴" tone="ghost" onPress={() => setDeleteOpen(true)} />

      <AccountDeleteSheet
        isOpen={isDeleteOpen}
        isPending={deleteAccount.isPending}
        error={deleteError}
        onConfirm={handleDelete}
        onClose={() => setDeleteOpen(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: spacing.lg },
  error: { fontSize: 13, color: colors.lose },
});
