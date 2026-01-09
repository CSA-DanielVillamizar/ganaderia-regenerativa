'use client';

import { useState, useEffect } from 'react';

interface Alert {
  type: 'OVERGRAZING' | 'INSUFFICIENT_REST' | 'MISSING_DATA';
  severity: 'high' | 'medium' | 'low';
  message: string;
  paddockName?: string;
  herdName?: string;
  daysOccupied?: number;
  restDays?: number;
  minRestDays?: number;
}

interface PaddockStatus {
  paddockId: string;
  paddockName: string;
  status: 'OCCUPIED' | 'RESTING' | 'READY';
  restDays: number;
  minRestDays: number | null;
  herdName?: string;
  daysOccupied?: number;
}

interface DashboardSummary {
  farmId: string;
  totalHerds: number;
  totalAnimals: number;
  totalWeight: number;
  totalUA: number;
  activePaddocks: number;
  averageWeightPerAnimal: number;
  uaPerHectare?: number;
  avgOccupancyDays?: number;
  paddocksNeedingRest?: number;
  alerts?: Alert[];
  paddockStatuses?: PaddockStatus[];
}

interface DashboardKPIsProps {
  summary: DashboardSummary;
}

/**
 * Componente de KPIs operativos del Dashboard MVP
 * 
 * Métricas críticas:
 * - UA/ha (carga animal)
 * - Días promedio de ocupación
 * - Potreros necesitando descanso
 * - Alertas de sobrepastoreo y descanso insuficiente
 */
export default function DashboardKPIs({ summary }: DashboardKPIsProps) {
  const [expandedAlerts, setExpandedAlerts] = useState(false);

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'OVERGRAZING':
        return '🚨';
      case 'INSUFFICIENT_REST':
        return '⚠️';
      case 'MISSING_DATA':
        return '📊';
      default:
        return '💡';
    }
  };

  const getAlertColor = (severity: Alert['severity']) => {
    switch (severity) {
      case 'high':
        return 'bg-red-50 border-red-300 text-red-900';
      case 'medium':
        return 'bg-yellow-50 border-yellow-300 text-yellow-900';
      case 'low':
        return 'bg-blue-50 border-blue-300 text-blue-900';
      default:
        return 'bg-gray-50 border-gray-300 text-gray-900';
    }
  };

  const getStatusColor = (status: PaddockStatus['status']) => {
    switch (status) {
      case 'OCCUPIED':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'RESTING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'READY':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status: PaddockStatus['status']) => {
    switch (status) {
      case 'OCCUPIED':
        return '🐄';
      case 'RESTING':
        return '🌱';
      case 'READY':
        return '✅';
      default:
        return '⭕';
    }
  };

  const getStatusLabel = (status: PaddockStatus['status']) => {
    switch (status) {
      case 'OCCUPIED':
        return 'Ocupado';
      case 'RESTING':
        return 'En Descanso';
      case 'READY':
        return 'Listo';
      default:
        return 'Sin Estado';
    }
  };

  const highAlerts = summary.alerts?.filter((a) => a.severity === 'high') || [];
  const otherAlerts = summary.alerts?.filter((a) => a.severity !== 'high') || [];

  return (
    <div className="space-y-6">
      {/* Tarjetas de KPIs Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total UA */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total UA</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {summary.totalUA.toFixed(1)}
              </p>
            </div>
            <div className="text-4xl">🐂</div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {summary.totalAnimals} animales en {summary.totalHerds} lotes
          </p>
        </div>

        {/* UA por Hectárea */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">UA/ha</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {summary.uaPerHectare?.toFixed(2) || '0.00'}
              </p>
            </div>
            <div className="text-4xl">📊</div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Carga animal instantánea</p>
        </div>

        {/* Días Promedio de Ocupación */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ocupación Promedio</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {summary.avgOccupancyDays?.toFixed(1) || '0.0'} días
              </p>
            </div>
            <div className="text-4xl">📅</div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {summary.avgOccupancyDays && summary.avgOccupancyDays > 7 ? (
              <span className="text-red-600 font-medium">⚠️ Revisar rotación</span>
            ) : (
              'Rotación en rango óptimo'
            )}
          </p>
        </div>

        {/* Potreros Necesitando Descanso */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Necesitan Descanso</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {summary.paddocksNeedingRest || 0}
              </p>
            </div>
            <div className="text-4xl">⏳</div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {summary.paddocksNeedingRest && summary.paddocksNeedingRest > 0 ? (
              <span className="text-yellow-600 font-medium">Requieren atención</span>
            ) : (
              'Todos los potreros OK'
            )}
          </p>
        </div>
      </div>

      {/* Alertas Críticas */}
      {summary.alerts && summary.alerts.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              🚨 Alertas Operativas ({summary.alerts.length})
            </h3>
            {otherAlerts.length > 0 && (
              <button
                onClick={() => setExpandedAlerts(!expandedAlerts)}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                {expandedAlerts ? 'Ver menos' : 'Ver todas'}
              </button>
            )}
          </div>
          <div className="p-6 space-y-3">
            {/* Alertas de alta prioridad siempre visibles */}
            {highAlerts.map((alert, idx) => (
              <div
                key={`high-${idx}`}
                className={`border-2 rounded-lg p-4 ${getAlertColor(alert.severity)}`}
              >
                <div className="flex items-start gap-3">
                  <div className="text-2xl">{getAlertIcon(alert.type)}</div>
                  <div className="flex-1">
                    <p className="font-medium mb-1">{alert.message}</p>
                    <div className="text-sm space-y-1">
                      {alert.paddockName && (
                        <p>Potrero: <span className="font-semibold">{alert.paddockName}</span></p>
                      )}
                      {alert.herdName && (
                        <p>Lote: <span className="font-semibold">{alert.herdName}</span></p>
                      )}
                      {alert.daysOccupied !== undefined && (
                        <p>Días ocupado: <span className="font-semibold">{alert.daysOccupied}</span></p>
                      )}
                      {alert.restDays !== undefined && alert.minRestDays !== undefined && (
                        <p>
                          Descanso: <span className="font-semibold">{alert.restDays}/{alert.minRestDays} días</span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Alertas de menor prioridad colapsables */}
            {expandedAlerts && otherAlerts.map((alert, idx) => (
              <div
                key={`other-${idx}`}
                className={`border-2 rounded-lg p-4 ${getAlertColor(alert.severity)}`}
              >
                <div className="flex items-start gap-3">
                  <div className="text-2xl">{getAlertIcon(alert.type)}</div>
                  <div className="flex-1">
                    <p className="font-medium mb-1">{alert.message}</p>
                    <div className="text-sm space-y-1">
                      {alert.paddockName && (
                        <p>Potrero: <span className="font-semibold">{alert.paddockName}</span></p>
                      )}
                      {alert.herdName && (
                        <p>Lote: <span className="font-semibold">{alert.herdName}</span></p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {highAlerts.length === 0 && !expandedAlerts && otherAlerts.length > 0 && (
              <p className="text-sm text-gray-600 text-center py-2">
                Hay {otherAlerts.length} alerta(s) adicional(es) de menor prioridad
              </p>
            )}

            {summary.alerts.length === 0 && (
              <div className="text-center py-8">
                <div className="text-5xl mb-3">✅</div>
                <p className="text-gray-600 font-medium">Sin alertas operativas</p>
                <p className="text-sm text-gray-500 mt-1">
                  Todos los indicadores están dentro de los parámetros normales
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Estado de Potreros */}
      {summary.paddockStatuses && summary.paddockStatuses.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              🗺️ Estado de Potreros ({summary.paddockStatuses.length})
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {summary.paddockStatuses.map((paddock) => (
                <div
                  key={paddock.paddockId}
                  className={`border-2 rounded-lg p-4 ${getStatusColor(paddock.status)}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg">{paddock.paddockName}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-2xl">{getStatusIcon(paddock.status)}</span>
                        <span className="font-medium">{getStatusLabel(paddock.status)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    {paddock.status === 'OCCUPIED' && paddock.herdName && (
                      <div>
                        <span className="text-gray-700">Lote: </span>
                        <span className="font-semibold">{paddock.herdName}</span>
                      </div>
                    )}
                    {paddock.daysOccupied !== undefined && (
                      <div>
                        <span className="text-gray-700">Días ocupado: </span>
                        <span className="font-semibold">{paddock.daysOccupied}</span>
                      </div>
                    )}
                    {paddock.status !== 'OCCUPIED' && (
                      <div>
                        <span className="text-gray-700">Días de descanso: </span>
                        <span className="font-semibold">{paddock.restDays}</span>
                        {paddock.minRestDays && (
                          <span className="text-gray-600"> / {paddock.minRestDays} mín</span>
                        )}
                      </div>
                    )}
                    {paddock.minRestDays && paddock.restDays < paddock.minRestDays && (
                      <div className="text-xs font-medium text-yellow-800 mt-2">
                        ⏳ Aún necesita {paddock.minRestDays - paddock.restDays} días
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
