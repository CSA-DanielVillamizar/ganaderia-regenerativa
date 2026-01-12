'use client';

import React, { useEffect, useState } from 'react';
import { KpiGrid, PastureWedgeChart, WeightGainWidget } from '@/components/dashboard';
import {
  getGlobalKPIs,
  getPastureWedge,
  getAllWeightGainReports,
  type GlobalKPIs,
  type PastureWedgeItem,
  type WeightGainReport,
} from '@/services/analytics.service';
import { Loader } from 'lucide-react';

/**
 * Dashboard Mejorado con Análisis Agronómico Voisin
 *
 * Componentes:
 * 1. KpiGrid - Métricas globales (Carga, UA, Área, Descanso)
 * 2. PastureWedgeChart - Gráfico de descanso de potreros
 * 3. WeightGainWidget - Ganancia de peso del hato
 *
 * Todos los datos se cargan desde RxDB (offline-first)
 */
export default function AnalyticsDashboard() {
  const [kpis, setKpis] = useState<GlobalKPIs | null>(null);
  const [wedge, setWedge] = useState<PastureWedgeItem[]>([]);
  const [weightGains, setWeightGains] = useState<WeightGainReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Cargar todos los datos en paralelo
        const [kpisData, wedgeData, weightsData] = await Promise.all([
          getGlobalKPIs(),
          getPastureWedge(),
          getAllWeightGainReports(),
        ]);

        setKpis(kpisData);
        setWedge(wedgeData);
        setWeightGains(weightsData);
      } catch (err) {
        console.error('Error cargando dashboard:', err);
        setError('Error al cargar los datos. Intenta nuevamente.');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();

    // Recargar datos cada 30 segundos (para mantener datos frescos)
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <span className="text-4xl">📊</span>
          Dashboard Agronómico
        </h1>
        <p className="text-gray-600 mt-2">Análisis en tiempo real basado en Metodología Voisin</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && !kpis ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader className="w-12 h-12 text-green-600 animate-spin" />
          <p className="mt-4 text-gray-600 text-lg">Analizando finca...</p>
        </div>
      ) : (
        <>
          {/* 1. KPI Grid */}
          {kpis && (
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Métricas Globales</h2>
              <KpiGrid kpis={kpis} isLoading={isLoading} />
            </section>
          )}

          {/* 2. Pasture Wedge Chart */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Estado de Potreros</h2>
            <PastureWedgeChart data={wedge} isLoading={isLoading} />
          </section>

          {/* 3. Weight Gain Widget */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Rendimiento Productivo</h2>
            <WeightGainWidget reports={weightGains} isLoading={isLoading} />
          </section>

          {/* Insights Section */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Insight 1: Rotación */}
            <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6">
              <h3 className="text-lg font-bold text-blue-900 mb-2">🔄 Rotación</h3>
              <p className="text-sm text-blue-800">
                {wedge.filter((p) => p.restStatus === 'OPTIMAL').length} potreros listos para
                cosecha (45-60 días de descanso).
              </p>
              {kpis && kpis.globalStockingRate > 4 && (
                <p className="text-sm text-red-700 font-semibold mt-2">
                  ⚠️ Carga global elevada. Considera aumentar área o reducir lote.
                </p>
              )}
            </div>

            {/* Insight 2: Forraje */}
            <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6">
              <h3 className="text-lg font-bold text-green-900 mb-2">🌾 Disponibilidad</h3>
              <p className="text-sm text-green-800">
                Descanso promedio: {kpis?.averageRestDays} días.
                {kpis && kpis.averageRestDays >= 45 && (
                  <span className="block mt-2 text-green-700 font-semibold">
                    ✅ Excelente cumplimiento de Voisin
                  </span>
                )}
              </p>
            </div>
          </section>

          {/* Last Update */}
          <div className="text-center text-xs text-gray-500 mt-8 pt-4 border-t border-gray-200">
            Última actualización:{' '}
            {kpis?.calculatedAt && new Date(kpis.calculatedAt).toLocaleTimeString('es-CO')}
          </div>
        </>
      )}
    </div>
  );
}
