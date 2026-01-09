'use client';

import { useState } from 'react';

interface PaddockState {
  paddockId: string;
  paddockName: string;
  status: 'OCCUPIED' | 'RESTING' | 'READY';
  herdName?: string;
  daysOccupied?: number;
  restDays: number;
  minRestDays: number | null;
  hectares: number;
}

interface PaddockMapProps {
  paddocks: PaddockState[];
  layout?: 'grid' | 'timeline';
  onPaddockClick?: (paddockId: string) => void;
}

/**
 * Mapa Visual de Potreros - Épica 10
 * 
 * Muestra el estado de cada potrero en forma de mapa o timeline
 */
export default function PaddockMap({
  paddocks,
  layout = 'grid',
  onPaddockClick,
}: PaddockMapProps) {
  const [selectedPaddock, setSelectedPaddock] = useState<string | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OCCUPIED':
        return {
          bg: 'bg-red-100',
          border: 'border-red-400',
          icon: '🐄',
          label: 'Ocupado',
        };
      case 'RESTING':
        return {
          bg: 'bg-yellow-100',
          border: 'border-yellow-400',
          icon: '🌱',
          label: 'Reposando',
        };
      case 'READY':
        return {
          bg: 'bg-green-100',
          border: 'border-green-400',
          icon: '✅',
          label: 'Listo',
        };
      default:
        return {
          bg: 'bg-gray-100',
          border: 'border-gray-400',
          icon: '❓',
          label: 'Desconocido',
        };
    }
  };

  const getRestProgress = (paddock: PaddockState) => {
    if (!paddock.minRestDays || paddock.minRestDays === 0) return 100;
    return Math.min(100, (paddock.restDays / paddock.minRestDays) * 100);
  };

  if (layout === 'timeline') {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-gray-900 mb-4">📊 Timeline de Rotación</h3>
        
        {paddocks.map((paddock) => {
          const colors = getStatusColor(paddock.status);
          const restProgress = getRestProgress(paddock);

          return (
            <div
              key={paddock.paddockId}
              onClick={() => {
                setSelectedPaddock(paddock.paddockId);
                onPaddockClick?.(paddock.paddockId);
              }}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition cursor-pointer"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-bold text-gray-900">
                    {colors.icon} {paddock.paddockName}
                  </h4>
                  <p className="text-sm text-gray-600">{paddock.hectares} ha</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${colors.bg} ${colors.border} border`}
                >
                  {colors.label}
                </span>
              </div>

              {/* Ocupación actual */}
              {paddock.status === 'OCCUPIED' && paddock.herdName && (
                <div className="mb-3 bg-red-50 border border-red-200 rounded p-2">
                  <p className="text-xs text-red-900">
                    <strong>Ocupado por:</strong> {paddock.herdName}
                  </p>
                  <p className="text-xs text-red-900">
                    <strong>Días:</strong> {paddock.daysOccupied || 0}
                  </p>
                </div>
              )}

              {/* Barra de descanso */}
              {paddock.status === 'RESTING' && (
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Descanso progresivo</span>
                    <span>
                      {paddock.restDays} / {paddock.minRestDays || '—'} días
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-500 h-2 rounded-full transition-all"
                      style={{ width: `${restProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Estado listo */}
              {paddock.status === 'READY' && paddock.minRestDays && (
                <div className="mb-3 bg-green-50 border border-green-200 rounded p-2">
                  <p className="text-xs text-green-900">
                    ✅ Completó {paddock.minRestDays} días de descanso
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  // Layout: Grid (mapa)
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold text-gray-900">🗺️ Mapa de Potreros</h3>

      {/* Grid responsivo */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {paddocks.map((paddock) => {
          const colors = getStatusColor(paddock.status);
          const restProgress = getRestProgress(paddock);
          const isSelected = selectedPaddock === paddock.paddockId;

          return (
            <div
              key={paddock.paddockId}
              onClick={() => {
                setSelectedPaddock(paddock.paddockId);
                onPaddockClick?.(paddock.paddockId);
              }}
              className={`relative rounded-lg p-4 cursor-pointer transition transform hover:scale-105 ${colors.bg} border-2 ${colors.border} ${
                isSelected ? 'ring-4 ring-blue-400' : ''
              }`}
            >
              {/* Icon de estado */}
              <div className="text-3xl mb-2">{colors.icon}</div>

              {/* Nombre y hectáreas */}
              <h4 className="font-bold text-gray-900 text-sm line-clamp-2">
                {paddock.paddockName}
              </h4>
              <p className="text-xs text-gray-700 mb-3">{paddock.hectares} ha</p>

              {/* Información específica por estado */}
              {paddock.status === 'OCCUPIED' && (
                <div className="bg-white/70 rounded px-2 py-1 mb-2">
                  <p className="text-xs font-semibold text-red-900 line-clamp-1">
                    {paddock.herdName || 'Rebaño'}
                  </p>
                  <p className="text-xs text-red-800">
                    {paddock.daysOccupied || 0} días
                  </p>
                </div>
              )}

              {paddock.status === 'RESTING' && (
                <div className="bg-white/70 rounded px-2 py-1 mb-2">
                  <p className="text-xs text-gray-700">
                    Descanso: {paddock.restDays}/{paddock.minRestDays || '?'} d
                  </p>
                  <div className="w-full bg-gray-300 rounded-full h-1 mt-1">
                    <div
                      className="bg-yellow-500 h-1 rounded-full transition-all"
                      style={{ width: `${restProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {paddock.status === 'READY' && (
                <div className="bg-white/70 rounded px-2 py-1 text-xs text-green-900 font-semibold">
                  ✓ Disponible
                </div>
              )}

              {/* Badge de alerta si descanso insuficiente */}
              {paddock.status === 'RESTING' &&
                paddock.minRestDays &&
                paddock.restDays < paddock.minRestDays && (
                  <div className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                    ⚠️
                  </div>
                )}
            </div>
          );
        })}
      </div>

      {/* Detalle de potrero seleccionado */}
      {selectedPaddock && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          {(() => {
            const paddock = paddocks.find((p) => p.paddockId === selectedPaddock);
            if (!paddock) return null;

            const colors = getStatusColor(paddock.status);
            return (
              <div>
                <h4 className="text-lg font-bold text-gray-900 mb-3">
                  {colors.icon} Detalles: {paddock.paddockName}
                </h4>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Hectáreas:</span>
                    <p className="font-semibold text-gray-900">{paddock.hectares}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Estado:</span>
                    <p className="font-semibold text-gray-900">{colors.label}</p>
                  </div>

                  {paddock.status === 'OCCUPIED' && (
                    <>
                      <div>
                        <span className="text-gray-600">Rebaño:</span>
                        <p className="font-semibold text-gray-900">
                          {paddock.herdName || '—'}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600">Ocupado por:</span>
                        <p className="font-semibold text-gray-900">
                          {paddock.daysOccupied || 0} días
                        </p>
                      </div>
                    </>
                  )}

                  {paddock.status === 'RESTING' && (
                    <>
                      <div>
                        <span className="text-gray-600">Descanso:</span>
                        <p className="font-semibold text-gray-900">
                          {paddock.restDays} días
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600">Mínimo requerido:</span>
                        <p className="font-semibold text-gray-900">
                          {paddock.minRestDays || '—'} días
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
