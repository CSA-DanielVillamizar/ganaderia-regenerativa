'use client';

import React, { useState } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import apiClient from '@/lib/api-client';

/**
 * Botón de Carga de Datos de Prueba (Seed Data)
 * Llama al endpoint del backend para crear datos de prueba
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
    console.log('🚀🚀🚀 BOTÓN CLICKEADO - INICIANDO SEED DATA 🚀🚀🚀');
    try {
      setLoading(true);
      setStatus({ type: 'loading', message: '🌱 Cargando datos de prueba...' });

      console.log('[SeedDataButton] Llamando al endpoint POST /api/seed/demo-data...');

      // Llamar al backend para crear seed data
      const response = await apiClient.post('/seed/demo-data');

      console.log('[SeedDataButton] Respuesta del backend:', response.data);

      setStatus({
        type: 'success',
        message: `✅ ¡Datos cargados! ${response.data.data.paddocks.length} potreros, 1 hato (${response.data.data.herd.numberOfAnimals} animales), 1 movimiento activo`,
      });

      // Recargar página después de 2 segundos
      setTimeout(() => window.location.reload(), 2000);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Error desconocido';
      console.error('[SeedDataButton] Error completo:', error);
      console.error('[SeedDataButton] Stack:', error instanceof Error ? error.stack : 'N/A');
      setStatus({ type: 'error', message: `❌ ${msg}` });
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
        <div className="text-xs text-gray-600 mb-4 leading-relaxed">
          <p className="mb-2">Crea automáticamente:</p>
          <ul className="list-disc pl-4 space-y-1 text-gray-700">
            <li>3 Potreros: El Roble, La Ceiba, Samán</li>
            <li>1 Hato: &quot;Novillos Levante&quot; (20 animales)</li>
            <li>1 Movimiento activo</li>
          </ul>
        </div>

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
