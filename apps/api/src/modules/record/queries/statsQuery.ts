import { Prisma } from "@prisma/client";
import type { PrismaService } from "@/prisma/prisma.service";

export type ResultCountRow = { result: string; count: number };
export type RateRow = { key: string; label: string; total: number; win: number };
export type MonthRow = { month: string; total: number; win: number };
export type StreakRow = { result: string };

/**
 * 집계 쿼리를 한곳에 모은다.
 * 느려졌을 때 어디를 튜닝할지 한눈에 보인다. (03-tech-stack.md 7장)
 *
 * 타입이 자동으로 붙지 않는 구간이라 반환 타입을 손으로 적고 테스트로 덮는다.
 */

export async function countDailyResults(
  prisma: PrismaService,
  userId: string,
  since: string | null,
): Promise<ResultCountRow[]> {
  return prisma.$queryRaw<ResultCountRow[]>(Prisma.sql`
    SELECT result::text AS "result", count(*)::int AS "count"
      FROM daily_records
     WHERE user_id = ${userId}
       ${since ? Prisma.sql`AND date >= ${since}::date` : Prisma.empty}
     GROUP BY result
  `);
}

export async function countMissionResults(
  prisma: PrismaService,
  userId: string,
  since: string | null,
): Promise<ResultCountRow[]> {
  return prisma.$queryRaw<ResultCountRow[]>(Prisma.sql`
    SELECT result::text AS "result", count(*)::int AS "count"
      FROM daily_missions
     WHERE user_id = ${userId}
       AND result <> 'PENDING'
       ${since ? Prisma.sql`AND date >= ${since}::date` : Prisma.empty}
     GROUP BY result
  `);
}

export async function selectCategoryRates(
  prisma: PrismaService,
  userId: string,
  since: string | null,
): Promise<RateRow[]> {
  return prisma.$queryRaw<RateRow[]>(Prisma.sql`
    SELECT coalesce(category_name, '기타')                   AS "key",
           coalesce(category_name, '기타')                   AS "label",
           count(*)::int                                     AS "total",
           count(*) FILTER (WHERE result = 'WIN')::int       AS "win"
      FROM daily_missions
     WHERE user_id = ${userId}
       AND result <> 'PENDING'
       ${since ? Prisma.sql`AND date >= ${since}::date` : Prisma.empty}
     GROUP BY 1
     ORDER BY count(*) FILTER (WHERE result = 'WIN')::numeric / nullif(count(*), 0) DESC
  `);
}

/** 삭제된 미션도 포함한다. soft delete 라 과거 기록이 남아 있다. (06-database.md 1.2) */
export async function selectMissionRates(
  prisma: PrismaService,
  userId: string,
  since: string | null,
): Promise<RateRow[]> {
  return prisma.$queryRaw<RateRow[]>(Prisma.sql`
    SELECT mission_id                                        AS "key",
           max(name)                                         AS "label",
           count(*)::int                                     AS "total",
           count(*) FILTER (WHERE result = 'WIN')::int       AS "win"
      FROM daily_missions
     WHERE user_id = ${userId}
       AND result <> 'PENDING'
       ${since ? Prisma.sql`AND date >= ${since}::date` : Prisma.empty}
     GROUP BY mission_id
     ORDER BY count(*) FILTER (WHERE result = 'WIN')::numeric / nullif(count(*), 0) ASC
  `);
}

export async function selectMonthRates(
  prisma: PrismaService,
  userId: string,
): Promise<MonthRow[]> {
  return prisma.$queryRaw<MonthRow[]>(Prisma.sql`
    SELECT to_char(date, 'YYYY-MM')                          AS "month",
           count(*) FILTER (WHERE result <> 'REST')::int     AS "total",
           count(*) FILTER (WHERE result = 'WIN')::int       AS "win"
      FROM daily_records
     WHERE user_id = ${userId}
     GROUP BY 1
     ORDER BY 1
  `);
}

/** 연승은 저장하지 않고 매번 계산한다. 결과 배열만 뽑아 core 에 넘긴다. (06-database.md 1.1) */
export async function selectResultsInOrder(
  prisma: PrismaService,
  userId: string,
): Promise<StreakRow[]> {
  return prisma.$queryRaw<StreakRow[]>(Prisma.sql`
    SELECT result::text AS "result"
      FROM daily_records
     WHERE user_id = ${userId}
     ORDER BY date ASC
  `);
}
