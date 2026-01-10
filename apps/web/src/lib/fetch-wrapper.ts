import 'use client';
import React from 'react';
import { ApiError } from './api-client';
import { notificationService } from '@web/services/notification.service';

/**
 * Fetch wrapper centralizado con manejo estándar de errores
 * Usa el contrato de error del API:
 * - statusCode: número
 * - message: descripción clara
 * - traceId: ID para rastreo
 * - path: endpoint que falló
 * - timestamp: cuándo ocurrió
 * - error?: objeto con detalles adicionales
 */

export interface FetchError {
  statusCode: number;
  message: string;
  traceId?: string;
  path?: string;
  timestamp?: string;
  originalError?: Error;
}

/**
 * Normalizar error y registrarlo en notificaciones
 */
export function handleApiError(error: unknown): FetchError {
  const apiError = error as ApiError;

  const fetchError: FetchError = {
    statusCode: apiError.statusCode || 500,
    message: apiError.message || 'Error desconocido',
    traceId: apiError.traceId,
    path: apiError.path,
    timestamp: apiError.timestamp,
  };

  // Mostrar notificación de error
  notificationService.error(fetchError.message, {
    duration: 5000,
    traceId: fetchError.traceId,
  });

  return fetchError;
}

/**
 * Wrapper para operaciones que pueden fallar
 * Simplifica el try-catch y manejo de errores
 */
export async function tryAsync<T>(
  asyncFn: () => Promise<T>,
  options?: {
    onError?: (error: FetchError) => void;
    showNotification?: boolean;
  }
): Promise<T | null> {
  try {
    return await asyncFn();
  } catch (error) {
    const fetchError = handleApiError(error);

    if (options?.onError) {
      options.onError(fetchError);
    }

    return null;
  }
}

/**
 * Hook para usar tryAsync en componentes React
 */
export function useTryAsync<T>(
  asyncFn: () => Promise<T>,
  deps?: React.DependencyList
): {
  execute: () => Promise<T | null>;
  loading: boolean;
  error: FetchError | null;
} {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<FetchError | null>(null);

  const execute = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await asyncFn();
      return result;
    } catch (err) {
      const fetchError = handleApiError(err);
      setError(fetchError);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { execute, loading, error };
}
