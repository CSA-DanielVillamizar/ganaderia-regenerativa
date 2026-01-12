import apiClient from '@web/lib/api-client';
import {
  CreateFarmDto,
  CreatePaddockDto,
  CreateHerdDto,
  CreateWeighingDto,
  CreateMovementDto,
  CreateForageSampleDto,
  ListMovementsResponse,
  MovementResponse,
} from '@ganaderia/shared';

/**
 * Servicio para Fincas
 */
export const farmService = {
  async create(dto: CreateFarmDto) {
    return apiClient.post('/farms', dto);
  },

  async getAll() {
    return apiClient.get('/farms');
  },

  async getById(id: string) {
    return apiClient.get(`/farms/${id}`);
  },

  async update(id: string, dto: Partial<CreateFarmDto>) {
    return apiClient.put(`/farms/${id}`, dto);
  },

  async delete(id: string) {
    return apiClient.delete(`/farms/${id}`);
  },
};

/**
 * Servicio para Potreros
 */
export const paddockService = {
  async create(dto: CreatePaddockDto) {
    return apiClient.post('/paddocks', dto);
  },

  async getByFarm(farmId: string) {
    return apiClient.get('/paddocks', { params: { farmId } });
  },

  async getById(id: string) {
    return apiClient.get(`/paddocks/${id}`);
  },

  async update(id: string, dto: Partial<CreatePaddockDto>) {
    return apiClient.put(`/paddocks/${id}`, dto);
  },

  async delete(id: string) {
    return apiClient.delete(`/paddocks/${id}`);
  },
};

/**
 * Servicio para Lotes
 */
export const herdService = {
  async create(dto: CreateHerdDto) {
    return apiClient.post('/herds', dto);
  },

  async getByFarm(farmId: string) {
    return apiClient.get('/herds', { params: { farmId } });
  },

  async getById(id: string) {
    return apiClient.get(`/herds/${id}`);
  },

  async update(id: string, dto: Partial<CreateHerdDto>) {
    return apiClient.put(`/herds/${id}`, dto);
  },

  async delete(id: string) {
    return apiClient.delete(`/herds/${id}`);
  },
};

/**
 * Servicio para Pesajes
 */
export const weighingService = {
  async create(dto: CreateWeighingDto) {
    return apiClient.post('/weighings', dto);
  },

  async getByHerd(herdId: string) {
    return apiClient.get('/weighings', { params: { herdId } });
  },

  async getHistory(herdId: string) {
    return apiClient.get(`/weighings/${herdId}/history`);
  },
};

/**
 * Servicio para Movimientos
 */
export const movementService = {
  async create(dto: CreateMovementDto) {
    return apiClient.post('/movements', dto);
  },

  /**
   * Obtener historial de movimientos con paginación y filtros
   * @param filters - { herdId?, paddockId?, status?, page?, limit? }
   * @returns ListMovementsResponse con data y pagination
   */
  async list(filters?: {
    herdId?: string;
    paddockId?: string;
    status?: 'ACTIVE' | 'CLOSED';
    page?: number;
    limit?: number;
  }): Promise<{ data: ListMovementsResponse }> {
    return apiClient.get('/movements', { params: filters });
  },

  /**
   * Obtener movimientos de un lote específico
   * @deprecated Use list({ herdId }) en su lugar
   */
  async getByHerd(herdId: string) {
    return this.list({ herdId, page: 1, limit: 50 });
  },

  async update(id: string, dto: Partial<CreateMovementDto>) {
    return apiClient.put(`/movements/${id}`, dto);
  },

  async getOccupancyDays(id: string) {
    return apiClient.get(`/movements/${id}/occupancy`);
  },

  /**
   * Cierra un movimiento activo estableciendo la fecha de salida
   * Actualiza exitDate y status a CLOSED, además de Paddock.lastExitDate
   */
  async close(id: string, exitDate: string) {
    return apiClient.patch(`/movements/${id}/close`, { exitDate });
  },
};

/**
 * Servicio para Aforos
 */
export const forageService = {
  async create(dto: CreateForageSampleDto) {
    return apiClient.post('/forage-samples', dto);
  },

  async getByPaddock(paddockId: string) {
    return apiClient.get('/forage-samples', { params: { paddockId } });
  },

  async getRecentByFarm(farmId: string, days?: number) {
    return apiClient.get(`/forage-samples/farm/${farmId}`, {
      params: { days },
    });
  },
};

/**
 * Servicio para Dashboard
 */
export const dashboardService = {
  async getSummary(farmId: string) {
    return apiClient.get('/dashboard/summary', { params: { farmId } });
  },

  async getTrends(farmId: string, herdId?: string) {
    return apiClient.get('/dashboard/trends', { params: { farmId, herdId } });
  },

  async getRotationStatus(farmId: string) {
    return apiClient.get('/dashboard/rotation-status', { params: { farmId } });
  },

  async getForageStats(farmId: string) {
    return apiClient.get('/dashboard/forage-stats', { params: { farmId } });
  },

  async getAlerts(farmId: string) {
    return apiClient.get('/dashboard/alerts', { params: { farmId } });
  },

  /**
   * Obtiene el resumen MVP con KPIs extendidos (UA/ha, ocupación, alertas)
   * Incluye: totalUA, uaPerHectare, avgOccupancyDays, paddocksNeedingRest, alerts, paddockStatuses
   */
  async getSummaryMVP(farmId: string) {
    return apiClient.get(`/dashboard/${farmId}/summary`);
  },

  /**
   * Obtiene alertas operativas (sobrepastoreo, descanso insuficiente, datos faltantes)
   */
  async getAlertsMVP(farmId: string) {
    return apiClient.get(`/dashboard/${farmId}/alerts`);
  },

  /**
   * Obtiene estados de potreros (OCCUPIED/RESTING/READY con días de descanso)
   */
  async getPaddockStatuses(farmId: string) {
    return apiClient.get(`/dashboard/${farmId}/paddock-statuses`);
  },
};
