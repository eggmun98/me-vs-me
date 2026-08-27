import {
  addDays,
  buildRepeatPreset,
  formatLocalDate,
  judgeDailyResult,
  occursOn,
  parseLocalDate,
  type RepeatRule,
  toLocalDate,
} from "@nadaena/core";
import { PrismaClient, type Difficulty } from "@prisma/client";
import { fromDateOnly } from "../src/common/dateOnly";
import { ruleToColumns } from "../src/modules/mission/repeatMapping";

const prisma = new PrismaClient();

/** 로그인 없이 둘러보기로 공개되는 계정 */
export const DEMO_USER_NICKNAME = "나와 싸우는 사람";

const SEED_TIMEZONE = "Asia/Seoul";
const TODAY = formatLocalDate(toLocalDate(new Date(), SEED_TIMEZONE));
const HISTORY_DAYS = 180;

const CATEGORIES = ["운동", "공부", "외국어", "개발", "독서", "생활", "건강", "기타"];

type SeedMission = {
  name: string;
  categoryName: string;
  targetAmount: number | null;
  unit: string | null;
  difficulty: Difficulty;
  repeat: RepeatRule;
  isActive: boolean;
  /** 과거 기록을 만들 때 쓰는 성공률. 통계에서 미션마다 다르게 보이도록 한다. */
  successRate: number;
};

function since(rule: RepeatRule, startDate: string): RepeatRule {
  return { ...rule, startDate };
}

async function main(): Promise<void> {
  const createdAt = formatLocalDate(addDays(parseLocalDate(TODAY), -HISTORY_DAYS));

  const missions: SeedMission[] = [
    {
      name: "영어 공부",
      categoryName: "외국어",
      targetAmount: 30,
      unit: "분",
      difficulty: "NORMAL",
      repeat: since(buildRepeatPreset("WEEKDAYS", TODAY), createdAt),
      isActive: true,
      successRate: 0.88,
    },
    {
      name: "헬스",
      categoryName: "운동",
      targetAmount: 90,
      unit: "분",
      difficulty: "HARD",
      repeat: { type: "WEEKLY", startDate: createdAt, interval: 1, weekdays: [1, 3, 5, 6] },
      isActive: true,
      successRate: 0.94,
    },
    {
      name: "알고리즘",
      categoryName: "개발",
      targetAmount: 2,
      unit: "문제",
      difficulty: "HARD",
      repeat: since(buildRepeatPreset("DAILY", TODAY), createdAt),
      isActive: true,
      successRate: 0.72,
    },
    {
      name: "독서",
      categoryName: "독서",
      targetAmount: 30,
      unit: "분",
      difficulty: "NORMAL",
      repeat: { type: "WEEKLY", startDate: createdAt, interval: 1, weekdays: [0, 2, 4, 6] },
      isActive: true,
      successRate: 0.61,
    },
    {
      name: "월간 회고 쓰기",
      categoryName: "생활",
      targetAmount: null,
      unit: null,
      difficulty: "EASY",
      repeat: since(buildRepeatPreset("MONTHLY_NTH_WEEKDAY", TODAY), createdAt),
      isActive: true,
      successRate: 0.8,
    },
    {
      name: "기타 연습",
      categoryName: "기타",
      targetAmount: 30,
      unit: "분",
      difficulty: "NORMAL",
      repeat: { type: "WEEKLY", startDate: createdAt, interval: 2, weekdays: [0, 6] },
      isActive: false,
      successRate: 0.5,
    },
  ];

  await prisma.$transaction(async (tx) => {
    // 데모 계정만 다시 만든다. 실제 로그인한 사용자는 건드리지 않는다.
    const demo = await tx.user.findFirst({ where: { isDemo: true }, select: { id: true } });

    if (demo) {
      await tx.dailyRecord.deleteMany({ where: { userId: demo.id } });
      await tx.dailyMission.deleteMany({ where: { userId: demo.id } });
      await tx.mission.deleteMany({ where: { userId: demo.id } });
      await tx.user.delete({ where: { id: demo.id } });
    }

    await tx.category.deleteMany({ where: { userId: null } });

    const user = await tx.user.create({
      data: {
        nickname: DEMO_USER_NICKNAME,
        bio: "오늘도 나와 싸운다",
        timezone: SEED_TIMEZONE,
        isDemo: true,
        onboardedAt: new Date(),
      },
    });

    const categories = await Promise.all(
      CATEGORIES.map((name, order) => tx.category.create({ data: { name, order } })),
    );
    const categoryByName = new Map(categories.map((category) => [category.name, category]));

    const created = await Promise.all(
      missions.map((mission) =>
        tx.mission.create({
          data: {
            userId: user.id,
            categoryId: categoryByName.get(mission.categoryName)?.id ?? null,
            name: mission.name,
            targetAmount: mission.targetAmount,
            unit: mission.unit,
            difficulty: mission.difficulty,
            isActive: mission.isActive,
            ...ruleToColumns(mission.repeat),
          },
        }),
      ),
    );

    const rows: Array<{
      userId: string;
      missionId: string;
      date: Date;
      name: string;
      categoryName: string | null;
      targetAmount: number | null;
      unit: string | null;
      difficulty: Difficulty;
      result: "WIN" | "LOSE";
    }> = [];
    const records: Array<{
      userId: string;
      date: Date;
      result: ReturnType<typeof judgeDailyResult>;
      totalCount: number;
      winCount: number;
      settledAt: Date;
    }> = [];

    for (let offset = HISTORY_DAYS; offset >= 1; offset -= 1) {
      const date = formatLocalDate(addDays(parseLocalDate(TODAY), -offset));
      let totalCount = 0;
      let winCount = 0;

      for (const [index, mission] of missions.entries()) {
        const record = created[index];
        if (!record || !mission.isActive) continue;
        if (!occursOn(mission.repeat, date)) continue;

        const isWin = hashToUnit(`${date}:${record.id}`) < mission.successRate;
        totalCount += 1;
        if (isWin) winCount += 1;

        rows.push({
          userId: user.id,
          missionId: record.id,
          date: fromDateOnly(date),
          name: mission.name,
          categoryName: mission.categoryName,
          targetAmount: mission.targetAmount,
          unit: mission.unit,
          difficulty: mission.difficulty,
          result: isWin ? "WIN" : "LOSE",
        });
      }

      records.push({
        userId: user.id,
        date: fromDateOnly(date),
        result: judgeDailyResult({ totalCount, winCount }),
        totalCount,
        winCount,
        settledAt: fromDateOnly(date),
      });
    }

    await tx.dailyMission.createMany({ data: rows });
    await tx.dailyRecord.createMany({ data: records });

    console.log(`사용자 1명 · 카테고리 ${categories.length}개 · 미션 ${created.length}개`);
    console.log(`과거 기록 ${records.length}일 · 미션 결과 ${rows.length}건`);
  });
}

/** FNV-1a. 같은 입력이면 항상 같은 값이 나온다. */
function hashToUnit(seed: string): number {
  let hash = 2166136261;

  for (let index = 0; index < seed.length; index += 1) {
    hash = Math.imul(hash ^ seed.charCodeAt(index), 16777619);
  }

  return (hash >>> 0) / 4294967296;
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
