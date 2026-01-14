'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';
import { Wheat, AlertTriangle } from 'lucide-react';
import { type PastureWedgeItem } from '@/services/analytics.service';

interface PastureWedgeChartProps {
  data: PastureWedgeItem[];
  isLoading?: boolean;
}

/**
 * Gráfico de Cuña Forrajera (Pasture Wedge Chart)
 *
 * Visualiza el estado de descanso de todos los potreros
 * - Eje X: Potreros (ordenados por descanso descendente)
 * - Eje Y: Días de Descanso
 * - Colores: Verde (óptimo), Rojo (insuficiente), Naranja (excesivo)
 * - Línea de Referencia: Día 45 (Punto Óptimo Voisin)
 *
 * Concepto: La "cuña" se forma cuando varios potreros están listos
 * simultáneamente, permitiendo rotación eficiente
 */
export default function PastureWedgeChart({ data, isLoading = false }: PastureWedgeChartProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 h-96 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600" />
          <p className="mt-4 text-gray-600">Cargando gráfico...</p>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 h-96 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No hay datos de potreros</p>
        </div>
      </div>
    );
  }

  // Preparar datos para gráfico con colores mejorados
  const chartData = data.map((item) => {
    const days = item.daysSinceExit === 999 ? 0 : item.daysSinceExit;

    // Colores dinámicos mejorados para mejor visualización
    let fillColor: string;
    let statusLabel: string;

    if (days < 21) {
      fillColor = '#ef4444'; // Rojo intenso - sobrepastoreado/sin descanso
      statusLabel = '⛔ Insuficiente';
    } else if (days >= 21 && days < 30) {
      fillColor = '#fb923c'; // Naranja - aún en descanso corto
      statusLabel = '🟠 Corto';
    } else if (days >= 30 && days < 45) {
      fillColor = '#fbbf24'; // Amarillo - descanso aceptable
      statusLabel = '🟡 Aceptable';
    } else if (days >= 45 && days <= 60) {
      fillColor = '#22c55e'; // Verde - óptimo para pastoreo
      statusLabel = '✅ Listo';
    } else {
      fillColor = '#8b5cf6'; // Púrpura - descanso excesivo
      statusLabel = '🟣 Excesivo';
    }

    return {
      name: item.paddockName,
      days,
      fill: fillColor,
      statusLabel,
      status: item.restStatus,
      hectares: item.hectares,
    };
  });

  // Custom tooltip mejorado
  const CustomTooltip = (props: any) => {
    if (props.active && props.payload && props.payload[0]) {
      const data = props.payload[0].payload;

      return (
        <div className="bg-white p-4 border-2 border-gray-300 rounded-lg shadow-xl">
          <p className="font-bold text-gray-900 text-base mb-2">{data.name}</p>
          <div className="space-y-1">
            <p className="text-sm text-gray-700">
              <strong>Descanso:</strong>{' '}
              <span className="text-blue-600 font-semibold">{data.days} días</span>
            </p>
            <p className="text-sm text-gray-700">
              <strong>Tamaño:</strong> {data.hectares} ha
            </p>
            <p className="text-sm mt-2 px-2 py-1 bg-gray-100 rounded">
              <strong>{data.statusLabel}</strong>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Wheat className="w-6 h-6 text-yellow-600" />
          Cuña Forrajera (Pasture Wedge)
        </h3>
        <p className="text-sm text-gray-600 mt-2">
          Potreros ordenados por días de descanso. Verde (45-60 días) = Listo para cosechar.
        </p>
      </div>

      {/* Gráfico */}
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} tick={{ fontSize: 12 }} />
          <YAxis
            label={{ value: 'Días de Descanso', angle: -90, position: 'insideLeft' }}
            tick={{ fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip />} />

          {/* Línea de Referencia: Día 45 (Óptimo) */}
          <ReferenceLine
            y={45}
            stroke="#22c55e"
            strokeDasharray="5 5"
            strokeWidth={2}
            label={{
              value: '45 días (Óptimo Voisin)',
              position: 'right',
              fill: '#16a34a',
              fontSize: 12,
              fontWeight: 'bold',
            }}
          />

          {/* Línea de Referencia: Día 30 (Mínimo) */}
          <ReferenceLine
            y={30}
            stroke="#ef4444"
            strokeDasharray="5 5"
            strokeWidth={2}
            label={{
              value: '30 días (Mínimo)',
              position: 'right',
              fill: '#991b1b',
              fontSize: 12,
              fontWeight: 'bold',
            }}
          />

          {/* Barras con colores dinámicos */}
          <Bar dataKey="days" fill="#8884d8" radius={[8, 8, 0, 0]} animationDuration={500}>
            {chartData.map((entry, index) => (
              <Bar key={`bar-${index}`} dataKey="days" fill={entry.fill} radius={[8, 8, 0, 0]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Leyenda mejorada con nuevos colores */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-3 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-red-500 rounded-md shadow" />
          <span className="text-xs md:text-sm text-gray-800 font-medium">
            Insuficiente (&lt;21d)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-orange-400 rounded-md shadow" />
          <span className="text-xs md:text-sm text-gray-800 font-medium">Corto (21-30d)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-yellow-400 rounded-md shadow" />
          <span className="text-xs md:text-sm text-gray-800 font-medium">Aceptable (30-45d)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-green-500 rounded-md shadow" />
          <span className="text-xs md:text-sm text-gray-800 font-medium">Listo (45-60d)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-purple-500 rounded-md shadow" />
          <span className="text-xs md:text-sm text-gray-800 font-medium">Excesivo (&gt;60d)</span>
        </div>
      </div>

      {/* Insights */}
      <div className="mt-4 p-4 bg-blue-50 border border-blue-300 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>💡 Insight:</strong> {data.filter((p) => p.restStatus === 'OPTIMAL').length}{' '}
          potreros están en punto óptimo y listos para cosechar.
          {data.filter((p) => p.restStatus === 'INSUFFICIENT').length > 0 && (
            <>
              {' '}
              <AlertTriangle className="w-4 h-4 inline mr-1" />
              {data.filter((p) => p.restStatus === 'INSUFFICIENT').length} tienen descanso
              insuficiente.
            </>
          )}
        </p>
      </div>
    </div>
  );
}
