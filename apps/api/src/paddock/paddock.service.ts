import { Injectable, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreatePaddockDto, RecommendedDaysResponse } from '@shared/index';

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

  /**
   * P0.4 - DÍAS RECOMENDADOS
   * Calcula cuántos días puede pastar el hato en el potrero
   * basado en forraje disponible y consumo diario
   * 
   * Formula: recommendedDays = totalAvailableKgMS / (totalHerdWeightKg × intakePercent)
   * 
   * @param paddockId - UUID del potrero
   * @param userId - UUID del usuario (para verificar acceso)
   * @param intakePercent - % consumo diario (default 2.0%)
   * @returns RecommendedDaysResponse con cálculos y consejo
   * @throws BadRequestException si no hay aforos o hato activo
   */
  async getRecommendedDays(
    paddockId: string,
    userId: string,
    intakePercent: number = 2.0
  ): Promise<RecommendedDaysResponse> {
    // 1. Verificar potrero y acceso
    const paddock = await this.prisma.paddock.findUnique({
      where: { id: paddockId },
      include: { farm: true },
    });

    if (!paddock) {
      throw new NotFoundException(`Potrero ${paddockId} no encontrado`);
    }

    await this.verifyFarmAccess(paddock.farmId, userId);

    // 2. Obtener último aforo del potrero
    const latestSample = await this.prisma.forageSample.findFirst({
      where: { paddockId },
      orderBy: { sampleDate: 'desc' },
    });

    if (!latestSample || latestSample.availableForageKgMS === null) {
      throw new BadRequestException(
        `No hay aforos registrados para el potrero ${paddock.name}. Registre un aforo primero.`
      );
    }

    // 3. Obtener movimiento activo del potrero para saber qué hato está pastando
    const activeMovement = await this.prisma.movement.findFirst({
      where: {
        paddockId,
        status: 'ACTIVE',
      },
      include: {
        herd: true,
      },
    });

    if (!activeMovement) {
      throw new BadRequestException(
        `No hay un hato activo en el potrero ${paddock.name}. Cree un movimiento primero.`
      );
    }

    // 4. Obtener peso total del hato
    const totalHerdWeightKg = activeMovement.herd.currentWeight || activeMovement.herd.initialWeight;

    if (!totalHerdWeightKg || totalHerdWeightKg <= 0) {
      throw new BadRequestException(
        `El hato ${activeMovement.herd.name} no tiene peso registrado. Registre un pesaje primero.`
      );
    }

    // 5. Calcular totales
    const availableForageKgMS = latestSample.availableForageKgMS;
    const totalAvailableKgMS = availableForageKgMS * paddock.hectares;

    // Consumo diario = peso total × % consumo diario
    const dailyConsumptionKgMS = totalHerdWeightKg * (intakePercent / 100);

    // Días recomendados = forraje disponible / consumo diario
    const recommendedDays = dailyConsumptionKgMS > 0 
      ? totalAvailableKgMS / dailyConsumptionKgMS 
      : 0;

    // 6. Generar consejo textual
    let rotationAdvice: string;
    if (recommendedDays <= 0) {
      rotationAdvice = 'No hay forraje disponible. Rote inmediatamente.';
    } else if (recommendedDays < 3) {
      rotationAdvice = `Potrero cerca del límite. Planificar rotación en ${Math.floor(recommendedDays)} días.`;
    } else if (recommendedDays >= 3 && recommendedDays < 7) {
      rotationAdvice = `Puede permanecer ${Math.floor(recommendedDays)} días. Monitorear consumo.`;
    } else {
      rotationAdvice = `Buena disponibilidad. Puede permanecer hasta ${Math.floor(recommendedDays)} días.`;
    }

    return {
      paddockId: paddock.id,
      paddockName: paddock.name,
      paddockHectares: paddock.hectares,
      availableForageKgMS,
      totalAvailableKgMS,
      totalHerdWeightKg,
      intakePercentDaily: intakePercent,
      dailyConsumptionKgMS,
      recommendedDays: Math.round(recommendedDays * 10) / 10, // 1 decimal
      rotationAdvice,
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
