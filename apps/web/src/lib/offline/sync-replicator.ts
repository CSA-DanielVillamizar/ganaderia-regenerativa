/**
 * Motor de Sincronización Offline-First
 * Gestiona la cola de operaciones pendientes y las sincroniza con el servidor
 */

import { getDb, SyncQueueDoc } from './db';
import apiClient from '@/lib/api-client';

/**
 * Configuración de reintentos con backoff exponencial
 */
const SYNC_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000, // ms
  backoffMultiplier: 2,
};

/**
 * Mapeo de entidades a endpoints del API
 */
const ENTITY_ENDPOINTS: Record<string, string> = {
  forage: '/forage-samples',
  movement: '/movements',
  weighing: '/weighings',
};

/**
 * Cola global de listeners para cambios en la cola de sync
 */
const syncListeners: Set<() => void> = new Set();

/**
 * Suscribirse a cambios en la cola de sync
 */
export function subscribeSyncQueue(callback: () => void): () => void {
  syncListeners.add(callback);
  return () => {
    syncListeners.delete(callback);
  };
}

/**
 * Notificar a todos los listeners sobre cambios
 */
function notifySyncListeners(): void {
  syncListeners.forEach((callback) => {
    try {
      callback();
    } catch (err) {
      console.error('Error en sync listener:', err);
    }
  });
}

/**
 * Encola una operación de sincronización
 * Guarda la operación en la base de datos local y dispara sync si hay red
 */
export async function enqueueSyncOperation(params: {
  entity: 'forage' | 'movement' | 'weighing';
  operation: 'CREATE' | 'UPDATE' | 'DELETE';
  localId: string;
  payload: Record<string, any>;
}): Promise<SyncQueueDoc> {
  const db = await getDb();
  const now = new Date().toISOString();

  const queueItem: SyncQueueDoc = {
    id: `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    entity: params.entity,
    operation: params.operation,
    localId: params.localId,
    payload: params.payload,
    status: 'pending',
    attempts: 0,
    maxAttempts: SYNC_CONFIG.maxRetries,
    createdAt: now,
    updatedAt: now,
  };

  const insertedDoc = await db.syncQueue.insert(queueItem);
  console.log(`📝 Operación encolada: ${params.entity} ${params.operation}`, insertedDoc.toJSON());

  // Notificar a listeners
  notifySyncListeners();

  // Si hay conexión, disparar sync en background
  if (typeof navigator !== 'undefined' && navigator.onLine) {
    // Usar setTimeout para no bloquear la UI
    setTimeout(() => {
      processSyncQueue().catch((err) => {
        console.error('Error en procesamiento de cola:', err);
      });
    }, 100);
  }

  return insertedDoc.toJSON();
}

/**
 * Procesa la cola de sincronización
 * Intenta enviar todos los items pendientes al servidor
 * Implementa reintentos con backoff exponencial
 */
export async function processSyncQueue(): Promise<void> {
  const db = await getDb();

  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    console.log('📡 Sin conexión. Esperando red para sincronizar...');
    return;
  }

  try {
    // Obtener items pendientes
    const pendingItems = await db.syncQueue.find({ selector: { status: 'pending' } }).exec();

    if (pendingItems.length === 0) {
      console.log('✅ Cola de sync vacía');
      return;
    }

    console.log(`🔄 Procesando ${pendingItems.length} item(s) en la cola...`);

    // Procesar cada item
    for (const item of pendingItems) {
      const itemData = item.toJSON();

      try {
        // Resolver el método HTTP y endpoint
        const method = itemData.operation === 'CREATE' ? 'post' : 'put';
        const endpoint = ENTITY_ENDPOINTS[itemData.entity];

        if (!endpoint) {
          throw new Error(`Entidad no soportada: ${itemData.entity}`);
        }

        // Determinar la URL (CREATE no tiene ID, UPDATE sí)
        const url =
          itemData.operation === 'CREATE'
            ? endpoint
            : itemData.remoteId
              ? `${endpoint}/${itemData.remoteId}`
              : endpoint;

        console.log(`📤 Enviando ${itemData.operation} a ${url}`);

        // Enviar al servidor
        const response = await apiClient[method](url, itemData.payload);

        // Actualizar entidad local con remoteId si es CREATE
        if (itemData.operation === 'CREATE' && response.data?.id) {
          const entityCollection = db[
            itemData.entity === 'forage' ? 'forageSamples' : itemData.entity + 's'
          ] as any;

          const localDoc = await entityCollection.findOne(itemData.localId).exec();
          if (localDoc) {
            await localDoc.patch({
              remoteId: response.data.id,
              status: 'synced',
              updatedAt: new Date().toISOString(),
            });
          }
        }

        // Marcar como sincronizado
        await item.patch({
          status: 'synced',
          remoteId: response.data?.id,
          attempts: itemData.attempts + 1,
          lastError: undefined,
          updatedAt: new Date().toISOString(),
        });

        console.log(`✅ ${itemData.entity} ${itemData.localId} sincronizado`);
      } catch (error: any) {
        const attempts = itemData.attempts + 1;
        const isMaxedOut = attempts >= SYNC_CONFIG.maxRetries;
        const status = isMaxedOut ? 'failed' : 'pending';

        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          'Error desconocido durante sincronización';

        console.error(
          `❌ Error sincronizando ${itemData.entity}:`,
          errorMessage,
          `(Intento ${attempts}/${SYNC_CONFIG.maxRetries})`
        );

        await item.patch({
          status,
          attempts,
          lastError: errorMessage,
          updatedAt: new Date().toISOString(),
        });

        if (isMaxedOut) {
          console.error(
            `🚨 Item de sync marcado como fallido después de ${SYNC_CONFIG.maxRetries} intentos`
          );
        }
      }

      // Notificar cambios
      notifySyncListeners();
    }

    console.log('✨ Procesamiento de cola finalizado');
  } catch (err) {
    console.error('Error procesando cola de sync:', err);
  }
}

/**
 * Reintenta un item fallido
 * Reinicia los intentos y lo vuelve a marcar como pending
 */
export async function retryFailedItem(itemId: string): Promise<void> {
  const db = await getDb();

  try {
    const item = await db.syncQueue.findOne(itemId).exec();

    if (!item) {
      throw new Error(`Item de sync no encontrado: ${itemId}`);
    }

    await item.patch({
      status: 'pending',
      attempts: 0,
      lastError: undefined,
      updatedAt: new Date().toISOString(),
    });

    console.log(`🔁 Reintentando item: ${itemId}`);
    notifySyncListeners();

    // Si hay conexión, procesar inmediatamente
    if (typeof navigator !== 'undefined' && navigator.onLine) {
      setTimeout(() => {
        processSyncQueue().catch(console.error);
      }, 100);
    }
  } catch (err) {
    console.error('Error reintentando item fallido:', err);
  }
}

/**
 * Obtiene la cantidad de items pendientes
 */
export async function getPendingCount(): Promise<number> {
  const db = await getDb();
  const count = await db.syncQueue
    .find({ selector: { status: 'pending' } })
    .count()
    .exec();
  return count;
}

/**
 * Obtiene los items que fallaron
 */
export async function getFailedItems(): Promise<SyncQueueDoc[]> {
  const db = await getDb();
  const items = await db.syncQueue.find({ selector: { status: 'failed' } }).exec();
  return items.map((item) => item.toJSON());
}

/**
 * Obtiene el estado actual de la cola
 */
export async function getSyncStatus(): Promise<{
  pending: number;
  synced: number;
  failed: number;
  lastSyncTime?: string;
}> {
  const db = await getDb();

  const [pending, synced, failed] = await Promise.all([
    db.syncQueue
      .find({ selector: { status: 'pending' } })
      .count()
      .exec(),
    db.syncQueue
      .find({ selector: { status: 'synced' } })
      .count()
      .exec(),
    db.syncQueue
      .find({ selector: { status: 'failed' } })
      .count()
      .exec(),
  ]);

  const lastSyncedItem = await db.syncQueue
    .find({ selector: { status: 'synced' } })
    .sort({ updatedAt: 'desc' })
    .limit(1)
    .exec();

  return {
    pending,
    synced,
    failed,
    lastSyncTime: lastSyncedItem[0]?.toJSON().updatedAt,
  };
}

/**
 * Limpiar items sincronizados (opcional, para no saturar la BD)
 * Por defecto, mantiene los últimos 100 items sincronizados
 */
export async function cleanupSyncedItems(keepCount: number = 100): Promise<number> {
  const db = await getDb();

  const syncedItems = await db.syncQueue
    .find({ selector: { status: 'synced' } })
    .sort({ updatedAt: 'desc' })
    .exec();

  if (syncedItems.length <= keepCount) {
    return 0;
  }

  const toDelete = syncedItems.slice(keepCount);
  let deleted = 0;

  for (const item of toDelete) {
    await item.remove();
    deleted++;
  }

  console.log(`🗑️ Limpiados ${deleted} items sincronizados`);
  return deleted;
}

/**
 * Inicializar listeners de eventos de red
 * Llama esto una sola vez en el layout/app
 */
export function initNetworkSync(): void {
  if (typeof window === 'undefined') {
    return;
  }

  const onOnline = () => {
    console.log('🌐 Conexión restaurada. Sincronizando...');
    processSyncQueue().catch(console.error);
  };

  const onOffline = () => {
    console.log('📵 Sin conexión. Modo offline activado.');
  };

  window.addEventListener('online', onOnline);
  window.addEventListener('offline', onOffline);

  console.log('🔌 Listeners de red inicializados');
}
