# 🟢 Guía Offline-First: Implementación Completada

**Fecha:** 12 de enero de 2026  
**Versión:** 1.0  
**Estado:** ✅ **Implementación Completada**

---

## 📋 Resumen de Implementación

Se ha completado la **Capa 1 (Offline-First)** del proyecto con las siguientes características:

### ✅ Completado

1. **Base de Datos Local (RxDB + IndexedDB)**
   - Almacenamiento en el navegador usando RxDB con backend Dexie
   - Colecciones para: aforos (`forageSamples`), movimientos (`movements`), pesajes (`weighings`), y cola de sync (`syncQueue`)
   - Schema JSON tipado en TypeScript

2. **Motor de Sincronización Bidireccional**
   - Cola de operaciones (`syncQueue`) que registra CREATE/UPDATE/DELETE
   - Sincronización automática al detectar conexión
   - Reintentos con backoff exponencial (máx 3 intentos)
   - Manejo de errores y fallidos

3. **Servicios Offline-First**
   - `forage.service.ts` refactorizado para leer/escribir localmente primero
   - Respuesta optimista al usuario (inmediata en UI)
   - Combinación inteligente de datos locales + remotos

4. **UI Indicador de Estado**
   - Componente `OfflineIndicator` en la navegación
   - Muestra: estado online/offline + conteo de pendientes + estado de sincronización
   - Integrado en Sidebar y BottomNav

5. **Hook de Sincronización**
   - `useOfflineSync()` para React components
   - Detecta cambios de red y actualiza contador de pendientes
   - Dispara sincronización automática al reconectarse

---

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────┐
│           React Components (UI)                  │
│  (Forms, Dashboard, etc.)                        │
└──────────────────┬──────────────────────────────┘
                   │ useOfflineSync()
                   │ OfflineIndicator
                   ▼
┌─────────────────────────────────────────────────┐
│           Services Layer                         │
│  (forage.service, movement.service, etc.)       │
│  - Guardan en local PRIMERO                      │
│  - Encolan operaciones                           │
│  - Respuesta optimista al usuario                │
└──────────────────┬──────────────────────────────┘
                   │ enqueueSyncOperation()
                   │ getDb()
                   ▼
┌─────────────────────────────────────────────────┐
│        Offline Infrastructure Layer              │
│                                                  │
│  ┌─────────────────────────────────────────┐   │
│  │  sync-replicator.ts                      │   │
│  │  - enqueueSyncOperation()                │   │
│  │  - processSyncQueue()                    │   │
│  │  - retryFailedItem()                     │   │
│  │  - Event listeners (online/offline)      │   │
│  └─────────────────────────────────────────┘   │
│                   │                              │
│  ┌────────────────▼─────────────────────────┐   │
│  │  db.ts (RxDB Singleton)                  │   │
│  │  - getDb() → GanaderiaDB                 │   │
│  │  - Colecciones tipadas                   │   │
│  └─────────────────────────────────────────┘   │
│                   │                              │
│  ┌────────────────▼─────────────────────────┐   │
│  │  schemas.ts (JSON Schemas)               │   │
│  │  - forageSchema                          │   │
│  │  - movementSchema                        │   │
│  │  - weighingSchema                        │   │
│  │  - syncQueueSchema                       │   │
│  └─────────────────────────────────────────┘   │
└──────────────────┬──────────────────────────────┘
                   │ fetch/apiClient
                   ▼
┌─────────────────────────────────────────────────┐
│   Browser Storage Layer                          │
│  IndexedDB (via Dexie)                           │
│  ✅ Persiste offline                            │
│  ✅ Sincroniza cuando hay red                   │
└─────────────────────────────────────────────────┘
```

---

## 📂 Archivos Nuevos Creados

### 1. **apps/web/src/lib/offline/schemas.ts**
Define esquemas RxDB JSON para las colecciones:
- `forageSchema` - Muestras de aforo
- `movementSchema` - Movimientos de lotes
- `weighingSchema` - Pesajes
- `syncQueueSchema` - Cola de sincronización

### 2. **apps/web/src/lib/offline/db.ts**
Inicializa RxDB singleton:
- `getDb()` - Obtiene instancia de BD (lazy init)
- `closeDb()` - Cierra conexión (testing)
- `resetDb()` - Limpia BD (desarrollo)

### 3. **apps/web/src/lib/offline/sync-replicator.ts**
Motor de sincronización:
- `enqueueSyncOperation()` - Encola operación
- `processSyncQueue()` - Procesa cola automáticamente
- `retryFailedItem()` - Reintenta fallidos
- `initNetworkSync()` - Listeners de red
- `subscribeSyncQueue()` - Notificaciones de cambios

### 4. **apps/web/src/hooks/useOfflineSync.ts**
Hook React para sincronización:
```typescript
const { isOnline, pendingCount, isSyncing } = useOfflineSync();
```

### 5. **apps/web/src/components/layout/OfflineIndicator.tsx**
Componente visual para navegación:
- Muestra estado online/offline
- Contador de pendientes
- Indicador de sincronización

### 6. **Refactorización: apps/web/src/services/forage.service.ts**
Servicios offline-first:
- `createForage()` - Guarda local, sincroniza background
- `getByPaddock()` - Combina local + remoto
- `getRecentByFarm()` - Merge inteligente

---

## 🚀 Cómo Usar

### Para Usuarios (en el Campo)

1. **Guardar un Aforo**
   ```
   ✅ Click en "Nuevo Aforo"
   ✅ Llena formulario
   ✅ Click "Guardar"
   ✅ ¡LISTO! El dato se guardó LOCALMENTE (sin esperar internet)
   💬 Verás: "Guardado offline"
   ```

2. **Ver Estado de Sincronización**
   ```
   👁️ Mira la barra superior derecha
   🟢 Online → Cloud verde (conectado)
   🔴 Offline → Cloud gris (sin conexión)
   📊 "3" → 3 cambios pendientes de sincronizar
   ⟳ Sync... → Sincronizando en el fondo
   ```

3. **Reconectar Automáticamente**
   ```
   📡 Cuando recuperes señal WiFi/4G
   ⚙️ La app AUTOMÁTICAMENTE sincroniza
   ✅ Los datos se envían al servidor
   ```

### Para Desarrolladores

#### **Crear un Servicio Offline-First**

```typescript
// apps/web/src/services/movement.service.ts

import { getDb } from '@/lib/offline/db';
import { enqueueSyncOperation } from '@/lib/offline/sync-replicator';

export async function createMovement(
  request: CreateMovementRequest
): Promise<MovementResponse> {
  // 1. Calcular derivados
  const localId = `movement_${Date.now()}`;
  const now = new Date().toISOString();

  // 2. Guardar en BD local
  const db = await getDb();
  const movementDoc: MovementDoc = {
    localId,
    herdId: request.herdId,
    paddockId: request.paddockId,
    // ... otros campos
    syncStatus: 'pending',
    createdAt: now,
    updatedAt: now,
  };

  await db.movements.insert(movementDoc);

  // 3. Encolar para sincronización
  await enqueueSyncOperation({
    entity: 'movement',
    operation: 'CREATE',
    localId,
    payload: {
      herdId: request.herdId,
      paddockId: request.paddockId,
      // ... payload para el servidor
    },
  });

  // 4. Devolver respuesta optimista (UI rápida)
  return {
    id: localId,
    status: 'ACTIVE',
    syncStatus: 'pending',
    // ... resto de campos
  };
}
```

#### **Usar el Hook en un Componente**

```typescript
import { useOfflineSync } from '@/hooks/useOfflineSync';

export function MyComponent() {
  const { isOnline, pendingCount, isSyncing } = useOfflineSync();

  return (
    <div>
      {!isOnline && <p>⚠️ Estás en modo offline</p>}
      {pendingCount > 0 && (
        <p>📤 {pendingCount} cambios pendientes</p>
      )}
      {isSyncing && <p>⟳ Sincronizando...</p>}
    </div>
  );
}
```

#### **Leer Datos Locales + Remotos**

```typescript
// Combinar datos de ambas fuentes automáticamente
const forages = await getByPaddock(paddockId);
// Retorna: [...locales pendientes, ...remotos sincronizados]
```

---

## ⚙️ Configuración en layout-client.tsx

Para activar los listeners de red globalmente, agregar en `RootLayoutClient`:

```typescript
import { initNetworkSync } from '@/lib/offline/sync-replicator';

export function RootLayoutClient({ children }: ...) {
  useEffect(() => {
    initNetworkSync(); // Una sola vez al cargar
  }, []);

  return (
    // ... layout
  );
}
```

---

## 🔄 Ciclo de Vida de una Operación

```
1. Usuario crea aforo en el formulario
   ↓
2. createForage() es llamado
   ↓
3. ✅ Guardado en IndexedDB (INMEDIATO)
   ↓
4. 📝 Encolado en syncQueue (pendiente)
   ↓
5. 🎉 UI muestra el dato (respuesta optimista)
   ↓
6. [Usuario ve "Guardado offline"]
   ↓
7. Si hay red → Sincronización automática
   ├─ POST /forage-samples
   ├─ Servidor devuelve remoteId
   ├─ Actualizar local con remoteId
   └─ Marcar como 'synced'
   ↓
8. [Usuario ve indicador actualizado ✅]
```

---

## 🛡️ Manejo de Errores

### Caso 1: Error de Red (Temporal)
- ✅ Item queda en `syncQueue` con status `pending`
- ✅ Se reintenta automáticamente al reconectarse
- ✅ Usuario no pierde datos

### Caso 2: Error del Servidor (HTTP 400, 500)
- 📝 Se intenta hasta 3 veces (backoff exponencial)
- 🚨 Si falla 3 veces → status `failed`
- 👁️ Usuario puede ver items fallidos y reintentar manualmente

### Caso 3: Conflicto de Datos (Raro)
- Prioridad: Remoto > Local
- Se sobrescribe local con remoto
- Futuro: Implementar 3-way merge con CRDTs

---

## 📊 Base de Datos Local (IndexedDB)

Todos los datos se guardan en 4 colecciones:

| Colección | Campos Clave | Propósito |
|-----------|--------------|-----------|
| `forageSamples` | `localId`, `paddockId`, `status` | Muestras de pasto |
| `movements` | `localId`, `herdId`, `syncStatus` | Movimientos lotes |
| `weighings` | `localId`, `herdId`, `status` | Pesajes |
| `syncQueue` | `id`, `entity`, `status`, `attempts` | Cola de operaciones |

### Inspeccionar en DevTools

```javascript
// En la consola del navegador:
const db = await getDb();
const forages = await db.forageSamples.find().exec();
console.log(forages.map(f => f.toJSON()));
```

---

## 🧪 Testing Offline

### Test Manual en Chrome DevTools

1. **Network Tab → Throttling → Offline**
2. **Crear un aforo**
3. **Verificar que se guardó localmente**
4. **Network Tab → Cambiar a Online**
5. **Verificar que se sincronizó automáticamente**

### Simulación Programática

```typescript
// Desactivar red (solo para testing)
Object.defineProperty(navigator, 'onLine', {
  writable: true,
  value: false,
});
window.dispatchEvent(new Event('offline'));

// Reactivar red
Object.defineProperty(navigator, 'onLine', {
  writable: true,
  value: true,
});
window.dispatchEvent(new Event('online'));
```

---

## 🗑️ Limpieza y Maintenance

### Limpiar Items Sincronizados (Opcional)

```typescript
// Mantener últimos 100 items sincronizados
import { cleanupSyncedItems } from '@/lib/offline/sync-replicator';

await cleanupSyncedItems(100); // Por defecto
```

### Reset Completo (Solo Desarrollo)

```typescript
import { resetDb } from '@/lib/offline/db';

await resetDb(); // ⚠️ PELIGRO: Borra TODO
```

---

## 🚀 Próximos Pasos (Épica 12)

1. **Refactorizar `movement.service.ts`** (Movimientos)
   - Mismo patrón que `forage.service.ts`
   - Agregar validación de aforo vs carga animal

2. **Refactorizar `weighing.service.ts`** (Pesajes)
   - Guardar local, sincronizar background
   - Calcular UA en tiempo real

3. **Mecanismo de Conflictos**
   - ¿Qué pasa si se edita el mismo aforo en 2 tabs?
   - Implementar last-write-wins o CRDT

4. **Copia de Seguridad (Backup)**
   - Exportar BD a JSON
   - Importar desde JSON
   - Sincronización con Google Drive / Dropbox (futuro)

---

## 📞 Soporte y Debugging

### Ver Estado de la Cola

```typescript
import { getSyncStatus } from '@/lib/offline/sync-replicator';

const status = await getSyncStatus();
console.log(status); // { pending: 2, synced: 5, failed: 0 }
```

### Ver Items Fallidos

```typescript
import { getFailedItems } from '@/lib/offline/sync-replicator';

const failed = await getFailedItems();
failed.forEach(item => {
  console.log(`❌ ${item.entity}: ${item.lastError}`);
});
```

### Reintentar Fallido

```typescript
import { retryFailedItem } from '@/lib/offline/sync-replicator';

await retryFailedItem('sync_1234567890_abc');
```

---

## ✅ Checklist de Validación

- [x] RxDB inicializa correctamente en cliente
- [x] Forage se guarda en IndexedDB antes de enviar
- [x] Sync queue encola operaciones
- [x] Procesamiento automático al reconectarse
- [x] Indicador visual en navegación
- [x] Hook useOfflineSync funciona en componentes
- [x] Manejo de reintentos (3 máximo)
- [x] Manejo de errores y fallidos
- [x] Combinación inteligente local + remoto
- [x] Datos persisten entre refreshes

---

## 🔐 Consideraciones de Seguridad

⚠️ **Importante:**
- Los datos se almacenan en IndexedDB (no cifrado por defecto)
- No guardes tokens/passwords en la BD local
- Para datos sensibles, implementar cifrado de punto a punto
- El localStorage ya se usa para tokens (actual)

---

**Creado por:** Build Engineer Agent  
**Timestamp:** 2026-01-12  
**Versión:** 1.0  
**Status:** ✅ Ready for Production
