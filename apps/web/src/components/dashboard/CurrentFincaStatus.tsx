'use client';

import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { movementService } from '@web/services/api.service';
import { notificationService } from '@web/services/notification.service';
import { CardSkeleton, SkeletonLoader } from '@web/components/common/SkeletonLoader';
import type { MovementResponse } from '@shared/index';

interface CurrentStatus {
  herd: {
    id: string;
    name: string;
    animalCount: number;
  };
  paddock: {
    id: string;
    name: string;
    hectares: number;
  };
  entryDate: string;
  daysInPaddock: number;
  minRestDays?: number;
}

/**
 * Dashboard de Estado Actual
 * Muestra dónde está cada lote actualmente y el estado de recuperación de potreros
 */
export function CurrentFincaStatus() {
  const [currentStatus, setCurrentStatus] = useState<CurrentStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadActiveMovements = async () => {
      try {
        setLoading(true);
        setError(null);

        // Obtener movimientos activos
        const response = await movementService.list({
          status: 'ACTIVE',
          limit: 100,
        });

        if (!response.data?.data) {
          setCurrentStatus([]);
          return;
        }

        // Transformar datos para mostrar
        const statusData = response.data.data.map((movement: MovementResponse) => {
          const entryDate = new Date(movement.entryDate);
          const now = new Date();
          const daysInPaddock = Math.floor(
            (now.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24)
          );

          return {
            herd: {
              id: movement.herdId,
              name: movement.herd?.name || 'Lote desconocido',
              animalCount: movement.herd?.animalCount || 0,
            },
            paddock: {
              id: movement.paddockId,
              name: movement.paddock?.name || 'Potrero desconocido',
              hectares: movement.paddock?.hectares || 0,
            },
            entryDate: movement.entryDate,
            daysInPaddock,
            minRestDays: movement.paddock?.minRestDays,
          };
        });

        setCurrentStatus(statusData);
      } catch (err: any) {
        const errorMsg = err.message || 'Error al cargar estado actual';
        setError(errorMsg);
        notificationService.error(
          errorMsg,
          'Error en Dashboard',
          err.traceId
        );
      } finally {
        setLoading(false);
      }
    };

    loadActiveMovements();

    // Recargar cada 5 minutos
    const interval = setInterval(loadActiveMovements, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
        <AlertCircle className="w-5 h-5 text-red-600" />
        <p className="text-red-800">{error}</p>
      </div>
    );
  }

  if (currentStatus.length === 0) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
        <Clock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
        <p className="text-blue-800 font-medium">Sin movimientos activos</p>
        <p className="text-blue-600 text-sm">No hay lotes en rotación actualmente</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Estado Actual de Lotes</h2>
        <p className="text-sm text-gray-600">
          {currentStatus.length} lote{currentStatus.length !== 1 ? 's' : ''} en rotación
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentStatus.map((status) => (
          <StatusCard key={status.herd.id} status={status} />
        ))}
      </div>
    </div>
  );
}

/**
 * Tarjeta individual de estado de lote
 */
function StatusCard({ status }: { status: CurrentStatus }) {
  const isRecovering = status.minRestDays
    ? status.daysInPaddock >= status.minRestDays
    : false;

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 border-l-4 border-green-500">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-800">{status.herd.name}</h3>
          <p className="text-sm text-gray-600">{status.herd.animalCount} animales</p>
        </div>
        {isRecovering && (
          <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-xs font-medium">
            Recuperando
          </span>
        )}
      </div>

      {/* Potrero Info */}
      <div className="bg-gray-50 rounded p-4 mb-4">
        <p className="text-xs text-gray-600 uppercase tracking-wide mb-1">En Potrero</p>
        <p className="text-lg font-bold text-gray-800">{status.paddock.name}</p>
        <p className="text-sm text-gray-600">{status.paddock.hectares} hectáreas</p>
      </div>

      {/* Days Info */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-gray-600 uppercase mb-1">Días en Potrero</p>
          <p className="text-2xl font-bold text-green-600">{status.daysInPaddock}</p>
        </div>
        <div>
          <p className="text-xs text-gray-600 uppercase mb-1">Fecha Entrada</p>
          <p className="text-sm font-medium text-gray-800">
            {new Date(status.entryDate).toLocaleDateString('es-ES')}
          </p>
        </div>
      </div>

      {/* Status Indicator */}
      <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
        {isRecovering ? (
          <>
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-sm text-green-600 font-medium">Listo para salida</span>
          </>
        ) : (
          <>
            <Clock className="w-5 h-5 text-blue-600" />
            <span className="text-sm text-blue-600 font-medium">En rotación</span>
          </>
        )}
      </div>
    </div>
  );
}
