import { useQuery } from "@tanstack/react-query";
import { apiGet } from "../client/apiClient";
import { queryKeys } from "../queryKeys";
import type { GrassDay } from "../today/todayTypes";
import type { RecordStats, StatsPeriod } from "./statsTypes";

export type CalendarResponse = {
  year: number;
  month: number;
  days: GrassDay[];
};

export type GrassResponse = {
  year: number;
  days: GrassDay[];
};

export function useCalendar(year: number, month: number) {
  return useQuery({
    queryKey: queryKeys.calendar(year, month),
    queryFn: () => apiGet<CalendarResponse>(`/records/calendar?year=${year}&month=${month}`),
  });
}

export function useGrass(year: number) {
  return useQuery({
    queryKey: queryKeys.grass(year),
    queryFn: () => apiGet<GrassResponse>(`/records/grass?year=${year}`),
  });
}

export function useStats(period: StatsPeriod) {
  return useQuery({
    queryKey: queryKeys.stats(period),
    queryFn: () => apiGet<RecordStats>(`/records/stats?period=${period}`),
  });
}
