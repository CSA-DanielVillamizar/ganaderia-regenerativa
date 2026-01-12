import { Injectable, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateWeighingDto } from '@shared/index';

@Injectable()
export class WeighingService {
  constructor(private prisma: PrismaService) {}

  /**
   * Registrar pesaje
   */
  async create(dto: CreateWeighingDto, userId: string) {
    const herd = await this.prisma.herd.findUniqueOrThrow({
      where: { id: dto.herdId },
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

    // Actualizar peso actual del lote (promedio por animal)
    const averagePerAnimal = weightToStore / dto.animalCount;
    await this.prisma.herd.update({
      where: { id: dto.herdId },
      data: { currentWeight: averagePerAnimal },
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
   * Obtener historial de pesajes
   */
  async getHistory(herdId: string, userId: string) {
    const herd = await this.prisma.herd.findUniqueOrThrow({
      where: { id: herdId },
    });

    await this.verifyFarmAccess(herd.farmId, userId);

    const weighings = await this.prisma.weighing.findMany({
      where: { herdId },
      orderBy: { recordedAt: 'asc' },
      take: 50,
    });

    return weighings.map((w: any) => ({
      date: w.recordedAt,
      weight: w.weight,
      ua: w.weight / 450,
      gain: 0, // Calculado en frontend
    }));
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
