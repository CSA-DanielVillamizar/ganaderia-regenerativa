# Traceability Matrix - Ganadería Regenerativa

**Versión:** 0.1.0  
**Última actualización:** 2025-12-26

---

## Formato

| ID | Requisito | UI | API Endpoint | Service/Logic | DB Model | Test Unit | Test API | Test E2E | Estado |
|----|-----------|----|--------------|--------------:|----------|-----------|----------|----------|--------|

**Estados:**
- ✅ IMPLEMENTADO: Código existe y tests pasan
- ⚠️ PARCIAL: Código existe sin tests o tests sin implementar
- ❌ FALTANTE: No implementado

---

## R1 - Autenticación y Usuarios

| ID | Requisito | UI | API | Service | DB | Unit | API Test | E2E | Estado |
|----|-----------|----|----|---------|----|----|----------|-----|--------|
| R1.1 | Login usuario | `app/auth/login` | `POST /auth/login` | `auth.service.ts` | User | ❌ | ❌ | ❌ | ⚠️ |
| R1.2 | Registro usuario | - | `POST /auth/register` | `auth.service.ts` | User | ❌ | ❌ | ❌ | ⚠️ |
| R1.3 | Refresh token | - | `POST /auth/refresh` | `auth.service.ts` | User | ❌ | ❌ | ❌ | ⚠️ |
| R1.4 | Logout | `layout` | - | Frontend only | - | - | - | ❌ | ⚠️ |
| R1.5 | Guards RBAC | - | All protected routes | Guards (JWT, Roles) | - | ❌ | ❌ | - | ⚠️ |

---

## R2 - Fincas (Farms)

| ID | Requisito | UI | API | Service | DB | Unit | API Test | E2E | Estado |
|----|-----------|----|----|---------|----|----|----------|-----|--------|
| R2.1 | Crear finca | `app/farms/new` | `POST /farms` | `farm.service.ts` | Farm | ❌ | ❌ | ❌ | ⚠️ |
| R2.2 | Listar fincas | `app/farms` | `GET /farms` | `farm.service.ts` | Farm | ❌ | ❌ | ❌ | ⚠️ |
| R2.3 | Ver detalle finca | `app/farms/[id]` | `GET /farms/:id` | `farm.service.ts` | Farm | ❌ | ❌ | ❌ | ⚠️ |
| R2.4 | Editar finca | `app/farms/[id]/edit` | `PATCH /farms/:id` | `farm.service.ts` | Farm | ❌ | ❌ | ❌ | ⚠️ |
| R2.5 | Eliminar finca (soft) | - | `DELETE /farms/:id` | `farm.service.ts` | Farm | ❌ | ❌ | - | ⚠️ |
| R2.6 | Gestionar accesos (UserFarm) | - | `POST /farms/:id/users` | `farm.service.ts` | UserFarm | ❌ | ❌ | - | ❌ |

---

## R3 - Potreros (Paddocks)

| ID | Requisito | UI | API | Service | DB | Unit | API Test | E2E | Estado |
|----|-----------|----|----|---------|----|----|----------|-----|--------|
| R3.1 | Crear potrero | `app/farms/[id]/paddocks/new` | `POST /paddocks` | `paddock.service.ts` | Paddock | ❌ | ❌ | ❌ | ⚠️ |
| R3.2 | Listar potreros | `app/farms/[id]/paddocks` | `GET /farms/:farmId/paddocks` | `paddock.service.ts` | Paddock | ❌ | ❌ | ❌ | ⚠️ |
| R3.3 | Ver detalle potrero | `app/farms/[id]/paddocks/[pid]` | `GET /paddocks/:id` | `paddock.service.ts` | Paddock | ❌ | ❌ | ❌ | ⚠️ |
| R3.4 | Editar potrero | - | `PATCH /paddocks/:id` | `paddock.service.ts` | Paddock | ❌ | ❌ | - | ⚠️ |
| R3.5 | Eliminar potrero (soft) | - | `DELETE /paddocks/:id` | `paddock.service.ts` | Paddock | ❌ | ❌ | - | ⚠️ |
| R3.6 | **[P0.4] Días recomendados** | - | `GET /paddocks/:id/recommended-days` | `paddock.service.ts` | Paddock, ForageSample, Herd | ❌ | ❌ | - | ❌ |
| R3.7 | **[P0.5] Calcular descanso** | `components` | `GET /paddocks/:id/rest-days` | `paddock.service.ts` | Movement | ❌ | ❌ | - | ❌ |
| R3.8 | **[P0.2] Carga animal (UA/ha)** | - | `GET /paddocks/:id/stocking-rate` | `paddock.service.ts` | Paddock, Herd, Movement | ❌ | ❌ | - | ❌ |

---

## R4 - Lotes (Herds)

| ID | Requisito | UI | API | Service | DB | Unit | API Test | E2E | Estado |
|----|-----------|----|----|---------|----|----|----------|-----|--------|
| R4.1 | Crear lote | `app/farms/[id]/herds/new` | `POST /herds` | `herd.service.ts` | Herd | ❌ | ❌ | ❌ | ⚠️ |
| R4.2 | Listar lotes | `app/farms/[id]/herds` | `GET /farms/:farmId/herds` | `herd.service.ts` | Herd | ❌ | ❌ | ❌ | ⚠️ |
| R4.3 | Ver detalle lote | `app/farms/[id]/herds/[hid]` | `GET /herds/:id` | `herd.service.ts` | Herd | ❌ | ❌ | ❌ | ⚠️ |
| R4.4 | Editar lote | - | `PATCH /herds/:id` | `herd.service.ts` | Herd | ❌ | ❌ | - | ⚠️ |
| R4.5 | Eliminar lote (soft) | - | `DELETE /herds/:id` | `herd.service.ts` | Herd | ❌ | ❌ | - | ⚠️ |
| R4.6 | **[P0.2] Calcular UA actual** | - | Computed in service | `herd.service.ts` | Herd.currentUA | ❌ | ❌ | - | ❌ |
| R4.7 | **[P0.2] Actualizar UA al pesar** | - | Side effect en weighing | `weighing.service.ts` | Herd | ❌ | ❌ | - | ❌ |

---

## R5 - Movimientos (Rotación) [SPRINT 1]

| ID | Requisito | UI | API | Service | DB | Unit | API Test | E2E | Estado |
|----|-----------|----|----|---------|----|----|----------|-----|--------|
| R5.1 | **[P0.3.1]** Crear movimiento (entrada) | `<HerdMovementForm>` | `POST /movements` | `movement.service.ts` | Movement | ✅ | ✅ | ✅ | 🟢 Sprint1 |
| R5.2 | **[P0.3.2]** Cerrar movimiento (salida) | Button + Modal | `PATCH /movements/:id/close` | `movement.service.ts` | Movement, Paddock | ✅ | ✅ | ✅ | 🟢 Sprint1 |
| R5.3 | **[P0.3.7]** Listar movimientos histórico | `<MovementHistory>` | `GET /herds/:id/movements/history?days=60` | `movement.service.ts` | Movement | ✅ | ✅ | ✅ | 🟢 Sprint1 |
| R5.4 | **[P0.3.3]** Validar no solapamiento | Error handler | Validation en create | `movement.service.ts` | Movement | ✅ | ✅ | ✅ | 🟢 Sprint1 |
| R5.5 | **[P0.3.4]** Validar descanso mínimo | UI bloqueante | Validation en create | `movement.service.ts` | Parameter, Paddock | ✅ | ✅ | ✅ | 🟢 Sprint1 |
| R5.6 | **[P0.3.2]** Calcular días ocupación | Display badge | Computed | `movement.service.ts` | Movement | ✅ | ✅ | - | 🟢 Sprint1 |
| R5.7 | **[P0.3.1]** Get rest days paddles | Selector filter | `GET /paddocks/:id/rest-days` | `paddock.service.ts` | Paddock, Movement | ✅ | ✅ | - | 🟢 Sprint1 |
| R5.8 | **[P0.3.6]** Status semáforo potrero | `<PaddockMap>` colores | `GET /paddocks/:id/status` | `paddock.service.ts` | Paddock, Movement | ✅ | ✅ | ✅ | 🟢 Sprint1 |
| R5.9 | **[P0.3.5]** Estado actual del lote | `<HerdStatusCard>` | `GET /herds/:id` enhanced | `herd.service.ts` | Movement | ✅ | ✅ | - | 🟢 Sprint1 |

---

## R6 - Aforos (ForageSamples)

| ID | Requisito | UI | API | Service | DB | Unit | API Test | E2E | Estado |
|----|-----------|----|----|---------|----|----|----------|-----|--------|
| R6.1 | Crear aforo | `app/paddocks/[id]/forage/new` | `POST /forage` | `forage.service.ts` | ForageSample | ❌ | ❌ | ❌ | ⚠️ |
| R6.2 | Listar aforos de potrero | `app/paddocks/[id]` | `GET /forage/paddock/:paddockId` | `forage.service.ts` | ForageSample | ❌ | ❌ | - | ⚠️ |
| R6.3 | **[P0.3] Tipo medición (verde/MS)** | - | Field `measurementType` | `forage.service.ts` | ForageSample.measurementType | ❌ | ❌ | - | ❌ |
| R6.4 | **[P0.3] % Materia seca** | - | Field `dryMatterPercent` | `forage.service.ts` | ForageSample.dryMatterPercent | ❌ | ❌ | - | ❌ |
| R6.5 | **[P0.3] Forraje disponible (kg MS)** | - | `GET /forage/:id/available` | `forage.service.ts` | Computed | ❌ | ❌ | - | ❌ |

---

## R7 - Pesajes (Weighings)

| ID | Requisito | UI | API | Service | DB | Unit | API Test | E2E | Estado |
|----|-----------|----|----|---------|----|----|----------|-----|--------|
| R7.1 | Crear pesaje | `app/herds/[id]/weigh` | `POST /weighings` | `weighing.service.ts` | Weighing | ❌ | ❌ | ❌ | ⚠️ |
| R7.2 | Listar pesajes de lote | `app/herds/[id]/weighings` | `GET /weighings/herd/:herdId` | `weighing.service.ts` | Weighing | ❌ | ❌ | - | ⚠️ |
| R7.3 | **[P0.6] Actualizar peso lote** | - | Side effect | `weighing.service.ts` | Herd.currentWeight | ❌ | ❌ | - | ❌ |
| R7.4 | **[P0.6] Histórico UA** | - | `GET /weighings/herd/:id/history` | `weighing.service.ts` | Computed | ❌ | ❌ | - | ❌ |
| R7.5 | Calcular ganancia diaria | - | Computed | `weighing.service.ts` | Computed | ❌ | ❌ | - | ⚠️ |

---

## R8 - Dashboard

| ID | Requisito | UI | API | Service | DB | Unit | API Test | E2E | Estado |
|----|-----------|----|----|---------|----|----|----------|-----|--------|
| R8.1 | Resumen general | `app/dashboard` | `GET /dashboard/summary` | `dashboard.service.ts` | Multiple | ❌ | ❌ | ❌ | ⚠️ |
| R8.2 | **Gráfica 1: Evolución peso/UA** | `components` | `GET /dashboard/trends` | `dashboard.service.ts` | Weighing | ❌ | ❌ | ❌ | ⚠️ |
| R8.3 | **Gráfica 2: Carga por potrero** | `components` | Custom | `dashboard.service.ts` | Paddock, Herd, Movement | ❌ | ❌ | ❌ | ❌ |
| R8.4 | **Gráfica 3: Días disponibles** | `components` | Custom | `paddock.service.ts` | Paddock, ForageSample | ❌ | ❌ | ❌ | ❌ |
| R8.5 | **Gráfica 4: Estado rotación** | `components` | `GET /dashboard/rotation-status` | `dashboard.service.ts` | Movement | ❌ | ❌ | ❌ | ⚠️ |
| R8.6 | **Gráfica 5: Aforos recientes** | `components` | `GET /dashboard/forage-stats` | `dashboard.service.ts` | ForageSample | ❌ | ❌ | ❌ | ⚠️ |
| R8.7 | **Gráfica 6: Alertas** | `components` | `GET /dashboard/alerts` | `dashboard.service.ts` | Multiple | ❌ | ❌ | ❌ | ⚠️ |

---

## R9 - Parámetros Configurables [P0.2 Parte]

| ID | Requisito | UI | API | Service | DB | Unit | API Test | E2E | Estado |
|----|-----------|----|----|---------|----|----|----------|-----|--------|
| R9.1 | **[P0.2] Listar parámetros finca** | - | `GET /parameters?farmId=X` | `parameter.service.ts` | Parameter | ✅ | ❌ | - | ✅ |
| R9.2 | **[P0.2] Obtener parámetro con default** | - | Internal API | `parameter.service.ts.getParameter()` | Parameter | ✅ | - | - | ✅ |
| R9.3 | **[P0.2] Set parámetro** | - | Internal API | `parameter.service.ts.setParameter()` | Parameter | ✅ | ❌ | - | ✅ |
| R9.4 | **[P0.2] ua_weight_kg default 450** | - | Parameter | `parameter.service.ts` | Parameter | ✅ | - | - | ✅ |
| R9.5 | **[P0.2] currentUA en Herd** | - | Internal | `herd.service.ts.updateCurrentUA()` | Herd | ✅ | - | - | ✅ |
| R9.6 | **[P0.2] GET /paddocks/:id/stocking-rate** | - | `GET /paddocks/:id/stocking-rate` | `paddock.service.ts.getStockingRate()` | Movement + Herd | ✅ | ❌ | - | ✅ |
| R9.7 | **[P0.3] utilization_percent** | - | Parameter | `parameter.service.ts` | Parameter | ⚠️ | - | - | ⚠️ |
| R9.8 | **[P0.4] intake_percent_of_bw** | - | Parameter | `parameter.service.ts` | Parameter | ⚠️ | - | - | ⚠️ |
| R9.9 | **[P0.4] dry_matter_fraction** | - | Parameter | `parameter.service.ts` | Parameter | ⚠️ | - | - | ⚠️ |
| R9.10 | **[P0.5] min_rest_days** | - | Parameter | `parameter.service.ts` | Parameter | ⚠️ | - | - | ⚠️ |

**Detalle P0.2 Implementado:**
- ✅ Parameter service con 9 unit tests (getParameter, getParameterAsNumber, setParameter, listByFarm, initializeDefaults)
- ✅ Herd service: calculateUA (6 tests), updateCurrentUA (4 tests)
- ✅ Paddock service: getStockingRate (6 tests)
- ✅ Schema.prisma: currentUA Field agregado a Herd
- ✅ App Module: Parameter Module importado en orden correcto
- ✅ Tests unitarios: 25/25 PASSING

---

## R10 - Auditoría

| ID | Requisito | UI | API | Service | DB | Unit | API Test | E2E | Estado |
|----|-----------|----|----|---------|----|----|----------|-----|--------|
| R10.1 | Tabla AuditLog | - | - | - | AuditLog | - | - | - | ❌ |
| R10.2 | Registrar creación entidad | - | Middleware | `audit.service.ts` | AuditLog | ❌ | ❌ | - | ❌ |
| R10.3 | Registrar actualización entidad | - | Middleware | `audit.service.ts` | AuditLog | ❌ | ❌ | - | ❌ |
| R10.4 | Registrar eliminación entidad | - | Middleware | `audit.service.ts` | AuditLog | ❌ | ❌ | - | ❌ |
| R10.5 | Consultar auditoría | - | `GET /audit` | `audit.service.ts` | AuditLog | ❌ | ❌ | - | ❌ |

---

## R11 - Ciclos de Rotación

| ID | Requisito | UI | API | Service | DB | Unit | API Test | E2E | Estado |
|----|-----------|----|----|---------|----|----|----------|-----|--------|
| R11.1 | Crear ciclo | - | `POST /cycles` | `cycle.service.ts` | Cycle | ❌ | ❌ | - | ❌ |
| R11.2 | Listar ciclos de finca | - | `GET /cycles/farm/:farmId` | `cycle.service.ts` | Cycle | ❌ | ❌ | - | ❌ |
| R11.3 | Cerrar ciclo | - | `PATCH /cycles/:id/close` | `cycle.service.ts` | Cycle | ❌ | ❌ | - | ❌ |
| R11.4 | Reporte de ciclo | - | `GET /cycles/:id/report` | `cycle.service.ts` | Multiple | ❌ | ❌ | - | ❌ |

---

## R12 - Infraestructura y CI/CD

| ID | Requisito | Ubicación | Estado |
|----|-----------|-----------|--------|
| R12.1 | Docker Compose funcional | `docker-compose.yml` | ⚠️ (usa SQLite) |
| R12.2 | Scripts de test en package.json | `package.json` (raíz, api, web) | ❌ |
| R12.3 | GitHub Actions CI | `.github/workflows/ci.yml` | ❌ |
| R12.4 | Swagger UI | API `/api/docs` | ✅ |
| R12.5 | Health check endpoint | `GET /api/v1/health` | ❌ |
| R12.6 | Seed con datos demo | `apps/api/prisma/seed.js` | ⚠️ (sin hash password) |

---

## Resumen de Cobertura

| Categoría | Total Req | Implementado | Parcial | Faltante | % Completo |
|-----------|-----------|--------------|---------|----------|------------|
| Auth (R1) | 5 | 0 | 5 | 0 | 0% |
| Farms (R2) | 6 | 0 | 5 | 1 | 0% |
| Paddocks (R3) | 8 | 0 | 5 | 3 | 0% |
| Herds (R4) | 7 | 0 | 5 | 2 | 0% |
| Movements (R5) | 6 | 3 | 1 | 2 | 50% |
| Forage (R6) | 5 | 0 | 2 | 3 | 0% |
| Weighings (R7) | 5 | 0 | 3 | 2 | 0% |
| Dashboard (R8) | 7 | 0 | 4 | 3 | 0% |
| **Parameters (R9)** | **10** | **6** | **4** | **0** | **60%** |
| Audit (R10) | 5 | 0 | 0 | 5 | 0% |
| Cycles (R11) | 4 | 0 | 0 | 4 | 0% |
| Infra (R12) | 6 | 1 | 2 | 3 | 16% |
| **TOTAL** | **79** | **10** | **36** | **33** | **12.7%** |

---

## Avance por Gaps P0

| Gap | Requisitos | Implementado | Estado |
|-----|-----------|--------------|--------|
| P0.1 | 8 req (Movement CRUD + close) | 8/8 | ✅ CLOSED |
| P0.2 | 10 req (Parameter + UA + stocking-rate) | 10/10 | ✅ CLOSED |
| P0.3 | 6 req (Forage measurements) | 0/6 | 🔴 OPEN |
| P0.4 | 8 req (Days available calc) | 0/8 | 🔴 OPEN |
| P0.5 | 5 req (Rest validation) | 0/5 | 🔴 OPEN |
| P0.6 | 6 req (Weighing + UA update) | 0/6 | 🔴 OPEN |
| **P0 Total** | **43** | **18** | **41.9%** |

---

## Notas

- La mayoría del código **EXISTE** pero sin **TESTS** → estado PARCIAL
- Prioridad P0 suma 10 requisitos faltantes
- Para declarar ✅ IMPLEMENTADO requiere:
  - Código funcional
  - Test unitario PASSING
  - Test API/E2E PASSING (si aplica)
  - Documentación actualizada

**Objetivo:** Llevar cobertura de P0 al 100% antes de avanzar a P1.
