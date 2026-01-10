/**
 * Badge de nivel de confianza
 */

interface ConfidenceBadgeProps {
  confidenceLevel: 'HIGH' | 'MEDIUM' | 'LOW';
}

export function ConfidenceBadge({ confidenceLevel }: ConfidenceBadgeProps) {
  const config = {
    HIGH: {
      color: 'bg-green-100 border-green-300 text-green-900',
      icon: '✅',
      title: 'Confianza Alta',
      description: 'Datos completos disponibles',
    },
    MEDIUM: {
      color: 'bg-yellow-100 border-yellow-300 text-yellow-900',
      icon: '⚠️',
      title: 'Confianza Media',
      description: 'Faltan algunos datos',
    },
    LOW: {
      color: 'bg-red-100 border-red-300 text-red-900',
      icon: '❌',
      title: 'Confianza Baja',
      description: 'Datos insuficientes',
    },
  };

  const config_level = config[confidenceLevel];

  return (
    <div className={`border-2 rounded-xl p-6 ${config_level.color}`}>
      <div className="text-4xl mb-3">{config_level.icon}</div>
      <h3 className="font-bold text-lg">{config_level.title}</h3>
      <p className="text-sm mt-2 opacity-80">{config_level.description}</p>
      <div className="mt-4 text-xs">
        <p className="font-semibold">¿Qué significa?</p>
        <ul className="mt-2 space-y-1">
          {confidenceLevel === 'HIGH' && (
            <>
              <li>✓ Aforo de forraje disponible</li>
              <li>✓ Pesaje reciente disponible</li>
              <li>✓ Historial de movimientos completo</li>
            </>
          )}
          {confidenceLevel === 'MEDIUM' && (
            <>
              <li>⚠ Falta uno o más datos críticos</li>
              <li>→ Completa los registros faltantes</li>
            </>
          )}
          {confidenceLevel === 'LOW' && (
            <>
              <li>✗ Múltiples datos faltantes</li>
              <li>→ Registra aforos y pesajes primero</li>
            </>
          )}
        </ul>
      </div>
    </div>
  );
}
