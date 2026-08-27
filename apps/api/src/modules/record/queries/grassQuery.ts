import { Prisma } from "@prisma/client";
import type { PrismaService } from "@/prisma/prisma.service";

export type GrassRow = {
  date: string;
  result: string | null;
  totalCount: number | null;
  winCount: number | null;
};

/**
 * 기록이 없는 날까지 채워서 돌려준다.
 *
 * 클라이언트가 빈 날짜를 채우게 하면 윤년·타임존 처리가 클라이언트마다 갈린다. (07-api.md 5장)
 * `generate_series` 를 쓰려고 Postgres 를 골랐다. (03-tech-stack.md 3장)
 */
export async function selectDayRange(
  prisma: PrismaService,
  userId: string,
  from: string,
  to: string,
): Promise<GrassRow[]> {
  return prisma.$queryRaw<GrassRow[]>(Prisma.sql`
    SELECT to_char(d.day, 'YYYY-MM-DD')            AS "date",
           r.result::text                          AS "result",
           r.total_count                           AS "totalCount",
           r.win_count                             AS "winCount"
      FROM generate_series(${from}::date, ${to}::date, interval '1 day') AS d(day)
      LEFT JOIN daily_records r
        ON r.user_id = ${userId}
       AND r.date = d.day::date
     ORDER BY d.day
  `);
}
