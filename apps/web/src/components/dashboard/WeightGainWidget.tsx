'use client';

import React from 'react';
import { TrendingUp, TrendingDown, AlertTriangle, Minus } from 'lucide-react';
import { type WeightGainReport } from '@/services/analytics.service';

interface WeightGainWidgetProps {
  reports: WeightGainReport[];
  isLoading?: boolean;
}

/**
 * Widget de Ganancia de Peso
 *
 * Muestra:
 * - GDP (Ganancia Diaria de Peso) promedio del hato
 * - Estado visual (🟢 Excelente, 🟡 Bueno, 🔴 Alerta)
 * - Tendencia individual de cada lote
 * - Comparativa con rangos recomendados
 *
 * Criterios:
 * - > 0.5 kg/día: EXCELLENT (Buen trabajo)
 * - 0.3-0.5 kg/día: GOOD (Aceptable)
 * - < 0.3 kg/día: ALERT (Problema nutricional)
 */
export default function WeightGainWidget({ reports, isLoading = false }: WeightGainWidgetProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 h-full animate-pulse">
        <div className="h-6 bg-gray-200 rounded mb-4" />
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-200 rounded" />
          ))}
        </div>
      </div>
    );
  }

  // Calcular promedio de GDP
  const validReports = reports.filter((r) => r.dailyWeightGain !== null);
  const averageGDP =
    validReports.length > 0
      ? validReports.reduce((sum, r) => sum + (r.dailyWeightGain || 0), 0) / validReports.length
      : 0;

  // Determinar estado global
  let globalStatus: 'EXCELLENT' | 'GOOD' | 'ALERT' | 'UNKNOWN';
  let statusColor: string;
  let statusIcon: React.ReactNode;
  let statusMessage: string;

  if (averageGDP > 0.5) {
    globalStatus = 'EXCELLENT';
    statusColor = 'bg-green-50 border-green-300';
    statusIcon = <TrendingUp className="w-8 h-8 text-green-600" />;
    statusMessage = '🟢 Excelente: Ganancia óptima';
  } else if (averageGDP >= 0.3) {
    globalStatus = 'GOOD';
    statusColor = 'bg-yellow-50 border-yellow-300';
    statusIcon = <TrendingUp className="w-8 h-8 text-yellow-600" />;
    statusMessage = '🟡 Bueno: Ganancia aceptable';
  } else if (averageGDP > 0) {
    globalStatus = 'ALERT';
    statusColor = 'bg-red-50 border-red-300';
    statusIcon = <AlertTriangle className="w-8 h-8 text-red-600" />;
    statusMessage = '🔴 Alerta: Revisar nutrición';
  } else {
    globalStatus = 'UNKNOWN';
    statusColor = 'bg-gray-50 border-gray-300';
    statusIcon = <Minus className="w-8 h-8 text-gray-600" />;
    statusMessage = 'Sin datos suficientes';
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <span className="text-2xl">⚖️</span>
          Ganancia de Peso (GDP)
        </h3>
        <p className="text-sm text-gray-600 mt-2">
          Ganancia Diaria de Peso del hato. Indicador de eficiencia nutricional.
        </p>
      </div>

      {/* Estado Global */}
      <div className={`border-2 ${statusColor} rounded-lg p-4 mb-6 flex items-center gap-4`}>
        {statusIcon}
        <div>
          <p className="font-semibold text-gray-800">{statusMessage}</p>
          <p className="text-2xl font-bold text-gray-900">{averageGDP.toFixed(2)} kg/día</p>
          <p className="text-xs text-gray-600 mt-1">
            Basado en {validReports.length} lotes con datos
          </p>
        </div>
      </div>

      {/* Rangos de Referencia */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h4 className="font-semibold text-gray-800 mb-3">Rangos Recomendados:</h4>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Excelente</span>
            <div className="flex items-center gap-2">
              <div className="w-12 h-2 bg-green-500 rounded" />
              <span className="text-green-700 font-semibold">&gt; 0.5 kg/día</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Bueno</span>
            <div className="flex items-center gap-2">
              <div className="w-12 h-2 bg-yellow-500 rounded" />
              <span className="text-yellow-700 font-semibold">0.3-0.5 kg/día</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Alerta</span>
            <div className="flex items-center gap-2">
              <div className="w-12 h-2 bg-red-500 rounded" />
              <span className="text-red-700 font-semibold">&lt; 0.3 kg/día</span>
            </div>
          </div>
        </div>
      </div>

      {/* Detalle por Lote */}
      <div className="space-y-3">
        <h4 className="font-semibold text-gray-800">Detalle por Lote:</h4>
        {reports.map((report) => {
          let bgColor = 'bg-gray-50';
          let gdpColor = 'text-gray-700';

          if (report.dailyWeightGain !== null) {
            if (report.dailyWeightGain > 0.5) {
              bgColor = 'bg-green-50';
              gdpColor = 'text-green-700';
            } else if (report.dailyWeightGain >= 0.3) {
              bgColor = 'bg-yellow-50';
              gdpColor = 'text-yellow-700';
            } else {
              bgColor = 'bg-red-50';
              gdpColor = 'text-red-700';
            }
          }

          const trendIcon =
            report.trend === 'UP' ? (
              <TrendingUp className="w-4 h-4 text-green-600" />
            ) : report.trend === 'DOWN' ? (
              <TrendingDown className="w-4 h-4 text-red-600" />
            ) : report.trend === 'STABLE' ? (
              <Minus className="w-4 h-4 text-gray-600" />
            ) : null;

          return (
            <div
              key={report.herdId}
              className={`${bgColor} border border-gray-200 rounded-lg p-3 flex items-center justify-between`}
            >
              <div>
                <p className="font-medium text-gray-800">{report.herdName}</p>
                {report.lastWeighingDate && (
                  <p className="text-xs text-gray-600">
                    Última pesada: {new Date(report.lastWeighingDate).toLocaleDateString('es-CO')}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3">
                {report.dailyWeightGain !== null ? (
                  <>
                    <span className={`font-bold text-lg ${gdpColor}`}>
                      {report.dailyWeightGain.toFixed(2)} kg/día
                    </span>
                    {trendIcon && <span>{trendIcon}</span>}
                  </>
                ) : (
                  <span className="text-xs text-gray-500">Sin datos</span>
                )}
              </div>
            </div>
          );
        })}

        {reports.length === 0 && (
          <div className="p-4 bg-gray-50 rounded-lg text-center text-gray-600 text-sm">
            No hay datos de lotes registrados
          </div>
        )}
      </div>

      {/* Recomendaciones */}
      {globalStatus === 'ALERT' && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">
            <strong>⚠️ Recomendación:</strong> La ganancia de peso está por debajo de lo esperado.
            Revisa:
            <ul className="mt-2 ml-4 space-y-1 list-disc text-xs">
              <li>Calidad nutricional del pasto</li>
              <li>Carga animal vs disponibilidad de forraje</li>
              <li>Salud de los animales (parásitos, enfermedades)</li>
              <li>Frecuencia de movimientos (rotación muy lenta)</li>
            </ul>
          </p>
        </div>
      )}
    </div>
  );
}
