export const queryKeys = {
  me: ["me"] as const,
  today: ["today"] as const,
  demoTour: ["public", "demo", "tour"] as const,
  missions: ["missions"] as const,
  categories: ["categories"] as const,
  calendar: (year: number, month: number) => ["records", "calendar", year, month] as const,
  grass: (year: number) => ["records", "grass", year] as const,
  stats: (period: string) => ["records", "stats", period] as const,
};
