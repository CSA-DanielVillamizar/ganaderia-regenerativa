# 🚀 FASE 2 - Plan de Implementación: Cerrar Gaps P0

**Status:** 🟡 LISTOS PARA INICIAR (FASE 1 ✅ COMPLETADA)  
**Objetivo:** Implementar 4 funcionalidades críticas de negocio  
**Estimado:** 4-6 horas  
**Test Target:** >90% cobertura  

---

## 📋 Contexto

**FASE 1 Proporciona:**
- ✅ ExceptionFilter global (traceId + logging)
- ✅ ValidationPipe global (whitelist + whitespace)
- ✅ DTOs robustos con Zod (UUID + datetime + custom refinements)
- ✅ ForageService con cálculo de MS
- ✅ 63 tests PASSING
- ✅ Build exitoso, migraciones aplicadas

**FASE 2 Implementará:**
- P0.3: Aforos Reales (consultar disponible)
- P0.4: Días Recomendados (capacidad del potrero)
- P0.5: Validación Descanso (min rest days)
- P0.6: Pesajes Históricos (weight tracking)

---

## 🎯 P0.3 - AFOROS REALES (Forraje Disponible)

### **Requisito:**
Endpoint que retorna el forraje disponible (en kg MS) para un potrero, basado en el último aforo registrado.

### **API Endpoint:**
```
GET /forage-samples/paddock/:paddockId/available

Response 200:
{
  "paddockId": "uuid",
  "forageSampleId": "uuid",
  "measurementType": "GREEN" | "DRY_MATTER",
  "kgPerHectare": 5000,
  "dryMatterPercent": 30,
  "utilizationPercent": 70,
  "availableForageKgMS": 1050,          // kg MS por hectárea
  "totalAvailableKgMS": 10500,          // = availableForageKgMS × paddockHectares
  "sampledAt": "2025-01-10T10:00:00Z",
  "remainingDaysOfUse": 15.5            // Si se consume a X kg/día
}
```

### **Test Cases:**
1. ✅ GET con paddockId válido → retorna último aforo
2. ✅ GET con paddockId sin aforos → 404 NotFound
3. ✅ GET con paddockId inexistente → 404 NotFound
4. ✅ Cálculo totalAvailableKgMS = availableForageKgMS × hectares
5. ✅ Cálculo remainingDays basado en demand/día
6. ✅ Retorna aforo GREEN correctamente (con dryMatterPercent)
7. ✅ Retorna aforo DRY_MATTER correctamente
8. ✅ Auth requerido (@UseGuards)

### **Archivos a Crear/Modificar:**
- [ ] `src/forage/forage.controller.ts` - Nuevo endpoint GET
- [ ] `src/forage/forage.service.ts` - New method `getAvailableForage(paddockId)`
- [ ] `src/forage/forage.service.spec.ts` - 8 test cases
- [ ] `src/common/dto/forage.dto.ts` - GetAvailableForageDto

---

## 🎯 P0.4 - DÍAS RECOMENDADOS

### **Requisito:**
Endpoint que calcula cuántos días puede pastar el hato en un potrero basado en:
- Forraje disponible (del último aforo)
- Peso total del hato
- Consumo diario (parámetro)

### **Formula:**
```
recomendedDays = (availableForageKgMS × hectares) / (totalHerdWeightKg × dailyIntakePercent)

Donde:
- availableForageKgMS = del último aforo
- hectares = tamaño potrero
- totalHerdWeightKg = suma de pesos del hato
- dailyIntakePercent = parámetro (típicamente 2.0 - 2.5%)
```

### **API Endpoint:**
```
GET /paddocks/:paddockId/recommended-days
Query Params:
  - intakePercent: 2.0 (default)

Response 200:
{
  "paddockId": "uuid",
  "paddockName": "Potrero Norte",
  "paddockHectares": 10,
  "availableForageKgMS": 1050,
  "totalAvailableKgMS": 10500,
  "totalHerdWeightKg": 500,
  "intakePercentDaily": 2.0,
  "dailyConsumptionKgMS": 10,
  "recommendedDays": 1050,              // 10500 / 10
  "rotationAdvice": "Can stay 35 days"
}
```

### **Test Cases:**
1. ✅ GET con paddockId y herds → calcula correctamente
2. ✅ GET sin aforos → 400 BadRequest
3. ✅ GET con intakePercent custom → usa valor
4. ✅ Manejo división por cero (0 herd weight)
5. ✅ Valores negativos → validar
6. ✅ Query param intakePercent validation
7. ✅ Auth requerido

### **Archivos a Crear/Modificar:**
- [ ] `src/paddock/paddock.controller.ts` - New endpoint GET
- [ ] `src/paddock/paddock.service.ts` - New method `getRecommendedDays()`
- [ ] `src/forage/forage.service.ts` - Expose `getAvailableForage()`
- [ ] `src/herd/herd.service.ts` - New method `getTotalWeightKg()`
- [ ] Tests: 7 cases

---

## 🎯 P0.5 - VALIDACIÓN DESCANSO POTRERO

### **Requisito:**
Al crear un movimiento (ENTRY), validar que el potrero ha descansado lo suficiente desde el último movimiento (EXIT).

### **Lógica:**
```
1. Buscar último Movement con paddockId y status = EXITED (o completado)
2. Calcular días de descanso = today - lastExitDate
3. Comparar: restDays >= paddock.minRestDays
4. Si no cumple → BadRequestException
```

### **Error Response:**
```json
{
  "statusCode": 400,
  "message": "El potrero no ha descansado lo suficiente",
  "error": "BadRequestException",
  "path": "/movements",
  "traceId": "uuid",
  "details": {
    "paddockId": "uuid",
    "paddockName": "Potrero Norte",
    "minRestDaysRequired": 30,
    "daysRested": 15,
    "daysShort": 15,
    "lastExitDate": "2025-01-10T10:00:00Z"
  }
}
```

### **Test Cases:**
1. ✅ Entry válido (rest >= min) → 201 Created
2. ✅ Entry inválido (rest < min) → 400 BadRequest
3. ✅ Primer movimiento (sin exit previo) → 201 Created
4. ✅ Cálculo días exacto
5. ✅ Mensaje de error descriptivo con detalles
6. ✅ Otros movimientos simultáneos (transacción)
7. ✅ Auth requerido

### **Archivos a Modificar:**
- [ ] `src/movement/movement.controller.ts` - Decorator @ValidateRestDays
- [ ] `src/movement/movement.service.ts` - Update `create()` con validación
- [ ] `src/paddock/paddock.service.ts` - Helper para cálculo días
- [ ] `src/movement/movement.service.spec.ts` - 7 test cases

---

## 🎯 P0.6 - PESAJES HISTÓRICOS

### **Requisito:**
1. Endpoint para obtener histórico de pesajes de un hato
2. Al registrar pesaje → actualizar `herd.currentWeight` y `herd.currentUA`
3. Calcular UA = weight / ua_weight_kg (parámetro)

### **API Endpoints:**

#### **A) Obtener Histórico:**
```
GET /weighings/herd/:herdId/history
Query Params:
  - limit: 10 (default)
  - offset: 0
  - sortBy: "date" | "weight"
  - order: "ASC" | "DESC"

Response 200:
{
  "herdId": "uuid",
  "herdName": "Hato A",
  "currentWeight": 450,
  "currentUA": 5.0,
  "weighings": [
    {
      "weighingId": "uuid",
      "weight": 450,
      "ua": 5.0,
      "date": "2025-01-10T10:00:00Z",
      "notes": "Pesaje rutin"
    },
    // ... older entries
  ],
  "totalCount": 25
}
```

#### **B) Create Weighing (ya existe, mejorar):**
```
POST /weighings
{
  "herdId": "uuid",
  "weight": 450,        // kg
  "notes": "Pesaje rutinario"
}

Response 201:
{
  "weighingId": "uuid",
  "weight": 450,
  "ua": 5.0,           // Calculado
  "herdUpdated": {
    "id": "uuid",
    "currentWeight": 450,
    "currentUA": 5.0
  }
}
```

### **Test Cases:**
1. ✅ POST weighing → crea y actualiza herd
2. ✅ GET historia → retorna ordered list
3. ✅ GET historia sin weighings → empty array
4. ✅ GET historia con limit/offset → pagination
5. ✅ GET historia con sort → order correcto
6. ✅ UA calculation: weight / parameter
7. ✅ herd.currentWeight actualizado
8. ✅ herd.currentUA actualizado
9. ✅ Auth requerido

### **Cambios a Schema:**
```prisma
model Herd {
  // ... campos existentes ...
  currentWeight       Float?        // Peso actual (kg)
  currentUA          Float?        // Unidades Animales
  weighings          Weighing[]    // Relación
}

model Weighing {
  id          String    @id @default(cuid())
  herdId      String
  herd        Herd      @relation(fields: [herdId], references: [id], onDelete: Cascade)
  weight      Float     // kg
  ua          Float?    // Unidades Animales (calculado)
  notes       String?   @db.Text
  createdAt   DateTime  @default(now())
  createdBy   String    // userId
  
  @@index([herdId])
  @@index([createdAt])
}
```

### **Archivos a Crear/Modificar:**
- [ ] `src/weighing/weighing.controller.ts` - GET history endpoint
- [ ] `src/weighing/weighing.service.ts` - Update logic
- [ ] `src/herd/herd.service.ts` - Update `currentWeight` y `currentUA`
- [ ] `prisma/schema.prisma` - Add Weighing model + Herd.currentWeight
- [ ] Migration file
- [ ] Tests: 9 cases

---

## 📊 Summary de FASE 2

| Feature | Endpoint | Method | Complexity | Tests |
|---------|----------|--------|-----------|-------|
| P0.3 Aforos | `/forage-samples/paddock/:id/available` | GET | ⭐⭐ | 8 |
| P0.4 Días | `/paddocks/:id/recommended-days` | GET | ⭐⭐⭐ | 7 |
| P0.5 Descanso | `/movements` | POST (validate) | ⭐⭐⭐ | 7 |
| P0.6 Pesajes | `/weighings/herd/:id/history` | GET | ⭐⭐⭐ | 9 |
| **TOTAL** | - | - | - | **31** |

---

## 🔧 Arquitectura FASE 2

```
Controller Layer (Route + Auth)
    ↓
ValidationPipe (DTO Zod)    ← Reutiliza FASE 1
    ↓
Service Layer (Business Logic)
    ├── ForageService.getAvailableForage()    [P0.3]
    ├── PaddockService.getRecommendedDays()  [P0.4]
    ├── MovementService.validateRestDays()   [P0.5]
    ├── WeighingService.create()              [P0.6]
    └── HerdService.updateCurrentWeight()
    ↓
Repository Layer (Prisma)
    ├── ForageSample queries
    ├── Movement queries (lastExit)
    ├── Paddock queries
    ├── Herd updates
    └── Weighing CRUD
    ↓
Exception Filter      ← Usa AllExceptionsFilter de FASE 1
    ↓
Standard Response + traceId
```

---

## 📅 Sequencia de Implementación

### **Orden Recomendado:**

1. **P0.3 (Aforos Reales)** - Independence, requiere ForageService de FASE 1
2. **P0.4 (Días Recomendados)** - Depende de P0.3 (getAvailableForage)
3. **P0.5 (Validación Descanso)** - Requiere MovementService mejorado
4. **P0.6 (Pesajes)** - Independence, schema nuevo

### **Timeline Estimado:**
- P0.3: 1-1.5 horas (simple query)
- P0.4: 1-1.5 horas (cálculo + query)
- P0.5: 1-1.5 horas (validación transaccional)
- P0.6: 1-1.5 horas (nuevo modelo + endpoint)
- **Total:** 4-6 horas

---

## ✅ Checklist de Inicio FASE 2

- [ ] FASE 1 tests pasando (63/63 ✅)
- [ ] Build exitoso (`nest build` ✅)
- [ ] Migraciones aplicadas (20260110093830 ✅)
- [ ] Lint checks listos
- [ ] Rama limpia en git
- [ ] DTOs base de FASE 1 disponibles
- [ ] AllExceptionsFilter funcional
- [ ] ForageService con cálculo MS

---

## 🎓 Próximas Fases (After FASE 2)

**FASE 3:** Ciclos de Rotación Completos
- Validación: cicloActual en paddock
- Endpoints: /cycles, /cycles/:id/close

**FASE 4:** Dashboard 6 Gráficas
- Datos agregados
- Real-time metrics

**FASE 5:** Auditoría y Reportes
- Audit logs
- Excel exports

**FASE 6:** CI/CD y DevOps
- GitHub Actions
- Docker + docker-compose

**FASE 7:** Documentación y Manuales
- User guide
- API docs

---

## 🚀 Ready to Start FASE 2

Este documento describe la **estructura y requisistos** de FASE 2. 

**Próximo paso:** Ejecutar `npm run build && npm run test` para confirmar FASE 1 base, luego iniciar P0.3.

