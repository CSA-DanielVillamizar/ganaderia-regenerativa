/**
 * Motor de Cálculos Agronómicos - Metodología Voisin
 *
 * Implementa las fórmulas fundamentales para rotación regenerativa:
 * - Unidades Animales (UA)
 * - Tiempo de Reposo (Descanso)
 * - Balance Oferta/Demanda Forraje
 * - Carga Instantánea
 *
 * Capa: Domain Layer (Business Logic)
 * Patrón: Pure Functions (sin side effects)
 */

/**
 * Constantes agronómicas basadas en investigación Voisin/Savory
 */
export const AGRONOMY_CONSTANTS = {
  /** 1 UA = 450 kg de peso vivo (estándar internacional) */
  UA_REFERENCE_WEIGHT_KG: 450,

  /** Consumo diario de MS por UA (kg/día) */
  DAILY_DM_INTAKE_PER_UA_KG: 12,

  /** Consumo diario como % del peso vivo (rango 2.5-3.5%) */
  DAILY_INTAKE_PERCENT_OF_BW: 3.0,

  /** Punto óptimo de reposo según Voisin (días) */
  OPTIMAL_REST_DAYS: 45,

  /** Mínimo descanso para evitar daño permanente */
  MINIMUM_REST_DAYS: 30,

  /** Máximo descanso antes de envejecimiento excesivo */
  MAXIMUM_REST_DAYS: 60,

  /** Eficiencia de cosecha (% del pasto que los animales consumen) */
  HARVEST_EFFICIENCY_PERCENT: 60,

  /** Días máximos de ocupación recomendados (alta densidad corta) */
  MAX_OCCUPATION_DAYS: 3,
} as const;

/**
 * Configuración personalizable por finca
 */
export interface AgronomyConfig {
  uaReferenceWeightKg?: number;
  dailyDMIntakePerUaKg?: number;
  optimalRestDays?: number;
  minimumRestDays?: number;
  harvestEfficiencyPercent?: number;
}

/**
 * Resultado del cálculo de balance forrajero
 */
export interface ForageBalance {
  /** Oferta total disponible (kg MS) */
  supplyKgMS: number;

  /** Demanda total del lote (kg MS) */
  demandKgMS: number;

  /** Balance (positivo = excedente, negativo = déficit) */
  balanceKgMS: number;

  /** Días reales de ocupación posibles */
  daysAvailable: number;

  /** Estado del balance */
  status: 'SURPLUS' | 'ADEQUATE' | 'DEFICIT';

  /** Carga instantánea (UA/ha) */
  instantaneousStockingRate: number;
}

/**
 * Estado de descanso del potrero
 */
export interface RestStatus {
  /** Días transcurridos desde última salida */
  daysSinceExit: number;

  /** Estado del descanso */
  status: 'INSUFFICIENT' | 'ADEQUATE' | 'OPTIMAL' | 'EXCESSIVE';

  /** Progreso hacia óptimo (0-100%) */
  progressPercent: number;

  /** Mensaje para el usuario */
  message: string;

  /** Color del indicador */
  color: 'red' | 'yellow' | 'green' | 'orange';
}

/**
 * 1️⃣ CÁLCULO DE UNIDADES ANIMALES (UA)
 *
 * Fórmula: UA = Peso Total (kg) / Peso Referencia (450 kg)
 *
 * Basado en estándar internacional de ganadería
 * Permite comparar diferentes categorías de animales
 *
 * @param totalWeightKg Peso total del lote en kg
 * @param config Configuración opcional (default: 450 kg/UA)
 * @returns Total de Unidades Animales (redondeado a 2 decimales)
 *
 * @example
 * // Lote de 20 novillos de 400 kg cada uno
 * const ua = calculateUA(8000); // 17.78 UA
 */
export function calculateUA(totalWeightKg: number, config: AgronomyConfig = {}): number {
  const referenceWeight = config.uaReferenceWeightKg ?? AGRONOMY_CONSTANTS.UA_REFERENCE_WEIGHT_KG;

  if (totalWeightKg <= 0 || referenceWeight <= 0) {
    return 0;
  }

  const ua = totalWeightKg / referenceWeight;
  return Math.round(ua * 100) / 100;
}

/**
 * 2️⃣ CÁLCULO DE DÍAS DE DESCANSO (TIEMPO DE REPOSO)
 *
 * Calcula días transcurridos desde la última salida del potrero
 * Crítico para respetar la "Llamarada de Crecimiento" (Voisin)
 *
 * @param lastExitDate Fecha de última salida del potrero (ISO string o Date)
 * @param currentDate Fecha actual (default: hoy)
 * @returns Días de descanso (número entero)
 *
 * @example
 * const days = calculateRestDays('2025-01-01', '2025-02-15'); // 45 días
 */
export function calculateRestDays(
  lastExitDate: string | Date,
  currentDate: string | Date = new Date()
): number {
  const exitDate = typeof lastExitDate === 'string' ? new Date(lastExitDate) : lastExitDate;
  const now = typeof currentDate === 'string' ? new Date(currentDate) : currentDate;

  const diffMs = now.getTime() - exitDate.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  return Math.max(0, diffDays);
}

/**
 * 3️⃣ EVALUACIÓN DEL ESTADO DE DESCANSO
 *
 * Determina si el descanso es suficiente según Voisin
 *
 * Criterios:
 * - < 30 días: INSUFICIENTE (daño permanente)
 * - 30-45 días: ADECUADO (mínimo aceptable)
 * - 45-60 días: ÓPTIMO (punto de cosecha ideal)
 * - > 60 días: EXCESIVO (envejecimiento del pasto)
 *
 * @param daysSinceExit Días desde última salida
 * @param config Configuración personalizada
 * @returns Estado completo del descanso
 *
 * @example
 * const status = evaluateRestStatus(48);
 * // { status: 'OPTIMAL', message: 'Descanso óptimo...', color: 'green' }
 */
export function evaluateRestStatus(daysSinceExit: number, config: AgronomyConfig = {}): RestStatus {
  const minRest = config.minimumRestDays ?? AGRONOMY_CONSTANTS.MINIMUM_REST_DAYS;
  const optimalRest = config.optimalRestDays ?? AGRONOMY_CONSTANTS.OPTIMAL_REST_DAYS;
  const maxRest = AGRONOMY_CONSTANTS.MAXIMUM_REST_DAYS;

  // INSUFICIENTE: < 30 días
  if (daysSinceExit < minRest) {
    const progress = Math.round((daysSinceExit / minRest) * 100);
    return {
      daysSinceExit,
      status: 'INSUFFICIENT',
      progressPercent: progress,
      message:
        `⛔ ALERTA CRÍTICA: Solo ${daysSinceExit} días de descanso (mínimo: ${minRest}). ` +
        `Romperás la llamarada de crecimiento y dañarás el potrero permanentemente. ` +
        `Espera ${minRest - daysSinceExit} días más.`,
      color: 'red',
    };
  }

  // ADECUADO: 30-45 días
  if (daysSinceExit < optimalRest) {
    const progress = Math.round((daysSinceExit / optimalRest) * 100);
    return {
      daysSinceExit,
      status: 'ADEQUATE',
      progressPercent: progress,
      message:
        `🟡 Descanso aceptable (${daysSinceExit} días). ` +
        `Puedes entrar, pero idealmente espera ${optimalRest - daysSinceExit} días más ` +
        `para máxima productividad.`,
      color: 'yellow',
    };
  }

  // ÓPTIMO: 45-60 días
  if (daysSinceExit <= maxRest) {
    return {
      daysSinceExit,
      status: 'OPTIMAL',
      progressPercent: 100,
      message:
        `✅ PUNTO ÓPTIMO DE COSECHA (${daysSinceExit} días). ` +
        `El pasto está en su máxima calidad nutricional y volumen. ` +
        `¡Momento ideal para entrar el lote!`,
      color: 'green',
    };
  }

  // EXCESIVO: > 60 días
  const daysOver = daysSinceExit - maxRest;
  return {
    daysSinceExit,
    status: 'EXCESSIVE',
    progressPercent: 100,
    message:
      `🟠 Descanso prolongado (${daysSinceExit} días, +${daysOver} sobre óptimo). ` +
      `El pasto puede estar envejeciendo (más fibra, menos proteína). ` +
      `Considera entrar pronto o hacer un corte de limpieza.`,
    color: 'orange',
  };
}

/**
 * 4️⃣ CÁLCULO DE DEMANDA DE FORRAJE
 *
 * Estima cuánto forraje (MS) consumirá el lote durante la ocupación
 *
 * @param totalUA Unidades Animales totales
 * @param occupationDays Días planeados de ocupación
 * @param config Configuración personalizada
 * @returns Demanda total en kg de Materia Seca
 *
 * @example
 * // 10 UA por 2 días = 240 kg MS
 * const demand = calculateForageDemand(10, 2); // 240
 */
export function calculateForageDemand(
  totalUA: number,
  occupationDays: number,
  config: AgronomyConfig = {}
): number {
  const dailyIntake = config.dailyDMIntakePerUaKg ?? AGRONOMY_CONSTANTS.DAILY_DM_INTAKE_PER_UA_KG;

  if (totalUA <= 0 || occupationDays <= 0) {
    return 0;
  }

  const demandKgMS = totalUA * dailyIntake * occupationDays;
  return Math.round(demandKgMS);
}

/**
 * 5️⃣ CÁLCULO DE OFERTA DE FORRAJE (DISPONIBLE)
 *
 * Estima forraje disponible basándose en aforo
 *
 * @param kgMSPerHa Kg de materia seca por hectárea (aforo)
 * @param paddockHectares Área del potrero en hectáreas
 * @param config Configuración
 * @returns Oferta disponible en kg MS
 *
 * @example
 * // Aforo: 2500 kg MS/ha en 5 ha con 60% aprovechamiento
 * const supply = calculateForageSupply(2500, 5); // 7,500 kg MS
 */
export function calculateForageSupply(
  kgMSPerHa: number,
  paddockHectares: number,
  config: AgronomyConfig = {}
): number {
  const efficiency =
    (config.harvestEfficiencyPercent ?? AGRONOMY_CONSTANTS.HARVEST_EFFICIENCY_PERCENT) / 100;

  if (kgMSPerHa <= 0 || paddockHectares <= 0) {
    return 0;
  }

  const supplyKgMS = kgMSPerHa * paddockHectares * efficiency;
  return Math.round(supplyKgMS);
}

/**
 * 6️⃣ BALANCE FORRAJERO (OFERTA vs DEMANDA)
 *
 * Determina si hay suficiente pasto para el lote
 *
 * @param supplyKgMS Oferta disponible (kg MS)
 * @param totalUA Unidades Animales del lote
 * @param paddockHectares Área del potrero
 * @param plannedOccupationDays Días planeados (default: 2)
 * @param config Configuración
 * @returns Balance completo con recomendaciones
 *
 * @example
 * const balance = calculateForageBalance(7500, 10, 5, 3);
 * // { balanceKgMS: 7140, daysAvailable: 62, status: 'SURPLUS', ... }
 */
export function calculateForageBalance(
  supplyKgMS: number,
  totalUA: number,
  paddockHectares: number,
  plannedOccupationDays: number = 2,
  config: AgronomyConfig = {}
): ForageBalance {
  const dailyIntake = config.dailyDMIntakePerUaKg ?? AGRONOMY_CONSTANTS.DAILY_DM_INTAKE_PER_UA_KG;

  const demandKgMS = calculateForageDemand(totalUA, plannedOccupationDays, config);
  const balanceKgMS = supplyKgMS - demandKgMS;

  const daysAvailable =
    totalUA > 0 && dailyIntake > 0 ? Math.floor(supplyKgMS / (totalUA * dailyIntake)) : 0;

  const instantaneousStockingRate =
    paddockHectares > 0 ? Math.round((totalUA / paddockHectares) * 100) / 100 : 0;

  let status: 'SURPLUS' | 'ADEQUATE' | 'DEFICIT';
  if (balanceKgMS < 0) {
    status = 'DEFICIT';
  } else if (balanceKgMS < demandKgMS * 0.2) {
    status = 'ADEQUATE';
  } else {
    status = 'SURPLUS';
  }

  return {
    supplyKgMS,
    demandKgMS,
    balanceKgMS,
    daysAvailable,
    status,
    instantaneousStockingRate,
  };
}

/**
 * 7️⃣ VALIDAR MOVIMIENTO SEGURO
 *
 * Valida si un movimiento es seguro según criterios Voisin
 *
 * @param restDays Días de descanso del potrero
 * @param balance Balance forrajero
 * @param config Configuración
 * @returns true si es seguro, false si viola principios regenerativos
 *
 * @example
 * const isSafe = validateMovementSafety(48, balance);
 * if (!isSafe) {
 *   alert('Movimiento rechazado por criterios regenerativos');
 * }
 */
export function validateMovementSafety(
  restDays: number,
  balance: ForageBalance,
  config: AgronomyConfig = {}
): { safe: boolean; reason?: string } {
  const minRest = config.minimumRestDays ?? AGRONOMY_CONSTANTS.MINIMUM_REST_DAYS;

  if (restDays < minRest) {
    return {
      safe: false,
      reason:
        `Descanso insuficiente (${restDays}/${minRest} días). ` +
        `Riesgo de daño permanente al potrero.`,
    };
  }

  if (balance.status === 'DEFICIT' && balance.balanceKgMS < -500) {
    return {
      safe: false,
      reason:
        `Déficit forrajero crítico (${balance.balanceKgMS} kg MS). ` +
        `No hay suficiente pasto para el lote.`,
    };
  }

  if (balance.instantaneousStockingRate > 10) {
    return {
      safe: false,
      reason:
        `Carga instantánea excesiva (${balance.instantaneousStockingRate} UA/ha). ` +
        `Riesgo de compactación severa del suelo.`,
    };
  }

  return { safe: true };
}

/**
 * 8️⃣ CALCULAR DÍAS ÓPTIMOS DE OCUPACIÓN
 *
 * Sugiere días ideales basándose en Voisin (Alta Densidad Corta)
 *
 * @param supplyKgMS Oferta disponible
 * @param totalUA Unidades Animales
 * @returns Días óptimos (max 3 según Voisin)
 *
 * @example
 * const days = calculateOptimalOccupationDays(7500, 10);
 * // Recomendación: 2 días (alta densidad, corta ocupación)
 */
export function calculateOptimalOccupationDays(supplyKgMS: number, totalUA: number): number {
  const dailyIntake = AGRONOMY_CONSTANTS.DAILY_DM_INTAKE_PER_UA_KG;
  const maxDays = AGRONOMY_CONSTANTS.MAX_OCCUPATION_DAYS;

  if (totalUA <= 0) return 0;

  const theoreticalDays = Math.floor(supplyKgMS / (totalUA * dailyIntake));

  return Math.min(theoreticalDays, maxDays);
}
