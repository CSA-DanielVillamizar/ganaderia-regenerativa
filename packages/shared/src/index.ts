import { z } from 'zod';

// ============= Enums y constantes =============

export enum Role {
  ADMIN = 'ADMIN',
  TECHNICIAN = 'TECHNICIAN',
  MANAGER = 'MANAGER',
  VIEWER = 'VIEWER',
}

export enum AnimalGender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
}

export enum CycleStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  PLANNED = 'PLANNED',
}

export enum MovementType {
  ENTRY = 'ENTRY',
  EXIT = 'EXIT',
}

export enum WeighingMethod {
  SCALE = 'SCALE',
  TAPE = 'TAPE',
}

export enum Season {
  INVIERNO = 'INVIERNO',
  VERANO = 'VERANO',
}

// ============= DTOs - Auth =============

export const LoginDtoSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
});

export type LoginDto = z.infer<typeof LoginDtoSchema>;

export const AuthResponseSchema = z.object({
  accessToken: z.string(),
  user: z.object({
    id: z.string(),
    email: z.string(),
    name: z.string(),
    role: z.nativeEnum(Role),
  }),
});

export type AuthResponse = z.infer<typeof AuthResponseSchema>;

// ============= DTOs - Fincas =============

export const CreateFarmDtoSchema = z.object({
  name: z.string().min(1, 'Nombre requerido'),
  location: z.string().optional(),
  hectares: z.coerce.number().positive('Hectáreas debe ser positivo').optional(),
});

export type CreateFarmDto = z.infer<typeof CreateFarmDtoSchema>;

export const FarmResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  location: z.string().nullable(),
  hectares: z.number().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type FarmResponse = z.infer<typeof FarmResponseSchema>;

// ============= DTOs - Potreros =============

export const CreatePaddockDtoSchema = z.object({
  farmId: z.string(),
  name: z.string().min(1, 'Nombre requerido'),
  hectares: z.coerce.number().positive('Hectáreas debe ser positivo'),
  description: z.string().optional(),
  pastureType: z.string().optional(),
  minRestDays: z.coerce.number().int().positive('Días de descanso debe ser positivo').optional(),
});

export type CreatePaddockDto = z.infer<typeof CreatePaddockDtoSchema>;

export const PaddockResponseSchema = z.object({
  id: z.string(),
  farmId: z.string(),
  name: z.string(),
  hectares: z.number(),
  description: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type PaddockResponse = z.infer<typeof PaddockResponseSchema>;

// ============= DTOs - Lotes =============

export const CreateHerdDtoSchema = z.object({
  farmId: z.string(),
  name: z.string().min(1, 'Nombre requerido'),
  initialWeight: z.coerce.number().positive('Peso inicial debe ser positivo'),
  animalCount: z.coerce.number().int().positive('Cantidad debe ser positivo'),
  description: z.string().optional(),
});

export type CreateHerdDto = z.infer<typeof CreateHerdDtoSchema>;

export const HerdResponseSchema = z.object({
  id: z.string(),
  farmId: z.string(),
  name: z.string(),
  initialWeight: z.number(),
  currentWeight: z.number().nullable(),
  animalCount: z.number(),
  description: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type HerdResponse = z.infer<typeof HerdResponseSchema>;

// ============= DTOs - Pesajes =============

export const CreateWeighingDtoSchema = z.object({
  herdId: z.string(),
  weight: z.coerce.number().positive('Peso debe ser positivo'),
  animalCount: z.coerce.number().int().positive('Cantidad debe ser positivo'),
  notes: z.string().optional(),
  method: z.nativeEnum(WeighingMethod).optional(),
  chestGirthCm: z.coerce.number().positive('Perímetro torácico debe ser positivo').optional(),
  bodyLengthCm: z.coerce.number().positive('Longitud corporal debe ser positivo').optional(),
  estimatedWeightKg: z.coerce.number().positive().optional(),
  realWeightKg: z.coerce.number().positive().optional(),
  errorMarginPercent: z.coerce.number().min(0).max(100).optional(),
});

export type CreateWeighingDto = z.infer<typeof CreateWeighingDtoSchema>;

export const WeighingResponseSchema = z.object({
  id: z.string(),
  herdId: z.string(),
  weight: z.number(),
  animalCount: z.number(),
  weightPerAnimal: z.number(),
  notes: z.string().nullable(),
  recordedAt: z.string(),
  createdAt: z.string(),
});

export type WeighingResponse = z.infer<typeof WeighingResponseSchema>;

// P0.6 - Historial de pesajes con paginación
export const WeighingHistoryItemSchema = z.object({
  id: z.string(),
  weight: z.number(), // Peso total del lote en kg
  animalCount: z.number(), // Cantidad de animales pesados
  avgWeightPerAnimal: z.number(), // Promedio = weight / animalCount
  uaValue: z.number(), // Unidades Animal calculadas
  notes: z.string().nullable(),
  recordedAt: z.string(), // ISO date
  method: z.string(), // SCALE | TAPE
  createdAt: z.string(),
});

export type WeighingHistoryItem = z.infer<typeof WeighingHistoryItemSchema>;

export const WeighingHistoryResponseSchema = z.object({
  herdId: z.string(),
  herdName: z.string(),
  currentWeight: z.number().nullable(), // Peso actual promedio por animal
  currentUA: z.number().nullable(), // UA actual del hato
  totalCount: z.number(), // Total de pesajes (sin filtros)
  weighings: z.array(WeighingHistoryItemSchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    totalPages: z.number(),
    hasMore: z.boolean(),
  }),
});

export type WeighingHistoryResponse = z.infer<typeof WeighingHistoryResponseSchema>;

// ============= DTOs - Movimientos =============

/**
 * DTO para crear un movimiento (entrada a potrero)
 * Validaciones:
 * - herdId y paddockId son UUIDs válidos
 * - entryDate debe ser ISO datetime
 * - exitDate (si existe) debe ser >= entryDate
 * - type debe ser ENTRY o EXIT
 */
export const CreateMovementDtoSchema = z
  .object({
    herdId: z.string().uuid('herdId debe ser un UUID válido'),
    paddockId: z.string().uuid('paddockId debe ser un UUID válido'),
    cycleId: z.string().uuid('cycleId debe ser un UUID válido').optional(),
    type: z.nativeEnum(MovementType),
    entryDate: z
      .string()
      .datetime('entryDate debe ser una fecha ISO válida')
      .refine(
        (date) => new Date(date) <= new Date(),
        'entryDate no puede ser en el futuro',
      ),
    exitDate: z
      .string()
      .datetime('exitDate debe ser una fecha ISO válida')
      .optional(),
    notes: z.string().max(500, 'Máximo 500 caracteres').optional(),
  })
  .refine(
    (data) => {
      if (!data.exitDate) return true;
      const entry = new Date(data.entryDate);
      const exit = new Date(data.exitDate);
      return exit >= entry;
    },
    {
      message: 'exitDate debe ser mayor o igual a entryDate',
      path: ['exitDate'],
    },
  );

export type CreateMovementDto = z.infer<typeof CreateMovementDtoSchema>;

/**
 * DTO para cerrar un movimiento
 * Validaciones:
 * - movementId es un UUID válido
 * - exitDate debe ser >= entryDate
 */
export const CloseMovementDtoSchema = z.object({
  exitDate: z.string().datetime('exitDate debe ser una fecha ISO válida'),
  notes: z.string().max(500, 'Máximo 500 caracteres').optional(),
});

export type CloseMovementDto = z.infer<typeof CloseMovementDtoSchema>;

export const MovementResponseSchema = z.object({
  id: z.string(),
  herdId: z.string(),
  paddockId: z.string(),
  cycleId: z.string().nullable(),
  type: z.nativeEnum(MovementType),
  status: z.string(), // ACTIVE, CLOSED
  entryDate: z.string(),
  exitDate: z.string().nullable(),
  daysOccupied: z.number().nullable(),
  notes: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type MovementResponse = z.infer<typeof MovementResponseSchema>;

// ============= Enum para tipo de medición de aforo =============

export enum ForageMeasurementType {
  GREEN = 'GREEN', // Forraje verde (fresco)
  DRY_MATTER = 'DRY_MATTER', // Materia seca (MS)
}

// ============= DTOs - Aforos =============

/**
 * DTO para crear una muestra de aforo (medición de forraje disponible)
 * Validaciones:
 * - paddockId debe ser UUID válido
 * - kgPerHectare y dryMatterPercent deben ser positivos
 * - sampleDate debe ser ISO datetime
 * - si measurementType es GREEN, dryMatterPercent es requerido (0-100%)
 * - si measurementType es DRY_MATTER, los valores son de MS directo
 * - utilizationPercent debe estar entre 0-100
 */
export const CreateForageSampleDtoSchema = z
  .object({
    paddockId: z.string().uuid('paddockId debe ser un UUID válido'),
    kgPerHectare: z.coerce
      .number()
      .positive('kg/ha debe ser positivo'),
    measurementType: z
      .nativeEnum(ForageMeasurementType)
      .default(ForageMeasurementType.GREEN),
    dryMatterPercent: z.coerce
      .number()
      .min(0, '% MS debe estar entre 0-100')
      .max(100, '% MS debe estar entre 0-100')
      .optional(),
    utilizationPercent: z.coerce
      .number()
      .min(0, '% utilización debe estar entre 0-100')
      .max(100, '% utilización debe estar entre 0-100')
      .default(70),
    sampleDate: z.string().datetime('sampleDate debe ser una fecha ISO válida'),
    notes: z.string().max(500, 'Máximo 500 caracteres').optional(),
    // Legacy fields (deprecated, pero soportados para compatibilidad)
    frameAreaM2: z.coerce
      .number()
      .positive('Área del marco debe ser positivo')
      .optional(),
    freshWeightKg: z.coerce
      .number()
      .positive('Peso fresco debe ser positivo')
      .optional(),
    kgMSPerHa: z.coerce.number().positive().optional(),
  })
  .refine(
    (data) => {
      if (
        data.measurementType === ForageMeasurementType.GREEN &&
        !data.dryMatterPercent
      ) {
        return false;
      }
      return true;
    },
    {
      message: 'Si la medición es GREEN, dryMatterPercent es requerido',
      path: ['dryMatterPercent'],
    },
  );

export type CreateForageSampleDto = z.infer<typeof CreateForageSampleDtoSchema>;

export const ForageSampleResponseSchema = z.object({
  id: z.string(),
  paddockId: z.string(),
  kgPerHectare: z.number(),
  measurementType: z.nativeEnum(ForageMeasurementType),
  dryMatterPercent: z.number().nullable(),
  utilizationPercent: z.number(),
  availableForageKgMS: z.number().nullable(),
  sampleDate: z.string(),
  notes: z.string().nullable(),
  createdAt: z.string(),
});

export type ForageSampleResponse = z.infer<typeof ForageSampleResponseSchema>;

/**
 * DTO para consultar forraje disponible en un potrero
 * Respuesta incluye cálculos de materia seca total disponible
 */
export const AvailableForageResponseSchema = z.object({
  paddockId: z.string().uuid(),
  paddockName: z.string(),
  paddockHectares: z.number(),
  forageSampleId: z.string().uuid(),
  measurementType: z.nativeEnum(ForageMeasurementType),
  kgPerHectare: z.number(),
  dryMatterPercent: z.number().nullable(),
  utilizationPercent: z.number(),
  availableForageKgMS: z.number(), // kg MS por hectárea
  totalAvailableKgMS: z.number(), // availableForageKgMS × paddockHectares
  sampledAt: z.string().datetime(),
  remainingDaysOfUse: z.number().nullable().optional(), // Calculado si se proporciona demanda diaria
});

export type AvailableForageResponse = z.infer<typeof AvailableForageResponseSchema>;

/**
 * DTO para obtener días recomendados de pastoreo
 * Respuesta incluye cálculos basados en forraje disponible y consumo del hato
 */
export const RecommendedDaysResponseSchema = z.object({
  paddockId: z.string().uuid(),
  paddockName: z.string(),
  paddockHectares: z.number(),
  availableForageKgMS: z.number(), // kg MS por hectárea
  totalAvailableKgMS: z.number(), // Total en el potrero
  totalHerdWeightKg: z.number(), // Peso total del hato
  intakePercentDaily: z.number(), // % consumo diario (default 2.0%)
  dailyConsumptionKgMS: z.number(), // Consumo diario en kg MS
  recommendedDays: z.number(), // Días que puede pastar
  rotationAdvice: z.string(), // Consejo textual
});

export type RecommendedDaysResponse = z.infer<typeof RecommendedDaysResponseSchema>;

// ============= DTOs - Dashboard =============

export const DashboardSummaryResponseSchema = z.object({
  farmId: z.string(),
  totalHerds: z.number(),
  totalAnimals: z.number(),
  totalWeight: z.number(),
  totalUA: z.number(),
  activePaddocks: z.number(),
  averageWeightPerAnimal: z.number(),
  uaPerHectare: z.number().optional(),
  avgOccupancyDays: z.number().optional(),
  paddocksNeedingRest: z.number().optional(),
  alerts: z.array(z.object({
    type: z.enum(['OVERGRAZING', 'INSUFFICIENT_REST', 'MISSING_DATA']),
    severity: z.enum(['high', 'medium', 'low']),
    message: z.string(),
    paddockName: z.string().optional(),
    herdName: z.string().optional(),
    daysOccupied: z.number().optional(),
    restDays: z.number().optional(),
    minRestDays: z.number().optional(),
  })).optional(),
  paddockStatuses: z.array(z.object({
    paddockId: z.string(),
    paddockName: z.string(),
    status: z.enum(['OCCUPIED', 'RESTING', 'READY']),
    restDays: z.number(),
    minRestDays: z.number().nullable(),
    herdName: z.string().optional(),
    daysOccupied: z.number().optional(),
  })).optional(),
});

export type DashboardSummaryResponse = z.infer<typeof DashboardSummaryResponseSchema>;

// P0.7 - Decision Dashboard: readyPaddocks, warnings, recommendedNextPaddock
export const DecisionTodayResponseSchema = z.object({
  farmId: z.string(),
  farmName: z.string(),
  timestamp: z.string(), // ISO date
  confidenceLevel: z.enum(['HIGH', 'MEDIUM', 'LOW']), // Based on data availability
  explainability: z.array(z.object({
    reason: z.string(),
    source: z.enum(['FORAGE_DATA', 'WEIGHING_DATA', 'MOVEMENT_HISTORY', 'PARAMETER', 'DEFAULT']),
    weight: z.number(), // 1-5 importance weight
  })),
  actionChecklist: z.array(z.object({
    id: z.string(),
    action: z.string(),
    priority: z.enum(['URGENT', 'HIGH', 'MEDIUM', 'LOW']),
    status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']),
    context: z.string().optional(), // e.g., "Potrero X", "Hato Y"
  })),
  readyPaddocks: z.array(z.object({
    paddockId: z.string(),
    paddockName: z.string(),
    hectares: z.number(),
    daysRested: z.number(),
    minRestDays: z.number(),
    availableKgMS: z.number().nullable(),
    status: z.enum(['READY', 'RESTING']),
  })),
  warnings: z.array(z.object({
    type: z.enum(['LOW_FORAGE', 'INSUFFICIENT_REST', 'OVERDUE_ROTATION']),
    severity: z.enum(['high', 'medium', 'low']),
    message: z.string(),
    paddockId: z.string().optional(),
    paddockName: z.string().optional(),
    herdName: z.string().optional(),
    recommendedDays: z.number().optional(),
    daysRested: z.number().optional(),
  })),
  recommendedNextPaddock: z.object({
    paddockId: z.string(),
    paddockName: z.string(),
    daysRested: z.number(),
    availableKgMS: z.number().nullable(),
    reason: z.string(), // Por qué es recomendado
  }).nullable(),
});

export type DecisionTodayResponse = z.infer<typeof DecisionTodayResponseSchema>;

export const DashboardTrendSchema = z.object({
  date: z.string(),
  weight: z.number(),
  ua: z.number(),
  gain: z.number(),
});

export type DashboardTrend = z.infer<typeof DashboardTrendSchema>;

// ============= Contratos Globales =============

/**
 * Contrato de error estandarizado para todas las respuestas de error.
 */
export const ErrorResponseSchema = z.object({
  statusCode: z.number(),
  message: z.string().describe('Mensaje amigable para el usuario'),
  error: z.string().describe('Código o categoría del error'),
  path: z.string(),
  timestamp: z.string(),
  traceId: z.string().describe('UUID para rastreo de errores en logs'),
});

export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;

/**
 * Respuesta paginada genérica para listados.
 */
export const PaginatedResponseSchema = z.object({
  data: z.array(z.unknown()),
  pagination: z.object({
    total: z.number(),
    page: z.number(),
    limit: z.number(),
    totalPages: z.number(),
  }),
});

export type PaginatedResponse<T = unknown> = {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

/**
 * Response para listado de movimientos con paginación.
 */
export const ListMovementsResponseSchema = z.object({
  data: z.array(MovementResponseSchema),
  pagination: z.object({
    total: z.number(),
    page: z.number(),
    limit: z.number(),
    totalPages: z.number(),
  }),
});

export type ListMovementsResponse = PaginatedResponse<MovementResponse>;
/**
 * Configuración de temporada con factor multiplicador para días de descanso.
 */
export interface SeasonConfig {
  name: Season;
  factor: number;
  description: string;
}

/**
 * Alerta de sobrepastoreo con severidad.
 */
export const OvergrazingAlertSchema = z.object({
  id: z.string(),
  herdId: z.string(),
  herdName: z.string(),
  paddockId: z.string(),
  paddockName: z.string(),
  daysOccupied: z.number(),
  maxAllowedDays: z.number(),
  exceedDays: z.number(),
  entryDate: z.date(),
  severity: z.enum(['MEDIUM', 'HIGH', 'CRITICAL']),
});

export type OvergrazingAlert = z.infer<typeof OvergrazingAlertSchema>;

export const OvergrazingAlertsResponseSchema = z.object({
  data: z.array(OvergrazingAlertSchema),
  totalAlerts: z.number(),
  criticalAlerts: z.number(),
  highAlerts: z.number(),
});

export type OvergrazingAlertsResponse = z.infer<typeof OvergrazingAlertsResponseSchema>;