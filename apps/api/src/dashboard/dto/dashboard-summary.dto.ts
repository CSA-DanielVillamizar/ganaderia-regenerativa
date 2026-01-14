/**
 * DTO para resumen del dashboard - KPIs del MVP
 */
export interface DashboardSummaryDto {
  farmId: string;

  // Épica 2: Estado real de lotes
  totalHerds: number;
  totalAnimals: number;
  totalWeight: number;
  totalUA: number;
  averageWeightPerAnimal: number;

  // Épica 3: Rotación activa
  activePaddocks: number;
  activeMovements: number;

  // Épica 6: KPIs operativos
  uaPerHa: number;
  averageOccupancyDays: number | null;
  paddocksNeedingRest: number;

  // Alertas básicas
  alerts: DashboardAlert[];
}

export interface DashboardAlert {
  type: 'OVERGRAZING' | 'INSUFFICIENT_REST' | 'LOW_WEIGHT_GAIN' | 'MISSING_DATA';
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  message: string;
  paddockId?: string;
  herdId?: string;
}

export interface PaddockStatusDto {
  paddockId: string;
  paddockName: string;
  hectares: number;
  status: 'OCCUPIED' | 'RESTING' | 'READY';
  currentHerdName?: string;
  currentUA?: number;
  uaPerHa?: number;
  occupancyDays?: number;
  restDays?: number;
  minRestDays?: number;
  lastExitDate?: Date;
}

/**
 * DTO para Decisión Diaria (El Cerebro del Sistema)
 */
export interface DecisionTodayResponse {
  farmId: string;
  timestamp: string;
  hasActiveMovement: boolean;
  confidence: number; // 0-100
  recommendation: 'MOVE_NOW' | 'WAIT' | 'INSPECT' | 'NO_ACTIVE_MOVEMENT';
  explanation: string;
  checklist: ChecklistItem[];
  currentMovement?: {
    movementId: string;
    herdName: string;
    paddockName: string;
    entryDate: string;
    daysInPaddock: number;
    maxAllowedDays: number;
  };
  nextPaddock?: {
    paddockId: string;
    paddockName: string;
    restDays: number;
    minRestDays: number;
    hectares: number;
  };
}

export interface ChecklistItem {
  id: string;
  label: string;
  status: 'COMPLETE' | 'PENDING' | 'WARNING';
  description?: string;
}
