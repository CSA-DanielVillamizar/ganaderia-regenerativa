# 🎯 FASE 3: Visualización y Operación

## 📋 Descripción General

FASE 3 implementa el **dashboard operativo** para que los administradores de granjas puedan:

✅ Ver en tiempo real dónde está cada lote actualmente  
✅ Auditar el historial de movimientos con paginación  
✅ Filtrar datos por lote o potrero  
✅ Visualizar el estado de recuperación de potreros  
✅ Monitorear la salud de la rotación con UI responsiva  

---

## 🎨 Componentes Implementados

### 1. **SkeletonLoader** & **CardSkeleton**
**Archivo:** `apps/web/src/components/common/SkeletonLoader.tsx`

Propósito: Mostrar estados de carga elegantes mientras los datos vienen de la API

```typescript
// Para listas
<SkeletonLoader count={3} />

// Para tablas
<SkeletonLoader rows={5} columns={4} />

// Para tarjetas
<CardSkeleton />
```

**Features:**
- Animación de carga suave con `animate-pulse`
- Configurable por cantidad de items/filas/columnas
- Estilos Tailwind responsivos

---

### 2. **CurrentFincaStatus**
**Archivo:** `apps/web/src/components/dashboard/CurrentFincaStatus.tsx`

Propósito: Dashboard visual mostrando movimientos activos y estado de potreros

**Features:**
- Consume `GET /movements?status=ACTIVE`
- Muestra tarjetas (Cards) con información de cada lote
- Calcula días en potrero automáticamente
- Badge "Recuperándose" si potrero cumplió días de descanso
- Auto-refresh cada 5 minutos
- Skeleton loaders durante carga
- Manejo robusto de errores con notificationService

**Props:** Ninguno (toma todos los datos de la API)

**Ejemplo de Uso:**
```typescript
import { CurrentFincaStatus } from '@web/components';

export default function Dashboard() {
  return (
    <div>
      <CurrentFincaStatus />
    </div>
  );
}
```

**Output Visual:**
```
┌─────────────────────────────┐
│  LOTE A          Recuperando │
│  45 animales                │
│                             │
│  En Potrero                 │
│  Potrero Norte (10 ha)      │
│                             │
│  Días en Potrero: 28        │
│  Entrada: 12/01/2026        │
│                             │
│  ✅ Listo para salida       │
└─────────────────────────────┘
```

---

### 3. **MovementHistoryTable**
**Archivo:** `apps/web/src/components/dashboard/MovementHistoryTable.tsx`

Propósito: Tabla paginada del historial completo de movimientos

**Props:**
```typescript
interface MovementHistoryTableProps {
  herdId?: string;        // Filtrar por lote
  paddockId?: string;     // Filtrar por potrero
  limit?: number;         // Tamaño de página (default: 10)
}
```

**Features:**
- Paginación (Anterior/Siguiente)
- Selector de tamaño de página (10, 20, 50)
- Filtros dinámicos por herdId/paddockId
- Tabla responsiva (scroll horizontal en móvil)
- Muestra columnas:
  - **Lote:** Nombre e ID
  - **Potrero:** Nombre e ID
  - **Entrada:** Fecha formateada
  - **Salida:** Fecha o "-" si activo
  - **Estado:** Badge (Activo/Completado)
  - **Días:** Duración en potrero

**Ejemplo de Uso:**
```typescript
import { MovementHistoryTable } from '@web/components';

export default function History() {
  return (
    <MovementHistoryTable
      herdId="herd-123"  // Opcional
      limit={20}
    />
  );
}
```

**Output Visual:**
```
┌─ HISTORIAL DE MOVIMIENTOS ─────────────────────────────────────────┐
│ Por página: [10 ▼]                                                 │
├─────────────┬──────────────┬──────────┬──────────┬────────┬────────┤
│ Lote        │ Potrero      │ Entrada  │ Salida   │ Estado │ Días   │
├─────────────┼──────────────┼──────────┼──────────┼────────┼────────┤
│ LOTE A      │ Potrero N    │ 12/01/26 │ -        │ 🟢 Act │ 28d    │
│ LOTE B      │ Potrero S    │ 10/12/25 │ 05/01/26 │ ⚫ Comp│ 26d    │
│ ...         │ ...          │ ...      │ ...      │ ...    │ ...    │
├─────────────────────────────────────────────────────────────────────┤
│ Página 1 de 5      [ < 1 > ]                                        │
└─────────────────────────────────────────────────────────────────────┘
```

---

### 4. **FilteredMovementsView**
**Archivo:** `apps/web/src/components/dashboard/FilteredMovementsView.tsx`

Propósito: Vista completa que integra todos los componentes con filtros

**Features:**
- Header con controles de filtro desplegables
- Filtros por herdId y paddockId
- Botón "Limpiar filtros"
- Integración completa:
  - CurrentFincaStatus (estado actual)
  - MovementHistoryTable (historial)
- Instrucciones de uso
- Manejo de errores global
- Responsive design

**Ejemplo de Uso:**
```typescript
import { FilteredMovementsView } from '@web/components';

export default function Dashboard() {
  return <FilteredMovementsView />;
}
```

**Output Visual:**
```
┌────────────────────────────────────────────────────────┐
│ Panel de Operaciones      [+ Añadir Filtros]          │
├────────────────────────────────────────────────────────┤
│ Filtrar por Lote: [________________]                  │
│ Filtrar por Potrero: [________________]               │
│ [✕ Limpiar filtros]                                   │
└────────────────────────────────────────────────────────┘

[ESTADO ACTUAL - CurrentFincaStatus]

[HISTORIAL - MovementHistoryTable]

ℹ️ Instrucciones de uso...
```

---

## 🔄 Flujo de Datos

```
User visualiza Dashboard
    ↓
FilteredMovementsView carga
    ├─→ CurrentFincaStatus
    │   └─→ movementService.list({status: 'ACTIVE'})
    │       └─→ GET /api/movements?status=ACTIVE
    │           └─→ Renderizar tarjetas con CardSkeleton
    │
    └─→ MovementHistoryTable
        └─→ movementService.list({herdId?, paddockId?, page, limit})
            └─→ GET /api/movements?herdId=x&page=1&limit=10
                └─→ Renderizar tabla con SkeletonLoader
                └─→ Controles de paginación

Si hay ERROR:
    └─→ notificationService.error(message, title, traceId)
        └─→ NotificationContainer muestra alerta
```

---

## 🎨 Estilos y Responsividad

### Breakpoints Usados

```
Mobile (< 768px):     grid-cols-1
Tablet (768px+):      md:grid-cols-2, md:flex-row
Desktop (1024px+):    lg:grid-cols-3
```

### Clases Tailwind

- **Colores:** `bg-green-600`, `text-blue-800`, `border-gray-200`
- **Espaciado:** `p-6`, `gap-4`, `mb-4`
- **Transiciones:** `hover:shadow-lg`, `transition-colors`
- **Animaciones:** `animate-pulse` (skeleton), `hover:bg-gray-100`

### Mobile-First

✅ Tablas con scroll horizontal  
✅ Botones grandes tocables (min 44px)  
✅ Filtros apilados en columnas  
✅ Cards en grid de 1 columna  

---

## 📊 Integración con FASE 2

### APIs Consumidas

```typescript
// GET /movements?status=ACTIVE
// Usado por: CurrentFincaStatus
// Response: {data: Movement[], pagination: {...}}

// GET /movements?herdId=x&paddockId=y&page=1&limit=10
// Usado por: MovementHistoryTable
// Response: {data: Movement[], pagination: {...}}

// Error handling automático:
// 400, 409, 500 → notificationService.error()
// TraceId capturado desde header x-trace-id
```

### Hooks de FASE 2 (No usados directamente)

- `useMovementValidation`: Para validaciones en formularios (no en lectura)
- `notificationService`: Para mostrar errores y confirmaciones

---

## 🧪 Testing (Recomendado)

### Casos de Prueba

```typescript
// ✓ Cargar sin movimientos activos
// ✓ Cargar con múltiples movimientos
// ✓ Paginación anterior/siguiente
// ✓ Cambio de tamaño de página
// ✓ Filtro por herdId
// ✓ Filtro por paddockId
// ✓ Limpiar filtros
// ✓ Error en API → muestra notificación
// ✓ Auto-refresh cada 5 min
// ✓ Responsividad en móvil
```

---

## 🚀 Optimizaciones

### Performance

✅ Skeleton loaders evitan flashes de contenido  
✅ Paginación (no cargar todo de una vez)  
✅ Auto-refresh configurable (5 min)  
✅ Lazy loading de componentes  

### UX

✅ Estados de carga claros  
✅ Mensajes de error con traceId  
✅ Filtros intuitivos  
✅ Instrucciones en el panel  

### Accesibilidad

✅ Colores contrastados  
✅ Íconos + texto descriptivo  
✅ Botones tocables en móvil  
✅ Alt text para estados visuales  

---

## 📝 Ejemplo de Integración en Página

```typescript
// app/dashboard/page.tsx
import { FilteredMovementsView } from '@web/components';

export const metadata = {
  title: 'Panel de Operaciones',
  description: 'Monitoreo de movimientos y estado actual',
};

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <FilteredMovementsView />
      </div>
    </div>
  );
}
```

---

## 🔍 Debugging

### Errores Comunes

```
Error: "No hay movimientos activos"
→ Verificar que existan movimientos con status='ACTIVE'

Error: "Error al cargar estado actual"
→ Buscar el traceId en las notificaciones
→ Revisar logs del backend con ese traceId

Error: Tabla no muestra datos
→ Verificar que movementService.list() esté configurado
→ Revisar si los filtros son correctos

Tabla muy lenta
→ Reducir limit (10 en lugar de 50)
→ Agregar más filtros para reducir dataset
```

### Debug con TraceId

```
1. Nota el traceId en la notificación
2. Ve al backend y busca: grep "traceId" logs
3. Localiza la solicitud original
4. Revisa qué falló
5. Arregla en backend
6. El frontend capturará automáticamente el traceId
```

---

## 🎓 Conceptos Implementados

### 1. **Skeleton Loaders**
Mostrar placeholders animados en lugar de spinners

### 2. **Paginación Serverside**
El backend retorna página + límite, frontend controla UI

### 3. **Auto-Refresh**
`setInterval` para actualizar datos periódicamente

### 4. **Responsive Tables**
Scroll horizontal en móvil, normal en desktop

### 5. **Notificación Integrada**
Errores automáticamente mostrados con traceId

---

## 📚 Referencias

- Componentes: [apps/web/src/components/dashboard/](../../apps/web/src/components/dashboard/)
- Servicios: [apps/web/src/services/api.service.ts](../../apps/web/src/services/api.service.ts)
- Tipos: [packages/shared/src/index.ts](../../packages/shared/src/index.ts)

---

## ✨ Estado de FASE 3

| Componente | Status | Pruebas |
|-----------|--------|---------|
| SkeletonLoader | ✅ Hecho | Pendiente |
| CurrentFincaStatus | ✅ Hecho | Pendiente |
| MovementHistoryTable | ✅ Hecho | Pendiente |
| FilteredMovementsView | ✅ Hecho | Pendiente |
| Responsividad | ✅ Hecho | Pendiente |
| Error Handling | ✅ Hecho | Pendiente |

---

**Próximos Pasos:**
1. Integrar componentes en página real (app/dashboard/)
2. Agregar tests unitarios
3. Performance testing con datos reales
4. Feedback de UX/usuarios finales
5. FASE 4: Mejoras y optimizaciones

