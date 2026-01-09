# 📋 SPRINT 1 PLAN - Épica #3 "Rotación y Descanso"

**Duración:** 2 semanas (10 días hábiles)  
**Historias:** 7 P0  
**Horas estimadas:** 36h (3.6h/día promedio)  
**Estado:** 🟡 EN PLANIFICACIÓN → 🟢 INICIA

---

## 📅 CRONOGRAMA SEMANAL

### SEMANA 1 (5 días)
**Objetivo:** Fundamentos operativos (validaciones + BD + cálculos)

| Día | Historia | Estimación | Dev | QA | Notas |
|-----|----------|-----------|-----|-----|-------|
| 1 | #3-3: Validar un ACTIVE (409) | 1d | Backend | Unit | Integridad datos |
| 2-3 | #3-2: Cerrar + ocupación | 2d | BD + Backend | Unit + Int | Migración `lastExitDate` |
| 3-4 | #3-4: Bloquear descanso | 2d | Backend + Frontend | Int + E2E | Alerta visual roja |
| 4-5 | #3-6: Semáforo descanso | 2d | Backend + Frontend | Unit + Int | Colors: GREEN/RED/YELLOW |

**Total Semana 1:** ~18 horas

---

### SEMANA 2 (5 días)
**Objetivo:** UX + Trazabilidad (formas + historial)

| Día | Historia | Estimación | Dev | QA | Notas |
|-----|----------|-----------|-----|-----|-------|
| 1-2 | #3-1: Registrar entrada (UX) | 2d | Frontend + Backend | Int + E2E | Form + selector inteligente |
| 2-3 | #3-5: Estado actual del lote | 1d | Frontend | Unit | Progreso de ocupación |
| 3-5 | #3-7: Historial movimientos | 2d | Backend + Frontend | Int | Timeline 60 días |
| 5 | Buffer/Testing/Integration | 1d | QA | E2E | Flujo completo |

**Total Semana 2:** ~18 horas

---

## 🎯 HISTORIAS POR ORDEN DE IMPLEMENTACIÓN

### Semana 1

#### **1️⃣ #3-3 (1d) Validación: Un solo movimiento ACTIVE**
**Dueño:** Backend  
**Entrega esperada:** Fin Día 1

**Tareas:**
- [ ] Revisar `MovementService.validateNoActiveMovements()`
- [ ] Verificar que se llama en `create()`
- [ ] Agregar índice `@@index([herdId, status])` en Prisma
- [ ] Tests unitarios:
  - `test('Crear movimiento #1 → OK')` ✅
  - `test('Crear movimiento #2 → 409 Conflict')` ✅
- [ ] Commit: `feat(movement): enforce single active movement per herd`

**Definición de Listo:**
- [ ] Tests pasen en CI
- [ ] Mensajeerror 409 claro en response

---

#### **2️⃣ #3-2 (2d) Cerrar salida + Calcular ocupación**
**Dueño:** Backend + Frontend  
**Entrega esperada:** Fin Día 3

**Tareas Día 2:**
- [ ] DB Migración:
  ```bash
  npx prisma migrate dev --name add_paddock_lastExitDate
  ```
- [ ] Actualizar schema:
  ```prisma
  model Paddock {
    ...
    lastExitDate DateTime?
  }
  ```
- [ ] Backend: Actualizar `closeMovement()`:
  ```typescript
  // Al cerrar movimiento, actualizar paddock.lastExitDate = exitDate
  await prisma.paddock.update({
    where: { id: movement.paddockId },
    data: { lastExitDate: exitDate }
  });
  ```

**Tareas Día 3:**
- [ ] Tests:
  - `test('Cerrar movimiento → occupancyDays calculado')` ✅
  - `test('Cerrar con exitDate < entryDate → 400')` ✅
- [ ] Frontend:
  - Botón "Cerrar" en `<HerdDetailPage>`
  - Modal confirmación
  - Toast: "Lote ocupó 7 días"
- [ ] Commit: `feat(movement): calculate occupancy days on close`

**Definición de Listo:**
- [ ] BD migrada correctamente
- [ ] `occupancyDays` retornado en response
- [ ] UI funciona sin errores

---

#### **3️⃣ #3-4 (2d) Bloquear entrada por descanso insuficiente**
**Dueño:** Backend + Frontend  
**Entrega esperada:** Fin Día 4

**Tareas Día 3-4:**
- [ ] Backend: Mejorar `validateMinimumRestDays()`:
  ```typescript
  // Obtener paddock.minRestDays (o default 30)
  // Calcular restDays = NOW - paddock.lastExitDate
  // Si restDays < minRestDays → throw 409 con detalles
  ```
- [ ] Response 409:
  ```json
  {
    "statusCode": 409,
    "message": "Descanso insuficiente",
    "details": {
      "paddockName": "...",
      "restDaysRequired": 30,
      "restDaysActual": 18,
      "restDaysRemaining": 12,
      "availableDate": "2026-01-20"
    }
  }
  ```
- [ ] Tests:
  - `test('POST con descanso ≥ min → 201')` ✅
  - `test('POST con descanso < min → 409')` ✅
  - `test('Error response contiene detalles')` ✅
- [ ] Frontend:
  - Capturar error 409
  - Mostrar toast rojo: "❌ Descanso insuficiente"
  - Display: "Faltan 12 días (disponible 20/01)"
  - Deshabilitar botón "Ocupar"
- [ ] Commit: `feat(movement): block entry for insufficient rest`

**Definición de Listo:**
- [ ] Cálculo de descanso correcto
- [ ] 409 retornado siempre cuando aplique
- [ ] UI bloquea entrada visualmente

---

#### **4️⃣ #3-6 (2d) Descanso - Semáforo visual**
**Dueño:** Backend + Frontend  
**Entrega esperada:** Fin Día 5

**Tareas Día 4-5:**
- [ ] Backend: Endpoint nuevo `GET /paddocks/:id/status`:
  ```typescript
  async getPaddockStatus(id: string) {
    const paddock = await prisma.paddock.findUniqueOrThrow({...});
    
    // Verificar si hay movimiento ACTIVE
    const activeMovement = await prisma.movement.findFirst({
      where: { paddockId: id, status: "ACTIVE" }
    });
    
    if (activeMovement) {
      return {
        status: "OCCUPIED",
        color: "red",
        currentHerd: activeMovement.herd.name,
        occupancyDays: calcOccupancy(activeMovement.entryDate)
      };
    }
    
    // Calcular descanso
    const restDays = paddock.lastExitDate 
      ? Math.floor((NOW - paddock.lastExitDate) / 86400)
      : null;
    
    if (restDays && restDays >= paddock.minRestDays) {
      return { status: "READY", color: "green", restDays };
    } else {
      return { status: "RESTING", color: "yellow", restDays, minRestDays: paddock.minRestDays };
    }
  }
  ```
- [ ] Tests:
  - `test('Paddock OCCUPIED → RED + herd name')` ✅
  - `test('Paddock RESTING → YELLOW + progress')` ✅
  - `test('Paddock READY → GREEN + ✅')` ✅
- [ ] Frontend:
  - Actualizar `<PaddockMap>` para consumir `/paddocks/:id/status`
  - Renderizar badge con color dinámico
  - Tooltip:
    - RED: "Ocupado por Lote X desde 5 días"
    - YELLOW: "Descansando 18/30 días (faltan 12)"
    - GREEN: "✅ Listo para ocupar"
- [ ] Commit: `feat(paddock): add status endpoint with rest calculation`

**Definición de Listo:**
- [ ] Endpoint retorna color correcto
- [ ] Mapa visual actualiza con colores
- [ ] Tooltips informativos

---

### Semana 2

#### **5️⃣ #3-1 (2d) Registrar entrada + UX validación**
**Dueño:** Frontend + Backend  
**Entrega esperada:** Fin Día 2 (Semana 2)

**Tareas Día 1-2 (Semana 2):**
- [ ] Backend: Endpoint nuevo `GET /paddocks/:id/rest-days`:
  ```typescript
  async getRestDays(id: string) {
    const paddock = await prisma.paddock.findUniqueOrThrow({...});
    const lastExit = paddock.lastExitDate;
    const restDays = lastExit ? Math.floor((NOW - lastExit) / 86400) : 0;
    
    return {
      paddockId: id,
      restDays,
      minRestDays: paddock.minRestDays || 30,
      status: restDays >= (paddock.minRestDays || 30) ? "READY" : "RESTING"
    };
  }
  ```
- [ ] Frontend: Componente `<HerdMovementForm herdId={...} />`:
  - Form inputs:
    - Selector: `<PaddockSelect onlyReady={true} />`
    - Input date: `entryDate` (default: hoy)
    - TextArea: `notes` (opcional)
  - Validaciones:
    - Si potrero NO ready → Badge rojo, botón deshabilitado
    - Si descanso < min → Tooltip "Faltan X días"
  - Buttons: "Ocupar" (activo si válido), "Cancelar"
- [ ] Selector `<PaddockSelect farmId={...} onlyReady={true} />`:
  - Filtra: paddocks con `status === "READY"`
  - Render: paddock name + hectares + "{{ restDays }}/{{ minRestDays }} días"
  - Sorting: READY primero, luego por nombre
- [ ] Tests:
  - `test('GET /paddocks/:id/rest-days retorna status')` ✅
  - `test('Selector muestra solo READY paddocks')` ✅
  - `test('Form deshabilitado si no hay READY')` ✅
  - `test('POST con form válido → 201')` ✅
- [ ] E2E:
  - Abrir lote → Clic "Ocupar"
  - Selector muestra 2 potreros verdes
  - Seleccionar uno → POST /movements → OK
  - Potrero pasa a rojo (OCCUPIED)
- [ ] Commit: `feat(movement): implement herd movement form with smart selector`

**Definición de Listo:**
- [ ] Form funciona sin errores
- [ ] Selector solo muestra READY
- [ ] POST /movements ejecutado correctamente
- [ ] Tests E2E pasan

---

#### **6️⃣ #3-5 (1d) Estado actual del lote**
**Dueño:** Frontend  
**Entrega esperada:** Fin Día 3

**Tareas Día 3:**
- [ ] Backend: Mejorar `GET /herds/:id` para retornar:
  ```json
  {
    "herd": {...},
    "activeMovement": {
      "id": "mov-123",
      "paddockName": "Potrero Sur",
      "entryDate": "2026-01-03T08:30:00Z",
      "occupancyDays": 5,
      "occupancyPercent": 62,
      "minRestDaysAfter": 30,
      "estimatedExitDate": "2026-01-08T00:00:00Z"
    }
  }
  ```
- [ ] Frontend: Componente `<HerdStatusCard activeMovement={...} />`:
  ```tsx
  // Render si activeMovement:
  📍 ESTADO ACTUAL
  ├─ Potrero: Potrero Sur
  ├─ Entrada: 3 de enero, 08:30
  ├─ Ocupación: Día 5 de ~8 (62%) [Barra progreso]
  ├─ Salida estimada: ~8 de enero
  ├─ Descanso requerido después: 30 días
  └─ [Cerrar ocupación]
  
  // Render si NO activeMovement:
  ⚠️ Lote SIN UBICACIÓN ACTUAL
  [Ocupar potrero]
  ```
- [ ] Tests:
  - `test('GET /herds/:id retorna activeMovement si existe')` ✅
  - `test('occupancyDays calculado correctamente')` ✅
  - `test('Componente renderiza estado correcto')` ✅
- [ ] Commit: `feat(herd): add active movement status card`

**Definición de Listo:**
- [ ] Card visible en detalle de lote
- [ ] Cálculos actualizados en tiempo real
- [ ] Botones funcionales

---

#### **7️⃣ #3-7 (2d) Historial de movimientos (timeline)**
**Dueño:** Backend + Frontend  
**Entrega esperada:** Fin Día 5

**Tareas Día 4-5:**
- [ ] Backend: Endpoint `GET /herds/:id/movements/history?days=60`:
  ```typescript
  async getMovementHistory(herdId: string, days: number = 60) {
    const since = new Date();
    since.setDate(since.getDate() - days);
    
    return prisma.movement.findMany({
      where: {
        herdId,
        status: "CLOSED",
        exitDate: { gte: since }
      },
      include: { paddock: true },
      orderBy: { exitDate: "desc" }
    });
  }
  ```
- [ ] Frontend: Componente `<MovementHistory movements={...} />`:
  - Tabla con columnas:
    - Potrero (nombre + hectáreas)
    - Entrada (fecha + hora)
    - Salida (fecha + hora)
    - Días (ocupación)
    - Descanso siguiente (días + estado)
    - Estado (✅/⚠️)
  - Filtro: Últimos 30, 60, 90 días
  - Responsive: Cards en móvil, tabla en desktop
- [ ] Tests:
  - `test('GET /herds/:id/movements/history retorna solo CLOSED')` ✅
  - `test('Filtro days=60 excluye anteriores')` ✅
  - `test('Ordenamiento DESC by exitDate')` ✅
  - `test('Cálculos de ocupación y descanso correctos')` ✅
- [ ] Commit: `feat(movement): add movement history timeline`

**Definición de Listo:**
- [ ] Endpoint retorna datos correctos
- [ ] Tabla renderiza correctamente
- [ ] Filtros funcionan
- [ ] Responsive en todas pantallas

---

## 🧪 PLAN DE QA INTEGRADO

### Tests Unitarios (% cobertura)
```
apps/api/src/movement/movement.service.spec.ts:
  ✅ validateNoActiveMovements()      100%
  ✅ validateMinimumRestDays()        100%
  ✅ calculateOccupancyDays()         100%
  ✅ calculateRestDays()              100%
  ✅ closeMovement()                  90%
  
Total cobertura: 95%+ en Movement
```

### Tests Integración (Endpoints)
```
POST /movements
  ✅ 201 con movimiento válido
  ✅ 409 con doble ocupación
  ✅ 409 con descanso insuficiente
  ✅ Valida exitDate > entryDate

PATCH /movements/:id/close
  ✅ 200 con exitDate válida
  ✅ 400 con exitDate < entryDate
  ✅ Actualiza paddock.lastExitDate
  ✅ Retorna occupancyDays

GET /paddocks/:id/rest-days
  ✅ Retorna restDays, minRestDays, status

GET /paddocks/:id/status
  ✅ OCCUPIED + herd name
  ✅ READY + color green
  ✅ RESTING + progress

GET /herds/:id/movements/history
  ✅ Retorna movimientos CLOSED
  ✅ Filtro days funciona
  ✅ Ordenamiento correcto
```

### Tests E2E (5 escenarios críticos)
```
1. Happy Path
   - Crear movimiento #1 → 201
   - Esperar 2 días (timestamp simulado)
   - Cerrar → occupancyDays = 2
   - Estado potrero = RESTING
   - Ver en historial
   
2. Bloqueo Descanso
   - Intenta ocupar potrero sin descanso (10d < 30d)
   - → 409 con detalles
   - UI muestra tooltip "Faltan 20 días"
   - Botón deshabilitado
   
3. Bloqueo Doble Ocupación
   - Crear mov #1 en Lote A
   - Intenta crear mov #2 en Lote A
   - → 409 "Ya está ocupando..."
   
4. Semáforo
   - 3 potreros: OCCUPIED (rojo), RESTING (amarillo), READY (verde)
   - Mapa visual muestra colores correctos
   - Selector solo filtra verdes
   
5. Timeline Historial
   - 3 movimientos CLOSED
   - Historial muestra todos
   - Cálculos correctos
```

---

## 📋 CHECKLIST DE CIERRE (Definition of Done)

### 🔨 Código
- [ ] Compilación: `npm run build` pass en apps/api
- [ ] Compilación: `npm run build` pass en apps/web
- [ ] Tests: `npm run test` pass 100%
- [ ] Linting: `npm run lint` sin errores
- [ ] Cobertura: > 85% en nuevas funciones

### 📊 Base de Datos
- [ ] Migración ejecutada: `lastExitDate` agregado
- [ ] Índices creados: `(herdId, status)`
- [ ] No hay datos corruptos
- [ ] Rollback probado (revertible)

### 🎨 Frontend
- [ ] Componentes: `<HerdMovementForm>`, `<PaddockSelect>`, `<HerdStatusCard>`, `<MovementHistory>`
- [ ] Diseño responsive (móvil, tablet, desktop)
- [ ] Accesibilidad: labels, ARIA, contraste
- [ ] Sin console.errors

### 🔌 API
- [ ] 5 endpoints nuevos/mejorados funcionales
- [ ] Documentación Swagger actualizada
- [ ] Validaciones 100% funcionales

### 🧪 Testing
- [ ] Unit: 95%+ cobertura
- [ ] Integration: 7 endpoints testeados
- [ ] E2E: 5 escenarios críticos pass

### 📚 Documentación
- [ ] README.md actualizado en movement/
- [ ] Parámetro `minRestDays` explicado
- [ ] Flujo de rotación diagramado
- [ ] APIs documentadas en Swagger

### 🚀 Deployment
- [ ] Código mergeado a `main`
- [ ] CI pipeline pass
- [ ] No hay breaking changes
- [ ] Backward compatible

---

## 🎯 ROADMAP POST-SPRINT 1

### Sprint 2 (Semanas 3-4)
- [ ] #3-8: Auditoría (AuditLog)
- [ ] #3-9: Selector inteligente (mejorado)
- [ ] #3-10: Suite E2E completa

### Epic 4 (Semanas 5-6)
- [ ] Pesajes avanzados
- [ ] Cálculo de carga animal (UA/ha)

### Epic 5-6 (Semanas 7-8)
- [ ] Aforos y forraje
- [ ] Dashboard operativo

---

**Última actualización:** 8 de enero, 2026  
**Estado:** 🟡 PLANIFICADO  
**Próximo:** Iniciar Día 1 de Sprint 1 con Historia #3-3
