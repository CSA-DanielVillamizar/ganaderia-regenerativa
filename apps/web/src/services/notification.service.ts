import { ErrorResponse } from '@ganaderia/shared';
import { registerErrorNotificationCallback } from '@web/lib/api-client';

/**
 * Tipos de notificación
 */
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

/**
 * Interfaz de notificación
 */
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  traceId?: string; // Para errores del servidor
  timestamp: number;
  duration?: number; // ms, null = permanente
}

/**
 * Callback para listeners de notificaciones
 */
type NotificationListener = (notification: Notification) => void;

/**
 * Servicio centralizado de notificaciones
 * Maneja errores desde la API y notificaciones generales
 */
class NotificationService {
  private listeners: Set<(notifications: Notification[]) => void> = new Set();
  private notifications: Notification[] = [];

  constructor() {
    // Registrar callback para errores de API
    registerErrorNotificationCallback((error: ErrorResponse) => {
      this.handleApiError(error);
    });
  }

  /**
   * Suscribirse a cambios de notificaciones
   */
  subscribe(listener: (notifications: Notification[]) => void): () => void {
    this.listeners.add(listener);
    // Enviar estado actual inmediatamente
    listener(this.notifications);
    // Retornar función para desuscribirse
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notificar a todos los listeners con lista actual
   */
  private notifyListeners() {
    this.listeners.forEach((listener) => listener([...this.notifications]));
  }

  /**
   * Crear notificación única con ID
   */
  private createNotification(
    type: NotificationType,
    title: string,
    message: string,
    options: { traceId?: string; duration?: number } = {}
  ): Notification {
    const notification: Notification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      title,
      message,
      timestamp: Date.now(),
      traceId: options.traceId,
      duration: options.duration ?? (type === 'error' ? 8000 : 4000),
    };

    this.notifications.push(notification);
    this.notifyListeners();

    // Auto-remover después de duration
    if (notification.duration && notification.duration > 0) {
      setTimeout(() => {
        this.removeNotification(notification.id);
      }, notification.duration);
    }

    return notification;
  }

  /**
   * Mostrar notificación de éxito
   */
  success(message: string, title: string = 'Éxito') {
    return this.createNotification('success', title, message);
  }

  /**
   * Mostrar notificación de información
   */
  info(message: string, title: string = 'Información') {
    return this.createNotification('info', title, message);
  }

  /**
   * Mostrar notificación de advertencia
   */
  warning(message: string, title: string = 'Advertencia') {
    return this.createNotification('warning', title, message);
  }

  /**
   * Mostrar notificación de error
   * @param message - Mensaje para el usuario
   * @param title - Título de la notificación
   * @param traceId - ID de rastreo desde el servidor (opcional)
   */
  error(message: string, title: string = 'Error', traceId?: string) {
    const fullMessage = traceId ? `${message}\n\nCódigo de rastreo: ${traceId}` : message;

    return this.createNotification('error', title, fullMessage, {
      traceId,
      duration: 10000, // Mantener más tiempo
    });
  }

  /**
   * Manejar errores desde la API
   * Llamado automáticamente por el interceptor de API
   */
  private handleApiError(apiError: ErrorResponse) {
    let title = 'Error en la solicitud';

    // Mapear códigos de error a títulos amigables
    if (apiError.statusCode === 400) {
      title = '⚠️ Validación fallida';
    } else if (apiError.statusCode === 409) {
      title = '🚫 Conflicto';
    } else if (apiError.statusCode === 403) {
      title = '🔒 Acceso denegado';
    } else if (apiError.statusCode === 404) {
      title = '❓ No encontrado';
    } else if (apiError.statusCode >= 500) {
      title = '⚠️ Error del servidor';
    }

    this.error(apiError.message, title, apiError.traceId);
  }

  /**
   * Remover notificación por ID
   */
  removeNotification(id: string) {
    const idx = this.notifications.findIndex((n) => n.id === id);
    if (idx >= 0) {
      this.notifications.splice(idx, 1);
      this.notifyListeners();
    }
  }

  /**
   * Obtener todas las notificaciones activas
   */
  getNotifications(): Notification[] {
    return [...this.notifications];
  }

  /**
   * Limpiar todas las notificaciones
   */
  clear() {
    this.notifications = [];
    this.notifyListeners();
  }
}

// Exportar singleton
export const notificationService = new NotificationService();
