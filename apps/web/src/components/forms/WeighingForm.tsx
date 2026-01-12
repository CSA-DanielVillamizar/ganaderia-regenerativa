'use client';

import { useState } from 'react';
import { CreateWeighingDto, CreateWeighingDtoSchema } from '@ganaderia/shared';
import { weighingService } from '@web/services/api.service';

interface WeighingFormProps {
  herdId: string;
  herdName: string;
  animalCount: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

type WeighingMethod = 'SCALE' | 'TAPE';

interface WeighingFormProps {
  herdId: string;
  herdName: string;
  animalCount: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

/**
 * Formulario de pesaje con soporte para báscula y cinta métrica
 *
 * Características MVP:
 * - Método: Báscula (peso directo) o Cinta (estimación)
 * - Cinta: perímetro torácico + longitud corporal → estimación automática
 * - Validación con Zod antes de enviar
 * - Cálculo automático de peso promedio por animal
 */
export default function WeighingForm({
  herdId,
  herdName,
  animalCount,
  onSuccess,
  onCancel,
}: WeighingFormProps) {
  const [method, setMethod] = useState<WeighingMethod>('SCALE');
  const [weight, setWeight] = useState('');
  const [chestGirth, setChestGirth] = useState('');
  const [bodyLength, setBodyLength] = useState('');
  const [estimatedWeight, setEstimatedWeight] = useState<number | null>(null);
  const [animalCountInput, setAnimalCountInput] = useState(animalCount.toString());
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  /**
   * Fórmula de estimación por cinta métrica:
   * Peso (kg) = (Perímetro Torácico² × Longitud Corporal) / 11877
   */
  const calculateTapeEstimation = (girth: number, length: number): number => {
    return (girth * girth * length) / 11877;
  };

  const handleChestGirthChange = (value: string) => {
    setChestGirth(value);
    if (value && bodyLength) {
      const estimated = calculateTapeEstimation(parseFloat(value), parseFloat(bodyLength));
      setEstimatedWeight(Math.round(estimated));
    }
  };

  const handleBodyLengthChange = (value: string) => {
    setBodyLength(value);
    if (chestGirth && value) {
      const estimated = calculateTapeEstimation(parseFloat(chestGirth), parseFloat(value));
      setEstimatedWeight(Math.round(estimated));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const dto: CreateWeighingDto = {
        herdId,
        weight: method === 'SCALE' ? parseFloat(weight) : estimatedWeight || 0,
        animalCount: parseInt(animalCountInput),
        notes: notes || undefined,
        method,
      };

      // Agregar campos de cinta si aplica
      if (method === 'TAPE' && chestGirth && bodyLength) {
        dto.chestGirthCm = parseFloat(chestGirth);
        dto.bodyLengthCm = parseFloat(bodyLength);
        dto.estimatedWeightKg = estimatedWeight || undefined;
      }

      // Validar con Zod
      CreateWeighingDtoSchema.parse(dto);

      await weighingService.create(dto);
      onSuccess?.();
    } catch (err: any) {
      setError(err.message || 'Error al registrar pesaje');
    } finally {
      setLoading(false);
    }
  };

  const weightPerAnimal =
    method === 'SCALE' && weight
      ? (parseFloat(weight) / parseInt(animalCountInput)).toFixed(1)
      : estimatedWeight
        ? (estimatedWeight / parseInt(animalCountInput)).toFixed(1)
        : '0';

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-1">Registrar Pesaje</h3>
        <p className="text-sm text-blue-700">
          Lote: <span className="font-medium">{herdName}</span> • {animalCount} animales
        </p>
      </div>

      {/* Selector de Método */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Método de Pesaje</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setMethod('SCALE')}
            className={`py-3 px-4 rounded-lg border-2 transition-all ${
              method === 'SCALE'
                ? 'border-blue-500 bg-blue-50 text-blue-900'
                : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
            }`}
          >
            <div className="text-lg mb-1">⚖️</div>
            <div className="font-medium">Báscula</div>
            <div className="text-xs mt-1 text-gray-600">Peso directo</div>
          </button>
          <button
            type="button"
            onClick={() => setMethod('TAPE')}
            className={`py-3 px-4 rounded-lg border-2 transition-all ${
              method === 'TAPE'
                ? 'border-green-500 bg-green-50 text-green-900'
                : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
            }`}
          >
            <div className="text-lg mb-1">📏</div>
            <div className="font-medium">Cinta Métrica</div>
            <div className="text-xs mt-1 text-gray-600">Estimación</div>
          </button>
        </div>
      </div>

      {/* Método: Báscula */}
      {method === 'SCALE' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Peso Total del Lote (kg) *
          </label>
          <input
            type="number"
            step="0.1"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ej: 2500"
            required
          />
        </div>
      )}

      {/* Método: Cinta Métrica */}
      {method === 'TAPE' && (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-semibold text-green-900 mb-2">📐 Mediciones Corporales</h4>
            <p className="text-sm text-green-700 mb-3">
              Toma las medidas de un animal representativo del lote:
            </p>
            <ul className="text-xs text-green-700 space-y-1 ml-4 list-disc">
              <li>Perímetro torácico: rodea el tórax por detrás de los hombros</li>
              <li>Longitud corporal: desde la punta del hombro hasta el isquion</li>
            </ul>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Perímetro Torácico (cm) *
              </label>
              <input
                type="number"
                step="0.1"
                value={chestGirth}
                onChange={(e) => handleChestGirthChange(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Ej: 175"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Longitud Corporal (cm) *
              </label>
              <input
                type="number"
                step="0.1"
                value={bodyLength}
                onChange={(e) => handleBodyLengthChange(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Ej: 150"
                required
              />
            </div>
          </div>

          {estimatedWeight && (
            <div className="bg-gradient-to-r from-green-100 to-green-50 border-2 border-green-300 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-green-700 font-medium mb-1">
                    Peso Estimado por Animal
                  </div>
                  <div className="text-3xl font-bold text-green-900">{estimatedWeight} kg</div>
                </div>
                <div className="text-4xl">🎯</div>
              </div>
              <div className="mt-2 text-xs text-green-600">
                Peso total del lote:{' '}
                {(estimatedWeight * parseInt(animalCountInput || '1')).toFixed(0)} kg
              </div>
            </div>
          )}
        </div>
      )}

      {/* Cantidad de Animales */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Cantidad de Animales Pesados
        </label>
        <input
          type="number"
          value={animalCountInput}
          onChange={(e) => setAnimalCountInput(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          min="1"
          required
        />
      </div>

      {/* Peso Promedio */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="text-sm text-gray-600 mb-1">Peso Promedio por Animal</div>
        <div className="text-2xl font-bold text-gray-900">{weightPerAnimal} kg</div>
      </div>

      {/* Notas */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Notas (opcional)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Observaciones del pesaje..."
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {/* Botones de Acción */}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={
            loading || (method === 'SCALE' && !weight) || (method === 'TAPE' && !estimatedWeight)
          }
          className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? 'Guardando...' : 'Guardar Pesaje'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
