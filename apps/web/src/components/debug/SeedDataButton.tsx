'use client';

import React, { useState } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { getDb } from '@/lib/offline/db';
import type { HerdDoc, PaddockDoc, MovementDoc } from '@/lib/offline/db';
import { v4 as uuidv4 } from 'uuid';

/**
 * Botón de Carga de Datos de Prueba (Seed Data)
 * Usa RxDB para insertar datos offline-first
 *
 * Crea:
 * - 3 Potreros: "El Roble", "La Ceiba", "Samán"
 * - 1 Hato: "Novillos Levante" (20 animales)
 * - 1 Movimiento activo en Samán
 */
export default function SeedDataButton() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{
    type: 'idle' | 'loading' | 'success' | 'error';
    message?: string;
  }>({ type: 'idle' });

  const loadSeedData = async () => {
    try {
      setLoading(true);
      setStatus({ type: 'loading', message: '🌱 Cargando datos de prueba...' });

      const db = await getDb();
      const now = new Date();

      // Usar la misma farmId que el usuario activo (temporal para pruebas)
      const farmId = 'farm-demo-001';

      // 1️⃣ Crear Potreros con campos exactos del schema
      const paddock1Id = uuidv4();
      const paddock2Id = uuidv4();
      const paddock3Id = uuidv4();

      const paddocks: PaddockDoc[] = [
        {
          id: paddock1Id,
          farmId,
          name: 'El Roble',
          hectares: 8,
          lastExitDate: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'AVAILABLE',
          createdAt: now.toISOString(),
          updatedAt: now.toISOString(),
        },
        {
          id: paddock2Id,
          farmId,
          name: 'La Ceiba',
          hectares: 12,
          lastExitDate: new Date(now.getTime() - 50 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'RESTING',
          createdAt: now.toISOString(),
          updatedAt: now.toISOString(),
        },
        {
          id: paddock3Id,
          farmId,
          name: 'Samán',
          hectares: 10,
          status: 'AVAILABLE',
          createdAt: now.toISOString(),
          updatedAt: now.toISOString(),
        },
      ];

      for (const paddock of paddocks) {
        await db.paddocks.insert(paddock);
        console.log(`✅ Potrero creado: ${paddock.name}`);
      }

      // 2️⃣ Crear Hato con campos exactos del schema
      const herdId = uuidv4();
      const herd: HerdDoc = {
        id: herdId,
        farmId,
        name: 'Novillos Levante',
        category: 'Ganado Joven',
        numberOfAnimals: 20,
        currentWeight: 7000,
        averageWeight: 350,
        status: 'ACTIVE',
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      };

      await db.herds.insert(herd);
      console.log('✅ Hato creado:', herdId);

      // 3️⃣ Crear Movimiento Activo
      const movementId = uuidv4();
      const movement: MovementDoc = {
        localId: movementId,
        herdId,
        paddockId: paddock3Id,
        farmId,
        entryDate: now.toISOString(),
        estimatedExitDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'ACTIVE',
        syncStatus: 'pending',
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      };

      await db.movements.insert(movement);
      console.log('✅ Movimiento creado:', movementId);

      setStatus({
        type: 'success',
        message: `✅ ¡Datos cargados! Potreros: 3 | Hato: Novillos Levante (20 animales) | Movimiento activo`,
      });

      // Recargar página después de 2 segundos
      setTimeout(() => window.location.reload(), 2000);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Error desconocido';
      setStatus({ type: 'error', message: `❌ ${msg}` });
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 left-6 z-40 max-w-sm animate-in fade-in slide-in-from-bottom-4">
      <div className="bg-white border-2 border-yellow-400 rounded-lg shadow-lg p-4">
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">🌱</span>
          <h3 className="font-semibold text-gray-900">Datos de Prueba</h3>
        </div>

        {/* Status Message */}
        {status.type !== 'idle' && (
          <div
            className={`mb-3 p-3 rounded-lg flex items-start gap-2 text-sm ${
              status.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : status.type === 'error'
                  ? 'bg-red-50 text-red-800 border border-red-200'
                  : 'bg-blue-50 text-blue-800 border border-blue-200'
            }`}
          >
            {status.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
            ) : status.type === 'error' ? (
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            ) : (
              <div className="w-4 h-4 rounded-full border-2 border-blue-400 border-t-transparent animate-spin flex-shrink-0 mt-0.5" />
            )}
            <p>{status.message}</p>
          </div>
        )}

        {/* Description */}
        <p className="text-xs text-gray-600 mb-4 leading-relaxed">
          Crea automáticamente:
          <ul className="list-disc pl-4 mt-2 space-y-1 text-gray-700">
            <li>3 Potreros: El Roble, La Ceiba, Samán</li>
            <li>1 Hato: &quot;Novillos Levante&quot; (20 animales)</li>
            <li>1 Movimiento activo</li>
          </ul>
        </p>

        {/* Button */}
        <button
          onClick={loadSeedData}
          disabled={loading || status.type === 'loading'}
          className="w-full px-4 py-2 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors duration-200"
        >
          {loading ? '⏳ Cargando...' : '🌱 Cargar Datos Demo'}
        </button>

        {/* Warning */}
        <p className="text-xs text-gray-500 mt-3 italic">
          ⚠️ Solo para desarrollo. Elimina antes de producción.
        </p>
      </div>
    </div>
  );
}
