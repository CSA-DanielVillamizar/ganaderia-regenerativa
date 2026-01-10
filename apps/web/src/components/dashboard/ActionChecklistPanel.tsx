/**
 * Panel de checklist de acciones
 * Muestra tareas prioritarias para completar
 */

import { useRouter } from 'next/navigation';
import { DecisionTodayResponse } from '@shared/index';

interface ActionChecklistPanelProps {
  actions: DecisionTodayResponse['actionChecklist'];
  farmId: string;
}

export function ActionChecklistPanel({ actions, farmId }: ActionChecklistPanelProps) {
  const router = useRouter();

  if (!actions || actions.length === 0) {
    return null;
  }

  const getActionIcon = (action: string) => {
    if (action.includes('aforo')) return '🌱';
    if (action.includes('pesaje')) return '📊';
    if (action.includes('movimiento') || action.includes('Cerrar')) return '📍';
    return '✓';
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      URGENT: 'bg-red-100 border-red-300 text-red-900',
      HIGH: 'bg-orange-100 border-orange-300 text-orange-900',
      MEDIUM: 'bg-yellow-100 border-yellow-300 text-yellow-900',
      LOW: 'bg-blue-100 border-blue-300 text-blue-900',
    };
    return colors[priority] || colors.LOW;
  };

  const handleActionClick = (action: DecisionTodayResponse['actionChecklist'][number]) => {
    // Parsear la acción y redirigir apropiadamente
    if (action.action.includes('aforo')) {
      router.push(`/farms/${farmId}/forage/new?paddockId=${action.context || ''}`);
    } else if (action.action.includes('pesaje')) {
      router.push(`/farms/${farmId}/weighings/new?herdId=${action.context || ''}`);
    } else if (action.action.includes('Cerrar')) {
      // Buscar el movementId en el action.id
      router.push(`/farms/${farmId}/movements/${action.id}/close`);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <h3 className="font-bold text-gray-900 mb-4">📋 Acciones Pendientes</h3>

      <div className="space-y-2">
        {actions.map((action) => (
          <ActionItem
            key={action.id}
            action={action}
            icon={getActionIcon(action.action)}
            priorityColor={getPriorityColor(action.priority)}
            onAction={() => handleActionClick(action)}
          />
        ))}
      </div>

      {actions.length > 0 && (
        <p className="text-xs text-gray-600 mt-4">
          {actions.length} tarea{actions.length !== 1 ? 's' : ''} pendiente{actions.length !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
}

interface ActionItemProps {
  action: DecisionTodayResponse['actionChecklist'][number];
  icon: string;
  priorityColor: string;
  onAction: () => void;
}

function ActionItem({ action, icon, priorityColor, onAction }: ActionItemProps) {
  const priorityLabel: Record<string, string> = {
    URGENT: '🔴 URGENTE',
    HIGH: '🟠 ALTA',
    MEDIUM: '🟡 MEDIA',
    LOW: '🔵 BAJA',
  };

  const isCompleted = action.status === 'COMPLETED';

  return (
    <div className={`border-2 rounded-lg p-3 flex items-start justify-between ${priorityColor}`}>
      <div className="flex items-start gap-3 flex-1">
        <span className="text-xl mt-1">{icon}</span>
        <div className="flex-1">
          <p className={`font-semibold ${isCompleted ? 'line-through opacity-60' : ''}`}>{action.action}</p>
          {action.context && (
            <p className="text-xs opacity-75 mt-1">
              📌 {action.context}
            </p>
          )}
          <p className="text-xs font-semibold mt-2">{priorityLabel[action.priority]}</p>
        </div>
      </div>

      {!isCompleted && (
        <button
          onClick={onAction}
          className="flex-shrink-0 ml-3 px-3 py-2 bg-white rounded hover:bg-gray-50 font-semibold text-sm transition-colors"
        >
          ➜ Ir
        </button>
      )}
      {isCompleted && (
        <div className="flex-shrink-0 ml-3 text-xl">✅</div>
      )}
    </div>
  );
}
