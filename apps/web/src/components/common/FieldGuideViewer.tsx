'use client';

import { useState } from 'react';
import { FieldGuide, FIELD_GUIDES, FieldGuideStep } from '@web/lib/field-guides';

interface FieldGuideViewerProps {
  guideId: string;
  onClose?: () => void;
}

/**
 * Componente para visualizar guías de campo paso a paso
 * 
 * Épica 8: Guías Interactivas
 */
export default function FieldGuideViewer({
  guideId,
  onClose,
}: FieldGuideViewerProps) {
  const guide = FIELD_GUIDES[guideId] as FieldGuide | undefined;
  const [currentStep, setCurrentStep] = useState(0);

  if (!guide) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-900 p-4 rounded">
        Guía no encontrada: {guideId}
      </div>
    );
  }

  const step = guide.steps[currentStep];
  const progress = ((currentStep + 1) / guide.steps.length) * 100;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'WEIGHING':
        return '⚖️';
      case 'FORAGE':
        return '🌾';
      case 'MOVEMENT':
        return '🐄';
      case 'GENERAL':
        return '📋';
      default:
        return '📖';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'WEIGHING':
        return 'bg-blue-50 border-blue-200';
      case 'FORAGE':
        return 'bg-green-50 border-green-200';
      case 'MOVEMENT':
        return 'bg-purple-50 border-purple-200';
      case 'GENERAL':
        return 'bg-gray-50 border-gray-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className={`${getCategoryColor(guide.category)} border-b p-6`}>
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                {getCategoryIcon(guide.category)} {guide.name}
              </h1>
              <p className="text-gray-600 mt-1">{guide.description}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
            >
              ✕
            </button>
          </div>

          {/* Meta info */}
          <div className="flex gap-4 text-sm text-gray-700">
            {guide.materials && (
              <div>
                <strong>Materiales:</strong> {guide.materials.length} requeridos
              </div>
            )}
            <div>
              <strong>⏱️ Duración:</strong> {guide.duration} min
            </div>
            <div>
              <strong>📝 Pasos:</strong> {guide.steps.length}
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="bg-gray-100 h-2">
          <div
            className="bg-blue-600 h-full transition-all"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Paso actual */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">
                Paso {step.number}: {step.title}
              </h2>
              <div className="text-sm font-semibold bg-blue-100 text-blue-900 px-3 py-1 rounded">
                {currentStep + 1} de {guide.steps.length}
              </div>
            </div>

            <p className="text-lg text-gray-700 mb-6 leading-relaxed">
              {step.description}
            </p>

            {/* Tips */}
            {step.tips && step.tips.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <h3 className="font-semibold text-blue-900 mb-2">💡 Consejos:</h3>
                <ul className="space-y-1 text-blue-900 text-sm">
                  {step.tips.map((tip, idx) => (
                    <li key={idx} className="flex gap-2">
                      <span>•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Warnings */}
            {step.warnings && step.warnings.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <h3 className="font-semibold text-red-900 mb-2">⚠️ Advertencias:</h3>
                <ul className="space-y-1 text-red-900 text-sm">
                  {step.warnings.map((warning, idx) => (
                    <li key={idx} className="flex gap-2">
                      <span>!</span>
                      <span>{warning}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Materials section (solo en primer paso) */}
          {currentStep === 0 && guide.materials && guide.materials.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8">
              <h3 className="font-semibold text-amber-900 mb-2">📦 Materiales necesarios:</h3>
              <ul className="space-y-1 text-amber-900 text-sm">
                {guide.materials.map((material, idx) => (
                  <li key={idx} className="flex gap-2">
                    <input type="checkbox" className="cursor-pointer" />
                    <span>{material}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Safety section (solo en primer paso) */}
          {currentStep === 0 && guide.safetyNotes && guide.safetyNotes.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
              <h3 className="font-semibold text-yellow-900 mb-2">🛡️ Normas de seguridad:</h3>
              <ul className="space-y-1 text-yellow-900 text-sm">
                {guide.safetyNotes.map((note, idx) => (
                  <li key={idx} className="flex gap-2">
                    <span>✓</span>
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Step navigation */}
          <div className="flex gap-3">
            <button
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              ← Anterior
            </button>

            {currentStep === guide.steps.length - 1 ? (
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition"
              >
                ✅ Completado
              </button>
            ) : (
              <button
                onClick={() => setCurrentStep(Math.min(guide.steps.length - 1, currentStep + 1))}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
              >
                Siguiente →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
