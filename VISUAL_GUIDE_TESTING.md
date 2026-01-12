# 👀 VISUAL GUIDE: Qué Esperar en el Navegador

## App Loading (Primer acceso)

```
http://localhost:3001
│
├─ Página cargando...
│  ▲ Next.js 14.2.35
│  🔄 Compilando...
│
└─ VISTA FINAL (después de 10-15 segundos)

┌─────────────────────────────────────────────────────────────┐
│ 🐄 MAGROTEC                    🔴 Modo Offline  ☰          │  ← TopNav
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Dashboard                                               │ │
│ │                                                         │ │
│ │  Últimos Movimientos      Últimos Pesajes              │ │
│ │  ─────────────────────    ──────────────────           │ │
│ │  Sin datos aún            Sin datos aún                │ │
│ │                                                         │ │
│ └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  [Dashboard] [Fincas] [Potreros] [Lotes] [Movimientos]     │
│  [Pesajes]   [Aforamientos]      [Más...]                  │
│                                              👤 Usuario ▼   │
└─────────────────────────────────────────────────────────────┘
```

---

## 📍 OFFLINE INDICATOR - Estado 1: OFFLINE (🔴 Rojo)

### Ubicación: Top-Right (Desktop)
```
┌──────────────────────────────────────────────────────────────┐
│ ... Contenido ... 🔴 Modo Offline                          │
│                   [Red circle] "Modo Offline"                │
│                   "Trabajando sin conexión"                  │
└──────────────────────────────────────────────────────────────┘
```

### Ubicación: Mobile Bottom Nav
```
┌─────────────────────────────────────┐
│ Dashboard Fincas Potreros Lotes     │
│ 🔴   ☰                              │
│ "Offline"                           │
└─────────────────────────────────────┘
```

---

## 📍 OFFLINE INDICATOR - Estado 2: SYNCING (🔵 Azul con Spinner)

```
ANTES (Desconectas red):
🔴 Modo Offline

DESPUÉS (Reconectas):
🔵 Sincronizando... (con spinner giratorio)

ESPERADO:
- El círculo es azul
- Hay un spinner animado dentro
- Texto: "Sincronizando..."
- Aparece después de ~500ms de reconectar
```

---

## 📍 OFFLINE INDICATOR - Estado 3: PENDING (🟡 Amarillo)

```
CUANDO CREAS DATOS SIN RED:
🟡 1 cambio pendiente

SI CREAS 2 DATOS:
🟡 2 cambios pendientes

COMPONENTES:
- Círculo amarillo
- Número de operaciones pendientes
- Desaparece cuando reconectas y sincroniza
```

---

## 📍 OFFLINE INDICATOR - Estado 4: SYNCED (🟢 Verde)

```
DESPUÉS DE SINCRONIZAR EXITOSAMENTE:
🟢 Todo sincronizado

COMPONENTES:
- Círculo verde
- Check mark ✓
- Texto: "Todo sincronizado"
- Persiste hasta siguiente cambio offline
```

---

## 🔄 TESTING FLOW - Paso a Paso Visual

### PASO 1: Abre DevTools (F12)
```
┌────────────────────────────────────────────────────────────────┐
│ App                              │ DevTools                     │
│                                  │                              │
│  🐄 MAGROTEC                     │ ▼ Application Network        │
│  🔴 Modo Offline                 │ │ Storage Performance        │
│                                  │ └─ 📁 Storage               │
│                                  │    └─ 📁 IndexedDB          │
│                                  │       └─ ganaderia-offline-db
│                                  │          ├─ forages        │
│                                  │          ├─ movements      │
│                                  │          ├─ weighings      │
│                                  │          └─ syncQueue      │
└────────────────────────────────────────────────────────────────┘
```

---

### PASO 2: Desconectar Red (DevTools → Network → Offline)
```
┌────────────────────────────────────────────────────────────────┐
│ DevTools → Network                                             │
│ ┌─────────────────────────────────────────────────────────┐   │
│ │ Throttling: [Offline ▼]  ← Cambiar a "Offline"        │   │
│ │ ┌─────────────────────────────────────────────────┐     │   │
│ │ │ 🔴 REQUEST FAILED (sin red)                     │     │   │
│ │ │ GET http://localhost:3001 net::ERR_INTERNET_... │     │   │
│ │ └─────────────────────────────────────────────────┘     │   │
│ └─────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────┘

APP EFECTO:
🔴 Modo Offline aparece en UI
```

---

### PASO 3: Navega a Movimientos y Crea Uno
```
┌────────────────────────────────────────────────────────────┐
│ 🐄 MAGROTEC       🔴 Modo Offline               ☰         │
├────────────────────────────────────────────────────────────┤
│                                                            │
│ Movimientos                                                │
│ ─────────────────────────────────                          │
│                                                            │
│ [+ Nuevo Movimiento]                                       │
│                                                            │
│ Cargando...                                                │
│                                                            │
└────────────────────────────────────────────────────────────┘

CLICK: "+ Nuevo Movimiento"
│
└─ MODAL: Crear Movimiento
   ┌──────────────────────────────────────┐
   │ Crear Movimiento                     │
   ├──────────────────────────────────────┤
   │ Lote:           [Select...]          │
   │ Potrero Origen: [Select...]          │
   │ Potrero Destino:[Select...]          │
   │ Fecha Entrada:  [YYYY-MM-DD]         │
   │ Notas:          [Texto opcional]     │
   ├──────────────────────────────────────┤
   │          [Cancelar]  [Guardar]       │
   └──────────────────────────────────────┘

COMPLETA Y CLICK: "Guardar"
│
└─ ✅ ESPERADO: <100ms después
   └─ Movimiento aparece en la lista
   └─ Indicador: 🟡 "1 cambio pendiente"
   └─ Modal se cierra
```

---

### PASO 4: Verifica en IndexedDB
```
DevTools → Storage → IndexedDB → ganaderia-offline-db → movements

┌────────────────────────────────────────────────────────────────┐
│ Key         │ localId (primary)                                │
├─────────────┼──────────────────────────────────────────────────┤
│ localId     │ "550e8400-e29b-41d4-a716-446655440000"          │
│ remoteId    │ undefined                                        │
│ herdId      │ "herd-123"                                       │
│ farmId      │ "farm-456"                                       │
│ status      │ "ACTIVE"                                         │
│ entryDate   │ "2026-01-12T00:00:00.000Z"                       │
│ _syncStatus │ "pending"  ← CLAVE                               │
│ _localOnly  │ true       ← CLAVE                               │
│ createdAt   │ "2026-01-12T14:30:45.123Z"                       │
└────────────────────────────────────────────────────────────────┘
```

---

### PASO 5: Crea un Pesaje (Mismo Proceso)
```
Movimientos → Pesajes (en menu)
│
└─ [+ Nuevo Pesaje]
   ├─ Lote: [mismo lote anterior]
   ├─ Cantidad: 10
   ├─ Peso Total: 5000 kg
   ├─ Fecha: 2026-01-12
   └─ [Guardar]

ESPERADO:
├─ Pesaje aparece <100ms
├─ Indicador: 🟡 "2 cambios pendientes"
└─ En IndexedDB → weighings:
   {
     localId: "...",
     averageWeightKg: 500,      ← Calculado LOCALMENTE
     newHerdUA: 11.11,          ← Calculado LOCALMENTE
     _syncStatus: "pending"
   }
```

---

### PASO 6: Reconectar Red
```
DevTools → Network → Throttling

CAMBIAR: "Offline" → "No throttling"

ESPERADO EN PANTALLA:
─────────────────────────────────────
Indicador cambia:
  🔴 Modo Offline
       ↓ (en ~500ms)
  🔵 Sincronizando... (con spinner azul)
       ↓ (en ~2-3 segundos)
  🟢 Todo sincronizado
─────────────────────────────────────
```

---

### PASO 7: Observa Network Tab
```
DevTools → Network

DURANTE SINCRONIZACIÓN:
┌────────────────────────────────────────────────────────────┐
│ Method │ Name              │ Status │ Size  │ Time       │
├────────┼───────────────────┼────────┼───────┼────────────┤
│ POST   │ /api/movements    │ 201    │ 450B  │ 124ms      │
│ POST   │ /api/weighings    │ 201    │ 380B  │ 98ms       │
└────────�────────────────────────────────────────────────────┘

VES:
✅ POST request para movimiento
✅ POST request para pesaje
✅ Status 200-201 (éxito)
✅ Time: 100-200ms cada uno
```

---

### PASO 8: Verifica Merge en IndexedDB
```
ANTES DE SYNC:
movements → localId = "xxx"
           remoteId = undefined

DESPUÉS DE SYNC:
movements → localId = "xxx"  ← SE MANTIENE
           remoteId = "db-12345"  ← ASIGNADO POR SERVIDOR

EN LA UI:
├─ Movimiento aparece 1 sola vez (no duplicado)
├─ Puedes hacer click para ver detalles
└─ Los datos son los mismos
```

---

## ✅ Todos los Estados en Acción

### Timeline Completo:
```
t=0s:
App carga
🔴 Modo Offline (asumiendo red desconectada)

t=5s:
Creas Movimiento offline
├─ UI: <100ms respuesta
├─ Indicador: 🟡 "1 cambio pendiente"
└─ IndexedDB: _syncStatus="pending"

t=10s:
Creas Pesaje offline
├─ UI: <100ms respuesta
├─ Indicador: 🟡 "2 cambios pendientes"
└─ IndexedDB: 2 documentos pendientes

t=15s:
Reconectas red
├─ Indicador: 🔵 "Sincronizando..."
├─ Network: 2 POST requests
└─ IndexedDB: remoteIds asignados

t=20s:
Sync completo
├─ Indicador: 🟢 "Todo sincronizado"
├─ UI: 2 elementos con remoteId
└─ DB: _syncStatus="synced" para ambos
```

---

## 🚨 Problemas Comunes y Solución

### Problema 1: No ves IndexedDB
```
Acción:
1. DevTools → Console
2. Copia: window.localStorage.clear()
3. Recarga: F5
4. Intenta crear movimiento nuevamente
```

### Problema 2: Indicador muestra 🔴 pero quisiera probar sync
```
Acción:
1. DevTools → Network
2. Cambia a "No throttling"
3. Verás el cambio inmediato a 🔵 Sincronizando
```

### Problema 3: Datos aparecen duplicados
```
Acción:
1. DevTools → Storage → IndexedDB
2. Busca documentos con mismo remoteId
3. Verifica que la UI hace merge correcto
4. Si hay 2 items en lista, algo falló en merge
```

### Problema 4: POST requests no aparecen
```
Acción:
1. Cierra DevTools completamente
2. Abre F12 nuevamente
3. Crea un nuevo movimiento
4. Reconecta red
5. Busca en Network tab los POST
```

---

## 🎉 Resultado Esperado Final

```
┌──────────────────────────────────────────────────────────────┐
│  🐄 MAGROTEC                     🟢 Todo sincronizado       │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Movimientos (1)                  Pesajes (1)               │
│  ─────────────────────────────    ──────────────────        │
│  • 2026-01-12: Lote A             • 2026-01-12: Lote A      │
│    Potrero 1 → 2                    Peso: 5000kg (avg 500)   │
│    Estado: ACTIVE                   UA: 11.11               │
│    ✓ Sincronizado                   ✓ Sincronizado         │
│                                                              │
│  Dashboard | Fincas | Potreros | Lotes | Movimientos       │
│  Pesajes                                               👤  │
│                                                              │
└──────────────────────────────────────────────────────────────┘

INDICADORES:
✅ Indicator shows 🟢 "Todo sincronizado"
✅ Both items visible in UI
✅ Both have remoteId in IndexedDB
✅ No duplicates
✅ Data persisted across reload
```

---

## 🎯 Success Criteria (All Must Pass)

- [ ] IndexedDB tiene 4 colecciones
- [ ] Crear movimiento toma <100ms offline
- [ ] Crear pesaje toma <100ms offline
- [ ] Indicador muestra 🟡 mientras pendientes
- [ ] Reconectar cambia a 🔵 Sincronizando
- [ ] Network tab muestra POST requests
- [ ] Ambos items sincronizados exitosamente
- [ ] Indicador cambia a 🟢 al terminar
- [ ] No hay duplicados en la UI
- [ ] RemoteId asignado en IndexedDB

**If ALL pass ✅**: ¡Implementación exitosa!

---

**¡Ahora abre DevTools (F12) y comienza el testing!** 🚀
