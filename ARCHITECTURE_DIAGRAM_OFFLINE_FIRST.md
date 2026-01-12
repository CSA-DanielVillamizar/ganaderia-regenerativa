# 🏗️ Arquitectura Offline-First: Diagrama Completo

## 1️⃣ ARQUITECTURA EN CAPAS

```
┌────────────────────────────────────────────────────────────────┐
│                  REACT COMPONENTS (UI Layer)                    │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Forms, Dashboards, Lists                               │   │
│  │  - ForageForm.tsx                                       │   │
│  │  - MovementForm.tsx                                     │   │
│  │  - WeighingForm.tsx                                     │   │
│  │  - OfflineIndicator.tsx (nuevo)                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                        ▲                                         │
│                        │ useOfflineSync()                       │
│                        │ isOnline, pendingCount                │
└────────────────────────┼──────────────────────────────────────┘
                         │
┌────────────────────────┼──────────────────────────────────────┐
│          SERVICES LAYER (Business Logic)                        │
│                        │                                         │
│  ┌────────────────┐   │   ┌──────────────────┐                │
│  │ forage.service │   │   │ movement.service │                │
│  │  (offline-1st) │   │   │                  │                │
│  │                │   │   │  [TODO: Refactor]│                │
│  │ createForage() ├───┼───┤ createMovement() │                │
│  │ getByPaddock() │   │   │                  │                │
│  └────────────────┘   │   └──────────────────┘                │
│                        │                                         │
│  ┌──────────────────────────────────────────────────────┐     │
│  │ weighing.service                                     │     │
│  │  [TODO: Refactor]                                    │     │
│  │ createWeighing()                                     │     │
│  └──────────────────────────────────────────────────────┘     │
│                        │                                         │
└────────────────────────┼──────────────────────────────────────┘
                         │ enqueueSyncOperation()
                         │ getDb()
                         │
┌────────────────────────┼──────────────────────────────────────┐
│      OFFLINE INFRASTRUCTURE LAYER (Nueva)                       │
│                        │                                         │
│  ┌──────────────────────────────────────────────────────┐     │
│  │         sync-replicator.ts                           │     │
│  │  ┌──────────────────────────────────────────────┐   │     │
│  │  │ enqueueSyncOperation()                       │   │     │
│  │  │ ├─ Crea item en syncQueue                    │   │     │
│  │  │ └─ Dispara processSyncQueue si hay red      │   │     │
│  │  └──────────────────────────────────────────────┘   │     │
│  │  ┌──────────────────────────────────────────────┐   │     │
│  │  │ processSyncQueue()                           │   │     │
│  │  │ ├─ Busca items pending                       │   │     │
│  │  │ ├─ POST/PUT al API                           │   │     │
│  │  │ ├─ Actualiza local con remoteId             │   │     │
│  │  │ └─ Backoff exponencial (máx 3 reintentos)   │   │     │
│  │  └──────────────────────────────────────────────┘   │     │
│  │  ┌──────────────────────────────────────────────┐   │     │
│  │  │ initNetworkSync()                            │   │     │
│  │  │ ├─ addEventListener('online', ...)           │   │     │
│  │  │ └─ addEventListener('offline', ...)          │   │     │
│  │  └──────────────────────────────────────────────┘   │     │
│  │  ┌──────────────────────────────────────────────┐   │     │
│  │  │ retryFailedItem()                            │   │     │
│  │  │ ├─ Marca como 'pending'                      │   │     │
│  │  │ └─ Reset attempts = 0                        │   │     │
│  │  └──────────────────────────────────────────────┘   │     │
│  └──────────────────────────────────────────────────────┘     │
│                        │                                         │
│  ┌──────────────────────────────────────────────────────┐     │
│  │         db.ts (RxDB Singleton)                       │     │
│  │                                                      │     │
│  │  getDb(): Promise<GanaderiaDB>                       │     │
│  │  ├─ Lazy initialization (solo en cliente)            │     │
│  │  ├─ Retorna promesa cacheada                        │     │
│  │  └─ Crea 4 colecciones                             │     │
│  │      ├─ forageSamples                              │     │
│  │      ├─ movements                                  │     │
│  │      ├─ weighings                                  │     │
│  │      └─ syncQueue                                  │     │
│  └──────────────────────────────────────────────────────┘     │
│                        │                                         │
│  ┌──────────────────────────────────────────────────────┐     │
│  │         schemas.ts (JSON Schemas)                    │     │
│  │  ├─ forageSchema                                    │     │
│  │  ├─ movementSchema                                  │     │
│  │  ├─ weighingSchema                                  │     │
│  │  └─ syncQueueSchema                                 │     │
│  │     (primaryKey: localId en todas)                 │     │
│  └──────────────────────────────────────────────────────┘     │
│                        │                                         │
└────────────────────────┼──────────────────────────────────────┘
                         │ fetch/apiClient
                         │
┌────────────────────────┼──────────────────────────────────────┐
│        BROWSER STORAGE LAYER                                    │
│                        │                                         │
│  ┌──────────────────────────────────────────────────────┐     │
│  │  IndexedDB (via Dexie + RxDB)                        │     │
│  │                                                      │     │
│  │  Database: ganaderia-offline-db                     │     │
│  │  ├─ forageSamples                                  │     │
│  │  │  ├─ localId (PK)                               │     │
│  │  │  ├─ paddockId, farmId                          │     │
│  │  │  ├─ sampleDate, heightCm, ...                  │     │
│  │  │  ├─ status: 'pending' | 'synced' | 'failed'   │     │
│  │  │  ├─ remoteId (asignado por servidor)           │     │
│  │  │  └─ createdAt, updatedAt                       │     │
│  │  │                                                  │     │
│  │  ├─ movements                                      │     │
│  │  │  ├─ localId (PK)                               │     │
│  │  │  ├─ herdId, paddockId, farmId                  │     │
│  │  │  ├─ entryDate, estimatedExitDate               │     │
│  │  │  ├─ syncStatus: 'pending' | 'synced' | 'failed'│     │
│  │  │  └─ remoteId                                   │     │
│  │  │                                                  │     │
│  │  ├─ weighings                                      │     │
│  │  │  ├─ localId (PK)                               │     │
│  │  │  ├─ herdId, farmId                             │     │
│  │  │  ├─ weighDate, numberOfAnimals                 │     │
│  │  │  ├─ status: 'pending' | 'synced' | 'failed'   │     │
│  │  │  └─ remoteId                                   │     │
│  │  │                                                  │     │
│  │  └─ syncQueue                                      │     │
│  │     ├─ id (PK)                                     │     │
│  │     ├─ entity, operation, localId                 │     │
│  │     ├─ payload (datos a sincronizar)              │     │
│  │     ├─ status, attempts, maxAttempts              │     │
│  │     ├─ lastError (si falló)                       │     │
│  │     └─ createdAt, updatedAt                       │     │
│  │                                                      │     │
│  └──────────────────────────────────────────────────────┘     │
│                                                                  │
│  ✅ Persiste entre refreshes/sesiones                          │
│  ✅ Acceso inmediato sin esperar red                           │
│  ✅ Capacidad de almacenar miles de registros                  │
│                                                                  │
└────────────────────────────────────────────────────────────────┘
```

---

## 2️⃣ FLUJO DE CICLO DE VIDA DE UNA OPERACIÓN

```
ESCENARIO: Trabajador registra un aforo en el campo (sin internet)

[FASE 1: USUARIO INTERACTÚA]
┌─────────────────────────────────────────────────────────┐
│ 1. Usuario hace click en "Nuevo Aforo"                  │
│    ForageForm.tsx abre                                  │
└─────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│ 2. Usuario llena datos:                                 │
│    - Altura: 45 cm                                      │
│    - Peso muestra: 2.5 kg                               │
│    - Materia seca: 32%                                  │
│    - Potrero: Potrero Norte                             │
└─────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│ 3. Click "GUARDAR"                                      │
│    createForage() es llamado                            │
└─────────────────────────────────────────────────────────┘

[FASE 2: GUARDADO LOCAL]
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│ 4. forage.service.ts → createForage()                   │
│    a) Calcula derivados:                                │
│       - localId = 'forage_1673457890_abc123'            │
│       - kgPerHectare = 200                              │
│       - category = 'EXCELENTE'                          │
│       - now = 2026-01-12T14:31:30.000Z                 │
│                                                          │
│    b) Abre BD local:                                    │
│       db = await getDb()                                │
│                                                          │
│    c) Inserta en IndexedDB:                             │
│       db.forageSamples.insert({                         │
│         localId,                                         │
│         paddockId: 'pdck_123',                          │
│         farmId: 'farm_456',                             │
│         heightCm: 45,                                   │
│         sampleWeightKg: 2.5,                            │
│         drymatterPercent: 32,                           │
│         kgPerHectare: 200,                              │
│         category: 'EXCELENTE',                          │
│         status: 'pending',                              │
│         createdAt: now,                                 │
│         updatedAt: now                                  │
│       })                                                │
│       ✅ GUARDADO en IndexedDB                          │
└─────────────────────────────────────────────────────────┘
                        │
                        ▼
[FASE 3: ENCOLAMIENTO]
┌─────────────────────────────────────────────────────────┐
│ 5. sync-replicator.ts → enqueueSyncOperation()          │
│    a) Crea item de cola:                                │
│       {                                                  │
│         id: 'sync_1673457890_xyz789',                   │
│         entity: 'forage',                               │
│         operation: 'CREATE',                            │
│         localId: 'forage_1673457890_abc123',            │
│         payload: {                                       │
│           paddockId: 'pdck_123',                        │
│           kgPerHectare: 200,                            │
│           dryMatter: 32,                                │
│           sampleDate: '2026-01-12T00:00:00.000Z'       │
│         },                                              │
│         status: 'pending',                              │
│         attempts: 0,                                    │
│         maxAttempts: 3,                                 │
│         createdAt: now,                                 │
│         updatedAt: now                                  │
│       }                                                  │
│                                                          │
│    b) Inserta en syncQueue:                             │
│       db.syncQueue.insert(item)                         │
│       ✅ ENCOLADO para sincronizar                      │
│                                                          │
│    c) Notifica listeners                                │
│       notifySyncListeners()                             │
│       → useOfflineSync hooks se actualizan              │
└─────────────────────────────────────────────────────────┘
                        │
                        ▼
[FASE 4: RESPUESTA AL USUARIO (OPTIMISTA)]
┌─────────────────────────────────────────────────────────┐
│ 6. Return respuesta optimista:                          │
│    {                                                     │
│      id: 'forage_1673457890_abc123',                    │
│      farmId: 'farm_456',                                │
│      paddockId: 'pdck_123',                             │
│      sampleDate: '2026-01-12',                          │
│      heightCm: 45,                                      │
│      sampleWeightKg: 2.5,                               │
│      drymatterPercent: 32,                              │
│      kgPerHectare: 200,                                 │
│      category: 'EXCELENTE',                             │
│      status: 'pending'                                  │
│    }                                                     │
│                                                          │
│    ✅ IMMEDIATAMENTE mostrado en UI                    │
│    💬 Toast: "Guardado offline"                         │
│    📊 Lista de aforos actualizada                       │
│    ⏱️  Latencia percibida: ~0ms ✨                       │
└─────────────────────────────────────────────────────────┘

[FASE 5: INDICADOR EN UI]
┌─────────────────────────────────────────────────────────┐
│ 7. OfflineIndicator.tsx se actualiza:                  │
│    useOfflineSync() hook retorna:                       │
│    {                                                     │
│      isOnline: false,    // Sin conexión                │
│      pendingCount: 1,    // 1 aforo pendiente           │
│      isSyncing: false    // No está sincronizando       │
│    }                                                     │
│                                                          │
│    Renderiza:                                            │
│    🔴 Offline | ⚠️  1                                    │
│                                                          │
│    [Navbar superior derecha]                            │
└─────────────────────────────────────────────────────────┘

[FASE 6: ESPERANDO CONEXIÓN]
┌─────────────────────────────────────────────────────────┐
│ 8. App espera...                                         │
│    - navigator.onLine = false                           │
│    - Listener 'online' esperando evento                 │
│    - Otros aforos pueden seguir registrándose           │
│    - Todos quedan locales y encolados                   │
└─────────────────────────────────────────────────────────┘
                        │
                        ▼ [Pasan 15 minutos, usuario sale del campo
                          y entra a zona con señal WiFi]

[FASE 7: RECONEXIÓN]
┌─────────────────────────────────────────────────────────┐
│ 9. Evento 'online' detectado                            │
│    window.addEventListener('online', () => {            │
│      console.log('🌐 Conexión restaurada');             │
│      setIsOnline(true);                                 │
│      processSyncQueue();  // ← Inicia sync               │
│    })                                                    │
│                                                          │
│    OfflineIndicator actualiza:                          │
│    🟢 Online | ⟳ Sync...                                │
└─────────────────────────────────────────────────────────┘
                        │
                        ▼
[FASE 8: SINCRONIZACIÓN]
┌─────────────────────────────────────────────────────────┐
│ 10. processSyncQueue() ejecuta:                         │
│     a) Query: SELECT * FROM syncQueue WHERE status='pending'
│        → Encuentra 1 item                                │
│                                                          │
│     b) Para cada item:                                  │
│        i) Resolver endpoint:                            │
│           entity='forage' → endpoint='/forage-samples'  │
│           operation='CREATE' → method='POST'            │
│                                                          │
│        ii) Hacer petición:                              │
│           POST /forage-samples {                        │
│             paddockId: 'pdck_123',                      │
│             kgPerHectare: 200,                          │
│             dryMatter: 32,                              │
│             sampleDate: '2026-01-12T00:00:00.000Z'     │
│           }                                              │
│           Headers: Authorization: Bearer <token>        │
│                                                          │
│        iii) Servidor responde:                          │
│            HTTP 201 Created                             │
│            {                                             │
│              "id": "forage_remote_789def",              │
│              "paddockId": "pdck_123",                   │
│              "kgPerHectare": 200,                       │
│              ...                                         │
│            }                                             │
│                                                          │
│        iv) Actualizar local con remoteId:              │
│            db.forageSamples.findOne('forage_1673...')  │
│              .patch({                                   │
│                remoteId: 'forage_remote_789def',        │
│                status: 'synced',                        │
│                updatedAt: now                           │
│              })                                          │
│                                                          │
│        v) Actualizar syncQueue:                         │
│           item.patch({                                  │
│             status: 'synced',                           │
│             attempts: 1,                                │
│             lastError: null,                            │
│             updatedAt: now                              │
│           })                                             │
│                                                          │
│    ✅ SINCRONIZADO exitosamente                         │
└─────────────────────────────────────────────────────────┘
                        │
                        ▼
[FASE 9: NOTIFICACIÓN A UI]
┌─────────────────────────────────────────────────────────┐
│ 11. Listeners notificados:                              │
│     notifySyncListeners()                               │
│     ├─ useOfflineSync hooks se re-calculan             │
│     │  pendingCount ahora = 0                          │
│     │                                                    │
│     └─ OfflineIndicator se actualiza:                  │
│        🟢 Online (sin contador)                         │
│        [Desaparece el "1 pendiente"]                    │
│                                                          │
│    🎉 UI refleja cambio inmediatamente                 │
│    💬 Toast: "Sincronizado"                             │
└─────────────────────────────────────────────────────────┘

[FASE 10: ESTADO FINAL]
┌─────────────────────────────────────────────────────────┐
│ 12. Estados finales:                                    │
│                                                          │
│     IndexedDB:                                           │
│     forageSamples[localId='forage_1673...']            │
│     ├─ status: 'synced'                                 │
│     ├─ remoteId: 'forage_remote_789def' ✅ (nuevo)     │
│     └─ updatedAt: 2026-01-12T14:45:00Z                 │
│                                                          │
│     Servidor (PostgreSQL):                              │
│     forage_samples[id='forage_remote_789def']           │
│     ├─ paddockId: 'pdck_123'                           │
│     ├─ kgPerHectare: 200                               │
│     └─ createdAt: 2026-01-12T14:45:00Z                 │
│                                                          │
│     syncQueue[id='sync_1673...']                        │
│     └─ status: 'synced' ✅                              │
│                                                          │
│     Navigator:                                           │
│     └─ pendingCount: 0                                  │
└─────────────────────────────────────────────────────────┘

🎉 CICLO COMPLETO
Datos guardados localmente → Sincronizados con servidor → Usuario ve cambios
```

---

## 3️⃣ DIAGRAMA DE DEPENDENCIAS

```
package.json (apps/web)
├── rxdb@^15.27.0           ← Base de datos reactiva
│   └── Métodos:
│       ├── createRxDatabase()
│       ├── addCollections()
│       ├── find(), findOne(), insert(), patch(), remove()
│       └── subscribe() para cambios en tiempo real
│
├── dexie@^4.0.8            ← IndexedDB wrapper
│   └── Interfaz amigable para IndexedDB
│
├── axios@^1.13.2           ← Cliente HTTP (apiClient)
│   └── POST/PUT/DELETE al backend
│
├── @tanstack/react-query@5.28.0
│   └── Caché y estado de consultas (complementario)
│
└── lucide-react@0.371.0    ← Iconos (Cloud, CloudOff, etc.)
    └── Para OfflineIndicator
```

---

## 4️⃣ MATRIZ DE ESTADOS

```
┌──────────────┬──────────────┬──────────────────────┬───────────────┐
│ Escenario    │ navigator    │ syncQueue Items      │ OfflineInd.   │
│              │ .onLine      │                      │               │
├──────────────┼──────────────┼──────────────────────┼───────────────┤
│ Ideal        │ true         │ 0 items (all synced) │ 🟢 Online     │
│ (Conectado)  │              │ status: 'synced'     │               │
├──────────────┼──────────────┼──────────────────────┼───────────────┤
│ Guardando    │ false        │ 1+ pending items     │ 🔴 Offline    │
│ Offline      │              │ status: 'pending'    │ "1", "2", etc │
├──────────────┼──────────────┼──────────────────────┼───────────────┤
│ Sincroniz.   │ true         │ 1+ items syncing     │ ⟳ Sync...     │
│ en progreso  │              │ status: 'syncing'*   │ "1" pendiente  │
├──────────────┼──────────────┼──────────────────────┼───────────────┤
│ Con errores  │ true         │ 1+ failed items      │ ⚠️ "1"         │
│              │              │ status: 'failed'     │ (no sync)      │
│              │              │ attempts >= 3        │ Red oscura     │
├──────────────┼──────────────┼──────────────────────┼───────────────┤
│ Reintentando │ true         │ 1+ pending (reset)   │ ⟳ Sync...     │
│ fallido      │              │ status: 'pending'    │               │
│              │              │ attempts: 0          │               │
└──────────────┴──────────────┴──────────────────────┴───────────────┘

* 'syncing' es temporal, cambia a 'synced' o 'failed'
```

---

## 5️⃣ ÁRBOL DE DIRECTORIOS (Nuevos Archivos)

```
apps/web/src/
├── lib/
│   └── offline/                          ← [NEW]
│       ├── schemas.ts                    ← Esquemas JSON para RxDB
│       ├── db.ts                         ← Singleton RxDB
│       └── sync-replicator.ts            ← Motor de sincronización
│
├── hooks/
│   └── useOfflineSync.ts                 ← [NEW] Hook React
│
├── services/
│   ├── forage.service.ts                 ← [MODIFIED] Offline-first
│   ├── movement.service.ts               ← [TODO] Refactor
│   └── weighing.service.ts               ← [TODO] Refactor
│
└── components/
    └── layout/
        ├── OfflineIndicator.tsx          ← [NEW] Componente UI
        └── Navigation.tsx                ← [MODIFIED] Integración
```

---

## 6️⃣ SECUENCIA DE INICIALIZACIÓN (App Startup)

```
1. User visits https://app.example.com/
   │
2. Next.js loads layout.tsx
   │
3. RootLayoutClient monta
   ├─ QueryClientProvider initialized
   ├─ AuthGate checks authentication
   └─ initNetworkSync() called (one-time)
      └─ window.addEventListener('online', ...)
      └─ window.addEventListener('offline', ...)
      └─ console.log('🔌 Listeners de red inicializados')
   │
4. FarmProvider initialized
   │
5. Components render
   ├─ Sidebar monta
   │  └─ OfflineIndicator monta
   │     └─ useOfflineSync() hook executes
   │        └─ Llama getPendingCount()
   │        └─ Suscribe a syncQueue changes
   │        └─ Inicia polling cada 10s
   │
6. App fully loaded
   ├─ User can create forages
   ├─ Localista guardados in IndexedDB
   ├─ Indicador muestra estado correcto
   └─ Ready for offline work!
```

---

**Creado por:** Build Engineer & Architect  
**Timestamp:** 12 de enero de 2026  
**Diagrama Version:** 1.0
