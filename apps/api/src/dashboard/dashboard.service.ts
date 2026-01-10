import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { MovementService } from '../movement/movement.service';
import { DashboardSummaryDto, DashboardAlert, PaddockStatusDto } from './dto/dashboard-summary.dto';
import { DecisionTodayResponse } from '@shared/index';

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
    const totalAnimals = herds.reduce((sum, h) => sum + h.animalCount, 0);
    const totalWeight = herds.reduce((sum, h) => sum + (h.currentWeight || h.initialWeight || 0) * h.animalCount, 0);
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
      ? closedMovements.reduce((sum, m) => {
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
    return weighings.map((w, idx) => ({
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

    return movements.map((m) => ({
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

    return samples.map((s) => ({
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

    herds.forEach((herd) => {
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

    herds.forEach((herd) => {
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
    longMovements.forEach((m) => {
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

  /**
   * P0.7 - Decision Dashboard: readyPaddocks, warnings, recommendedNextPaddock
   * Analiza el estado actual de la finca para apoyar decisión de rotación
   */
  async getDecisionToday(farmId: string, userId: string) {
    await this.verifyFarmAccess(farmId, userId);

    const farm = await this.prisma.farm.findUniqueOrThrow({
      where: { id: farmId },
      select: { id: true, name: true },
    });

    // Obtener minRestDays de parámetros (default 30)
    const minRestParam = await this.prisma.parameter.findUnique({
      where: { farmId_key: { farmId, key: 'minRestDays' } },
    });
    const minRestDays = minRestParam ? parseInt(minRestParam.value, 10) : 30;

    // Obtener todos los potreros de la finca
    const paddocks = await this.prisma.paddock.findMany({
      where: { farmId, deletedAt: null, active: true },
      include: {
        forageSamples: {
          orderBy: { sampleDate: 'desc' },
          take: 1,
        },
        movements: {
          where: { status: 'ACTIVE' },
          include: { herd: true },
        },
      },
    });

    // Arrays para respuesta
    const readyPaddocks: any[] = [];
    const warnings: any[] = [];

    // Analizar cada potrero
    for (const paddock of paddocks) {
      const activeMovement = paddock.movements[0];
      const latestForage = paddock.forageSamples[0];

      // Calcular días de descanso
      const restDays = await this.movementService.calculatePaddockRestDays(paddock.id);

      // 1. Si está ocupado → verificar si forraje bajo
      if (activeMovement) {
        if (latestForage && latestForage.availableForageKgMS) {
          const totalAvailableKgMS = latestForage.availableForageKgMS * paddock.hectares;
          const herd = activeMovement.herd;
          const herdWeight = (herd.currentWeight || herd.initialWeight) * herd.animalCount;
          const dailyConsumption = herdWeight * 0.02; // 2% consumo diario
          const daysRemaining = Math.floor(totalAvailableKgMS / dailyConsumption);

          if (daysRemaining < 3) {
            warnings.push({
              type: 'LOW_FORAGE',
              severity: daysRemaining < 1 ? 'high' : 'medium',
              message: `${paddock.name}: Forraje bajo (${daysRemaining} días restantes)`,
              paddockId: paddock.id,
              paddockName: paddock.name,
              herdName: herd.name,
              recommendedDays: daysRemaining,
            });
          }
        }
      }
      // 2. Si está vacío → determinar si listo o en descanso
      else {
        // Si restDays es null (primer movimiento), considerarlo listo
        const effectiveRestDays = restDays ?? minRestDays;
        const status = effectiveRestDays >= minRestDays ? 'READY' : 'RESTING';
        const availableKgMS = latestForage?.availableForageKgMS
          ? latestForage.availableForageKgMS * paddock.hectares
          : null;

        if (status === 'READY') {
          readyPaddocks.push({
            paddockId: paddock.id,
            paddockName: paddock.name,
            hectares: paddock.hectares,
            daysRested: effectiveRestDays,
            minRestDays: minRestDays,
            availableKgMS: availableKgMS,
            status: 'READY',
          });
        } else {
          // Warning: todavía en descanso
          const daysShort = minRestDays - effectiveRestDays;
          if (daysShort > 0) {
            warnings.push({
              type: 'INSUFFICIENT_REST',
              severity: 'low',
              message: `${paddock.name}: Necesita ${daysShort} días más de descanso`,
              paddockId: paddock.id,
              paddockName: paddock.name,
              daysRested: effectiveRestDays,
            });
          }
        }
      }
    }

    // 3. Determinar potrero recomendado
    let recommendedNextPaddock: any = null;
    if (readyPaddocks.length > 0) {
      // Ordenar por días descansados (más descanso = mejor)
      readyPaddocks.sort((a, b) => b.daysRested - a.daysRested);

      const best = readyPaddocks[0];
      recommendedNextPaddock = {
        paddockId: best.paddockId,
        paddockName: best.paddockName,
        daysRested: best.daysRested,
        availableKgMS: best.availableKgMS,
        reason: `Mayor descanso (${best.daysRested} días) y ${
          best.availableKgMS
            ? `${Math.round(best.availableKgMS)} kg MS disponibles`
            : 'forraje disponible'
        }`,
      };
    }

    // 4. Warning si potreros ocupados tienen >7 días
    for (const paddock of paddocks) {
      const activeMovement = paddock.movements[0];
      if (activeMovement) {
        const daysOccupied = Math.floor(
          (Date.now() - activeMovement.entryDate.getTime()) / (1000 * 60 * 60 * 24),
        );
        if (daysOccupied > 7) {
          warnings.push({
            type: 'OVERDUE_ROTATION',
            severity: daysOccupied > 10 ? 'high' : 'medium',
            message: `${paddock.name}: ${daysOccupied} días ocupado - considerar rotación`,
            paddockId: paddock.id,
            paddockName: paddock.name,
            herdName: activeMovement.herd.name,
          });
        }
      }
    }

    // 5. Calcular confidenceLevel basado en disponibilidad de datos
    let hasForageData = false;
    let hasWeighingData = false;
    let hasMovementData = false;

    for (const paddock of paddocks) {
      if (paddock.forageSamples.length > 0) hasForageData = true;
      if (paddock.movements.length > 0) hasMovementData = true;
    }

    const allHerds = await this.prisma.herd.findMany({
      where: { farmId },
      select: { id: true },
      take: 1,
    });
    if (allHerds.length > 0) {
      const lastWeighing = await this.prisma.weighing.findFirst({
        where: { herdId: allHerds[0].id },
        orderBy: { recordedAt: 'desc' },
        take: 1,
      });
      hasWeighingData = !!lastWeighing;
    }

    let confidenceLevel: 'HIGH' | 'MEDIUM' | 'LOW' = 'HIGH';
    if (!hasForageData || !hasWeighingData || !hasMovementData) {
      confidenceLevel = !hasForageData && !hasWeighingData ? 'LOW' : 'MEDIUM';
    }

    // 6. Construir explainability reasons
    const reasons: any[] = [];

    if (recommendedNextPaddock) {
      reasons.push({
        reason: `Descanso de ${recommendedNextPaddock.daysRested} días >= mínimo de ${minRestDays} días`,
        source: 'MOVEMENT_HISTORY',
        weight: 5,
      });
      if (recommendedNextPaddock.availableKgMS) {
        reasons.push({
          reason: `Forraje disponible: ${Math.round(recommendedNextPaddock.availableKgMS)} kg MS`,
          source: 'FORAGE_DATA',
          weight: 4,
        });
      }
    }

    if (hasWeighingData) {
      reasons.push({
        reason: 'Pesaje reciente disponible para cálculo de consumo',
        source: 'WEIGHING_DATA',
        weight: 3,
      });
    }

    if (!hasForageData) {
      reasons.push({
        reason: 'Falta aforo de forraje reciente - recomendado registrar',
        source: 'PARAMETER',
        weight: 2,
      });
    }

    // 7. Construir action checklist
    const actionChecklist: any[] = [];

    // Check if recent forage data exists
    const allPaddocks = await this.prisma.paddock.findMany({
      where: { farmId, deletedAt: null, active: true },
      include: {
        forageSamples: {
          orderBy: { sampleDate: 'desc' },
          take: 1,
        },
      },
    });

    for (const paddock of allPaddocks) {
      const lastForage = paddock.forageSamples[0];
      const daysSinceSample = lastForage
        ? Math.floor((Date.now() - new Date(lastForage.sampleDate).getTime()) / (1000 * 60 * 60 * 24))
        : 999;

      if (daysSinceSample > 7) {
        actionChecklist.push({
          id: `forage-${paddock.id}`,
          action: `Registrar aforo en potrero "${paddock.name}"`,
          priority: daysSinceSample > 14 ? 'URGENT' : 'HIGH',
          status: 'PENDING',
          context: paddock.name,
        });
      }
    }

    // Check if recent weighing exists
    const allHerds2 = await this.prisma.herd.findMany({
      where: { farmId },
      include: {
        weighings: {
          orderBy: { recordedAt: 'desc' },
          take: 1,
        },
      },
    });

    for (const herd of allHerds2) {
      const lastWeighing = herd.weighings[0];
      const daysSinceWeighing = lastWeighing
        ? Math.floor((Date.now() - new Date(lastWeighing.recordedAt).getTime()) / (1000 * 60 * 60 * 24))
        : 999;

      if (daysSinceWeighing > 30) {
        actionChecklist.push({
          id: `weighing-${herd.id}`,
          action: `Registrar pesaje de hato "${herd.name}"`,
          priority: daysSinceWeighing > 60 ? 'URGENT' : 'MEDIUM',
          status: 'PENDING',
          context: herd.name,
        });
      }
    }

    // Check for active movements that need closure
    // Get all paddocks with active movements
    const paddocksWithMovements = await this.prisma.paddock.findMany({
      where: { farmId, deletedAt: null, active: true },
      include: {
        movements: {
          where: { status: 'ACTIVE' },
          include: { herd: true },
        },
      },
    });

    for (const paddock of paddocksWithMovements) {
      for (const movement of paddock.movements) {
        const daysOccupied = Math.floor(
          (Date.now() - movement.entryDate.getTime()) / (1000 * 60 * 60 * 24),
        );

        if (daysOccupied > 7) {
          actionChecklist.push({
            id: `movement-${movement.id}`,
            action: `Cerrar movimiento: ${movement.herd.name} en ${paddock.name}`,
            priority: daysOccupied > 10 ? 'URGENT' : 'HIGH',
            status: 'PENDING',
            context: `${movement.herd.name} → ${paddock.name}`,
          });
        }
      }
    }

    return {
      farmId: farm.id,
      farmName: farm.name,
      timestamp: new Date().toISOString(),
      confidenceLevel,
      explainability: reasons,
      actionChecklist,
      readyPaddocks,
      warnings,
      recommendedNextPaddock,
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
