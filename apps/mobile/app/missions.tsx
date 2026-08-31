import { useToday } from "@nadaena/api-client";
import { MissionListView } from "@/domains/mission/MissionListView";
import { QueryState } from "@/shared/ui/QueryState";
import { Screen } from "@/shared/ui/Screen";

/**
 * 반복 규칙의 기준 날짜는 서버가 준 "오늘"이다.
 * "매주 수요일" 같은 프리셋 문구가 여기서 만들어진다. (07-api.md 8장)
 */
export default function MissionsScreen() {
  const today = useToday();

  return (
    <Screen>
      <QueryState
        data={today.data}
        isLoading={today.isLoading}
        error={today.error}
        onRetry={() => today.refetch()}
      >
        {(data) => <MissionListView today={data.date} />}
      </QueryState>
    </Screen>
  );
}
