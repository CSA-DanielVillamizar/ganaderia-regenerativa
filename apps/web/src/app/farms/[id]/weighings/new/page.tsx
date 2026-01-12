'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { FormField, DatePicker, NumberInput, Select, FormActions } from '@/components/forms';
import {
  createWeighing,
  calculateAverageWeight,
  calculateUA,
  type WeighingResponse,
} from '@/services/weighing.service';

interface PageProps {
  params: {
    id: string;
  };
}

interface Herd {
  id: string;
  name: string;
  currentUA: number;
}

export default function WeighingNewPage({ params }: PageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const herdIdParam = searchParams.get('herdId');

  const [herds, setHerds] = useState<Herd[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [herdId, setHerdId] = useState(herdIdParam || '');
  const [weighDate, setWeighDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [numberOfAnimals, setNumberOfAnimals] = useState<number | ''>('');
  const [totalWeightKg, setTotalWeightKg] = useState<number | ''>('');

  // Cálculos automáticos
  const [averageWeight, setAverageWeight] = useState(0);
  const [newUA, setNewUA] = useState(0);

  // Cargar lotes
  useEffect(() => {
    async function loadHerds() {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/herds?farmId=${params.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (response.ok) {
          const data = await response.json();
          setHerds(Array.isArray(data) ? data : data.data || []);
        }
      } catch (err) {
        setError('Error cargando lotes');
      } finally {
        setLoading(false);
      }
    }
    loadHerds();
  }, [params.id]);

  // Invalid herdId from query
  const herdIdIsInvalid = useMemo(() => {
    return Boolean(herdIdParam) && herds.length > 0 && !herds.find(h => h.id === herdIdParam);
  }, [herdIdParam, herds]);

  // Recalcular automáticamente
  useEffect(() => {
    if (typeof numberOfAnimals === 'number' && typeof totalWeightKg === 'number') {
      const avg = calculateAverageWeight(totalWeightKg, numberOfAnimals);
      setAverageWeight(avg);
      setNewUA(calculateUA(avg));
    }
  }, [numberOfAnimals, totalWeightKg]);

  const handleSave = async () => {
    if (!herdId || !numberOfAnimals || !totalWeightKg) {
      setError('Completa todos los campos requeridos');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const response: WeighingResponse = await createWeighing({
        farmId: params.id,
        herdId,
        weighDate,
        numberOfAnimals: numberOfAnimals as number,
        totalWeightKg: totalWeightKg as number,
      });

      const gain = response.gainSinceLastWeighing
        ? `${response.gainSinceLastWeighing > 0 ? '+' : ''}${response.gainSinceLastWeighing.toFixed(1)} kg`
        : 'primer pesaje';

      const message = encodeURIComponent(`✅ Pesaje registrado - Ganancia: ${gain}`);
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
    label: `${h.name} (${h.currentUA.toFixed(1)} UA)`,
  }));

  return (
    <div className="max-w-md mx-auto py-8 px-4">
      <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
        <h1 className="text-2xl font-bold text-gray-800">⚖️ Registrar Pesaje</h1>
        <p className="text-sm text-gray-600">Control de ganancia de peso</p>

        {(error || herdIdIsInvalid) && (
          <div className="bg-red-100 text-red-700 px-4 py-2 rounded text-sm space-y-2">
            {error}
            {herdIdIsInvalid && (
              <div className="flex items-center justify-between">
                <span>ID de lote inválido en el contexto</span>
                <button
                  className="px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded"
                  onClick={() => setHerdId('')}
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

        <FormField label="Fecha del Pesaje" required>
          <DatePicker
            value={weighDate}
            onChange={setWeighDate}
            max={new Date().toISOString().split('T')[0]}
          />
        </FormField>

        <FormField label="Número de Animales" required>
          <NumberInput
            value={numberOfAnimals}
            onChange={setNumberOfAnimals}
            min={1}
            max={10000}
            placeholder="15"
          />
        </FormField>

        <FormField label="Peso Total (kg)" required>
          <NumberInput
            value={totalWeightKg}
            onChange={setTotalWeightKg}
            min={0}
            max={999999}
            step={10}
            decimals={1}
            placeholder="4950"
          />
        </FormField>

        {/* Cálculos automáticos */}
        {averageWeight > 0 && (
          <div className="bg-blue-50 p-4 rounded-md space-y-2">
            <p className="text-sm font-medium text-gray-700">📊 Cálculos Automáticos:</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-gray-600">Peso Promedio</p>
                <p className="text-lg font-bold text-blue-600">
                  {averageWeight.toFixed(1)} kg
                </p>
              </div>
              <div>
                <p className="text-gray-600">UA (New)</p>
                <p className="text-lg font-bold text-blue-600">
                  {newUA.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        )}

        <FormActions
          onSave={handleSave}
          cancelHref={`/farms/${params.id}/decision-today`}
          isLoading={saving}
          isSaveDisabled={
            !herdId || !numberOfAnimals || !totalWeightKg || saving
          }
          saveLabel="Registrar Pesaje"
        />
      </div>
    </div>
  );
}
