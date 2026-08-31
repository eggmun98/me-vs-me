import {
  describeGrassDayLine,
  type GrassDay,
  type RecordSummary,
  type WinLoseCount,
} from "@nadaena/api-client";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "@/shared/theme/colors";
import { Card } from "@/shared/ui/Card";
import { GrassCell } from "./GrassCell";
import { GrassLegend } from "./GrassLegend";

export function SummaryCard({ summary }: { summary: RecordSummary }) {
  return (
    <View style={styles.root}>
      <Card>
        <View style={styles.streak}>
          <Text style={styles.streakValue}>🔥 {summary.streak.current}</Text>
          <Text style={styles.streakUnit}>연승</Text>
        </View>
        <Text style={styles.streakSub}>최장 {summary.streak.longest}연승</Text>
      </Card>

      <Card>
        <Block title="통산">
          <RecordLine record={summary.total} />
        </Block>
        <Block title={`${formatMonthLabel(summary.month.month)} 시즌`}>
          <RecordLine record={summary.month} />
        </Block>
      </Card>

      <Card title="이번 달">
        <MonthGrass days={summary.monthGrass} />
        <GrassLegend />
      </Card>
    </View>
  );
}

/**
 * 터치에는 hover 가 없다. 웹의 잔디 툴팁을 그대로 옮길 수 없어,
 * 탭한 날을 격자 아래 한 줄로 보여준다. 문구는 웹과 같은 함수가 만든다.
 */
function MonthGrass({ days }: { days: GrassDay[] }) {
  const [selected, setSelected] = useState<GrassDay | null>(null);

  // 처음에는 가장 최근 기록을 보여준다. 빈 줄만 남겨두면 눌러야 하는 줄 모른다.
  const shown = selected ?? findLatestRecorded(days);

  return (
    <View style={styles.grassBlock}>
      <View style={styles.grass}>
        {days.map((day) => (
          <View key={day.date} style={styles.grassSlot}>
            <GrassCell
              day={day}
              size="fill"
              isSelected={selected?.date === day.date}
              onPress={setSelected}
            />
          </View>
        ))}
      </View>

      {shown && <Text style={styles.grassLine}>{describeGrassDayLine(shown)}</Text>}
    </View>
  );
}

function findLatestRecorded(days: GrassDay[]): GrassDay | null {
  for (let index = days.length - 1; index >= 0; index -= 1) {
    const day = days[index];

    if (day && day.result !== "NONE") return day;
  }

  return null;
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.block}>
      <Text style={styles.blockTitle}>{title}</Text>
      {children}
    </View>
  );
}

export function RecordLine({ record }: { record: WinLoseCount }) {
  return (
    <View>
      <Text style={styles.recordValue}>
        {record.count}전 {record.win}승{record.draw > 0 ? ` ${record.draw}무` : ""} {record.lose}패
      </Text>
      <Text style={styles.recordSub}>승률 {(record.winRate * 100).toFixed(1)}%</Text>
    </View>
  );
}

function formatMonthLabel(month: string): string {
  return `${Number(month.split("-")[1])}월`;
}

const styles = StyleSheet.create({
  root: { gap: spacing.lg },
  streak: { flexDirection: "row", alignItems: "baseline", gap: spacing.sm },
  streakValue: { fontSize: 26, fontWeight: "800", color: colors.win3 },
  streakUnit: { fontSize: 14, color: colors.contentMuted },
  streakSub: { fontSize: 12, color: colors.contentDim },
  block: { gap: spacing.xs },
  blockTitle: { fontSize: 12, fontWeight: "700", color: colors.contentDim },
  recordValue: { fontSize: 15, fontWeight: "700", color: colors.content },
  recordSub: { fontSize: 12, color: colors.contentMuted, marginTop: 2 },
  grassBlock: { gap: spacing.sm },
  /** 한 줄에 7칸. 요일이 세로로 맞아야 잔디로 읽힌다. */
  grass: { flexDirection: "row", flexWrap: "wrap" },
  grassSlot: { width: `${100 / 7}%` },
  grassLine: { fontSize: 12, color: colors.contentMuted },
});
