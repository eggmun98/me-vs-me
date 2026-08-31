/**
 * 웹의 `globals.css` `@theme` 토큰과 같은 값이다. (01-service-plan.md 8장)
 *
 * 두 화면이 같은 서비스로 보여야 해서 색은 한 벌만 쓴다.
 * 웹은 Tailwind 토큰, 앱은 이 객체 — 값을 바꿀 때 둘 다 고친다.
 */
export const colors = {
  bg: "#fafafa",
  surface: "#ffffff",
  surfaceHover: "#f4f4f5",
  border: "#e7e7ea",
  borderStrong: "#d3d3d8",

  content: "#141414",
  contentMuted: "#5f6068",
  contentDim: "#9a9ba3",

  /** 오닉스 — 버튼 */
  accent: "#141414",
  onAccent: "#ffffff",
  /** 남청 — 링크·강조 */
  brand: "#0d21a1",
  deep: "#011638",

  rest: "#f4f4f5",
  lose: "#d7263d",
  /** 토스카나의 태양 — 무승부 전용 */
  draw: "#eec643",
  win1: "#a9e3be",
  win2: "#47b877",
  win3: "#14804a",
} as const;

export const radius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  full: 999,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;
