# 🚀 Iniciando Épica 12: Refactor movement.service.ts y weighing.service.ts

**Estado:** Listo para ejecutar  
**Estimado:** 2-3 horas  
**Dependencia:** Épica 1 (✅ COMPLETADA)

---

## 📋 Resumen Ejecutivo

Aplicar exactamente el mismo patrón **offline-first** que implementamos en `forage.service.ts` a:
1. `apps/web/src/services/movement.service.ts`
2. `apps/web/src/services/weighing.service.ts`

Esto permitirá a los usuarios registrar **movimientos de lotes** y **pesajes** sin internet, igual que aforos.

---

## 📂 Antes de Empezar

### ✅ Verificar que tienes:
```bash
# 1. Épica 1 en tu rama
git log --oneline | head -5
# Deberías ver commits: a1593ff, a1593ff, c1b2601, d45a6c3, c3af5c5

# 2. Offline infrastructure existente
ls -la apps/web/src/lib/offline/
# schemas.ts, db.ts, sync-replicator.ts, db.ts ✅

# 3. Forage.service.ts ya refactorizado
cat apps/web/src/services/forage.service.ts | grep "enqueueSyncOperation"
# Debería salir ✅
```

### 📚 Lectura previa (5 minutos)
1. [QUICK_REFERENCE_OFFLINE_FIRST.md](QUICK_REFERENCE_OFFLINE_FIRST.md) — Cheatsheet
2. [apps/web/src/services/forage.service.ts](apps/web/src/services/forage.service.ts) — Template actual

---

## 🎯 Tarea 12.1: Refactor movement.service.ts

### Paso 1: Analizar Estructuras Actuales

```bash
# Ver cómo está ahora
code apps/web/src/services/movement.service.ts

# Ver schema que creamos en Épica 1
code apps/web/src/lib/offline/schemas.ts
# Buscar: movementSchema
```

### Paso 2: Refactorizar createMovement()

**Antes (sync-first):**
```typescript
export async function createMovement(
  request: CreateMovementRequest
): Promise<MovementResponse> {
  const response = await apiClient.post('/movements', request);
  return response;
}
```

**Después (offline-first):**
```typescript
import { getDb } from '@lib/offline/db';
import { enqueueSyncOperation } from '@lib/offline/sync-replicator';

export async function createMovement(
  request: CreateMovementRequest
): Promise<MovementResponse> {
  const db = await getDb();
  const localId = `movement_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const now = new Date().toISOString();

  // 1️⃣ Guardar LOCALMENTE primero
  const movementDoc: MovementDoc = {
    localId,
    herdId: request.herdId,
    paddockId: request.paddockId,
    farmId: request.farmId,
    entryDate: `${request.entryDate}T00:00:00.000Z`,
    estimatedExitDate: request.estimatedExitDate
      ? `${request.estimatedExitDate}T00:00:00.000Z`
      : null,
    status: 'ACTIVE',
    syncStatus: 'pending',
    createdAt: now,
    updatedAt: now,
  };

  await db.movements.insert(movementDoc);

  // 2️⃣ Encolar sincronización
  await enqueueSyncOperation({
    entity: 'movement',        // Mapea en sync-replicator.ts
    operation: 'CREATE',
    localId,
    payload: {
      herdId: request.herdId,
      paddockId: request.paddockId,
      entryDate: movementDoc.entryDate,
      exitDate: movementDoc.estimatedExitDate,
      notes: request.notes || null,
    },
  });

  // 3️⃣ Respuesta optimista inmediata
  return {
    id: localId,
    herdId: request.herdId,
    paddockId: request.paddockId,
    farmId: request.farmId,
    entryDate: request.entryDate,
    estimatedExitDate: request.estimatedExitDate || null,
    status: 'ACTIVE',
    syncStatus: 'pending', // 🔴 Mostrar esto en formulario
  };
}
```

### Paso 3: Refactorizar getByHerd()

**Antes:**
```typescript
export async function getByHerd(herdId: string) {
  return await apiClient.get(`/herds/${herdId}/movements`);
}
```

**Después:**
```typescript
export async function getByHerd(herdId: string) {
  const db = await getDb();

  // 1️⃣ Obtener LOCAL (pendientes + synced)
  const localMovements = await db.movements
    .find({ selector: { herdId } })
    .exec();

  // 2️⃣ Obtener REMOTO (si hay red)
  let remoteMovements: MovementResponse[] = [];
  if (navigator.onLine) {
    try {
      remoteMovements = await apiClient.get(`/herds/${herdId}/movements`);
    } catch (error) {
      console.warn('Remote fetch failed, using local data');
    }
  }

  // 3️⃣ COMBINAR inteligentemente
  const merged = [
    ...localMovements.map(doc => doc.toMutableJSON()),
    ...remoteMovements.filter(
      remote =>
        !localMovements.some(
          local => local.remoteId === remote.id
        )
    ),
  ];

  // 4️⃣ ORDENAR por entryDate (más recientes primero)
  return merged.sort((a, b) =>
    new Date(b.entryDate).getTime() -
    new Date(a.entryDate).getTime()
  );
}
```

### Paso 4: Refactorizar getActiveMovements()

Aplicar mismo patrón (local → remoto → merge)

---

## 🎯 Tarea 12.2: Refactor weighing.service.ts

### Paso 1: Analizar Estructura

```bash
code apps/web/src/services/weighing.service.ts
code apps/web/src/lib/offline/schemas.ts
# Buscar: weighingSchema
```

### Paso 2: Refactorizar createWeighing()

**Patrón (identical a movement):**

```typescript
export async function createWeighing(
  request: CreateWeighingRequest
): Promise<WeighingResponse> {
  const db = await getDb();
  const localId = `weighing_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const now = new Date().toISOString();

  // 1️⃣ Guardar LOCALMENTE
  const weighingDoc: WeighingDoc = {
    localId,
    herdId: request.herdId,
    farmId: request.farmId,
    numberOfAnimals: request.numberOfAnimals,
    totalWeightKg: request.totalWeightKg,
    averageWeightKg: request.totalWeightKg / request.numberOfAnimals, // 📐 Calcular localmente
    newHerdUA: calculateUA(
      request.totalWeightKg / request.numberOfAnimals
    ),
    weightDate: `${request.weightDate}T00:00:00.000Z`,
    notes: request.notes || null,
    syncStatus: 'pending',
    createdAt: now,
    updatedAt: now,
  };

  await db.weighings.insert(weighingDoc);

  // 2️⃣ Encolar
  await enqueueSyncOperation({
    entity: 'weighing',
    operation: 'CREATE',
    localId,
    payload: {
      herdId: request.herdId,
      numberOfAnimals: request.numberOfAnimals,
      totalWeightKg: request.totalWeightKg,
      weightDate: weighingDoc.weightDate,
      notes: request.notes || null,
    },
  });

  // 3️⃣ Respuesta optimista
  return {
    id: localId,
    herdId: request.herdId,
    farmId: request.farmId,
    numberOfAnimals: request.numberOfAnimals,
    totalWeightKg: request.totalWeightKg,
    averageWeightKg: weighingDoc.averageWeightKg,
    newHerdUA: weighingDoc.newHerdUA,
    weightDate: request.weightDate,
    syncStatus: 'pending',
  };
}
```

### Paso 3: Refactorizar getByHerd()

Mismo merge pattern:

```typescript
export async function getByHerd(herdId: string) {
  const db = await getDb();

  const localWeighings = await db.weighings
    .find({ selector: { herdId } })
    .exec();

  let remoteWeighings: WeighingResponse[] = [];
  if (navigator.onLine) {
    try {
      remoteWeighings = await apiClient.get(
        `/herds/${herdId}/weighings`
      );
    } catch (error) {
      console.warn('Remote fetch failed, using local');
    }
  }

  const merged = [
    ...localWeighings.map(doc => doc.toMutableJSON()),
    ...remoteWeighings.filter(
      remote => !localWeighings.some(local => local.remoteId === remote.id)
    ),
  ];

  return merged.sort((a, b) =>
    new Date(b.weightDate).getTime() -
    new Date(a.weightDate).getTime()
  );
}
```

---

## 🔌 Paso 5: Mapear Entities en sync-replicator.ts

Abrir: `apps/web/src/lib/offline/sync-replicator.ts`

Buscar función `processSyncQueue()` y localizar:

```typescript
const endpointMap: Record<string, string> = {
  forage: '/forage-samples',
  // ↓ Agregar estas 2 líneas
  movement: '/movements',
  weighing: '/weighings',
};
```

---

## ✅ Validación: Testing Manual

### Test 1: Crear movimiento SIN internet

```bash
# 1. Abrir DevTools → Network → Offline
# 2. Crear movimiento (formulario)
# 3. ✅ Debe aparecer inmediatamente con ⏳ Pendiente
# 4. Abrir DevTools → Application → IndexedDB → movements
# 5. ✅ Ver item con syncStatus: 'pending'
```

### Test 2: Sincronizar automáticamente

```bash
# 1. Conectar a internet (Network → Online)
# 2. ✅ Indicador debe cambiar de 🔴 a 🟢
# 3. ✅ Status del movimiento: ⏳ → ✅
# 4. Verificar en servidor que llegó
```

### Test 3: Merge de local + remoto

```bash
# 1. Crear movimiento OFFLINE
# 2. Mientras está pendiente, servidor crea otro movimiento
# 3. Conectar a internet
# 4. ✅ Ambos movimientos aparecen en lista
# 5. ✅ Sin duplicados
```

### Test 4: Manejo de errores

```bash
# 1. Crear movimiento OFFLINE
# 2. Conectar internet CON servidor apagado (simular 500)
# 3. ✅ Status: 🔴 Error
# 4. ✅ Reintentos automáticos (ver DevTools console)
# 5. Encender servidor
# 6. ✅ Se sincroniza automáticamente en siguiente reintento
```

---

## 📊 Checklist de Finalización

### Código
- [ ] createMovement() guarda local + enqueue + optimistic response
- [ ] getByHerd() hace merge local + remoto
- [ ] createWeighing() implementa mismo patrón
- [ ] getByHerd() en weighing.service.ts hace merge
- [ ] sync-replicator.ts mapea 'movement' y 'weighing' correctamente
- [ ] Cálculos locales (averageWeightKg, newHerdUA) funcionan

### Testing
- [ ] Crear movimiento offline → aparece con ⏳
- [ ] Crear pesaje offline → aparece con ⏳
- [ ] Reconectar internet → sincronizan automáticamente
- [ ] Merge sin duplicados
- [ ] Errores reintentan automáticamente
- [ ] Indicador offline actualiza correctamente

### Calidad
- [ ] Build: `npm run build` → ✅ 0 errores
- [ ] Linting: No importa @shared directamente
- [ ] No hay console.error sobre TypeScript
- [ ] Tipos están correctos (no any)

### Documentación
- [ ] Cambios comentados si es lógica compleja
- [ ] Funciones siguen patrón forage.service.ts
- [ ] PR/Commit message claro

---

## 🔨 Ejecución Paso a Paso

### Duración: ~2-3 horas

```
00:00 — Leer esta guía + QUICK_REFERENCE_OFFLINE_FIRST.md
00:15 — Refactorizar movement.service.ts
00:45 — Refactorizar weighing.service.ts
01:15 — Mapear entities en sync-replicator.ts
01:30 — Testing manual (4 escenarios)
02:00 — Build + Linting
02:15 — Commit + Push
02:30 — Code review
```

### Comandos Rápidos

```bash
# 1. Crear rama
git checkout -b feat/epic-12-refactor-services

# 2. Trabajar en archivos
code apps/web/src/services/movement.service.ts
code apps/web/src/services/weighing.service.ts
code apps/web/src/lib/offline/sync-replicator.ts

# 3. Verificar cambios
git diff apps/web/src/services/

# 4. Build
cd apps/web && npm run build

# 5. Commit
git add apps/web/src/services/
git add apps/web/src/lib/offline/sync-replicator.ts
git commit -m "feat: epic-12 refactorizar movement.service.ts y weighing.service.ts a offline-first"

# 6. Push
git push origin feat/epic-12-refactor-services

# 7. Crear PR en GitHub
# → https://github.com/CSA-DanielVillamizar/ganaderia-regenerativa/pull/new/feat/epic-12-refactor-services
```

---

## 🎓 Patrón Template Completo

### Crear Entidad (offline-first)

```typescript
// ✅ PATRÓN CORRECTO

export async function create<T>(request: CreateRequest): Promise<ResponseDTO> {
  const db = await getDb();
  const localId = generateLocalId();
  const now = new Date().toISOString();

  // Paso 1: Guardar localmente
  await db.collection.insert({
    localId,
    ...request,
    syncStatus: 'pending',
    createdAt: now,
    updatedAt: now,
  });

  // Paso 2: Encolar
  await enqueueSyncOperation({
    entity: 'myentity',  // Mapear en sync-replicator.ts
    operation: 'CREATE',
    localId,
    payload: request,
  });

  // Paso 3: Respuesta optimista
  return {
    id: localId,
    ...request,
    syncStatus: 'pending', // Mostrar en UI
  };
}
```

### Leer Entidades (merge inteligente)

```typescript
export async function getByFilter(filter: string): Promise<DTO[]> {
  const db = await getDb();

  // Paso 1: Local
  const local = await db.collection
    .find({ selector: { /* filtro */ } })
    .exec();

  // Paso 2: Remoto (si online)
  let remote = [];
  if (navigator.onLine) {
    try {
      remote = await apiClient.get(`/endpoint?filter=${filter}`);
    } catch {}
  }

  // Paso 3: Merge
  const merged = [
    ...local.map(d => d.toMutableJSON()),
    ...remote.filter(r => !local.some(l => l.remoteId === r.id)),
  ];

  // Paso 4: Sort + return
  return merged.sort((a, b) => /* tu lógica */);
}
```

---

## 📞 Support & Questions

Si encuentras problemas:

1. **Offline no funciona:** 
   - Revisar [OFFLINE_FIRST_GUIDE.md #Debugging](OFFLINE_FIRST_GUIDE.md#testing-y-debugging)
   - DevTools → Application → IndexedDB

2. **Sync no dispara:**
   - Revisar `initNetworkSync()` se ejecutó
   - Verificar console para errors

3. **Merge crea duplicados:**
   - Revisar `remoteId` está en schema
   - Condición de deduplicación correcta

4. **Build falla:**
   - `npm install` limpio
   - `npm run build` con verbosity: `-VV`

---

## 🎉 Al Finalizar

```bash
# Verificar que todo está bien
npm run build
git log --oneline | head -3
# Deberías ver tu commit nuevo

# Push a GitHub
git push origin feat/epic-12-refactor-services

# Crear PR para code review
# Mencionar: "Closes #epic-12" en descripción
```

---

**¡Éxito!**

Esta refactorización completa **Épica 1.5** y deja el app 100% offline-first para las 3 funcionalidades principales (aforos, movimientos, pesajes).

**Próxima épica:** Épica 2 (Lógica Agronómica) — Ver [ROADMAP_EPICS_12_PLUS.md](ROADMAP_EPICS_12_PLUS.md)

---

**Fecha de creación:** 12 de enero de 2026  
**Mantenedor:** Build Engineering  
**Status:** Ready to Execute ✅
