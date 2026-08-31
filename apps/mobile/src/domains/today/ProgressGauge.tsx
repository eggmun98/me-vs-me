import { type DailyResult } from "@nadaena/api-client";
import { StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing } from "@/shared/theme/colors";
import { GAUGE_COLOR } from "./resultTone";

export function ProgressGauge({
  result,
  winCount,
  totalCount,
  rate,
}: {
  result: DailyResult;
  winCount: number;
  totalCount: number;
  rate: number;
}) {
  const percent = Math.round(rate * 100);

  return (
    <View style={styles.root}>
      <View style={styles.track}>
        <View
          style={[styles.fill, { width: `${percent}%`, backgroundColor: GAUGE_COLOR[result] }]}
        />
      </View>

      <View style={styles.numbers}>
        <Text style={styles.percent}>{percent}%</Text>
        <Text style={styles.count}>
          {winCount} / {totalCount}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: spacing.sm },
  track: {
    height: 8,
    borderRadius: radius.full,
    backgroundColor: colors.rest,
    overflow: "hidden",
  },
  fill: { height: "100%", borderRadius: radius.full },
  numbers: { flexDirection: "row", alignItems: "baseline", gap: spacing.sm },
  percent: { fontSize: 26, fontWeight: "800", color: colors.content },
  count: { fontSize: 14, color: colors.contentMuted },
});
