'use client';

import React, { useState } from 'react';
import { Filter, X } from 'lucide-react';
import { CurrentFincaStatus } from './CurrentFincaStatus';
import { MovementHistoryTable } from './MovementHistoryTable';

/**
 * Componente con filtros para el dashboard de movimientos
 * Permite filtrar por lote o potrero
 */
export function FilteredMovementsView() {
  const [filters, setFilters] = useState({
    herdId: '',
    paddockId: '',
  });

  const [showFilters, setShowFilters] = useState(false);

  const handleFilterChange = (key: 'herdId' | 'paddockId', value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({ herdId: '', paddockId: '' });
  };

  const hasActiveFilters = Boolean(filters.herdId || filters.paddockId);

  return (
    <div className="space-y-6">
      {/* Header con Filtros */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <h1 className="text-3xl font-bold text-gray-800">Panel de Operaciones</h1>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Filter className="w-4 h-4" />
            {hasActiveFilters ? 'Filtros Activos' : 'Añadir Filtros'}
          </button>
        </div>

        {/* Filtros Desplegables */}
        {showFilters && (
          <div className="border-t border-gray-200 pt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Filtro por Lote */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filtrar por Lote (ID)
                </label>
                <input
                  type="text"
                  placeholder="ID del lote..."
                  value={filters.herdId}
                  onChange={(e) => handleFilterChange('herdId', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                />
              </div>

              {/* Filtro por Potrero */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filtrar por Potrero (ID)
                </label>
                <input
                  type="text"
                  placeholder="ID del potrero..."
                  value={filters.paddockId}
                  onChange={(e) => handleFilterChange('paddockId', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                />
              </div>
            </div>

            {/* Botón Limpiar */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 px-3 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
              >
                <X className="w-4 h-4" />
                Limpiar filtros
              </button>
            )}

            <p className="text-xs text-gray-500">
              💡 Tip: Deja en blanco para ver todos los movimientos
            </p>
          </div>
        )}
      </div>

      {/* Dashboard de Estado Actual */}
      <div className="bg-white rounded-lg shadow p-6">
        <CurrentFincaStatus />
      </div>

      {/* Tabla de Historial */}
      <MovementHistoryTable
        herdId={filters.herdId || undefined}
        paddockId={filters.paddockId || undefined}
        limit={10}
      />

      {/* Footer - Instrucciones */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">📋 Cómo usar este panel:</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>✓ El estado actual se actualiza automáticamente cada 5 minutos</li>
          <li>✓ Usa los filtros para auditar movimientos específicos de lotes o potreros</li>
          <li>✓ Las "Recuperándose" indican potreros listos para su próximo lote</li>
          <li>✓ Los errores se mostrarán con un código de rastreo (traceId) para debugging</li>
        </ul>
      </div>
    </div>
  );
}
