/**
 * Servicio de Movimientos de Lotes
 *
 * Implementa patrón Offline-First para registrar movimientos de lotes entre potreros.
 * - Creación: localId + insert RxDB + enqueue + respuesta optimista
 * - Lectura: merge local + remoto sin duplicados
 * - Actualización: find/fetch + patch status + enqueue
 */

import { v4 as uuidv4 } from 'uuid';
import { getDb, enqueueSyncOperation } from '@/lib/offline/sync-replicator';
import { apiClient } from '@/lib/api-client';

/**
 * Interfaz para Movimiento de Lote
 */
export interface Movement {
  localId: string;
  remoteId?: string;
  herdId: string;
  farmId: string;
  fromPaddockId: string;
  toPaddockId: string;
  status: 'ACTIVE' | 'CLOSED';
  entryDate: string; // ISO 8601
  actualExitDate?: string; // ISO 8601
  occupancyDays?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  _syncStatus?: 'pending' | 'synced' | 'failed';
  _localOnly?: boolean;
}

/**
 * Crea un nuevo movimiento de lote (local-first)
 *
 * @param herdId ID del lote
 * @param farmId ID de la finca
 * @param fromPaddockId ID potrero origen
 * @param toPaddockId ID potrero destino
 * @param entryDate Fecha entrada en ISO 8601
 * @param notes Notas opcionales
 * @returns Movimiento creado (respuesta optimista)
 */
export async function createMovement(
  herdId: string,
  farmId: string,
  fromPaddockId: string,
  toPaddockId: string,
  entryDate: string,
  notes?: string
): Promise<Movement> {
  const localId = uuidv4();
  const now = new Date().toISOString();

  const movement: Movement = {
    localId,
    herdId,
    farmId,
    fromPaddockId,
    toPaddockId,
    status: 'ACTIVE',
    entryDate,
    notes,
    createdAt: now,
    updatedAt: now,
    _syncStatus: 'pending',
    _localOnly: true,
  };

  try {
    // 1. Insertar en RxDB
    const db = getDb();
    await db.movements.insert(movement);

    // 2. Encolar para sincronización
    await enqueueSyncOperation('Movement', 'CREATE', movement);

    // 3. Retornar respuesta optimista (sin esperar sync)
    return movement;
  } catch (error) {
    console.error('Error creating movement:', error);
    throw error;
  }
}

/**
 * Obtiene movimientos de una finca (merge local + remoto)
 *
 * @param farmId ID de la finca
 * @returns Array de movimientos sin duplicados
 */
export async function getByFarm(farmId: string): Promise<Movement[]> {
  try {
    // 1. Obtener del storage local (RxDB)
    const db = getDb();
    const localMovements = await db.movements.find({ selector: { farmId } }).exec();

    // 2. Intentar obtener del servidor
    let remoteMovements: Movement[] = [];
    try {
      const response = await apiClient.get(`/movements/farm/${farmId}`);
      remoteMovements = response.data || [];
    } catch {
      // Si falla, solo usar local
      console.warn('Could not fetch remote movements, using local only');
    }

    // 3. Merge: combinar sin duplicados (local toma precedencia)
    const localMap = new Map(localMovements.map((m) => [m.remoteId || m.localId, m]));
    remoteMovements.forEach((remote) => {
      const key = remote.remoteId || (remote as any).id;
      if (!localMap.has(key)) {
        localMap.set(key, {
          ...remote,
          _syncStatus: 'synced',
          _localOnly: false,
        });
      }
    });

    return Array.from(localMap.values()).sort(
      (a, b) => new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime()
    );
  } catch (error) {
    console.error('Error fetching movements by farm:', error);
    throw error;
  }
}

/**
 * Obtiene movimientos de un lote específico
 *
 * @param herdId ID del lote
 * @returns Array de movimientos del lote
 */
export async function getByHerd(herdId: string): Promise<Movement[]> {
  try {
    const db = getDb();
    const movements = await db.movements.find({ selector: { herdId } }).exec();

    // Intentar actualizar con datos remotos
    try {
      const response = await apiClient.get(`/movements/herd/${herdId}`);
      const remoteMovements = response.data || [];

      // Merge simple para herd-specific
      const localMap = new Map(movements.map((m) => [m.remoteId || m.localId, m]));
      remoteMovements.forEach((remote: any) => {
        const key = remote.remoteId || remote.id;
        if (!localMap.has(key)) {
          localMap.set(key, {
            ...remote,
            remoteId: remote.id,
            _syncStatus: 'synced',
            _localOnly: false,
          });
        }
      });

      return Array.from(localMap.values()).sort(
        (a, b) => new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime()
      );
    } catch {
      // Si falla, retornar local
      return movements.sort(
        (a, b) => new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime()
      );
    }
  } catch (error) {
    console.error('Error fetching movements by herd:', error);
    throw error;
  }
}

/**
 * Obtiene el movimiento activo de un lote
 *
 * @param herdId ID del lote
 * @returns Movimiento activo o undefined
 */
export async function getActiveMovement(herdId: string): Promise<Movement | undefined> {
  try {
    const db = getDb();
    const active = await db.movements.findOne({ selector: { herdId, status: 'ACTIVE' } }).exec();

    return active;
  } catch (error) {
    console.error('Error fetching active movement:', error);
    return undefined;
  }
}

/**
 * Cierra un movimiento (UPDATE pattern)
 */
export async function closeMovement(movementId: string, actualExitDate: string): Promise<Movement> {
  try {
    const db = getDb();

    // 1. Intentar encontrar localmente
    let movement = await db.movements.findOne(movementId).exec();

    // 2. Si no existe local, intentar obtener del servidor por remoteId
    if (!movement) {
      try {
        const response = await apiClient.get(`/movements/${movementId}`);
        movement = {
          ...response.data,
          remoteId: response.data.id,
          _syncStatus: 'synced',
          _localOnly: false,
        };
        // Insertar en local para futuras operaciones
        await db.movements.insert(movement);
      } catch {
        throw new Error('Movement not found');
      }
    }

    // 3. Actualizar status
    const now = new Date().toISOString();
    const occupancyDays = calculateOccupancyDays(movement.entryDate, actualExitDate);

    const updated = {
      ...movement,
      status: 'CLOSED' as const,
      actualExitDate,
      occupancyDays,
      updatedAt: now,
      _syncStatus: 'pending' as const,
    };

    // 4. Guardar localmente
    await db.movements.atomicUpdate(movementId, () => updated);

    // 5. Encolar para sincronización (como UPDATE)
    await enqueueSyncOperation('Movement', 'UPDATE', updated);

    return updated;
  } catch (error) {
    console.error('Error closing movement:', error);
    throw error;
  }
}

/**
 * Calcula días de ocupación entre entrada y salida
 */
export function calculateOccupancyDays(entryDate: string, exitDate: string): number {
  const entry = new Date(entryDate);
  const exit = new Date(exitDate);
  const diffTime = Math.abs(exit.getTime() - entry.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Formatea fecha a string DD/MM/YYYY
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}
