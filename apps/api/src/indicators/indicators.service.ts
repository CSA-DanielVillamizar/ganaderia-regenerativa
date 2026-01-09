import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

export interface PastureIndicators {
  /** Unidades Animales por hectárea */
  pastorePressure: number;
  
  /** Ratio descanso/ocupación (ideal >= 2) */
  recoveryIndex: number;
  
  /** Disponibilidad de forraje kg MS/ha */
  forageLevelKgMSHa: number;
  
  /** Score sostenibilidad global (0-1) */
  sustainabilityScore: number;
  
  /** Detalle métricas */
  details: {
    totalUA: number;
    farmHectares: number;
    avgOccupancyDays: number;
    avgRestDays: number;
    forageAvailableDays: number;
  };
}

export interface RegenerativeIndicators {
  /** Análisis por finca */
  farm: {
    id: string;
    name: string;
  };
  
  /** Período analizado */
  period: {
    startDate: Date;
    endDate: Date;
    daysAnalyzed: number;
  };
  
  /** Indicadores principales */
  pastureHealth: PastureIndicators;
  
  /** Tendencias (últimos 30 días) */
  trends: {
    pastorePressure: {
      current: number;
      previous: number;
      trend: 'INCREASING' | 'STABLE' | 'DECREASING';
      change: number;
    };
    
    forageAvailability: {
      current: number;
      previous: number;
      trend: 'INCREASING' | 'STABLE' | 'DECREASING';
      change: number;
    };
    
    recoveryProgress: {
      current: number;
      previous: number;
      trend: 'IMPROVING' | 'STABLE' | 'DECLINING';
      change: number;
    };
  };
  
  /** Recomendaciones basadas en indicadores */
  recommendations: string[];
  
  /** Análisis por potrero */
  paddockAnalysis: {
    paddockId: string;
    paddockName: string;
    currentState: 'READY' | 'OCCUPIED' | 'RESTING' | 'RECOVERING';
    daysInState: number;
    recoveryProgress: number; // 0-100
    recommendedAction: string;
  }[];
}

/**
 * Servicio de cálculo de indicadores regenerativos
 * Proporciona métricas avanzadas de salud de pastura y sostenibilidad
 */
@Injectable()
export class IndicatorsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Calcular indicadores regenerativos para una finca
   */
  async calculateFarmIndicators(
    farmId: string,
    userId: string,
    daysToAnalyze: number = 30
  ): Promise<RegenerativeIndicators> {
    // Verificar acceso a finca
    await this.verifyFarmAccess(farmId, userId);

    const farm = await this.prisma.farm.findUniqueOrThrow({
      where: { id: farmId },
      include: { paddocks: true, herds: true },
    });

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysToAnalyze);

    // Calcular indicadores de pastura
    const pastureHealth = await this.calculatePastureIndicators(farm, startDate, endDate);

    // Calcular tendencias
    const trends = await this.calculateTrends(farm, startDate, endDate);

    // Análisis por potrero
    const paddockAnalysis = await this.analyzePaddocks(farm, startDate, endDate);

    // Generar recomendaciones
    const recommendations = this.generateRecommendations(pastureHealth, trends);

    return {
      farm: { id: farm.id, name: farm.name },
      period: {
        startDate,
        endDate,
        daysAnalyzed: daysToAnalyze,
      },
      pastureHealth,
      trends,
      recommendations,
      paddockAnalysis,
    };
  }

  /**
   * Calcular indicadores de salud de pastura
   * - Presión de pastoreo (UA/ha)
   * - Índice de recuperación (descanso/ocupación)
   * - Disponibilidad de forraje
   * - Score sostenibilidad
   */
  private async calculatePastureIndicators(
    farm: any,
    startDate: Date,
    endDate: Date
  ): Promise<PastureIndicators> {
    // Obtener datos de movimientos (rotación)
    const movements = await this.prisma.movement.findMany({
      where: {
        herd: { farmId: farm.id },
        entryDate: { gte: startDate, lte: endDate },
      },
      include: {
        herd: { include: { animals: true } },
        paddock: true,
      },
    });

    // Calcular UA totales
    const totalUA = farm.herds.reduce((sum: number, herd: any) => {
      return sum + (herd.animals ? herd.animals.length * 0.5 : 0); // Default 0.5 UA por animal
    }, 0);

    // Calcular días promedio ocupación y descanso
    let totalOccupancyDays = 0;
    let movementCount = 0;

    for (const movement of movements) {
      if (movement.exitDate) {
        const occupancyDays = Math.floor(
          (movement.exitDate.getTime() - movement.entryDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        totalOccupancyDays += occupancyDays;
        movementCount++;
      }
    }

    const avgOccupancyDays = movementCount > 0 ? totalOccupancyDays / movementCount : 0;

    // Obtener aforos más recientes para forraje disponible
    const forageSamples = await this.prisma.forageSample.findMany({
      where: {
        paddock: { farmId: farm.id },
        createdAt: { gte: startDate, lte: endDate },
      },
      orderBy: { createdAt: 'desc' },
      take: 1,
    });

    const forageAvailableDays = forageSamples.length > 0
      ? forageSamples[0].kgMSPerHa
        ? Math.floor(forageSamples[0].kgMSPerHa / (totalUA * 10)) // Consumo ~10kg/UA/día
        : 0
      : 0;

    // Calcular presión de pastoreo (UA/hectárea)
    const pastorePressure = farm.hectares ? (totalUA / farm.hectares) : 0;

    // Calcular índice de recuperación
    // Necesitamos descanso mínimo configurado
    const minRestDaysParam = await this.prisma.parameter.findFirst({
      where: { farmId: farm.id, key: 'minRestDays' },
    });
    const minRestDays = minRestDaysParam?.value ? parseInt(minRestDaysParam.value, 10) : 30;
    const avgRestDays = avgOccupancyDays > 0 ? minRestDays : 0;

    const recoveryIndex = avgOccupancyDays > 0
      ? avgRestDays / avgOccupancyDays
      : 0;

    // Calcular score sostenibilidad (0-1)
    // Factores: presión de pastoreo ideal (0.5-3), índice recuperación (>2), forraje disponible (>30 días)
    let sustainabilityScore = 0.5; // Base

    if (pastorePressure >= 0.5 && pastorePressure <= 3) sustainabilityScore += 0.25; // Presión óptima
    if (recoveryIndex >= 2) sustainabilityScore += 0.25; // Recuperación adecuada
    if (forageAvailableDays >= 30) sustainabilityScore += 0.25; // Forraje suficiente

    sustainabilityScore = Math.min(1, Math.max(0, sustainabilityScore));

    return {
      pastorePressure: Math.round(pastorePressure * 100) / 100,
      recoveryIndex: Math.round(recoveryIndex * 100) / 100,
      forageLevelKgMSHa: Math.round(forageAvailableDays * 100) / 100,
      sustainabilityScore: Math.round(sustainabilityScore * 100) / 100,
      details: {
        totalUA: Math.round(totalUA * 10) / 10,
        farmHectares: farm.hectares,
        avgOccupancyDays: Math.round(avgOccupancyDays),
        avgRestDays: Math.round(avgRestDays),
        forageAvailableDays: Math.round(forageAvailableDays),
      },
    };
  }

  /**
   * Calcular tendencias de indicadores en últimos 30 días
   */
  private async calculateTrends(
    farm: any,
    startDate: Date,
    endDate: Date
  ): Promise<any> {
    // Período anterior
    const prevEndDate = new Date(startDate);
    const prevStartDate = new Date(startDate);
    prevStartDate.setDate(prevStartDate.getDate() - 30);

    const currentIndicators = await this.calculatePastureIndicators(farm, startDate, endDate);
    const previousIndicators = await this.calculatePastureIndicators(
      farm,
      prevStartDate,
      prevEndDate
    );

    const calculateTrend = (current: number, previous: number, threshold = 0.05) => {
      const change = current - previous;
      const percentChange = previous !== 0 ? (change / previous) * 100 : 0;

      if (percentChange > threshold) return 'INCREASING';
      if (percentChange < -threshold) return 'DECREASING';
      return 'STABLE';
    };

    return {
      pastorePressure: {
        current: currentIndicators.pastorePressure,
        previous: previousIndicators.pastorePressure,
        trend: calculateTrend(
          currentIndicators.pastorePressure,
          previousIndicators.pastorePressure
        ),
        change: Math.round(
          (currentIndicators.pastorePressure - previousIndicators.pastorePressure) * 100
        ) / 100,
      },
      forageAvailability: {
        current: currentIndicators.forageLevelKgMSHa,
        previous: previousIndicators.forageLevelKgMSHa,
        trend: calculateTrend(
          currentIndicators.forageLevelKgMSHa,
          previousIndicators.forageLevelKgMSHa
        ),
        change: Math.round(
          (currentIndicators.forageLevelKgMSHa - previousIndicators.forageLevelKgMSHa) * 100
        ) / 100,
      },
      recoveryProgress: {
        current: currentIndicators.recoveryIndex,
        previous: previousIndicators.recoveryIndex,
        trend:
          currentIndicators.recoveryIndex > previousIndicators.recoveryIndex
            ? 'IMPROVING'
            : currentIndicators.recoveryIndex < previousIndicators.recoveryIndex
            ? 'DECLINING'
            : 'STABLE',
        change: Math.round(
          (currentIndicators.recoveryIndex - previousIndicators.recoveryIndex) * 100
        ) / 100,
      },
    };
  }

  /**
   * Analizar estado actual de cada potrero
   */
  private async analyzePaddocks(farm: any, startDate: Date, endDate: Date) {
    const paddocks = await this.prisma.paddock.findMany({
      where: { farmId: farm.id },
      include: {
        movements: {
          where: { exitDate: { gte: startDate, lte: endDate } },
          orderBy: { exitDate: 'desc' },
          take: 1,
        },
      },
    });

    return paddocks.map((paddock) => {
      const lastMovement = paddock.movements[0];
      let currentState: 'READY' | 'OCCUPIED' | 'RESTING' | 'RECOVERING' = 'READY';
      let daysInState = 0;
      let recoveryProgress = 100;

      if (lastMovement) {
        if (!lastMovement.exitDate) {
          currentState = 'OCCUPIED';
          daysInState = Math.floor(
            (new Date().getTime() - lastMovement.entryDate.getTime()) / (1000 * 60 * 60 * 24)
          );
        } else {
          const daysSinceExit = Math.floor(
            (new Date().getTime() - lastMovement.exitDate.getTime()) / (1000 * 60 * 60 * 24)
          );
          daysInState = daysSinceExit;

          // Asumir descanso mínimo de 30 días
          if (daysSinceExit < 30) {
            currentState = 'RESTING';
            recoveryProgress = Math.round((daysSinceExit / 30) * 100);
          } else {
            currentState = 'READY';
            recoveryProgress = 100;
          }
        }
      }

      const recommendedAction = this.getPaddockRecommendation(currentState, daysInState);

      return {
        paddockId: paddock.id,
        paddockName: paddock.name,
        currentState,
        daysInState,
        recoveryProgress,
        recommendedAction,
      };
    });
  }

  /**
   * Generar recomendaciones basadas en indicadores
   */
  private generateRecommendations(indicators: PastureIndicators, trends: any): string[] {
    const recommendations: string[] = [];

    // Presión de pastoreo
    if (indicators.pastorePressure > 3) {
      recommendations.push(
        '⚠️ ALTO: Presión de pastoreo superior a lo ideal (>3 UA/ha). Reduce carga o aumenta área'
      );
    } else if (indicators.pastorePressure < 0.5) {
      recommendations.push(
        '📈 BAJO: Presión de pastoreo inferior a lo recomendado (<0.5 UA/ha). Considera intensificar'
      );
    } else {
      recommendations.push('✅ Presión de pastoreo dentro de rango óptimo (0.5-3 UA/ha)');
    }

    // Índice de recuperación
    if (indicators.recoveryIndex < 1.5) {
      recommendations.push(
        '⚠️ CRÍTICO: Descanso insuficiente (ratio <1.5). Aumenta período de reposo'
      );
    } else if (indicators.recoveryIndex < 2) {
      recommendations.push(
        '🟡 MODERADO: Descanso apenas adecuado (ratio <2). Monitorea próximas rotaciones'
      );
    } else {
      recommendations.push('✅ Período de descanso adecuado para recuperación del forraje');
    }

    // Forraje disponible
    if (indicators.forageLevelKgMSHa < 500) {
      recommendations.push(
        '⚠️ CRÍTICO: Forraje disponible muy bajo (<500 kg MS/ha). Riesgo de desnutrición'
      );
    } else if (indicators.forageLevelKgMSHa < 1000) {
      recommendations.push(
        '🟡 BAJO: Forraje disponible limitado (500-1000 kg MS/ha). Monitorea consumo'
      );
    } else if (indicators.forageLevelKgMSHa >= 1500) {
      recommendations.push('✅ Forraje disponible suficiente (>1500 kg MS/ha)');
    }

    // Sostenibilidad general
    if (indicators.sustainabilityScore < 0.5) {
      recommendations.push(
        '🔴 ALERTA: Score de sostenibilidad bajo. Revisar sistema rotacional completo'
      );
    } else if (indicators.sustainabilityScore >= 0.8) {
      recommendations.push(
        '🟢 EXCELENTE: Sistema regenerativo en buen estado de salud sostenible'
      );
    }

    // Tendencias
    if (trends.pastorePressure.trend === 'INCREASING') {
      recommendations.push(
        '📊 Tendencia: Presión de pastoreo en aumento. Prepara rotación más rápida'
      );
    }

    if (trends.forageAvailability.trend === 'DECREASING') {
      recommendations.push(
        '📉 Tendencia: Forraje disponible disminuyendo. Espaciar movimientos'
      );
    }

    return recommendations;
  }

  /**
   * Obtener recomendación específica para potrero
   */
  private getPaddockRecommendation(
    state: 'READY' | 'OCCUPIED' | 'RESTING' | 'RECOVERING',
    daysInState: number
  ): string {
    switch (state) {
      case 'READY':
        return '✅ Listo para ocupar. Considera rotación';
      case 'OCCUPIED':
        return daysInState > 7
          ? '⚠️ Ocupación prolongada. Libera pronto'
          : '🐄 Ocupación normal. Monitorea';
      case 'RESTING':
        return '🌱 En descanso. Permite recuperación completa';
      case 'RECOVERING':
        return '🟡 Recuperándose. Descanso en progreso';
      default:
        return 'Estado desconocido';
    }
  }

  /**
   * Verificar acceso del usuario a la finca
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
