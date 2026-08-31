import {
  formatKoreanDate,
  getResultText,
  useUpdateReflection,
  type TodayResponse,
} from "@nadaena/api-client";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { AppButton } from "@/shared/ui/AppButton";
import { AppTextInput } from "@/shared/ui/Field";
import { Card } from "@/shared/ui/Card";
import { colors, radius, spacing } from "@/shared/theme/colors";
import { ProgressGauge } from "./ProgressGauge";
import { TodayMissionRow } from "./TodayMissionRow";
import { RESULT_COLOR } from "./resultTone";

export function TodayView({
  today,
  onToggleMission,
  onAddMission,
}: {
  today: TodayResponse;
  onToggleMission: (id: string) => void;
  onAddMission: () => void;
}) {
  if (today.result === "REST") {
    return (
      <EmptyDayCard
        today={today}
        title="오늘은 쉬는 날입니다"
        body="예정된 미션이 없습니다. 연승은 그대로 유지됩니다."
        actionLabel="오늘 미션 추가하기"
        tone="outline"
        onAction={onAddMission}
      />
    );
  }

  if (today.missions.length === 0) {
    return (
      <EmptyDayCard
        today={today}
        title="아직 승부가 없습니다"
        body="매일 할 일을 정하면 오늘부터 기록이 시작됩니다."
        actionLabel="첫 미션 만들기"
        tone="accent"
        onAction={onAddMission}
      />
    );
  }

  return (
    <View style={styles.root}>
      <EditableDatesNotice today={today} />

      <Card>
        <Text style={styles.date}>{formatKoreanDate(today.date)}</Text>

        <View style={styles.headline}>
          <Text style={styles.title}>오늘의 승부</Text>
          <ResultBadge today={today} />
        </View>

        <ProgressGauge
          result={today.result}
          winCount={today.winCount}
          totalCount={today.totalCount}
          rate={today.rate}
        />

        {today.isWinConfirmed && today.result === "IN_PROGRESS" && (
          <WinConfirmedNote today={today} />
        )}
      </Card>

      <View style={styles.list}>
        {today.missions.map((mission) => (
          <TodayMissionRow key={mission.id} mission={mission} onToggle={onToggleMission} />
        ))}
      </View>

      <ReflectionBox date={today.date} reflection={today.reflection} />
    </View>
  );
}

function ResultBadge({ today }: { today: TodayResponse }) {
  const isWin = today.isWinConfirmed || today.result === "WIN";
  const isPerfect = today.rate >= 1;
  const result = isWin ? "WIN" : today.result;

  return (
    <Text style={[styles.badge, { color: isPerfect ? colors.win3 : RESULT_COLOR[result] }]}>
      {isWin ? "🏆 " : ""}
      {isPerfect ? "PERFECT" : getResultText(result)}
    </Text>
  );
}

/**
 * 달성률의 분모가 고정이라 완료 수만으로 승리가 결정된다.
 * 좋은 소식은 자정까지 미루지 않는다. (05-screens 4.2)
 */
function WinConfirmedNote({ today }: { today: TodayResponse }) {
  const remaining = today.totalCount - today.winCount;

  return (
    <View style={styles.note}>
      <Text style={styles.noteText}>
        <Text style={styles.noteStrong}>오늘 승리했습니다.</Text> 남은 {remaining}개는 더 해도
        좋습니다.
      </Text>
    </View>
  );
}

/** 없으면 7일 수정 규칙이 사실상 죽는다. 사용자는 기록 화면에 잘 들어가지 않는다. (05-screens 4.6) */
function EditableDatesNotice({ today }: { today: TodayResponse }) {
  const target = today.editableDates[0];
  if (!target) return null;

  // 기한은 앱이 아는 "오늘"로 센다. 기기 시계를 믿지 않는다. (07-api.md 8장)
  const daysLeft = countDaysLeft(target.editableUntil, today.date);

  return (
    <View style={styles.notice}>
      <Text style={styles.noticeText}>
        {formatShortDate(target.date, today.date)}에 체크하지 않은 미션이 {target.loseCount}개
        있습니다.
      </Text>
      <Text style={styles.noticeDday}>D-{daysLeft}</Text>
    </View>
  );
}

function EmptyDayCard({
  today,
  title,
  body,
  actionLabel,
  tone,
  onAction,
}: {
  today: TodayResponse;
  title: string;
  body: string;
  actionLabel: string;
  tone: "accent" | "outline";
  onAction: () => void;
}) {
  return (
    <Card>
      <Text style={styles.date}>{formatKoreanDate(today.date)}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>{body}</Text>
      <AppButton label={actionLabel} tone={tone} onPress={onAction} style={styles.emptyAction} />
    </Card>
  );
}

function ReflectionBox({ date, reflection }: { date: string; reflection: string | null }) {
  const [draft, setDraft] = useState(reflection ?? "");
  const updateReflection = useUpdateReflection();
  const isDirty = draft.trim() !== (reflection ?? "").trim();

  return (
    <View style={styles.reflection}>
      <Text style={styles.reflectionTitle}>한 줄 회고</Text>
      <AppTextInput
        value={draft}
        onChangeText={setDraft}
        placeholder="오늘 하루는 어땠나요?"
        multiline
        style={styles.reflectionInput}
      />
      {isDirty && (
        <AppButton
          label="저장"
          tone="outline"
          isLoading={updateReflection.isPending}
          onPress={() => updateReflection.mutate({ date, reflection: draft.trim() })}
        />
      )}
    </View>
  );
}

/** 어제면 "어제", 아니면 날짜로 쓴다. 5일 전 기록을 어제라고 하면 안 된다. */
function formatShortDate(date: string, today: string): string {
  if (countDaysBetween(date, today) === 1) return "어제";

  const [, month, day] = date.split("-").map(Number);

  return `${month}월 ${day}일`;
}

function countDaysBetween(from: string, to: string): number {
  return Math.round(
    (new Date(`${to}T00:00:00Z`).getTime() - new Date(`${from}T00:00:00Z`).getTime()) / 86_400_000,
  );
}

function countDaysLeft(untilDate: string, today: string): number {
  const diff =
    new Date(`${untilDate}T00:00:00Z`).getTime() - new Date(`${today}T00:00:00Z`).getTime();

  return Math.max(0, Math.round(diff / 86_400_000));
}

const styles = StyleSheet.create({
  root: { gap: spacing.lg },
  date: { fontSize: 13, color: colors.contentDim },
  headline: { flexDirection: "row", alignItems: "baseline", justifyContent: "space-between" },
  title: { fontSize: 18, fontWeight: "800", color: colors.content },
  body: { fontSize: 14, lineHeight: 21, color: colors.contentMuted },
  badge: { fontSize: 14, fontWeight: "800", letterSpacing: 0.4 },
  emptyAction: { alignSelf: "flex-start", paddingHorizontal: spacing.xl },
  list: { gap: spacing.sm },
  note: {
    borderWidth: 1,
    borderColor: colors.win1,
    backgroundColor: "#eef8f1",
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  noteText: { fontSize: 13, color: colors.contentMuted, lineHeight: 20 },
  noteStrong: { color: colors.win3, fontWeight: "700" },
  notice: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  noticeText: { flex: 1, fontSize: 13, color: colors.contentMuted },
  noticeDday: { fontSize: 12, color: colors.contentDim },
  reflection: { gap: spacing.sm },
  reflectionTitle: { fontSize: 13, fontWeight: "700", color: colors.contentMuted },
  reflectionInput: { minHeight: 84, paddingTop: spacing.md, textAlignVertical: "top" },
});
