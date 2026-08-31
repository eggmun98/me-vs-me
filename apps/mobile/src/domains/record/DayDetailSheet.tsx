import { formatKoreanDate, getResultText, type CalendarDay } from "@nadaena/api-client";
import { StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "@/shared/theme/colors";
import { AppButton } from "@/shared/ui/AppButton";
import { Sheet } from "@/shared/ui/Sheet";
import { RESULT_COLOR } from "@/domains/today/resultTone";

export function DayDetailSheet({
  day,
  onClose,
}: {
  day: CalendarDay | null;
  onClose: () => void;
}) {
  return (
    <Sheet
      isOpen={day !== null}
      title={day ? formatKoreanDate(day.date) : ""}
      onClose={onClose}
      footer={<AppButton label="닫기" tone="outline" onPress={onClose} style={styles.footer} />}
    >
      {day && <DayBody day={day} />}
    </Sheet>
  );
}

function DayBody({ day }: { day: CalendarDay }) {
  if (day.kind === "FUTURE") {
    return (
      <View style={styles.body}>
        <Text style={styles.label}>예정된 미션</Text>
        {day.planned.length === 0 ? (
          <Text style={styles.muted}>이 날은 예정된 미션이 없습니다. 쉬는 날입니다.</Text>
        ) : (
          day.planned.map((mission) => (
            <Text key={mission.id} style={styles.line}>
              · {mission.name}
              {mission.categoryName ? `  ${mission.categoryName}` : ""}
            </Text>
          ))
        )}
      </View>
    );
  }

  const record = day.record;

  if (!record || record.result === "NONE") {
    return <Text style={styles.muted}>기록이 없는 날입니다.</Text>;
  }

  return (
    <View style={styles.body}>
      <Text style={[styles.result, { color: RESULT_COLOR[record.result] }]}>
        {getResultText(record.result)}
      </Text>
      <Text style={styles.line}>
        {record.winCount} / {record.totalCount} 완료
        {record.rate === null ? "" : `  ·  달성률 ${Math.round(record.rate * 100)}%`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  body: { gap: spacing.sm },
  label: { fontSize: 12, fontWeight: "700", color: colors.contentDim },
  result: { fontSize: 20, fontWeight: "800" },
  line: { fontSize: 14, color: colors.content },
  muted: { fontSize: 14, color: colors.contentDim },
  footer: { flex: 1 },
});
