# 🧭 BACKLOG ÉPICO COMPLETO – Magrotec Ganadería Regenerativa

> **Producto:** Herramienta digital definitiva para administradores de fincas de ganadería regenerativa  
> **Objetivo:** Capturar datos reales en campo, visualizar el sistema suelo–planta–animal, y guiar decisiones operativas basadas en datos confiables

---

## 📊 ANÁLISIS DE ESTADO ACTUAL (IMPLEMENTACIÓN)

### ✅ IMPLEMENTADO (Base funcional operativa)

#### Backend
- ✅ Gestión completa de Fincas (CRUD + acceso por usuario)
- ✅ Gestión de Potreros (hectáreas, tipo pastura, descanso mínimo)
- ✅ Gestión de Lotes y Animales (peso inicial/actual, UA)
- ✅ Sistema de Movimientos (entrada/salida, bloqueo doble ocupación)
- ✅ Pesajes con método SCALE y TAPE (cinta métrica bovina)
- ✅ Aforos con campos extendidos (kg/ha, MS%, aprovechamiento)
- ✅ Ciclos de rotación básicos
- ✅ Calibración de cinta métrica por finca (con historial)
- ✅ Parámetros configurables por finca
- ✅ Dashboard operativo con KPIs regenerativos
- ✅ Autenticación JWT + RBAC básico
- ✅ Health checks

#### Frontend
- ✅ Login con gestión de token
- ✅ Selector de finca activa (contexto global)
- ✅ Dashboard con 6 gráficas operativas
- ✅ Vista de fincas con detalle
- ✅ Vista de lotes con animales
- ✅ Detalle de lote (pesajes, movimientos, rotación)
- ✅ Formularios de creación (fincas, lotes)
- ✅ Navegación responsive (sidebar + bottom nav)

#### Modelo de datos
- ✅ 15 entidades principales bien relacionadas
- ✅ Soft delete en entidades críticas
- ✅ Auditoría básica (createdBy, updatedBy)
- ✅ Índices en campos críticos

---

### ⚠️ PARCIALMENTE IMPLEMENTADO (Requiere completar)

#### Backend
- ⚠️ Dashboard endpoints: algunos usan query params inconsistentemente
- ⚠️ Validación de descanso de potrero antes de movimiento
- ⚠️ Cálculo de días recomendados (oferta/demanda forraje)
- ⚠️ Alertas inteligentes (solo básicas)
- ⚠️ Endpoints de exportación (existen pero sin implementar lógica)
- ⚠️ Indicadores regenerativos (existe controlador vacío)

#### Frontend
- ⚠️ Wizard de aforo guiado (falta UI paso a paso)
- ⚠️ Comparativa pesaje real vs cinta (falta UI)
- ⚠️ Vista de calibración de cinta (falta UI completa)
- ⚠️ Gestión de ciclos (backend existe, frontend no)
- ⚠️ Alertas visuales en dashboard
- ⚠️ Formularios de pesaje con cinta métrica

---

### ❌ NO IMPLEMENTADO (Backlog prioritario)

#### MVP Crítico (P0)
- ❌ Validación de descanso mínimo antes de entrada
- ❌ Cálculo automático de días recomendados por potrero
- ❌ Wizard completo de aforo (4 pasos)
- ❌ Comparación real vs estimado en pesajes cinta
- ❌ Dashboard de alertas operativas (sobrepastoreo, descanso, pesajes vencidos)
- ❌ Tests automatizados (unit, integración, E2E)
- ❌ Auditoría completa (AuditLog con diff JSON)

#### PRO (P1)
- ❌ Guías de campo integradas (Aforo, Pesaje, Rotación)
- ❌ Calibración activa por finca (ajuste automático con datos)
- ❌ Comparativo de ciclos (ranking potreros, análisis histórico)
- ❌ Sistema completo de alertas inteligentes
- ❌ Observabilidad (logs estructurados, métricas, OpenTelemetry)

#### PREMIUM (P2-P3)
- ❌ Vista visual interactiva 2.5D de finca
- ❌ Offline-first con sincronización (OfflineEvent)
- ❌ Indicadores regenerativos avanzados (presión pastoreo, índice recuperación)
- ❌ Exportaciones completas (PDF técnico, Excel/CSV)
- ❌ Representación 3D de ganado por lote
- ❌ Predicción de días de descanso por historial

---

## 🔴 MVP – FUNDAMENTO OPERATIVO (INDISPENSABLE)

> *"La app debe funcionar en una finca real desde el día 1."*

---

### 🧱 ÉPICA 1 – Gestión estructural de la finca

**Estado:** ✅ **COMPLETADO**

**Objetivo:** Representar la realidad física de la finca.

#### Historias implementadas
- ✅ **MVP-1.1:** Crear y administrar fincas  
  *Criterios:* CRUD completo, asociación usuario-finca, soft delete
  
- ✅ **MVP-1.2:** Definir potreros con parámetros regenerativos  
  *Criterios:* área (ha), tipo pastura, descanso mínimo configurable

- ✅ **MVP-1.3:** Asignar usuarios por finca con roles  
  *Criterios:* tabla UserFarm, validación de acceso en todos los endpoints

**Modelo de datos:**
```
Farm(id, name, location, hectares, active, createdAt, updatedAt, deletedAt)
Paddock(id, farmId, name, hectares, pastureType, minRestDays, active, createdAt, updatedAt, deletedAt)
UserFarm(userId, farmId, createdAt)
```

**Impacto regenerativo:** Permite modelar la realidad física de la finca respetando superficies y tiempos biológicos.

---

### 🐄 ÉPICA 2 – Lotes, animales y estado real

**Estado:** ✅ **COMPLETADO**

**Objetivo:** Saber siempre *qué ganado hay, cuánto pesa y dónde está*.

#### Historias implementadas
- ✅ **MVP-2.1:** Crear lotes con peso inicial y actual  
  *Criterios:* CRUD, animalCount, initialWeight, currentWeight, currentUA

- ✅ **MVP-2.2:** Registrar animales individuales (opcional)  
  *Criterios:* earTag, género, fecha nacimiento, peso inicial

- ✅ **MVP-2.3:** Visualizar estado actual del lote  
  *Criterios:* UI muestra peso, UA, ubicación actual, animales

**Modelo de datos:**
```
Herd(id, farmId, name, initialWeight, currentWeight, currentUA, animalCount, active, createdAt, updatedAt, deletedAt)
Animal(id, herdId, earTag, gender, birthDate, initialWeight, createdAt, updatedAt, deletedAt)
```

**Impacto regenerativo:** Control del estado del ganado para ajustar carga animal según capacidad de carga del potrero.

---

### 🔄 ÉPICA 3 – Rotación y descanso (fuente de verdad)

**Estado:** ⚠️ **PARCIAL** (Falta validación de descanso)

**Objetivo:** Control absoluto del pastoreo regenerativo.

#### Historias
- ✅ **MVP-3.1:** Registrar entrada/salida de lote  
  *Criterios:* entryDate, exitDate, status ACTIVE/CLOSED
  
- ✅ **MVP-3.2:** Bloquear doble ocupación  
  *Criterios:* Regla: 1 movimiento ACTIVE por potrero, validación en backend

- ⚠️ **MVP-3.3:** Calcular días ocupados y descanso  
  *Estado:* Backend parcial, falta UI y validación proactiva  
  *Criterios pendientes:*
  - [ ] No permitir entrada si paddock.minRestDays no se cumple
  - [ ] Mostrar días transcurridos desde última salida
  - [ ] Alerta visual si descanso insuficiente

#### Tareas pendientes (P0)
```
- [ ] Backend: Endpoint GET /paddocks/:id/rest-days
- [ ] Backend: Validar minRestDays en Movement.create()
- [ ] Frontend: Card "Descanso" en detalle de potrero
- [ ] Frontend: Badge rojo si descanso < minRestDays
- [ ] Test: Rechazar movimiento con descanso insuficiente
```

**Modelo de datos:**
```
Movement(id, herdId, paddockId, cycleId, type, status, entryDate, exitDate, notes, createdAt, createdBy, updatedAt, updatedBy)
```

**Impacto regenerativo:** Garantiza que el suelo y la pastura se recuperen antes del próximo pastoreo, clave para regeneración.

---

### ⚖️ ÉPICA 4 – Pesajes (báscula + cinta métrica)

**Estado:** ⚠️ **PARCIAL** (Backend completo, UI incompleta)

**Objetivo:** Medir progreso sin depender de báscula.

#### Historias
- ✅ **MVP-4.1:** Registrar pesaje real (báscula)  
  *Criterios:* method='SCALE', realWeightKg, animalCount, fecha

- ⚠️ **MVP-4.2:** Registrar pesaje estimado con cinta métrica  
  *Estado:* Backend completo, falta UI especializada  
  *Criterios pendientes:*
  - [ ] Formulario con perímetro torácico y longitud corporal
  - [ ] Cálculo automático usando TapeCalibration de la finca
  - [ ] Mostrar peso estimado antes de guardar

- ⚠️ **MVP-4.3:** Comparar real vs estimado  
  *Estado:* Campo errorMarginPercent existe, falta UI  
  *Criterios pendientes:*
  - [ ] Vista histórica de comparación
  - [ ] Gráfica error% por fecha
  - [ ] Sugerencia de recalibración si error > 10%

- ✅ **MVP-4.4:** Calcular UA y ganancia  
  *Criterios:* Actualizar Herd.currentUA tras pesaje, calcular ganancia entre pesajes

#### Tareas pendientes (P0)
```
- [ ] Frontend: Formulario pesaje con toggle SCALE/TAPE
- [ ] Frontend: Campos chestGirthCm, bodyLengthCm solo si method=TAPE
- [ ] Frontend: Preview peso estimado (girth² × length / divisor)
- [ ] Backend: Recalcular UA tras cada pesaje
- [ ] Frontend: Comparativa real vs estimado en detalle lote
- [ ] Test: Validar fórmula cinta contra datos reales
```

**Modelo de datos extendido:**
```
Weighing(
  id, herdId, animalId, weight, animalCount, notes, recordedAt, createdAt, createdBy,
  method, chestGirthCm, bodyLengthCm, estimatedWeightKg, realWeightKg, errorMarginPercent
)
```

**Impacto regenerativo:** Permite pesaje en campo sin infraestructura costosa, democratiza el control de ganancia de peso.

---

### 🌱 ÉPICA 5 – Aforos y forraje disponible

**Estado:** ⚠️ **PARCIAL** (Backend completo, falta wizard UI)

**Objetivo:** Saber cuánto alimento REAL hay en cada potrero.

#### Historias
- ⚠️ **MVP-5.1:** Wizard de aforo guiado (4 pasos)  
  *Estado:* Backend tiene campos, falta UI paso a paso  
  *Criterios pendientes:*
  - [ ] Paso 1: Seleccionar potrero
  - [ ] Paso 2: Ingresar área de marco (m²) y cantidad de marcos
  - [ ] Paso 3: Ingresar peso fresco total (kg)
  - [ ] Paso 4: Ingresar % materia seca y % aprovechamiento
  - [ ] Cálculo automático: kg MS/ha = (pesoFresco × %MS) / (área × marcos) × 10000
  - [ ] Mostrar resultado antes de guardar

- ⚠️ **MVP-5.2:** Calcular kg/ha y forraje disponible  
  *Estado:* Campos existen (kgMSPerHa), falta lógica automática  
  *Criterios pendientes:*
  - [ ] Cálculo automático en backend al guardar
  - [ ] Validar que valores sean consistentes
  - [ ] Almacenar forraje disponible (kg MS/ha × hectares × %utilización)

- ❌ **MVP-5.3:** Calcular días recomendados de ocupación  
  *Estado:* NO IMPLEMENTADO  
  *Criterios:*
  - [ ] Parámetros: consumo kg MS/UA/día (ej: 2.5% peso vivo)
  - [ ] Fórmula: días = (forraje disponible kg) / (UA del lote × consumo diario)
  - [ ] Endpoint: GET /paddocks/:id/recommended-days?herdId=xxx
  - [ ] UI: Card "Días recomendados" vs "Días reales"
  - [ ] Alerta si días reales > recomendados (sobrepastoreo)

#### Tareas pendientes (P0)
```
- [ ] Frontend: Wizard aforo en 4 pasos (stepper UI)
- [ ] Backend: Lógica cálculo automático kgMSPerHa
- [ ] Backend: Endpoint días recomendados
- [ ] Backend: Parámetro consumoDiarioPercent en Parameter
- [ ] Frontend: Card "Días recomendados" en potrero/movimiento
- [ ] Frontend: Comparación recomendado vs real con semáforo
- [ ] Test: Validar cálculo días recomendados
```

**Modelo de datos:**
```
ForageSample(
  id, paddockId, kgPerHectare, dryMatter, sampleDate, notes, createdAt, createdBy,
  frameAreaM2, freshWeightKg, dryMatterPercent, utilizationPercent, kgMSPerHa
)
Parameter(id, farmId, key='consumo_diario_percent', value='2.5', description='Consumo diario % PV')
```

**Impacto regenerativo:** Evita sobrepastoreo ajustando días de ocupación a la oferta real de forraje, protege la regeneración del suelo.

---

### 📊 ÉPICA 6 – Dashboard operativo

**Estado:** ⚠️ **PARCIAL** (6 gráficas existen, faltan alertas visuales)

**Objetivo:** Decisiones rápidas con base en datos reales.

#### Historias
- ✅ **MVP-6.1:** KPIs básicos (Peso, UA, UA/ha, ocupación, descanso)  
  *Criterios:* Dashboard muestra 6 gráficas con datos reales

- ⚠️ **MVP-6.2:** Alertas operativas visuales  
  *Estado:* Backend genera alertas, falta UI destacada  
  *Criterios pendientes:*
  - [ ] Panel de alertas con prioridad (HIGH/MEDIUM/LOW)
  - [ ] Badge contador de alertas en navbar
  - [ ] Filtros por tipo (OVERGRAZING, INSUFFICIENT_REST, MISSING_DATA)
  - [ ] Click en alerta navega a entidad relevante

#### Tareas pendientes (P0)
```
- [ ] Frontend: Panel de alertas con iconos y colores
- [ ] Frontend: Badge contador en sidebar
- [ ] Frontend: Modal detalle de alerta
- [ ] Backend: Mejorar lógica de generación de alertas
- [ ] Test: Validar generación de alertas según reglas
```

**KPIs mínimos:**
- ✅ Peso total y UA del sistema
- ✅ UA/ha por finca
- ✅ Días ocupación promedio vs recomendados
- ✅ Descanso promedio de potreros
- ⚠️ Alertas operativas (parcial)

**Impacto regenerativo:** Visibilidad instantánea del estado regenerativo, permite corregir desviaciones antes de daño permanente.

---

### 🔐 ÉPICA 7 – Seguridad, RBAC y Auditoría

**Estado:** ⚠️ **PARCIAL** (Auth completo, auditoría básica)

**Objetivo:** Control de acceso y trazabilidad completa.

#### Historias
- ✅ **MVP-7.1:** Autenticación JWT  
  *Criterios:* Login, token, refresh, logout

- ✅ **MVP-7.2:** Roles por finca (UserFarm)  
  *Criterios:* Validación de acceso en todos los endpoints

- ⚠️ **MVP-7.3:** Auditoría completa  
  *Estado:* createdBy/updatedBy existe, falta AuditLog  
  *Criterios pendientes:*
  - [ ] Tabla AuditLog(userId, farmId, entity, entityId, action, diffJson, createdAt)
  - [ ] Interceptor global que registra CREATE/UPDATE/DELETE
  - [ ] Vista de auditoría por entidad
  - [ ] Filtros por usuario, fecha, acción

#### Tareas pendientes (P0)
```
- [ ] Backend: Modelo AuditLog en Prisma
- [ ] Backend: Interceptor de auditoría
- [ ] Backend: Endpoint GET /audit?entity=&entityId=
- [ ] Frontend: Vista de log de auditoría
- [ ] Test: Validar que todas las mutaciones generan log
```

**Modelo de datos:**
```
AuditLog(
  id, userId, farmId, entity, entityId, action, diffJson, createdAt
)
```

**Impacto regenerativo:** Trazabilidad completa de cambios críticos (movimientos, aforos, pesajes) para análisis posterior.

---

### ⚙️ ÉPICA 8 – Parametría biológica configurable

**Estado:** ✅ **COMPLETADO**

**Objetivo:** Adaptar cálculos a realidad de cada finca.

#### Historias implementadas
- ✅ **MVP-8.1:** Parámetros por finca  
  *Criterios:* Tabla Parameter con key-value, CRUD

- ✅ **MVP-8.2:** Parámetros predeterminados  
  *Criterios:* Seed con valores estándar (UA=450kg, consumo=2.5%)

**Modelo de datos:**
```
Parameter(id, farmId, key, value, description, createdAt, updatedAt, updatedBy)
```

**Parámetros clave:**
- `ua_weight_kg`: 450 (peso UA estándar)
- `consumo_diario_percent`: 2.5 (consumo % peso vivo)
- `materia_seca_default`: 30 (% MS promedio)
- `aprovechamiento_default`: 50 (% aprovechamiento)

**Impacto regenerativo:** Permite ajustar cálculos a diferentes biotipos, climas y estaciones del año.

---

## 🟠 PRO – INTELIGENCIA DE DECISIÓN

> *"La app empieza a aconsejar, no solo a registrar."*

---

### 🔁 ÉPICA 9 – Ciclos de rotación completos

**Estado:** ⚠️ **PARCIAL** (Backend existe, frontend no)

**Objetivo:** Análisis por ciclos completos de pastoreo.

#### Historias
- ⚠️ **PRO-9.1:** Crear y cerrar ciclos  
  *Estado:* Backend completo, falta UI  
  *Criterios pendientes:*
  - [ ] UI para crear ciclo (startDate, targetDays, herdId)
  - [ ] Asociar movimientos a ciclo automáticamente
  - [ ] Cerrar ciclo (endDate) al completar targetDays
  - [ ] Vista de ciclos históricos

- ❌ **PRO-9.2:** Comparativo de ciclos  
  *Estado:* NO IMPLEMENTADO  
  *Criterios:*
  - [ ] Tabla comparativa: ocupación promedio, descanso, ganancia peso
  - [ ] Ranking de potreros por desempeño
  - [ ] Gráfica tendencia por ciclo

#### Tareas pendientes (P1)
```
- [ ] Frontend: CRUD de ciclos
- [ ] Frontend: Vista histórica de ciclos
- [ ] Backend: Endpoint comparativo GET /cycles/compare?farmId=
- [ ] Frontend: Tabla comparativa con filtros
- [ ] Test: Validar asociación movimientos-ciclo
```

**Modelo de datos:**
```
Cycle(id, farmId, herdId, status, startDate, endDate, notes, createdAt, updatedAt, createdBy, updatedBy)
Movement.cycleId (FK a Cycle)
```

**Impacto regenerativo:** Permite medir mejora del sistema a lo largo del tiempo, ajustar estrategias por ciclo.

---

### 📐 ÉPICA 10 – Calibración por finca (clave diferenciadora)

**Estado:** ⚠️ **PARCIAL** (Backend completo, UI básica)

**Objetivo:** Mejorar precisión de cinta métrica con datos propios.

#### Historias
- ⚠️ **PRO-10.1:** Registrar pares (cinta vs báscula)  
  *Estado:* Backend soporta, falta UI especializada  
  *Criterios pendientes:*
  - [ ] Vista de calibración: tabla de pares registrados
  - [ ] Gráfica dispersión: cinta vs báscula
  - [ ] Cálculo error promedio y RMSE

- ❌ **PRO-10.2:** Ajustar fórmula automáticamente  
  *Estado:* NO IMPLEMENTADO  
  *Criterios:*
  - [ ] Algoritmo ajuste de divisor por regresión
  - [ ] Recomendar nuevo divisor si RMSE mejora > 5%
  - [ ] Aplicar calibración y registrar en historial

- ❌ **PRO-10.3:** Validar precisión en tiempo real  
  *Estado:* NO IMPLEMENTADO  
  *Criterios:*
  - [ ] Badge de confianza en cada pesaje cinta (% error esperado)
  - [ ] Alerta si error > 10% consistentemente

#### Tareas pendientes (P1)
```
- [ ] Frontend: Vista de calibración con tabla y gráfica
- [ ] Backend: Algoritmo de ajuste de divisor
- [ ] Backend: Endpoint POST /calibration/:farmId/adjust
- [ ] Frontend: Botón "Recalibrar" con confirmación
- [ ] Backend: Registrar en TapeCalibrationHistory
- [ ] Test: Validar que ajuste mejora precisión
```

**Modelo de datos:**
```
TapeCalibration(id, farmId, divisor, status, notes, appliedDate, createdAt, updatedAt, updatedBy)
TapeCalibrationHistory(id, farmId, previousDivisor, newDivisor, samplesUsed, rmseError, createdAt)
```

**Impacto regenerativo:** Democratiza acceso a pesaje preciso sin infraestructura costosa, clave para pequeños productores.

---

### 📘 ÉPICA 11 – Guías de campo integradas

**Estado:** ❌ **NO IMPLEMENTADO**

**Objetivo:** Estandarizar toma de datos en campo.

#### Historias
- ❌ **PRO-11.1:** Guía paso a paso para aforo  
  *Criterios:*
  - [ ] Checklist descargable (materiales, procedimiento)
  - [ ] Wizard in-app con instrucciones por paso
  - [ ] Imágenes de referencia (marco, pesaje, cálculo)
  - [ ] Tips para evitar errores comunes

- ❌ **PRO-11.2:** Guía paso a paso para pesaje con cinta  
  *Criterios:*
  - [ ] Instrucciones: dónde medir perímetro torácico
  - [ ] Imagen anatómica de referencia
  - [ ] Instrucciones: dónde medir longitud corporal
  - [ ] Tips para animal tranquilo

- ❌ **PRO-11.3:** Guía paso a paso para rotación  
  *Criterios:*
  - [ ] Checklist: verificar descanso, aforo reciente, carga vs forraje
  - [ ] Decisión guiada: ¿mover hoy o esperar?
  - [ ] Tips para evitar sobrepastoreo

#### Tareas pendientes (P1)
```
- [ ] Backend: Modelo FieldGuide(id, farmId, type, version, stepsJson)
- [ ] Backend: Seed con 3 guías base
- [ ] Frontend: Vista de guías por tipo
- [ ] Frontend: Wizard guiado con stepper
- [ ] Frontend: Galería de imágenes de referencia
- [ ] Docs: Escribir contenido de guías (texto + imágenes)
```

**Modelo de datos:**
```
FieldGuide(
  id, farmId, type, version, stepsJson, createdAt, updatedAt
)
type: AFORO | PESAJE_TAPE | ROTACION
stepsJson: [
  { step: 1, title: "Preparar marco", description: "...", imageUrl: "..." },
  { step: 2, title: "Tomar muestra", description: "...", imageUrl: "..." },
  ...
]
```

**Impacto regenerativo:** Estandariza procedimientos, reduce errores, permite replicar buenas prácticas entre usuarios.

---

### 🚨 ÉPICA 12 – Alertas inteligentes avanzadas

**Estado:** ⚠️ **PARCIAL** (Lógica básica, UI incompleta)

**Objetivo:** Prevenir errores operativos críticos.

#### Historias
- ⚠️ **PRO-12.1:** Alerta de sobrepastoreo  
  *Estado:* Lógica parcial, falta configuración  
  *Criterios pendientes:*
  - [ ] Detectar movimiento activo > 7 días (configurable)
  - [ ] Comparar días reales vs recomendados
  - [ ] Alerta HIGH si excede en > 50%

- ⚠️ **PRO-12.2:** Alerta de descanso insuficiente  
  *Estado:* Lógica parcial  
  *Criterios pendientes:*
  - [ ] Calcular descanso desde última salida
  - [ ] Comparar con minRestDays del potrero
  - [ ] Alerta HIGH si intenta entrada prematura

- ⚠️ **PRO-12.3:** Alerta de pesaje vencido  
  *Estado:* Lógica existe  
  *Criterios pendientes:*
  - [ ] Configurar intervalo máximo (ej: 30 días)
  - [ ] Alerta MEDIUM si último pesaje > intervalo

- ❌ **PRO-12.4:** Alerta de carga alta  
  *Estado:* NO IMPLEMENTADO  
  *Criterios:*
  - [ ] Calcular UA/ha del movimiento actual
  - [ ] Comparar con carga óptima (ej: 2 UA/ha)
  - [ ] Alerta HIGH si excede capacidad

#### Tareas pendientes (P1)
```
- [ ] Backend: Configurar umbrales en Parameter
- [ ] Backend: Mejorar lógica generación alertas
- [ ] Backend: Endpoint GET /alerts?farmId=&severity=
- [ ] Frontend: Panel de alertas con filtros
- [ ] Frontend: Notificación push (opcional)
- [ ] Test: Validar todas las reglas de alertas
```

**Impacto regenerativo:** Previene daño permanente al suelo y pastura, mantiene sistema en equilibrio regenerativo.

---

### 📈 ÉPICA 13 – Observabilidad y métricas

**Estado:** ⚠️ **PARCIAL** (Health checks, logs básicos)

**Objetivo:** Monitoreo profesional de la plataforma.

#### Historias
- ✅ **PRO-13.1:** Health checks  
  *Criterios:* Endpoints /health y /health/detailed

- ❌ **PRO-13.2:** Logs estructurados  
  *Estado:* NO IMPLEMENTADO  
  *Criterios:*
  - [ ] Winston o Pino con formato JSON
  - [ ] Niveles: ERROR, WARN, INFO, DEBUG
  - [ ] Context: userId, farmId, entity, action

- ❌ **PRO-13.3:** Métricas con OpenTelemetry  
  *Estado:* NO IMPLEMENTADO  
  *Criterios:*
  - [ ] Instrumentar endpoints críticos
  - [ ] Métricas: latencia, errores, throughput
  - [ ] Exportar a Prometheus/Grafana

#### Tareas pendientes (P1)
```
- [ ] Backend: Instalar y configurar Winston
- [ ] Backend: Logger service centralizado
- [ ] Backend: Instalar @opentelemetry/sdk-node
- [ ] Backend: Instrumentar endpoints
- [ ] DevOps: Configurar Prometheus + Grafana (opcional)
```

**Impacto regenerativo:** Confiabilidad de la plataforma = confianza del usuario = adopción masiva.

---

## 🟢 PREMIUM – DIFERENCIADOR TOTAL

> *"La finca se convierte en un sistema vivo digital."*

---

### 🗺️ ÉPICA 14 – Vista visual interactiva (2.5D / 3D)

**Estado:** ❌ **NO IMPLEMENTADO**

**Objetivo:** Comprensión instantánea del estado de la finca.

#### Historias
- ❌ **PREMIUM-14.1:** Mapa 2.5D de potreros  
  *Criterios:*
  - [ ] Canvas o Three.js con vista isométrica
  - [ ] Potreros como polígonos coloreados por estado
  - [ ] Verde: READY, Amarillo: RESTING, Rojo: OCCUPIED
  - [ ] Hover muestra datos del potrero

- ❌ **PREMIUM-14.2:** Lotes animados en mapa  
  *Criterios:*
  - [ ] Iconos de lotes posicionados en potrero actual
  - [ ] Animación al mover lote (transición suave)
  - [ ] Click en lote muestra detalle

- ❌ **PREMIUM-14.3:** Simulación de rotación  
  *Criterios:*
  - [ ] "¿Qué pasa si muevo hoy vs mañana?"
  - [ ] Previsualizar impacto en descanso y carga
  - [ ] Sugerir mejor momento para mover

#### Tareas pendientes (P2)
```
- [ ] Frontend: Instalar Three.js o React Three Fiber
- [ ] Frontend: Componente Canvas3D
- [ ] Frontend: Cargar geometrías de potreros
- [ ] Frontend: Renderizar estado por color
- [ ] Frontend: Animación de movimientos
- [ ] Backend: Endpoint simulación GET /simulation/move?herdId=&paddockId=
```

**Impacto regenerativo:** Visualización intuitiva facilita decisiones complejas, reduce errores, acelera adopción.

---

### 📶 ÉPICA 15 – Offline-first total

**Estado:** ❌ **NO IMPLEMENTADO**

**Objetivo:** Captura en campo real sin señal.

#### Historias
- ❌ **PREMIUM-15.1:** Cola de eventos offline  
  *Criterios:*
  - [ ] LocalStorage o IndexedDB para almacenar operaciones
  - [ ] Tabla OfflineEvent(entity, payload, status, createdAt)
  - [ ] Encolar CREATE/UPDATE/DELETE cuando offline

- ❌ **PREMIUM-15.2:** Sincronización automática  
  *Criterios:*
  - [ ] Detectar conexión online
  - [ ] Enviar eventos en orden (FIFO)
  - [ ] Marcar como SYNCED o FAILED
  - [ ] Reintentar FAILED con backoff exponencial

- ❌ **PREMIUM-15.3:** Resolución de conflictos  
  *Criterios:*
  - [ ] Detectar conflictos (misma entidad editada online/offline)
  - [ ] UI para resolver: mantener local, remoto, o merge
  - [ ] Log de conflictos resueltos

#### Tareas pendientes (P3)
```
- [ ] Frontend: Service Worker con cache
- [ ] Frontend: Hook useOfflineQueue()
- [ ] Backend: Modelo OfflineEvent en Prisma
- [ ] Backend: Endpoint POST /sync/events (batch)
- [ ] Frontend: UI de conflictos
- [ ] Test: Simular offline, sincronizar, conflictos
```

**Modelo de datos:**
```
OfflineEvent(
  id, farmId, userId, entity, payloadJson, status, createdAt
)
status: PENDING | SYNCED | FAILED
```

**Impacto regenerativo:** Captura datos en campo sin señal = datos más precisos y oportunos = mejores decisiones.

---

### 🧠 ÉPICA 16 – Indicadores regenerativos avanzados

**Estado:** ❌ **NO IMPLEMENTADO** (Controlador vacío existe)

**Objetivo:** Medir salud regenerativa del sistema.

#### Historias
- ❌ **PREMIUM-16.1:** Presión de pastoreo  
  *Criterios:*
  - [ ] Fórmula: (UA actual / UA óptima) × 100
  - [ ] Gráfica histórica por potrero
  - [ ] Alerta si presión > 120% consistentemente

- ❌ **PREMIUM-16.2:** Índice de recuperación  
  *Criterios:*
  - [ ] Fórmula: (descanso real / descanso óptimo) × 100
  - [ ] Ranking de potreros
  - [ ] Tendencia: mejorando, estable, deteriorando

- ❌ **PREMIUM-16.3:** Ganancia diaria promedio  
  *Criterios:*
  - [ ] Calcular kg/día entre pesajes
  - [ ] Comparar con meta (ej: 0.7 kg/día)
  - [ ] Gráfica tendencia por lote y ciclo

#### Tareas pendientes (P3)
```
- [ ] Backend: Lógica cálculo indicadores
- [ ] Backend: Endpoint GET /indicators/:farmId
- [ ] Frontend: Vista de indicadores con gráficas
- [ ] Frontend: Tabla comparativa con metas
- [ ] Test: Validar fórmulas indicadores
```

**Impacto regenerativo:** Mide directamente la salud del sistema, valida que la ganadería es regenerativa, no solo intensiva.

---

### 📤 ÉPICA 17 – Exportación y reportes técnicos

**Estado:** ⚠️ **PARCIAL** (Controlador existe, lógica vacía)

**Objetivo:** Profesionalizar comunicación de resultados.

#### Historias
- ❌ **PREMIUM-17.1:** PDF técnico  
  *Criterios:*
  - [ ] Reporte mensual: KPIs, gráficas, alertas
  - [ ] Logo finca, fecha, firma digital
  - [ ] Secciones: resumen ejecutivo, detalle por potrero, recomendaciones

- ❌ **PREMIUM-17.2:** Excel/CSV  
  *Criterios:*
  - [ ] Exportar: pesajes, movimientos, aforos, alertas
  - [ ] Filtros por fecha, lote, potrero
  - [ ] Formato estándar para análisis externo

- ❌ **PREMIUM-17.3:** Históricos por ciclo  
  *Criterios:*
  - [ ] Reporte comparativo de ciclos
  - [ ] Tabla con ocupación, descanso, ganancia, forraje
  - [ ] Gráfica tendencia mejora

#### Tareas pendientes (P2)
```
- [ ] Backend: Instalar pdfmake o puppeteer
- [ ] Backend: Implementar lógica generación PDF
- [ ] Backend: Endpoint POST /export/pdf?farmId=&startDate=&endDate=
- [ ] Backend: Instalar exceljs
- [ ] Backend: Endpoint POST /export/csv?entity=&farmId=
- [ ] Frontend: Botones "Exportar PDF" y "Exportar CSV"
- [ ] Test: Validar contenido de exportaciones
```

**Impacto regenerativo:** Facilita presentación de resultados a inversores, certificadores, asociaciones ganaderas.

---

## 📋 RESUMEN EJECUTIVO DE BACKLOG

### Estado general (estimado)

| Nivel   | Completitud | Prioridad | Riesgo |
|---------|-------------|-----------|--------|
| MVP     | ~70%        | P0        | ALTO   |
| PRO     | ~20%        | P1        | MEDIO  |
| PREMIUM | ~5%         | P2-P3     | BAJO   |

### Tareas críticas bloqueantes (P0)

1. ❌ **Validación de descanso antes de movimiento** (seguridad regenerativa)
2. ❌ **Cálculo de días recomendados** (decisión operativa clave)
3. ❌ **Wizard de aforo guiado** (captura estándar de datos)
4. ❌ **UI de pesaje con cinta métrica** (democratización del pesaje)
5. ❌ **Panel de alertas visuales** (prevención de errores)
6. ❌ **Tests automatizados** (confiabilidad de la plataforma)
7. ❌ **Auditoría completa** (trazabilidad y seguridad)

### Roadmap sugerido (sprints de 2 semanas)

#### Sprint 1-2: MVP Critical Path
- Validación de descanso
- Cálculo días recomendados
- Tests unitarios core

#### Sprint 3-4: Capturas guiadas
- Wizard aforo
- UI pesaje cinta
- Comparativa real vs estimado

#### Sprint 5-6: Alertas y auditoría
- Panel de alertas visual
- AuditLog completo
- Tests de integración

#### Sprint 7-8: PRO foundations
- UI ciclos de rotación
- Guías de campo (contenido + UI)
- Observabilidad básica

#### Sprint 9-12: PRO + PREMIUM piloto
- Calibración activa
- Exportaciones PDF/CSV
- Vista 2.5D piloto (1 finca)

---

## 🎯 POR QUÉ ESTE BACKLOG HACE DEL PRODUCTO UNA HERRAMIENTA ÚNICA

### 1. **Enfoque regenerativo real**
- No es solo "manejo de ganado", es **regeneración del sistema suelo-planta-animal**
- Cada feature valida principios regenerativos: descanso, carga ajustada, forraje disponible

### 2. **Democratización tecnológica**
- **Pesaje con cinta métrica + calibración** = acceso a control de peso sin báscula costosa
- **Aforo guiado** = estandariza toma de datos sin necesidad de experto
- **Offline-first** = funciona en campo real sin señal

### 3. **Precisión adaptativa**
- **Calibración por finca** = cada productor ajusta la herramienta a su realidad
- **Parametría biológica** = adaptable a región, clima, biotipo

### 4. **Decisión guiada, no solo registro**
- **Días recomendados vs reales** = guía operativa diaria
- **Alertas inteligentes** = previene errores antes del daño
- **Guías de campo** = estandariza procedimientos

### 5. **Visualización que comunica**
- **Vista 2.5D** = comprensión instantánea
- **Gráficas regenerativas** = miden salud del sistema, no solo producción
- **Reportes técnicos** = profesionaliza comunicación de resultados

### 6. **Trazabilidad total**
- **Auditoría completa** = confianza en los datos
- **Comparativo de ciclos** = mide mejora en el tiempo
- **Indicadores regenerativos** = valida que la práctica es regenerativa

---

**Conclusión:** Este backlog transforma Magrotec de un simple "gestor de finca" en **la herramienta definitiva de ganadería regenerativa**, accesible, precisa, guiada y verificable. No existe competidor directo con este nivel de enfoque regenerativo + democratización tecnológica.
