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

// ============= DTOs - Movimientos =============

export const CreateMovementDtoSchema = z.object({
  herdId: z.string(),
  paddockId: z.string(),
  cycleId: z.string().optional(),
  type: z.nativeEnum(MovementType),
  entryDate: z.string().datetime(),
  exitDate: z.string().datetime().optional(),
  notes: z.string().optional(),
});

export type CreateMovementDto = z.infer<typeof CreateMovementDtoSchema>;

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

// ============= DTOs - Aforos =============

export const CreateForageSampleDtoSchema = z.object({
  paddockId: z.string(),
  kgPerHectare: z.number().positive('kg/ha debe ser positivo'),
  dryMatter: z.number().positive('MS debe ser positivo'),
  sampleDate: z.string().datetime(),
  notes: z.string().optional(),
  frameAreaM2: z.number().positive('Área del marco debe ser positivo').optional(),
  freshWeightKg: z.number().positive('Peso fresco debe ser positivo').optional(),
  dryMatterPercent: z.number().min(0).max(100).optional(),
  utilizationPercent: z.number().min(0).max(100).optional(),
  kgMSPerHa: z.number().positive().optional(),
});

export type CreateForageSampleDto = z.infer<typeof CreateForageSampleDtoSchema>;

export const ForageSampleResponseSchema = z.object({
  id: z.string(),
  paddockId: z.string(),
  kgPerHectare: z.number(),
  dryMatter: z.number(),
  sampleDate: z.string(),
  notes: z.string().nullable(),
  createdAt: z.string(),
});

export type ForageSampleResponse = z.infer<typeof ForageSampleResponseSchema>;

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
  alerts: z
    .array(
      z.object({
        type: z.enum(['OVERGRAZING', 'INSUFFICIENT_REST', 'MISSING_DATA']),
        severity: z.enum(['high', 'medium', 'low']),
        message: z.string(),
        paddockName: z.string().optional(),
        herdName: z.string().optional(),
        daysOccupied: z.number().optional(),
        restDays: z.number().optional(),
        minRestDays: z.number().optional(),
      })
    )
    .optional(),
  paddockStatuses: z
    .array(
      z.object({
        paddockId: z.string(),
        paddockName: z.string(),
        status: z.enum(['OCCUPIED', 'RESTING', 'READY']),
        restDays: z.number(),
        minRestDays: z.number().nullable(),
        herdName: z.string().optional(),
        daysOccupied: z.number().optional(),
      })
    )
    .optional(),
});

export type DashboardSummaryResponse = z.infer<typeof DashboardSummaryResponseSchema>;

export const DashboardTrendSchema = z.object({
  date: z.string(),
  weight: z.number(),
  ua: z.number(),
  gain: z.number(),
});

export type DashboardTrend = z.infer<typeof DashboardTrendSchema>;

// ============= DTOs - Decision Today =============

export const DecisionTodayActionItemSchema = z.object({
  id: z.string().optional(),
  label: z.string(),
  done: z.boolean().optional(),
});

export type DecisionTodayActionItem = z.infer<typeof DecisionTodayActionItemSchema>;

export const DecisionTodayResponseSchema = z.object({
  farmId: z.string(),
  confidenceLevel: z.enum(['HIGH', 'MEDIUM', 'LOW']).optional(),
  confidenceScore: z.number().min(0).max(100).optional(),
  explainability: z.string().optional(),
  actionChecklist: z.array(DecisionTodayActionItemSchema).optional(),
  recommendedHerdId: z.string().nullable().optional(),
  recommendedPaddockId: z.string().nullable().optional(),
  activeMovementId: z.string().nullable().optional(),
});

export type DecisionTodayResponse = z.infer<typeof DecisionTodayResponseSchema>;

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
  entryDate: z.union([z.string(), z.date()]).transform((val) => new Date(val)),
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
