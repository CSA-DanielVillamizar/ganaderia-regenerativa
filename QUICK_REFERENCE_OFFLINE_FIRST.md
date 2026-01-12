# ⚡ Quick Reference: Offline-First Architecture

**Propósito:** Cheatsheet para developers integrando offline-first  
**Audiencia:** Frontend developers  
**Tiempo de lectura:** 3 minutos  

---

## 🚀 TL;DR (Lo Esencial)

```typescript
// 1. GUARDAR localmente (NUNCA hacer HTTP primero)
const response = await forage.service.createForage({...});
// ✅ Ya está guardado localmente + encolado para sync

// 2. LEER (combina local + remoto si hay red)
const forages = await forage.service.getByPaddock(paddockId);

// 3. MOSTRAR ESTADO
const { isOnline, pendingCount, isSyncing } = useOfflineSync();
// ✅ Renderizar indicator automáticamente

// 4. MANEJADOR RECONEXIÓN (automático)
// → processSyncQueue() se ejecuta al reconnectar
// → No necesitas hacer nada más
```

---

## 📁 Archivos Clave (Dónde está qué)

| Función | Archivo |
|---------|---------|
| **Crear/Leer datos** | `apps/web/src/services/*.service.ts` |
| **DB singleton** | `apps/web/src/lib/offline/db.ts` |
| **Esquemas** | `apps/web/src/lib/offline/schemas.ts` |
| **Sincronización** | `apps/web/src/lib/offline/sync-replicator.ts` |
| **Hook estado** | `apps/web/src/hooks/useOfflineSync.ts` |
| **Indicador UI** | `apps/web/src/components/layout/OfflineIndicator.tsx` |

---

## 💾 Guardar Data (Create/Update)

### ✅ CORRECTO: Offline-First

```typescript
// apps/web/src/services/forage.service.ts

export async function createForage(request: CreateForageRequest) {
  const db = await getDb();
  const localId = generateLocalId();
  const now = new Date().toISOString();

  // 1️⃣ Guardar LOCALMENTE primero
  await db.forageSamples.insert({
    localId,
    farmId: request.farmId,
    paddockId: request.paddockId,
    sampleDate: request.sampleDate,
    height: request.height,
    weight: request.weight,
    syncStatus: 'pending', // 📍 IMPORTANTE
    createdAt: now,
    updatedAt: now,
  });

  // 2️⃣ Encolar para sincronización asíncrona
  await enqueueSyncOperation({
    entity: 'forage',       // Mapea a /forage-samples
    operation: 'CREATE',
    localId,
    payload: {
      farmId: request.farmId,
      paddockId: request.paddockId,
      sampleDate: request.sampleDate,
      height: request.height,
      weight: request.weight,
    },
  });

  // 3️⃣ Devolver respuesta OPTIMISTA inmediatamente
  return {
    id: localId,
    farmId: request.farmId,
    // ... otros campos
    syncStatus: 'pending', // 🔴 Mostrar esto en UI
  };
}
```

### ❌ INCORRECTO: Sync-First (viejo patrón)

```typescript
// ❌ NO HAGAS ESTO
async function createForage(request: CreateForageRequest) {
  // ❌ Esperar respuesta del servidor
  const response = await apiClient.post('/forage-samples', request);
  
  // ❌ LUEGO guardar localmente (usuarios offline ven "error")
  await db.forageSamples.insert(response);
  
  return response; // ❌ Latencia de red = percepción lenta
}
```

---

## 📖 Leer Data (Read)

### ✅ Merge Inteligente (Local + Remoto)

```typescript
// apps/web/src/services/forage.service.ts

export async function getByPaddock(paddockId: string) {
  const db = await getDb();

  // 1️⃣ Siempre obtener local primero (fast)
  const localForages = await db.forageSamples
    .find({ selector: { paddockId } })
    .exec();

  // 2️⃣ Intentar obtener remoto si hay conexión
  let remoteForages: Forage[] = [];
  if (navigator.onLine) {
    try {
      remoteForages = await apiClient.get(
        `/forage-samples/paddock/${paddockId}`
      );
    } catch (error) {
      // Silenciadamente fallar si no hay red (ya tenemos local)
      console.warn('Remote fetch failed, using local data');
    }
  }

  // 3️⃣ Combinar inteligentemente (evitar duplicados)
  const merged = [
    ...localForages.map(doc => doc.toMutableJSON()),
    ...remoteForages.filter(
      remote => !localForages.some(
        local => local.remoteId === remote.id
      )
    ),
  ];

  // 4️⃣ Devolver merged + sorted
  return merged.sort((a, b) =>
    new Date(b.sampleDate).getTime() -
    new Date(a.sampleDate).getTime()
  );
}
```

### Hook React para Lecturas

```typescript
// En componente
function MyComponent() {
  const [forages, setForages] = useState<Forage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const data = await forage.service.getByPaddock(paddockId);
      setForages(data);
      setLoading(false);
    })();
  }, [paddockId]);

  if (loading) return <Spinner />;
  
  return (
    <ul>
      {forages.map(f => (
        <li key={f.localId || f.id}>
          {f.sampleDate} — {f.height}cm
          {f.syncStatus === 'pending' && <span>⏳ Sincronizando</span>}
          {f.syncStatus === 'failed' && <span>❌ Error</span>}
        </li>
      ))}
    </ul>
  );
}
```

---

## 🔄 Sincronización

### Automática (No hagas nada)

```typescript
// Cuando reconecta internet...
// ✅ Se ejecuta automáticamente:
1. initNetworkSync() agrega listeners
2. Evento 'online' dispara processSyncQueue()
3. Se procesan todos los items pending
4. Se actualizan status en DB + UI
5. OfflineIndicator parpadea y desaparece
```

### Manual (Si lo necesitas)

```typescript
// En un botón "Sincronizar Ahora"
import { processSyncQueue } from '@lib/offline/sync-replicator';

async function handleManualSync() {
  setIsSyncing(true);
  try {
    await processSyncQueue();
    showNotification('✅ Sincronización completa');
  } catch (error) {
    showNotification('❌ Error en sincronización');
  }
  setIsSyncing(false);
}
```

### Retry Automático

```typescript
// sync-replicator.ts ya lo maneja:
const MAX_ATTEMPTS = 3;
const backoffMs = [1000, 2000, 4000]; // 1s → 2s → 4s

// Si falla en intento 1: espera 1s, reintenta
// Si falla en intento 2: espera 2s, reintenta
// Si falla en intento 3: marca como 'failed', requiere intervención
```

---

## 🎣 Hook: useOfflineSync()

### Uso Básico

```typescript
import { useOfflineSync } from '@hooks/useOfflineSync';

function MyComponent() {
  const { isOnline, pendingCount, isSyncing } = useOfflineSync();

  return (
    <div>
      <p>
        {isOnline ? '🟢 Online' : '🔴 Offline'}
        {pendingCount > 0 && ` (${pendingCount} pendientes)`}
        {isSyncing && ' ⟳ Sincronizando'}
      </p>
    </div>
  );
}
```

### Estado Garantizado

| Estado | Significado | Acción Usuario |
|--------|-----------|-----------------|
| `isOnline: true`  | Conectado | Datos nuevos sincronizan inmediatamente |
| `isOnline: false` | Sin internet | Datos se guardan localmente, sync pendiente |
| `pendingCount: 5` | 5 items esperando sync | Mostrar notificación |
| `isSyncing: true` | Sincronizando ahora | Mostrar spinner |

---

## 🧪 Testing Offline-First

### Simular Offline en DevTools

```javascript
// En Console de Firefox/Chrome
// Opción 1: Network tab → Throttle → Offline
// Opción 2: Programáticamente
navigator.onLine = false; // Simula desconexión
window.dispatchEvent(new Event('offline'));

// Verificar datos locales
await window.db // (get reference en DevTools)
```

### Verificar IndexedDB

```
Abierto DevTools → Application → IndexedDB → GanaderiaDB
├─ forageSamples
│  └─ Buscar items con syncStatus: 'pending'
├─ movements
├─ weighings
└─ syncQueue
   └─ Ver todos los items encolados
```

### Checklist de Testing

```
✅ Crear aforo sin internet
   → Debe aparecer inmediatamente
   → Badge: "⏳ Pendiente"

✅ Conectar a internet
   → Badge cambia a "✅ Sincronizado"
   → Aparece en servidor

✅ Crear + Offline, Modificar + Online
   → Merge correcto en interfaz

✅ Fallo de sync (simular endpoint 500)
   → Badge: "❌ Error"
   → Reintentos automáticos
   → Se sincroniza cuando endpoint se repara

✅ OfflineIndicator
   → Visible cuando offline
   → Desaparece cuando online + synced
```

---

## 🐛 Debugging

### Ver Cola de Sincronización

```typescript
import { getSyncStatus } from '@lib/offline/sync-replicator';

async function debugSync() {
  const status = await getSyncStatus();
  console.log(status);
  // {
  //   pending: 5,
  //   synced: 23,
  //   failed: 2
  // }
}
```

### Ver Cambios en Tiempo Real

```typescript
import { subscribeSyncQueue } from '@lib/offline/sync-replicator';

// En un hook de debugging
useEffect(() => {
  const unsubscribe = subscribeSyncQueue((changes) => {
    console.log('Cambios en syncQueue:', changes);
  });

  return unsubscribe;
}, []);
```

### Revisar Errores de Sync

```javascript
// En DevTools → Application → IndexedDB → syncQueue
// Ver columna 'lastError' para items con status: 'failed'
// Ej: "Error 401: Unauthorized" → Token expirado
```

---

## 🔧 Integrar Nuevo Servicio (Template)

```typescript
// apps/web/src/services/mynewfeature.service.ts

import { getDb } from '@lib/offline/db';
import { enqueueSyncOperation } from '@lib/offline/sync-replicator';

export async function createMyFeature(request: CreateRequest) {
  const db = await getDb();
  const localId = generateLocalId();
  const now = new Date().toISOString();

  // 1. Guardar localmente
  await db.myCollection.insert({
    localId,
    ...request,
    syncStatus: 'pending',
    createdAt: now,
    updatedAt: now,
  });

  // 2. Encolar sync
  await enqueueSyncOperation({
    entity: 'myfeature', // ← Debe mapear en sync-replicator.ts
    operation: 'CREATE',
    localId,
    payload: request,
  });

  // 3. Respuesta optimista
  return { id: localId, ...request, syncStatus: 'pending' };
}

export async function getByFilter(filter: string) {
  const db = await getDb();

  // Local
  const local = await db.myCollection
    .find({ selector: { /* tu filtro */ } })
    .exec();

  // Remoto (si online)
  let remote = [];
  if (navigator.onLine) {
    try {
      remote = await apiClient.get(`/myfeatures?filter=${filter}`);
    } catch {}
  }

  // Merge
  const merged = [
    ...local.map(d => d.toMutableJSON()),
    ...remote.filter(r => !local.some(l => l.remoteId === r.id)),
  ];

  return merged;
}
```

### Agregar en sync-replicator.ts

```typescript
// En processSyncQueue()
const endpointMap = {
  // ... existentes
  'myfeature': '/myfeatures', // ← Agregar aquí
};
```

### Agregar en schemas.ts

```typescript
// Crear schema para tu colección
export const myCollectionSchema: RxJsonSchema<MyCollectionDoc> = {
  version: 0,
  primaryKey: 'localId',
  type: 'object',
  properties: {
    localId: { type: 'string' },
    remoteId: { type: ['string', 'null'] },
    // ... tus fields
    syncStatus: { type: 'string', enum: ['pending', 'synced', 'failed'] },
    createdAt: { type: 'string' },
    updatedAt: { type: 'string' },
  },
  required: ['localId', 'syncStatus', 'createdAt'],
};

// En GanaderiaDB interface
export interface GanaderiaDB extends RxDatabase {
  forageSamples: RxCollection<ForageSampleDoc>;
  movements: RxCollection<MovementDoc>;
  weighings: RxCollection<WeighingDoc>;
  myCollection: RxCollection<MyCollectionDoc>; // ← Agregar
  syncQueue: RxCollection<SyncQueueItemDoc>;
}
```

---

## 📊 Indicador Visual (UI)

### OfflineIndicator.tsx (Ya Implementado)

```typescript
// apps/web/src/components/layout/OfflineIndicator.tsx
// Renderiza automáticamente el estado:
// 🟢 Online → Cloud icon (verde)
// 🔴 Offline → CloudOff icon (rojo)
// ⏳ Sync en curso → Spinner (azul)
// ⚠️ Pending → AlertCircle (naranja) + número
```

### Mostrar en Listas

```typescript
// En cada item que se sincroniza:
{item.syncStatus === 'pending' && (
  <span className="text-amber-500">⏳ Sincronizando</span>
)}
{item.syncStatus === 'synced' && (
  <span className="text-green-500">✅ Sincronizado</span>
)}
{item.syncStatus === 'failed' && (
  <span className="text-red-500">❌ Error</span>
)}
```

---

## ⚠️ Antipatrones (NO HAGAS ESTO)

| ❌ Antipatrón | ✅ Correcto |
|--------------|----------|
| `await apiClient.post()` primero | Guardar local primero |
| Validar en servidor antes de guardar local | Validación optimista local + servidor |
| Esperar respuesta del servidor en UI | Mostrar respuesta local + sync async |
| Ignorar `syncStatus` | Siempre mostrar estado de sync |
| Crear nueva colección sin schema RxDB | Agregar schema en schemas.ts primero |
| No manejar reconexión | Confiar en initNetworkSync() automático |

---

## 🎯 Checklist: Antes de Mergear PR

```
✅ Nuevo servicio offline-first
   - Usa patrón: local → enqueue → optimistic response
   - Lee: merge local + remoto
   - Status field en documento

✅ Nuevo schema (si necesario)
   - Definido en schemas.ts
   - Con localId como primaryKey
   - Con syncStatus field
   - Agregado a GanaderiaDB interface

✅ Sincronización
   - Entity mapeado en sync-replicator.ts
   - Endpoint correcto

✅ Tests
   - Offline: crear sin red
   - Online: sync automático
   - Merge: local + remoto no duplican

✅ UI
   - Muestra syncStatus
   - OfflineIndicator presente
   - No deshabilita forms offline

✅ Build
   - npm run build → 0 errores
   - ESLint → sin warnings
   - No importa @shared directamente
```

---

## 🚀 Performance Tips

```typescript
// 1. Lazy-load DB (prevenir hydration issues)
const db = await getDb(); // ← Solo llama cuando se necesita

// 2. Batch inserts
await db.collection.bulkInsert([item1, item2, item3]);

// 3. Use find() con selector (no todo().exec())
await db.items.find({ selector: { status: 'pending' } }).exec();

// 4. Limitar resultados
await db.items.find().limit(100).exec();

// 5. Índices (venir en épica 3 si crece mucho)
```

---

**Última actualización:** 12 de enero de 2026  
**Versión:** 1.0  
**¿Preguntas?** Revisar [OFFLINE_FIRST_GUIDE.md](OFFLINE_FIRST_GUIDE.md) para más detalles
