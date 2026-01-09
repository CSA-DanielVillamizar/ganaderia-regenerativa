"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardTrendSchema = exports.DashboardSummaryResponseSchema = exports.ForageSampleResponseSchema = exports.CreateForageSampleDtoSchema = exports.MovementResponseSchema = exports.CreateMovementDtoSchema = exports.WeighingResponseSchema = exports.CreateWeighingDtoSchema = exports.HerdResponseSchema = exports.CreateHerdDtoSchema = exports.PaddockResponseSchema = exports.CreatePaddockDtoSchema = exports.FarmResponseSchema = exports.CreateFarmDtoSchema = exports.AuthResponseSchema = exports.LoginDtoSchema = exports.WeighingMethod = exports.MovementType = exports.CycleStatus = exports.AnimalGender = exports.Role = void 0;
const zod_1 = require("zod");
// ============= Enums y constantes =============
var Role;
(function (Role) {
    Role["ADMIN"] = "ADMIN";
    Role["TECHNICIAN"] = "TECHNICIAN";
    Role["MANAGER"] = "MANAGER";
    Role["VIEWER"] = "VIEWER";
})(Role || (exports.Role = Role = {}));
var AnimalGender;
(function (AnimalGender) {
    AnimalGender["MALE"] = "MALE";
    AnimalGender["FEMALE"] = "FEMALE";
})(AnimalGender || (exports.AnimalGender = AnimalGender = {}));
var CycleStatus;
(function (CycleStatus) {
    CycleStatus["ACTIVE"] = "ACTIVE";
    CycleStatus["COMPLETED"] = "COMPLETED";
    CycleStatus["PLANNED"] = "PLANNED";
})(CycleStatus || (exports.CycleStatus = CycleStatus = {}));
var MovementType;
(function (MovementType) {
    MovementType["ENTRY"] = "ENTRY";
    MovementType["EXIT"] = "EXIT";
})(MovementType || (exports.MovementType = MovementType = {}));
var WeighingMethod;
(function (WeighingMethod) {
    WeighingMethod["SCALE"] = "SCALE";
    WeighingMethod["TAPE"] = "TAPE";
})(WeighingMethod || (exports.WeighingMethod = WeighingMethod = {}));
// ============= DTOs - Auth =============
exports.LoginDtoSchema = zod_1.z.object({
    email: zod_1.z.string().email('Email inválido'),
    password: zod_1.z.string().min(6, 'Mínimo 6 caracteres'),
});
exports.AuthResponseSchema = zod_1.z.object({
    accessToken: zod_1.z.string(),
    user: zod_1.z.object({
        id: zod_1.z.string(),
        email: zod_1.z.string(),
        name: zod_1.z.string(),
        role: zod_1.z.nativeEnum(Role),
    }),
});
// ============= DTOs - Fincas =============
exports.CreateFarmDtoSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Nombre requerido'),
    location: zod_1.z.string().optional(),
    hectares: zod_1.z.number().positive('Hectáreas debe ser positivo').optional(),
});
exports.FarmResponseSchema = zod_1.z.object({
    id: zod_1.z.string(),
    name: zod_1.z.string(),
    location: zod_1.z.string().nullable(),
    hectares: zod_1.z.number().nullable(),
    createdAt: zod_1.z.string(),
    updatedAt: zod_1.z.string(),
});
// ============= DTOs - Potreros =============
exports.CreatePaddockDtoSchema = zod_1.z.object({
    farmId: zod_1.z.string(),
    name: zod_1.z.string().min(1, 'Nombre requerido'),
    hectares: zod_1.z.number().positive('Hectáreas debe ser positivo'),
    description: zod_1.z.string().optional(),
    pastureType: zod_1.z.string().optional(),
    minRestDays: zod_1.z.number().int().positive('Días de descanso debe ser positivo').optional(),
});
exports.PaddockResponseSchema = zod_1.z.object({
    id: zod_1.z.string(),
    farmId: zod_1.z.string(),
    name: zod_1.z.string(),
    hectares: zod_1.z.number(),
    description: zod_1.z.string().nullable(),
    createdAt: zod_1.z.string(),
    updatedAt: zod_1.z.string(),
});
// ============= DTOs - Lotes =============
exports.CreateHerdDtoSchema = zod_1.z.object({
    farmId: zod_1.z.string(),
    name: zod_1.z.string().min(1, 'Nombre requerido'),
    initialWeight: zod_1.z.number().positive('Peso inicial debe ser positivo'),
    animalCount: zod_1.z.number().int().positive('Cantidad debe ser positivo'),
    description: zod_1.z.string().optional(),
});
exports.HerdResponseSchema = zod_1.z.object({
    id: zod_1.z.string(),
    farmId: zod_1.z.string(),
    name: zod_1.z.string(),
    initialWeight: zod_1.z.number(),
    currentWeight: zod_1.z.number().nullable(),
    animalCount: zod_1.z.number(),
    description: zod_1.z.string().nullable(),
    createdAt: zod_1.z.string(),
    updatedAt: zod_1.z.string(),
});
// ============= DTOs - Pesajes =============
exports.CreateWeighingDtoSchema = zod_1.z.object({
    herdId: zod_1.z.string(),
    weight: zod_1.z.number().positive('Peso debe ser positivo'),
    animalCount: zod_1.z.number().int().positive('Cantidad debe ser positivo'),
    notes: zod_1.z.string().optional(),
    method: zod_1.z.nativeEnum(WeighingMethod).optional(),
    chestGirthCm: zod_1.z.number().positive('Perímetro torácico debe ser positivo').optional(),
    bodyLengthCm: zod_1.z.number().positive('Longitud corporal debe ser positivo').optional(),
    estimatedWeightKg: zod_1.z.number().positive().optional(),
    realWeightKg: zod_1.z.number().positive().optional(),
    errorMarginPercent: zod_1.z.number().min(0).max(100).optional(),
});
exports.WeighingResponseSchema = zod_1.z.object({
    id: zod_1.z.string(),
    herdId: zod_1.z.string(),
    weight: zod_1.z.number(),
    animalCount: zod_1.z.number(),
    weightPerAnimal: zod_1.z.number(),
    notes: zod_1.z.string().nullable(),
    recordedAt: zod_1.z.string(),
    createdAt: zod_1.z.string(),
});
// ============= DTOs - Movimientos =============
exports.CreateMovementDtoSchema = zod_1.z.object({
    herdId: zod_1.z.string(),
    paddockId: zod_1.z.string(),
    cycleId: zod_1.z.string().optional(),
    type: zod_1.z.nativeEnum(MovementType),
    entryDate: zod_1.z.string().datetime(),
    exitDate: zod_1.z.string().datetime().optional(),
    notes: zod_1.z.string().optional(),
});
exports.MovementResponseSchema = zod_1.z.object({
    id: zod_1.z.string(),
    herdId: zod_1.z.string(),
    paddockId: zod_1.z.string(),
    cycleId: zod_1.z.string().nullable(),
    type: zod_1.z.nativeEnum(MovementType),
    status: zod_1.z.string(), // ACTIVE, CLOSED
    entryDate: zod_1.z.string(),
    exitDate: zod_1.z.string().nullable(),
    daysOccupied: zod_1.z.number().nullable(),
    notes: zod_1.z.string().nullable(),
    createdAt: zod_1.z.string(),
    updatedAt: zod_1.z.string(),
});
// ============= DTOs - Aforos =============
exports.CreateForageSampleDtoSchema = zod_1.z.object({
    paddockId: zod_1.z.string(),
    kgPerHectare: zod_1.z.number().positive('kg/ha debe ser positivo'),
    dryMatter: zod_1.z.number().positive('MS debe ser positivo'),
    sampleDate: zod_1.z.string().datetime(),
    notes: zod_1.z.string().optional(),
    frameAreaM2: zod_1.z.number().positive('Área del marco debe ser positivo').optional(),
    freshWeightKg: zod_1.z.number().positive('Peso fresco debe ser positivo').optional(),
    dryMatterPercent: zod_1.z.number().min(0).max(100).optional(),
    utilizationPercent: zod_1.z.number().min(0).max(100).optional(),
    kgMSPerHa: zod_1.z.number().positive().optional(),
});
exports.ForageSampleResponseSchema = zod_1.z.object({
    id: zod_1.z.string(),
    paddockId: zod_1.z.string(),
    kgPerHectare: zod_1.z.number(),
    dryMatter: zod_1.z.number(),
    sampleDate: zod_1.z.string(),
    notes: zod_1.z.string().nullable(),
    createdAt: zod_1.z.string(),
});
// ============= DTOs - Dashboard =============
exports.DashboardSummaryResponseSchema = zod_1.z.object({
    farmId: zod_1.z.string(),
    totalHerds: zod_1.z.number(),
    totalAnimals: zod_1.z.number(),
    totalWeight: zod_1.z.number(),
    totalUA: zod_1.z.number(),
    activePaddocks: zod_1.z.number(),
    averageWeightPerAnimal: zod_1.z.number(),
    uaPerHectare: zod_1.z.number().optional(),
    avgOccupancyDays: zod_1.z.number().optional(),
    paddocksNeedingRest: zod_1.z.number().optional(),
    alerts: zod_1.z.array(zod_1.z.object({
        type: zod_1.z.enum(['OVERGRAZING', 'INSUFFICIENT_REST', 'MISSING_DATA']),
        severity: zod_1.z.enum(['high', 'medium', 'low']),
        message: zod_1.z.string(),
        paddockName: zod_1.z.string().optional(),
        herdName: zod_1.z.string().optional(),
        daysOccupied: zod_1.z.number().optional(),
        restDays: zod_1.z.number().optional(),
        minRestDays: zod_1.z.number().optional(),
    })).optional(),
    paddockStatuses: zod_1.z.array(zod_1.z.object({
        paddockId: zod_1.z.string(),
        paddockName: zod_1.z.string(),
        status: zod_1.z.enum(['OCCUPIED', 'RESTING', 'READY']),
        restDays: zod_1.z.number(),
        minRestDays: zod_1.z.number().nullable(),
        herdName: zod_1.z.string().optional(),
        daysOccupied: zod_1.z.number().optional(),
    })).optional(),
});
exports.DashboardTrendSchema = zod_1.z.object({
    date: zod_1.z.string(),
    weight: zod_1.z.number(),
    ua: zod_1.z.number(),
    gain: zod_1.z.number(),
});
//# sourceMappingURL=index.js.map