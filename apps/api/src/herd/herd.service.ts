import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { ParameterService } from '../parameter/parameter.service';
import { CreateHerdDto } from '@shared/index';

@Injectable()
export class HerdService {
  constructor(
    private prisma: PrismaService,
    private parameterService: ParameterService
  ) {}

  /**
   * Crear lote
   */
  async create(dto: CreateHerdDto, userId: string) {
    await this.verifyFarmAccess(dto.farmId, userId);

    return this.prisma.herd.create({
      data: {
        ...dto,
        createdBy: userId,
        updatedBy: userId,
      },
    });
  }

  /**
   * Obtener lotes de finca
   */
  async findByFarm(farmId: string, userId: string) {
    await this.verifyFarmAccess(farmId, userId);

    return this.prisma.herd.findMany({
      where: {
        farmId,
        deletedAt: null,
      },
      include: {
        animals: {
          where: { deletedAt: null },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Obtener lote por ID
   */
  async findOne(id: string, userId: string) {
    const herd = await this.prisma.herd.findUniqueOrThrow({
      where: { id },
      include: {
        animals: {
          where: { deletedAt: null },
        },
        movements: {
          where: {
            status: 'ACTIVE',
          },
          include: {
            paddock: true,
          },
          take: 1,
        },
      },
    });

    await this.verifyFarmAccess(herd.farmId, userId);
    
    // Transformar para que el frontend reciba activeMovement (singular)
    const { movements, ...herdData } = herd;
    return {
      ...herdData,
      activeMovement: movements[0] || null,
    };
  }

  /**
   * Actualizar lote
   */
  async update(id: string, dto: Partial<CreateHerdDto>, userId: string) {
    const herd = await this.findOne(id, userId);
    await this.verifyFarmAccess(herd.farmId, userId);

    return this.prisma.herd.update({
      where: { id },
      data: {
        ...dto,
        updatedBy: userId,
      },
    });
  }

  /**
   * Eliminar lote
   */
  async remove(id: string, userId: string) {
    const herd = await this.findOne(id, userId);
    await this.verifyFarmAccess(herd.farmId, userId);

    return this.prisma.herd.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  /**
   * Calcular Unidades Animales (UA) en base a peso
   * UA = peso / ua_weight_kg (por defecto 450kg)
   */
  calculateUA(weightKg: number, uaWeightKg: number = 450): number {
    if (weightKg <= 0 || uaWeightKg <= 0) {
      return 0;
    }
    return weightKg / uaWeightKg;
  }

  /**
   * Actualizar UA actual del lote en base a último pesaje
   * Se llama después de registrar un pesaje
   */
  async updateCurrentUA(herdId: string, userId: string): Promise<number | null> {
    const herd = await this.findOne(herdId, userId);

    // Obtener último pesaje del lote
    const lastWeighing = await this.prisma.weighing.findFirst({
      where: {
        herdId,
      },
      orderBy: { recordedAt: 'desc' },
      select: { weight: true },
    });

    if (!lastWeighing) {
      // Sin pesajes, limpiar currentUA
      await this.prisma.herd.update({
        where: { id: herdId },
        data: { currentUA: null },
      });
      return null;
    }

    // Obtener ua_weight_kg de parámetros
    const uaWeightKg = await this.parameterService.getParameterAsNumber(
      herd.farmId,
      'ua_weight_kg',
      450
    );

    const currentUA = this.calculateUA(lastWeighing.weight, uaWeightKg);

    await this.prisma.herd.update({
      where: { id: herdId },
      data: { currentUA },
    });

    return currentUA;
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
