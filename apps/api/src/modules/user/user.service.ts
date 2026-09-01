import { ConflictException, ForbiddenException, Injectable } from "@nestjs/common";
import { ACCOUNT_RETENTION_DAYS, purgeAfter } from "@nadaena/core";
import { CurrentUserService } from "@/common/currentUser.service";
import { DailyService } from "@/modules/daily/daily.service";
import { payloadToColumns } from "@/modules/mission/repeatMapping";
import { RecordService } from "@/modules/record/record.service";
import { PrismaService } from "@/prisma/prisma.service";
import type { OnboardingDto } from "./dto/onboarding.dto";

const NICKNAME_SEEDS = {
  adjectives: ["꾸준한", "묵묵한", "단단한", "성실한", "차분한", "끈질긴", "당당한"],
  nouns: ["도전자", "러너", "기록자", "승부사", "수련생", "탐험가"],
} as const;

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly currentUser: CurrentUserService,
    private readonly daily: DailyService,
    private readonly record: RecordService,
  ) {}

  async getMe() {
    const user = await this.currentUser.getUser();
    const today = this.daily.resolveToday(user.timezone);

    const [summary, missionCount] = await Promise.all([
      this.record.getSummary(user.id, today),
      this.prisma.mission.count({ where: { userId: user.id, deletedAt: null } }),
    ]);

    return {
      id: user.id,
      nickname: user.nickname,
      imageUrl: user.imageUrl,
      bio: user.bio,
      timezone: user.timezone,
      isOnboarded: user.onboardedAt !== null,
      missionCount,
      summary,
    };
  }

  /**
   * 닉네임·타임존·첫 미션을 한 트랜잭션으로 처리한다.
   * 중간에 끊겨 미션만 있고 닉네임이 없는 상태가 생기지 않게 한다. (07-api.md 7장)
   */
  async completeOnboarding(dto: OnboardingDto) {
    const userId = await this.currentUser.getUserId();

    await this.assertNicknameAvailable(dto.nickname, userId);

    await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: {
          nickname: dto.nickname,
          timezone: dto.timezone,
          bio: dto.bio ?? null,
          onboardedAt: new Date(),
        },
      });

      for (const mission of dto.missions) {
        await tx.mission.create({
          data: {
            userId,
            categoryId: mission.categoryId,
            name: mission.name,
            targetAmount: mission.targetAmount,
            unit: mission.unit,
            difficulty: mission.difficulty,
            ...payloadToColumns(mission.repeat),
          },
        });
      }
    });

    return this.getMe();
  }

  async updateMe(patch: { nickname?: string; bio?: string; timezone?: string }) {
    const userId = await this.currentUser.getUserId();

    if (patch.nickname) await this.assertNicknameAvailable(patch.nickname, userId);

    await this.prisma.user.update({ where: { id: userId }, data: patch });

    return this.getMe();
  }

  /**
   * 회원탈퇴.
   *
   * 행을 지우지 않고 `deletedAt` 만 남긴다. 기록은 그대로 두되 아무도 읽지 못하게 잠근다.
   * 실제 삭제는 유예기간이 지난 뒤 `AccountPurgeService` 가 한다 — 잘못 눌렀을 때
   * 되돌릴 길을 남기기 위해서다. 유예기간 안에 다시 로그인하면 계정이 되살아난다.
   *
   * 리프레시 토큰은 여기서 전부 폐기한다. 남겨두면 탈퇴한 계정으로 세션이 계속 살아난다.
   */
  async deleteMe(): Promise<{ deletedAt: string; purgeAt: string; retentionDays: number }> {
    const user = await this.currentUser.getUser();

    // 둘러보기가 이 계정을 읽는다. 지워지면 로그인 전 화면이 통째로 빈다.
    if (user.isDemo) {
      throw new ForbiddenException({
        code: "DEMO_ACCOUNT",
        message: "둘러보기 계정은 탈퇴할 수 없습니다.",
      });
    }

    const deletedAt = new Date();

    await this.prisma.$transaction([
      this.prisma.user.update({ where: { id: user.id }, data: { deletedAt } }),
      this.prisma.refreshToken.updateMany({
        where: { userId: user.id, revokedAt: null },
        data: { revokedAt: deletedAt },
      }),
    ]);

    return {
      deletedAt: deletedAt.toISOString(),
      purgeAt: purgeAfter(deletedAt).toISOString(),
      retentionDays: ACCOUNT_RETENTION_DAYS,
    };
  }

  async isNicknameAvailable(nickname: string): Promise<{ available: boolean }> {
    const taken = await this.prisma.user.findUnique({
      where: { nickname },
      select: { id: true },
    });

    return { available: !taken };
  }

  /** 닉네임을 짓기 어려워 이탈하지 않게 기본값을 준다. */
  async suggestNickname(): Promise<{ nickname: string }> {
    for (let attempt = 0; attempt < 20; attempt += 1) {
      const candidate = `${pick(NICKNAME_SEEDS.adjectives)} ${pick(NICKNAME_SEEDS.nouns)}${randomSuffix()}`;
      const { available } = await this.isNicknameAvailable(candidate);

      if (available) return { nickname: candidate };
    }

    return { nickname: `도전자${Date.now().toString(36)}` };
  }

  private async assertNicknameAvailable(nickname: string, userId: string): Promise<void> {
    const taken = await this.prisma.user.findUnique({
      where: { nickname },
      select: { id: true },
    });

    if (taken && taken.id !== userId) {
      throw new ConflictException({
        code: "NICKNAME_TAKEN",
        message: "이미 사용 중인 닉네임입니다.",
      });
    }
  }
}

function pick<T>(values: readonly T[]): T {
  return values[Math.floor(Math.random() * values.length)] as T;
}

function randomSuffix(): string {
  return String(Math.floor(Math.random() * 900) + 100);
}
