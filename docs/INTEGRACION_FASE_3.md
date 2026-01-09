# 🚀 Guía de Integración FASE 3

## ✅ Estado Actual

**Build Status:** ✓ Compilado exitosamente  
**Página:** `/dashboard/movements` creada y disponible  
**Componentes:** Todos listos para producción  

---

## 📍 Ubicación de la Nueva Página

```
apps/web/src/app/dashboard/movements/page.tsx
```

**URL de acceso:**
```
http://localhost:3000/dashboard/movements
```

---

## 🎯 Componentes Implementados

### 1. **FilteredMovementsView** (Principal)
- **Ubicación:** `apps/web/src/components/dashboard/FilteredMovementsView.tsx`
- **Responsabilidad:** Contenedor con gestión de filtros
- **Features:**
  - Panel de filtros colapsable
  - Controles: Añadir Filtros, Limpiar Filtros
  - Integración de CurrentFincaStatus y MovementHistoryTable
  - Instrucciones de uso

### 2. **CurrentFincaStatus** (Dashboard)
- **Ubicación:** `apps/web/src/components/dashboard/CurrentFincaStatus.tsx`
- **Responsabilidad:** Mostrar movimientos activos
- **Features:**
  - API: `GET /movements?status=ACTIVE`
  - Tarjetas con estado de cada lote
  - Badge "Recuperando" cuando aplica
  - Auto-refresh cada 5 minutos
  - Skeleton loaders durante carga
  - Manejo automático de errores

### 3. **MovementHistoryTable** (Historial)
- **Ubicación:** `apps/web/src/components/dashboard/MovementHistoryTable.tsx`
- **Responsabilidad:** Tabla paginada del historial
- **Features:**
  - API: `GET /movements?herdId=x&paddockId=y&page=1&limit=10`
  - Paginación (Anterior/Siguiente)
  - Selector de tamaño: 10, 20, 50
  - Filtros dinámicos por herdId/paddockId
  - Responsive (scroll horizontal en móvil)
  - Skeleton loaders durante carga

### 4. **SkeletonLoader & CardSkeleton** (Loaders)
- **Ubicación:** `apps/web/src/components/common/SkeletonLoader.tsx`
- **Responsabilidad:** Placeholders de carga animados
- **Features:**
  - Animación suave con `animate-pulse`
  - Configurable: filas, columnas
  - CardSkeleton para tarjetas

---

## 🔗 Cómo Usar en Otras Páginas

### Opción 1: Usar el contenedor completo (Recomendado)

```typescript
// app/dashboard/movements/page.tsx
import { FilteredMovementsView } from '@web/components';

export default function MovementsPage() {
  return (
    <div className="max-w-7xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">Panel de Operaciones</h1>
      <FilteredMovementsView />
    </div>
  );
}
```

### Opción 2: Usar componentes individuales

```typescript
// app/dashboard/custom/page.tsx
import { 
  CurrentFincaStatus, 
  MovementHistoryTable 
} from '@web/components';

export default function CustomPage() {
  return (
    <div className="max-w-7xl mx-auto py-12 px-4">
      {/* Mostrar solo el estado actual */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Estado Actual</h2>
        <CurrentFincaStatus />
      </section>

      {/* O mostrar solo el historial con filtros específicos */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Historial</h2>
        <MovementHistoryTable 
          limit={20}
          herdId="specific-herd-id"  // Opcional: filtrar por lote
        />
      </section>
    </div>
  );
}
```

### Opción 3: Con lógica personalizada

```typescript
// Gestión de filtros personalizada
'use client';

import { useState } from 'react';
import { MovementHistoryTable } from '@web/components';

export default function CustomPage() {
  const [herdId, setHerdId] = useState('');

  return (
    <div className="max-w-7xl mx-auto py-12 px-4">
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Filtrar por Lote
        </label>
        <input
          type="text"
          value={herdId}
          onChange={(e) => setHerdId(e.target.value)}
          placeholder="ID del lote"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
        />
      </div>
      
      <MovementHistoryTable herdId={herdId || undefined} />
    </div>
  );
}
```

---

## 📊 Props de los Componentes

### **CurrentFincaStatus**

```typescript
interface CurrentFincaStatusProps {
  // Sin props requeridas
  // Toma todos los datos de: GET /movements?status=ACTIVE
}

// Uso:
<CurrentFincaStatus />
```

### **MovementHistoryTable**

```typescript
interface MovementHistoryTableProps {
  herdId?: string;       // Filtro opcional por lote
  paddockId?: string;    // Filtro opcional por potrero
  limit?: number;        // Tamaño de página (default: 10)
}

// Usos:
<MovementHistoryTable />
<MovementHistoryTable limit={20} />
<MovementHistoryTable herdId="herd-123" paddockId="paddock-456" />
```

### **FilteredMovementsView**

```typescript
interface FilteredMovementsViewProps {
  // Sin props requeridas
  // Gestiona su propio estado de filtros
}

// Uso:
<FilteredMovementsView />
```

### **SkeletonLoader & CardSkeleton**

```typescript
interface SkeletonLoaderProps {
  rows?: number;        // Para tablas (default: 3)
  columns?: number;     // Para tablas (default: 4)
  count?: number;       // Para listas (default: 3)
}

// Usos:
<SkeletonLoader />
<SkeletonLoader rows={5} columns={4} />
<SkeletonLoader count={3} />
<CardSkeleton />
```

---

## 🔄 Flujo de Datos y APIs

### GetMovements Flow

```
Frontend
  ↓
movementService.list({
  herdId?: string,
  paddockId?: string,
  page?: number,
  limit?: number
})
  ↓
GET /api/movements
  ↓
Backend (NestJS)
  ├─ Validar filtros
  ├─ Ejecutar query a BD
  ├─ Paginar resultados
  └─ Retornar PaginatedResponse<Movement>
  ↓
Frontend
  ├─ Actualizar state
  ├─ Renderizar tabla
  └─ Mostrar notificación si error
```

### Response Structure

```typescript
// Exitoso (200):
{
  "data": [
    {
      "id": "mov-123",
      "herd": {
        "id": "herd-1",
        "name": "LOTE A"
      },
      "paddock": {
        "id": "paddock-1",
        "name": "Potrero Norte",
        "minRestDays": 60
      },
      "entryDate": "2026-01-12T10:30:00Z",
      "exitDate": null,  // null si activo
      "status": "ACTIVE"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "pages": 5
  }
}

// Error (400, 409, 500):
{
  "statusCode": 500,
  "message": "Internal server error",
  "error": "...",
  "traceId": "abc-123-def"  // Capturado por frontend
}
```

---

## 🛡️ Manejo de Errores

### Automático en los Componentes

```typescript
try {
  const response = await movementService.list(filters);
  setMovements(response.data);
} catch (error: any) {
  const traceId = error?.response?.data?.traceId || 'unknown';
  const message = error?.response?.data?.message || 'Error desconocido';
  
  notificationService.error(message, 'Error', traceId);
  // → Notificación mostrada automáticamente en NotificationContainer
}
```

### Cómo Debuguear

1. **Nota el traceId** en la notificación:
   ```
   Error: Invalid herd ID
   TraceId: 550e8400-e29b-41d4-a716-446655440000
   ```

2. **Backend logs** (búsqueda):
   ```bash
   grep "550e8400-e29b-41d4-a716-446655440000" logs/error.log
   ```

3. **Verifica la solicitud original:**
   ```
   Request: GET /api/movements?herdId=invalid&page=1&limit=10
   Error: Herd not found
   Status: 404
   ```

---

## 🎨 Estilos y Customización

### Colores Principales (Tailwind)

```
Estado Activo:      bg-green-600, text-white
Estado Completado:  bg-gray-600, text-white
Recuperando:        bg-blue-600, text-white
Fondo:              bg-gray-50
Bordes:             border-gray-200
Texto:              text-gray-900
```

### Cómo Cambiar Estilos

1. Editar directamente en los componentes (líneas con `className`)
2. O crear archivo de configuración:

```typescript
// lib/theme.ts
export const colors = {
  active: 'bg-green-600',
  completed: 'bg-gray-600',
  // ...
};

// Luego en componentes:
<div className={colors.active}>Activo</div>
```

---

## 📱 Responsividad

### Breakpoints Usados

```
Móvil:    < 768px   (default)
Tablet:   ≥ 768px   (md:)
Desktop:  ≥ 1024px  (lg:)
```

### Ejemplos de Responsive Classes

```typescript
// Grid ajusta automáticamente
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"

// Tabla scrollable en móvil
className="overflow-x-auto md:overflow-visible"

// Flex ajusta automáticamente
className="flex flex-col md:flex-row"
```

### Testing Responsiveness

1. **Chrome DevTools:**
   - F12 → Toggle Device Toolbar (Ctrl+Shift+M)
   - Ajustar viewport
   - Ver cómo responden los componentes

2. **Dispositivos reales:**
   - `npm run dev` en terminal
   - Visitar `http://192.168.x.x:3000` desde móvil
   - Probar cada pantalla

---

## 🧪 Testing (Recomendado)

### Casos de Prueba Manuales

```
✓ Sin movimientos activos
  → Debe mostrar mensaje "No hay movimientos activos"
  
✓ Con múltiples movimientos
  → Mostrar 3-6 tarjetas (según datos)
  
✓ Paginación
  → Anterior/Siguiente funcionan
  → Contador de página correcto
  
✓ Filtro por herdId
  → Tabla se actualiza
  → Muestra solo ese lote
  
✓ Filtro por paddockId
  → Tabla se actualiza
  → Muestra solo ese potrero
  
✓ Cambio de tamaño de página
  → 10 → 20 → 50 funcionan
  → Datos se refrescan
  
✓ Error en API
  → Notificación muestra error
  → Incluye traceId
  
✓ Móvil (< 768px)
  → Tablas scrollean horizontalmente
  → Filtros apilados
  → Cards en 1 columna
  
✓ Tablet (768px-1024px)
  → Cards en 2 columnas
  → Tabla completa visible
  
✓ Desktop (> 1024px)
  → Cards en 3 columnas
  → Tabla con scroll si necesita
```

---

## 🔄 Auto-Refresh

### Cómo Funciona

```typescript
useEffect(() => {
  const interval = setInterval(() => {
    // Recargar datos cada 5 minutos
    loadActiveMovements();
  }, 5 * 60 * 1000); // 300,000ms

  return () => clearInterval(interval); // Limpiar
}, []);
```

### Cambiar Intervalo

En `CurrentFincaStatus.tsx`, cambiar:
```typescript
5 * 60 * 1000  // 5 minutos (actual)
1 * 60 * 1000  // 1 minuto
10 * 60 * 1000 // 10 minutos
```

---

## 📚 Archivos Clave

| Archivo | Descripción |
|---------|------------|
| `apps/web/src/app/dashboard/movements/page.tsx` | Página principal |
| `apps/web/src/components/dashboard/FilteredMovementsView.tsx` | Contenedor principal |
| `apps/web/src/components/dashboard/CurrentFincaStatus.tsx` | Dashboard |
| `apps/web/src/components/dashboard/MovementHistoryTable.tsx` | Tabla paginada |
| `apps/web/src/components/common/SkeletonLoader.tsx` | Loaders |
| `apps/web/src/components/index.ts` | Exportaciones |
| `apps/web/src/services/api.service.ts` | movementService |
| `docs/FASE_3_DASHBOARD.md` | Documentación técnica |

---

## 🚀 Próximos Pasos Recomendados

### Corto Plazo (Esta semana)
1. ✅ Verificar compilación → **Hecho**
2. ✅ Integración en página → **Hecho**
3. [ ] Probar con API real
4. [ ] Testing manual en móvil/tablet

### Mediano Plazo (Este mes)
1. [ ] Tests unitarios para componentes
2. [ ] Optimizaciones de performance
3. [ ] Feedback de UX/usuarios
4. [ ] Mejoras según feedback

### Largo Plazo (Próximo mes)
1. [ ] FASE 4: Mejoras avanzadas
2. [ ] WebSocket para auto-refresh en tiempo real
3. [ ] Export/Download de datos
4. [ ] Reportes avanzados

---

## ✨ Resumen del Estado

```
┌─────────────────────────────────────────────────────┐
│ FASE 3: Visualización y Operación                  │
├─────────────────────────────────────────────────────┤
│ Componentes       │ ✅ Creados y tipados           │
│ Integración       │ ✅ En page.tsx nuevo            │
│ Build             │ ✅ Compilado exitosamente      │
│ Testing           │ ⏳ Pendiente (manual)          │
│ Documentación     │ ✅ Completa                    │
│ Errores           │ ✅ Ninguno                     │
└─────────────────────────────────────────────────────┘
```

---

## 📞 Soporte

**Error al compilar:**
1. Verificar sintaxis TypeScript
2. `npm install` en apps/web
3. `npm run build` para más detalles

**Error en la página:**
1. Abrir DevTools (F12)
2. Ir a Console
3. Buscar errores rojos
4. Buscar traceId en notificaciones

**API no responde:**
1. Verificar que el backend está corriendo
2. Verificar que `/api/movements` existe
3. Buscar logs del backend con traceId

---

**¡FASE 3 completada!** 🎉

