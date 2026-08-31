import {
  buildCalendarDays,
  type CalendarDay,
  type GrassDay,
  getMonthGridStart,
  type Mission,
  MONTH_GRID_CELLS,
} from "@nadaena/api-client";
import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing } from "@/shared/theme/colors";
import { getGrassStyle } from "@/shared/theme/grassColor";

const WEEKDAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"] as const;

/**
 * 항상 6주를 그린다. 달마다 높이가 달라지면 탭을 옮길 때마다 화면이 출렁인다.
 * (04-folder-convention 기준: 격자 계산은 `@nadaena/api-client` 가 웹과 공유한다)
 */
export function MonthCalendar({
  year,
  month,
  today,
  days,
  missions,
  onSelectDay,
}: {
  year: number;
  month: number;
  today: string;
  days: GrassDay[];
  missions: Mission[];
  onSelectDay: (day: CalendarDay) => void;
}) {
  const cells = useMemo(() => {
    const records = Object.fromEntries(days.map((day) => [day.date, day]));

    return buildCalendarDays(
      getMonthGridStart(year, month),
      MONTH_GRID_CELLS,
      { today, missions, records },
      month,
    );
  }, [days, missions, month, today, year]);

  return (
    <View style={styles.root}>
      <View style={styles.weekdays}>
        {WEEKDAY_LABELS.map((label) => (
          <Text key={label} style={styles.weekday}>
            {label}
          </Text>
        ))}
      </View>

      <View style={styles.grid}>
        {cells.map((cell) => (
          <DayCell key={cell.date} day={cell} onPress={() => onSelectDay(cell)} />
        ))}
      </View>
    </View>
  );
}

function DayCell({ day, onPress }: { day: CalendarDay; onPress: () => void }) {
  const fill = day.record
    ? getGrassStyle(day.record.result, day.record.rate)
    : { backgroundColor: "transparent", borderColor: "transparent", borderWidth: 0 };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={day.date}
      onPress={onPress}
      style={({ pressed }) => [styles.cell, pressed && styles.cellPressed]}
    >
      <View style={[styles.dot, fill, day.kind === "TODAY" && styles.dotToday]}>
        <Text
          style={[
            styles.dayNumber,
            !day.isCurrentMonth && styles.dayOutside,
            isFilled(day) && styles.dayOnFill,
          ]}
        >
          {day.dayOfMonth}
        </Text>
      </View>

      {day.planned.length > 0 && <View style={styles.plannedMark} />}
    </Pressable>
  );
}

/** 진한 칸 위에서는 검은 글씨가 안 보인다. */
function isFilled(day: CalendarDay): boolean {
  if (!day.record) return false;

  return day.record.result === "WIN" || day.record.result === "LOSE";
}

const styles = StyleSheet.create({
  root: { gap: spacing.sm },
  weekdays: { flexDirection: "row" },
  weekday: {
    flex: 1,
    textAlign: "center",
    fontSize: 11,
    fontWeight: "600",
    color: colors.contentDim,
  },
  grid: { flexDirection: "row", flexWrap: "wrap" },
  cell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  cellPressed: { opacity: 0.6 },
  dot: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  dotToday: { borderWidth: 2, borderColor: colors.accent },
  dayNumber: { fontSize: 13, color: colors.content },
  dayOutside: { color: colors.contentDim, opacity: 0.5 },
  dayOnFill: { color: colors.onAccent, fontWeight: "700" },
  plannedMark: {
    width: 4,
    height: 4,
    borderRadius: radius.full,
    backgroundColor: colors.brand,
  },
});
