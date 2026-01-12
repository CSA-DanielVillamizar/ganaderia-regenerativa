/**
 * Servicio de Pesajes (Weighing)
 *
 * Implementa patrón Offline-First para registrar pesajes de lotes.
 * - Creación: localId + cálculos locales (UA, averageWeight) + insert RxDB + enqueue
 * - Lectura: merge local + remoto sin duplicados
 * - Historia: pesajes históricos con análisis de ganancia
 */

import { v4 as uuidv4 } from 'uuid';
import { getDb, enqueueSyncOperation } from '@/lib/offline/sync-replicator';
import { apiClient } from '@/lib/api-client';

/**
 * Interfaz para Pesaje
 */
export interface Weighing {
  localId: string;
  remoteId?: string;
  herdId: string;
  farmId: string;
  weighDate: string; // ISO 8601
  numberOfAnimals: number;
  totalWeightKg: number;
  averageWeightKg?: number;
  newHerdUA?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  _syncStatus?: 'pending' | 'synced' | 'failed';
  _localOnly?: boolean;
}

/**
 * Interfaz para histórico de ganancia de peso
 */
export interface WeightGain {
  previousWeighing: Weighing;
  currentWeighing: Weighing;
  gainKg: number;
  gainPerDay: number;
  daysElapsed: number;
}

/**
 * Crea un nuevo pesaje (local-first)
 *
 * Calcula averageWeight y UA localmente antes de sincronizar.
 *
 * @param herdId ID del lote
 * @param farmId ID de la finca
 * @param weighDate Fecha pesaje en ISO 8601
 * @param numberOfAnimals Cantidad de animales
 * @param totalWeightKg Peso total en kg
 * @param notes Notas opcionales
 * @returns Pesaje creado con cálculos
 */
export async function createWeighing(
  herdId: string,
  farmId: string,
  weighDate: string,
  numberOfAnimals: number,
  totalWeightKg: number,
  notes?: string
): Promise<Weighing> {
  const localId = uuidv4();
  const now = new Date().toISOString();

  // Cálculos locales
  const averageWeightKg = calculateAverageWeight(totalWeightKg, numberOfAnimals);
  const newHerdUA = calculateUA(numberOfAnimals, averageWeightKg);

  const weighing: Weighing = {
    localId,
    herdId,
    farmId,
    weighDate,
    numberOfAnimals,
    totalWeightKg,
    averageWeightKg,
    newHerdUA,
    notes,
    createdAt: now,
    updatedAt: now,
    _syncStatus: 'pending',
    _localOnly: true,
  };

  try {
    // 1. Insertar en RxDB
    const db = getDb();
    await db.weighings.insert(weighing);

    // 2. Encolar para sincronización
    await enqueueSyncOperation('Weighing', 'CREATE', weighing);

    // 3. Retornar respuesta optimista
    return weighing;
  } catch (error) {
    console.error('Error creating weighing:', error);
    throw error;
  }
}

/**
 * Obtiene pesajes de un lote (merge local + remoto)
 *
 * @param herdId ID del lote
 * @returns Array de pesajes sin duplicados
 */
export async function getByHerd(herdId: string): Promise<Weighing[]> {
  try {
    // 1. Obtener del storage local (RxDB)
    const db = getDb();
    const localWeighings = await db.weighings.find({ selector: { herdId } }).exec();

    // 2. Intentar obtener del servidor
    let remoteWeighings: Weighing[] = [];
    try {
      const response = await apiClient.get(`/weighings/herd/${herdId}`);
      remoteWeighings = response.data || [];
    } catch {
      console.warn('Could not fetch remote weighings, using local only');
    }

    // 3. Merge: combinar sin duplicados (local toma precedencia)
    const localMap = new Map(localWeighings.map((w) => [w.remoteId || w.localId, w]));
    remoteWeighings.forEach((remote) => {
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
      (a, b) => new Date(b.weighDate).getTime() - new Date(a.weighDate).getTime()
    );
  } catch (error) {
    console.error('Error fetching weighings by herd:', error);
    throw error;
  }
}

/**
 * Obtiene histórico de pesajes con limite
 *
 * Útil para análisis de tendencias y ganancia.
 *
 * @param herdId ID del lote
 * @param limit Máximo número de pesajes (default 10)
 * @returns Array de pesajes más recientes
 */
export async function getHistory(herdId: string, limit: number = 10): Promise<Weighing[]> {
  try {
    const db = getDb();
    const local = await db.weighings
      .find({ selector: { herdId } })
      .sort({ weighDate: 'desc' })
      .limit(limit)
      .exec();

    // Intentar obtener remotos
    try {
      const response = await apiClient.get(`/weighings/herd/${herdId}/history?limit=${limit}`);
      const remotes = response.data || [];

      const localMap = new Map(local.map((w) => [w.remoteId || w.localId, w]));
      remotes.forEach((remote: any) => {
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

      return Array.from(localMap.values())
        .sort((a, b) => new Date(b.weighDate).getTime() - new Date(a.weighDate).getTime())
        .slice(0, limit);
    } catch {
      return local;
    }
  } catch (error) {
    console.error('Error fetching weighing history:', error);
    throw error;
  }
}

/**
 * Obtiene el pesaje más reciente de un lote
 *
 * @param herdId ID del lote
 * @returns Pesaje más reciente o undefined
 */
export async function getLatest(herdId: string): Promise<Weighing | undefined> {
  try {
    const db = getDb();
    const latest = await db.weighings
      .findOne({ selector: { herdId } })
      .sort({ weighDate: 'desc' })
      .exec();

    if (!latest) {
      // Intentar obtener del servidor
      try {
        const response = await apiClient.get(`/weighings/herd/${herdId}/latest`);
        return response.data;
      } catch {
        return undefined;
      }
    }

    return latest;
  } catch (error) {
    console.error('Error fetching latest weighing:', error);
    return undefined;
  }
}

/**
 * Calcula el promedio de peso por animal
 *
 * @param totalWeightKg Peso total
 * @param numberOfAnimals Cantidad de animales
 * @returns Peso promedio por animal
 */
export function calculateAverageWeight(totalWeightKg: number, numberOfAnimals: number): number {
  if (numberOfAnimals === 0) return 0;
  return Math.round((totalWeightKg / numberOfAnimals) * 100) / 100;
}

/**
 * Calcula Unidades Animal (UA) para el lote
 *
 * UA = (numeroAnimales * pesoPromedio) / 450
 *
 * @param numberOfAnimals Cantidad de animales
 * @param averageWeightKg Peso promedio
 * @returns Unidades Animal
 */
export function calculateUA(numberOfAnimals: number, averageWeightKg: number): number {
  const ua = (numberOfAnimals * averageWeightKg) / 450;
  return Math.round(ua * 100) / 100;
}

/**
 * Calcula ganancia de peso entre dos pesajes
 *
 * @param previous Pesaje anterior
 * @param current Pesaje actual
 * @returns Objeto con ganancia total y por día
 */
export function calculateWeightGain(previous: Weighing, current: Weighing): WeightGain {
  const daysElapsed =
    (new Date(current.weighDate).getTime() - new Date(previous.weighDate).getTime()) /
    (1000 * 60 * 60 * 24);

  const gainKg = current.totalWeightKg - previous.totalWeightKg;
  const gainPerDay = daysElapsed > 0 ? gainKg / daysElapsed : 0;

  return {
    previousWeighing: previous,
    currentWeighing: current,
    gainKg: Math.round(gainKg * 100) / 100,
    gainPerDay: Math.round(gainPerDay * 100) / 100,
    daysElapsed: Math.round(daysElapsed),
  };
}
