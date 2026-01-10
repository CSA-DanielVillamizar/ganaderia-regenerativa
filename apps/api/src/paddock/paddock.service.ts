import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreatePaddockDto } from '@shared/index';

@Injectable()
export class PaddockService {
  constructor(private prisma: PrismaService) {}

  /**
   * Crear potrero
   */
  async create(dto: CreatePaddockDto, userId: string) {
    // Verificar acceso a finca
    await this.verifyFarmAccess(dto.farmId, userId);

    return this.prisma.paddock.create({
      data: {
        ...dto,
        createdBy: userId,
        updatedBy: userId,
      },
    });
  }

  /**
   * Obtener potreros de finca
   */
  async findByFarm(farmId: string, userId: string) {
    await this.verifyFarmAccess(farmId, userId);

    return this.prisma.paddock.findMany({
      where: {
        farmId,
        deletedAt: null,
      },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Obtener potrero por ID
   */
  async findOne(id: string, userId: string) {
    const paddock = await this.prisma.paddock.findUniqueOrThrow({
      where: { id },
    });

    await this.verifyFarmAccess(paddock.farmId, userId);
    return paddock;
  }

  /**
   * Actualizar potrero
   */
  async update(id: string, dto: Partial<CreatePaddockDto>, userId: string) {
    const paddock = await this.findOne(id, userId);
    await this.verifyFarmAccess(paddock.farmId, userId);

    return this.prisma.paddock.update({
      where: { id },
      data: {
        ...dto,
        updatedBy: userId,
      },
    });
  }

  /**
   * Eliminar potrero
   */
  async remove(id: string, userId: string) {
    const paddock = await this.findOne(id, userId);
    await this.verifyFarmAccess(paddock.farmId, userId);

    return this.prisma.paddock.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  /**
   * Obtener carga animal del potrero
   * Retorna: {ua: número de UA, uaPerHectare: UA/hectárea}
   */
  async getStockingRate(id: string, userId: string) {
    const paddock = await this.findOne(id, userId);
    await this.verifyFarmAccess(paddock.farmId, userId);

    // Obtener movimiento activo del potrero
    const activeMovement = await this.prisma.movement.findFirst({
      where: {
        paddockId: id,
        status: 'ACTIVE',
      },
      include: {
        herd: true,
      },
    });

    if (!activeMovement || !activeMovement.herd.currentUA) {
      return {
        ua: 0,
        uaPerHectare: 0,
        herdName: null,
        startDate: null,
      };
    }

    const ua = activeMovement.herd.currentUA;
    const hectares = paddock.hectares || 1;
    const uaPerHectare = ua / hectares;

    return {
      ua,
      uaPerHectare,
      herdName: activeMovement.herd.name,
      startDate: activeMovement.entryDate,
    };
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
