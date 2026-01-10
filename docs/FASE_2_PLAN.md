# 📋 FASE 2 - Plan de Implementación

**Objetivo:** Implementar operaciones avanzadas de ganadería regenerativa con enfoque en medición, planificación y validación.

**Estado Global:** 60% COMPLETADO (3/6 prioridades)

---

## 🎯 Prioridades P0 (Críticas)

### ✅ P0.3 - Aforos Reales en Materia Seca
**Estado:** COMPLETADO  
**Tests:** 9/9 passing  
**Fecha Cierre:** 19 enero 2025

**Descripción:**
Endpoint para consultar forraje disponible en kg de materia seca (MS) para un potrero.

**Implementación:**
- DTO: `AvailableForageResponse`
- Service: `ForageService.getAvailableForage()`
- Endpoint: `GET /forage-samples/paddock/:paddockId/available`
- Formula: `totalAvailableKgMS = availableForageKgMS × hectares`

**Casos de Uso:**
- Dashboard: mostrar disponibilidad MS por potrero
- Planeación: calcular carga animal óptima
- Monitoreo: comparar MS antes/después rotación

**Archivos:**
- `packages/shared/src/index.ts` → AvailableForageResponseSchema
- `apps/api/src/forage/forage.service.ts` → getAvailableForage()
- `apps/api/src/forage/forage.controller.ts` → GET endpoint
- `apps/api/src/forage/forage.service.spec.ts` → 9 tests

---

### ✅ P0.4 - Días Recomendados de Rotación
**Estado:** COMPLETADO  
**Tests:** 7/7 passing  
**Fecha Cierre:** 19 enero 2025

**Descripción:**
Calcular cuántos días puede pastar el hato en un potrero según forraje disponible y consumo diario.

**Implementación:**
- DTO: `RecommendedDaysResponse`
- Service: `PaddockService.getRecommendedDays()`
- Endpoint: `GET /paddocks/:id/recommended-days?intakePercent=2.0`
- Formula: `recommendedDays = totalAvailableKgMS / (totalHerdWeightKg × intakePercent)`

**Business Logic:**
```typescript
dailyConsumptionKgMS = totalHerdWeightKg × (intakePercent / 100)
recommendedDays = totalAvailableKgMS / dailyConsumptionKgMS

// Rotation Advice (Spanish):
- ≤0 días: "Rote inmediatamente"
- <3 días: "Cerca del límite, planificar rotación urgente"
- 3-7 días: "Monitorear consumo diario"
- ≥7 días: "Buena disponibilidad de forraje"
```

**Casos de Uso:**
- Dashboard: "días restantes" en potreros ocupados
- Alertas: notificar cuando <3 días
- Planeación: preparar siguiente potrero con tiempo

**Archivos:**
- `packages/shared/src/index.ts` → RecommendedDaysResponseSchema
- `apps/api/src/paddock/paddock.service.ts` → getRecommendedDays()
- `apps/api/src/paddock/paddock.controller.ts` → GET endpoint
- `apps/api/src/paddock/paddock.service.spec.ts` → +7 tests (total 13)

---

### ✅ P0.5 - Validación Descanso del Potrero
**Estado:** COMPLETADO  
**Tests:** 7/7 passing  
**Fecha Cierre:** 19 enero 2025

**Descripción:**
Validar que un potrero descanse mínimo 30 días desde su última salida (exitDate) antes de permitir nuevo ingreso.

**Implementación:**
- Service: `MovementService.validateMinimumRestDays()` (enhanced)
- Integración: Automática en `MovementService.create()`
- Error: JSON estructurado con detalles y fecha recomendada

**Business Logic:**
```typescript
// 1. Buscar último movimiento CLOSED con exitDate !== null
lastClosedMovement = await prisma.movement.findFirst({
  where: { paddockId, status: 'CLOSED', exitDate: { not: null } },
  orderBy: { exitDate: 'desc' }
});

// 2. Si no hay movimiento previo → permitir (primer ingreso)
if (!lastClosedMovement) return;

// 3. Calcular días de descanso
actualRestDays = Math.floor((entryDate - lastExitDate) / 86400000);

// 4. Validar contra parámetro (default 30 días)
if (actualRestDays < minRestDays) {
  throw new BadRequestException({
    message: "El potrero no ha descansado lo suficiente",
    details: {
      minRestDaysRequired: 30,
      daysRested: actualRestDays,
      daysShort: minRestDays - actualRestDays,
      lastExitDate: lastExitDate.toISOString(),
      recommendedEntryDate: recommendedDate.toISOString(),
      advice: `El potrero necesita ${daysShort} días más...`
    }
  });
}
```

**Casos de Uso:**
- Prevención: bloquear entradas prematuras
- Educación: mensaje claro con fecha recomendada
- Auditoría: garantizar prácticas regenerativas

**Archivos:**
- `apps/api/src/movement/movement.service.ts` → validateMinimumRestDays() enhanced
- `apps/api/src/movement/movement.service.spec.ts` → +7 tests (total 16)

---

### ⏳ P0.6 - Pesajes Históricos
**Estado:** PENDIENTE  
**Prioridad:** ALTA  
**Estimación:** 1.5-2 horas

**Descripción:**
Endpoint para consultar historial de pesajes de un hato con paginación, ordenamiento y filtros.

**Implementación Requerida:**

**1. GET /weighings/herd/:herdId/history**
```typescript
Query Params:
- limit: number (default 50)
- offset: number (default 0)
- sort: 'asc' | 'desc' (default 'desc')
- startDate: ISO date (opcional)
- endDate: ISO date (opcional)

Response:
{
  herdId: string;
  herdName: string;
  totalCount: number;
  weighings: [
    {
      id: string;
      weight: number;
      uaValue: number;
      weighedAt: Date;
      notes: string | null;
    }
  ];
  pagination: {
    limit: number;
    offset: number;
    hasMore: boolean;
  }
}
```

**2. POST /weighings Enhancements**
```typescript
// Al crear pesaje:
1. Actualizar herd.currentWeight = weight
2. Recalcular herd.currentUA = weight / 450
3. Emitir evento para recalcular stocking rate
4. Auditoría de cambio
```

**Business Logic:**
- Ordenar por weighedAt desc (más reciente primero)
- Paginación eficiente con `skip` y `take`
- Filtros de rango de fechas (`gte`, `lte`)
- Incluir solo pesajes del hato solicitado
- Auth: usuario debe tener acceso a la finca del hato

**Test Cases (9):**
1. ✅ GET con paginación retorna pesos ordenados desc
2. ✅ GET con limit/offset calcula hasMore correctamente
3. ✅ GET con sort='asc' ordena ascendente
4. ✅ GET con startDate/endDate filtra rango
5. ✅ GET con herdId inválido → 404 NotFound
6. ✅ POST actualiza herd.currentWeight correctamente
7. ✅ POST recalcula herd.currentUA (weight/450)
8. ✅ Auth requerido - ForbiddenException sin acceso
9. ✅ Pagination totalCount incluye filtros

**Archivos a Modificar:**
- `packages/shared/src/index.ts` → WeighingHistoryResponse
- `apps/api/src/weighing/weighing.service.ts` → getHistory()
- `apps/api/src/weighing/weighing.controller.ts` → GET endpoint
- `apps/api/src/weighing/weighing.service.spec.ts` → +9 tests

---

## 🎯 Prioridades P1 (Importantes)

### ⏳ P1.1 - Dashboard de Rotación
**Estado:** PENDIENTE  
**Dependencias:** P0.3, P0.4, P0.5 ✅

**Descripción:**
Visualización frontend que muestra estado de todos los potreros:
- Potreros ocupados: días restantes de forraje
- Potreros en descanso: días transcurridos / días mínimos
- Potreros disponibles: kg MS disponibles

**Componentes:**
- `apps/web/src/components/dashboard/RotationDashboard.tsx`
- Cards por estado: OCCUPIED, RESTING, AVAILABLE
- Colores: Verde (>7 días), Amarillo (3-7), Rojo (<3)
- Integración con P0.3, P0.4 endpoints

---

### ⏳ P1.2 - Alertas de Rotación
**Estado:** PENDIENTE  
**Dependencias:** P0.4 ✅

**Descripción:**
Sistema de notificaciones cuando:
- Forraje <3 días → alerta urgente
- Descanso <minRestDays → bloqueo visual
- Pesaje >30 días sin actualizar → recordatorio

**Implementación:**
- Polling cada 5 minutos (dashboard)
- WebSocket para alertas real-time (futuro)
- Notificaciones browser (Permission API)

---

### ⏳ P1.3 - Reportes Mensuales
**Estado:** PENDIENTE  
**Dependencias:** P0.6

**Descripción:**
Generar PDF con métricas del mes:
- Total rotaciones realizadas
- Promedio días de ocupación
- Promedio días de descanso
- Ganancia de peso total del hato
- Carga animal promedio (UA/ha)

**Stack:**
- `puppeteer` para PDF generation
- Template HTML/CSS con charts
- Endpoint: `GET /reports/monthly/:farmId?month=2025-01`

---

## 📊 Métricas de Progreso

### Tests por Módulo

| Módulo | FASE 1 | P0.3 | P0.4 | P0.5 | P0.6 | Total |
|--------|--------|------|------|------|------|-------|
| Auth | 9 | - | - | - | - | 9 |
| Farm | 6 | - | - | - | - | 6 |
| Paddock | 6 | - | 7 | - | - | 13 |
| Forage | 0 | 9 | - | - | - | 9 |
| Herd | 15 | - | - | - | - | 15 |
| Movement | 9 | - | - | 7 | - | 16 |
| Weighing | 6 | - | - | - | 9* | 15* |
| Dashboard | 6 | - | - | - | - | 6 |
| Parameter | 6 | - | - | - | - | 6 |
| **Total** | **63** | **9** | **7** | **7** | **9*** | **95*** |

*Estimado para P0.6

### Estado Global

- **FASE 1:** ✅ 63/63 tests (100%)
- **P0.3:** ✅ 9/9 tests (100%)
- **P0.4:** ✅ 7/7 tests (100%)
- **P0.5:** ✅ 7/7 tests (100%)
- **P0.6:** ⏳ 0/9 tests (0%)
- **Total FASE 2:** 23/32 tests (72%)

### Endpoints Implementados

| Endpoint | Método | Auth | Estado |
|----------|--------|------|--------|
| `/forage-samples/paddock/:id/available` | GET | ✅ | ✅ |
| `/paddocks/:id/recommended-days` | GET | ✅ | ✅ |
| `/movements` (con validación descanso) | POST | ✅ | ✅ |
| `/weighings/herd/:id/history` | GET | ✅ | ⏳ |

---

## 🚀 Próximos Pasos

### Inmediatos (P0.6)
1. Implementar `WeighingService.getHistory()`
2. Añadir query params (limit, offset, sort, dates)
3. Crear `WeighingHistoryResponseSchema`
4. Añadir GET endpoint en controller
5. Escribir 9 test cases
6. Mejorar POST para actualizar herd.currentWeight/UA
7. Verificar build + tests (esperar 95/95)

### Corto Plazo (P1)
1. Dashboard de rotación (frontend)
2. Integración P0.3/P0.4 en UI
3. Sistema de alertas básico
4. Tests E2E con Playwright

### Mediano Plazo
1. Reportes PDF mensuales
2. WebSocket para alertas real-time
3. Gráficas de tendencias (recharts)
4. Exportación Excel

---

## 📚 Documentación Relacionada

- `FASE_1_COMPLETE.md` - Base de 63 tests ✅
- `FASE_2_P0.3_P0.5_COMPLETE.md` - Cierre P0.3-P0.5 ✅
- `docs/modelo_datos.md` - Esquema Prisma
- `docs/calculos.md` - Fórmulas regenerativas
- `docs/arquitectura.md` - Clean Architecture aplicada

---

## 🎯 Criterios de Aceptación FASE 2

### Para cerrar completamente FASE 2:

- [ ] P0.3 Aforos Reales: ✅ COMPLETO
- [ ] P0.4 Días Recomendados: ✅ COMPLETO
- [ ] P0.5 Validación Descanso: ✅ COMPLETO
- [ ] P0.6 Pesajes Históricos: ⏳ PENDIENTE
- [ ] P1.1 Dashboard Rotación: ⏳ PENDIENTE (opcional para cierre P0)
- [ ] P1.2 Alertas: ⏳ PENDIENTE (opcional)
- [ ] P1.3 Reportes: ⏳ PENDIENTE (opcional)
- [ ] Tests: ≥95 passing
- [ ] Build: `npm run build` exitoso
- [ ] Swagger: Todos los endpoints P0 documentados
- [ ] README actualizado con nuevas features

---

**Última Actualización:** 19 enero 2025  
**Estado:** 3/4 P0 completados (75% críticas)  
**Tests:** 86/95 passing (91%)  
**Próximo Hito:** P0.6 Pesajes Históricos
