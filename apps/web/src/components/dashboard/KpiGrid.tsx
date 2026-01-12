'use client';

import React from 'react';
import { Gauge, Leaf, BarChart3, TrendingUp, AlertTriangle } from 'lucide-react';
import { type GlobalKPIs } from '@/services/analytics.service';

interface KpiGridProps {
  kpis: GlobalKPIs;
  isLoading?: boolean;
}

/**
 * Grid de KPIs Globales
 *
 * Muestra tarjetas con métricas clave de la finca:
 * - Carga Global (UA/ha) con alerta si > 4
 * - UA Totales
 * - Área Total
 * - Descanso Promedio
 * - Lotes y Potreros activos
 */
export default function KpiGrid({ kpis, isLoading = false }: KpiGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-gray-200 rounded-lg h-40 animate-pulse" />
        ))}
      </div>
    );
  }

  const isOverloaded = kpis.globalStockingRate > 4;

  const kpiCards = [
    {
      icon: Gauge,
      label: 'Carga Global',
      value: kpis.globalStockingRate.toFixed(2),
      unit: 'UA/ha',
      color: isOverloaded ? 'red' : 'green',
      alert: isOverloaded ? '⚠️ Sobrecarga' : '✅ Óptima',
      bgColor: isOverloaded ? 'bg-red-50' : 'bg-green-50',
      borderColor: isOverloaded ? 'border-red-300' : 'border-green-300',
      textColor: isOverloaded ? 'text-red-700' : 'text-green-700',
    },
    {
      icon: Leaf,
      label: 'UA Totales',
      value: kpis.totalUA.toFixed(1),
      unit: 'UA',
      color: 'blue',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-300',
      textColor: 'text-blue-700',
    },
    {
      icon: BarChart3,
      label: 'Área Pastoreable',
      value: kpis.totalHectares.toFixed(1),
      unit: 'ha',
      color: 'amber',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-300',
      textColor: 'text-amber-700',
    },
    {
      icon: TrendingUp,
      label: 'Descanso Promedio',
      value: kpis.averageRestDays,
      unit: 'días',
      color: 'purple',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-300',
      textColor: 'text-purple-700',
    },
    {
      icon: AlertTriangle,
      label: 'Lotes Activos',
      value: `${kpis.activeHerds} / ${kpis.totalPaddocks}`,
      unit: 'potreros',
      color: 'orange',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-300',
      textColor: 'text-orange-700',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {kpiCards.map((kpi, index) => {
        const Icon = kpi.icon;
        return (
          <div
            key={index}
            className={`${kpi.bgColor} border-2 ${kpi.borderColor} rounded-lg p-6 transition-all hover:shadow-lg`}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className={`text-sm font-medium ${kpi.textColor}`}>{kpi.label}</p>
                {kpi.alert && <p className="text-xs mt-1 font-semibold">{kpi.alert}</p>}
              </div>
              <Icon className={`w-6 h-6 ${kpi.textColor} opacity-60`} />
            </div>

            <div className="flex items-baseline gap-2">
              <span className={`text-3xl font-bold ${kpi.textColor}`}>{kpi.value}</span>
              <span className={`text-sm font-medium ${kpi.textColor} opacity-70`}>{kpi.unit}</span>
            </div>

            {/* Progress bar para carga global */}
            {kpi.label === 'Carga Global' && (
              <div className="mt-4 bg-white rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    isOverloaded ? 'bg-red-500' : 'bg-green-500'
                  }`}
                  style={{
                    width: `${Math.min((kpis.globalStockingRate / 6) * 100, 100)}%`,
                  }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
