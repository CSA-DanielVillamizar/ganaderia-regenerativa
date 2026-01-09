'use client';

import { useState } from 'react';
import { movementService } from '@web/services/api.service';

interface Movement {
  id: string;
  paddockId: string;
  paddock?: {
    id: string;
    name: string;
  };
  entryDate: string;
  exitDate?: string | null;
  status: 'ACTIVE' | 'CLOSED';
}

interface HerdStatusCardProps {
  activeMovement: Movement | null;
  minRestDays: number;
  onClose?: () => void;
  onMovementClosed?: (movement: Movement) => void;
}

/**
 * Tarjeta de estado del lote con información de movimiento activo
 *
 * Características G3.5:
 * - Muestra movimiento actual (si existe) con potrero, fecha de entrada
 * - Calcula y muestra días de ocupación (entrada a hoy)
 * - Botón para cerrar movimiento con picker de fecha de salida
 * - Actualiza Paddock.lastExitDate al cerrar
 * - Muestra "Sin ubicación actual" si no hay movimiento activo
 */
export default function HerdStatusCard({
  activeMovement,
  minRestDays,
  onClose,
  onMovementClosed,
}: HerdStatusCardProps) {
  const [showCloseForm, setShowCloseForm] = useState(false);
  const [exitDate, setExitDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const calculateOccupancyDays = (entryDate: string): number => {
    const entry = new Date(entryDate);
    const today = new Date();
    const diffTime = today.getTime() - entry.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const handleCloseMovement = async () => {
    if (!activeMovement) return;

    try {
      setError('');
      setLoading(true);
      await movementService.close(activeMovement.id, exitDate);
      setShowCloseForm(false);
      onMovementClosed?.(activeMovement);
      onClose?.();
    } catch (err) {
      console.error('Error closing movement:', err);
      setError('Error al cerrar el movimiento. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const occupancyDays = activeMovement 
    ? calculateOccupancyDays(activeMovement.entryDate)
    : 0;

  const minOccupancyDays = 8; // Approximate typical occupancy
  const occupancyPercent = Math.min(
    (occupancyDays / minOccupancyDays) * 100,
    100
  );

  if (!activeMovement) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-center h-40">
          <div className="text-center">
            <div className="text-4xl mb-2">📍</div>
            <p className="text-gray-500 font-medium">Lote sin ubicación actual</p>
            <p className="text-sm text-gray-400 mt-1">
              Crea un movimiento para asignar a un potrero
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Potrero Actual */}
        <div className="border-l-4 border-blue-500 pl-4">
          <p className="text-xs text-gray-600 font-medium mb-1">POTRERO ACTUAL</p>
          <p className="text-lg font-semibold text-gray-900">
            {activeMovement.paddock?.name || 'Desconocido'}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            ID: {activeMovement.paddockId}
          </p>
        </div>

        {/* Fecha de Entrada */}
        <div className="border-l-4 border-green-500 pl-4">
          <p className="text-xs text-gray-600 font-medium mb-1">ENTRADA</p>
          <p className="text-lg font-semibold text-gray-900">
            {new Date(activeMovement.entryDate).toLocaleDateString('es-CO')}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {new Date(activeMovement.entryDate).toLocaleTimeString('es-CO', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
      </div>

      {/* Barra de Ocupación */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <p className="text-xs text-gray-600 font-medium">OCUPACIÓN</p>
          <p className="text-sm font-semibold text-gray-900">
            Día {occupancyDays} de ~{minOccupancyDays}
          </p>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${occupancyPercent}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Descanso requerido después: <strong>{minRestDays} días</strong>
        </p>
      </div>

      {/* Formulario de Cierre */}
      {!showCloseForm ? (
        <button
          onClick={() => setShowCloseForm(true)}
          className="w-full bg-orange-600 text-white font-medium py-2 rounded-lg hover:bg-orange-700 transition"
        >
          ✕ Cerrar Movimiento
        </button>
      ) : (
        <div className="border-t pt-4">
          <p className="text-sm font-medium text-gray-900 mb-3">
            Fecha de salida
          </p>
          <div className="grid grid-cols-3 gap-2">
            <input
              type="date"
              value={exitDate}
              onChange={(e) => setExitDate(e.target.value)}
              disabled={loading}
              className="col-span-2 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            <button
              onClick={() => setExitDate(new Date().toISOString().split('T')[0])}
              className="bg-gray-200 text-gray-800 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-300 transition"
              disabled={loading}
            >
              Hoy
            </button>
          </div>

          {error && (
            <p className="text-sm text-red-600 mt-2">{error}</p>
          )}

          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setShowCloseForm(false)}
              disabled={loading}
              className="flex-1 bg-gray-200 text-gray-800 font-medium py-2 rounded-lg hover:bg-gray-300 transition disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleCloseMovement}
              disabled={loading}
              className="flex-1 bg-orange-600 text-white font-medium py-2 rounded-lg hover:bg-orange-700 transition disabled:opacity-50"
            >
              {loading ? 'Cerrando...' : 'Confirmar'}
            </button>
          </div>
        </div>
      )}

      {/* Estado del Movimiento */}
      <div className="mt-4 pt-4 border-t">
        <div className="inline-block px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
          {activeMovement.status === 'ACTIVE' ? '🟢 Activo' : '⚪ Cerrado'}
        </div>
      </div>
    </div>
  );
}
