/**
 * Componente de estado de error reutilizable
 * Muestra el error con traceId para debugging
 */

interface ErrorStateProps {
  title?: string;
  message: string;
  traceId?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function ErrorState({ 
  title = 'Algo salió mal', 
  message, 
  traceId, 
  action 
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 bg-red-50 rounded-lg border border-red-200">
      <div className="text-5xl mb-4">❌</div>
      <h3 className="text-lg font-semibold text-red-900">{title}</h3>
      <p className="text-red-700 text-center mt-2 max-w-sm">{message}</p>
      
      {traceId && (
        <div className="mt-4 p-3 bg-white rounded border border-red-200 max-w-sm w-full">
          <p className="text-xs text-gray-600 font-mono break-all">
            <span className="font-semibold">Trace ID:</span> {traceId}
          </p>
        </div>
      )}
      
      {action && (
        <button
          onClick={action.onClick}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
