import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

/**
 * Parámetros de cálculo configurables por finca.
 * P0.2, P0.3, P0.4, P0.5 dependen de esta configuración.
 */
@Injectable()
export class ParameterService {
  constructor(private prisma: PrismaService) {}

  /**
   * Obtener valor de parámetro con fallback a default
   * Busca primero en FarmParameter (override) y luego en Parameter (global)
   */
  async getParameter(farmId: string, key: string, defaultValue: string): Promise<string> {
    // 1. Buscar en FarmParameter (override específico por finca)
    const farmParam = await this.prisma.farmParameter.findUnique({
      where: { farmId_key: { farmId, key } },
    });

    if (farmParam?.value) {
      return farmParam.value;
    }

    // 2. Buscar en Parameter global
    const param = await this.prisma.parameter.findUnique({
      where: { farmId_key: { farmId, key } },
    });

    return param?.value ?? defaultValue;
  }

  /**
   * Obtener parámetro como número
   */
  async getParameterAsNumber(
    farmId: string,
    key: string,
    defaultValue: number
  ): Promise<number> {
    const value = await this.getParameter(farmId, key, defaultValue.toString());
    const parsed = parseFloat(value);
    return isNaN(parsed) ? defaultValue : parsed;
  }

  /**
   * Establecer parámetro
   */
  async setParameter(
    farmId: string,
    key: string,
    value: string,
    userId: string,
    description?: string
  ) {
    return this.prisma.parameter.upsert({
      where: { farmId_key: { farmId, key } },
      create: {
        farmId,
        key,
        value,
        description,
      },
      update: {
        value,
        description,
        updatedBy: userId,
      },
    });
  }

  /**
   * Listar parámetros de finca
   */
  async listByFarm(farmId: string) {
    return this.prisma.parameter.findMany({
      where: { farmId },
      orderBy: { key: 'asc' },
    });
  }

  /**
   * Inicializar parámetros default para nueva finca
   */
  async initializeDefaults(farmId: string, _userId: string) {
    const defaults = [
      { key: 'ua_weight_kg', value: '450', description: 'Peso de una Unidad Animal en kg' },
      { key: 'intake_percent_of_bw', value: '0.025', description: 'Consumo como % del peso vivo (ej: 2.5%)' },
      { key: 'dry_matter_fraction', value: '0.30', description: 'Fracción de materia seca en consumo (ej: 30%)' },
      { key: 'utilization_percent', value: '70', description: 'Porcentaje de aprovechamiento de forraje' },
      { key: 'min_rest_days', value: '21', description: 'Mínimo días de descanso entre rotaciones' },
    ];

    const existing = await this.prisma.parameter.findMany({
      where: { farmId },
      select: { key: true },
    });

    const existingKeys = new Set(existing.map((p) => p.key));

    const toCreate = defaults.filter((d) => !existingKeys.has(d.key));

    for (const param of toCreate) {
      await this.prisma.parameter.create({
        data: {
          farmId,
          key: param.key,
          value: param.value,
          description: param.description,
        },
      });
    }

    return toCreate.length;
  }

  /**
   * Establecer parámetro override por finca (FarmParameter)
   */
  async setFarmParameter(
    farmId: string,
    key: string,
    value: string,
    userId: string,
    description?: string
  ) {
    return this.prisma.farmParameter.upsert({
      where: { farmId_key: { farmId, key } },
      create: {
        farmId,
        key,
        value,
        description,
        updatedBy: userId,
      },
      update: {
        value,
        description,
        updatedBy: userId,
      },
    });
  }

  /**
   * Obtener todos los parámetros de una finca (farm + global overrides)
   */
  async getFarmParameters(farmId: string) {
    const farmParams = await this.prisma.farmParameter.findMany({
      where: { farmId },
    });

    const globalParams = await this.prisma.parameter.findMany({
      where: { farmId },
    });

    // Merge: farm overrides tienen prioridad
    const result: Record<string, string> = {};
    globalParams.forEach((p) => (result[p.key] = p.value));
    farmParams.forEach((p) => (result[p.key] = p.value));

    return result;
  }

  /**
   * Validar acceso a parámetros de finca
   */
  private async verifyFarmAccess(farmId: string, userId: string) {
    const userFarm = await this.prisma.userFarm.findUnique({
      where: { userId_farmId: { userId, farmId } },
    });

    if (!userFarm) {
      throw new ForbiddenException('No tienes acceso a esta finca');
    }
  }
}
