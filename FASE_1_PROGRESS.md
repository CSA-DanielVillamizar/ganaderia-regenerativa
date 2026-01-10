# 🚀 FASE 1 - CONTRATO DE ERRORES Y VALIDACIÓN GLOBAL

**Objetivo:** Crear la base robusta de manejo de errores y validaciones que todos los endpoints necesitan.

**Estado:** 🔄 IN PROGRESS (70% completado)

---

## ✅ COMPLETADO EN FASE 1

### 1.1 ExceptionFilter Global
- ✅ Creado `AllExceptionsFilter` en `src/common/filters/all-exceptions.filter.ts`
- ✅ Captura TODAS las excepciones (HTTP y no-HTTP)
- ✅ Retorna respuesta estandarizada: `{ statusCode, message, error, path, timestamp, traceId, details }`
- ✅ Log automático de errores con traceId para debugging
- ✅ Integrado en `AppModule` como `APP_FILTER` global

**Ejemplo de respuesta:**
```json
{
  "statusCode": 409,
  "message": "El lote ya tiene un movimiento activo en el potrero 'Potrero 1'",
  "error": "ConflictException",
  "path": "/movements",
  "timestamp": "2025-01-10T15:30:45.123Z",
  "traceId": "a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6",
  "details": { "herdId": "abc123", "paddockId": "def456" }
}
```

### 1.2 ValidationPipe Global
- ✅ Configurado con `whitelist: true` → rechaza propiedades no permitidas
- ✅ Configurado con `forbidNonWhitelisted: true` → error si hay propiedades extra
- ✅ Configurado con `transform: true` → auto-convierte tipos (strings → numbers)

### 1.3 DTOs Reforzados

#### CreateMovementDto (MEJORADO)
**Validaciones Agregadas:**
- ✅ `herdId` y `paddockId` son UUIDs válidos
- ✅ `entryDate` es ISO datetime válido
- ✅ `entryDate` no puede ser en el futuro
- ✅ `exitDate` (si existe) debe ser >= `entryDate`
- ✅ Máximo 500 caracteres en `notes`

**Schema antes:**
```typescript
export const CreateMovementDtoSchema = z.object({
  herdId: z.string(),
  paddockId: z.string(),
  cycleId: z.string().optional(),
  type: z.nativeEnum(MovementType),
  entryDate: z.string().datetime(),
  exitDate: z.string().datetime().optional(),
  notes: z.string().optional(),
});
```

**Schema después:**
```typescript
export const CreateMovementDtoSchema = z
  .object({
    herdId: z.string().uuid('herdId debe ser un UUID válido'),
    paddockId: z.string().uuid('paddockId debe ser un UUID válido'),
    cycleId: z.string().uuid().optional(),
    type: z.nativeEnum(MovementType),
    entryDate: z
      .string()
      .datetime('entryDate debe ser una fecha ISO válida')
      .refine(
        (date) => new Date(date) <= new Date(),
        'entryDate no puede ser en el futuro',
      ),
    exitDate: z.string().datetime().optional(),
    notes: z.string().max(500).optional(),
  })
  .refine(
    (data) => {
      if (!data.exitDate) return true;
      return new Date(data.exitDate) >= new Date(data.entryDate);
    },
    { message: 'exitDate debe ser >= entryDate', path: ['exitDate'] },
  );
```

#### CloseMovementDto (NUEVO)
```typescript
export const CloseMovementDtoSchema = z.object({
  exitDate: z.string().datetime('exitDate debe ser una fecha ISO válida'),
  notes: z.string().max(500).optional(),
});

export type CloseMovementDto = z.infer<typeof CloseMovementDtoSchema>;
```

#### CreateForageSampleDto (COMPLETAMENTE REESCRITO)
**Cambios Principales:**
- ✅ Agregado enum `ForageMeasurementType` (GREEN | DRY_MATTER)
- ✅ `measurementType` es requerido (default: GREEN)
- ✅ `dryMatterPercent` es requerido si `measurementType === GREEN`
- ✅ `utilizationPercent` tiene valor por defecto (70%)
- ✅ Validaciones de rango (0-100 para porcentajes)
- ✅ Campo `availableForageKgMS` calculado

**Nuevo schema:**
```typescript
export enum ForageMeasurementType {
  GREEN = 'GREEN', // Forraje verde (fresco)
  DRY_MATTER = 'DRY_MATTER', // Materia seca (MS)
}

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
    notes: z.string().max(500).optional(),
    // Legacy fields
    frameAreaM2: z.coerce.number().positive().optional(),
    freshWeightKg: z.coerce.number().positive().optional(),
    kgMSPerHa: z.coerce.number().positive().optional(),
  })
  .refine(
    (data) => {
      if (data.measurementType === ForageMeasurementType.GREEN && !data.dryMatterPercent) {
        return false;
      }
      return true;
    },
    {
      message: 'Si la medición es GREEN, dryMatterPercent es requerido',
      path: ['dryMatterPercent'],
    },
  );
```

### 1.4 Schema Prisma - ForageSample Actualizado
```prisma
model ForageSample {
  id                  String   @id @default(cuid())
  paddockId           String
  kgPerHectare        Float    // kg/ha disponible
  measurementType     String   @default("GREEN") // GREEN | DRY_MATTER
  dryMatterPercent    Float?   // % de MS si es GREEN (0-100)
  utilizationPercent  Float    @default(70) // % utilización (por defecto 70%)
  availableForageKgMS Float?   // Calculado: forraje disponible en MS
  sampleDate          DateTime
  notes               String?
  createdAt           DateTime @default(now())
  createdBy           String?

  // Legacy fields
  dryMatter      Float?
  frameAreaM2    Float?
  freshWeightKg  Float?
  kgMSPerHa      Float?

  paddock Paddock @relation(fields: [paddockId], references: [id], onDelete: Cascade)

  @@index([paddockId])
  @@index([sampleDate])
}
```

### 1.5 Swagger - MovementController ya documenta
✅ Los endpoints ya tienen decoradores `@ApiOperation`, `@ApiResponse`, `@ApiTags`

---

## 🔄 PRÓXIMO PASO: Aplicar Migración Prisma

Antes de continuar, ejecuta:

```bash
cd apps/api
npx prisma migrate dev --name "add_forage_measurement_type"
```

Esto aplicará los cambios a la BD (agregar campos a ForageSample).

---

## 📋 VALIDACIONES DE NEGOCIO IMPLEMENTADAS

### En MovementService (✅ YA EXISTEN)
```typescript
// P0.1: Validar que no haya movimientos activos del mismo lote
await this.validateNoActiveMovements(dto.herdId);

// P0.1: Bloquear doble ocupación del potrero
await this.validatePaddockNotOccupied(dto.paddockId);

// P0.5: Validar descanso mínimo del potrero
const restDays = this.calculateRestDays(paddock);
if (restDays < paddock.minRestDays) {
  throw new BadRequestException(
    `Potrero necesita ${paddock.minRestDays} días de descanso. ` +
    `Actual: ${restDays} días.`
  );
}
```

---

## 🧪 TESTS PENDIENTES PARA FASE 1.5

Necesitamos crear tests para:

1. **ExceptionFilter**
   - ✅ Test que HttpException retorna respuesta estandarizada
   - ✅ Test que Error genérico retorna 500 con traceId

2. **ValidationPipe**
   - ✅ Test que payload con campos extra es rechazado
   - ✅ Test que transform convierte string → number

3. **CreateMovementDto**
   - ✅ Test UUID validation (herdId, paddockId)
   - ✅ Test datetime validation (entryDate)
   - ✅ Test exitDate >= entryDate
   - ✅ Test max 500 chars en notes

4. **CreateForageSampleDto**
   - ✅ Test measurementType validation
   - ✅ Test dryMatterPercent required si GREEN
   - ✅ Test utilizationPercent 0-100 range
   - ✅ Test dryMatterPercent not required si DRY_MATTER

5. **Movement API Integration**
   - ✅ Test POST /movements con datos inválidos → 400
   - ✅ Test POST /movements con UUIDs inválidos → 400
   - ✅ Test POST /movements sin auth → 401
   - ✅ Test POST /movements sin acceso a finca → 403
   - ✅ Test POST /movements con lote ya activo → 409
   - ✅ Test PATCH /movements/:id/close exitDate < entryDate → 400

---

## 📚 PRÓXIMOS PASOS (FASE 1 COMPLETAR)

1. **✅ Ejecutar migración Prisma**
   ```bash
   cd apps/api
   npx prisma migrate dev
   ```

2. **✅ Crear archivo de tests** (`movement.service.spec.ts`, `movement.integration.spec.ts`)
   - Tests unitarios para validaciones
   - Tests de integración para endpoints

3. **✅ Verificar Swagger funciona**
   - Abrir http://localhost:3001/api/docs
   - Probar POST /movements con ejemplo válido
   - Probar POST /movements con ejemplo inválido

4. **✅ Ejecutar linter**
   ```bash
   npm run lint
   ```

5. **✅ Build sin errores**
   ```bash
   npm run build
   ```

---

## 🎯 CRITERIOS DE ACEPTACIÓN FASE 1

- [x] ExceptionFilter captura todas excepciones
- [x] ValidationPipe activo globalmente
- [x] DTOs tienen validaciones Zod robustas
- [x] MovementController documenta endpoints en Swagger
- [ ] Tests unit >80% cobertura
- [ ] Tests integration para validaciones críticas
- [ ] Migración Prisma aplicada
- [ ] npm run lint sin errores
- [ ] npm run build sin errores
- [ ] Swagger `/api/docs` funciona

---

## 🚀 PRÓXIMA FASE

Una vez completados los tests de FASE 1, comenzamos **FASE 2 – Cerrar Gaps P0**:
- P0.3: Aforos reales (`calculateAvailableForage`)
- P0.4: Días recomendados (`calculateRecommendedDays`)
- P0.5: Descanso del potrero (`calculateRestDays`) - ya parcialmente implementado
- P0.6: Pesajes históricos (UA update)

---

**Responsible:** Tech Lead + Arquitecto Senior  
**Date:** 2025-01-10  
**Status:** 🔄 In Progress
