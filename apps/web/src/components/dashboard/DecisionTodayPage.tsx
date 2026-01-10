'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { getDecisionToday } from '@web/services/decision-today.service';
import { LoadingSpinner } from '@web/components/common/LoadingSpinner';
import { EmptyState } from '@web/components/common/EmptyState';
import { ErrorState } from '@web/components/common/ErrorState';
import { DecisionTodayResponse } from '@shared/index';
import { ConfidenceBadge } from './ConfidenceBadge';
import { ExplainabilityPanel } from './ExplainabilityPanel';
import { ActionChecklistPanel } from './ActionChecklistPanel';

interface DecisionTodayProps {
  farmId: string;
}

/**
 * Página principal: "Decisión de Hoy"
 * Muestra la recomendación diaria de rotación y acciones pendientes
 */
export function DecisionTodayPage({ farmId }: DecisionTodayProps) {
  const router = useRouter();

  const {
    data: decision,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['decision-today', farmId],
    queryFn: () => getDecisionToday(farmId),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    const apiError = error as any;
    return (
      <ErrorState
        title="Error al cargar decisión de hoy"
        message={apiError?.message || 'No se pudo conectar con el servidor'}
        traceId={apiError?.traceId}
        action={{
          label: 'Reintentar',
          onClick: () => refetch(),
        }}
      />
    );
  }

  if (!decision) {
    return (
      <EmptyState
        title="No hay decisión disponible"
        description="No se pueden procesar datos suficientes en este momento"
        icon="📭"
      />
    );
  }

  const hasRecommendation = !!decision.recommendedNextPaddock;
  const hasActions = decision.actionChecklist && decision.actionChecklist.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Decisión de Hoy</h1>
        <p className="text-gray-600 mt-2">
          {new Date().toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </div>

      {/* Main recommendation card */}
      {hasRecommendation ? (
        <RecommendationCard decision={decision} farmId={farmId} />
      ) : (
        <NoRecommendationCard decision={decision} />
      )}

      {/* Confidence level and explainability */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <ConfidenceBadge confidenceLevel={decision.confidenceLevel} />
        </div>
        <div className="lg:col-span-2">
          <ExplainabilityPanel reasons={decision.explainability} />
        </div>
      </div>

      {/* Action checklist */}
      {hasActions && <ActionChecklistPanel actions={decision.actionChecklist} farmId={farmId} />}

      {/* Refresh button */}
      <button
        onClick={() => refetch()}
        className="mt-6 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
      >
        🔄 Actualizar
      </button>
    </div>
  );
}

/**
 * Card de recomendación principal
 */
function RecommendationCard({ decision, farmId }: { decision: DecisionTodayResponse; farmId: string }) {
  const router = useRouter();

  const handleCreateMovement = () => {
    router.push(
      `/farms/${farmId}/movements/new?herdId=${decision.recommendedHerd?.id || ''}&paddockId=${decision.recommendedNextPaddock?.id || ''}`
    );
  };

  return (
    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl p-6 shadow-md">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-green-900">
            🚀 {decision.recommendedNextPaddock?.name || 'Movimiento recomendado'}
          </h2>
          <p className="text-green-700 mt-1">
            {decision.recommendedHerd?.name && `Hato: ${decision.recommendedHerd.name}`}
          </p>
        </div>
        <span className="text-4xl">{decision.recommendedNextPaddock?.name?.charAt(0) || '📍'}</span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {decision.recommendedNextPaddock && (
          <>
            <StatBox
              label="Hectáreas"
              value={decision.recommendedNextPaddock.hectares?.toFixed(2) || 'N/A'}
              icon="📏"
            />
            <StatBox
              label="Descanso Mín."
              value={decision.minRestDays?.toString() || 'N/A'}
              icon="⏱️"
            />
            {decision.recommendedNextPaddock.availableForageKg && (
              <StatBox
                label="Forraje (kg MS)"
                value={decision.recommendedNextPaddock.availableForageKg.toFixed(0)}
                icon="🌱"
              />
            )}
            {decision.recommendedHerd?.currentUA && (
              <StatBox label="Carga (UA)" value={decision.recommendedHerd.currentUA.toFixed(1)} icon="🐄" />
            )}
          </>
        )}
      </div>

      <button
        onClick={handleCreateMovement}
        className="w-full px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
      >
        ✅ Registrar Movimiento
      </button>
    </div>
  );
}

/**
 * Card cuando no hay recomendación
 */
function NoRecommendationCard({ decision }: { decision: DecisionTodayResponse }) {
  return (
    <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-6 shadow-md">
      <h2 className="text-xl font-bold text-yellow-900">⚠️ No hay recomendación disponible</h2>
      <p className="text-yellow-700 mt-2">
        Faltan datos críticos para generar una recomendación. Completa las acciones del checklist a continuación.
      </p>
    </div>
  );
}

/**
 * Caja de estadística reutilizable
 */
function StatBox({ label, value, icon }: { label: string; value: string | number; icon: string }) {
  return (
    <div className="bg-white rounded-lg p-3 border border-green-200">
      <p className="text-sm text-gray-600">{label}</p>
      <p className="text-2xl font-bold text-green-900 mt-1">
        {icon} {value}
      </p>
    </div>
  );
}
