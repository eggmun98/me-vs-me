import { formatMissionTarget, type TodayMission } from "@nadaena/api-client";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing } from "@/shared/theme/colors";

export function TodayMissionRow({
  mission,
  onToggle,
}: {
  mission: TodayMission;
  onToggle: (id: string) => void;
}) {
  const target = formatMissionTarget(mission.targetAmount, mission.unit);
  const isWin = mission.result === "WIN";
  // 지난 날짜의 미완료는 이미 확정된 결과다. 여기서 되돌릴 수 없다.
  const isLose = mission.result === "LOSE";

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: isWin, disabled: isLose }}
      accessibilityLabel={mission.name}
      disabled={isLose}
      onPress={() => onToggle(mission.id)}
      style={({ pressed }) => [
        styles.row,
        isWin && styles.rowWin,
        isLose && styles.rowLose,
        pressed && !isLose && styles.pressed,
      ]}
    >
      <CheckMark result={mission.result} />

      <View style={styles.body}>
        <Text numberOfLines={1} style={[styles.name, isLose && styles.nameLose]}>
          {mission.name}
        </Text>
        {target && <Text style={styles.target}>{target}</Text>}
      </View>

      {mission.categoryName && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{mission.categoryName}</Text>
        </View>
      )}
    </Pressable>
  );
}

function CheckMark({ result }: { result: TodayMission["result"] }) {
  if (result === "WIN") {
    return (
      <View style={[styles.mark, styles.markWin]}>
        <Text style={styles.markWinText}>✓</Text>
      </View>
    );
  }

  if (result === "LOSE") {
    return (
      <View style={[styles.mark, styles.markLose]}>
        <Text style={styles.markLoseText}>✕</Text>
      </View>
    );
  }

  return <View style={[styles.mark, styles.markPending]} />;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  rowWin: { borderColor: colors.win1, backgroundColor: "#eef8f1" },
  rowLose: { backgroundColor: "transparent" },
  pressed: { opacity: 0.75 },
  body: { flex: 1, gap: 2 },
  name: { fontSize: 15, color: colors.content },
  nameLose: { color: colors.contentDim, textDecorationLine: "line-through" },
  target: { fontSize: 12, color: colors.contentDim },
  badge: {
    backgroundColor: colors.surfaceHover,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  badgeText: { fontSize: 11, color: colors.contentDim },
  mark: {
    width: 26,
    height: 26,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  markWin: { backgroundColor: colors.win3 },
  markWinText: { color: colors.onAccent, fontSize: 14, fontWeight: "800" },
  markLose: { borderWidth: 1, borderColor: colors.borderStrong },
  markLoseText: { color: colors.contentDim, fontSize: 13 },
  markPending: { borderWidth: 2, borderColor: colors.borderStrong },
});
