import { type RecordStats, type StatsPeriod } from "@nadaena/api-client";
import { StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing } from "@/shared/theme/colors";
import { Card } from "@/shared/ui/Card";
import { Segmented } from "@/shared/ui/Segmented";

const PERIOD_OPTIONS = [
  { value: "MONTH", label: "이번 달" },
  { value: "ALL", label: "전체" },
] as const satisfies ReadonlyArray<{ value: StatsPeriod; label: string }>;

export function StatsView({
  stats,
  period,
  onPeriodChange,
}: {
  stats: RecordStats;
  period: StatsPeriod;
  onPeriodChange: (period: StatsPeriod) => void;
}) {
  return (
    <View style={styles.root}>
      <Segmented options={PERIOD_OPTIONS} value={period} onChange={onPeriodChange} />

      <Card>
        <Row
          label="일일 전적"
          value={`${stats.daily.count}전 ${stats.daily.win}승 ${stats.daily.draw}무 ${stats.daily.lose}패`}
          sub={`승률 ${toPercent(stats.daily.winRate)}`}
        />
        <Row
          label="미션 전적"
          value={`${stats.mission.total}전 ${stats.mission.win}승 ${stats.mission.lose}패`}
          sub={`승률 ${toPercent(stats.mission.rate)}`}
        />
        <Row
          label="활동일"
          value={`${stats.activeDays}일`}
          sub={`현재 ${stats.streak.current}연승 · 최장 ${stats.streak.longest}연승`}
        />
      </Card>

      {stats.byCategory.length > 0 && (
        <Card title="카테고리별 성공률">
          {stats.byCategory.map((category) => (
            <RateBar
              key={category.categoryName}
              label={category.categoryName}
              rate={category.rate}
              detail={`${category.win}/${category.total}`}
            />
          ))}
        </Card>
      )}

      {stats.byMission.length > 0 && (
        <Card title="미션별 성공률">
          {stats.byMission.map((mission, index) => (
            <RateBar
              key={mission.missionId}
              label={mission.name}
              rate={mission.rate}
              detail={`${mission.win}/${mission.total}`}
              note={index === 0 && stats.byMission.length > 1 ? "가장 어려움" : undefined}
            />
          ))}
        </Card>
      )}

      {stats.byMonth.length > 0 && (
        <Card title="월별 승률">
          {stats.byMonth.map((month) => (
            <RateBar
              key={month.month}
              label={`${Number(month.month.split("-")[1])}월`}
              rate={month.winRate}
              detail={toPercent(month.winRate)}
            />
          ))}
        </Card>
      )}
    </View>
  );
}

function Row({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <View style={styles.rowValues}>
        <Text style={styles.rowValue}>{value}</Text>
        <Text style={styles.rowSub}>{sub}</Text>
      </View>
    </View>
  );
}

function RateBar({
  label,
  rate,
  detail,
  note,
}: {
  label: string;
  rate: number;
  detail: string;
  note?: string;
}) {
  return (
    <View style={styles.bar}>
      <View style={styles.barHead}>
        <Text numberOfLines={1} style={styles.barLabel}>
          {label}
          {note ? <Text style={styles.barNote}>  {note}</Text> : null}
        </Text>
        <Text style={styles.barDetail}>{detail}</Text>
      </View>
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${Math.round(rate * 100)}%` }]} />
      </View>
    </View>
  );
}

function toPercent(rate: number): string {
  return `${(rate * 100).toFixed(1)}%`;
}

const styles = StyleSheet.create({
  root: { gap: spacing.lg },
  row: { flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", gap: spacing.md },
  rowLabel: { fontSize: 14, color: colors.contentMuted },
  rowValues: { alignItems: "flex-end" },
  rowValue: { fontSize: 14, fontWeight: "700", color: colors.content },
  rowSub: { fontSize: 12, color: colors.contentDim },
  bar: { gap: spacing.xs },
  barHead: { flexDirection: "row", justifyContent: "space-between", gap: spacing.sm },
  barLabel: { flex: 1, fontSize: 13, color: colors.content },
  barNote: { fontSize: 11, color: colors.lose },
  barDetail: { fontSize: 12, color: colors.contentDim },
  barTrack: {
    height: 6,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceHover,
    overflow: "hidden",
  },
  barFill: { height: "100%", borderRadius: radius.full, backgroundColor: colors.win2 },
});
