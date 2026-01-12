/**
 * Hook para detectar estado de sincronización
 * Proporciona acceso al estado online/offline y conteo de items pendientes
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  subscribeSyncQueue,
  getPendingCount,
  processSyncQueue,
  initNetworkSync,
} from '@/lib/offline/sync-replicator';

export interface OfflineSyncState {
  isOnline: boolean;
  pendingCount: number;
  isSyncing: boolean;
}

/**
 * Hook personalizado para monitorear el estado offline
 * Detecta cambios de red y actualiza el conteo de items pendientes
 */
export function useOfflineSync(): OfflineSyncState {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  // Actualizar conteo de pendientes
  const updatePendingCount = useCallback(async () => {
    try {
      const count = await getPendingCount();
      setPendingCount(count);
    } catch (err) {
      console.error('Error obteniendo conteo de pendientes:', err);
    }
  }, []);

  // Manejar reconexión
  const handleOnline = useCallback(() => {
    console.log('🟢 Online detectado');
    setIsOnline(true);
    setIsSyncing(true);

    // Procesar cola con pequeño delay
    setTimeout(async () => {
      try {
        await processSyncQueue();
        await updatePendingCount();
      } catch (err) {
        console.error('Error procesando cola al reconectarse:', err);
      } finally {
        setIsSyncing(false);
      }
    }, 500);
  }, [updatePendingCount]);

  // Manejar desconexión
  const handleOffline = useCallback(() => {
    console.log('🔴 Offline detectado');
    setIsOnline(false);
  }, []);

  // Inicializar
  useEffect(() => {
    // Actualizar conteo inicial
    updatePendingCount();

    // Inicializar listeners de red (solo una vez globalmente)
    if (typeof window !== 'undefined') {
      initNetworkSync();
    }

    // Suscribirse a cambios en la cola de sync
    const unsubscribeSyncQueue = subscribeSyncQueue(() => {
      updatePendingCount();
    });

    // Suscribirse a eventos de red
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Polling cada 10 segundos (por si hay cambios externos)
    const pollInterval = setInterval(() => {
      updatePendingCount();
    }, 10000);

    return () => {
      unsubscribeSyncQueue();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(pollInterval);
    };
  }, [updatePendingCount, handleOnline, handleOffline]);

  return {
    isOnline,
    pendingCount,
    isSyncing,
  };
}
