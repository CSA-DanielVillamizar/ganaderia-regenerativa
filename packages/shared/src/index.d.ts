import { z } from 'zod';
export declare enum Role {
    ADMIN = "ADMIN",
    TECHNICIAN = "TECHNICIAN",
    MANAGER = "MANAGER",
    VIEWER = "VIEWER"
}
export declare enum AnimalGender {
    MALE = "MALE",
    FEMALE = "FEMALE"
}
export declare enum CycleStatus {
    ACTIVE = "ACTIVE",
    COMPLETED = "COMPLETED",
    PLANNED = "PLANNED"
}
export declare enum MovementType {
    ENTRY = "ENTRY",
    EXIT = "EXIT"
}
export declare enum WeighingMethod {
    SCALE = "SCALE",
    TAPE = "TAPE"
}
export declare enum Season {
    INVIERNO = "INVIERNO",
    VERANO = "VERANO"
}
export declare const LoginDtoSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export type LoginDto = z.infer<typeof LoginDtoSchema>;
export declare const AuthResponseSchema: z.ZodObject<{
    accessToken: z.ZodString;
    user: z.ZodObject<{
        id: z.ZodString;
        email: z.ZodString;
        name: z.ZodString;
        role: z.ZodNativeEnum<typeof Role>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        email: string;
        name: string;
        role: Role;
    }, {
        id: string;
        email: string;
        name: string;
        role: Role;
    }>;
}, "strip", z.ZodTypeAny, {
    accessToken: string;
    user: {
        id: string;
        email: string;
        name: string;
        role: Role;
    };
}, {
    accessToken: string;
    user: {
        id: string;
        email: string;
        name: string;
        role: Role;
    };
}>;
export type AuthResponse = z.infer<typeof AuthResponseSchema>;
export declare const CreateFarmDtoSchema: z.ZodObject<{
    name: z.ZodString;
    location: z.ZodOptional<z.ZodString>;
    hectares: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    name: string;
    location?: string | undefined;
    hectares?: number | undefined;
}, {
    name: string;
    location?: string | undefined;
    hectares?: number | undefined;
}>;
export type CreateFarmDto = z.infer<typeof CreateFarmDtoSchema>;
export declare const FarmResponseSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    location: z.ZodNullable<z.ZodString>;
    hectares: z.ZodNullable<z.ZodNumber>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    name: string;
    location: string | null;
    hectares: number | null;
    createdAt: string;
    updatedAt: string;
}, {
    id: string;
    name: string;
    location: string | null;
    hectares: number | null;
    createdAt: string;
    updatedAt: string;
}>;
export type FarmResponse = z.infer<typeof FarmResponseSchema>;
export declare const CreatePaddockDtoSchema: z.ZodObject<{
    farmId: z.ZodString;
    name: z.ZodString;
    hectares: z.ZodNumber;
    description: z.ZodOptional<z.ZodString>;
    pastureType: z.ZodOptional<z.ZodString>;
    minRestDays: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    name: string;
    hectares: number;
    farmId: string;
    description?: string | undefined;
    pastureType?: string | undefined;
    minRestDays?: number | undefined;
}, {
    name: string;
    hectares: number;
    farmId: string;
    description?: string | undefined;
    pastureType?: string | undefined;
    minRestDays?: number | undefined;
}>;
export type CreatePaddockDto = z.infer<typeof CreatePaddockDtoSchema>;
export declare const PaddockResponseSchema: z.ZodObject<{
    id: z.ZodString;
    farmId: z.ZodString;
    name: z.ZodString;
    hectares: z.ZodNumber;
    description: z.ZodNullable<z.ZodString>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    name: string;
    hectares: number;
    createdAt: string;
    updatedAt: string;
    farmId: string;
    description: string | null;
}, {
    id: string;
    name: string;
    hectares: number;
    createdAt: string;
    updatedAt: string;
    farmId: string;
    description: string | null;
}>;
export type PaddockResponse = z.infer<typeof PaddockResponseSchema>;
export declare const CreateHerdDtoSchema: z.ZodObject<{
    farmId: z.ZodString;
    name: z.ZodString;
    initialWeight: z.ZodNumber;
    animalCount: z.ZodNumber;
    description: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    farmId: string;
    initialWeight: number;
    animalCount: number;
    description?: string | undefined;
}, {
    name: string;
    farmId: string;
    initialWeight: number;
    animalCount: number;
    description?: string | undefined;
}>;
export type CreateHerdDto = z.infer<typeof CreateHerdDtoSchema>;
export declare const HerdResponseSchema: z.ZodObject<{
    id: z.ZodString;
    farmId: z.ZodString;
    name: z.ZodString;
    initialWeight: z.ZodNumber;
    currentWeight: z.ZodNullable<z.ZodNumber>;
    animalCount: z.ZodNumber;
    description: z.ZodNullable<z.ZodString>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
    farmId: string;
    description: string | null;
    initialWeight: number;
    animalCount: number;
    currentWeight: number | null;
}, {
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
    farmId: string;
    description: string | null;
    initialWeight: number;
    animalCount: number;
    currentWeight: number | null;
}>;
export type HerdResponse = z.infer<typeof HerdResponseSchema>;
export declare const CreateWeighingDtoSchema: z.ZodObject<{
    herdId: z.ZodString;
    weight: z.ZodNumber;
    animalCount: z.ZodNumber;
    notes: z.ZodOptional<z.ZodString>;
    method: z.ZodOptional<z.ZodNativeEnum<typeof WeighingMethod>>;
    chestGirthCm: z.ZodOptional<z.ZodNumber>;
    bodyLengthCm: z.ZodOptional<z.ZodNumber>;
    estimatedWeightKg: z.ZodOptional<z.ZodNumber>;
    realWeightKg: z.ZodOptional<z.ZodNumber>;
    errorMarginPercent: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    animalCount: number;
    herdId: string;
    weight: number;
    notes?: string | undefined;
    method?: WeighingMethod | undefined;
    chestGirthCm?: number | undefined;
    bodyLengthCm?: number | undefined;
    estimatedWeightKg?: number | undefined;
    realWeightKg?: number | undefined;
    errorMarginPercent?: number | undefined;
}, {
    animalCount: number;
    herdId: string;
    weight: number;
    notes?: string | undefined;
    method?: WeighingMethod | undefined;
    chestGirthCm?: number | undefined;
    bodyLengthCm?: number | undefined;
    estimatedWeightKg?: number | undefined;
    realWeightKg?: number | undefined;
    errorMarginPercent?: number | undefined;
}>;
export type CreateWeighingDto = z.infer<typeof CreateWeighingDtoSchema>;
export declare const WeighingResponseSchema: z.ZodObject<{
    id: z.ZodString;
    herdId: z.ZodString;
    weight: z.ZodNumber;
    animalCount: z.ZodNumber;
    weightPerAnimal: z.ZodNumber;
    notes: z.ZodNullable<z.ZodString>;
    recordedAt: z.ZodString;
    createdAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    createdAt: string;
    animalCount: number;
    herdId: string;
    weight: number;
    notes: string | null;
    weightPerAnimal: number;
    recordedAt: string;
}, {
    id: string;
    createdAt: string;
    animalCount: number;
    herdId: string;
    weight: number;
    notes: string | null;
    weightPerAnimal: number;
    recordedAt: string;
}>;
export type WeighingResponse = z.infer<typeof WeighingResponseSchema>;
export declare const CreateMovementDtoSchema: z.ZodObject<{
    herdId: z.ZodString;
    paddockId: z.ZodString;
    cycleId: z.ZodOptional<z.ZodString>;
    type: z.ZodNativeEnum<typeof MovementType>;
    entryDate: z.ZodString;
    exitDate: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: MovementType;
    herdId: string;
    paddockId: string;
    entryDate: string;
    cycleId?: string | undefined;
    exitDate?: string | undefined;
    notes?: string | undefined;
}, {
    type: MovementType;
    herdId: string;
    paddockId: string;
    entryDate: string;
    cycleId?: string | undefined;
    exitDate?: string | undefined;
    notes?: string | undefined;
}>;
export type CreateMovementDto = z.infer<typeof CreateMovementDtoSchema>;
export declare const MovementResponseSchema: z.ZodObject<{
    id: z.ZodString;
    herdId: z.ZodString;
    paddockId: z.ZodString;
    cycleId: z.ZodNullable<z.ZodString>;
    type: z.ZodNativeEnum<typeof MovementType>;
    status: z.ZodString;
    entryDate: z.ZodString;
    exitDate: z.ZodNullable<z.ZodString>;
    daysOccupied: z.ZodNullable<z.ZodNumber>;
    notes: z.ZodNullable<z.ZodString>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    type: MovementType;
    status: string;
    createdAt: string;
    updatedAt: string;
    herdId: string;
    notes: string | null;
    paddockId: string;
    cycleId: string | null;
    entryDate: string;
    exitDate: string | null;
    daysOccupied: number | null;
}, {
    id: string;
    type: MovementType;
    status: string;
    createdAt: string;
    updatedAt: string;
    herdId: string;
    notes: string | null;
    paddockId: string;
    cycleId: string | null;
    entryDate: string;
    exitDate: string | null;
    daysOccupied: number | null;
}>;
export type MovementResponse = z.infer<typeof MovementResponseSchema>;
export declare const CreateForageSampleDtoSchema: z.ZodObject<{
    paddockId: z.ZodString;
    kgPerHectare: z.ZodNumber;
    dryMatter: z.ZodNumber;
    sampleDate: z.ZodString;
    notes: z.ZodOptional<z.ZodString>;
    frameAreaM2: z.ZodOptional<z.ZodNumber>;
    freshWeightKg: z.ZodOptional<z.ZodNumber>;
    dryMatterPercent: z.ZodOptional<z.ZodNumber>;
    utilizationPercent: z.ZodOptional<z.ZodNumber>;
    kgMSPerHa: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    paddockId: string;
    kgPerHectare: number;
    dryMatter: number;
    sampleDate: string;
    notes?: string | undefined;
    frameAreaM2?: number | undefined;
    freshWeightKg?: number | undefined;
    dryMatterPercent?: number | undefined;
    utilizationPercent?: number | undefined;
    kgMSPerHa?: number | undefined;
}, {
    paddockId: string;
    kgPerHectare: number;
    dryMatter: number;
    sampleDate: string;
    notes?: string | undefined;
    frameAreaM2?: number | undefined;
    freshWeightKg?: number | undefined;
    dryMatterPercent?: number | undefined;
    utilizationPercent?: number | undefined;
    kgMSPerHa?: number | undefined;
}>;
export type CreateForageSampleDto = z.infer<typeof CreateForageSampleDtoSchema>;
export declare const ForageSampleResponseSchema: z.ZodObject<{
    id: z.ZodString;
    paddockId: z.ZodString;
    kgPerHectare: z.ZodNumber;
    dryMatter: z.ZodNumber;
    sampleDate: z.ZodString;
    notes: z.ZodNullable<z.ZodString>;
    createdAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    createdAt: string;
    notes: string | null;
    paddockId: string;
    kgPerHectare: number;
    dryMatter: number;
    sampleDate: string;
}, {
    id: string;
    createdAt: string;
    notes: string | null;
    paddockId: string;
    kgPerHectare: number;
    dryMatter: number;
    sampleDate: string;
}>;
export type ForageSampleResponse = z.infer<typeof ForageSampleResponseSchema>;
export declare const DashboardSummaryResponseSchema: z.ZodObject<{
    farmId: z.ZodString;
    totalHerds: z.ZodNumber;
    totalAnimals: z.ZodNumber;
    totalWeight: z.ZodNumber;
    totalUA: z.ZodNumber;
    activePaddocks: z.ZodNumber;
    averageWeightPerAnimal: z.ZodNumber;
    uaPerHectare: z.ZodOptional<z.ZodNumber>;
    avgOccupancyDays: z.ZodOptional<z.ZodNumber>;
    paddocksNeedingRest: z.ZodOptional<z.ZodNumber>;
    alerts: z.ZodOptional<z.ZodArray<z.ZodObject<{
        type: z.ZodEnum<["OVERGRAZING", "INSUFFICIENT_REST", "MISSING_DATA"]>;
        severity: z.ZodEnum<["high", "medium", "low"]>;
        message: z.ZodString;
        paddockName: z.ZodOptional<z.ZodString>;
        herdName: z.ZodOptional<z.ZodString>;
        daysOccupied: z.ZodOptional<z.ZodNumber>;
        restDays: z.ZodOptional<z.ZodNumber>;
        minRestDays: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        message: string;
        type: "OVERGRAZING" | "INSUFFICIENT_REST" | "MISSING_DATA";
        severity: "high" | "medium" | "low";
        paddockName?: string | undefined;
        herdName?: string | undefined;
        daysOccupied?: number | undefined;
        restDays?: number | undefined;
        minRestDays?: number | undefined;
    }, {
        message: string;
        type: "OVERGRAZING" | "INSUFFICIENT_REST" | "MISSING_DATA";
        severity: "high" | "medium" | "low";
        paddockName?: string | undefined;
        herdName?: string | undefined;
        daysOccupied?: number | undefined;
        restDays?: number | undefined;
        minRestDays?: number | undefined;
    }>, "many">>;
    paddockStatuses: z.ZodOptional<z.ZodArray<z.ZodObject<{
        paddockId: z.ZodString;
        paddockName: z.ZodString;
        status: z.ZodEnum<["OCCUPIED", "RESTING", "READY"]>;
        restDays: z.ZodNumber;
        minRestDays: z.ZodNullable<z.ZodNumber>;
        herdName: z.ZodOptional<z.ZodString>;
        daysOccupied: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        status: "OCCUPIED" | "RESTING" | "READY";
        minRestDays: number | null;
        paddockId: string;
        paddockName: string;
        restDays: number;
        herdName?: string | undefined;
        daysOccupied?: number | undefined;
    }, {
        status: "OCCUPIED" | "RESTING" | "READY";
        minRestDays: number | null;
        paddockId: string;
        paddockName: string;
        restDays: number;
        herdName?: string | undefined;
        daysOccupied?: number | undefined;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    farmId: string;
    totalHerds: number;
    totalAnimals: number;
    totalWeight: number;
    totalUA: number;
    activePaddocks: number;
    averageWeightPerAnimal: number;
    uaPerHectare?: number | undefined;
    avgOccupancyDays?: number | undefined;
    paddocksNeedingRest?: number | undefined;
    alerts?: {
        message: string;
        type: "OVERGRAZING" | "INSUFFICIENT_REST" | "MISSING_DATA";
        severity: "high" | "medium" | "low";
        paddockName?: string | undefined;
        herdName?: string | undefined;
        daysOccupied?: number | undefined;
        restDays?: number | undefined;
        minRestDays?: number | undefined;
    }[] | undefined;
    paddockStatuses?: {
        status: "OCCUPIED" | "RESTING" | "READY";
        minRestDays: number | null;
        paddockId: string;
        paddockName: string;
        restDays: number;
        herdName?: string | undefined;
        daysOccupied?: number | undefined;
    }[] | undefined;
}, {
    farmId: string;
    totalHerds: number;
    totalAnimals: number;
    totalWeight: number;
    totalUA: number;
    activePaddocks: number;
    averageWeightPerAnimal: number;
    uaPerHectare?: number | undefined;
    avgOccupancyDays?: number | undefined;
    paddocksNeedingRest?: number | undefined;
    alerts?: {
        message: string;
        type: "OVERGRAZING" | "INSUFFICIENT_REST" | "MISSING_DATA";
        severity: "high" | "medium" | "low";
        paddockName?: string | undefined;
        herdName?: string | undefined;
        daysOccupied?: number | undefined;
        restDays?: number | undefined;
        minRestDays?: number | undefined;
    }[] | undefined;
    paddockStatuses?: {
        status: "OCCUPIED" | "RESTING" | "READY";
        minRestDays: number | null;
        paddockId: string;
        paddockName: string;
        restDays: number;
        herdName?: string | undefined;
        daysOccupied?: number | undefined;
    }[] | undefined;
}>;
export type DashboardSummaryResponse = z.infer<typeof DashboardSummaryResponseSchema>;
export declare const DashboardTrendSchema: z.ZodObject<{
    date: z.ZodString;
    weight: z.ZodNumber;
    ua: z.ZodNumber;
    gain: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    date: string;
    weight: number;
    ua: number;
    gain: number;
}, {
    date: string;
    weight: number;
    ua: number;
    gain: number;
}>;
export type DashboardTrend = z.infer<typeof DashboardTrendSchema>;
export declare const DecisionTodayActionItemSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    label: z.ZodString;
    done: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    label: string;
    id?: string | undefined;
    done?: boolean | undefined;
}, {
    label: string;
    id?: string | undefined;
    done?: boolean | undefined;
}>;
export type DecisionTodayActionItem = z.infer<typeof DecisionTodayActionItemSchema>;
export declare const DecisionTodayResponseSchema: z.ZodObject<{
    farmId: z.ZodString;
    confidenceLevel: z.ZodOptional<z.ZodEnum<["HIGH", "MEDIUM", "LOW"]>>;
    confidenceScore: z.ZodOptional<z.ZodNumber>;
    explainability: z.ZodOptional<z.ZodString>;
    actionChecklist: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodOptional<z.ZodString>;
        label: z.ZodString;
        done: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        label: string;
        id?: string | undefined;
        done?: boolean | undefined;
    }, {
        label: string;
        id?: string | undefined;
        done?: boolean | undefined;
    }>, "many">>;
    recommendedHerdId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    recommendedPaddockId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    activeMovementId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    farmId: string;
    confidenceLevel?: "HIGH" | "MEDIUM" | "LOW" | undefined;
    confidenceScore?: number | undefined;
    explainability?: string | undefined;
    actionChecklist?: {
        label: string;
        id?: string | undefined;
        done?: boolean | undefined;
    }[] | undefined;
    recommendedHerdId?: string | null | undefined;
    recommendedPaddockId?: string | null | undefined;
    activeMovementId?: string | null | undefined;
}, {
    farmId: string;
    confidenceLevel?: "HIGH" | "MEDIUM" | "LOW" | undefined;
    confidenceScore?: number | undefined;
    explainability?: string | undefined;
    actionChecklist?: {
        label: string;
        id?: string | undefined;
        done?: boolean | undefined;
    }[] | undefined;
    recommendedHerdId?: string | null | undefined;
    recommendedPaddockId?: string | null | undefined;
    activeMovementId?: string | null | undefined;
}>;
export type DecisionTodayResponse = z.infer<typeof DecisionTodayResponseSchema>;
/**
 * Contrato de error estandarizado para todas las respuestas de error.
 */
export declare const ErrorResponseSchema: z.ZodObject<{
    statusCode: z.ZodNumber;
    message: z.ZodString;
    error: z.ZodString;
    path: z.ZodString;
    timestamp: z.ZodString;
    traceId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    path: string;
    message: string;
    error: string;
    statusCode: number;
    timestamp: string;
    traceId: string;
}, {
    path: string;
    message: string;
    error: string;
    statusCode: number;
    timestamp: string;
    traceId: string;
}>;
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
/**
 * Respuesta paginada genérica para listados.
 */
export declare const PaginatedResponseSchema: z.ZodObject<{
    data: z.ZodArray<z.ZodUnknown, "many">;
    pagination: z.ZodObject<{
        total: z.ZodNumber;
        page: z.ZodNumber;
        limit: z.ZodNumber;
        totalPages: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }, {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
}, "strip", z.ZodTypeAny, {
    data: unknown[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}, {
    data: unknown[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}>;
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
export declare const ListMovementsResponseSchema: z.ZodObject<{
    data: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        herdId: z.ZodString;
        paddockId: z.ZodString;
        cycleId: z.ZodNullable<z.ZodString>;
        type: z.ZodNativeEnum<typeof MovementType>;
        status: z.ZodString;
        entryDate: z.ZodString;
        exitDate: z.ZodNullable<z.ZodString>;
        daysOccupied: z.ZodNullable<z.ZodNumber>;
        notes: z.ZodNullable<z.ZodString>;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
        type: MovementType;
        status: string;
        createdAt: string;
        updatedAt: string;
        herdId: string;
        notes: string | null;
        paddockId: string;
        cycleId: string | null;
        entryDate: string;
        exitDate: string | null;
        daysOccupied: number | null;
    }, {
        id: string;
        type: MovementType;
        status: string;
        createdAt: string;
        updatedAt: string;
        herdId: string;
        notes: string | null;
        paddockId: string;
        cycleId: string | null;
        entryDate: string;
        exitDate: string | null;
        daysOccupied: number | null;
    }>, "many">;
    pagination: z.ZodObject<{
        total: z.ZodNumber;
        page: z.ZodNumber;
        limit: z.ZodNumber;
        totalPages: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }, {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
}, "strip", z.ZodTypeAny, {
    data: {
        id: string;
        type: MovementType;
        status: string;
        createdAt: string;
        updatedAt: string;
        herdId: string;
        notes: string | null;
        paddockId: string;
        cycleId: string | null;
        entryDate: string;
        exitDate: string | null;
        daysOccupied: number | null;
    }[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}, {
    data: {
        id: string;
        type: MovementType;
        status: string;
        createdAt: string;
        updatedAt: string;
        herdId: string;
        notes: string | null;
        paddockId: string;
        cycleId: string | null;
        entryDate: string;
        exitDate: string | null;
        daysOccupied: number | null;
    }[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}>;
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
export declare const OvergrazingAlertSchema: z.ZodObject<{
    id: z.ZodString;
    herdId: z.ZodString;
    herdName: z.ZodString;
    paddockId: z.ZodString;
    paddockName: z.ZodString;
    daysOccupied: z.ZodNumber;
    maxAllowedDays: z.ZodNumber;
    exceedDays: z.ZodNumber;
    entryDate: z.ZodDate;
    severity: z.ZodEnum<["MEDIUM", "HIGH", "CRITICAL"]>;
}, "strip", z.ZodTypeAny, {
    id: string;
    herdId: string;
    paddockId: string;
    entryDate: Date;
    daysOccupied: number;
    severity: "HIGH" | "MEDIUM" | "CRITICAL";
    paddockName: string;
    herdName: string;
    maxAllowedDays: number;
    exceedDays: number;
}, {
    id: string;
    herdId: string;
    paddockId: string;
    entryDate: Date;
    daysOccupied: number;
    severity: "HIGH" | "MEDIUM" | "CRITICAL";
    paddockName: string;
    herdName: string;
    maxAllowedDays: number;
    exceedDays: number;
}>;
export type OvergrazingAlert = z.infer<typeof OvergrazingAlertSchema>;
export declare const OvergrazingAlertsResponseSchema: z.ZodObject<{
    data: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        herdId: z.ZodString;
        herdName: z.ZodString;
        paddockId: z.ZodString;
        paddockName: z.ZodString;
        daysOccupied: z.ZodNumber;
        maxAllowedDays: z.ZodNumber;
        exceedDays: z.ZodNumber;
        entryDate: z.ZodDate;
        severity: z.ZodEnum<["MEDIUM", "HIGH", "CRITICAL"]>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        herdId: string;
        paddockId: string;
        entryDate: Date;
        daysOccupied: number;
        severity: "HIGH" | "MEDIUM" | "CRITICAL";
        paddockName: string;
        herdName: string;
        maxAllowedDays: number;
        exceedDays: number;
    }, {
        id: string;
        herdId: string;
        paddockId: string;
        entryDate: Date;
        daysOccupied: number;
        severity: "HIGH" | "MEDIUM" | "CRITICAL";
        paddockName: string;
        herdName: string;
        maxAllowedDays: number;
        exceedDays: number;
    }>, "many">;
    totalAlerts: z.ZodNumber;
    criticalAlerts: z.ZodNumber;
    highAlerts: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    data: {
        id: string;
        herdId: string;
        paddockId: string;
        entryDate: Date;
        daysOccupied: number;
        severity: "HIGH" | "MEDIUM" | "CRITICAL";
        paddockName: string;
        herdName: string;
        maxAllowedDays: number;
        exceedDays: number;
    }[];
    totalAlerts: number;
    criticalAlerts: number;
    highAlerts: number;
}, {
    data: {
        id: string;
        herdId: string;
        paddockId: string;
        entryDate: Date;
        daysOccupied: number;
        severity: "HIGH" | "MEDIUM" | "CRITICAL";
        paddockName: string;
        herdName: string;
        maxAllowedDays: number;
        exceedDays: number;
    }[];
    totalAlerts: number;
    criticalAlerts: number;
    highAlerts: number;
}>;
export type OvergrazingAlertsResponse = z.infer<typeof OvergrazingAlertsResponseSchema>;
//# sourceMappingURL=index.d.ts.map