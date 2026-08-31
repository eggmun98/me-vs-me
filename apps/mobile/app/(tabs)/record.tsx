import {
  type CalendarDay,
  type MissionDraft,
  type StatsPeriod,
  useCalendar,
  useCreateMission,
  useMissions,
  useStats,
  useToday,
} from "@nadaena/api-client";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { MissionFormSheet } from "@/domains/mission/MissionFormSheet";
import { DayDetailSheet } from "@/domains/record/DayDetailSheet";
import { MonthCalendar } from "@/domains/record/MonthCalendar";
import { StatsView } from "@/domains/record/StatsView";
import { SummaryCard } from "@/domains/record/SummaryCard";
import { colors, spacing } from "@/shared/theme/colors";
import { Card } from "@/shared/ui/Card";
import { QueryState } from "@/shared/ui/QueryState";
import { Screen } from "@/shared/ui/Screen";
import { Segmented } from "@/shared/ui/Segmented";

const TABS = [
  { value: "CALENDAR", label: "달력" },
  { value: "STATS", label: "통계" },
] as const;

type RecordTab = (typeof TABS)[number]["value"];

export default function RecordScreen() {
  const [tab, setTab] = useState<RecordTab>("CALENDAR");

  return (
    <Screen>
      <Segmented options={TABS} value={tab} onChange={setTab} />
      {tab === "CALENDAR" ? <CalendarTab /> : <StatsTab />}
    </Screen>
  );
}

function CalendarTab() {
  const today = useToday();
  const missions = useMissions();
  const createMission = useCreateMission();
  const [offset, setOffset] = useState(0);
  const [selected, setSelected] = useState<CalendarDay | null>(null);
  const [onceDate, setOnceDate] = useState<string | null>(null);

  const anchor = shiftMonth(today.data?.date ?? null, offset);
  const calendar = useCalendar(anchor?.year ?? 0, anchor?.month ?? 1);

  /**
   * 달력에서 들어온 미션은 그날 하루만 열린다.
   * 매번 새 객체를 만들면 시트가 입력 중에 초기화되므로 날짜에 묶어 기억한다.
   */
  const onceRepeat = useMemo(
    () => (onceDate ? ({ type: "ONCE", startDate: onceDate } as const) : undefined),
    [onceDate],
  );

  function addOnceMission(draft: MissionDraft) {
    createMission.mutate(draft);
    setOnceDate(null);
  }

  return (
    <QueryState
      data={today.data}
      isLoading={today.isLoading}
      error={today.error}
      onRetry={() => today.refetch()}
    >
      {(data) => (
        <View style={styles.root}>
          <Card>
            <View style={styles.monthHead}>
              <MonthStep label="‹" onPress={() => setOffset((prev) => prev - 1)} />
              <Text style={styles.monthLabel}>
                {anchor?.year}년 {anchor?.month}월
              </Text>
              <MonthStep
                label="›"
                disabled={offset >= 0}
                onPress={() => setOffset((prev) => Math.min(0, prev + 1))}
              />
            </View>

            <MonthCalendar
              year={anchor?.year ?? 0}
              month={anchor?.month ?? 1}
              today={data.date}
              days={calendar.data?.days ?? []}
              missions={missions.data?.active ?? []}
              onSelectDay={setSelected}
            />
          </Card>

          <SummaryCard summary={data.summary} />

          <DayDetailSheet
            day={selected}
            onAddOnce={(date) => {
              // 상세를 닫고 폼을 연다. 시트 두 장이 겹쳐 있으면 무엇을 쓰는 중인지 흐려진다.
              setSelected(null);
              setOnceDate(date);
            }}
            onClose={() => setSelected(null)}
          />

          <MissionFormSheet
            isOpen={onceDate !== null}
            today={onceDate ?? data.date}
            defaultRepeat={onceRepeat}
            title={onceDate ? `${formatDayLabel(onceDate)} 미션 추가` : "미션 추가"}
            isSaving={createMission.isPending}
            onSubmit={addOnceMission}
            onClose={() => setOnceDate(null)}
          />
        </View>
      )}
    </QueryState>
  );
}

function StatsTab() {
  const [period, setPeriod] = useState<StatsPeriod>("MONTH");
  const stats = useStats(period);

  return (
    <QueryState
      data={stats.data}
      isLoading={stats.isLoading}
      error={stats.error}
      onRetry={() => stats.refetch()}
    >
      {(data) => <StatsView stats={data} period={period} onPeriodChange={setPeriod} />}
    </QueryState>
  );
}

function MonthStep({
  label,
  onPress,
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={[styles.step, disabled && styles.stepDisabled]}
    >
      <Text style={styles.stepLabel}>{label}</Text>
    </Pressable>
  );
}

/** 기준은 서버가 준 "오늘"이다. 기기 시계를 믿지 않는다. (07-api.md 8장) */
function shiftMonth(today: string | null, offset: number): { year: number; month: number } | null {
  if (!today) return null;

  const [year, month] = today.split("-").map(Number);
  if (year === undefined || month === undefined) return null;

  const total = year * 12 + (month - 1) + offset;

  return { year: Math.floor(total / 12), month: (total % 12) + 1 };
}

const styles = StyleSheet.create({
  root: { gap: spacing.lg },
  monthHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  monthLabel: { fontSize: 15, fontWeight: "700", color: colors.content },
  step: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
  stepDisabled: { opacity: 0.3 },
  stepLabel: { fontSize: 22, color: colors.contentMuted, lineHeight: 26 },
});

/** "8월 31일" — 시트 제목에만 쓴다. 연도는 달력 머리글에 이미 있다. */
function formatDayLabel(isoDate: string): string {
  const [, month, day] = isoDate.split("-").map(Number);

  return `${month}월 ${day}일`;
}
