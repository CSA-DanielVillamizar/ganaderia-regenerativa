/**
 * Inicialización de RxDB
 * Singleton que proporciona acceso a la base de datos offline
 * Solo se instancia en el cliente (navegador)
 */

import { createRxDatabase, addRxPlugin } from 'rxdb';
import type { RxDatabase, RxCollection } from 'rxdb';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';
import { forageSchema, movementSchema, weighingSchema, syncQueueSchema } from './schemas';

/**
 * Tipos para las colecciones RxDB
 */
export interface ForageDoc {
  localId: string;
  paddockId: string;
  farmId: string;
  sampleDate: string;
  heightCm: number;
  sampleWeightKg: number;
  drymatterPercent: number;
  kgPerHectare: number;
  category: string;
  status: 'pending' | 'synced' | 'failed';
  remoteId?: string;
  lastError?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MovementDoc {
  localId: string;
  herdId: string;
  paddockId: string;
  farmId: string;
  entryDate: string;
  estimatedExitDate: string;
  actualExitDate?: string;
  status: 'ACTIVE' | 'CLOSED';
  syncStatus: 'pending' | 'synced' | 'failed';
  remoteId?: string;
  lastError?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WeighingDoc {
  localId: string;
  herdId: string;
  farmId: string;
  weighDate: string;
  numberOfAnimals: number;
  totalWeightKg: number;
  averageWeightKg: number;
  status: 'pending' | 'synced' | 'failed';
  remoteId?: string;
  lastError?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SyncQueueDoc {
  id: string;
  entity: 'forage' | 'movement' | 'weighing';
  operation: 'CREATE' | 'UPDATE' | 'DELETE';
  localId: string;
  remoteId?: string;
  payload: Record<string, any>;
  status: 'pending' | 'synced' | 'failed';
  attempts: number;
  maxAttempts: number;
  lastError?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Tipo de la base de datos RxDB
 */
export type GanaderiaDB = RxDatabase<{
  forageSamples: RxCollection<ForageDoc>;
  movements: RxCollection<MovementDoc>;
  weighings: RxCollection<WeighingDoc>;
  syncQueue: RxCollection<SyncQueueDoc>;
}>;

let dbPromise: Promise<GanaderiaDB> | null = null;

/**
 * Obtiene la instancia de la base de datos RxDB
 * Se instancia solo en el cliente (navegador)
 * Usa Dexie como almacenamiento subyacente (IndexedDB wrapper)
 */
export async function getDb(): Promise<GanaderiaDB> {
  // Validar que estamos en el navegador
  if (typeof window === 'undefined') {
    throw new Error('RxDB solo se puede instanciar en el navegador');
  }

  // Retornar promesa existente si ya fue creada
  if (dbPromise) {
    return dbPromise;
  }

  // Crear la base de datos
  dbPromise = (async () => {
    // Crear instancia de la base de datos
    const db = await createRxDatabase<GanaderiaDB>({
      name: 'ganaderia-offline-db',
      storage: getRxStorageDexie(),
      multiInstance: true, // Permite múltiples tabs/windows
      localDocuments: false,
      ignoreDuplicate: true,
    });

    // Añadir las colecciones
    await db.addCollections({
      forageSamples: {
        schema: forageSchema,
      },
      movements: {
        schema: movementSchema,
      },
      weighings: {
        schema: weighingSchema,
      },
      syncQueue: {
        schema: syncQueueSchema,
      },
    });

    console.log('✅ RxDB inicializado exitosamente');

    return db;
  })();

  return dbPromise;
}

/**
 * Cierra la conexión con la base de datos
 * (Úsalo solo en casos especiales como limpieza de tests)
 */
export async function closeDb(): Promise<void> {
  if (dbPromise) {
    const db = await dbPromise;
    await db.destroy();
    dbPromise = null;
  }
}

/**
 * Limpia todos los datos de la base de datos
 * (Úsalo solo para desarrollo/reset)
 */
export async function resetDb(): Promise<void> {
  if (dbPromise) {
    const db = await dbPromise;
    await db.remove();
    dbPromise = null;
  }
}
