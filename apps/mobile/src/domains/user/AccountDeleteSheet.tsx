import { ACCOUNT_RETENTION_DAYS } from "@nadaena/core";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing } from "@/shared/theme/colors";
import { AppButton } from "@/shared/ui/AppButton";
import { AppTextInput, Field } from "@/shared/ui/Field";
import { Sheet } from "@/shared/ui/Sheet";

/** 손이 미끄러져 지워지는 일이 없도록, 이 글자를 그대로 적어야 버튼이 열린다. */
const CONFIRM_WORD = "탈퇴";

/**
 * 회원탈퇴 확인.
 *
 * 무엇이 사라지고 언제 사라지는지, 되돌릴 방법이 있는지를 누르기 전에 다 보여준다.
 * 되돌릴 수 없는 일에서 사용자가 놀라는 건 대부분 설명이 뒤에 왔기 때문이다.
 */
export function AccountDeleteSheet({
  isOpen,
  isPending,
  error,
  onConfirm,
  onClose,
}: {
  isOpen: boolean;
  isPending: boolean;
  error: string | null;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const [typed, setTyped] = useState("");

  return (
    <Sheet
      isOpen={isOpen}
      title="회원 탈퇴"
      onClose={onClose}
      footer={
        <>
          <AppButton label="취소" tone="outline" onPress={onClose} style={styles.footerButton} />
          <AppButton
            label="탈퇴하기"
            disabled={typed.trim() !== CONFIRM_WORD}
            isLoading={isPending}
            onPress={onConfirm}
            style={styles.footerButton}
          />
        </>
      }
    >
      <Text style={styles.lead}>탈퇴하면 지금까지 쌓은 기록을 더 이상 볼 수 없습니다.</Text>

      <View style={styles.list}>
        <Text style={styles.listItem}>· 미션과 모든 승패 기록</Text>
        <Text style={styles.listItem}>· 연승 기록과 통계</Text>
        <Text style={styles.listItem}>· 프로필과 소셜 로그인 연결</Text>
      </View>

      <Text style={styles.note}>
        데이터는 {ACCOUNT_RETENTION_DAYS}일 동안 보관한 뒤 완전히 삭제됩니다. 그 안에 같은 계정으로
        다시 로그인하면 기록이 그대로 되살아납니다.
      </Text>

      <Field label={`계속하려면 "${CONFIRM_WORD}" 를 입력하세요`}>
        <AppTextInput
          value={typed}
          onChangeText={setTyped}
          placeholder={CONFIRM_WORD}
          autoCapitalize="none"
        />
      </Field>

      {error && <Text style={styles.error}>{error}</Text>}
    </Sheet>
  );
}

const styles = StyleSheet.create({
  lead: { fontSize: 14, color: colors.content, lineHeight: 21 },
  list: {
    gap: spacing.xs,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  listItem: { fontSize: 13, color: colors.contentMuted, lineHeight: 20 },
  note: { fontSize: 13, color: colors.contentMuted, lineHeight: 20 },
  error: { fontSize: 13, color: colors.lose },
  footerButton: { flex: 1 },
});
