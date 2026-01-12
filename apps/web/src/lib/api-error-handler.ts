/**
 * Manejador Centralizado de Errores de API
 *
 * Proporciona una única fuente de verdad para el procesamiento de errores.
 * Estrategia:
 * - Errores de red: Retorna null (degradación elegante, no lanza excepción)
 * - Errores de validación: Lanza para que UI muestre el error
 * - Errores de servidor: Lanza pero marca como retryable
 */

import axios from 'axios';

/**
 * Tipos de errores de API distinguibles
 */
export enum ApiErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTH_ERROR = 'AUTH_ERROR',
  FORBIDDEN_ERROR = 'FORBIDDEN_ERROR',
  NOT_FOUND_ERROR = 'NOT_FOUND_ERROR',
  CONFLICT_ERROR = 'CONFLICT_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * Interfaz para errores normalizados
 */
export interface ApiError {
  type: ApiErrorType;
  message: string;
  statusCode?: number;
  traceId?: string;
  originalError?: any;
  isRetryable: boolean;
}

/**
 * Manejador principal de errores de API
 *
 * Convierte cualquier error en un objeto ApiError normalizado.
 *
 * ESTRATEGIA CRÍTICA:
 * - Red offline/timeout: return null (NO throw)
 * - Validación (400): throw ApiError
 * - Auth (401): throw ApiError
 * - Forbidden (403): throw ApiError
 * - Not Found (404): throw ApiError
 * - Conflict (409): throw ApiError
 * - Server (5xx): throw ApiError con isRetryable=true
 * - Desconocido: throw ApiError genérico
 *
 * @param error Error capturado (AxiosError, Error, etc)
 * @returns ApiError normalizado, o null si es error de red
 *
 * @example
 * try {
 *   await apiClient.post('/data', payload);
 * } catch (error) {
 *   const result = handleApiError(error);
 *   if (result === null) {
 *     // Red offline - continuar con datos locales
 *     console.log('Offline, usando datos locales');
 *   } else {
 *     // Mostrar error al usuario
 *     showNotification(result.message, 'error');
 *   }
 * }
 */
export function handleApiError(error: any): ApiError | null {
  // Detectar errores de red
  if (isNetworkError(error)) {
    console.warn('Network error detected, returning null for graceful degradation');
    return null;
  }

  // Errores Axios con respuesta del servidor
  if (axios.isAxiosError(error)) {
    const statusCode = error.response?.status;
    const data = error.response?.data as any;
    const traceId = error.response?.headers?.['x-trace-id'];

    // 400 - Validación
    if (statusCode === 400) {
      return {
        type: ApiErrorType.VALIDATION_ERROR,
        message: data?.message || 'Error de validación en la solicitud',
        statusCode,
        traceId,
        isRetryable: false,
        originalError: error,
      };
    }

    // 401 - No autenticado
    if (statusCode === 401) {
      // Limpiar token expirado
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
      }
      return {
        type: ApiErrorType.AUTH_ERROR,
        message: 'Sesión expirada. Por favor inicia sesión nuevamente.',
        statusCode,
        traceId,
        isRetryable: false,
        originalError: error,
      };
    }

    // 403 - Prohibido (no tienes permisos)
    if (statusCode === 403) {
      return {
        type: ApiErrorType.FORBIDDEN_ERROR,
        message: 'No tienes permisos para acceder a este recurso',
        statusCode,
        traceId,
        isRetryable: false,
        originalError: error,
      };
    }

    // 404 - No encontrado
    if (statusCode === 404) {
      return {
        type: ApiErrorType.NOT_FOUND_ERROR,
        message: data?.message || 'El recurso no fue encontrado',
        statusCode,
        traceId,
        isRetryable: false,
        originalError: error,
      };
    }

    // 409 - Conflicto
    if (statusCode === 409) {
      return {
        type: ApiErrorType.CONFLICT_ERROR,
        message: data?.message || 'Conflicto en los datos. Intenta nuevamente.',
        statusCode,
        traceId,
        isRetryable: true,
        originalError: error,
      };
    }

    // 5xx - Error del servidor (retryable)
    if (statusCode && statusCode >= 500) {
      return {
        type: ApiErrorType.SERVER_ERROR,
        message: 'Error en el servidor. Intentando nuevamente automáticamente...',
        statusCode,
        traceId,
        isRetryable: true,
        originalError: error,
      };
    }

    // Otro error Axios
    return {
      type: ApiErrorType.UNKNOWN_ERROR,
      message: error.message || 'Error desconocido en la API',
      statusCode,
      traceId,
      isRetryable: false,
      originalError: error,
    };
  }

  // Error genérico (no Axios)
  return {
    type: ApiErrorType.UNKNOWN_ERROR,
    message: error?.message || 'Error desconocido',
    isRetryable: false,
    originalError: error,
  };
}

/**
 * Detecta si el error es de red (offline, timeout, CORS, etc)
 *
 * @param error Error capturado
 * @returns true si es error de red
 *
 * @example
 * if (isNetworkError(error)) {
 *   console.log('Sin conexión, usando datos locales');
 * }
 */
export function isNetworkError(error: any): boolean {
  // Error de conexión de Axios (sin respuesta del servidor)
  if (axios.isAxiosError(error) && !error.response) {
    return true;
  }

  // Timeout
  if (axios.isAxiosError(error) && error.code === 'ECONNABORTED') {
    return true;
  }

  // CORS u otros errores de red
  if (error?.message?.includes('Network') || error?.message?.includes('CORS')) {
    return true;
  }

  // evento offline del navegador
  if (typeof window !== 'undefined' && !window.navigator.onLine) {
    return true;
  }

  return false;
}

/**
 * Determina si un error es reintentalbe
 *
 * Errores retryables:
 * - CONFLICT_ERROR (409)
 * - SERVER_ERROR (5xx)
 * - NETWORK_ERROR (pero handleApiError retorna null para estos)
 *
 * @param error ApiError
 * @returns true si puede reintenarse
 */
export function isRetryable(error: ApiError): boolean {
  return error.isRetryable;
}

/**
 * Wrapper seguro de fetch que usa handleApiError
 *
 * @param url URL a solicitar
 * @param init Opciones de fetch
 * @returns Response o null si error de red
 *
 * @example
 * const result = await safeFetch('/api/data', { method: 'GET' });
 * if (result) {
 *   const data = await result.json();
 * } else {
 *   console.log('Offline, ignorando error');
 * }
 */
export async function safeFetch(url: string, init?: RequestInit): Promise<Response | null> {
  try {
    return await fetch(url, init);
  } catch (error) {
    const apiError = handleApiError(error);
    if (apiError === null) {
      return null; // Error de red, return null
    }
    throw apiError;
  }
}

/**
 * Filtra si un error debe mostrarse al usuario
 *
 * Errores QUE NO se muestran:
 * - NETWORK_ERROR (usuario ya sabe que está offline)
 *
 * Errores QUE SÍ se muestran:
 * - VALIDATION_ERROR
 * - AUTH_ERROR
 * - FORBIDDEN_ERROR
 * - NOT_FOUND_ERROR
 * - CONFLICT_ERROR
 * - SERVER_ERROR
 *
 * @param error ApiError
 * @returns true si debe mostrarse al usuario
 */
export function shouldDisplayError(error: ApiError): boolean {
  return error.type !== ApiErrorType.NETWORK_ERROR;
}

/**
 * Extrae mensaje legible para usuario
 *
 * @param error ApiError
 * @returns Mensaje formateado en español
 */
export function getUserFriendlyMessage(error: ApiError): string {
  const messages: Record<ApiErrorType, string> = {
    [ApiErrorType.NETWORK_ERROR]: 'Sin conexión. Trabajando con datos locales.',
    [ApiErrorType.VALIDATION_ERROR]: error.message || 'Por favor revisa los datos ingresados',
    [ApiErrorType.AUTH_ERROR]: 'Sesión expirada. Inicia sesión nuevamente.',
    [ApiErrorType.FORBIDDEN_ERROR]: 'No tienes permisos para esta acción',
    [ApiErrorType.NOT_FOUND_ERROR]: 'Recurso no encontrado',
    [ApiErrorType.CONFLICT_ERROR]: 'Conflicto de datos. Intenta nuevamente.',
    [ApiErrorType.SERVER_ERROR]: 'Error en el servidor. Reintentando...',
    [ApiErrorType.UNKNOWN_ERROR]: 'Error desconocido. Intenta nuevamente.',
  };

  return messages[error.type] || error.message;
}
