/**
 * Configuración de Alertas Avanzadas - Épica 9
 * 
 * Permite definir reglas personalizadas de alertas por finca
 */

export type AlertRuleTrigger = 
  | 'OCCUPANCY_DAYS'
  | 'REST_DAYS'
  | 'WEIGHING_FREQUENCY'
  | 'FORAGE_LEVEL'
  | 'UA_PER_HECTARE'
  | 'WEIGHT_LOSS'
  | 'MANUAL';

export type AlertSeverity = 'low' | 'medium' | 'high';

export interface AlertRule {
  id: string;
  farmId: string;
  name: string;
  trigger: AlertRuleTrigger;
  condition: 'greater_than' | 'less_than' | 'equals';
  threshold: number;
  severity: AlertSeverity;
  enabled: boolean;
  notifyEmail: boolean;
  notifySMS: boolean;
  message: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AlertRuleTemplate {
  id: string;
  name: string;
  category: 'ROTATION' | 'FORAGE' | 'WEIGHING' | 'HEALTH';
  rules: Omit<AlertRule, 'id' | 'farmId' | 'createdAt' | 'updatedAt'>[];
  description: string;
}

/**
 * Plantillas predefinidas de reglas de alertas
 */
export const ALERT_RULE_TEMPLATES: Record<string, AlertRuleTemplate> = {
  BASIC_ROTATION: {
    id: 'basic_rotation',
    name: 'Rotación Básica',
    category: 'ROTATION',
    description: 'Alertas para sobrepastoreo e insuficiente descanso',
    rules: [
      {
        name: 'Sobrepastoreo detectado',
        trigger: 'OCCUPANCY_DAYS',
        condition: 'greater_than',
        threshold: 7,
        severity: 'high',
        enabled: true,
        notifyEmail: true,
        notifySMS: false,
        message:
          'El potrero {paddock} ha estado ocupado por {days} días. Considera cambiar el rebaño.',
        description: 'Se activa cuando la ocupación supera 7 días',
      },
      {
        name: 'Descanso insuficiente',
        trigger: 'REST_DAYS',
        condition: 'less_than',
        threshold: 7,
        severity: 'high',
        enabled: true,
        notifyEmail: true,
        notifySMS: true,
        message:
          'El potrero {paddock} ha descansado solo {days} días (mínimo: {minDays}). Extender descanso.',
        description: 'Se activa cuando el descanso está por debajo de lo configurado',
      },
    ],
  },

  FORAGE_MONITORING: {
    id: 'forage_monitoring',
    name: 'Monitoreo de Forraje',
    category: 'FORAGE',
    description: 'Alertas basadas en disponibilidad y calidad forrajera',
    rules: [
      {
        name: 'Bajo nivel de forraje',
        trigger: 'FORAGE_LEVEL',
        condition: 'less_than',
        threshold: 500,
        severity: 'high',
        enabled: true,
        notifyEmail: true,
        notifySMS: true,
        message:
          'Potrero {paddock}: {forage} kg MS/ha (crítico). Preparar suplementación.',
        description: 'Se activa cuando forraje disponible < 500 kg MS/ha',
      },
      {
        name: 'Carga animal elevada',
        trigger: 'UA_PER_HECTARE',
        condition: 'greater_than',
        threshold: 3,
        severity: 'medium',
        enabled: true,
        notifyEmail: true,
        notifySMS: false,
        message:
          'Carga animal de {ua}/ha es elevada. Considerar rotación más frecuente.',
        description: 'Se activa cuando UA/ha supera 3',
      },
    ],
  },

  WEIGHING_FREQUENCY: {
    id: 'weighing_frequency',
    name: 'Frecuencia de Pesajes',
    category: 'WEIGHING',
    description: 'Alertas para asegurar monitoreo regular',
    rules: [
      {
        name: 'Falta de pesajes recientes',
        trigger: 'WEIGHING_FREQUENCY',
        condition: 'greater_than',
        threshold: 7,
        severity: 'medium',
        enabled: true,
        notifyEmail: true,
        notifySMS: false,
        message:
          'Rebaño {herd}: no hay pesajes en {days} días. Realizar pesaje para verificar ganancia.',
        description: 'Se activa cuando no hay pesajes en los últimos 7 días',
      },
    ],
  },

  HEALTH_ALERTS: {
    id: 'health_alerts',
    name: 'Monitoreo de Salud',
    category: 'HEALTH',
    description: 'Alertas para detectar cambios anormales en rebaño',
    rules: [
      {
        name: 'Pérdida de peso',
        trigger: 'WEIGHT_LOSS',
        condition: 'greater_than',
        threshold: 10,
        severity: 'high',
        enabled: true,
        notifyEmail: true,
        notifySMS: true,
        message:
          'Rebaño {herd}: pérdida de {loss}% en peso. Revisar alimentación y salud.',
        description: 'Se activa cuando hay pérdida de peso > 10%',
      },
    ],
  },
};

/**
 * Función para evaluar si una alerta debe dispararse
 */
export function evaluateAlertRule(
  rule: AlertRule,
  currentValue: number,
): boolean {
  switch (rule.condition) {
    case 'greater_than':
      return currentValue > rule.threshold;
    case 'less_than':
      return currentValue < rule.threshold;
    case 'equals':
      return currentValue === rule.threshold;
    default:
      return false;
  }
}

/**
 * Formatea un mensaje de alerta con variables
 */
export function formatAlertMessage(
  template: string,
  variables: Record<string, string | number>,
): string {
  let message = template;
  Object.entries(variables).forEach(([key, value]) => {
    message = message.replace(`{${key}}`, String(value));
  });
  return message;
}

/**
 * Obtiene color según severidad
 */
export function getSeverityColor(severity: AlertSeverity): string {
  switch (severity) {
    case 'high':
      return 'bg-red-50 border-red-200 text-red-900';
    case 'medium':
      return 'bg-yellow-50 border-yellow-200 text-yellow-900';
    case 'low':
      return 'bg-blue-50 border-blue-200 text-blue-900';
    default:
      return 'bg-gray-50 border-gray-200 text-gray-900';
  }
}
