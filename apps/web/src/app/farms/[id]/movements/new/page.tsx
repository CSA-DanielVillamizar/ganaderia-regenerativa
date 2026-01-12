'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { FormField, DatePicker, Select, FormActions } from '@/components/forms';
import {
  createMovement,
  calculateEstimatedExit,
  type MovementResponse,
} from '@/services/movement.service';

interface PageProps {
  params: {
    id: string;
  };
}

interface Herd {
  id: string;
  name: string;
}

interface Paddock {
  id: string;
  name: string;
  hectares: number;
}

interface Parameters {
  minimumRestDays: number;
}

export default function MovementNewPage({ params }: PageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const herdIdParam = searchParams.get('herdId');
  const paddockIdParam = searchParams.get('paddockId');

  const [herds, setHerds] = useState<Herd[]>([]);
  const [paddocks, setPaddocks] = useState<Paddock[]>([]);
  const [parameters, setParameters] = useState<Parameters | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [herdId, setHerdId] = useState(herdIdParam || '');
  const [paddockId, setPaddockId] = useState(paddockIdParam || '');
  const [entryDate, setEntryDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [estimatedExitDate, setEstimatedExitDate] = useState('');

  // Cargar datos
  useEffect(() => {
    async function loadData() {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        // Cargar lotes
        const herdsRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/herds?farmId=${params.id}`,
          { headers }
        );
        if (herdsRes.ok) {
          const data = await herdsRes.json();
          setHerds(Array.isArray(data) ? data : data.data || []);
        }

        // Cargar potreros
        const paddocksRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/paddocks?farmId=${params.id}`,
          { headers }
        );
        if (paddocksRes.ok) {
          const data = await paddocksRes.json();
          setPaddocks(Array.isArray(data) ? data : data.data || []);
        }

        // Cargar parámetros
        const paramsRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/parameters?farmId=${params.id}`,
          { headers }
        );
        if (paramsRes.ok) {
          const data = await paramsRes.json();
          setParameters(data);
        }
      } catch (err) {
        setError('Error cargando datos');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [params.id]);

  // IDs inválidos en query
  const herdIdIsInvalid = useMemo(() => {
    return Boolean(herdIdParam) && herds.length > 0 && !herds.find(h => h.id === herdIdParam);
  }, [herdIdParam, herds]);
  const paddockIdIsInvalid = useMemo(() => {
    return Boolean(paddockIdParam) && paddocks.length > 0 && !paddocks.find(p => p.id === paddockIdParam);
  }, [paddockIdParam, paddocks]);

  // Recalcular fecha salida cuando cambien parámetros o fecha
  useEffect(() => {
    if (parameters && entryDate) {
      const calculated = calculateEstimatedExit(
        entryDate,
        parameters.minimumRestDays
      );
      setEstimatedExitDate(calculated);
    }
  }, [entryDate, parameters]);

  const handleSave = async () => {
    if (!herdId || !paddockId) {
      setError('Selecciona lote y potrero');
      return;
    }

    if (!estimatedExitDate) {
      setError('Datos insuficientes para calcular salida');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const response: MovementResponse = await createMovement({
        farmId: params.id,
        herdId,
        paddockId,
        entryDate,
        estimatedExitDate,
      });

      const herdName =
        herds.find((h) => h.id === herdId)?.name || 'Lote';
      const paddockName =
        paddocks.find((p) => p.id === paddockId)?.name || 'Potrero';

      const message = encodeURIComponent(
        `✅ Movimiento registrado: ${herdName} → ${paddockName}`
      );
      router.push(`/farms/${params.id}/decision-today?status=success&toast=${message}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Cargando formulario...</p>
      </div>
    );
  }

  const herdOptions = herds.map((h) => ({
    value: h.id,
    label: h.name,
  }));

  const paddockOptions = paddocks.map((p) => ({
    value: p.id,
    label: `${p.name} (${p.hectares} ha)`,
  }));

  return (
    <div className="max-w-md mx-auto py-8 px-4">
      <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
        <h1 className="text-2xl font-bold text-gray-800">🐄 Registrar Movimiento</h1>
        <p className="text-sm text-gray-600">
          Entrada del lote a potrero
        </p>

        {(error || herdIdIsInvalid || paddockIdIsInvalid) && (
          <div className="bg-red-100 text-red-700 px-4 py-2 rounded text-sm space-y-2">
            {error}
            {(herdIdIsInvalid || paddockIdIsInvalid) && (
              <div className="flex items-center justify-between">
                <span>ID(s) inválido(s) en el contexto</span>
                <button
                  className="px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded"
                  onClick={() => {
                    if (herdIdIsInvalid) setHerdId('');
                    if (paddockIdIsInvalid) setPaddockId('');
                  }}
                >
                  Limpiar selección
                </button>
              </div>
            )}
          </div>
        )}

        <FormField label="Lote" required>
          <Select
            value={herdId}
            onChange={setHerdId}
            options={herdOptions}
            placeholder="Selecciona un lote"
          />
        </FormField>

        <FormField label="Potrero" required>
          <Select
            value={paddockId}
            onChange={setPaddockId}
            options={paddockOptions}
            placeholder="Selecciona un potrero"
          />
        </FormField>

        <FormField label="Fecha Entrada" required hint="Fecha en que entra el lote">
          <DatePicker
            value={entryDate}
            onChange={setEntryDate}
            max={new Date().toISOString().split('T')[0]}
          />
        </FormField>

        {/* Información automática */}
        {parameters && estimatedExitDate && (
          <div className="bg-green-50 p-4 rounded-md space-y-2">
            <p className="text-sm font-medium text-gray-700">ℹ️ Información:</p>
            <div className="space-y-1 text-sm">
              <p>
                <span className="text-gray-600">Descanso Mínimo:</span>{' '}
                <span className="font-bold text-green-600">
                  {parameters.minimumRestDays} días
                </span>
              </p>
              <p>
                <span className="text-gray-600">Salida Estimada:</span>{' '}
                <span className="font-bold text-green-600">
                  {new Date(estimatedExitDate).toLocaleDateString('es-CO')}
                </span>
              </p>
            </div>
          </div>
        )}

        <FormActions
          onSave={handleSave}
          cancelHref={`/farms/${params.id}/decision-today`}
          isLoading={saving}
          isSaveDisabled={!herdId || !paddockId || saving}
          saveLabel="Registrar Movimiento"
        />
      </div>
    </div>
  );
}
