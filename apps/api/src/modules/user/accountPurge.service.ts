import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { ACCOUNT_RETENTION_DAYS, purgeCutoff } from "@nadaena/core";
import { PrismaService } from "@/prisma/prisma.service";

/**
 * 탈퇴한 계정을 실제로 지운다.
 *
 * 탈퇴는 `deletedAt` 만 남기고 데이터를 두므로, 지우는 사람이 따로 있어야 한다.
 * 이게 돌지 않으면 "○일 뒤 삭제한다"는 고지가 지켜지지 않는다.
 *
 * 자식 행(미션·일별기록·일별미션·소셜연결·리프레시토큰)은 DB 의 FK Cascade 로
 * 함께 지워진다. 여기서 순서를 맞춰 지울 필요가 없다.
 *
 * 새벽 4시에 도는 이유는 특별하지 않다. 사람이 가장 적게 쓰는 시간이면 된다.
 */
@Injectable()
export class AccountPurgeService {
  private readonly logger = new Logger(AccountPurgeService.name);

  constructor(private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_DAY_AT_4AM)
  async purgeWithdrawnAccounts(at: Date = new Date()): Promise<{ purged: number }> {
    const { count } = await this.prisma.user.deleteMany({
      where: {
        deletedAt: { lt: purgeCutoff(at) },
        // 둘러보기 계정은 탈퇴할 수 없지만, 실수로 표시돼도 지워지지 않게 한 겹 더 둔다.
        isDemo: false,
      },
    });

    if (count > 0) {
      this.logger.log(`탈퇴 ${ACCOUNT_RETENTION_DAYS}일 경과 계정 삭제: ${count}명`);
    }

    return { purged: count };
  }
}
