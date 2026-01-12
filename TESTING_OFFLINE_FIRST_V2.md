# 🧪 TESTING OFFLINE-FIRST IMPLEMENTATION

## Estado del Servidor
✅ **Dev Server**: Corriendo en http://localhost:3001  
✅ **Archivos Refactorados**: movement.service.ts, weighing.service.ts  
✅ **Error Handler**: api-error-handler.ts creado  
✅ **Compilación**: Sin errores

---

## 📋 Pasos de Testing (Sigue en orden)

### PASO 1: Verificar DevTools y IndexedDB
```
1. Abre DevTools: Presiona F12
2. Navega a: Application → Storage → IndexedDB
3. Deberías ver una entrada: "ganaderia-offline-db"
4. Expande para ver las 4 colecciones:
   ✓ forages
   ✓ movements
   ✓ weighings
   ✓ syncQueue
```

**Esperado**: Las 4 colecciones existen en IndexedDB  
**Si no ves**: Compila de nuevo (npm run build)

---

### PASO 2: Desconectar la Red
```
1. En DevTools: Application → Network
2. En el dropdown "Throttling" → Selecciona "Offline"
   (O en DevTools → Network → Right-click → "Set throttling preset" → Offline)
3. Verifica que la UI muestre: 🔴 "Modo Offline"
```

**Esperado**: El indicador cambia a rojo "Offline"  
**Prueba si**: El icono en top-right/mobile se vuelve rojo

---

### PASO 3: Crear un Movimiento (Offline)
```
1. Navega a: Movimientos
2. Haz clic en: "+ Nuevo Movimiento"
3. Completa los campos:
   - Lote: Selecciona cualquier lote
   - Potrero Origen: Selecciona un potrero
   - Potrero Destino: Selecciona otro potrero
   - Fecha Entrada: Hoy o una fecha pasada
4. Haz clic: "Guardar"
```

**Esperado**:
- ✅ El movimiento aparece en la lista (<100ms, respuesta optimista)
- ✅ Indicador cambia a 🟡 "1 cambio pendiente"
- ✅ En IndexedDB (DevTools → Storage → IndexedDB → movements):
  - Ves un documento con localId (UUID)
  - Campo _syncStatus: "pending"

---

### PASO 4: Crear un Pesaje (Offline)
```
1. Navega a: Pesajes
2. Haz clic en: "+ Nuevo Pesaje"
3. Completa:
   - Lote: Selecciona el mismo lote anterior
   - Cantidad Animales: 10
   - Peso Total (kg): 5000
   - Fecha: Hoy
4. Haz clic: "Guardar"
```

**Esperado**:
- ✅ Aparece en la lista (<100ms)
- ✅ Indicador muestra 🟡 "2 cambios pendientes"
- ✅ En IndexedDB → weighings:
  - Ves un documento con localId
  - Campo newHerdUA calculado localmente (no viene del servidor)

---

### PASO 5: Verificar Datos en IndexedDB
```
En DevTools → Application → Storage → IndexedDB → ganaderia-offline-db:

movements:
{
  localId: "uuid-1234",
  herdId: "...",
  status: "ACTIVE",
  _syncStatus: "pending",
  _localOnly: true
}

weighings:
{
  localId: "uuid-5678",
  herdId: "...",
  averageWeightKg: 500,  ← Calculado localmente
  newHerdUA: 11.11,      ← Calculado localmente
  _syncStatus: "pending",
  _localOnly: true
}

syncQueue:
{
  id: "sync-1",
  entity: "Movement",
  operation: "CREATE",
  status: "pending",
  attempts: 0,
  payload: { ... }
}
```

**Esperado**: Todos los campos presentes, syncStatus="pending"

---

### PASO 6: Reconectar la Red
```
1. En DevTools → Network → "Offline" → Cambia a "No throttling"
   O desactiva el modo offline
2. Deberías ver:
   - Indicador cambia a 🔵 "Sincronizando..."
   - Spinner animado
```

**Esperado**: Cambio instantáneo a estado "Sincronizando"

---

### PASO 7: Observar Sincronización
```
Espera 3-5 segundos mientras:
1. El indicador muestra spinner azul
2. En DevTools → Network:
   - VES requests POST/PUT a la API
   - Status: 200 (éxito)
3. Indicador cambia a 🟢 "Todo sincronizado"
```

**Esperado**:
- ✅ Requests HTTP visibles en Network tab
- ✅ Movimiento y Pesaje aparecen con remoteId
- ✅ En IndexedDB: _syncStatus cambia a "synced"
- ✅ En syncQueue: status="synced"

---

### PASO 8: Verificar Merge (Sin Duplicados)
```
1. En IndexedDB → movements:
   - Abre el movimiento que creaste
   - ANTES: localId sólo, _localOnly=true
   - DESPUÉS: localId + remoteId, _localOnly=false
2. En la UI → Movimientos:
   - VES el mismo movimiento UNA sola vez (no dos)
   - El remoteId está asignado
```

**Esperado**:
- ✅ Un solo documento por operación (no duplicados)
- ✅ Campo remoteId asignado por servidor
- ✅ En lista de UI: no hay duplicados

---

## 🎯 Resultados Esperados (✅ Todos Deben Pasar)

| Criterio | Offline | Online | Status |
|----------|---------|--------|--------|
| Crear movimiento | <100ms ✅ | Auto-sync ✅ | ✅ |
| Crear pesaje | <100ms ✅ | Auto-sync ✅ | ✅ |
| Cálculos locales (UA, avgWeight) | Sí ✅ | Sí ✅ | ✅ |
| IndexedDB persiste | Sí ✅ | Sí ✅ | ✅ |
| Indicador actualiza | Sí ✅ | Sí ✅ | ✅ |
| Merge sin duplicados | N/A | Sí ✅ | ✅ |
| Network requests | N/A | Visibles ✅ | ✅ |
| Errores manejados | Graceful ✅ | Graceful ✅ | ✅ |

---

## 🐛 Troubleshooting

### Si IndexedDB está vacío
```
→ Abre Console (F12 → Console)
→ Ejecuta: window.localStorage.clear()
→ Recarga: F5
→ Crea nuevamente un movimiento
```

### Si el indicador no actualiza
```
→ Verifica que useOfflineSync hook esté montado
→ En Console: console.log(navigator.onLine)
→ Desconecta/reconecta red manualmente
```

### Si no ves requests en Network
```
→ Verifica que estés Online primero
→ En Console: Ejecuta window.location.reload()
→ Intenta crear otra operación
```

### Si hay duplicados
```
→ Verifica que el merge en servicios usa remoteId
→ En IndexedDB: Busca documentos con mismo remoteId
→ Valida que la deduplicación está activa
```

---

## 📊 Estado Actual

```
Infrastructure:
✅ RxDB + Dexie configurado
✅ Sync motor con retry logic
✅ useOfflineSync hook activo
✅ OfflineIndicator con 4 estados

Services:
✅ forage.service.ts (refactorado)
✅ movement.service.ts (refactorado)
✅ weighing.service.ts (refactorado)

Error Handling:
✅ api-error-handler.ts (centralizado)
✅ api-client.ts (interceptores mejorados)

Build:
✅ npm run build: 0 errores
✅ Dev server: Corriendo en :3001
✅ Tipos: Todos válidos
```

---

## 🎉 Conclusión

Una vez completes TODOS los pasos y TODOS los criterios pasan ✅:

**FELICITACIONES 🚀**

Acabas de implementar arquitectura Offline-First **profesional** que:
- ✅ Funciona sin internet
- ✅ Persiste datos en IndexedDB
- ✅ Sincroniza automáticamente
- ✅ Maneja errores elegantemente
- ✅ Proporciona feedback visual
- ✅ Previene duplicados

**Esto es software de clase mundial.** 🌍🐄

---

**Próximos Pasos Opcionales:**
1. Integración de más servicios (fincas, potreros, lotes)
2. PWA (Progressive Web App)
3. Sincronización bidireccional (servidor → cliente)
4. Tests E2E con Cypress
5. Monitoreo de syncing en production
