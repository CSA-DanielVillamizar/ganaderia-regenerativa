import { Injectable, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { ParameterService } from '../parameter/parameter.service';
import { CreateWeighingDto, WeighingHistoryResponse } from '@shared/index';

@Injectable()
export class WeighingService {
  constructor(
    private prisma: PrismaService,
    private parameterService: ParameterService,
  ) {}

  /**
   * P0.6 - Registrar pesaje
   * Al crear pesaje:
   * 1. Actualizar herd.currentWeight (promedio por animal)
   * 2. Recalcular herd.currentUA usando parámetro ua_weight_kg
   */
  async create(dto: CreateWeighingDto, userId: string) {
    const herd = await this.prisma.herd.findUniqueOrThrow({
      where: { id: dto.herdId },
      include: { farm: true },
    });

    await this.verifyFarmAccess(herd.farmId, userId);

    // Determinar método y calcular estimado si aplica
    const method = dto.method ?? 'SCALE';
    let weightToStore = dto.weight;
    let estimatedWeightKg: number | null = dto.estimatedWeightKg ?? null;
    let realWeightKg: number | null = dto.realWeightKg ?? null;

    if (method === 'TAPE') {
      if (dto.chestGirthCm && dto.bodyLengthCm) {
        estimatedWeightKg = this.estimateWeightByTape(dto.chestGirthCm, dto.bodyLengthCm);
        weightToStore = estimatedWeightKg;
      } else if (!estimatedWeightKg) {
        throw new BadRequestException('Para método TAPE se requiere perímetro torácico y longitud corporal o un peso estimado');
      }
    } else {
      // SCALE
      realWeightKg = dto.realWeightKg ?? dto.weight;
      weightToStore = realWeightKg;
    }

    // Calcular margen de error si ambos están disponibles
    if (estimatedWeightKg != null && realWeightKg != null && realWeightKg > 0) {
      const _errorMarginPercent = Math.abs(realWeightKg - estimatedWeightKg) / realWeightKg * 100;
    }

    // 1. Actualizar peso actual del lote (promedio por animal)
    const averagePerAnimal = weightToStore / dto.animalCount;

    // 2. Recalcular UA usando parámetro ua_weight_kg (default 450 kg)
    const uaWeightKg = await this.parameterService.getParameter(herd.farmId, 'ua_weight_kg', '450');
    const uaWeightValue = parseFloat(uaWeightKg) || 450;
    const totalWeight = averagePerAnimal * herd.animalCount;
    const currentUA = totalWeight / uaWeightValue;

    await this.prisma.herd.update({
      where: { id: dto.herdId },
      data: {
        currentWeight: averagePerAnimal,
        currentUA: currentUA,
      },
    });

    return this.prisma.weighing.create({
      data: {
        herdId: dto.herdId,
        animalId: null,
        weight: weightToStore,
        animalCount: dto.animalCount,
        notes: dto.notes,
        recordedAt: new Date(),
        createdBy: userId,
        method: method,
      },
    });
  }

  /**
   * Obtener pesajes de lote
   */
  async findByHerd(herdId: string, userId: string) {
    const herd = await this.prisma.herd.findUniqueOrThrow({
      where: { id: herdId },
    });

    await this.verifyFarmAccess(herd.farmId, userId);

    return this.prisma.weighing.findMany({
      where: { herdId },
      orderBy: { recordedAt: 'desc' },
    });
  }

  /**
   * P0.6 - Obtener historial de pesajes con paginación y filtros
   * Query params: page, limit, from, to
   */
  async getHistory(
    herdId: string,
    userId: string,
    options?: {
      page?: number;
      limit?: number;
      from?: string;
      to?: string;
    },
  ): Promise<WeighingHistoryResponse> {
    const herd = await this.prisma.herd.findUniqueOrThrow({
      where: { id: herdId },
      select: {
        id: true,
        name: true,
        farmId: true,
        currentWeight: true,
        currentUA: true,
        animalCount: true,
      },
    });

    await this.verifyFarmAccess(herd.farmId, userId);

    // Paginación (default page=1, limit=50)
    const page = options?.page ?? 1;
    const limit = options?.limit ?? 50;
    const skip = (page - 1) * limit;

    // Filtros de fecha
    const dateFilter: any = {};
    if (options?.from) {
      dateFilter.gte = new Date(options.from);
    }
    if (options?.to) {
      dateFilter.lte = new Date(options.to);
    }

    const whereClause: any = { herdId };
    if (Object.keys(dateFilter).length > 0) {
      whereClause.recordedAt = dateFilter;
    }

    // Contar total (sin paginación)
    const totalCount = await this.prisma.weighing.count({
      where: whereClause,
    });

    // Obtener pesajes con paginación
    const weighings = await this.prisma.weighing.findMany({
      where: whereClause,
      orderBy: { recordedAt: 'desc' },
      skip: skip,
      take: limit,
    });

    // Obtener parámetro ua_weight_kg para calcular UA
    const uaWeightKg = await this.parameterService.getParameter(herd.farmId, 'ua_weight_kg', '450');
    const uaWeightValue = parseFloat(uaWeightKg) || 450;

    // Mapear a WeighingHistoryItem
    const weighingItems = weighings.map((w) => {
      const avgWeightPerAnimal = w.weight / w.animalCount;
      const totalHerdWeight = avgWeightPerAnimal * herd.animalCount;
      const uaValue = totalHerdWeight / uaWeightValue;

      return {
        id: w.id,
        weight: w.weight,
        animalCount: w.animalCount,
        avgWeightPerAnimal: avgWeightPerAnimal,
        uaValue: uaValue,
        notes: w.notes,
        recordedAt: w.recordedAt.toISOString(),
        method: w.method,
        createdAt: w.createdAt.toISOString(),
      };
    });

    const totalPages = Math.ceil(totalCount / limit);
    const hasMore = page < totalPages;

    return {
      herdId: herd.id,
      herdName: herd.name,
      currentWeight: herd.currentWeight,
      currentUA: herd.currentUA,
      totalCount,
      weighings: weighingItems,
      pagination: {
        page,
        limit,
        totalPages,
        hasMore,
      },
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

  /**
   * Estimar peso (kg) por cinta métrica usando fórmula estándar:
   * peso ≈ (perímetro^2 * longitud) / 11877, medidas en cm
   */
  private estimateWeightByTape(chestGirthCm: number, bodyLengthCm: number): number {
    const estimated = (chestGirthCm * chestGirthCm * bodyLengthCm) / 11877;
    return Math.round(estimated * 10) / 10; // redondear a 0.1 kg
  }
}
