/**
 * Servicio Offline-First para operaciones de Aforo
 * Almacena localmente primero, luego sincroniza cuando hay conexión
 */

import { getDb, ForageDoc } from '@/lib/offline/db';
import { enqueueSyncOperation } from '@/lib/offline/sync-replicator';

export interface CreateForageRequest {
  farmId: string;
  paddockId: string;
  sampleDate: string; // YYYY-MM-DD
  heightCm: number;
  sampleWeightKg: number;
  drymatterPercent: number; // 0-100
}

export interface ForageResponse {
  id: string;
  farmId: string;
  paddockId: string;
  sampleDate: string;
  heightCm: number;
  sampleWeightKg: number;
  drymatterPercent: number;
  kgPerHectare: number;
  category: 'EXCELENTE' | 'BUENO' | 'REGULAR' | 'DEFICIENTE';
  status?: 'pending' | 'synced' | 'failed';
}

/**
 * Crea un aforo guardándolo primero en la BD local
 * Devuelve respuesta optimista inmediatamente y luego sincroniza en background
 */
export async function createForage(request: CreateForageRequest): Promise<ForageResponse> {
  // Calcular derivados
  const isoSampleDate = `${request.sampleDate}T00:00:00.000Z`;
  const kgPerHectare = calculateKgPerHectare(request.sampleWeightKg, request.drymatterPercent);
  const category = categorizeForage(kgPerHectare);
  const localId = `forage_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const now = new Date().toISOString();

  // Preparar payload para sincronizar
  const payload = {
    paddockId: request.paddockId,
    kgPerHectare,
    dryMatter: request.drymatterPercent,
    sampleDate: isoSampleDate,
  };

  // Guardar en la BD local (IndexedDB)
  const db = await getDb();
  const forageDoc: ForageDoc = {
    localId,
    paddockId: request.paddockId,
    farmId: request.farmId,
    sampleDate: isoSampleDate,
    heightCm: request.heightCm,
    sampleWeightKg: request.sampleWeightKg,
    drymatterPercent: request.drymatterPercent,
    kgPerHectare,
    category,
    status: 'pending',
    createdAt: now,
    updatedAt: now,
  };

  await db.forageSamples.insert(forageDoc);
  console.log('✅ Aforo guardado localmente:', localId);

  // Encolar para sincronización
  await enqueueSyncOperation({
    entity: 'forage',
    operation: 'CREATE',
    localId,
    payload,
  });

  // Devolver respuesta optimista inmediatamente (UI rápida)
  return {
    id: localId,
    farmId: request.farmId,
    paddockId: request.paddockId,
    sampleDate: request.sampleDate,
    heightCm: request.heightCm,
    sampleWeightKg: request.sampleWeightKg,
    drymatterPercent: request.drymatterPercent,
    kgPerHectare,
    category,
    status: 'pending',
  };
}

/**
 * Obtiene los aforos de un potrero
 * Combina datos locales (pendientes) con datos del servidor (sincronizados)
 */
export async function getByPaddock(paddockId: string): Promise<ForageResponse[]> {
  const db = await getDb();

  // Obtener datos locales (pendientes o fallidos)
  const localForages = await db.forageSamples.find({ selector: { paddockId } }).exec();

  const localResponses: ForageResponse[] = localForages.map((doc) => {
    const data = doc.toJSON();
    return {
      id: data.localId,
      farmId: data.farmId,
      paddockId: data.paddockId,
      sampleDate: data.sampleDate,
      heightCm: data.heightCm,
      sampleWeightKg: data.sampleWeightKg,
      drymatterPercent: data.drymatterPercent,
      kgPerHectare: data.kgPerHectare,
      category: data.category as any,
      status: data.status,
    };
  });

  // Intentar obtener del servidor si hay conexión
  let remoteResponses: ForageResponse[] = [];
  if (typeof navigator !== 'undefined' && navigator.onLine) {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/forage-samples?paddockId=${paddockId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (response.ok) {
        const remoteData = await response.json();
        remoteResponses = Array.isArray(remoteData) ? remoteData : remoteData.data || [];
      }
    } catch (err) {
      console.warn('No se pudieron obtener aforos del servidor:', err);
      // Continuar con datos locales
    }
  }

  // Combinar: locales primero (para UI inmediata), luego remotos
  // Evitar duplicados usando remoteId
  const combined = [...localResponses];
  const localIds = new Set(localResponses.map((r) => r.id));

  for (const remote of remoteResponses) {
    if (!localIds.has(remote.id)) {
      combined.push(remote);
    }
  }

  return combined;
}

/**
 * Obtiene aforos recientes de una finca
 */
export async function getRecentByFarm(
  farmId: string,
  days: number = 30
): Promise<ForageResponse[]> {
  const db = await getDb();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  const cutoffIso = cutoffDate.toISOString();

  // Obtener locales
  const localForages = await db.forageSamples
    .find({
      selector: {
        farmId,
        sampleDate: { $gte: cutoffIso },
      },
    })
    .sort({ sampleDate: 'desc' })
    .exec();

  const localResponses: ForageResponse[] = localForages.map((doc) => {
    const data = doc.toJSON();
    return {
      id: data.localId,
      farmId: data.farmId,
      paddockId: data.paddockId,
      sampleDate: data.sampleDate,
      heightCm: data.heightCm,
      sampleWeightKg: data.sampleWeightKg,
      drymatterPercent: data.drymatterPercent,
      kgPerHectare: data.kgPerHectare,
      category: data.category as any,
      status: data.status,
    };
  });

  // Intentar obtener del servidor
  let remoteResponses: ForageResponse[] = [];
  if (typeof navigator !== 'undefined' && navigator.onLine) {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/forage-samples/farm/${farmId}?days=${days}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (response.ok) {
        const remoteData = await response.json();
        remoteResponses = Array.isArray(remoteData) ? remoteData : remoteData.data || [];
      }
    } catch (err) {
      console.warn('No se pudieron obtener aforos del servidor:', err);
    }
  }

  // Combinar
  const combined = [...localResponses];
  const localIds = new Set(localResponses.map((r) => r.id));

  for (const remote of remoteResponses) {
    if (!localIds.has(remote.id)) {
      combined.push(remote);
    }
  }

  return combined.sort(
    (a, b) => new Date(b.sampleDate).getTime() - new Date(a.sampleDate).getTime()
  );
}

/**
 * Calcular kg/ha estimado basado en muestra
 */
export function calculateKgPerHectare(sampleWeightKg: number, drymatterPercent: number): number {
  // Factor para marco cuadrado de 1m x 1m (10 es el factor de conversión)
  const sampleWeightGrams = sampleWeightKg * 1000;
  const dryWeight = (sampleWeightGrams / 100) * drymatterPercent;
  return (dryWeight / 100) * 10;
}

/**
 * Categorizar estado del potrero por kg/ha
 */
export function categorizeForage(
  kgPerHectare: number
): 'EXCELENTE' | 'BUENO' | 'REGULAR' | 'DEFICIENTE' {
  if (kgPerHectare > 3500) return 'EXCELENTE';
  if (kgPerHectare > 2500) return 'BUENO';
  if (kgPerHectare > 1500) return 'REGULAR';
  return 'DEFICIENTE';
}
