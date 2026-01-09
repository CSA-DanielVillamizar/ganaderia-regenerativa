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
   */
  async getParameter(farmId: string, key: string, defaultValue: string): Promise<string> {
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
