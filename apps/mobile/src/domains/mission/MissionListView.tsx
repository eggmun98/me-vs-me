import {
  type Mission,
  useCreateMission,
  useDeleteMission,
  useMissions,
  useUpdateMission,
} from "@nadaena/api-client";
import { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "@/shared/theme/colors";
import { AppButton } from "@/shared/ui/AppButton";
import { EmptyState, QueryState } from "@/shared/ui/QueryState";
import { MissionFormSheet } from "./MissionFormSheet";
import { MissionRow } from "./MissionRow";

type FormState = { isOpen: boolean; mission?: Mission };

export function MissionListView({ today }: { today: string }) {
  const missions = useMissions();
  const createMission = useCreateMission();
  const updateMission = useUpdateMission();
  const deleteMission = useDeleteMission();
  const [form, setForm] = useState<FormState>({ isOpen: false });

  /** 삭제는 되돌릴 수 없고 오늘 승부에는 남는다. 규칙을 먼저 알려주고 묻는다. */
  function confirmDelete(mission: Mission) {
    Alert.alert(
      `'${mission.name}' 을(를) 삭제할까요?`,
      "오늘 승부에는 그대로 남고 내일부터 빠집니다. 지난 기록은 바뀌지 않습니다.",
      [
        { text: "취소", style: "cancel" },
        {
          text: "삭제",
          style: "destructive",
          onPress: () => deleteMission.mutate(mission.id),
        },
      ],
    );
  }

  return (
    <View style={styles.root}>
      <AppButton label="미션 추가" onPress={() => setForm({ isOpen: true })} />

      <QueryState
        data={missions.data}
        isLoading={missions.isLoading}
        error={missions.error}
        onRetry={() => missions.refetch()}
      >
        {(data) => (
          <View style={styles.groups}>
            {data.active.length === 0 && data.inactive.length === 0 ? (
              <EmptyState message="아직 미션이 없습니다. 첫 미션을 만들어 보세요." />
            ) : null}

            <Group title="진행 중" missions={data.active} onEdit={openEdit} onDelete={confirmDelete} />
            <Group title="보관됨" missions={data.inactive} onEdit={openEdit} onDelete={confirmDelete} />
          </View>
        )}
      </QueryState>

      <MissionFormSheet
        isOpen={form.isOpen}
        today={today}
        mission={form.mission}
        isSaving={createMission.isPending || updateMission.isPending}
        onClose={() => setForm({ isOpen: false })}
        onSubmit={(draft) => {
          const target = form.mission;
          const mutation = target
            ? updateMission.mutateAsync({ id: target.id, draft })
            : createMission.mutateAsync(draft);

          void mutation.then(() => setForm({ isOpen: false }));
        }}
      />
    </View>
  );

  function openEdit(mission: Mission) {
    setForm({ isOpen: true, mission });
  }
}

function Group({
  title,
  missions,
  onEdit,
  onDelete,
}: {
  title: string;
  missions: Mission[];
  onEdit: (mission: Mission) => void;
  onDelete: (mission: Mission) => void;
}) {
  if (missions.length === 0) return null;

  return (
    <View style={styles.group}>
      <Text style={styles.groupTitle}>
        {title} {missions.length}
      </Text>
      {missions.map((mission) => (
        <MissionRow key={mission.id} mission={mission} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: spacing.lg },
  groups: { gap: spacing.xl },
  group: { gap: spacing.sm },
  groupTitle: { fontSize: 12, fontWeight: "700", color: colors.contentDim },
});
