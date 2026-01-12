'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  calculateRestDays,
  evaluateRestStatus,
  calculateUA,
  calculateForageBalance,
  calculateOptimalOccupationDays,
  validateMovementSafety,
  type RestStatus,
  type ForageBalance,
} from '@/lib/agronomy/calculations';
import { Loader, AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface Paddock {
  id: string;
  name: string;
  hectares: number;
}

interface Herd {
  id: string;
  name: string;
  currentWeight: number;
}

interface MovementFormProps {
  farmId: string;
  paddocks: Paddock[];
  herds: Herd[];
  onSuccess?: (movement: any) => void;
  onCancel?: () => void;
  preSelectedPaddockId?: string;
  preSelectedHerdId?: string;
}

/**
 * Formulario de Movimiento con Asistente Agronómico Inteligente
 *
 * Implementa guía agronómica en tiempo real:
 * - Valida días de descanso
 * - Calcula balance forrajero
 * - Muestra alertas críticas
 * - Sugiere días óptimos de ocupación
 */
export default function MovementForm({
  farmId,
  paddocks,
  herds,
  onSuccess,
  onCancel,
  preSelectedPaddockId,
  preSelectedHerdId,
}: MovementFormProps) {
  // Estado del formulario
  const [paddockId, setPaddockId] = useState(preSelectedPaddockId || '');
  const [herdId, setHerdId] = useState(preSelectedHerdId || '');
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split('T')[0]);
  const [plannedDays, setPlannedDays] = useState(2);

  // Estado del asistente
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [restStatus, setRestStatus] = useState<RestStatus | null>(null);
  const [forageBalance, setForageBalance] = useState<ForageBalance | null>(null);
  const [safetyCheck, setSafetyCheck] = useState<{ safe: boolean; reason?: string } | null>(null);
  const [error, setError] = useState('');

  // Datos calculados
  const selectedPaddock = paddocks.find((p) => p.id === paddockId);
  const selectedHerd = herds.find((h) => h.id === herdId);
  const herdUA = selectedHerd ? calculateUA(selectedHerd.currentWeight) : 0;

  /**
   * Analizar potrero seleccionado
   */
  const analyzePaddock = useCallback(async () => {
    if (!paddockId || !herdId || !selectedPaddock || !selectedHerd) {
      setRestStatus(null);
      setForageBalance(null);
      setSafetyCheck(null);
      return;
    }

    setAnalyzing(true);
    setError('');

    try {
      // Simular obtención de última salida (en real, vendría de API)
      const lastExitDate = new Date(entryDate);
      lastExitDate.setDate(lastExitDate.getDate() - 48);

      // Calcular días de descanso
      const restDays = calculateRestDays(lastExitDate, entryDate);
      const status = evaluateRestStatus(restDays);
      setRestStatus(status);

      // Simular balance forrajero (en real, tendría datos reales de aforo)
      const balance = calculateForageBalance(
        2500 * selectedPaddock.hectares * 0.6, // Simulación: 2500 kg MS/ha
        herdUA,
        selectedPaddock.hectares,
        plannedDays
      );
      setForageBalance(balance);

      // Validar seguridad
      const safety = validateMovementSafety(restDays, balance);
      setSafetyCheck(safety);
    } catch (err) {
      console.error('Error analizando potrero:', err);
      setError('Error al analizar el potrero. Intenta nuevamente.');
    } finally {
      setAnalyzing(false);
    }
  }, [paddockId, herdId, entryDate, plannedDays, selectedPaddock, selectedHerd, herdUA]);

  useEffect(() => {
    analyzePaddock();
  }, [analyzePaddock]);

  /**
   * Manejar envío del formulario
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!paddockId || !herdId) {
      setError('Selecciona potrero y lote');
      return;
    }

    if (safetyCheck && !safetyCheck.safe) {
      const confirmOverride = window.confirm(
        `⚠️ ADVERTENCIA CRÍTICA:\n\n${safetyCheck.reason}\n\n` +
          `¿Estás seguro de que quieres continuar?`
      );

      if (!confirmOverride) {
        return;
      }
    }

    setLoading(true);

    try {
      // Simular API call
      const movement = {
        id: Math.random().toString(36),
        farmId,
        herdId,
        paddockId,
        entryDate,
        estimatedExitDate: new Date(
          new Date(entryDate).getTime() + plannedDays * 24 * 60 * 60 * 1000
        )
          .toISOString()
          .split('T')[0],
      };

      onSuccess?.(movement);
    } catch (err: any) {
      setError(err.message || 'Error al registrar movimiento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-300 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <div className="text-3xl">🌱</div>
          <div>
            <h3 className="font-bold text-green-900">Asistente Voisin</h3>
            <p className="text-sm text-green-700">
              Te ayudo a tomar decisiones regenerativas basadas en oferta/demanda forraje
            </p>
          </div>
        </div>
      </div>

      {/* Selección de Lote */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Lote a Mover *</label>
        <select
          value={herdId}
          onChange={(e) => setHerdId(e.target.value)}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          required
        >
          <option value="">Seleccionar lote...</option>
          {herds.map((herd) => (
            <option key={herd.id} value={herd.id}>
              {herd.name} ({calculateUA(herd.currentWeight).toFixed(1)} UA)
            </option>
          ))}
        </select>

        {selectedHerd && (
          <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>Lote:</strong> {selectedHerd.name}
            </p>
            <p className="text-sm text-blue-800">
              <strong>Peso Total:</strong> {selectedHerd.currentWeight.toLocaleString()} kg
            </p>
            <p className="text-sm text-blue-800">
              <strong>UA:</strong> {herdUA.toFixed(2)}
            </p>
          </div>
        )}
      </div>

      {/* Selección de Potrero */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Potrero Destino *</label>
        <select
          value={paddockId}
          onChange={(e) => setPaddockId(e.target.value)}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          required
        >
          <option value="">Seleccionar potrero...</option>
          {paddocks.map((paddock) => (
            <option key={paddock.id} value={paddock.id}>
              {paddock.name} ({paddock.hectares} ha)
            </option>
          ))}
        </select>

        {/* ANÁLISIS DE DESCANSO */}
        {analyzing && (
          <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
            <Loader className="w-4 h-4 animate-spin" />
            Analizando potrero...
          </div>
        )}

        {restStatus && !analyzing && (
          <div
            className={`mt-3 p-4 rounded-lg border-2 ${
              restStatus.color === 'red'
                ? 'bg-red-50 border-red-300'
                : restStatus.color === 'yellow'
                  ? 'bg-yellow-50 border-yellow-300'
                  : restStatus.color === 'orange'
                    ? 'bg-orange-50 border-orange-300'
                    : 'bg-green-50 border-green-300'
            }`}
          >
            {restStatus.color === 'red' && (
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-900">ALERTA CRÍTICA</p>
                  <p className="text-sm text-red-800 mt-1">{restStatus.message}</p>
                  <div className="mt-2 bg-red-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-red-600 h-full transition-all"
                      style={{ width: `${restStatus.progressPercent}%` }}
                    />
                  </div>
                  <p className="text-xs text-red-700 mt-1">
                    Progreso: {restStatus.progressPercent}%
                  </p>
                </div>
              </div>
            )}

            {restStatus.color === 'yellow' && (
              <div className="flex items-start gap-2">
                <Info className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-yellow-900">Descanso Mínimo</p>
                  <p className="text-sm text-yellow-800 mt-1">{restStatus.message}</p>
                </div>
              </div>
            )}

            {restStatus.color === 'green' && (
              <div className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-green-900">¡Punto Óptimo!</p>
                  <p className="text-sm text-green-800 mt-1">{restStatus.message}</p>
                </div>
              </div>
            )}

            {restStatus.color === 'orange' && (
              <div className="flex items-start gap-2">
                <Info className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-orange-900">Descanso Prolongado</p>
                  <p className="text-sm text-orange-800 mt-1">{restStatus.message}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Fecha de Entrada */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de Entrada *</label>
        <input
          type="date"
          value={entryDate}
          onChange={(e) => setEntryDate(e.target.value)}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          required
        />
      </div>

      {/* Días Planeados */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Días de Ocupación Planeados
        </label>
        <input
          type="number"
          value={plannedDays}
          onChange={(e) => setPlannedDays(parseInt(e.target.value) || 2)}
          min={1}
          max={7}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
        <p className="text-xs text-gray-500 mt-1">
          Voisin recomienda máximo 3 días (alta densidad, corta ocupación)
        </p>
      </div>

      {/* BALANCE FORRAJERO */}
      {forageBalance && (
        <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4 space-y-3">
          <h4 className="font-semibold text-blue-900">📊 Balance Forrajero</h4>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-blue-700">Oferta Disponible:</p>
              <p className="text-lg font-bold text-blue-900">
                {forageBalance.supplyKgMS.toLocaleString()} kg MS
              </p>
            </div>
            <div>
              <p className="text-blue-700">Demanda ({plannedDays} días):</p>
              <p className="text-lg font-bold text-blue-900">
                {forageBalance.demandKgMS.toLocaleString()} kg MS
              </p>
            </div>
            <div>
              <p className="text-blue-700">Balance:</p>
              <p
                className={`text-lg font-bold ${
                  forageBalance.balanceKgMS >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {forageBalance.balanceKgMS >= 0 ? '+' : ''}
                {forageBalance.balanceKgMS.toLocaleString()} kg MS
              </p>
            </div>
            <div>
              <p className="text-blue-700">Días Reales:</p>
              <p className="text-lg font-bold text-blue-900">{forageBalance.daysAvailable} días</p>
            </div>
          </div>

          <div className="pt-2 border-t border-blue-200">
            <p className="text-xs text-blue-700">
              <strong>Carga Instantánea:</strong> {forageBalance.instantaneousStockingRate} UA/ha
            </p>
          </div>

          {forageBalance.status === 'DEFICIT' && (
            <div className="bg-red-100 border border-red-300 rounded p-2">
              <p className="text-sm text-red-800 font-semibold">
                ⚠️ DÉFICIT FORRAJERO: No hay suficiente pasto para el lote
              </p>
            </div>
          )}
        </div>
      )}

      {/* Errores */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Botones */}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={loading || analyzing}
          className="flex-1 bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              Guardando...
            </>
          ) : (
            'Registrar Movimiento'
          )}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
