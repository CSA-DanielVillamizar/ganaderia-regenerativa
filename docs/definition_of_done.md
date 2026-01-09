# Definition of Done (DoD) - MVP Ganadería Regenerativa

**Versión:** 0.1.0  
**Fecha:** 2025-12-26  
**Estado:** EN REVISIÓN

---

## 1. Criterios Técnicos

### 1.1 Infraestructura y Arranque
- [ ] `docker-compose up -d --build` ejecuta sin errores
- [ ] Contenedores `ganaderia_db`, `ganaderia_api`, `ganaderia_web` UP
- [ ] API responde en `http://localhost:3000/api/v1/health`
- [ ] Web responde en `http://localhost:3001`
- [ ] Seed de datos ejecuta correctamente: `npm run db:seed`

### 1.2 Calidad de Código
```bash
# Desde raíz del proyecto
npm run lint          # ✅ Sin errores en ambas apps
npm run build         # ✅ Build exitoso web + api
```

### 1.3 Tests Unitarios (Cálculos y Reglas de Negocio)
```bash
# API - Tests unitarios
cd apps/api
npm run test:unit     # ✅ Cobertura mínima 80% en servicios de dominio

# Verificar cálculos críticos:
# - Demanda diaria (kg MS/día)
# - Forraje disponible (kg MS)
# - Días recomendados (oferta/demanda)
# - Unidades Animal (UA) y UA/ha
# - Descanso de potrero (días)
# - Validación de movimientos (sin solapamiento)
```

### 1.4 Tests de Integración API
```bash
cd apps/api
npm run test:api      # ✅ Endpoints + RBAC

# Validar:
# - Auth: login/logout/refresh
# - CRUD completo: Farms, Herds, Paddocks, Movements, Weighings, ForageSamples
# - Restricciones RBAC: ADMIN vs VIEWER vs MANAGER
# - Validaciones de negocio (ej: lote no puede estar en 2 potreros)
```

### 1.5 Tests End-to-End (Flujos Críticos UI)
```bash
cd apps/web
npm run test:e2e      # ✅ Playwright

# Flujos:
# 1. Login → Dashboard (6 gráficas visibles)
# 2. Crear finca → Crear potrero → Crear lote
# 3. Registrar aforo → Ver días recomendados
# 4. Mover lote a potrero → Validar descanso
# 5. Registrar pesaje → Ver evolución UA
```

### 1.6 API Swagger
- [ ] Swagger UI disponible en `http://localhost:3000/api/docs`
- [ ] Todos los endpoints documentados con DTOs y ejemplos
- [ ] Bearer token funcional en Swagger

---

## 2. Funcionalidad Core (P0)

### P0.1 - Fuente de Verdad Movimientos
- [ ] Un lote solo puede estar en UN potrero a la vez
- [ ] Movimientos con `status: ACTIVE | CLOSED`
- [ ] `entryDate` y `exitDate` obligatorios al cerrar
- [ ] Test: intentar crear movimiento solapado → Error 400

### P0.2 - Carga Animal Correcta
- [ ] Cálculo UA: `pesoTotal / 450`
- [ ] Cálculo UA/ha: `totalUA / hectareasPotrero`
- [ ] Dashboard muestra UA actual por lote y por finca
- [ ] Test: verificar UA con diferentes pesos

### P0.3 - Aforos Reales (MS y Verde)
- [ ] Campo `kgPerHectare` registra verde O materia seca
- [ ] Campo `dryMatterPercent` (%) para conversión
- [ ] Parámetro `utilizationPercent` configurable por finca
- [ ] Forraje disponible: `kgMS_ha * area * utilizationPercent`
- [ ] Test: aforo 2000 kg/ha verde, 30% MS → 600 kg MS/ha

### P0.4 - Días Recomendados
- [ ] Parámetros configurables: `intakePercentOfBW`, `dryMatterFraction`
- [ ] Demanda: `pesoTotal * intakePercent * dmFraction`
- [ ] Días: `forageAvailable / dailyDemand`
- [ ] Test: 10 UA (4500 kg), 3000 kg MS disponible → calcular días

### P0.5 - Descanso Potrero
- [ ] Calcular días desde `lastExitDate` hasta hoy
- [ ] Parámetro `minRestDays` por finca
- [ ] Validar entrada: si `restDays < minRestDays` → Error 400
- [ ] Test: potrero con 15 días descanso, minRestDays=21 → rechazar entrada

### P0.6 - Pesajes Históricos
- [ ] CRUD Weighing completo
- [ ] Recalcular `currentWeight` del lote al agregar pesaje
- [ ] Dashboard: gráfica de evolución peso y UA
- [ ] Test: agregar pesaje → verificar actualización lote

---

## 3. Seguridad y RBAC

### Roles Implementados
| Rol      | Permisos                                      |
|----------|-----------------------------------------------|
| ADMIN    | CRUD completo + gestión usuarios              |
| MANAGER  | CRUD lotes, potreros, movimientos, pesajes    |
| VIEWER   | Solo lectura                                  |

### Validaciones
- [ ] Guards en controladores: `@UseGuards(JwtAuthGuard, RolesGuard)`
- [ ] Test: VIEWER intenta crear lote → 403 Forbidden
- [ ] Test: MANAGER crea lote en finca sin acceso → 403

---

## 4. Observabilidad

### Logs
- [ ] Logs estructurados (JSON) en producción
- [ ] Niveles: `error`, `warn`, `info`, `debug`
- [ ] Captura errores en controladores con filtros globales

### Auditoría
- [ ] Tabla `AuditLog`: `actor`, `action`, `entity`, `entityId`, `changes`, `timestamp`
- [ ] Registrar: crear/actualizar/eliminar en entidades críticas (Herd, Movement, Weighing)

### Health Check
- [ ] Endpoint `/api/v1/health` retorna status 200
- [ ] Incluye: DB conectada, timestamp, versión API

---

## 5. CI/CD

### GitHub Actions (`.github/workflows/ci.yml`)
```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run lint
      - run: npm run test:all
      - run: npm run build
```

**Estado esperado:** ✅ Todos los checks PASSING

---

## 6. Documentación

- [ ] README actualizado con instrucciones de instalación
- [ ] `/docs/qa_gaps.md` con estado de gaps
- [ ] `/docs/traceability_matrix.md` con mapeo completo
- [ ] Swagger API docs actualizado

---

## 7. Dashboard Operativo

### 6 Gráficas Obligatorias
1. **Evolución Peso y UA** (línea temporal)
2. **Carga Animal por Potrero** (barras UA/ha)
3. **Días Disponibles por Potrero** (barras calculadas)
4. **Estado de Rotación** (Gantt o timeline)
5. **Aforos Recientes** (scatter kg MS/ha por potrero)
6. **Alertas** (lista priorizada)

**Validación:** Seed debe generar datos suficientes para renderizar las 6 gráficas.

---

## 8. Comandos de Certificación

Ejecutar en orden:

```bash
# 1. Levantar entorno
docker-compose up -d --build

# 2. Seed datos
npm run db:seed

# 3. Lint
npm run lint

# 4. Tests
npm run test:unit
npm run test:api
npm run test:e2e

# 5. Build
npm run build

# 6. Validación manual
# - Abrir http://localhost:3001
# - Login con seed user
# - Verificar 6 gráficas en dashboard
```

**DoD CUMPLIDO si todos los comandos retornan EXIT 0 y las gráficas renderizan.**

---

## Estado Actual (2025-12-26)

| Criterio               | Estado       | Notas                              |
|------------------------|--------------|-------------------------------------|
| Docker compose UP      | ⚠️ PARCIAL   | Usa SQLite, no PostgreSQL          |
| Lint                   | ❌ NO EJECUTADO | Configurado pero sin tests         |
| Test:unit              | ❌ NO EXISTE | Sin archivos .spec.ts              |
| Test:api               | ❌ NO EXISTE | Sin tests de integración           |
| Test:e2e               | ❌ NO EXISTE | Sin Playwright configurado         |
| Build                  | ⚠️ PARCIAL   | Build funciona pero sin validación |
| P0.1-P0.6              | ❌ NO IMPLEMENTADO | Lógica parcial sin validaciones |
| RBAC real              | ❌ NO VALIDADO | Guards configurados sin tests      |
| Dashboard 6 gráficas   | ⚠️ PARCIAL   | UI existe pero sin datos correctos |
| Auditoría              | ❌ NO EXISTE | Sin tabla AuditLog                 |
| CI GitHub Actions      | ❌ NO EXISTE | Sin workflows                      |
| Swagger                | ✅ CONFIGURADO | Endpoints documentados            |

**Prioridad:** Comenzar por P0 y tests antes de avanzar a P1.
