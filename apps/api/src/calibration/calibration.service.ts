import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateCalibrationDto } from './dto/calibration.dto';

/**
 * Servicio de Calibración
 * 
 * Gestiona la calibración de fórmulas de estimación de peso por cinta métrica
 * 
 * Fórmula por defecto: weight_kg = (girth² × length) / 11877
 * Factor de calibración permite ajustar el divisor a razas/genéticas locales
 */
@Injectable()
export class CalibrationService {
  constructor(private prisma: PrismaService) {}

  /**
   * Obtiene la calibración de una finca
   * Si no existe, retorna valores por defecto
   */
  async getByFarm(farmId: string) {
    const calibration = await this.prisma.tapeCalibration.findUnique({
      where: { farmId },
    });

    if (!calibration) {
      return {
        farmId,
        divisor: 11877, // Default Bovonómia formula
        notes: 'Default calibration',
        appliedDate: new Date(),
        status: 'PENDING',
      };
    }

    return calibration;
  }

  /**
   * Crea o actualiza calibración de una finca
   */
  async upsert(farmId: string, dto: CreateCalibrationDto) {
    const calibration = await this.prisma.tapeCalibration.upsert({
      where: { farmId },
      create: {
        farmId,
        divisor: dto.divisor,
        notes: dto.notes,
        status: 'PENDING', // Requiere validación
      },
      update: {
        divisor: dto.divisor,
        notes: dto.notes,
        status: 'PENDING',
        updatedAt: new Date(),
      },
    });

    return calibration;
  }

  /**
   * Marca la calibración como validada
   */
  async validate(farmId: string) {
    return this.prisma.tapeCalibration.update({
      where: { farmId },
      data: {
        status: 'VALIDATED',
        appliedDate: new Date(),
      },
    });
  }

  /**
   * Obtiene historial de calibraciones
   */
  async getHistory(farmId: string) {
    return this.prisma.tapeCalibrationHistory.findMany({
      where: { farmId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
  }

  /**
   * Calcula peso estimado usando calibración específica de finca
   */
  calculateWeightWithCalibration(
    chestGirth: number,
    bodyLength: number,
    divisor: number = 11877,
  ): number {
    const estimated = (chestGirth * chestGirth * bodyLength) / divisor;
    return Math.round(estimated);
  }

  /**
   * Realiza calibración con pesajes reales
   * Compara tape estimates vs pesos reales para ajustar divisor
   */
  async performCalibration(
    farmId: string,
    weighings: Array<{
      actualWeight: number;
      chestGirth: number;
      bodyLength: number;
    }>,
  ) {
    if (weighings.length < 5) {
      throw new Error(
        'Se requieren al menos 5 pesajes para calibración válida',
      );
    }

    // Calcula el divisor óptimo mediante regresión
    // Minimiza error cuadrático entre estimados y reales
    let sumSquaredErrors = 0;
    let optimalDivisor = 11877;

    // Prueba rangos de divisores
    for (let divisor = 10000; divisor <= 13000; divisor += 100) {
      let squaredErrors = 0;

      for (const w of weighings) {
        const estimated = (w.chestGirth * w.chestGirth * w.bodyLength) / divisor;
        const error = w.actualWeight - estimated;
        squaredErrors += error * error;
      }

      if (squaredErrors < sumSquaredErrors || divisor === 10000) {
        sumSquaredErrors = squaredErrors;
        optimalDivisor = divisor;
      }
    }

    // Guarda historial
    await this.prisma.tapeCalibrationHistory.create({
      data: {
        farmId,
        previousDivisor: (await this.getByFarm(farmId)).divisor,
        newDivisor: optimalDivisor,
        samplesUsed: weighings.length,
        rmseError: Math.sqrt(sumSquaredErrors / weighings.length),
      },
    });

    // Aplica nueva calibración
    return this.upsert(farmId, {
      divisor: optimalDivisor,
      notes: `Calibración automática con ${weighings.length} muestras. RMSE: ${Math.sqrt(sumSquaredErrors / weighings.length).toFixed(2)} kg`,
    });
  }
}
