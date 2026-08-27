import { Inject, Injectable, NotFoundException, Scope, UnauthorizedException } from "@nestjs/common";
import { REQUEST } from "@nestjs/core";
import type { AuthenticatedRequest } from "@/modules/auth/jwtAuth.guard";
import { PrismaService } from "@/prisma/prisma.service";

/**
 * 요청을 보낸 사용자.
 *
 * `JwtAuthGuard` 가 검증한 뒤 `request.userId` 에 넣어둔 값을 읽는다.
 * 서비스들이 이 한 곳만 보게 해서, 인증 방식이 바뀌어도 나머지가 안 흔들린다.
 */
@Injectable({ scope: Scope.REQUEST })
export class CurrentUserService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(REQUEST) private readonly request: AuthenticatedRequest,
  ) {}

  getUserId(): Promise<string> {
    const userId = this.request.userId;

    if (!userId) {
      throw new UnauthorizedException({ code: "UNAUTHORIZED", message: "인증이 필요합니다." });
    }

    return Promise.resolve(userId);
  }

  async getUser() {
    const id = await this.getUserId();
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) throw new NotFoundException("사용자를 찾을 수 없습니다.");

    return user;
  }
}
