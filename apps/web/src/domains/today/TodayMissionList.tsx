"use client";

import { TodayMissionRow } from "./TodayMissionRow";
import { type MissionResult, type TodayMission } from "@nadaena/api-client";

/** 완료한 미션을 위로 올린다. 남은 것이 아래에 모여야 무엇을 더 해야 하는지 보인다. (05-screens 4.1) */
const RESULT_ORDER: Record<MissionResult, number> = {
  WIN: 0,
  PENDING: 1,
  LOSE: 2,
};

export function TodayMissionList({
  missions,
  onToggle,
}: {
  missions: TodayMission[];
  onToggle: (id: string) => void;
}) {
  const sorted = [...missions].sort(
    (a, b) => RESULT_ORDER[a.result] - RESULT_ORDER[b.result],
  );

  return (
    <ul className="flex flex-col gap-2">
      {sorted.map((mission) => (
        <li key={mission.id}>
          <TodayMissionRow mission={mission} onToggle={onToggle} />
        </li>
      ))}
    </ul>
  );
}
