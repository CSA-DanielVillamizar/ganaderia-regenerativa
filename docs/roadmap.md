# 🗺️ ROADMAP TÉCNICO 2025 – Magrotec Ganadería Regenerativa

> **Objetivo:** Plan de ejecución 6-12 meses para MVP → PRO → PREMIUM

---

## 📅 CRONOGRAMA EJECUTIVO

```
Q1 2025 (Ene-Mar)  → MVP PRODUCTION-READY
Q2 2025 (Abr-Jun)  → PRO FEATURES + ESCALA
Q3 2025 (Jul-Sep)  → PREMIUM BETA + OPTIMIZACIÓN
Q4 2025 (Oct-Dic)  → PREMIUM LAUNCH + EXPANSIÓN
```

---

## FASE 1: MVP PRODUCTION-READY (Q1 2025 – 12 semanas)

### 🎯 Objetivo
Sistema funcional con flujo completo Fincas → Lotes → Rotación → Pesajes → Aforos → Dashboard, **listo para primeros clientes reales**.

### Sprint 1-2 (S1-S2): Critical Path P0 (4 semanas)

**Semana 1-2:**
- ✅ **MVP-3.4:** Validación descanso mínimo antes de movimiento
  - Backend: Guard en `POST /movements` validando `minRestDays`
  - Frontend: Alert bloqueante en formulario movimiento
  - Test: Integración con casos: descanso OK, descanso insuficiente
  - **Dependencias:** Ninguna (implementable ya)
  - **Riesgo:** Bajo | **Esfuerzo:** 3 puntos

- ✅ **MVP-5.3:** Cálculo días recomendados
  - Backend: Nuevo endpoint `GET /paddocks/:id/recommended-days?herdId=`
  - Lógica: `(kgMSPerHa * hectares * utilizationPercent) / (currentUA * consumoDiarioPercent * uaWeightKg)`
  - Frontend: Card "Días Recomendados" en detalle potrero
  - Test: Unit con parámetros reales, casos borde (sin aforo, sin lote)
  - **Dependencias:** ForageSample, Parameter
  - **Riesgo:** Medio (cálculo crítico) | **Esfuerzo:** 5 puntos

**Semana 3-4:**
- ✅ **MVP-4.2:** UI pesaje con cinta métrica
  - Frontend: Formulario especializado con 3 pasos:
    1. Método (SCALE o TAPE - radio buttons)
    2. Si TAPE: inputs `chestGirthCm`, `bodyLengthCm`
    3. Confirmación con preview estimado (usando divisor calibración)
  - Backend: Ya implementado (campos en Weighing)
  - Test: E2E con captura cinta → verificar `estimatedWeightKg`
  - **Dependencias:** TapeCalibration (usar divisor actual)
  - **Riesgo:** Bajo | **Esfuerzo:** 5 puntos

- ✅ **MVP-4.3:** Comparativa real vs estimado
  - Frontend: Nueva pestaña en detalle lote "Precisión Cinta"
  - Tabla: Fecha | Método | Real | Estimado | Error %
  - Gráfica: Scatter plot con línea ideal y puntos reales
  - Backend: GET `/weighings?herdId=&hasPairs=true` (filtro con realWeightKg IS NOT NULL)
  - **Dependencias:** MVP-4.2
  - **Riesgo:** Bajo | **Esfuerzo:** 3 puntos

**Entregables S1-S2:**
- ✅ Validación descanso operativa (no más movimientos prematuros)
- ✅ Cálculo días recomendados guiando decisiones
- ✅ Flujo completo pesaje con cinta + análisis precisión

---

### Sprint 3-4 (S3-S4): Wizard Aforo + Alertas (4 semanas)

**Semana 5-6:**
- ✅ **MVP-5.1:** Wizard aforo guiado (4 pasos)
  - Frontend: Stepper component con estados:
    1. **Paso 1:** Seleccionar potrero, fecha, responsable
    2. **Paso 2:** Marco (área m²) + peso fresco (kg)
    3. **Paso 3:** % materia seca (input + ayuda contextual)
    4. **Paso 4:** % utilización (slider + previsualización kg MS/ha)
  - Backend: POST `/forage-samples` recibe todos los campos extendidos
  - Cálculo automático: `kgMSPerHa = (freshWeightKg / frameAreaM2) * 10000 * (dryMatterPercent/100) * (utilizationPercent/100)`
  - Test: E2E con datos reales, validación cada paso
  - **Dependencias:** Ninguna
  - **Riesgo:** Medio (UX crítico) | **Esfuerzo:** 8 puntos

**Semana 7-8:**
- ✅ **MVP-6.2:** Panel alertas visuales destacado
  - Frontend: Nuevo componente `<AlertsPanel>` en Dashboard (arriba)
  - 4 alertas MVP:
    1. 🔴 Descanso insuficiente (paddock próximo a entrar con `daysRest < minRestDays`)
    2. 🟡 Sobrepastoreo (movimiento > 7 días - parametrizable)
    3. 🟠 Pesaje vencido (sin pesaje 30 días)
    4. 🔵 Aforo pendiente (potrero sin aforo >45 días)
  - Backend: GET `/dashboard/alerts?farmId=` retorna array con tipo, severidad, mensaje, link
  - Estilo: Cards con colores Tailwind según severidad, badge con contador
  - Test: Casos con/sin alertas, navegación links
  - **Dependencias:** MVP-3.4 (validación descanso)
  - **Riesgo:** Bajo | **Esfuerzo:** 5 puntos

**Entregables S3-S4:**
- ✅ Aforo accesible para cualquier técnico (sin capacitación previa)
- ✅ Alertas proactivas previniendo errores

---

### Sprint 5-6 (S5-S6): Auditoría + Testing + Pulido (4 semanas)

**Semana 9-10:**
- ✅ **MVP-7.3:** AuditLog completo
  - Backend: Nuevo modelo Prisma `AuditLog`:
    ```prisma
    model AuditLog {
      id String @id @default(cuid())
      entity String // Farm, Herd, Weighing, etc
      entityId String
      action String // CREATE, UPDATE, DELETE
      changes Json // { before: {...}, after: {...} }
      userId String
      user User @relation(...)
      createdAt DateTime @default(now())
      @@index([entity, entityId])
    }
    ```
  - Interceptor NestJS registrando automáticamente cambios en todos los controladores
  - Frontend: Nueva página `/audit` con tabla filtrable por entidad, fecha, usuario
  - Test: Verificar log en CREATE/UPDATE/DELETE de entidad crítica
  - **Dependencias:** Ninguna
  - **Riesgo:** Bajo | **Esfuerzo:** 8 puntos

**Semana 11-12:**
- ✅ **Testing MVP completo**
  - Unit tests para servicios críticos: `weighing.service`, `forage.service`, `dashboard.service`
  - Integration tests para flujos: Crear lote → Pesaje → Movimiento → Aforo
  - E2E tests con Playwright: Login → Dashboard → Crear lote → Pesaje cinta → Movimiento validando descanso
  - Cobertura objetivo: >70% líneas, >80% funciones críticas
  - **Esfuerzo:** 13 puntos (1.5 semanas)

- ✅ **Pulido UI/UX**
  - Loading states consistentes (skeleton loaders)
  - Mensajes error amigables (traducciones español)
  - Responsive mobile (bottom nav ya implementado, validar forms)
  - Tooltips ayuda contextual en campos complejos (% MS, divisor calibración)
  - **Esfuerzo:** 5 puntos (0.5 semanas)

**Entregables S5-S6:**
- ✅ Auditoría robusta (trazabilidad completa cambios)
- ✅ Batería de tests cubriendo flujos críticos
- ✅ UI pulida lista para clientes reales

---

### 🎯 Entregables FASE 1 (Fin Q1 2025)

| Entregable | Descripción | Estado al Inicio | Estado Objetivo |
|-----------|-------------|------------------|-----------------|
| **Validación descanso** | Bloqueo movimientos prematuros | ❌ | ✅ COMPLETO |
| **Días recomendados** | Cálculo oferta/demanda forraje | ❌ | ✅ COMPLETO |
| **Pesaje cinta UI** | Formulario especializado + precisión | ⚠️ Backend listo | ✅ COMPLETO |
| **Wizard aforo** | Guiado 4 pasos accesible | ⚠️ Backend listo | ✅ COMPLETO |
| **Panel alertas** | 4 alertas operativas destacadas | ⚠️ Lógica parcial | ✅ COMPLETO |
| **AuditLog** | Trazabilidad completa | ⚠️ createdBy existe | ✅ COMPLETO |
| **Tests MVP** | Unit + Integration + E2E | ❌ Configs listas | ✅ >70% cobertura |
| **UI pulida** | Loading, errores, responsive, tooltips | ⚠️ Funcional | ✅ Production-ready |

**Métricas de éxito:**
- ✅ Todos los flujos P0 funcionando sin bugs críticos
- ✅ 5 clientes beta usando en campo
- ✅ <3 segundos tiempo respuesta P95 endpoints dashboard
- ✅ <1% tasa error en producción

---

## FASE 2: PRO FEATURES + ESCALA (Q2 2025 – 12 semanas)

### 🎯 Objetivo
Funcionalidades avanzadas para profesionalizar operación y soportar clientes enterprise con múltiples fincas.

### Sprint 7-8 (S7-S8): Ciclos + Calibración (4 semanas)

**Semana 13-14:**
- ✅ **PRO-9.1:** CRUD ciclos frontend
  - Vista `/cycles` con tabla ciclos (nombre, fecha inicio, fecha fin, estado)
  - Formulario crear ciclo (asignar potreros incluidos, fecha inicio)
  - Cerrar ciclo: botón con confirmación → actualiza `endDate` y `status=CLOSED`
  - Backend ya existe (`cycle.controller.ts`)
  - Test: E2E crear ciclo → movimientos → cerrar ciclo
  - **Esfuerzo:** 5 puntos

- ✅ **PRO-9.2:** Comparativo ciclos
  - Vista `/cycles/:id/compare` con selector de 2+ ciclos
  - Tabla comparativa: Duración total | Nº movimientos | UA promedio | Descanso promedio | Ganancia peso (si hay pesajes)
  - Gráfica: Barras comparando indicadores
  - Backend: GET `/cycles/compare?farmId=&cycleIds[]=` con aggregations
  - **Esfuerzo:** 8 puntos

**Semana 15-16:**
- ✅ **PRO-10.2:** Recalibración automática cinta
  - Vista `/calibration/:farmId` con:
    - Tabla pares (fecha | perímetro | peso real | peso estimado | error %)
    - Badge "Confianza" según `errorMarginPercent` promedio (<5% verde, 5-10% amarillo, >10% rojo)
    - Botón "Recalibrar" → POST `/calibration/:farmId/adjust`
  - Backend: Lógica regresión lineal simple `nuevoDivisor = sum((perímetro * largo) / peso) / count`
  - Guarda en `TapeCalibrationHistory` antes de actualizar
  - **Esfuerzo:** 8 puntos

- ✅ **PRO-10.3:** Validación precisión UI
  - Refactorizar vista calibración añadiendo gráfica scatter (perímetro*largo vs peso)
  - Línea regresión ideal vs puntos reales
  - Badge % error prominente arriba
  - **Esfuerzo:** 3 puntos

**Entregables S7-S8:**
- ✅ Ciclos operativos con comparativas históricas
- ✅ Calibración automática mejorando precisión cinta

---

### Sprint 9-10 (S9-S10): Guías de Campo + Alertas Avanzadas (4 semanas)

**Semana 17-18:**
- ✅ **PRO-11.1-11.3:** Guías de campo
  - Nuevo modelo Prisma `FieldGuide`:
    ```prisma
    model FieldGuide {
      id String @id
      type String // AFORO, PESAJE_TAPE, ROTACION
      title String
      steps Json // [{ title, description, imageUrl, tips }]
      createdAt DateTime
    }
    ```
  - Seed con 3 guías predefinidas (contenido técnico validado)
  - Frontend: Wizard modal activable desde:
    - Aforo → botón "¿Cómo hacer aforo?" abre guía AFORO
    - Pesaje → botón "¿Cómo medir con cinta?" abre PESAJE_TAPE
    - Movimiento → botón "Checklist rotación" abre ROTACION
  - Imágenes diagrama (perímetro torácico, marco cuadrado, etc.)
  - Test: Navegación wizard completa
  - **Esfuerzo:** 8 puntos

**Semana 19-20:**
- ✅ **PRO-12.4:** Alerta carga alta
  - Lógica backend en `dashboard.service.getAlerts()`:
    - Calcular `cargaActual = herd.currentUA / paddock.hectares`
    - Comparar con `parametroOptimo` (buscar en Parameter `optimal_ua_per_ha`)
    - Si `cargaActual > optimo * 1.2` → alerta ALTA
  - Frontend: Ya integrado en `<AlertsPanel>`
  - Test: Unit con casos: carga OK, carga alta, sin parámetro
  - **Esfuerzo:** 3 puntos

- ✅ **Completar alertas PRO:**
  - Refinar lógica PRO-12.1, PRO-12.2, PRO-12.3 ya implementadas
  - Agregar configurabilidad: `/settings` con toggles alertas + umbrales custom por finca
  - **Esfuerzo:** 5 puntos

**Entregables S9-S10:**
- ✅ Guías campo reduciendo dependencia capacitaciones
- ✅ Sistema alertas completo (4 alertas MVP + carga alta + configurables)

---

### Sprint 11-12 (S11-S12): Observabilidad + Optimización (4 semanas)

**Semana 21-22:**
- ✅ **PRO-13.2:** Logs estructurados
  - Integrar Winston en NestJS (`apps/api/src/common/logger/`)
  - Formato JSON con fields: timestamp, level, message, context, userId, farmId, traceId
  - Transports: Console (dev), File (prod), futuro CloudWatch/Datadog
  - Test: Verificar log en operación crítica
  - **Esfuerzo:** 5 puntos

- ✅ **PRO-13.3:** Métricas OpenTelemetry
  - Instrumentar con OTel SDK:
    - HTTP requests (latencia, status code)
    - Database queries (Prisma)
    - Custom metrics: `movements_created`, `weighings_created`
  - Exportar a Prometheus + Grafana dashboard básico
  - Alertas Grafana: latencia P95 >3s, error rate >1%
  - **Esfuerzo:** 8 puntos

**Semana 23-24:**
- ✅ **Optimización performance**
  - Indexar columnas frecuentes (Prisma `@@index`): `Movement.herdId`, `Weighing.herdId`, `ForageSample.paddockId`
  - Cachear KPIs dashboard (Redis en prod, memory en dev): TTL 5 min
  - Paginación backend en listados grandes (lotes, pesajes): query param `?page=1&limit=20`
  - Lazy loading componentes Next.js: `dynamic(() => import(...))`
  - Test load: Artillery script simulando 50 usuarios concurrentes
  - **Esfuerzo:** 13 puntos

**Entregables S11-S12:**
- ✅ Observabilidad completa (logs + métricas + alertas)
- ✅ Performance optimizado para escala (>50 usuarios concurrentes)

---

### 🎯 Entregables FASE 2 (Fin Q2 2025)

| Entregable | Estado Objetivo |
|-----------|-----------------|
| **Ciclos CRUD + comparativa** | ✅ COMPLETO |
| **Calibración automática** | ✅ COMPLETO |
| **Guías campo (3 guías)** | ✅ COMPLETO |
| **Alertas completas** | ✅ 5 alertas + configurables |
| **Logs estructurados** | ✅ Winston JSON |
| **Métricas OTel** | ✅ Prometheus + Grafana |
| **Performance optimizado** | ✅ <3s P95, >50 usuarios |

**Métricas de éxito:**
- ✅ 50 clientes activos (10x vs Q1)
- ✅ NPS >40 (usuarios satisfechos)
- ✅ Uptime >99.5%
- ✅ Support tickets <5% del total usuarios

---

## FASE 3: PREMIUM BETA (Q3 2025 – 12 semanas)

### 🎯 Objetivo
Diferenciadores competitivos: visualización avanzada, offline-first, indicadores regenerativos, exportaciones.

### Sprint 13-14 (S13-S14): Vista 2.5D (4 semanas)

**Semana 25-28:**
- ✅ **PREMIUM-14.1-14.3:** Mapa 2.5D completo
  - Tecnología: Canvas 2D con proyección isométrica (sin Three.js para simplificar)
  - Componente `<FarmMap2D>`:
    - Renderizar potreros como polígonos coloreados según estado:
      - Verde: descanso OK
      - Amarillo: ocupado
      - Rojo: descanso insuficiente
    - Iconos lotes (`🐄`) posicionados sobre potrero activo
  - Interactividad: Click potrero → panel lateral con info, click lote → detalle
  - **PREMIUM-14.3 Simulación:**
    - Modo "Previsualizar movimiento": Drag lote a potrero → calcula impacto temporal:
      - Días recomendados con nuevo UA
      - Carga resultante UA/ha
      - Alerta si excede óptimo
    - Endpoint `GET /simulation/move?herdId=&paddockId=` (cálculo sin persistir)
  - Test: E2E con drag-and-drop, verificar cálculos simulación
  - **Esfuerzo:** 21 puntos (4 semanas completas)

**Entregables S13-S14:**
- ✅ Vista visual revolucionaria (diferenciador clave)
- ✅ Planificación de movimientos proactiva

---

### Sprint 15-16 (S15-S16): Offline-first (4 semanas)

**Semana 29-32:**
- ✅ **PREMIUM-15.1-15.3:** Sistema offline completo
  - Nuevo modelo Prisma `OfflineEvent`:
    ```prisma
    model OfflineEvent {
      id String @id
      entityType String // Weighing, Movement, ForageSample
      action String // CREATE, UPDATE, DELETE
      payload Json
      status String // PENDING, SYNCED, FAILED
      deviceId String
      userId String
      createdAt DateTime
      syncedAt DateTime?
      @@index([userId, status])
    }
    ```
  - Frontend:
    - Service Worker interceptando requests fallidos → almacenar en IndexedDB
    - Hook `useOfflineQueue()` manejando cola:
      - Detectar online/offline (navigator.onLine)
      - Auto-envío batch al volver online: POST `/sync/events` (array eventos)
    - UI indicador estado offline (badge naranja navbar)
  - Backend:
    - `/sync/events`: Procesa batch, detecta conflictos (modificación misma entidad por otro usuario)
    - `/sync/resolve`: UI resolución conflictos (modal mostrando versión local vs servidor, usuario elige)
  - Test: E2E desconexión → crear pesaje offline → reconexión → verificar sincronización
  - **Esfuerzo:** 21 puntos

**Entregables S15-S16:**
- ✅ App funcional sin conexión (crítico para campo)
- ✅ Sincronización robusta sin pérdida datos

---

### Sprint 17-18 (S17-S18): Indicadores + Exportaciones (4 semanas)

**Semana 33-34:**
- ✅ **PREMIUM-16.1-16.3:** Indicadores regenerativos
  - Nueva vista `/indicators/:farmId`:
    1. **Presión Pastoreo:** Gauge `currentUA / optimalUA` (verde <1, amarillo 1-1.2, rojo >1.2)
    2. **Índice Recuperación:** Avg `daysRest / minRestDays` (verde >1, amarillo 0.8-1, rojo <0.8)
    3. **Ganancia Diaria:** Line chart kg/día promedio por mes (pesajes consecutivos)
  - Backend: GET `/indicators/:farmId` con cálculos complejos (usar aggregations Prisma + raw SQL si necesario)
  - Test: Unit con datasets reales, validar edge cases (sin pesajes, sin movimientos)
  - **Esfuerzo:** 13 puntos

**Semana 35-36:**
- ✅ **PREMIUM-17.1-17.2:** Exportaciones
  - Implementar en `export.controller.ts`:
    - **PDF técnico:** Librería `pdfkit` o `puppeteer` → reporte mensual con:
      - KPIs (6 del dashboard)
      - Tabla movimientos
      - Tabla pesajes
      - Gráficas tendencias
      - Endpoint: POST `/export/pdf?farmId=&startDate=&endDate=` → stream PDF
    - **CSV/Excel:** Librería `exceljs`:
      - Endpoint: POST `/export/csv?entity=Weighing&farmId=` → descarga CSV
      - Soportar: Weighing, Movement, ForageSample, Herd, Paddock
  - Frontend: Botones "Exportar PDF" en Dashboard, "Exportar CSV" en cada listado
  - Test: Descargar y verificar contenido archivos
  - **Esfuerzo:** 8 puntos

**Entregables S17-S18:**
- ✅ Indicadores regenerativos (storytelling impacto)
- ✅ Exportaciones profesionales (reportes para stakeholders)

---

### 🎯 Entregables FASE 3 (Fin Q3 2025)

| Entregable | Estado Objetivo |
|-----------|-----------------|
| **Mapa 2.5D + simulación** | ✅ COMPLETO |
| **Offline-first** | ✅ COMPLETO |
| **Indicadores regenerativos** | ✅ 3 indicadores |
| **Exportaciones PDF/CSV** | ✅ COMPLETO |

**Métricas de éxito:**
- ✅ 20 clientes PREMIUM beta
- ✅ Uso offline >30% sesiones campo
- ✅ Exportaciones >100/mes (engagement alto)
- ✅ NPS >50 (usuarios encantados)

---

## FASE 4: PREMIUM LAUNCH + EXPANSIÓN (Q4 2025 – 12 semanas)

### 🎯 Objetivo
Lanzamiento oficial PREMIUM, escalamiento infraestructura, preparación multi-país.

### Sprint 19-20 (S19-S20): Pulido PREMIUM + Marketing (4 semanas)

**Semana 37-40:**
- ✅ **Testing exhaustivo PREMIUM:** E2E todos los flujos, stress tests offline, validación exportaciones
- ✅ **Documentación usuario:** Video tutoriales (aforo, pesaje cinta, mapa 2.5D), knowledge base
- ✅ **Onboarding mejorado:** Tour guiado en-app (tooltips secuenciales primera vez)
- ✅ **Campaña lanzamiento:** Landing page, casos éxito, webinars
- **Esfuerzo:** 21 puntos

**Entregables S19-S20:**
- ✅ PREMIUM production-ready
- ✅ Materiales marketing listos

---

### Sprint 21-22 (S21-S22): Infraestructura Enterprise (4 semanas)

**Semana 41-44:**
- ✅ **Migración PostgreSQL:** Prisma migrate a Postgres, optimizar queries complejas
- ✅ **CI/CD robusto:** GitHub Actions con stages: test → build → deploy staging → deploy prod
- ✅ **Containerización:** Docker multi-stage (api, web), Docker Compose producción
- ✅ **Hosting cloud:** Deploy en AWS/Azure:
  - API: ECS Fargate / App Service
  - Web: Vercel / Static Web App
  - DB: RDS PostgreSQL / Azure Database
  - Storage: S3/Blob para exports
- ✅ **Monitoreo:** CloudWatch/Application Insights, alertas Slack/Teams
- **Esfuerzo:** 21 puntos

**Entregables S21-S22:**
- ✅ Infraestructura enterprise-grade
- ✅ Escalamiento automático >500 usuarios

---

### Sprint 23-24 (S23-S24): Localización + Expansión (4 semanas)

**Semana 45-48:**
- ✅ **i18n completo:** next-i18next en frontend, mensajes backend en español técnico
- ✅ **Multi-región:** Parámetros regionales (unidades medida, especies ganado, clima)
- ✅ **Integraciones:** API pública REST para integraciones externas (ERP, sensores IoT)
- ✅ **Partnerships:** Acuerdos con proveedores cintas métricas, balanzas ganaderas
- **Esfuerzo:** 21 puntos

**Entregables S23-S24:**
- ✅ Producto preparado multi-país (Colombia, Argentina, Uruguay, Brasil)
- ✅ Ecosistema partners iniciado

---

### 🎯 Entregables FASE 4 (Fin Q4 2025)

| Entregable | Estado Objetivo |
|-----------|-----------------|
| **PREMIUM GA** | ✅ Lanzamiento oficial |
| **Infraestructura cloud** | ✅ AWS/Azure production |
| **Escalamiento** | ✅ >500 usuarios soportados |
| **Multi-país** | ✅ 2+ países activos |

**Métricas de éxito:**
- ✅ 200 clientes totales (100 PREMIUM)
- ✅ ARR $500K+ (modelo SaaS)
- ✅ Churn <5% mensual
- ✅ Expansión 2 países adicionales

---

## 📊 RESUMEN INVERSIÓN Y RECURSOS

### Esfuerzo total por fase (puntos historia)

| Fase | Sprints | Puntos | Semanas | Equipo Sugerido |
|------|---------|--------|---------|-----------------|
| **FASE 1 (MVP)** | 6 sprints | 50 pts | 12 sem | 2 dev + 1 QA |
| **FASE 2 (PRO)** | 6 sprints | 55 pts | 12 sem | 2 dev + 1 QA + 1 DevOps |
| **FASE 3 (PREMIUM)** | 6 sprints | 63 pts | 12 sem | 3 dev + 1 QA + 1 DevOps |
| **FASE 4 (EXPANSIÓN)** | 6 sprints | 63 pts | 12 sem | 3 dev + 1 QA + 1 DevOps + 1 PM |
| **TOTAL** | **24 sprints** | **231 pts** | **48 sem (12 meses)** | - |

### Presupuesto estimado (Colombia - salarios mensuales USD)

| Rol | Cantidad | Costo Mes | Meses | Total |
|-----|----------|-----------|-------|-------|
| Dev Senior | 2-3 | $3,000 | 12 | $72K-$108K |
| QA Engineer | 1 | $2,500 | 12 | $30K |
| DevOps | 1 | $3,500 | 9 (desde Q2) | $31.5K |
| PM/PO | 1 | $3,000 | 3 (Q4) | $9K |
| **Subtotal Equipo** | - | - | - | **$142.5K-$178.5K** |
| Infraestructura (cloud) | - | $500 | 12 | $6K |
| Herramientas (Sentry, Datadog, etc.) | - | $300 | 12 | $3.6K |
| **TOTAL 12 MESES** | - | - | - | **$152K-$188K** |

---

## 🚨 RIESGOS Y MITIGACIONES

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| **Cálculos regenerativos incorrectos** | Media | Alto | Validación con agrónomo especialista cada sprint, tests con datos reales |
| **Performance offline-first** | Media | Medio | POC Service Worker en Sprint 1 PREMIUM, testing exhaustivo dispositivos móviles |
| **Adopción cinta métrica baja** | Alta | Alto | Onboarding reforzado, guías campo, webinar capacitación |
| **Competencia lanza feature similar** | Media | Medio | Aceleración roadmap calibración (diferenciador único), patentes si aplica |
| **Cambio regulatorio trazabilidad** | Baja | Alto | Monitoreo ICA/SENASA, arquitectura extensible para compliance |
| **Rotación equipo** | Media | Alto | Documentación exhaustiva, pair programming, knowledge base interno |

---

## 🎯 CONCLUSIONES

### Ventajas competitivas consolidadas en 2025:

1. **Democratización pesaje:** Cinta métrica con calibración adaptativa (único en mercado)
2. **Enfoque regenerativo:** Indicadores descanso, presión pastoreo, recuperación (no solo productividad)
3. **Offline-first:** Funcional en campo sin conectividad (crítico Colombia rural)
4. **Visualización avanzada:** Mapa 2.5D con simulación (experiencia superior)
5. **Guiado:** Wizards y guías campo reduciendo capacitación (escalable)

### Hitos críticos:

- **Fin Q1 2025:** MVP production-ready → validación mercado con clientes reales
- **Fin Q2 2025:** PRO features → profesionalización operación, escala 50 usuarios
- **Fin Q3 2025:** PREMIUM beta → diferenciadores competitivos en manos early adopters
- **Fin Q4 2025:** PREMIUM launch + expansión → $500K ARR, 2 países adicionales

---

**Última actualización:** 2025-01-08  
**Próxima revisión:** Fin Sprint 1 (validar velocity real vs estimaciones)  
**Documento vivo:** Ajustar según feedback clientes y métricas cada sprint