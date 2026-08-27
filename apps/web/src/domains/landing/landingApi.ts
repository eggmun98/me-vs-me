import type { RecordStats } from "@/domains/record/stats/statsTypes";
import type { GrassDay, RecordSummary, TodayResponse } from "@/domains/today/todayTypes";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

export type DemoTour = {
  profile: { nickname: string; bio: string | null };
  today: Omit<TodayResponse, "summary">;
  summary: RecordSummary;
  stats: RecordStats;
};

/**
 * 랜딩은 로그인이 필요 없어 서버에서 렌더한다.
 * Next.js 를 고른 이유(공개 페이지 SEO·OG)를 여기서 처음 쓴다. (03-tech-stack.md 5장)
 */
export async function fetchDemoTour(): Promise<DemoTour | null> {
  return fetchPublic<DemoTour>("/public/demo/tour");
}

export async function fetchDemoGrass(year: number): Promise<{ days: GrassDay[] } | null> {
  return fetchPublic<{ days: GrassDay[] }>(`/public/demo/grass?year=${year}`);
}

/** API 가 꺼져 있어도 랜딩 자체는 떠야 한다. 미리보기만 빠진다. */
async function fetchPublic<T>(path: string): Promise<T | null> {
  try {
    const response = await fetch(`${BASE_URL}${path}`, { next: { revalidate: 300 } });

    if (!response.ok) return null;

    return (await response.json()) as T;
  } catch {
    return null;
  }
}
