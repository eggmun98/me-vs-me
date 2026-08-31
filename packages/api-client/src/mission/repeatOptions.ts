import {
  buildRepeatPreset,
  describeRepeat,
  type RepeatPresetId,
  type RepeatRule,
} from "@nadaena/core";

export type RepeatOptionId = RepeatPresetId | "ONCE" | "CUSTOM";

const PRESET_IDS: RepeatPresetId[] = [
  "DAILY",
  "WEEKLY_SAME_DAY",
  "MONTHLY_NTH_WEEKDAY",
  "YEARLY_SAME_DATE",
  "WEEKDAYS",
];

export type RepeatOption = {
  id: RepeatOptionId;
  label: string;
};

/**
 * 프리셋의 문구는 기준 날짜에 따라 달라진다.
 * "매주 수요일"은 오늘이 수요일이기 때문에 나오는 문장이다.
 */
export function buildRepeatOptions(baseDate: string): RepeatOption[] {
  const presets = PRESET_IDS.map((id) => ({
    id,
    label: describeRepeat(buildRepeatPreset(id, baseDate)),
  }));

  return [{ id: "ONCE", label: "반복 안함" }, ...presets, { id: "CUSTOM", label: "맞춤..." }];
}

export function buildRuleFromOption(id: RepeatOptionId, baseDate: string): RepeatRule | null {
  if (id === "CUSTOM") return null;
  if (id === "ONCE") return { type: "ONCE", startDate: baseDate };

  return buildRepeatPreset(id, baseDate);
}

/**
 * 지금 규칙이 어느 항목인지 찾는다.
 *
 * 라벨 문자열로 비교하지 않는다. 문구를 바꾸면 매칭이 조용히 깨지고,
 * 사용자에게는 멀쩡한 프리셋이 "맞춤"으로 보인다.
 */
export function resolveSelectedOption(rule: RepeatRule, baseDate: string): RepeatOptionId {
  if (rule.type === "ONCE") return "ONCE";

  const matched = PRESET_IDS.find((id) =>
    isSameRuleShape(rule, buildRepeatPreset(id, baseDate)),
  );

  return matched ?? "CUSTOM";
}

/**
 * 시작일을 빼고 비교한다.
 * 석 달 전에 만든 "매주 수요일" 미션도 시작일만 다를 뿐 같은 프리셋이다.
 */
function isSameRuleShape(a: RepeatRule, b: RepeatRule): boolean {
  const { startDate: _a, ...shapeA } = a;
  const { startDate: _b, ...shapeB } = b;

  return JSON.stringify(sortKeys(shapeA)) === JSON.stringify(sortKeys(shapeB));
}

function sortKeys(value: unknown): unknown {
  if (Array.isArray(value)) return [...value].map(sortKeys).sort();
  if (value === null || typeof value !== "object") return value;

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, child]) => [key, sortKeys(child)]),
  );
}
