'use client';

import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, AlertCircle, Download } from 'lucide-react';
import { movementService } from '@web/services/api.service';
import { notificationService } from '@web/services/notification.service';
import { SkeletonLoader } from '@web/components/common/SkeletonLoader';
import { ExportService } from '@web/services/export.service';
import type { MovementResponse } from '@ganaderia/shared';

interface MovementHistoryTableProps {
  herdId?: string;
  paddockId?: string;
  limit?: number;
}

/**
 * Tabla de Historial de Movimientos
 * Muestra registro de todos los movimientos con paginación y filtros
 */
export function MovementHistoryTable({ herdId, paddockId, limit = 10 }: MovementHistoryTableProps) {
  const [movements, setMovements] = useState<MovementResponse[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(limit);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMovements = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await movementService.list({
          herdId,
          paddockId,
          page: currentPage,
          limit: pageSize,
        });

        if (!response.data?.data) {
          setMovements([]);
          setTotalPages(1);
          return;
        }

        setMovements(response.data.data);
        setTotalPages(response.data.pagination.totalPages);
      } catch (err: any) {
        const errorMsg = err.message || 'Error al cargar historial';
        setError(errorMsg);
        notificationService.error(errorMsg, 'Error en Historial', err.traceId);
      } finally {
        setLoading(false);
      }
    };

    loadMovements();
  }, [currentPage, pageSize, herdId, paddockId]);

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleExport = async (format: 'pdf' | 'excel') => {
    try {
      setExporting(true);

      if (!movements.length) {
        notificationService.warning('No hay movimientos para exportar');
        return;
      }

      const formattedData = ExportService.formatMovementsForExport(movements);

      if (format === 'pdf') {
        ExportService.exportMovementsAsPDF(formattedData, 'Reporte_Movimientos', {
          herdId,
          paddockId,
        });
      } else {
        ExportService.exportMovementsAsExcel(formattedData, 'Reporte_Movimientos');
      }

      notificationService.success(`Reporte ${format.toUpperCase()} generado exitosamente`);
    } catch (err: any) {
      notificationService.error(`Error al exportar en ${format.toUpperCase()}`);
      console.error('Export error:', err);
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Historial de Movimientos</h2>
        <SkeletonLoader rows={5} columns={5} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
        <p className="text-red-800">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="text-xl font-bold text-gray-800">Historial de Movimientos</h2>

          <div className="flex items-center gap-3">
            {/* Export Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => handleExport('pdf')}
                disabled={exporting || !movements.length}
                className="flex items-center gap-2 px-3 py-2 bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
                title="Exportar a PDF"
              >
                <Download size={16} />
                PDF
              </button>
              <button
                onClick={() => handleExport('excel')}
                disabled={exporting || !movements.length}
                className="flex items-center gap-2 px-3 py-2 bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
                title="Exportar a Excel"
              >
                <Download size={16} />
                Excel
              </button>
            </div>

            {/* Page Size Selector */}
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Por página:</label>
              <select
                value={pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Table - Responsive */}
      {movements.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left font-semibold text-gray-700">Lote</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-700">Potrero</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-700">Entrada</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-700">Salida</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-700">Estado</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-700">Días</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {movements.map((movement) => (
                <MovementRow key={movement.id} movement={movement} />
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-8 text-center">
          <p className="text-gray-600">No hay movimientos para mostrar</p>
        </div>
      )}

      {/* Footer - Pagination */}
      {movements.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-600">
            Página {currentPage} de {totalPages}
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Página anterior"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>

            <span className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium">
              {currentPage}
            </span>

            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Próxima página"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Fila individual de la tabla de movimientos
 */
function MovementRow({ movement }: { movement: MovementResponse }) {
  const entryDate = new Date(movement.entryDate);
  const exitDate = movement.exitDate ? new Date(movement.exitDate) : null;

  const daysInPaddock = Math.floor(
    ((exitDate || new Date()).getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  const isActive = movement.status === 'ACTIVE';

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4">
        <div className="font-medium text-gray-900">{movement.herd?.name || '-'}</div>
        <p className="text-xs text-gray-500">{movement.herdId}</p>
      </td>
      <td className="px-6 py-4">
        <div className="font-medium text-gray-900">{movement.paddock?.name || '-'}</div>
        <p className="text-xs text-gray-500">{movement.paddockId}</p>
      </td>
      <td className="px-6 py-4 text-gray-700">
        {entryDate.toLocaleDateString('es-ES', {
          year: '2-digit',
          month: '2-digit',
          day: '2-digit',
        })}
      </td>
      <td className="px-6 py-4 text-gray-700">
        {exitDate
          ? exitDate.toLocaleDateString('es-ES', {
              year: '2-digit',
              month: '2-digit',
              day: '2-digit',
            })
          : '-'}
      </td>
      <td className="px-6 py-4">
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
            isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}
        >
          {isActive ? '🟢 Activo' : '⚫ Completado'}
        </span>
      </td>
      <td className="px-6 py-4 font-medium text-gray-900">{daysInPaddock}d</td>
    </tr>
  );
}
