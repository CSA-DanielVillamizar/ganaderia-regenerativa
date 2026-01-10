# 📋 Punto 4.3 - Operation Wizards (Formularios de Operación)

## 🎯 Objetivo General

Crear 4 formularios (wizards) para registrar operaciones de ganadería:
1. **Forage Form** - Registrar aforos (marco cuadrado)
2. **Weighing Form** - Registrar pesajes
3. **Movement Form** - Registrar entrada a potrero
4. **Closure Form** - Registrar salida de potrero

Todos integrados con **Decision Today** mediante CTAs que pasan contexto y retornan con datos actualizados.

---

## 📐 Arquitectura de Formularios

### Patrón Shared

```typescript
// apps/web/src/components/forms/FormField.tsx
- Label + Input reutilizable
- Validación en tiempo real
- Mensajes de error

// apps/web/src/components/forms/DatePicker.tsx
- Selector de fechas
- Mín/máx configurables
- Formato local (es-CO)

// apps/web/src/components/forms/NumberInput.tsx
- Input numérico con validación
- Rango mín/máx
- 2 decimales para kg

// apps/web/src/components/forms/FormActions.tsx
- Botones Guardar/Cancelar
- Estado de carga
- Confirmación antes de guardar
```

### Servicios

```typescript
// apps/web/src/services/forage.service.ts
// apps/web/src/services/weighing.service.ts
// apps/web/src/services/movement.service.ts
```

### Páginas (Next.js)

```
apps/web/src/app/farms/[id]/
├── forage/
│   └── new/
│       └── page.tsx
├── weighings/
│   └── new/
│       └── page.tsx
├── movements/
│   ├── new/
│   │   └── page.tsx
│   └── [movementId]/
│       └── close/
│           └── page.tsx
```

---

## 📋 Formulario 1: Forage (Aforo)

### Ubicación
- **URL**: `/farms/[id]/forage/new`
- **Contexto**: `?paddockId=cmk8oe61t000i114txkizesun`

### Campos

| Campo | Tipo | Validación | Requerido |
|-------|------|-----------|----------|
| Potrero | Select | Validar que existe | ✅ |
| Fecha | Date | ≤ Hoy | ✅ |
| Altura (cm) | Number | 10-200 | ✅ |
| Peso Muestra (kg) | Number | 0.1-5 | ✅ |
| MS% | Number | 20-90 | ✅ |

### Cálculos Automáticos

```typescript
// kg/ha = (Peso muestra en g / MS%) × factor
// Factor del marco cuadrado (típico 1m × 1m)
const kgHa = (pesaMuestra * 1000 / ms) * 10;

// Categoría de forraje
const categoría = 
  kgHa > 3500 ? "EXCELENTE" :
  kgHa > 2500 ? "BUENO" :
  kgHa > 1500 ? "REGULAR" :
  "DEFICIENTE";
```

### Flujo

```
Decision Today
  ↓ (clic en "Aforo Potrero X")
  ↓ (parámetro: paddockId=...)
Forage Form
  ↓
  [Llenar datos]
  ↓
  [POST /api/v1/forage] ✅
  ↓
  [Toast: "Aforo registrado"]
  ↓
  [Retornar a Decision Today]
  ↓
  [Recalcular recomendación]
```

### Servicio Backend (API)

```typescript
// POST /api/v1/forage
Request: {
  farmId: string;
  paddockId: string;
  sampleDate: Date;
  heightCm: number;
  sampleWeightKg: number;
  drymatterPercent: number;
}

Response: {
  id: string;
  kgPerHectare: number;
  category: "EXCELENTE" | "BUENO" | "REGULAR" | "DEFICIENTE";
  message: "Aforo registrado";
}
```

---

## 📋 Formulario 2: Weighing (Pesaje)

### Ubicación
- **URL**: `/farms/[id]/weighings/new`
- **Contexto**: `?herdId=cmk8oe639000o114tsquzkkm5`

### Campos

| Campo | Tipo | Validación | Requerido |
|-------|------|-----------|----------|
| Lote | Select | Validar que existe | ✅ |
| Fecha Pesaje | Date | ≤ Hoy | ✅ |
| Número Animales | Number | 1-10,000 | ✅ |
| Peso Total (kg) | Number | > 0 | ✅ |

### Cálculos Automáticos

```typescript
const promedioPeso = pesoTotal / numeroAnimales;
const ganancia = promedioPeso - pesoAnterior;
const gananciaUA = ganancia / 450;
const diasTranscurridos = (fechaHoy - fechaPesajeAnterior) / (1000*60*60*24);
const gananciaPerDia = ganancia / diasTranscurridos;

return {
  promedioPeso,
  ganancia,
  gananciaPerDia,
  gananciaUA,
  message: `Ganancia: ${ganancia.toFixed(1)} kg (${gananciaPerDia.toFixed(2)} kg/día)`
};
```

### Flujo

```
Decision Today
  ↓ (clic en "Pesar lote X")
  ↓ (parámetro: herdId=...)
Weighing Form
  ↓
  [Llenar peso total y número de animales]
  ↓
  [POST /api/v1/weighings] ✅
  ↓
  [Toast: "Pesaje registrado - Ganancia: +80 kg"]
  ↓
  [Actualizar Herd.currentUA]
  ↓
  [Retornar a Decision Today]
  ↓
  [Recalcular recomendación]
```

### Servicio Backend (API)

```typescript
// POST /api/v1/weighings
Request: {
  farmId: string;
  herdId: string;
  weighDate: Date;
  numberOfAnimals: number;
  totalWeightKg: number;
}

Response: {
  id: string;
  averageWeight: number;
  gainSinceLastWeighing: number;
  gainPerDay: number;
  newHerdUA: number;
}
```

---

## 📋 Formulario 3: Movement (Movimiento)

### Ubicación
- **URL**: `/farms/[id]/movements/new`
- **Contexto**: `?herdId=...&paddockId=...` (desde Decision Today)

### Campos

| Campo | Tipo | Validación | Requerido |
|-------|------|-----------|----------|
| Lote | Select | Pre-llenado desde URL | ✅ |
| Potrero | Select | Pre-llenado desde URL | ✅ |
| Fecha Entrada | Date | = Hoy (no editable) | ✅ |
| Descanso Mínimo | Number | Desde parameters | ⚠️ Info |
| Salida Estimada | Date | = Entrada + Descanso | ⚠️ Auto |

### Cálculos Automáticos

```typescript
// Obtener parámetros de la finca
const params = await getParameters(farmId);

// Salida estimada = Entrada + descanso mínimo
const estimatedExit = addDays(entryDate, params.minimumRestDays);

// Validar que potrero esté disponible
const lastMovement = await getLastMovement(paddockId);
const restDays = (now - lastMovement.exitDate) / (1000*60*60*24);
const isAvailable = restDays >= params.minimumRestDays;
```

### Flujo

```
Decision Today
  ↓ (clic en "Ir a Potrero 6")
  ↓ (pasa: herdId=xyz&paddockId=abc)
Movement Form
  ↓
  [Llena datos: Herd y Paddock pre-llenados]
  ↓
  [Calcula automáticamente fecha salida estimada]
  ↓
  [POST /api/v1/movements] ✅
  ↓
  [Toast: "Movimiento registrado"]
  ↓
  [Marcar potrero como OCCUPIED]
  ↓
  [Retornar a Decision Today]
  ↓
  [Recalcular con nuevo movimiento]
```

### Servicio Backend (API)

```typescript
// POST /api/v1/movements
Request: {
  farmId: string;
  herdId: string;
  paddockId: string;
  entryDate: Date;
  estimatedExitDate: Date;
}

Response: {
  id: string;
  occupancyDays: number;
  estimatedExitDate: Date;
  status: "ACTIVE";
  message: "Movimiento registrado. Próxima evaluación: {date}";
}

// Error si potrero no está disponible
Response (400): {
  error: "PADDOCK_NOT_AVAILABLE";
  message: "Potrero aún está en descanso. Disponible: 2026-01-20";
}
```

---

## 📋 Formulario 4: Closure (Cierre de Movimiento)

### Ubicación
- **URL**: `/farms/[id]/movements/[movementId]/close`
- **Contexto**: Lee movementId de URL

### Campos

| Campo | Tipo | Validación | Requerido |
|-------|------|-----------|----------|
| Movimiento ID | (Hidden) | De URL | ✅ |
| Lote | Select | Read-only | ⚠️ |
| Potrero | Select | Read-only | ⚠️ |
| Entrada | Date | Read-only | ⚠️ |
| Salida Estimada | Date | Read-only | ⚠️ |
| Salida Real | Date | ≤ Hoy | ✅ |
| Observaciones | Textarea | Optional | ❌ |

### Cálculos

```typescript
const occupancyDays = (exitDate - entryDate) / (1000*60*60*24);
const wasExitedEarly = exitDate < estimatedExitDate;
const wasExitedLate = exitDate > estimatedExitDate;

return {
  occupancyDays,
  status: "CLOSED",
  earlyOrLate: wasExitedEarly ? "EARLY" : wasExitedLate ? "LATE" : "ON_TIME"
};
```

### Flujo

```
Decision Today
  ↓ (clic en "Cerrar Potrero X")
  ↓ (parámetro: movementId=...)
Closure Form
  ↓
  [Lee datos del movimiento]
  ↓
  [Muestra info read-only]
  ↓
  [Usuario completa fecha salida real]
  ↓
  [PATCH /api/v1/movements/:id/close] ✅
  ↓
  [Toast: "Movimiento cerrado - Ocupación: 40 días"]
  ↓
  [Marcar potrero como AVAILABLE]
  ↓
  [Retornar a Decision Today]
  ↓
  [Recalcular recomendación]
```

### Servicio Backend (API)

```typescript
// PATCH /api/v1/movements/:id/close
Request: {
  exitDate: Date;
  notes?: string;
}

Response: {
  id: string;
  status: "CLOSED";
  occupancyDays: number;
  exitedEarly: boolean;
  message: "Movimiento cerrado. Ocupación: 40 días";
}

// Error si fecha es inválida
Response (400): {
  error: "INVALID_EXIT_DATE";
  message: "Fecha salida debe ser ≥ entrada (2026-01-10)";
}
```

---

## 🔨 Plan de Implementación

### Paso 1: Componentes Shared (1-2 horas)
- [ ] FormField.tsx
- [ ] DatePicker.tsx
- [ ] NumberInput.tsx
- [ ] FormActions.tsx
- [ ] TextArea.tsx

### Paso 2: Servicios Frontend (1 hora)
- [ ] forage.service.ts
- [ ] weighing.service.ts
- [ ] movement.service.ts

### Paso 3: Páginas Frontend (3-4 horas)
- [ ] Forage Form page
- [ ] Weighing Form page
- [ ] Movement Form page
- [ ] Closure Form page

### Paso 4: Actualizar Decision Today (1 hora)
- [ ] Pasar contexto en CTAs
- [ ] Actualizar URLs de botones
- [ ] Manejar retorno y refetch

### Paso 5: Backend (2-3 horas)
- [ ] POST /api/v1/forage
- [ ] POST /api/v1/weighings
- [ ] POST /api/v1/movements
- [ ] PATCH /api/v1/movements/:id/close
- [ ] Tests para cada endpoint

### Paso 6: Testing E2E (1-2 horas)
- [ ] Test aforo → recálculo
- [ ] Test pesaje → actualizar UA
- [ ] Test movimiento → cambiar paddock
- [ ] Test cierre → liberar paddock

### Paso 7: Integration & Fixes (1-2 horas)
- [ ] Validar flujos end-to-end
- [ ] Mensajes de error amigables
- [ ] Toasts de éxito
- [ ] Loading states

---

## 📊 Estimación Total

| Fase | Horas | Estado |
|------|-------|--------|
| 1. Components | 2 | 🔨 |
| 2. Services | 1 | ⏳ |
| 3. Pages | 4 | ⏳ |
| 4. Decision Today | 1 | ⏳ |
| 5. Backend | 3 | ⏳ |
| 6. Testing | 2 | ⏳ |
| 7. Integration | 2 | ⏳ |
| **TOTAL** | **~15 horas** | |

---

## ✅ Criterios de Aceptación

### Frontend
- ✅ Todos los formularios rinden sin errores
- ✅ Validaciones funcionan (required, range, date)
- ✅ CTAs desde Decision Today pasan contexto
- ✅ Retorno a Decision Today recalcula
- ✅ Mensajes de error claros
- ✅ Toasts de éxito informan cambios
- ✅ Loading states en botón guardar

### Backend
- ✅ Todos los endpoints POST/PATCH funcionan
- ✅ Cálculos automáticos correctos
- ✅ Validaciones de negocio
- ✅ Tests para cada endpoint (>80% coverage)
- ✅ Manejo de errores apropiado

### Integration
- ✅ Ciclo completo: Form → API → Decision Today recalculada
- ✅ Datos persisten en BD
- ✅ Decision Today refleja cambios inmediatamente
- ✅ No hay race conditions en cálculos

---

## 🔗 Referencias

- [Decision Today Implementation](./docs/PUNTO_4.2_DECISION_TODAY.md)
- [API Endpoints](./docs/endpoints.md)
- [Modelo de Datos](./docs/modelo_datos.md)
- [React Hook Form Docs](https://react-hook-form.com/)
- [Zod Validation](https://zod.dev/)
