# 📊 CycleModule - Gestión de Ciclos de Rotación

## Overview

El **CycleModule** implementa la gestión completa de ciclos de rotación para ganado. Un ciclo agrupa un conjunto de movimientos de un lote dentro de un período específico (ej: mes, temporada, año).

## Características

- ✅ CRUD completo (Create, Read, Update, Delete)
- ✅ Validaciones de integridad (máximo 1 ciclo ACTIVE por lote)
- ✅ Estadísticas del ciclo (días ocupación, potreros usados, peso ganado)
- ✅ Filtros avanzados (por estado, rango de fechas, lote)
- ✅ Tests unitarios

## Endpoints

### Crear Ciclo
```http
POST /api/v1/cycles
Authorization: Bearer <token>
Content-Type: application/json

{
  "farmId": "farm-uuid",
  "herdId": "herd-uuid",
  "startDate": "2025-12-26T00:00:00Z"
}
```

**Response (201 Created):**
```json
{
  "id": "cycle-uuid",
  "farmId": "farm-uuid",
  "herdId": "herd-uuid",
  "status": "ACTIVE",
  "startDate": "2025-12-26T00:00:00Z",
  "endDate": null,
  "farm": { "name": "Finca El Porvenir" },
  "herd": { "name": "Lote A" },
  "movements": []
}
```

### Listar Ciclos de Finca
```http
GET /api/v1/cycles?farmId=farm-uuid&status=ACTIVE&fromDate=2025-12-01&toDate=2025-12-31
Authorization: Bearer <token>
```

**Parámetros Query:**
- `farmId` (requerido): UUID de la finca
- `herdId` (opcional): Filtrar por lote
- `status` (opcional): ACTIVE | COMPLETED | PLANNED
- `fromDate` (opcional): ISO date format
- `toDate` (opcional): ISO date format

### Obtener Ciclo por ID
```http
GET /api/v1/cycles/{cycleId}
Authorization: Bearer <token>
```

### Actualizar Ciclo
```http
PATCH /api/v1/cycles/{cycleId}
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "COMPLETED",
  "endDate": "2025-12-31T00:00:00Z"
}
```

### Obtener Estadísticas
```http
GET /api/v1/cycles/{cycleId}/stats
Authorization: Bearer <token>
```

**Response:**
```json
{
  "cycleId": "cycle-uuid",
  "status": "ACTIVE",
  "startDate": "2025-12-26T00:00:00Z",
  "endDate": null,
  "totalMovements": 3,
  "totalOccupancyDays": 21,
  "paddocksUsed": ["Potrero A", "Potrero B"],
  "weighingRecords": 2,
  "estimatedWeightGainKg": 15.5
}
```

### Completar Ciclo
```http
POST /api/v1/cycles/{cycleId}/complete
Authorization: Bearer <token>
```

Equivalente a:
```
PATCH /api/v1/cycles/{cycleId}
{
  "status": "COMPLETED",
  "endDate": <current_date>
}
```

### Eliminar Ciclo
```http
DELETE /api/v1/cycles/{cycleId}
Authorization: Bearer <token>
```

**Restricción:** Solo se puede eliminar ciclos sin movimientos asociados.

## Validaciones

### Al Crear Ciclo
- ✅ Usuario debe tener acceso a la finca
- ✅ El lote debe existir en la finca
- ✅ No puede existir otro ciclo ACTIVE para el mismo lote

### Al Actualizar
- ✅ `endDate` requerida si `status = COMPLETED`
- ✅ `endDate` >= `startDate`

### Al Eliminar
- ✅ Ciclo no puede tener movimientos asociados
- ❌ Si tiene movimientos: `BadRequestException`

## Estadísticas Calculadas

### Total Días Ocupación
Suma de días ocupados en todos los movimientos del ciclo.

```
totalOccupancyDays = Σ (exitDate - entryDate) para todos los movimientos
```

### Potreros Utilizados
Lista de potreros únicos usados durante el ciclo.

### Estimación Ganancia Peso
Calcula el cambio de peso entre el primer y último pesaje del período del ciclo.

```
weightGain = lastWeighting - firstWeighting
```

## Modelo de Datos

```prisma
model Cycle {
  id            String     @id @default(cuid())
  farmId        String
  farm          Farm       @relation(fields: [farmId], references: [id])
  herdId        String
  herd          Herd       @relation(fields: [herdId], references: [id])
  status        String     // ACTIVE, COMPLETED, PLANNED
  startDate     DateTime
  endDate       DateTime?
  movements     Movement[] // Relación con movimientos
  createdBy     String
  updatedBy     String
  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt

  @@unique([herdId, status])  // Máximo 1 ACTIVE por lote
}
```

## Casos de Uso

### 1. Iniciar Ciclo para Lote
```typescript
await cycleService.create({
  farmId: 'farm-1',
  herdId: 'herd-1',
  startDate: new Date('2025-12-26')
}, userId);
```

### 2. Registrar Movimiento en Ciclo
```typescript
// El movimiento se crea con cycleId automáticamente
await movementService.create({
  herdId: 'herd-1',
  paddockId: 'paddock-1',
  cycleId: 'cycle-1',  // ← Vinculado al ciclo
  entryDate: new Date('2025-12-26'),
  type: 'ENTRY'
}, userId);
```

### 3. Consultar Progreso del Ciclo
```typescript
const stats = await cycleService.getCycleStats('cycle-1', userId);
// Retorna: días ocupados, potreros usados, peso ganado
```

### 4. Completar Ciclo
```typescript
await cycleService.completeCycle('cycle-1', userId);
// Marca como COMPLETED y registra fecha actual como endDate
```

## Tests Unitarios

Location: `apps/api/src/cycle/cycle.service.spec.ts`

Cobertura:
- ✅ `create()`: Happy path + validaciones
- ✅ `update()`: Cambios de status + validaciones
- ✅ `getCycleStats()`: Cálculos de estadísticas
- ✅ Error handling: Acceso, ciclos duplicados, datos inválidos

Ejecutar:
```bash
npm run test -- cycle.service
npm run test:watch -- cycle.service
```

## Integración con Otros Módulos

### Movement (Movimientos)
- Los movimientos pueden referenciar un ciclo vía `cycleId`
- Las estadísticas del ciclo se basan en movimientos asociados

### Weighing (Pesajes)
- Las estadísticas incluyen pesajes dentro del período del ciclo

### Farm & Herd
- Validación de acceso y existencia

## Performance

- Índice único en `(herdId, status)` para validación rápida
- Query de lista con filtros: O(log n) en BD
- Cálculo de estadísticas: O(movimientos + pesajes)

## Seguridad

- ✅ JWT requerido en todos los endpoints
- ✅ Validación de acceso a finca (user → farm)
- ✅ Validación de pertenencia (farm → herd → cycle)
- ✅ No se exponen datos de otras fincas

## Próximas Mejoras (Fase 2)

- [ ] E2E tests con Playwright
- [ ] Generación de reportes por ciclo (PDF)
- [ ] Exportación de datos (CSV)
- [ ] Historial de cambios de status
- [ ] Notificaciones de ciclo completado

---

**Creado:** 7 de enero, 2026  
**Status:** ✅ Production Ready  
**Versión:** 1.0.0
