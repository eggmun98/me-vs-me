import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { calculateRate, isWinConfirmed } from "@nadaena/core";
import { CurrentUserService } from "@/common/currentUser.service";
import { fromDateOnly, toDateOnly } from "@/common/dateOnly";
import { DailyService } from "@/modules/daily/daily.service";
import { RecordService } from "@/modules/record/record.service";
import { PrismaService } from "@/prisma/prisma.service";

const EDITABLE_DAYS = 7;

@Injectable()
export class TodayService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly currentUser: CurrentUserService,
    private readonly daily: DailyService,
    private readonly record: RecordService,
  ) {}

  /** 파라미터가 없다. 오늘이 언제인지는 서버가 정한다. (07-api.md 4장) */
  async getToday() {
    const user = await this.currentUser.getUser();
    const today = this.daily.resolveToday(user.timezone);

    await this.daily.ensureDailyMissions(user.id, today);
    await this.daily.recalculateDailyRecord(user.id, today, false);

    const [record, missions, summary, editableDates] = await Promise.all([
      this.prisma.dailyRecord.findUnique({
        where: { userId_date: { userId: user.id, date: fromDateOnly(today) } },
      }),
      this.prisma.dailyMission.findMany({
        where: { userId: user.id, date: fromDateOnly(today) },
        orderBy: { createdAt: "asc" },
      }),
      this.record.getSummary(user.id, today),
      this.findEditableDates(user.id, today),
    ]);

    const tally = {
      totalCount: record?.totalCount ?? 0,
      winCount: record?.winCount ?? 0,
    };

    return {
      date: today,
      result: record?.result ?? "REST",
      ...tally,
      rate: calculateRate(tally),
      isWinConfirmed: isWinConfirmed(tally),
      missions: missions.map((mission) => ({
        id: mission.id,
        missionId: mission.missionId,
        name: mission.name,
        categoryName: mission.categoryName,
        targetAmount: mission.targetAmount,
        unit: mission.unit,
        result: mission.result,
      })),
      reflection: record?.reflection ?? null,
      editableDates,
      summary,
    };
  }

  /**
   * 응답에 재계산 결과를 함께 담는다.
   * 없으면 클라이언트가 GET /today 를 다시 부르고, 그 사이 화면 숫자가 어긋난다. (07-api.md 4장)
   */
  async updateMissionResult(dailyMissionId: string, result: "WIN" | "PENDING") {
    const user = await this.currentUser.getUser();
    const dailyMission = await this.prisma.dailyMission.findFirst({
      where: { id: dailyMissionId, userId: user.id },
    });

    if (!dailyMission) throw new NotFoundException("그날의 미션을 찾을 수 없습니다.");

    const date = toDateOnly(dailyMission.date);
    const today = this.daily.resolveToday(user.timezone);
    this.assertEditable(date, today);

    await this.prisma.dailyMission.update({
      where: { id: dailyMissionId },
      data: { result, completedAt: result === "WIN" ? new Date() : null },
    });

    await this.daily.recalculateDailyRecord(user.id, date, date < today);

    const record = await this.prisma.dailyRecord.findUniqueOrThrow({
      where: { userId_date: { userId: user.id, date: dailyMission.date } },
    });
    const tally = { totalCount: record.totalCount, winCount: record.winCount };

    return {
      dailyMission: { id: dailyMissionId, result, date },
      daily: {
        date,
        result: record.result,
        ...tally,
        rate: calculateRate(tally),
        isWinConfirmed: isWinConfirmed(tally),
      },
      summary: await this.record.getSummary(user.id, today),
    };
  }

  async updateReflection(date: string, reflection: string) {
    const user = await this.currentUser.getUser();
    const today = this.daily.resolveToday(user.timezone);
    this.assertEditable(date, today);

    await this.prisma.dailyRecord.update({
      where: { userId_date: { userId: user.id, date: fromDateOnly(date) } },
      data: { reflection },
    });

    return { date, reflection };
  }

  /** 7일이 지난 기록은 고칠 수 없다. (01-service-plan.md 6.7) */
  private assertEditable(date: string, today: string): void {
    const elapsed = countDaysBetween(date, today);

    if (elapsed > EDITABLE_DAYS) {
      throw new ConflictException({
        code: "RECORD_LOCKED",
        message: "7일이 지난 기록은 수정할 수 없습니다.",
      });
    }
  }

  /** 최근 7일 중 패배가 남아 있고 아직 고칠 수 있는 날 (05-screens.md 4.6) */
  private async findEditableDates(userId: string, today: string) {
    const from = shiftDate(today, -(EDITABLE_DAYS - 1));
    const records = await this.prisma.dailyRecord.findMany({
      where: {
        userId,
        date: { gte: fromDateOnly(from), lt: fromDateOnly(today) },
        result: { in: ["LOSE", "DRAW", "WIN"] },
      },
      orderBy: { date: "desc" },
    });

    return records
      .filter((record) => record.totalCount > record.winCount)
      .map((record) => ({
        date: toDateOnly(record.date),
        loseCount: record.totalCount - record.winCount,
        editableUntil: shiftDate(toDateOnly(record.date), EDITABLE_DAYS),
      }));
  }
}

function countDaysBetween(from: string, to: string): number {
  return Math.round(
    (new Date(`${to}T00:00:00Z`).getTime() - new Date(`${from}T00:00:00Z`).getTime()) /
      86_400_000,
  );
}

function shiftDate(isoDate: string, days: number): string {
  const shifted = new Date(`${isoDate}T00:00:00Z`);
  shifted.setUTCDate(shifted.getUTCDate() + days);

  return shifted.toISOString().slice(0, 10);
}
