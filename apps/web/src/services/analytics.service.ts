/**
 * Servicio de Reportes y KPIs - Data Engineering Layer
 * Especializado en Ganadería Regenerativa (Metodología Voisin)
 *
 * Consulta datos offline desde RxDB y calcula métricas críticas:
 * - KPIs Globales (Carga, UA, Área)
 * - Cuña Forrajera (Análisis de descanso de potreros)
 * - Proyecciones de Movimiento
 * - Ganancia de Peso
 *
 * Capa: Application Layer (Business Intelligence)
 * Patrón: Async Data Aggregation from RxDB
 */

import { getDb } from '@/lib/offline/db';
import {
  calculateRestDays,
  evaluateRestStatus,
  calculateUA,
  calculateForageBalance,
  type RestStatus,
  type ForageBalance,
} from '@/lib/agronomy/calculations';

/**
 * KPIs Globales de la Finca
 */
export interface GlobalKPIs {
  /** Total de Unidades Animales activas */
  totalUA: number;

  /** Sumatoria de hectáreas de todos los potreros */
  totalHectares: number;

  /** Carga Global (UA / Ha) */
  globalStockingRate: number;

  /** Promedio de días de descanso */
  averageRestDays: number;

  /** Cantidad de lotes activos */
  activeHerds: number;

  /** Cantidad de potreros */
  totalPaddocks: number;

  /** Fecha del cálculo */
  calculatedAt: string;
}

/**
 * Información de Potrero para Cuña Forrajera
 */
export interface PastureWedgeItem {
  /** ID del potrero */
  paddockId: string;

  /** Nombre del potrero */
  paddockName: string;

  /** Hectáreas del potrero */
  hectares: number;

  /** Días desde última salida */
  daysSinceExit: number;

  /** Estado de descanso (INSUFFICIENT, ADEQUATE, OPTIMAL, EXCESSIVE) */
  restStatus: 'INSUFFICIENT' | 'ADEQUATE' | 'OPTIMAL' | 'EXCESSIVE';

  /** Color del indicador */
  color: 'red' | 'yellow' | 'green' | 'orange';

  /** Mensaje para el usuario */
  message: string;

  /** Progreso hacia óptimo (0-100%) */
  progressPercent: number;

  /** Última fecha de salida */
  lastExitDate: string | null;
}

/**
 * Proyección de salida del movimiento actual
 */
export interface ExitProjection {
  /** ID del movimiento activo */
  movementId: string | null;

  /** ID del lote */
  herdId: string;

  /** Nombre del lote */
  herdName: string;

  /** Días planeados de ocupación */
  plannedDays: number;

  /** Días transcurridos hasta ahora */
  daysPassed: number;

  /** Días restantes para la salida */
  daysRemaining: number;

  /** Porcentaje de ocupación completado */
  occupationProgress: number;

  /** Déficit forrajero actual (kg MS) */
  forageDeficit: number;

  /** ¿Hay déficit crítico? */
  hasDeficit: boolean;

  /** Fecha de entrada actual */
  entryDate: string;

  /** Fecha estimada de salida */
  estimatedExitDate: string;
}

/**
 * Reporte de Ganancia de Peso
 */
export interface WeightGainReport {
  /** ID del lote */
  herdId: string;

  /** Nombre del lote */
  herdName: string;

  /** Peso actual (kg) */
  currentWeight: number;

  /** Peso anterior (kg) */
  previousWeight: number | null;

  /** Diferencia de peso (kg) */
  weightDifference: number | null;

  /** Días desde último pesaje */
  daysSinceLast: number | null;

  /** Ganancia Diaria de Peso - GDP (kg/día) */
  dailyWeightGain: number | null;

  /** Clasificación de GDP */
  gdpStatus: 'EXCELLENT' | 'GOOD' | 'ALERT' | 'UNKNOWN';

  /** Fecha del último pesaje */
  lastWeighingDate: string | null;

  /** Tendencia (ascendente, descendente, estable) */
  trend: 'UP' | 'DOWN' | 'STABLE' | 'UNKNOWN';
}

/**
 * 1️⃣ CALCULAR KPIs GLOBALES
 *
 * Agrega datos de todos los lotes y potreros para una vista general de la finca
 *
 * @returns KPIs globales calculados
 *
 * @example
 * const kpis = await getGlobalKPIs();
 * console.log(`Carga Global: ${kpis.globalStockingRate} UA/ha`);
 */
export async function getGlobalKPIs(): Promise<GlobalKPIs> {
  const db = await getDb();

  try {
    // Obtener todos los lotes activos
    const herds = await db.herds.find({ selector: { status: { $ne: 'ARCHIVED' } } }).exec();

    // Obtener todos los potreros
    const paddocks = await db.paddocks.find().exec();

    // Calcular UA total
    const totalUA = herds.reduce((sum, herd) => {
      const herdData = herd.toJSON();
      return sum + calculateUA(herdData.currentWeight || 0);
    }, 0);

    // Calcular hectáreas totales
    const totalHectares = paddocks.reduce((sum, paddock) => {
      const paddockData = paddock.toJSON();
      return sum + (paddockData.hectares || 0);
    }, 0);

    // Calcular carga global
    const globalStockingRate =
      totalHectares > 0 ? Math.round((totalUA / totalHectares) * 100) / 100 : 0;

    // Calcular promedio de días de descanso
    let totalRestDays = 0;
    let paddocksWithData = 0;

    for (const paddock of paddocks) {
      const paddockData = paddock.toJSON();
      // Buscar último movimiento cerrado
      const lastMovement = await db.movements
        .find({
          selector: {
            paddockId: paddockData.id,
            status: 'CLOSED',
            actualExitDate: { $exists: true },
          },
        })
        .sort({ actualExitDate: 'desc' })
        .limit(1)
        .exec();

      if (lastMovement.length > 0) {
        const movementData = lastMovement[0].toJSON();
        const restDays = calculateRestDays(movementData.actualExitDate);
        totalRestDays += restDays;
        paddocksWithData++;
      }
    }

    const averageRestDays = paddocksWithData > 0 ? Math.round(totalRestDays / paddocksWithData) : 0;

    return {
      totalUA: Math.round(totalUA * 100) / 100,
      totalHectares: Math.round(totalHectares * 100) / 100,
      globalStockingRate,
      averageRestDays,
      activeHerds: herds.length,
      totalPaddocks: paddocks.length,
      calculatedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error calculando KPIs globales:', error);
    return {
      totalUA: 0,
      totalHectares: 0,
      globalStockingRate: 0,
      averageRestDays: 0,
      activeHerds: 0,
      totalPaddocks: 0,
      calculatedAt: new Date().toISOString(),
    };
  }
}

/**
 * 2️⃣ OBTENER CUÑA FORRAJERA (Pasture Wedge)
 *
 * Retorna array de potreros ordenados por días de descanso
 * Cada uno incluye estado visual (color/alerta)
 *
 * Concepto Voisin:
 * - La "cuña" muestra qué potreros están listos para entrar
 * - Verde (45-60 días) = Óptimo, listos para cosechar
 * - Amarillo (30-45 días) = Aceptable
 * - Rojo (<30 días) = Alerta crítica
 * - Naranja (>60 días) = Envejecimiento
 *
 * @returns Array de potreros ordenados descendentemente por descanso
 *
 * @example
 * const wedge = await getPastureWedge();
 * // [ { paddockName: "N1", daysSinceExit: 52, color: "green" }, ... ]
 */
export async function getPastureWedge(): Promise<PastureWedgeItem[]> {
  const db = await getDb();

  try {
    const paddocks = await db.paddocks.find().exec();
    const items: PastureWedgeItem[] = [];

    for (const paddock of paddocks) {
      const paddockData = paddock.toJSON();

      // Buscar último movimiento cerrado
      const lastMovement = await db.movements
        .find({
          selector: {
            paddockId: paddockData.id,
            status: 'CLOSED',
            actualExitDate: { $exists: true },
          },
        })
        .sort({ actualExitDate: 'desc' })
        .limit(1)
        .exec();

      let daysSinceExit = 999; // Nunca ocupado
      let lastExitDate: string | null = null;

      if (lastMovement.length > 0) {
        const movementData = lastMovement[0].toJSON();
        daysSinceExit = calculateRestDays(movementData.actualExitDate);
        lastExitDate = movementData.actualExitDate;
      }

      // Evaluar estado
      const status = evaluateRestStatus(daysSinceExit);

      items.push({
        paddockId: paddockData.id,
        paddockName: paddockData.name,
        hectares: paddockData.hectares || 0,
        daysSinceExit,
        restStatus: status.status,
        color: status.color,
        message: status.message,
        progressPercent: status.progressPercent,
        lastExitDate,
      });
    }

    // Ordenar descendentemente por días de descanso
    return items.sort((a, b) => b.daysSinceExit - a.daysSinceExit);
  } catch (error) {
    console.error('Error calculando cuña forrajera:', error);
    return [];
  }
}

/**
 * 3️⃣ OBTENER PROYECCIÓN DE SALIDA
 *
 * Analiza el movimiento ACTIVO y proyecta cuándo saldrá el lote
 * Incluye análisis de déficit forrajero
 *
 * @param herdId ID del lote (opcional, si no proporciona busca el primero activo)
 * @returns Proyección de salida
 *
 * @example
 * const projection = await getExitProjection("herd123");
 * console.log(`Quedan ${projection.daysRemaining} días`);
 */
export async function getExitProjection(herdId?: string): Promise<ExitProjection | null> {
  const db = await getDb();

  try {
    // Buscar movimiento ACTIVO
    let movement = null;

    if (herdId) {
      const movements = await db.movements
        .find({ selector: { herdId, status: 'ACTIVE' } })
        .limit(1)
        .exec();
      movement = movements.length > 0 ? movements[0] : null;
    } else {
      const movements = await db.movements
        .find({ selector: { status: 'ACTIVE' } })
        .limit(1)
        .exec();
      movement = movements.length > 0 ? movements[0] : null;
    }

    if (!movement) {
      return null;
    }

    const movementData = movement.toJSON();

    // Obtener datos del lote
    const herd = await db.herds.findOne(movementData.herdId).exec();
    const herdData = herd?.toJSON();

    if (!herdData) {
      return null;
    }

    // Calcular días transcurridos
    const entryDate = new Date(movementData.entryDate);
    const now = new Date();
    const daysPassed = Math.floor((now.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));

    // Calcular días restantes
    const plannedDays = movementData.estimatedOccupationDays || 2;
    const daysRemaining = Math.max(0, plannedDays - daysPassed);

    // Porcentaje de ocupación
    const occupationProgress = Math.round((daysPassed / plannedDays) * 100);

    // Calcular déficit forrajero (simulado)
    const forageDeficit = Math.max(0, 500 - daysPassed * 100); // Simulación

    // Fecha estimada de salida
    const estimatedExitDate = new Date(entryDate);
    estimatedExitDate.setDate(estimatedExitDate.getDate() + plannedDays);

    return {
      movementId: movementData.id,
      herdId: movementData.herdId,
      herdName: herdData.name,
      plannedDays,
      daysPassed,
      daysRemaining,
      occupationProgress,
      forageDeficit,
      hasDeficit: forageDeficit > 0,
      entryDate: movementData.entryDate,
      estimatedExitDate: estimatedExitDate.toISOString().split('T')[0],
    };
  } catch (error) {
    console.error('Error calculando proyección de salida:', error);
    return null;
  }
}

/**
 * 4️⃣ OBTENER REPORTE DE GANANCIA DE PESO
 *
 * Calcula la Ganancia Diaria de Peso (GDP) de un lote
 * Compara pesajes consecutivos para análisis de nutrición
 *
 * GDP = (Peso Actual - Peso Anterior) / Días transcurridos
 *
 * Criterios:
 * - > 0.5 kg/día: EXCELLENT (Buen trabajo)
 * - 0.3-0.5 kg/día: GOOD (Aceptable)
 * - < 0.3 kg/día: ALERT (Problema nutricional)
 *
 * @param herdId ID del lote
 * @returns Reporte de ganancia de peso
 *
 * @example
 * const report = await getWeightGainReport("herd123");
 * if (report.gdpStatus === "ALERT") {
 *   console.log("⚠️ Revisar nutrición del lote");
 * }
 */
export async function getWeightGainReport(herdId: string): Promise<WeightGainReport> {
  const db = await getDb();

  try {
    // Obtener datos del lote
    const herd = await db.herds.findOne(herdId).exec();
    const herdData = herd?.toJSON();

    if (!herdData) {
      return {
        herdId,
        herdName: 'Unknown',
        currentWeight: 0,
        previousWeight: null,
        weightDifference: null,
        daysSinceLast: null,
        dailyWeightGain: null,
        gdpStatus: 'UNKNOWN',
        lastWeighingDate: null,
        trend: 'UNKNOWN',
      };
    }

    // Obtener últimos 2 pesajes
    const weighings = await db.weighings
      .find({ selector: { herdId } })
      .sort({ weighed_at: 'desc' })
      .limit(2)
      .exec();

    if (weighings.length === 0) {
      return {
        herdId,
        herdName: herdData.name,
        currentWeight: herdData.currentWeight || 0,
        previousWeight: null,
        weightDifference: null,
        daysSinceLast: null,
        dailyWeightGain: null,
        gdpStatus: 'UNKNOWN',
        lastWeighingDate: null,
        trend: 'UNKNOWN',
      };
    }

    const currentWeighing = weighings[0].toJSON();
    const currentWeight = currentWeighing.totalWeight || 0;
    const lastWeighingDate = currentWeighing.weighed_at;

    // Si no hay pesaje anterior
    if (weighings.length < 2) {
      return {
        herdId,
        herdName: herdData.name,
        currentWeight,
        previousWeight: null,
        weightDifference: null,
        daysSinceLast: null,
        dailyWeightGain: null,
        gdpStatus: 'UNKNOWN',
        lastWeighingDate,
        trend: 'UNKNOWN',
      };
    }

    // Calcular GDP
    const previousWeighing = weighings[1].toJSON();
    const previousWeight = previousWeighing.totalWeight || 0;
    const weightDifference = currentWeight - previousWeight;

    const daysSinceLast = calculateRestDays(
      previousWeighing.weighed_at,
      currentWeighing.weighed_at
    );
    const dailyWeightGain =
      daysSinceLast > 0 ? Math.round((weightDifference / daysSinceLast) * 100) / 100 : 0;

    // Determinar estado
    let gdpStatus: 'EXCELLENT' | 'GOOD' | 'ALERT' | 'UNKNOWN';
    if (dailyWeightGain > 0.5) {
      gdpStatus = 'EXCELLENT';
    } else if (dailyWeightGain >= 0.3) {
      gdpStatus = 'GOOD';
    } else {
      gdpStatus = 'ALERT';
    }

    // Determinar tendencia
    let trend: 'UP' | 'DOWN' | 'STABLE' | 'UNKNOWN';
    if (weightDifference > 5) {
      trend = 'UP';
    } else if (weightDifference < -5) {
      trend = 'DOWN';
    } else {
      trend = 'STABLE';
    }

    return {
      herdId,
      herdName: herdData.name,
      currentWeight,
      previousWeight,
      weightDifference,
      daysSinceLast,
      dailyWeightGain,
      gdpStatus,
      lastWeighingDate,
      trend,
    };
  } catch (error) {
    console.error('Error calculando ganancia de peso:', error);
    return {
      herdId,
      herdName: 'Unknown',
      currentWeight: 0,
      previousWeight: null,
      weightDifference: null,
      daysSinceLast: null,
      dailyWeightGain: null,
      gdpStatus: 'UNKNOWN',
      lastWeighingDate: null,
      trend: 'UNKNOWN',
    };
  }
}

/**
 * Obtener reportes de ganancia de peso para todos los lotes
 * Útil para dashboard general
 *
 * @returns Array de reportes de ganancia de peso
 */
export async function getAllWeightGainReports(): Promise<WeightGainReport[]> {
  const db = await getDb();

  try {
    const herds = await db.herds.find({ selector: { status: { $ne: 'ARCHIVED' } } }).exec();

    const reports = await Promise.all(
      herds.map((herd) => {
        const herdData = herd.toJSON();
        return getWeightGainReport(herdData.id);
      })
    );

    return reports;
  } catch (error) {
    console.error('Error calculando reportes de ganancia de peso:', error);
    return [];
  }
}
