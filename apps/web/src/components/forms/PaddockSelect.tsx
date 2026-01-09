'use client';

import { useEffect, useState } from 'react';
import { dashboardService } from '@web/services/api.service';

interface PaddockStatus {
  id: string;
  name: string;
  status: 'OCCUPIED' | 'RESTING' | 'READY';
  restDays?: number;
  minRestDays?: number;
}

interface PaddockSelectProps {
  farmId: string;
  value: string | null;
  onChange: (paddockId: string) => void;
  onlyReady?: boolean;
  disabled?: boolean;
  label?: string;
}

/**
 * Componente inteligente de selección de potreros
 * 
 * Características G3.4:
 * - Obtiene estados de potreros desde /dashboard/{farmId}/paddock-statuses
 * - Filtra por estado (READY, OCCUPIED, RESTING) según onlyReady
 * - Muestra indicador visual del estado (verde=READY, amarillo=RESTING, rojo=OCCUPIED)
 * - Desactiva potreros en descanso con tooltip de días restantes
 * - Usa lastExitDate para calcular días de descanso
 */
export default function PaddockSelect({
  farmId,
  value,
  onChange,
  onlyReady = false,
  disabled = false,
  label = 'Seleccionar potrero',
}: PaddockSelectProps) {
  const [paddocks, setPaddocks] = useState<PaddockStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPaddocks = async () => {
      try {
        setLoading(true);
        const response = await dashboardService.getPaddockStatuses(farmId);
        const statuses: PaddockStatus[] = response.data || response;
        setPaddocks(statuses);
      } catch (err) {
        console.error('Error fetching paddock statuses:', err);
        setError('No se pudieron cargar los potreros');
      } finally {
        setLoading(false);
      }
    };

    fetchPaddocks();
  }, [farmId]);

  const filteredPaddocks = onlyReady 
    ? paddocks.filter(p => p.status === 'READY')
    : paddocks;

  const getStatusBadgeColor = (status: PaddockStatus['status']) => {
    switch (status) {
      case 'READY':
        return 'bg-green-100 text-green-800';
      case 'RESTING':
        return 'bg-yellow-100 text-yellow-800';
      case 'OCCUPIED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: PaddockStatus['status']) => {
    switch (status) {
      case 'READY':
        return 'Disponible';
      case 'RESTING':
        return 'Descansando';
      case 'OCCUPIED':
        return 'Ocupado';
      default:
        return 'Desconocido';
    }
  };

  const getRestingTooltip = (paddock: PaddockStatus) => {
    if (paddock.status === 'RESTING' && paddock.restDays !== undefined && paddock.minRestDays) {
      const remaining = paddock.minRestDays - (paddock.restDays || 0);
      return remaining > 0 
        ? `Faltan ${remaining} días de descanso`
        : 'Descanso completado';
    }
    return '';
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>

      {loading && (
        <div className="text-sm text-gray-500">Cargando potreros...</div>
      )}

      {error && (
        <div className="text-sm text-red-600">{error}</div>
      )}

      {!loading && !error && filteredPaddocks.length === 0 && (
        <div className="text-sm text-yellow-600">
          {onlyReady 
            ? 'No hay potreros disponibles en este momento' 
            : 'No hay potreros registrados'}
        </div>
      )}

      {!loading && !error && filteredPaddocks.length > 0 && (
        <div className="grid gap-2 max-h-60 overflow-y-auto border rounded-lg p-2">
          {filteredPaddocks.map((paddock) => {
            const isDisabled = disabled || (onlyReady && paddock.status !== 'READY');
            const isSelected = value === paddock.id;
            const tooltip = getRestingTooltip(paddock);

            return (
              <label
                key={paddock.id}
                className={`flex items-center p-2 border rounded cursor-pointer transition ${
                  isSelected 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 hover:border-gray-400'
                } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                title={tooltip}
              >
                <input
                  type="radio"
                  name="paddock"
                  value={paddock.id}
                  checked={isSelected}
                  onChange={() => !isDisabled && onChange(paddock.id)}
                  disabled={isDisabled}
                  className="w-4 h-4 text-blue-600"
                />
                <div className="ml-3 flex-1">
                  <div className="font-medium text-sm">{paddock.name}</div>
                  {paddock.restDays !== undefined && paddock.minRestDays && (
                    <div className="text-xs text-gray-600">
                      Descanso: {paddock.restDays}/{paddock.minRestDays} días
                    </div>
                  )}
                </div>
                <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${getStatusBadgeColor(paddock.status)}`}>
                  {getStatusLabel(paddock.status)}
                </span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}
