/**
 * Indicador de Estado Offline
 * Muestra el estado de sincronización en la UI
 */

'use client';

import React from 'react';
import { Cloud, CloudOff, AlertCircle } from 'lucide-react';
import { useOfflineSync } from '@/hooks/useOfflineSync';

export function OfflineIndicator() {
  const { isOnline, pendingCount, isSyncing } = useOfflineSync();

  // No renderizar en servidor
  if (typeof window === 'undefined') {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      {/* Indicador de conexión */}
      <div className="flex items-center">
        {isOnline ? (
          <div className="flex items-center text-green-600 text-sm gap-1" title="Conectado">
            <Cloud className="w-4 h-4" />
            <span className="hidden sm:inline">Online</span>
          </div>
        ) : (
          <div className="flex items-center text-orange-600 text-sm gap-1" title="Sin conexión">
            <CloudOff className="w-4 h-4" />
            <span className="hidden sm:inline">Offline</span>
          </div>
        )}
      </div>

      {/* Indicador de pendientes */}
      {pendingCount > 0 && (
        <div className="flex items-center gap-1">
          <div
            className={`flex items-center text-sm gap-1 ${
              isSyncing ? 'text-blue-600' : 'text-amber-600'
            }`}
            title={
              isSyncing ? 'Sincronizando cambios...' : `${pendingCount} cambio(s) pendiente(s)`
            }
          >
            {isSyncing ? (
              <>
                <span className="animate-spin">⟳</span>
                <span className="hidden sm:inline">Sync...</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4" />
                <span className="hidden sm:inline">{pendingCount}</span>
                <span className="sm:hidden">{pendingCount}</span>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
