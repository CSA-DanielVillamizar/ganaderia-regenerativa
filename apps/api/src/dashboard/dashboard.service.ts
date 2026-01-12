import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { MovementService } from '../movement/movement.service';
import { DashboardSummaryDto, DashboardAlert, PaddockStatusDto } from './dto/dashboard-summary.dto';

const UA_WEIGHT = 450;

@Injectable()
export class DashboardService {
  constructor(
    private prisma: PrismaService,
    private movementService: MovementService,
  ) {}

  /**
   * Obtener resumen del dashboard - KPIs del MVP
   */
  async getSummary(farmId: string, userId: string): Promise<DashboardSummaryDto> {
    await this.verifyFarmAccess(farmId, userId);

    const farm = await this.prisma.farm.findUniqueOrThrow({
      where: { id: farmId },
    });

    const herds = await this.prisma.herd.findMany({
      where: {
        farmId,
        deletedAt: null,
      },
      include: {
        animals: {
          where: { deletedAt: null },
        },
      },
    });

    const totalHerds = herds.length;
    const totalAnimals = herds.reduce((sum: number, h: any) => sum + h.animalCount, 0);
    const totalWeight = herds.reduce((sum: number, h: any) => sum + (h.currentWeight || h.initialWeight || 0) * h.animalCount, 0);
    const totalUA = totalWeight / UA_WEIGHT;
    const averageWeightPerAnimal = totalAnimals > 0 ? totalWeight / totalAnimals : 0;

    const paddocksCount = await this.prisma.paddock.count({
      where: {
        farmId,
        deletedAt: null,
      },
    });

    const activeMovements = await this.prisma.movement.count({
      where: {
        herd: { farmId },
        status: 'ACTIVE',
      },
    });

    // Calcular UA/ha total
    const totalHectares = farm.hectares || 0;
    const uaPerHa = totalHectares > 0 ? totalUA / totalHectares : 0;

    // Calcular días promedio de ocupación
    const closedMovements = await this.prisma.movement.findMany({
      where: {
        herd: { farmId },
        status: 'CLOSED',
        exitDate: { not: null },
      },
      take: 50,
      orderBy: { exitDate: 'desc' },
    });

    const avgOccupancy = closedMovements.length > 0
      ? closedMovements.reduce((sum: number, m: any) => {
          const days = Math.floor((m.exitDate!.getTime() - m.entryDate.getTime()) / (1000 * 60 * 60 * 24));
          return sum + days;
        }, 0) / closedMovements.length
      : null;

    // Contar potreros que necesitan más descanso
    const paddocks = await this.prisma.paddock.findMany({
      where: { farmId, deletedAt: null },
    });

    let paddocksNeedingRest = 0;
    for (const paddock of paddocks) {
      const restDays = await this.movementService.calculatePaddockRestDays(paddock.id);
      const minRest = paddock.minRestDays || 21;
      if (restDays !== null && restDays < minRest) {
        paddocksNeedingRest++;
      }
    }

    // Generar alertas
    const alerts = await this.generateAlerts(farmId);

    return {
      farmId,
      totalHerds,
      totalAnimals,
      totalWeight: Math.round(totalWeight * 100) / 100,
      totalUA: Math.round(totalUA * 100) / 100,
      averageWeightPerAnimal: Math.round(averageWeightPerAnimal * 100) / 100,
      activePaddocks: paddocksCount,
      activeMovements,
      uaPerHa: Math.round(uaPerHa * 100) / 100,
      averageOccupancyDays: avgOccupancy ? Math.round(avgOccupancy * 10) / 10 : null,
      paddocksNeedingRest,
      alerts,
    };
  }

  /**
   * Obtener tendencias de peso y UA
   */
  async getTrends(farmId: string, userId: string, herdId?: string) {
    await this.verifyFarmAccess(farmId, userId);

    const weighings = await this.prisma.weighing.findMany({
      where: {
        herd: {
          farmId,
          ...(herdId && { id: herdId }),
        },
      },
      orderBy: { recordedAt: 'asc' },
      take: 100,
    });

    // Agrupar por lote y calcular tendencias
    return weighings.map((w: any, idx: number) => ({
      date: w.recordedAt.toISOString().split('T')[0],
      weight: w.weight,
      ua: Math.round((w.weight / UA_WEIGHT) * 100) / 100,
      gain: idx > 0 ? weighings[idx].weight - weighings[idx - 1].weight : 0,
    }));
  }

  /**
   * Obtener estado de rotación (ocupación vs descanso)
   */
  async getRotationStatus(farmId: string, userId: string) {
    await this.verifyFarmAccess(farmId, userId);

    const movements = await this.prisma.movement.findMany({
      where: {
        herd: {
          farmId,
        },
      },
      include: {
        paddock: true,
      },
      orderBy: { entryDate: 'desc' },
      take: 50,
    });

    return movements.map((m: any) => ({
      paddockName: m.paddock.name,
      entryDate: m.entryDate.toISOString(),
      exitDate: m.exitDate?.toISOString() || null,
      daysOccupied: m.exitDate
        ? Math.floor((m.exitDate.getTime() - m.entryDate.getTime()) / (1000 * 60 * 60 * 24))
        : null,
    }));
  }

  /**
   * Obtener stats de aforos
   */
  async getForageStats(farmId: string, userId: string) {
    await this.verifyFarmAccess(farmId, userId);

    const samples = await this.prisma.forageSample.findMany({
      where: {
        paddock: {
          farmId,
        },
      },
      include: {
        paddock: true,
      },
      orderBy: { sampleDate: 'desc' },
      take: 50,
    });

    return samples.map((s: any) => ({
      paddockName: s.paddock.name,
      kgPerHectare: s.kgPerHectare,
      dryMatter: s.dryMatter,
      sampleDate: s.sampleDate.toISOString(),
    }));
  }

  /**
   * Obtener alertas del sistema
   */
  async getAlerts(farmId: string, userId: string) {
    await this.verifyFarmAccess(farmId, userId);

    const alerts: any[] = [];

    // Verificar lotes sin pesajes recientes
    const herds = await this.prisma.herd.findMany({
      where: { farmId, deletedAt: null },
      include: {
        weighings: {
          orderBy: { recordedAt: 'desc' },
          take: 1,
        },
      },
    });

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    herds.forEach((herd: any) => {
      if (herd.weighings.length === 0 || herd.weighings[0].recordedAt < sevenDaysAgo) {
        alerts.push({
          severity: 'warning',
          message: `Lote "${herd.name}" sin pesaje en 7 días`,
          type: 'WEIGHING_OVERDUE',
        });
      }
    });

    return alerts;
  }

  /**
   * Generar alertas operativas del MVP
   */
  private async generateAlerts(farmId: string): Promise<DashboardAlert[]> {
    const alerts: DashboardAlert[] = [];

    // Alerta: Lotes sin pesajes recientes
    const herds = await this.prisma.herd.findMany({
      where: { farmId, deletedAt: null },
      include: {
        weighings: {
          orderBy: { recordedAt: 'desc' },
          take: 1,
        },
      },
    });

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    herds.forEach((herd: any) => {
      if (herd.weighings.length === 0 || herd.weighings[0].recordedAt < sevenDaysAgo) {
        alerts.push({
          type: 'MISSING_DATA',
          severity: 'MEDIUM',
          message: `Lote "${herd.name}" sin pesaje en 7 días`,
          herdId: herd.id,
        });
      }
    });

    // Alerta: Potreros con descanso insuficiente
    const paddocks = await this.prisma.paddock.findMany({
      where: { farmId, deletedAt: null },
    });

    for (const paddock of paddocks) {
      const restDays = await this.movementService.calculatePaddockRestDays(paddock.id);
      const minRest = paddock.minRestDays || 21;
      
      if (restDays !== null && restDays < minRest) {
        alerts.push({
          type: 'INSUFFICIENT_REST',
          severity: 'HIGH',
          message: `Potrero "${paddock.name}" solo ${restDays} días de descanso (mín: ${minRest})`,
          paddockId: paddock.id,
        });
      }
    }

    // Alerta: Sobrepastoreo (movimientos activos > 7 días)
    const longMovements = await this.prisma.movement.findMany({
      where: {
        herd: { farmId },
        status: 'ACTIVE',
      },
      include: {
        paddock: true,
        herd: true,
      },
    });

    const now = new Date();
    longMovements.forEach((m: any) => {
      const days = Math.floor((now.getTime() - m.entryDate.getTime()) / (1000 * 60 * 60 * 24));
      if (days > 7) {
        alerts.push({
          type: 'OVERGRAZING',
          severity: 'HIGH',
          message: `Lote "${m.herd.name}" en "${m.paddock.name}" por ${days} días (recomendado < 7)`,
          paddockId: m.paddockId,
          herdId: m.herdId,
        });
      }
    });

    return alerts;
  }

  /**
   * Obtener estado detallado de todos los potreros
   */
  async getPaddockStatuses(farmId: string, userId: string): Promise<PaddockStatusDto[]> {
    await this.verifyFarmAccess(farmId, userId);

    const paddocks = await this.prisma.paddock.findMany({
      where: { farmId, deletedAt: null },
    });

    const statuses: PaddockStatusDto[] = [];

    for (const paddock of paddocks) {
      const activeMovement = await this.prisma.movement.findFirst({
        where: {
          paddockId: paddock.id,
          status: 'ACTIVE',
        },
        include: { herd: true },
      });

      let status: 'OCCUPIED' | 'RESTING' | 'READY' = 'READY';
      let restDays: number | null = null;

      if (activeMovement) {
        status = 'OCCUPIED';
        const occupancyDays = Math.floor(
          (new Date().getTime() - activeMovement.entryDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        statuses.push({
          paddockId: paddock.id,
          paddockName: paddock.name,
          hectares: paddock.hectares,
          status,
          currentHerdName: activeMovement.herd.name,
          currentUA: activeMovement.herd.currentUA || undefined,
          uaPerHa: activeMovement.herd.currentUA ? activeMovement.herd.currentUA / paddock.hectares : undefined,
          occupancyDays,
        });
      } else {
        const lastExit = await this.movementService.getLastPaddockExit(paddock.id);
        restDays = await this.movementService.calculatePaddockRestDays(paddock.id);
        const minRest = paddock.minRestDays || 21;

        if (restDays !== null && restDays < minRest) {
          status = 'RESTING';
        }

        statuses.push({
          paddockId: paddock.id,
          paddockName: paddock.name,
          hectares: paddock.hectares,
          status,
          restDays: restDays || undefined,
          minRestDays: minRest,
          lastExitDate: lastExit?.exitDate,
        });
      }
    }

    return statuses;
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
