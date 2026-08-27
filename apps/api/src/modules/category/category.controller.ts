import { Controller, Get } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { CurrentUserService } from "@/common/currentUser.service";
import { PrismaService } from "@/prisma/prisma.service";

@ApiTags("categories")
@Controller("categories")
export class CategoryController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly currentUser: CurrentUserService,
  ) {}

  @Get()
  @ApiOperation({ summary: "카테고리 — 시스템 기본 + 사용자 생성" })
  async findAll() {
    const userId = await this.currentUser.getUserId();

    return this.prisma.category.findMany({
      where: { OR: [{ userId: null }, { userId }] },
      orderBy: [{ order: "asc" }, { name: "asc" }],
      select: { id: true, name: true },
    });
  }
}
