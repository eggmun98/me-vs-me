import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { Request } from "express";
import { IS_PUBLIC_KEY } from "@/common/publicRoute.decorator";
import { TokenService } from "./token.service";

export type AuthenticatedRequest = Request & { userId?: string };

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly tokens: TokenService,
    private readonly reflector: Reflector,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = readBearerToken(request);

    if (!token) {
      throw new UnauthorizedException({ code: "UNAUTHORIZED", message: "인증이 필요합니다." });
    }

    request.userId = this.tokens.verifyAccessToken(token).userId;

    return true;
  }
}

function readBearerToken(request: Request): string | null {
  const header = request.headers.authorization;
  if (!header?.startsWith("Bearer ")) return null;

  return header.slice("Bearer ".length).trim() || null;
}
