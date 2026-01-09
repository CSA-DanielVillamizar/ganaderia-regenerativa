import axios, { AxiosInstance, AxiosError, AxiosResponse } from 'axios';
import { API_URL } from './api-config';
import { ErrorResponse } from '@shared/index';

let token: string | null = null;

// Callback para notificaciones de error (será registrado por el servicio de notificación)
let errorNotificationCallback: ((error: ErrorResponse) => void) | null = null;

/**
 * Registrar callback para notificaciones de error
 * Se llama cuando ocurre un error HTTP capturado
 */
export function registerErrorNotificationCallback(callback: (error: ErrorResponse) => void) {
  errorNotificationCallback = callback;
}

/**
 * Estructura normalizada de error desde el servidor
 */
export interface ApiError extends ErrorResponse {
  originalError?: AxiosError;
}

// Obtener token del localStorage
function getToken() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token');
  }
  return null;
}

// Guardar token
export function setToken(newToken: string) {
  token = newToken;
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth_token', newToken);
  }
}

// Limpiar token
export function clearToken() {
  token = null;
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token');
  }
}

const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token
apiClient.interceptors.request.use(
  (config) => {
    const currentToken = getToken();
    if (currentToken) {
      config.headers.Authorization = `Bearer ${currentToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Normalizar error desde respuesta del servidor
 * El servidor devuelve { statusCode, message, error, path, timestamp, traceId }
 * También devuelve header x-trace-id con el ID de rastreo
 */
function normalizeError(axiosError: AxiosError): ApiError {
  const data = axiosError.response?.data as any;
  const traceIdHeader = axiosError.response?.headers?.['x-trace-id'] as string;

  // Si el servidor devolvió el contrato de error esperado
  if (data && typeof data === 'object' && 'message' in data) {
    return {
      statusCode: data.statusCode || axiosError.response?.status || 500,
      message: data.message || 'Error desconocido',
      error: data.error || 'UNKNOWN_ERROR',
      path: data.path || axiosError.config?.url || '',
      timestamp: data.timestamp || new Date().toISOString(),
      traceId: data.traceId || traceIdHeader || 'N/A',
      originalError: axiosError,
    };
  }

  // Si es un error de validación de NestJS (BadRequest)
  if (axiosError.response?.status === 400 && Array.isArray(data?.message)) {
    return {
      statusCode: 400,
      message: Array.isArray(data.message) ? data.message.join(', ') : 'Validación fallida',
      error: data.error || 'VALIDATION_ERROR',
      path: axiosError.config?.url || '',
      timestamp: new Date().toISOString(),
      traceId: traceIdHeader || 'N/A',
      originalError: axiosError,
    };
  }

  // Fallback: error genérico
  return {
    statusCode: axiosError.response?.status || 500,
    message: axiosError.message || 'Error en la solicitud',
    error: 'HTTP_ERROR',
    path: axiosError.config?.url || '',
    timestamp: new Date().toISOString(),
    traceId: traceIdHeader || 'N/A',
    originalError: axiosError,
  };
}

// Interceptor para errores - Captura y normaliza errores
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Capturar traceId del header si existe
    const traceId = response.headers?.['x-trace-id'];
    if (traceId) {
      // Guardar en sessionStorage para referencia en UI
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('last_trace_id', traceId);
      }
    }
    return response;
  },
  (error: AxiosError) => {
    const normalizedError = normalizeError(error);

    // Llamar callback de notificación si está registrado
    if (errorNotificationCallback && (error.response?.status === 400 || error.response?.status === 409)) {
      errorNotificationCallback(normalizedError);
    }

    // Manejo especial para 401 (No autenticado)
    if (error.response?.status === 401) {
      clearToken();
      if (typeof window !== 'undefined') {
        const pathname = window.location.pathname || '';
        if (!pathname.startsWith('/auth/login')) {
          window.location.href = '/auth/login';
        }
      }
    }

    return Promise.reject(normalizedError);
  }
);

export default apiClient;
