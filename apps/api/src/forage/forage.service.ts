import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateForageSampleDto, ForageMeasurementType, AvailableForageResponse } from '@shared/index';

@Injectable()
export class ForageService {
  constructor(private prisma: PrismaService) {}

  /**
   * Registrar aforo (medición de forraje)
   * Calcula el forraje disponible en MS según el tipo de medición:
   * - GREEN: kgPerHectare * (dryMatterPercent/100) * (utilizationPercent/100)
   * - DRY_MATTER: kgPerHectare * (utilizationPercent/100)
   */
  async create(dto: CreateForageSampleDto, userId: string) {
    const paddock = await this.prisma.paddock.findUniqueOrThrow({
      where: { id: dto.paddockId },
    });

    await this.verifyFarmAccess(paddock.farmId, userId);

    // Calcular forraje disponible en MS según tipo de medición
    let availableForageKgMS: number | null = null;

    if (dto.measurementType === ForageMeasurementType.GREEN) {
      // Forraje verde: kgPerHectare * (dryMatterPercent/100) * (utilizationPercent/100)
      availableForageKgMS =
        dto.kgPerHectare *
        ((dto.dryMatterPercent || 30) / 100) *
        ((dto.utilizationPercent || 70) / 100);
    } else if (dto.measurementType === ForageMeasurementType.DRY_MATTER) {
      // Materia seca directo: kgPerHectare * (utilizationPercent/100)
      availableForageKgMS =
        dto.kgPerHectare * ((dto.utilizationPercent || 70) / 100);
    }

    // Calcular kgMS/ha legacy si se proporcionan datos guiados
    let kgMSPerHa: number | null = dto.kgMSPerHa ?? availableForageKgMS ?? null;
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
        measurementType: dto.measurementType || ForageMeasurementType.GREEN,
        dryMatterPercent: dto.dryMatterPercent,
        utilizationPercent: dto.utilizationPercent || 70,
        availableForageKgMS,
        sampleDate: new Date(dto.sampleDate),
        notes: dto.notes,
        createdBy: userId,
        // Legacy fields
        dryMatter: availableForageKgMS,
        frameAreaM2: dto.frameAreaM2,
        freshWeightKg: dto.freshWeightKg,
        kgMSPerHa,
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

  /**
   * P0.3 - AFOROS REALES
   * Obtener forraje disponible (en kg MS) para un potrero
   * Retorna el último aforo registrado con cálculos de materia seca
   * 
   * @param paddockId - UUID del potrero
   * @param userId - UUID del usuario (para verificar acceso)
   * @returns AvailableForageResponse con totales calculados
   * @throws NotFoundException si no existe el potrero o no hay aforos
   */
  async getAvailableForage(paddockId: string, userId: string): Promise<AvailableForageResponse> {
    // 1. Verificar que el potrero existe y obtener datos
    const paddock = await this.prisma.paddock.findUnique({
      where: { id: paddockId },
      include: {
        farm: true,
      },
    });

    if (!paddock) {
      throw new NotFoundException(`Potrero ${paddockId} no encontrado`);
    }

    // 2. Verificar acceso del usuario a la finca
    await this.verifyFarmAccess(paddock.farmId, userId);

    // 3. Obtener el último aforo del potrero
    const latestSample = await this.prisma.forageSample.findFirst({
      where: { paddockId },
      orderBy: { sampleDate: 'desc' },
    });

    if (!latestSample) {
      throw new NotFoundException(
        `No hay aforos registrados para el potrero ${paddock.name}`
      );
    }

    // 4. Validar que availableForageKgMS fue calculado
    if (latestSample.availableForageKgMS === null) {
      throw new NotFoundException(
        `El aforo no tiene cálculo de MS disponible. Registre un nuevo aforo.`
      );
    }

    // 5. Calcular total disponible = availableForageKgMS × hectáreas
    const totalAvailableKgMS = latestSample.availableForageKgMS * paddock.hectares;

    // 6. Construir respuesta
    return {
      paddockId: paddock.id,
      paddockName: paddock.name,
      paddockHectares: paddock.hectares,
      forageSampleId: latestSample.id,
      measurementType: latestSample.measurementType as ForageMeasurementType,
      kgPerHectare: latestSample.kgPerHectare,
      dryMatterPercent: latestSample.dryMatterPercent,
      utilizationPercent: latestSample.utilizationPercent,
      availableForageKgMS: latestSample.availableForageKgMS,
      totalAvailableKgMS,
      sampledAt: latestSample.sampleDate.toISOString(),
      remainingDaysOfUse: null, // Se calculará en P0.4 cuando tengamos herd demand
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
