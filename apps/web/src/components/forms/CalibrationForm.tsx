'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface CalibrationFormProps {
  farmId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

/**
 * Formulario de Calibración de Cinta Métrica
 * 
 * Permite al usuario:
 * 1. Ver calibración actual (divisor)
 * 2. Realizar calibración manual (ajuste de divisor)
 * 3. Usar calibración automática con pesajes históricos
 */
export default function CalibrationForm({
  farmId,
  onSuccess,
  onCancel,
}: CalibrationFormProps) {
  const queryClient = useQueryClient();
  const [divisor, setDivisor] = useState('11877');
  const [notes, setNotes] = useState('');
  const [mode, setMode] = useState<'manual' | 'auto'>('manual');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Simulación: obtener calibración actual
  const { data: current } = useQuery({
    queryKey: ['calibration', farmId],
    queryFn: async () => {
      // En producción: llamar a /calibration/farms/:farmId
      return { divisor: 11877, status: 'PENDING' };
    },
  });

  useEffect(() => {
    if (current) {
      setDivisor(current.divisor.toString());
    }
  }, [current]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const div = parseFloat(divisor);
      if (div < 10000 || div > 13000) {
        throw new Error('Divisor debe estar entre 10000 y 13000');
      }

      // Simulación: POST /calibration/farms/:farmId
      console.log('Calibración guardada:', { divisor: div, notes });
      
      // Invalidar cache
      queryClient.invalidateQueries({ queryKey: ['calibration', farmId] });
      
      setSuccess('Calibración guardada correctamente');
      setTimeout(() => {
        onSuccess?.();
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Error al guardar calibración');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-blue-200 p-6 max-w-md">
      <h2 className="text-lg font-bold text-gray-900 mb-4">
        🔧 Calibración de Cinta Métrica
      </h2>

      {/* Información actual */}
      {current && (
        <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-4">
          <p className="text-sm text-blue-900">
            <strong>Divisor actual:</strong> {current.divisor}
          </p>
          <p className="text-xs text-blue-800 mt-1">
            Estado: <span className="font-semibold">{current.status}</span>
          </p>
        </div>
      )}

      {/* Modo selección */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Modo de Calibración
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setMode('manual')}
            className={`flex-1 px-3 py-2 rounded text-sm font-medium transition ${
              mode === 'manual'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Manual
          </button>
          <button
            type="button"
            onClick={() => setMode('auto')}
            className={`flex-1 px-3 py-2 rounded text-sm font-medium transition ${
              mode === 'auto'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Automática
          </button>
        </div>
        <p className="text-xs text-gray-600 mt-2">
          {mode === 'manual'
            ? 'Ajusta el divisor manualmente según tus observaciones'
            : 'Sistema ajusta automáticamente usando pesajes históricos'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Campo divisor */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Divisor (fórmula: girth² × length ÷ divisor)
          </label>
          <input
            type="number"
            value={divisor}
            onChange={(e) => setDivisor(e.target.value)}
            min="10000"
            max="13000"
            step="10"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">
            Rango: 10000 - 13000 (Default Bovonómia: 11877)
          </p>
        </div>

        {/* Notas */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notas (opcional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ej: Ajustado para raza Brahman cruzada"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Mensajes */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-900 px-3 py-2 rounded text-sm">
            ❌ {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-900 px-3 py-2 rounded text-sm">
            ✅ {success}
          </div>
        )}

        {/* Botones */}
        <div className="flex gap-2 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading ? 'Guardando...' : 'Guardar Calibración'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-medium hover:bg-gray-300 transition"
          >
            Cancelar
          </button>
        </div>
      </form>

      {/* Información educativa */}
      <div className="mt-6 bg-amber-50 border border-amber-200 rounded p-3">
        <p className="text-xs font-semibold text-amber-900 mb-2">💡 Cómo calibrar:</p>
        <ol className="text-xs text-amber-800 space-y-1 list-decimal list-inside">
          <li>Pesa 10+ animales con báscula real</li>
          <li>Mide perímetro torácico y largo corporal en cada animal</li>
          <li>Sistema calcula divisor óptimo automáticamente</li>
          <li>O ajusta manualmente hasta minimizar diferencias</li>
        </ol>
      </div>
    </div>
  );
}
