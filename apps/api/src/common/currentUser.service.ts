import { Inject, Injectable, Scope, UnauthorizedException } from "@nestjs/common";
import { REQUEST } from "@nestjs/core";
import type { User } from "@prisma/client";
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
  /**
   * 한 요청 안에서는 사용자가 바뀌지 않는다. 요청 스코프라 요청이 끝나면 같이 사라진다.
   * 이게 없으면 `getUserId()` 를 부르는 곳마다 같은 행을 다시 읽는다.
   */
  private cached: User | null = null;

  constructor(
    private readonly prisma: PrismaService,
    @Inject(REQUEST) private readonly request: AuthenticatedRequest,
  ) {}

  async getUserId(): Promise<string> {
    return (await this.getUser()).id;
  }

  /**
   * 토큰이 가리키는 사용자를 읽는다. 탈퇴했으면 없는 것으로 친다.
   *
   * 탈퇴는 행을 지우지 않고 `deletedAt` 만 남기므로, 여기서 걸러내지 않으면
   * 탈퇴 직후 아직 만료되지 않은 액세스 토큰으로 서비스를 계속 쓸 수 있다.
   * refresh 는 탈퇴 시점에 전부 폐기하니 이 구멍만 막으면 세션이 완전히 끊긴다.
   */
  async getUser(): Promise<User> {
    if (this.cached) return this.cached;

    const id = this.request.userId;

    if (!id) {
      throw new UnauthorizedException({ code: "UNAUTHORIZED", message: "인증이 필요합니다." });
    }

    const user = await this.prisma.user.findFirst({ where: { id, deletedAt: null } });

    if (!user) {
      throw new UnauthorizedException({
        code: "UNAUTHORIZED",
        message: "인증이 필요합니다.",
      });
    }

    this.cached = user;

    return user;
  }
}
