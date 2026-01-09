/**
 * Sincronización Offline-First - Épica 11
 * 
 * Permite que la app funcione sin conexión y sincronice cuando se reconnecte
 */

export interface SyncQueueItem {
  id: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  endpoint: string;
  payload: any;
  timestamp: number;
  attempts: number;
  maxAttempts: number;
  status: 'pending' | 'synced' | 'failed';
  errorMessage?: string;
}

export interface OfflineSyncManager {
  isOnline: boolean;
  pendingItems: SyncQueueItem[];
  syncInProgress: boolean;
  lastSyncTime?: Date;
}

/**
 * Gestor de Sincronización Offline
 */
export class OfflineSyncService {
  private static readonly QUEUE_KEY = 'sync_queue';
  private static readonly METADATA_KEY = 'sync_metadata';
  private static readonly MAX_RETRIES = 3;
  private static readonly SYNC_INTERVAL = 30000; // 30 segundos

  private syncInterval?: NodeJS.Timeout;
  private isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.isOnline = true;
        this.triggerSync();
      });
      window.addEventListener('offline', () => {
        this.isOnline = false;
      });
    }
  }

  /**
   * Obtiene el estado actual del manager
   */
  getStatus(): OfflineSyncManager {
    return {
      isOnline: this.isOnline,
      pendingItems: this.getQueue(),
      syncInProgress: false,
      lastSyncTime: this.getLastSyncTime(),
    };
  }

  /**
   * Añade una operación a la cola de sincronización
   */
  addToQueue(
    type: 'CREATE' | 'UPDATE' | 'DELETE',
    endpoint: string,
    payload: any,
  ): SyncQueueItem {
    const queue = this.getQueue();

    const item: SyncQueueItem = {
      id: `sync_${Date.now()}_${Math.random()}`,
      type,
      endpoint,
      payload,
      timestamp: Date.now(),
      attempts: 0,
      maxAttempts: this.MAX_RETRIES,
      status: 'pending',
    };

    queue.push(item);
    this.saveQueue(queue);

    // Intenta sincronizar inmediatamente si está online
    if (this.isOnline) {
      this.triggerSync();
    }

    return item;
  }

  /**
   * Obtiene la cola de pendientes
   */
  getQueue(): SyncQueueItem[] {
    if (typeof localStorage === 'undefined') return [];
    
    const data = localStorage.getItem(this.QUEUE_KEY);
    return data ? JSON.parse(data) : [];
  }

  /**
   * Limpia la cola
   */
  clearQueue(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(this.QUEUE_KEY);
    }
  }

  /**
   * Sincroniza items pendientes con el servidor
   */
  async syncWithServer(
    apiClient: (method: string, url: string, data?: any) => Promise<any>,
  ): Promise<void> {
    const queue = this.getQueue();
    const pendingItems = queue.filter((item) => item.status === 'pending');

    if (pendingItems.length === 0) return;

    for (const item of pendingItems) {
      try {
        const method = item.type === 'CREATE' ? 'POST' : item.type === 'UPDATE' ? 'PUT' : 'DELETE';
        
        await apiClient(method, item.endpoint, item.payload);

        // Marcar como sincronizado
        item.status = 'synced';
        item.attempts++;
      } catch (error: any) {
        item.attempts++;
        item.errorMessage = error.message;

        if (item.attempts >= item.maxAttempts) {
          item.status = 'failed';
        }
      }
    }

    // Guardar queue actualizada
    this.saveQueue(queue);
    this.saveLastSyncTime();
  }

  /**
   * Obtiene items fallidos para revisión manual
   */
  getFailedItems(): SyncQueueItem[] {
    return this.getQueue().filter((item) => item.status === 'failed');
  }

  /**
   * Reintenta un item fallido
   */
  retryFailedItem(itemId: string): void {
    const queue = this.getQueue();
    const item = queue.find((i) => i.id === itemId);

    if (item) {
      item.status = 'pending';
      item.attempts = 0;
      this.saveQueue(queue);

      if (this.isOnline) {
        this.triggerSync();
      }
    }
  }

  /**
   * Obtiene el timestamp del último sync exitoso
   */
  private getLastSyncTime(): Date | undefined {
    if (typeof localStorage === 'undefined') return undefined;
    
    const data = localStorage.getItem(this.METADATA_KEY);
    if (data) {
      const metadata = JSON.parse(data);
      return metadata.lastSyncTime ? new Date(metadata.lastSyncTime) : undefined;
    }
    return undefined;
  }

  /**
   * Guarda timestamp de sincronización
   */
  private saveLastSyncTime(): void {
    if (typeof localStorage === 'undefined') return;
    
    const metadata = {
      lastSyncTime: new Date().toISOString(),
    };
    localStorage.setItem(this.METADATA_KEY, JSON.stringify(metadata));
  }

  /**
   * Guarda la cola en localStorage
   */
  private saveQueue(queue: SyncQueueItem[]): void {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(this.QUEUE_KEY, JSON.stringify(queue));
  }

  /**
   * Dispara sincronización si está online
   */
  private triggerSync(): void {
    if (this.isOnline && this.getQueue().length > 0) {
      // En una app real, esto dispararía una llamada al backend
      console.log('🔄 Sincronización iniciada...');
    }
  }

  /**
   * Inicia monitoreo periódico
   */
  startMonitoring(): void {
    if (this.syncInterval) return;

    this.syncInterval = setInterval(() => {
      if (this.isOnline) {
        this.triggerSync();
      }
    }, this.SYNC_INTERVAL);
  }

  /**
   * Detiene monitoreo
   */
  stopMonitoring(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = undefined;
    }
  }

  /**
   * Exporta datos para copia de seguridad
   */
  exportData(): string {
    const queue = this.getQueue();
    const metadata = typeof localStorage !== 'undefined'
      ? localStorage.getItem(this.METADATA_KEY)
      : null;

    return JSON.stringify(
      {
        queue,
        metadata: metadata ? JSON.parse(metadata) : {},
        exportDate: new Date().toISOString(),
      },
      null,
      2,
    );
  }

  /**
   * Importa datos desde copia de seguridad
   */
  importData(jsonData: string): void {
    try {
      const data = JSON.parse(jsonData);

      if (data.queue) {
        this.saveQueue(data.queue);
      }

      if (data.metadata) {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(this.METADATA_KEY, JSON.stringify(data.metadata));
        }
      }
    } catch (error) {
      console.error('Error al importar datos:', error);
    }
  }
}

/**
 * Instancia singleton del servicio
 */
export const offlineSyncManager = new OfflineSyncService();
