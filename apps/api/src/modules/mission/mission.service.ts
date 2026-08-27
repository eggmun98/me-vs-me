import { Injectable, NotFoundException } from "@nestjs/common";
import type { RepeatPayload } from "@nadaena/core";
import type { Mission } from "@prisma/client";
import { CurrentUserService } from "@/common/currentUser.service";
import { toDateOnly } from "@/common/dateOnly";
import { PrismaService } from "@/prisma/prisma.service";
import type { CreateMissionDto } from "./dto/createMission.dto";
import type { UpdateMissionDto } from "./dto/updateMission.dto";
import { columnsToPayload, payloadToColumns } from "./repeatMapping";

export type MissionResponse = {
  id: string;
  name: string;
  categoryId: string | null;
  categoryName: string | null;
  targetAmount: number | null;
  unit: string | null;
  difficulty: Mission["difficulty"];
  repeat: RepeatPayload;
  isActive: boolean;
};

type MissionWithCategory = Mission & { category: { name: string } | null };

@Injectable()
export class MissionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly currentUser: CurrentUserService,
  ) {}

  async findAll(): Promise<{ active: MissionResponse[]; inactive: MissionResponse[] }> {
    const userId = await this.currentUser.getUserId();
    const missions = await this.prisma.mission.findMany({
      where: { userId, deletedAt: null },
      include: { category: { select: { name: true } } },
      orderBy: { createdAt: "asc" },
    });

    const mapped = missions.map(toResponse);

    return {
      active: mapped.filter((mission) => mission.isActive),
      inactive: mapped.filter((mission) => !mission.isActive),
    };
  }

  async create(dto: CreateMissionDto): Promise<MissionResponse> {
    const userId = await this.currentUser.getUserId();
    const mission = await this.prisma.mission.create({
      data: {
        userId,
        categoryId: dto.categoryId,
        name: dto.name,
        targetAmount: dto.targetAmount,
        unit: dto.unit,
        difficulty: dto.difficulty,
        ...payloadToColumns(dto.repeat),
      },
      include: { category: { select: { name: true } } },
    });

    return toResponse(mission);
  }

  async update(id: string, dto: UpdateMissionDto): Promise<MissionResponse> {
    await this.assertOwned(id);

    const mission = await this.prisma.mission.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.categoryId !== undefined && { categoryId: dto.categoryId }),
        ...(dto.targetAmount !== undefined && { targetAmount: dto.targetAmount }),
        ...(dto.unit !== undefined && { unit: dto.unit }),
        ...(dto.difficulty !== undefined && { difficulty: dto.difficulty }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
        ...(dto.repeat !== undefined && payloadToColumns(dto.repeat)),
      },
      include: { category: { select: { name: true } } },
    });

    return toResponse(mission);
  }

  /**
   * soft delete 한다.
   *
   * 과거 기록과 미션별 통계가 살아 있어야 하고(06-database.md 1.2),
   * 오늘 승부에는 이미 포함돼 있어 내일부터 빠진다. (01-service-plan.md 6.5)
   */
  async remove(id: string): Promise<{ appliedFrom: string }> {
    await this.assertOwned(id);
    await this.prisma.mission.update({ where: { id }, data: { deletedAt: new Date() } });

    const user = await this.currentUser.getUser();

    return { appliedFrom: toDateOnly(nextDayIn(user.timezone)) };
  }

  private async assertOwned(id: string): Promise<void> {
    const userId = await this.currentUser.getUserId();
    const found = await this.prisma.mission.findFirst({
      where: { id, userId, deletedAt: null },
      select: { id: true },
    });

    if (!found) throw new NotFoundException("미션을 찾을 수 없습니다.");
  }
}

function toResponse(mission: MissionWithCategory): MissionResponse {
  return {
    id: mission.id,
    name: mission.name,
    categoryId: mission.categoryId,
    categoryName: mission.category?.name ?? null,
    targetAmount: mission.targetAmount,
    unit: mission.unit,
    difficulty: mission.difficulty,
    repeat: columnsToPayload(mission),
    isActive: mission.isActive,
  };
}

function nextDayIn(timeZone: string): Date {
  const now = new Date();
  const local = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);

  const tomorrow = new Date(`${local}T00:00:00.000Z`);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);

  return tomorrow;
}
