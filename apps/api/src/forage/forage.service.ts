import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateForageSampleDto } from '@shared/index';

@Injectable()
export class ForageService {
  constructor(private prisma: PrismaService) {}

  /**
   * Registrar aforo
   */
  async create(dto: CreateForageSampleDto, userId: string) {
    const paddock = await this.prisma.paddock.findUniqueOrThrow({
      where: { id: dto.paddockId },
    });

    await this.verifyFarmAccess(paddock.farmId, userId);

    // Calcular kgMS/ha si se proporcionan datos guiados
    let kgMSPerHa: number | null = dto.kgMSPerHa ?? null;
    if (
      kgMSPerHa == null &&
      dto.frameAreaM2 &&
      dto.freshWeightKg &&
      dto.dryMatterPercent != null &&
      dto.utilizationPercent != null
    ) {
      const dryKg = dto.freshWeightKg * (dto.dryMatterPercent / 100);
      const dryKgPerM2 = dryKg / dto.frameAreaM2;
      const dryKgPerHa = dryKgPerM2 * 10000;
      kgMSPerHa = Math.round(dryKgPerHa * (dto.utilizationPercent / 100));
    }

    return this.prisma.forageSample.create({
      data: {
        paddockId: dto.paddockId,
        kgPerHectare: dto.kgPerHectare,
        dryMatter: dto.dryMatter,
        sampleDate: new Date(dto.sampleDate),
        notes: dto.notes,
        createdBy: userId,
      },
    });
  }

  /**
   * Obtener aforos de potrero
   */
  async findByPaddock(paddockId: string, userId: string) {
    const paddock = await this.prisma.paddock.findUniqueOrThrow({
      where: { id: paddockId },
    });

    await this.verifyFarmAccess(paddock.farmId, userId);

    return this.prisma.forageSample.findMany({
      where: { paddockId },
      orderBy: { sampleDate: 'desc' },
    });
  }

  /**
   * Obtener aforos recientes de finca
   */
  async findRecentByFarm(farmId: string, userId: string, days = 30) {
    await this.verifyFarmAccess(farmId, userId);

    const since = new Date();
    since.setDate(since.getDate() - days);

    return this.prisma.forageSample.findMany({
      where: {
        paddock: {
          farmId,
        },
        sampleDate: {
          gte: since,
        },
      },
      include: {
        paddock: true,
      },
      orderBy: { sampleDate: 'desc' },
    });
  }

  private async verifyFarmAccess(farmId: string, userId: string) {
    const userFarm = await this.prisma.userFarm.findUnique({
      where: { userId_farmId: { userId, farmId } },
    });

    if (!userFarm) {
      throw new ForbiddenException('No tienes acceso a esta finca');
    }
  }
}
