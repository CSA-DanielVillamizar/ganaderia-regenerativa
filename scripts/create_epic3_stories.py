#!/usr/bin/env python3
"""
Crear historias P0 de Épica #3 "Rotación y Descanso" en GitHub Issues
Cada historia es una tarea ejecutable de 1-3 días

Ejecutar:
  python scripts/create_epic3_stories.py
"""

import json
import subprocess
import sys
from typing import Optional

# ============================================================================
# DATOS DE HISTORIAS P0
# ============================================================================

EPIC_3_STORIES = [
    {
        "number": 1,
        "title": "[P0][Épica#3-1] MOVIMIENTO: Registrar entrada a potrero (UX + validación)",
        "labels": ["story", "P0", "backend", "frontend"],
        "assignee": None,
        "body": """## 📋 Objetivo
Permitir al operador registrar la entrada de un lote a un potrero CON validación visual de descanso.

## 🌱 Impacto Regenerativo
**CRÍTICO** - Sin UI clara, operador entra lote a potrero sin verificar descanso → daño al pasto.

## 👤 User Story
```
Como: Técnico de campo
Quiero: Registrar entrada de lote a potrero con 1 click
Para: Documentar inicio de ocupación
```

## ✅ Criterios de Aceptación
- [ ] Form/Modal accesible desde detalle de lote o dashboard
- [ ] Selector de potrero **filtra solo potreros READY** (descanso OK)
- [ ] Si potrero.restDays < potrero.minRestDays → **ALERTA ROJA** (badge "Descanso insuficiente")
- [ ] Botón "Ocupar" **deshabilitado con tooltip** si descanso insuficiente
- [ ] Input: `entryDate` (default: hoy), `notes` (opcional)
- [ ] POST `/movements` envía `{herdId, paddockId, entryDate, type: "ENTRY"}`
- [ ] Response: `movementId`, `paddockName`, `herdName`, `entryDate`
- [ ] Toast success: "Lote {{ herdName }} entró a {{ paddockName }}"

## 🛠 Alcance Técnico

### Backend (NestJS)
- Endpoint `GET /paddocks/:id/rest-days` → retorna `{restDays, minRestDays, status}`
- Endpoint `POST /movements` ya existe ✅
- Método `validateMinimumRestDays()` ya existe ✅

### Data
- Ninguna migración necesaria (Movement model completo)

### Frontend (Next.js)
- Componente: `<HerdMovementForm herdId={...} />`
- Selector: `<PaddockSelect farmId={...} onlyReady={true} />` con filtro
- UI: Badge rojo si `restDays < minRestDays`
- Deshabilitación de botón con `disabled={isRestInvalid}`

## 🧪 Pruebas Obligatorias
- ✅ Unit: `paddockService.calculateRestDays()` retorna número correcto
- ✅ Integration: `POST /movements` con descanso OK → 201, movementId generado
- ✅ Integration: `POST /movements` con descanso < min → 409, mensaje claro
- ✅ E2E: Seleccionar potrero → Ver alerta si descanso insuficiente → Intentar ocupar → Bloqueado

## ✔️ Definición de Done (DoD)
- [ ] Endpoint `GET /paddocks/:id/rest-days` retorna `{restDays, minRestDays, status}`
- [ ] Frontend: Modal de ocupación con selector inteligente
- [ ] Alerta visual clara en rojo si descanso insuficiente
- [ ] Tests: 100% cobertura de cálculo de descanso
- [ ] Documentación técnica: Explicar lógica de descanso en README

## 📌 Dependencias
Relacionado a: #3 (Épica Rotación y Descanso)
Prerequisitos: Ninguno (backend existente)
Bloqueador para: #3-2, #3-4, #3-9

## 🕐 Estimación
2 días (5-8 horas)
"""
    },
    {
        "number": 2,
        "title": "[P0][Épica#3-2] MOVIMIENTO: Cerrar salida y calcular ocupación",
        "labels": ["story", "P0", "backend", "frontend", "data"],
        "assignee": None,
        "body": """## 📋 Objetivo
Registrar la salida de un lote de un potrero y calcular automáticamente días de ocupación y descanso.

## 🌱 Impacto Regenerativo
**CRÍTICO** - Cálculo correcto de ocupación determina si hay sobrepastoreo. Cada día cuenta.

## 👤 User Story
```
Como: Técnico de campo
Quiero: Registrar salida de lote y ver días de ocupación
Para: Documentar duración de ocupación y calcular descanso automáticamente
```

## ✅ Criterios de Aceptación
- [ ] Botón "Cerrar" visible solo en movimientos ACTIVE
- [ ] Input: `exitDate` (default: hoy)
- [ ] PATCH `/movements/:id/close` envía `{exitDate}`
- [ ] Response calcula:
  - `occupancyDays` = (exitDate - entryDate) / 86400
  - Potrero pasa a status "RESTING" (automático)
- [ ] Toast: "Lote ocupó 7 días. Descanso iniciado: {{ lastExitDate }}"
- [ ] Validación: exitDate ≥ entryDate, sino → 400

## 🛠 Alcance Técnico

### Backend (NestJS)
- Endpoint `PATCH /movements/:id/close` ya existe ✅
- Agregar cálculo: `occupancyDays` como campo computed (VIRTUAL field)
- Actualizar status de Movement a "CLOSED"
- Trigger: Actualizar lastExitDate en Paddock

### Data
- Agregar campo `lastExitDate` en Paddock (nullable DateTime)
- Migración: `ALTER TABLE Paddock ADD COLUMN lastExitDate DateTime NULL`

### Frontend (Next.js)
- Botón "Cerrar": visible si `movement.status === "ACTIVE"`
- Modal de confirmación: "¿Cerrar ocupación?" mostrando duración estimada
- Display: Card con `{{ occupancyDays }} días`

## 🧪 Pruebas Obligatorias
- ✅ Unit: `calculateOccupancyDays(entryDate, exitDate)` retorna número correcto
- ✅ Integration: `PATCH /movements/:id/close` con exitDate válida → 200, occupancyDays calculado
- ✅ Integration: `PATCH /movements/:id/close` con exitDate < entryDate → 400
- ✅ E2E: Crear movimiento → Esperar X días → Cerrar → Ver ocupación correcta

## ✔️ Definición de Done (DoD)
- [ ] Campo `lastExitDate` agregado a Paddock
- [ ] Endpoint retorna `occupancyDays` calculado
- [ ] Tests: ✅ 100% de casos de ocupación
- [ ] UI: Badge con "{{ occupancyDays }} días"

## 📌 Dependencias
Relacionado a: #3 (Épica Rotación y Descanso)
Prerequisitos: #3-1 (registro de entrada)
Bloqueador para: #3-4, #3-6

## 🕐 Estimación
2 días (5-8 horas)
"""
    },
    {
        "number": 3,
        "title": "[P0][Épica#3-3] VALIDACIÓN: Un solo movimiento ACTIVE por lote (409)",
        "labels": ["story", "P0", "backend", "qa"],
        "assignee": None,
        "body": """## 📋 Objetivo
Garantizar que un lote NO puede estar en 2 potreros simultáneamente (fuente de verdad).

## 🌱 Impacto Regenerativo
**CRÍTICO** - Si lote está "en 2 potreros", sistema no regenerativo. Pánico.

## 👤 User Story
```
Como: Sistema
Quiero: Rechazar CREATE /movements si lote.activeMovement existe
Para: Mantener integridad de datos
```

## ✅ Criterios de Aceptación
- [ ] Before `Movement.create()`: Query `movements WHERE herdId = ? AND status = "ACTIVE"`
- [ ] Si resultado > 0 → `throw 409 Conflict` con mensaje:
  ```
  "El lote {{ herdName }} ya está ocupando {{ paddockName }} desde {{ entryDate }}. 
   Cierre ese movimiento antes de crear uno nuevo."
  ```
- [ ] Test: Intenta crear 2 movimientos simultáneos → 2do rechazado con 409
- [ ] Índice en `(herdId, status)` para query rápida

## 🛠 Alcance Técnico

### Backend (NestJS)
- Método ya existe: `validateNoActiveMovements()` ✅
- Verificar que se llama en `MovementService.create()`
- Asegurar índice `(herdId, status)` en Prisma schema

### Data
- Agregar constraint unique (o check) si aún no existe
- Índice: `@@index([herdId, status])`

### Frontend (Next.js)
- UI: Mostrar error 409 con toast rojo
- Sugerir: "Cierre movimiento activo primero"

## 🧪 Pruebas Obligatorias
- ✅ Unit: `validateNoActiveMovements()` detecta conflicto
- ✅ Integration: Crear movimiento #1 → OK (201). Crear #2 → 409 Conflict
- ✅ E2E: Intentar ocupar 2 potreros simultáneamente → bloqueado

## ✔️ Definición de Done (DoD)
- [ ] Validación ejecutada siempre en `Movement.create()`
- [ ] Mensaje de error claro en respuesta 409
- [ ] Índice `(herdId, status)` en schema
- [ ] Tests: 100% cobertura de conflicto

## 📌 Dependencias
Relacionado a: #3 (Épica Rotación y Descanso)
Prerequisitos: Ninguno (backend existente)
Bloqueador para: Ninguno

## 🕐 Estimación
1 día (2-4 horas)
"""
    },
    {
        "number": 4,
        "title": "[P0][Épica#3-4] VALIDACIÓN: Bloquear entrada por descanso insuficiente",
        "labels": ["story", "P0", "backend", "frontend", "qa"],
        "assignee": None,
        "body": """## 📋 Objetivo
NO permitir entrada a potrero si `restDays < minRestDays`.

## 🌱 Impacto Regenerativo
**CRÍTICO** - Sin bloqueo, se viola el descanso mínimo → **degradación del pasto**.

## 👤 User Story
```
Como: Sistema
Quiero: Rechazar POST /movements si descanso < minRestDays
Para: Proteger regeneración del pasto
```

## ✅ Criterios de Aceptación
- [ ] Before `Movement.create()`:
  1. Obtener `paddock.minRestDays` (o default 30 días)
  2. Calcular `restDays = TODAY - paddock.lastExitDate`
  3. Si `restDays < minRestDays` → `throw 409 Conflict`
- [ ] Respuesta 409:
  ```json
  {
    "statusCode": 409,
    "message": "Descanso insuficiente",
    "details": {
      "paddockName": "Potrero Sur",
      "restDaysRequired": 30,
      "restDaysActual": 18,
      "restDaysRemaining": 12,
      "availableDate": "2026-01-20T00:00:00Z"
    }
  }
  ```
- [ ] Test: Intenta ocupar potrero con descanso 10d < 30d min → 409
- [ ] Test: Intenta ocupar potrero con descanso 31d > 30d min → 201

## 🛠 Alcance Técnico

### Backend (NestJS)
- Método ya existe: `validateMinimumRestDays()` ✅
- Verificar que:
  1. Calcula `lastExitDate` correctamente
  2. Retorna `restDays` numérico
  3. Compara vs `minRestDays` del Parameter
  4. Lanza excepción con detalles

### Data
- Asegurar `Paddock.lastExitDate` existe (agregado en historia #2)
- Parameter: `{farmId, key: "minRestDays", value: "30"}`

### Frontend (Next.js)
- Capturar 409 en `createMovement.onError`
- Mostrar UI: "❌ Descanso insuficiente"
- Display: "Falta {{ restDaysRemaining }} días (disponible {{ availableDate }})"
- Deshabilitar botón "Ocupar" si descanso < min

## 🧪 Pruebas Obligatorias
- ✅ Unit: `calculateRestDays(lastExitDate, today)` → número correcto
- ✅ Unit: Comparación `restDays < minRestDays` → boolean correcto
- ✅ Integration: `POST /movements` con descanso OK → 201
- ✅ Integration: `POST /movements` con descanso < min → 409 con detalles
- ✅ E2E: Potrero con descanso insuficiente → Botón deshabilitado, tooltip rojo

## ✔️ Definición de Done (DoD)
- [ ] Validación ocurre ANTES de `Movement.create()`
- [ ] Respuesta 409 incluye detalles de descanso
- [ ] Tests: ✅ 100% casos edge (descanso = min, descanso < min, descanso > min)
- [ ] Documentación: Explicar minRestDays parameter

## 📌 Dependencias
Relacionado a: #3 (Épica Rotación y Descanso)
Prerequisitos: #3-2 (lastExitDate agregado)
Bloqueador para: #3-1 (bloquea entrada sin descanso)

## 🕐 Estimación
2 días (5-8 horas)
"""
    },
    {
        "number": 5,
        "title": "[P0][Épica#3-5] UI: Vista 'Estado actual del lote' (dónde está AHORA)",
        "labels": ["story", "P0", "frontend"],
        "assignee": None,
        "body": """## 📋 Objetivo
Mostrar en tiempo real dónde está el lote (potrero, días ocupados, cuándo sale estimado).

## 🌱 Impacto Regenerativo
**IMPORTANTE** - Operador necesita saber dónde está cada lote para gestionar rotación.

## 👤 User Story
```
Como: Técnico de campo
Quiero: Ver en detalle de lote: "Está en Potrero Sur, Día 5 de 8"
Para: Conocer estado actual y próximos movimientos
```

## ✅ Criterios de Aceptación
- [ ] Card "Estado Actual" en `/herds/:id`:
  ```
  ┌─────────────────────────────────────┐
  │ 📍 ESTADO ACTUAL DEL LOTE           │
  ├─────────────────────────────────────┤
  │ Potrero: Potrero Sur                │
  │ Entrada: 3 de enero, 08:30          │
  │ Ocupación: Día 5 de ~8 (62%)        │
  │ Salida estimada: ~8 de enero        │
  │ Descanso requerido: 30 días         │
  │ Siguiente potrero: (Sugerencia)     │
  │ [Cerrar ocupación]                  │
  └─────────────────────────────────────┘
  ```
- [ ] Si no hay movimiento activo:
  ```
  ⚠️ Lote SIN UBICACIÓN ACTUAL
  [Ocupar potrero]
  ```
- [ ] Cálculo en tiempo real:
  - `occupancyDays = floor((NOW - entryDate) / 86400)`
  - `percentageUsed = occupancyDays / recommendedDays * 100`

## 🛠 Alcance Técnico

### Backend (NestJS)
- Endpoint `GET /herds/:id` retorna:
  ```json
  {
    "herd": {...},
    "activeMovement": {
      "id": "mov-123",
      "paddockName": "Potrero Sur",
      "entryDate": "2026-01-03T08:30:00Z",
      "occupancyDays": 5,
      "occupancyPercent": 62,
      "estimatedExitDate": "2026-01-08T00:00:00Z"
    }
  }
  ```
- Incluir campos calculados (sin persistir)

### Frontend (Next.js)
- Componente: `<HerdStatusCard activeMovement={...} />`
- Mostrar progreso visual: barra 62% llena
- Condiciones:
  - Si activo: mostrar datos y botón "Cerrar"
  - Si no: mostrar alerta y botón "Ocupar"

## 🧪 Pruebas Obligatorias
- ✅ Unit: Cálculo de `occupancyDays` en tiempo real
- ✅ Integration: `GET /herds/:id` retorna `activeMovement` con todos campos
- ✅ E2E: Abrir detalle de lote → Ver estado actual → Barra progreso correcta

## ✔️ Definición de Done (DoD)
- [ ] Componente `<HerdStatusCard>` creado
- [ ] Cálculos dinámicos (sin caché)
- [ ] Tests: ✅ Cobertura de casos (activo, no activo)
- [ ] UI: Responsive en móvil

## 📌 Dependencias
Relacionado a: #3 (Épica Rotación y Descanso)
Prerequisitos: #3-1, #3-2 (movimientos funcionales)
Bloqueador para: Ninguno

## 🕐 Estimación
1-2 días (3-6 horas)
"""
    },
    {
        "number": 6,
        "title": "[P0][Épica#3-6] UI: Descanso - Cálculo y semáforo (estado potrero)",
        "labels": ["story", "P0", "backend", "frontend"],
        "assignee": None,
        "body": """## 📋 Objetivo
Mostrar estado de descanso de cada potrero con semáforo visual (verde = listo, amarillo = descansando, rojo = ocupado).

## 🌱 Impacto Regenerativo
**CRÍTICO** - Operador ve de una vista cuál potrero está listo para rotación → decisiones ágiles.

## 👤 User Story
```
Como: Técnico de campo
Quiero: Ver mapa de potreros con código de colores
Para: Saber de un vistazo cuál potrero puedo usar
```

## ✅ Criterios de Aceptación
- [ ] Endpoint `GET /paddocks/:id/status` retorna:
  ```json
  {
    "paddockId": "pad-123",
    "paddockName": "Potrero Sur",
    "hectares": 2.5,
    "status": "RESTING",
    "currentHerd": null,
    "occupancyDays": null,
    "lastExitDate": "2026-01-01T12:00:00Z",
    "restDays": 7,
    "minRestDays": 30,
    "restPercent": 23,
    "readyDate": "2026-01-31T00:00:00Z",
    "color": "yellow"
  }
  ```
- [ ] Colores:
  - 🟢 **GREEN** (READY): `restDays >= minRestDays`
  - 🔴 **RED** (OCCUPIED): actualmente ocupado por lote
  - 🟡 **YELLOW** (RESTING): `restDays < minRestDays`
- [ ] Badge mostrado en mapa con:
  - Color
  - Nombre potrero
  - Si OCCUPIED: nombre lote + días
  - Si RESTING: "{{ restDays }}/{{ minRestDays }} días"
  - Si READY: ✅

## 🛠 Alcance Técnico

### Backend (NestJS)
- Endpoint nuevo: `GET /paddocks/:id/status`
- Query:
  1. Obtener paddock + lastExitDate
  2. Si movement ACTIVE: status = OCCUPIED, return herd name
  3. Si movement CLOSED: calcular `restDays = NOW - lastExitDate`
  4. Comparar vs `minRestDays` parameter
  5. Asignar status y color

### Frontend (Next.js)
- Actualizar `<PaddockMap>` para usar nuevo endpoint
- Renderizar badge con color dinámico
- Tooltip hover: mostrar detalles completos

## 🧪 Pruebas Obligatorias
- ✅ Unit: Lógica de cálculo de estado (READY, OCCUPIED, RESTING)
- ✅ Integration: `GET /paddocks/:id/status` retorna color correcto
- ✅ E2E: Mapa de potreros muestra colores correctos según estado

## ✔️ Definición de Done (DoD)
- [ ] Endpoint `/paddocks/:id/status` operativo
- [ ] Colores calculados correctamente
- [ ] Tests: ✅ Todos los estados
- [ ] UI: Actualización en tiempo real (cada 30s o al refrescar)

## 📌 Dependencias
Relacionado a: #3 (Épica Rotación y Descanso)
Prerequisitos: #3-2 (lastExitDate), #3-4 (descanso cálculo)
Bloqueador para: Ninguno

## 🕐 Estimación
2 días (5-8 horas)
"""
    },
    {
        "number": 7,
        "title": "[P0][Épica#3-7] UI: Historial de movimientos (timeline)",
        "labels": ["story", "P0", "frontend"],
        "assignee": None,
        "body": """## 📋 Objetivo
Mostrar historial visual del lote en últimos 60-90 días con fechas, potreros, duración, descanso.

## 🌱 Impacto Regenerativo
**IMPORTANTE** - Trazabilidad visual ayuda a entender patrón de rotación y detectar errores.

## 👤 User Story
```
Como: Técnico/Ganadero
Quiero: Ver historial de rotación del lote (últimos 60 días)
Para: Auditar rotación y detectar anomalías
```

## ✅ Criterios de Aceptación
- [ ] Sección "Historial de Rotación" en `/herds/:id`
- [ ] Tabla/Timeline con columnas:
  | Potrero | Entrada | Salida | Días | Descanso Siguiente | Estado |
  |---------|---------|--------|------|-------------------|--------|
  | Sur | 01/01 08:30 | 08/01 16:00 | 7 | 23 → RESTING | ✅ |
  | Oeste | 31/12 10:00 | 01/01 07:30 | 0.7 | 28 → RESTING | ✅ |
  
- [ ] Filtro: últimos 30, 60, 90 días
- [ ] Ordenamiento: más reciente primero
- [ ] Solo movimientos CLOSED (histórico)

## 🛠 Alcance Técnico

### Backend (NestJS)
- Endpoint `GET /herds/:id/movements/history?days=60`
- Query: `movements WHERE herdId = :id AND status = "CLOSED" AND exitDate > now() - days`
- Incluir: paddock info + cálculos de ocupación y descanso siguiente

### Frontend (Next.js)
- Componente: `<MovementHistory movements={...} />`
- Tabla responsiva (en móvil: cards)
- Colores de fondo para estado

## 🧪 Pruebas Obligatorias
- ✅ Integration: `GET /herds/:id/movements/history` retorna movimientos correctos
- ✅ Integration: Filtro `days=60` excluye movimientos anteriores
- ✅ E2E: Abrir historial → Verificar datos correctos

## ✔️ Definición de Done (DoD)
- [ ] Endpoint operativo con filtro
- [ ] Componente renderiza tabla/timeline
- [ ] Tests: ✅ Filtros correctos
- [ ] Documentación: Explicar período histórico

## 📌 Dependencias
Relacionado a: #3 (Épica Rotación y Descanso)
Prerequisitos: #3-2 (movimientos con exitDate)
Bloqueador para: Ninguno

## 🕐 Estimación
2 días (5-8 horas)
"""
    },
    {
        "number": 8,
        "title": "[P0][Épica#3-8] DATA + BACKEND: Auditoría de cambios (audit_log)",
        "labels": ["story", "P0", "backend", "data", "security"],
        "assignee": None,
        "body": """## 📋 Objetivo
Registrar cada cambio de movimiento con usuario, acción, timestamp, valores antes/después.

## 🌱 Impacto Regenerativo
**IMPORTANTE** - Trazabilidad: si algo falla, saber quién hizo qué y cuándo.

## 👤 User Story
```
Como: Auditor/Admin
Quiero: Ver quién creó/cerró cada movimiento
Para: Rastrear cambios y detectar errores o fraudes
```

## ✅ Criterios de Aceptación
- [ ] Crear tabla `AuditLog` en Prisma:
  ```prisma
  model AuditLog {
    id        String    @id @default(cuid())
    entityType String   // "Movement"
    entityId  String    // movement.id
    action    String    // "CREATE", "CLOSE", "UPDATE"
    userId    String    // Usuario que hizo cambio
    changes   Json      // {before: {...}, after: {...}}
    createdAt DateTime  @default(now())
    
    @@index([entityType, entityId])
    @@index([userId])
  }
  ```
- [ ] Migración: Crear tabla AuditLog
- [ ] En `MovementService`:
  - `create()` → Log: `{action: "CREATE", before: null, after: {herdId, paddockId, entryDate}}`
  - `closeMovement()` → Log: `{action: "CLOSE", before: {status: "ACTIVE"}, after: {status: "CLOSED", exitDate}}`
- [ ] Endpoint `GET /audits/movements/:movementId` → retorna historial de cambios
- [ ] UI: Link "Ver auditoría" en cada movimiento → popup con detalles

## 🛠 Alcance Técnico

### Data
- Nueva tabla: `AuditLog`
- Migración: `npx prisma migrate dev --name add_audit_log`

### Backend (NestJS)
- Servicio: `AuditLogService` con `log(entityType, entityId, action, userId, changes)`
- Inyectar en `MovementService`
- Endpoint: `GET /audits/movements/:movementId`

### Frontend (Next.js)
- Botón "📋 Auditoría" en cada movimiento
- Modal: Timeline de cambios con usuario y timestamp

## 🧪 Pruebas Obligatorias
- ✅ Unit: Serialización de cambios a JSON
- ✅ Integration: `POST /movements` → Crea AuditLog con action CREATE
- ✅ Integration: `PATCH /movements/:id/close` → Crea AuditLog con action CLOSE
- ✅ Integration: `GET /audits/movements/:id` retorna historial

## ✔️ Definición de Done (DoD)
- [ ] Tabla AuditLog creada y migrada
- [ ] Logs generados en cada acción (CREATE, CLOSE, UPDATE)
- [ ] Endpoint `/audits/movements/:id` operativo
- [ ] Tests: ✅ 100% de cobertura
- [ ] Documentación: Explicar estructura AuditLog

## 📌 Dependencias
Relacionado a: #3 (Épica Rotación y Descanso)
Prerequisitos: #3-1, #3-2 (movimientos funcionales)
Bloqueador para: Ninguno

## 🕐 Estimación
3 días (8-12 horas)
"""
    },
    {
        "number": 9,
        "title": "[P0][Épica#3-9] FORMULARIO: Selector inteligente de potrero destino",
        "labels": ["story", "P0", "frontend"],
        "assignee": None,
        "body": """## 📋 Objetivo
Mostrar solo potreros CON descanso suficiente (status = READY) al operador.

## 🌱 Impacto Regenerativo
**CRÍTICO** - Si se muestran todos los potreros, operador confundido elige uno en descanso → **violación**.

## 👤 User Story
```
Como: Técnico de campo
Quiero: Que el selector de potrero solo muestre opciones válidas
Para: Evitar errores por ocupación o descanso insuficiente
```

## ✅ Criterios de Aceptación
- [ ] Componente `<PaddockSelect farmId={...} onlyReady={true} />`
- [ ] Query: `paddocks WHERE farmId = :id AND (activeMovement IS NULL AND restDays >= minRestDays)`
- [ ] Mostrar en selector:
  - Nombre potrero
  - Hectáreas
  - Días de descanso completados (opcional: "30/30 días")
- [ ] Tooltip en paddock NO-READY:
  - Si OCCUPIED: "Ocupado por Lote X desde 5 días"
  - Si RESTING: "Descansando: 18/30 días (faltan 12)"
- [ ] Deshabilitar opción si no cumple criterio
- [ ] Sorting: READY first, luego por nombre

## 🛠 Alcance Técnico

### Backend (NestJS)
- Endpoint `GET /paddocks?farmId=:id&status=READY`
- Filtro en query: `status = READY`

### Frontend (Next.js)
- Componente: `<PaddockSelect />`
- Filter: `paddocks.filter(p => p.status === 'READY')`
- Render: Opciones con badges de estado

## 🧪 Pruebas Obligatorias
- ✅ Integration: `GET /paddocks?status=READY` retorna solo READY
- ✅ E2E: Abrir selector → Solo ver potreros verdes → Seleccionar → Ocupar

## ✔️ Definición de Done (DoD)
- [ ] Endpoint `/paddocks?status=READY` operativo
- [ ] Componente renderiza selector correctamente
- [ ] Tests: ✅ Filtro de status
- [ ] UX: Claro cuál se puede ocupar y cuál no

## 📌 Dependencias
Relacionado a: #3 (Épica Rotación y Descanso)
Prerequisitos: #3-6 (cálculo de status)
Bloqueador para: #3-1 (selector en formulario)

## 🕐 Estimación
1 día (2-4 horas)
"""
    },
    {
        "number": 10,
        "title": "[P0][Épica#3-10] TESTING: Suite E2E de flujo completo de rotación",
        "labels": ["story", "P0", "qa"],
        "assignee": None,
        "body": """## 📋 Objetivo
Tests automatizados (Playwright/Cypress) que verifiquen flujo end-to-end de rotación: entrada → ocupación → cierre → descanso → entrada siguiente.

## 🌱 Impacto Regenerativo
**IMPORTANTE** - Sin tests E2E, regresiones invisibles → rotación rota sin aviso.

## 👤 User Story
```
Como: QA/Desarrollador
Quiero: Tests automatizados que validen rotación completa
Para: Detectar regresiones automáticamente
```

## ✅ Criterios de Aceptación
- [ ] Test suite: `rotation.e2e.spec.ts`
- [ ] Escenarios:
  1. **Happy Path**: Crear movimiento → Esperar → Cerrar → Descanso progresa
  2. **Bloqueo por descanso**: Intenta ocupar potrero sin descanso → 409
  3. **Bloqueo por doble ocupación**: 2 lotes simultáneos → 409
  4. **Semáforo de potrero**: Estado visual actualiza (READY → OCCUPIED → RESTING → READY)
  5. **Timeline de historial**: Cierra 3 movimientos → timeline muestra todos

- [ ] Tests:
  - `test('Ocupar potrero válido')` → POST /movements → 201
  - `test('Bloquear ocupación sin descanso')` → POST /movements → 409
  - `test('Bloquear doble ocupación')` → POST #2 → 409
  - `test('Semáforo verde→rojo→amarillo→verde')` → Estado correcto
  - `test('Historial de 3 movimientos')` → GET /movements/history → 3 items

## 🛠 Alcance Técnico

### Testing
- Framework: Playwright o Cypress
- Setup: `vitest.config.ts` + playwright.config.ts
- Tests en: `/apps/api/tests/e2e/rotation.e2e.spec.ts`
- Fixtures: user, farm, herds, paddocks seeded
- Helpers: `createMovement()`, `closeMovement()`, `getPaddockStatus()`

### Frontend E2E
- Navegar a farm → paddocks → ocupar → validar UI → cerrar → validar historial

## 🧪 Pruebas Obligatorias
- ✅ Unit: Ya existen `movement.service.spec.ts`
- ✅ Integration: Tests de endpoints
- ✅ E2E: 5 escenarios críticos mínimo

## ✔️ Definición de Done (DoD)
- [ ] Suite E2E creada con 5+ tests
- [ ] Todos los tests pasen (CI)
- [ ] Cobertura: 100% de flujos críticos
- [ ] Documentación: Instrucciones para ejecutar tests

## 📌 Dependencias
Relacionado a: #3 (Épica Rotación y Descanso)
Prerequisitos: #3-1 a #3-9 (todas las historias)
Bloqueador para: Ninguno (ejecutar al final)

## 🕐 Estimación
3 días (8-12 horas)
"""
    }
]

# ============================================================================
# FUNCIONES AUXILIARES
# ============================================================================

def run_command(cmd: list) -> Optional[str]:
    """Ejecutar comando y retornar output o None si falla."""
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, check=False)
        if result.returncode == 0:
            return result.stdout
        else:
            print(f"❌ Error: {result.stderr}")
            return None
    except Exception as e:
        print(f"❌ Excepción: {e}")
        return None

def verify_gh_cli() -> bool:
    """Verificar que GitHub CLI está disponible y autenticado."""
    print("🔍 Verificando GitHub CLI...")
    
    # Verificar versión
    output = run_command(["gh", "--version"])
    if not output:
        print("❌ GitHub CLI no instalado")
        return False
    print(f"✅ {output.strip()}")
    
    # Verificar autenticación
    output = run_command(["gh", "auth", "status"])
    if not output:
        print("❌ No autenticado en GitHub")
        return False
    print("✅ Autenticado en GitHub")
    return True

def create_issue(title: str, body: str, labels: list) -> Optional[str]:
    """Crear issue en GitHub y retornar issue number."""
    cmd = [
        "gh", "issue", "create",
        "--title", title,
        "--body", body,
        "--repo", "CSA-DanielVillamizar/ganaderia-regenerativa"
    ]
    
    if labels:
        cmd.extend(["--label", ",".join(labels)])
    
    output = run_command(cmd)
    if output:
        # Extraer número de issue del output
        # Formato: https://github.com/user/repo/issues/15
        issue_url = output.strip()
        issue_number = issue_url.split("/")[-1]
        return issue_number
    return None

# ============================================================================
# MAIN
# ============================================================================

def main():
    """Script principal."""
    print("\n╔════════════════════════════════════════════╗")
    print("║   GITHUB ISSUE CREATOR - ÉPICA #3         ║")
    print("║   Historias P0 de Rotación y Descanso     ║")
    print("╚════════════════════════════════════════════╝\n")
    
    # 1. Verificar requisitos
    if not verify_gh_cli():
        print("\n❌ ABORTADO: GitHub CLI no disponible")
        return 1
    
    # 2. Crear issues
    print("\n🚀 Creando historias...")
    print("=" * 50)
    
    created = []
    failed = []
    
    for story in EPIC_3_STORIES:
        story_num = story["number"]
        story_title = story["title"]
        story_body = story["body"]
        story_labels = story["labels"]
        
        print(f"\n[{story_num}/10] {story_title[:60]}...")
        
        issue_num = create_issue(story_title, story_body, story_labels)
        if issue_num:
            print(f"✅ Creado: Issue #{issue_num}")
            created.append({
                "number": story_num,
                "title": story_title,
                "issue": issue_num
            })
        else:
            print(f"❌ Fallo al crear")
            failed.append({
                "number": story_num,
                "title": story_title
            })
    
    # 3. Resumen final
    print("\n" + "=" * 50)
    print("╔════════════════════════════════════════════╗")
    print("║           ✅ PROCESO COMPLETADO           ║")
    print("╚════════════════════════════════════════════╝\n")
    
    print(f"📊 Resultados:")
    print(f"  ✅ Creados: {len(created)}")
    print(f"  ❌ Fallidos: {len(failed)}")
    
    if created:
        print(f"\n✅ Issues creados:")
        for item in created:
            print(f"  [P0][Épica#3-{item['number']}] #{item['issue']}")
    
    if failed:
        print(f"\n❌ Issues no creados:")
        for item in failed:
            print(f"  [P0][Épica#3-{item['number']}] {item['title'][:50]}")
    
    print(f"\n🔗 Ver en GitHub:")
    print(f"  https://github.com/CSA-DanielVillamizar/ganaderia-regenerativa/issues\n")
    
    return 0 if len(failed) == 0 else 1

if __name__ == "__main__":
    sys.exit(main())
