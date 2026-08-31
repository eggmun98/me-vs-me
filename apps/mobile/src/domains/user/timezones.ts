/**
 * 하루의 경계를 정하는 값이다. (01-service-plan 6장)
 * 목록을 길게 두면 고르기만 어려워진다 — 실제로 쓰일 만한 것만 둔다.
 */
export const TIMEZONES = [
  "Asia/Seoul",
  "Asia/Tokyo",
  "America/New_York",
  "Europe/London",
  "UTC",
] as const;

export const TIMEZONE_OPTIONS = TIMEZONES.map((zone) => ({ value: zone as string, label: zone }));
