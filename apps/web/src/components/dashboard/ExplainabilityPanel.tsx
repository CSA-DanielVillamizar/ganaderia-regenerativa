/**
 * Panel de explainability
 * Muestra las razones de la recomendación con fuentes
 */

import { DecisionTodayResponse } from '@shared/index';

interface ExplainabilityPanelProps {
  reasons: DecisionTodayResponse['explainability'];
}

export function ExplainabilityPanel({ reasons }: ExplainabilityPanelProps) {
  if (!reasons || reasons.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
        <h3 className="font-bold text-gray-900 mb-4">💭 Razonamiento</h3>
        <p className="text-gray-600">No hay información disponible para explicar la recomendación</p>
      </div>
    );
  }

  const getSourceIcon = (source: string) => {
    const icons: Record<string, string> = {
      FORAGE_DATA: '🌱',
      WEIGHING_DATA: '📊',
      MOVEMENT_HISTORY: '📈',
      PARAMETER: '⚙️',
      DEFAULT: '📌',
    };
    return icons[source] || '📌';
  };

  const getWeightColor = (weight: number) => {
    if (weight >= 5) return 'bg-red-100 text-red-900';
    if (weight >= 4) return 'bg-orange-100 text-orange-900';
    if (weight >= 3) return 'bg-yellow-100 text-yellow-900';
    return 'bg-gray-100 text-gray-900';
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <h3 className="font-bold text-gray-900 mb-4">💭 Razonamiento</h3>

      <div className="space-y-3">
        {reasons.map((reason, idx) => (
          <div key={idx} className="flex gap-3 pb-3 border-b border-gray-100 last:border-b-0">
            <div className="text-2xl flex-shrink-0">{getSourceIcon(reason.source)}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900">{reason.reason}</p>
              <div className="flex gap-2 mt-2">
                <span className="inline-block px-2 py-1 text-xs rounded bg-gray-100 text-gray-700">
                  {reason.source.replace(/_/g, ' ')}
                </span>
                <span className={`inline-block px-2 py-1 text-xs rounded font-semibold ${getWeightColor(reason.weight)}`}>
                  Peso: {reason.weight}/5
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
