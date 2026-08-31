import { formatMissionTarget, type Mission } from "@nadaena/api-client";
import { describeRepeat, toRepeatRule } from "@nadaena/core";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing } from "@/shared/theme/colors";

export function MissionRow({
  mission,
  onEdit,
  onDelete,
}: {
  mission: Mission;
  onEdit: (mission: Mission) => void;
  onDelete: (mission: Mission) => void;
}) {
  const target = formatMissionTarget(mission.targetAmount, mission.unit);

  return (
    <View style={[styles.row, !mission.isActive && styles.rowInactive]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${mission.name} 수정`}
        onPress={() => onEdit(mission)}
        style={styles.main}
      >
        <Text numberOfLines={1} style={styles.name}>
          {mission.name}
        </Text>
        <Text style={styles.meta}>
          {describeRepeat(toRepeatRule(mission.repeat))}
          {target ? `  ·  ${target}` : ""}
          {mission.categoryName ? `  ·  ${mission.categoryName}` : ""}
        </Text>
      </Pressable>

      {mission.isActive && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${mission.name} 삭제`}
          onPress={() => onDelete(mission)}
          style={styles.delete}
        >
          <Text style={styles.deleteText}>삭제</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  rowInactive: { opacity: 0.55 },
  main: { flex: 1, gap: 3 },
  name: { fontSize: 15, color: colors.content },
  meta: { fontSize: 12, color: colors.contentDim },
  delete: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs },
  deleteText: { fontSize: 13, color: colors.lose },
});
