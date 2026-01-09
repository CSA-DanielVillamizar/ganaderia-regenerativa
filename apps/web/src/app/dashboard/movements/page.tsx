'use client';

import React from 'react';
import { FilteredMovementsView, FincaDashboard, ClimateToggle } from '@web/components';

/**
 * Página de Panel de Operaciones (FASE 3+)
 * 
 * Muestra:
 * - Selector de temporada (Invierno/Verano) para ajustar validaciones
 * - Dashboard operativo con métricas KPI y alertas de sobrepastoreo
 * - Estado actual de movimientos activos
 * - Historial paginado de movimientos
 * - Filtros por lote y potrero
 * - Auto-refresh cada 5 minutos
 * 
 * Esta página integra los componentes de FASE 3 y nuevas funcionalidades:
 * - FincaDashboard: KPIs y alertas de sobrepastoreo
 * - ClimateToggle: Selector de temporada
 * - CurrentFincaStatus: Dashboard visual de estado actual
 * - MovementHistoryTable: Tabla paginada del historial con duración
 * - FilteredMovementsView: Contenedor con filtros
 */
export default function MovementsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header con Climate Toggle */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Panel de Operaciones
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Monitorea estado, alertas y rotación de lotes
              </p>
            </div>
            <ClimateToggle />
          </div>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Dashboard Operativo */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Estado Actual de la Finca
            </h2>
            <FincaDashboard />
          </section>

          {/* Movimientos */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Historial de Movimientos
            </h2>
            <FilteredMovementsView />
          </section>
        </div>
      </div>
    </div>
  );
}
