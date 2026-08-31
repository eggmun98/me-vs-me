// 클라이언트 설정 · 호출
export {
  configureApiClient,
  type ApiClientConfig,
  type RefreshTokenStore,
} from "./client/config";
export { apiDelete, apiGet, apiPatch, apiPost, apiPut } from "./client/apiClient";
export { ApiRequestError, type ApiError } from "./client/apiError";
export { getAccessToken, setAccessToken, subscribeAccessToken } from "./client/accessToken";
export { queryKeys } from "./queryKeys";

// auth
export { loginWithSocial, logout, restoreSession } from "./auth/authApi";
export type { LoginResponse, SocialCredential, SocialProviderId } from "./auth/authTypes";

// user
export {
  useCheckNickname,
  useCompleteOnboarding,
  useMe,
  useSuggestNickname,
  useUpdateMe,
} from "./user/useUser";
export type { Me, OnboardingMission, OnboardingRequest } from "./user/userTypes";
export {
  countRequiredWins,
  RECOMMENDED_COUNT,
  RECOMMENDED_MISSIONS,
  toOnboardingMission,
} from "./user/onboardingPresets";

// mission
export {
  useCategories,
  useCreateMission,
  useDeleteMission,
  useMissions,
  useUpdateMission,
} from "./mission/useMissions";
export type {
  Category,
  Difficulty,
  Mission,
  MissionDraft,
  MissionListResponse,
} from "./mission/missionTypes";
export { DIFFICULTY_OPTIONS, REPEAT_INTERVAL_MAX, UNITS } from "./mission/missionConstants";
export {
  buildRepeatOptions,
  buildRuleFromOption,
  resolveSelectedOption,
  type RepeatOption,
  type RepeatOptionId,
} from "./mission/repeatOptions";
export {
  buildCustomRule,
  createInitialCustomState,
  isFreqUsingMonthlyMode,
  isFreqUsingWeekdays,
  toggleWeekday,
} from "./mission/repeatCustom";
export {
  FREQ_UNIT_LABELS,
  getWeekdayOrdinalOf,
  type CustomRepeatFreq,
  type CustomRepeatState,
  type MonthlyModeKind,
} from "./mission/repeatCustomTypes";

// today
export { useToday, useUpdateMissionResult, useUpdateReflection } from "./today/useToday";
export type {
  DailyResult,
  EditableDate,
  GrassDay,
  MissionResult,
  RecordSummary,
  TodayMission,
  TodayResponse,
  UpdateMissionResultResponse,
  WinLoseCount,
} from "./today/todayTypes";
export { formatKoreanDate, formatMissionTarget, getResultText } from "./today/todayFormat";

// record
export {
  useCalendar,
  useGrass,
  useStats,
  type CalendarResponse,
  type GrassResponse,
} from "./record/useRecords";
export type {
  CategoryRate,
  MissionRate,
  MonthRate,
  RecordStats,
  StatsPeriod,
} from "./record/statsTypes";
export { getGrassTier, type GrassResult, type GrassTier } from "./record/grassTier";
export {
  buildCalendarDay,
  buildCalendarDays,
  findPlannedMissions,
  getMonthGridStart,
  getWeekStartDate,
  MONTH_GRID_CELLS,
  WEEKS_IN_MONTH_GRID,
  type CalendarSource,
} from "./record/buildCalendarDays";
export type {
  CalendarDay,
  CalendarDayKind,
  PlannedMission,
} from "./record/calendarTypes";
export {
  VIEW_MODE_OPTIONS,
  VIEW_STEP_DAYS,
  type CalendarViewMode,
} from "./record/calendarViewTypes";
export {
  describeGrassDay,
  describeGrassDayLine,
  type GrassDayText,
} from "./record/describeGrassDay";
