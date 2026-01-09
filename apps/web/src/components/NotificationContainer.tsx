import { useEffect, useState } from 'react';
import { notificationService, Notification } from '@web/services/notification.service';

/**
 * Componente para mostrar notificaciones en tiempo real
 * Se suscribe al servicio de notificaciones y renderiza alertas
 */
export function NotificationContainer() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    // Suscribirse al servicio de notificaciones
    const unsubscribe = notificationService.subscribe((newNotifications) => {
      setNotifications(newNotifications);
    });

    return unsubscribe;
  }, []);

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
      {notifications.map((notification) => (
        <NotificationItem key={notification.id} notification={notification} />
      ))}
    </div>
  );
}

interface NotificationItemProps {
  notification: Notification;
}

/**
 * Componente individual para cada notificación
 */
function NotificationItem({ notification }: NotificationItemProps) {
  const getStyles = () => {
    const baseStyles =
      'px-4 py-3 rounded-lg shadow-lg text-sm font-medium flex items-center gap-2 animate-in fade-in slide-in-from-right-2 duration-300';

    switch (notification.type) {
      case 'success':
        return `${baseStyles} bg-green-50 text-green-800 border border-green-200`;
      case 'error':
        return `${baseStyles} bg-red-50 text-red-800 border border-red-200`;
      case 'warning':
        return `${baseStyles} bg-yellow-50 text-yellow-800 border border-yellow-200`;
      case 'info':
      default:
        return `${baseStyles} bg-blue-50 text-blue-800 border border-blue-200`;
    }
  };

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
      default:
        return 'ℹ️';
    }
  };

  return (
    <div className={getStyles()}>
      <span className="text-lg">{getIcon()}</span>
      <div className="flex-1">
        <p className="line-clamp-3">{notification.message}</p>
        {notification.traceId && (
          <p className="text-xs opacity-70 mt-1 font-mono">Trace: {notification.traceId}</p>
        )}
      </div>
      <button
        onClick={() => {
          notificationService.removeNotification(notification.id);
        }}
        className="ml-2 flex-shrink-0 text-lg hover:opacity-70 transition-opacity"
      >
        ×
      </button>
    </div>
  );
}
