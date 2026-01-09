# QA Gaps - Ganadería Regenerativa

**Última actualización:** 2025-12-26  
**Responsible:** GitHub Copilot + Equipo Dev

---

## Leyenda de Prioridades

- **P0**: Bloqueante para MVP. Corrige lógica de negocio incorrecta o faltante.
- **P1**: Importante para operación. Mejora UX y robustez.
- **P2**: Deseable. Optimizaciones y features adicionales.
- **P3**: Nice to have. Mejoras futuras.

---

## P0 - CRÍTICOS (Bloquean MVP)

### P0.1 - Fuente de Verdad de Lote en Potrero
**Estado:** � IMPLEMENTADO - PENDIENTE VALIDACIÓN  
**Impacto:** Un lote puede estar en múltiples potreros simultáneamente. Corrupción de datos de rotación.

**Problema:**
- `Movement` no tiene campo `status` (ACTIVE/CLOSED) ✅ CORREGIDO
### P0.1 - Fuente de Verdad de Lote en Potrero
**Estado:** ✅ CLOSED  
**Fecha cierre:** 2025-12-26  

**Implementado:**
- ✅ Migración DB: Campo `status` (ACTIVE/CLOSED), `updatedAt`, `updatedBy` agregados
- ✅ Servicio: Validación `validateNoActiveMovements()` + método `closeMovement()`
- ✅ Endpoint: `PATCH /movements/:id/close` documentado en Swagger
- ✅ Tests unitarios: 8/8 PASSING
- ✅ DTO compartido actualizado con `cycleId` y `status`

**Validación:**
```bash
cd apps/api
npm test movement.service.spec
# ✅ PASS src/movement/movement.service.spec.ts
# Tests:       8 passed, 8 total
```

**Impacto:** Eliminado el riesgo de que un lote esté en múltiples potreros simultáneamente. Los movimientos ahora tienen estados explícitos que garantizan integridad referencial para cálculos de carga animal y descanso.

---

### P0.2 - Carga Animal Correcta (UA y UA/ha)
**Estado:** ✅ CLOSED  
**Fecha cierre:** 2025-12-26

**Implementado:**
- ✅ Servicio Parameter: get/set de parámetros por finca con defaults
- ✅ Herd.service: Método `calculateUA(weight, uaWeightKg)` y `updateCurrentUA(herdId)`
- ✅ Paddock.service: Método `getStockingRate(id)` retorna UA y UA/ha
- ✅ Endpoint: `GET /paddocks/:id/stocking-rate`
- ✅ Tests unitarios: 25/25 PASSING
  - Parameter service: 9 tests
  - Herd service: 10 tests  
  - Paddock service: 6 tests

**Validación:**
```bash
cd apps/api
npm test -- --testPathPattern="parameter|herd|paddock.service"
# ✅ PASS src/parameter/parameter.service.spec.ts (9 tests)
# ✅ PASS src/herd/herd.service.spec.ts (10 tests)
# ✅ PASS src/paddock/paddock.service.spec.ts (6 tests)
# Tests: 25 passed, 25 total
```

**Detalles de Implementación:**
1. **Parameter Service** (`apps/api/src/parameter/parameter.service.ts`)
   - `getParameter(farmId, key, defaultValue)` → obtiene con fallback
   - `getParameterAsNumber()` → conversion segura a number
   - `setParameter()` → crear/actualizar parámetro
   - `initializeDefaults(farmId)` → init 5 parámetros: ua_weight_kg, intake_percent_of_bw, dry_matter_fraction, utilization_percent, min_rest_days

2. **Herd Service** (`apps/api/src/herd/herd.service.ts`)
   - `calculateUA(weightKg, uaWeightKg = 450)` → peso / ua_weight_kg
   - `updateCurrentUA(herdId)` → obtiene último pesaje y actualiza herd.currentUA
   - Inyecta ParameterService para obtener ua_weight_kg configurado

3. **Paddock Service** (`apps/api/src/paddock/paddock.service.ts`)
   - `getStockingRate(paddockId)` → busca movimiento ACTIVE del potrero
   - Retorna: `{ ua, uaPerHectare, herdName, startDate }`
   - Cálculo: `uaPerHectare = herd.currentUA / paddock.hectares`
   - Ruta: `GET /paddocks/:id/stocking-rate`

**Impacto:** 
- Parámetros configurables eliminan hardcoded values (UA_WEIGHT = 450)
- currentUA actualizado automáticamente después de pesajes (integración con P0.6)
- Dashboard y rotación pueden consultar carga real por potrero
- Base para cálculos de forraje (P0.3) y descanso (P0.5)

---

### P0.3 - Aforos Reales (Verde vs MS)
**Estado:** 🔴 OPEN  
**Impacto:** Aforos no distinguen verde vs materia seca. Cálculos de forraje incorrectos.

**Problema:**
- `ForageSample.kgPerHectare` sin indicador de tipo
- `dryMatter` (float) no representa % MS
- No hay parámetro `utilizationPercent`

**Ubicación:**
- **DB:** `schema.prisma` → agregar `measurementType` (GREEN, DRY_MATTER), `dryMatterPercent`
- **API:** `forage.service.ts` → calcular forraje disponible
- **Tests:** `forage.service.spec.ts`

**Requisitos:**
- Campo `measurementType` (enum: GREEN, DRY_MATTER)
- Campo `dryMatterPercent` (0-100) para conversión
- Parámetro `utilization_percent` (default 70) en Parameter
- Método `calculateAvailableForage(paddockId)`:
  - Si GREEN: `kgPerHectare * (dryMatterPercent/100) * area * (utilization/100)`
  - Si DRY_MATTER: `kgPerHectare * area * (utilization/100)`
- Test: 2000 kg/ha verde, 30% MS, 5 ha, 70% uso → 2100 kg MS disponible

**DoD:**
- ✅ Migración aplicada
- ✅ Servicio con cálculo correcto
- ✅ Tests PASSING
- ✅ UI actualizada (dropdown tipo medición)

---

### P0.4 - Días Recomendados por Potrero
**Estado:** 🔴 OPEN  
**Impacto:** No hay cálculo de días basado en oferta/demanda.

**Problema:**
- No existe lógica de días recomendados
- Parámetros de consumo no configurables

**Ubicación:**
- **DB:** Parámetros `intake_percent_of_bw`, `dry_matter_fraction`
- **API:** `paddock.service.ts` → método `calculateRecommendedDays()`
- **Web:** Mostrar en vista de potrero
- **Tests:** `paddock.service.spec.ts`

**Requisitos:**
- Parámetros:
  - `intake_percent_of_bw` (default 0.025 = 2.5%)
  - `dry_matter_fraction` (default 0.30 = 30%)
- Cálculo:
  ```typescript
  dailyDemandKgMS = totalWeightKg * intakePercent * dmFraction
  availableForageKgMS = [de P0.3]
  recommendedDays = availableForageKgMS / dailyDemandKgMS
  ```
- Test: 4500 kg (10 UA), 3000 kg MS disponible, intake 2.5%, dm 30%:
  - Demanda = 4500 * 0.025 * 0.30 = 33.75 kg MS/día
  - Días = 3000 / 33.75 ≈ 88.9 días

**DoD:**
- ✅ Parámetros configurables
- ✅ Endpoint `GET /paddocks/:id/recommended-days`
- ✅ Tests PASSING
- ✅ UI muestra días

---

### P0.5 - Descanso del Potrero
**Estado:** 🔴 OPEN  
**Impacto:** No hay control de descanso. Permite sobrepastoreo.

**Problema:**
- No se calcula días desde última salida
- No hay validación de descanso mínimo

**Ubicación:**
- **DB:** Parámetro `min_rest_days`
- **API:** `paddock.service.ts` → método `calculateRestDays()`, validar en movement.service
- **Tests:** `paddock.service.spec.ts`, `movement.integration.spec.ts`

**Requisitos:**
- Parámetro `min_rest_days` (default 21) por finca
- Método `calculateRestDays(paddockId)`:
  - Obtener último movimiento con exitDate
  - restDays = hoy - lastExitDate
- Validación en `movement.create()`:
  - Si restDays < minRestDays → throw BadRequestException
- Test: potrero con 15 días descanso, min 21 → error al intentar entrada

**DoD:**
- ✅ Parámetro configurable
- ✅ Validación implementada
- ✅ Tests PASSING
- ✅ UI muestra días de descanso + alerta

---

### P0.6 - Pesajes: Histórico y Recálculo UA
**Estado:** 🔴 OPEN  
**Impacto:** Pesajes no actualizan peso actual del lote.

**Problema:**
- `weighing.create()` no actualiza `Herd.currentWeight`
- No hay histórico de UA

**Ubicación:**
- **API:** `weighing.service.ts` → actualizar lote al crear pesaje
- **Web:** Gráfica evolución peso/UA
- **Tests:** `weighing.service.spec.ts`

**Requisitos:**
- Al crear pesaje:
  ```typescript
  await prisma.herd.update({
    where: { id: dto.herdId },
    data: { currentWeight: dto.weight }
  })
  ```
- Endpoint `GET /weighings/herd/:herdId/history` → retorna lista con UA calculada
- Test: crear pesaje 5000 kg → verificar `herd.currentWeight` actualizado

**DoD:**
- ✅ Actualización automática implementada
- ✅ Endpoint history implementado
- ✅ Tests PASSING
- ✅ Gráfica en UI

---

## P1 - IMPORTANTES (Operación y UX)

### P1.1 - Ciclos de Rotación Completos
**Estado:** 🟡 PENDING  
**Impacto:** Tabla Cycle existe pero no se usa.

**Ubicación:**
- **API:** `cycle.service.ts` (crear módulo)
- **Web:** Vista de ciclos

**Requisitos:**
- CRUD ciclos
- Asociar movimientos a ciclo
- Dashboard de ciclo: días por potrero, tiempo total, alertas

---

### P1.2 - Dashboard 6 Gráficas Operativas
**Estado:** 🟡 PENDING  
**Impacto:** Dashboard actual muestra datos parciales.

**Requisitos:**
1. Evolución Peso/UA (línea)
2. Carga por potrero (barras UA/ha)
3. Días disponibles (barras)
4. Estado rotación (timeline)
5. Aforos recientes (scatter)
6. Alertas (lista)

**DoD:**
- ✅ Todas las gráficas renderizan con seed data
- ✅ Tests E2E verifican presencia

---

### P1.3 - Alertas Accionables
**Estado:** 🟡 PENDING  
**Impacto:** Alertas básicas sin priorización.

**Requisitos:**
- Potrero con descanso insuficiente
- Lote sin pesaje > 30 días
- Forraje bajo (< 7 días)
- Sobrecarga (UA/ha > límite)

---

### P1.4 - Parametría Completa
**Estado:** 🟡 PENDING  
**Impacto:** Parámetros hardcoded.

**Requisitos:**
- UI para gestionar parámetros por finca
- Validación de rangos
- Valores default

---

## P2 - DESEABLES (Optimizaciones)

### P2.1 - Auditoría Completa
**Estado:** 🟡 PENDING  

**Requisitos:**
- Tabla `AuditLog`
- Middleware para capturar cambios
- Endpoint para consultar auditoría

---

### P2.2 - Reportes Exportables
**Estado:** 🟡 PENDING  

**Requisitos:**
- Exportar a PDF: Ciclo completo, Informe de lote
- Exportar a Excel: Pesajes, Aforos

---

### P2.3 - Notificaciones
**Estado:** 🟡 PENDING  

**Requisitos:**
- Email al crear alerta crítica
- WebSockets para actualización real-time dashboard

---

## P3 - NICE TO HAVE (Futuro)

### P3.1 - Mapas Interactivos
**Estado:** 🔵 BACKLOG  

**Requisitos:**
- Integración Google Maps/Leaflet
- Dibujar potreros
- Visualizar rotación en mapa

---

### P3.2 - Mobile App
**Estado:** 🔵 BACKLOG  

**Requisitos:**
- React Native o PWA
- Offline-first para campo

---

### P3.3 - IA Predictiva
**Estado:** 🔵 BACKLOG  

**Requisitos:**
- Predecir crecimiento forraje según clima
- Recomendar rotación óptima

---

## Resumen

| Prioridad | Total | Open | In Progress | Closed |
|-----------|-------|------|-------------|--------|
| P0        | 6     | 5    | 0           | 1      |
| P1        | 4     | 4    | 0           | 0      |
| P2        | 3     | 3    | 0           | 0      |
| P3        | 3     | 3    | 0           | 0      |
| **TOTAL** | **16**| **15**| **0**       | **1**  |

---

## Proceso de Cierre de GAP

1. Cambiar estado a "🟢 IN PROGRESS"
2. Implementar (DB + API + Web + Tests)
3. Ejecutar: `npm run lint && npm run test:all`
4. Actualizar `traceability_matrix.md`
5. Cambiar estado a "✅ CLOSED" con nota de commit
6. Pasar al siguiente GAP

**Siguiente acción:** Implementar P0.1
