'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FormField, DatePicker, NumberInput, Select, FormActions } from '@/components/forms';
import {
  createForage,
  calculateKgPerHectare,
  categorizeForage,
  type ForageResponse,
} from '@/services/forage.service';

interface PageProps {
  params: {
    id: string;
  };
}

interface Paddock {
  id: string;
  name: string;
  hectares: number;
}

export default function ForageNewPage({ params }: PageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paddockIdParam = searchParams.get('paddockId');

  const [paddocks, setPaddocks] = useState<Paddock[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [paddockId, setPaddockId] = useState(paddockIdParam || '');
  const [sampleDate, setSampleDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [heightCm, setHeightCm] = useState<number | ''>('');
  const [sampleWeightKg, setSampleWeightKg] = useState<number | ''>('');
  const [drymatterPercent, setDrymatterPercent] = useState<number | ''>('');

  // Cálculos automáticos
  const [kgPerHectare, setKgPerHectare] = useState(0);
  const [category, setCategory] = useState('REGULAR');

  // Cargar potreros
  useEffect(() => {
    async function loadPaddocks() {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/paddocks?farmId=${params.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (response.ok) {
          const data = await response.json();
          setPaddocks(Array.isArray(data) ? data : data.data || []);
        }
      } catch (err) {
        setError('Error cargando potreros');
      } finally {
        setLoading(false);
      }
    }
    loadPaddocks();
  }, [params.id]);

  // Recalcular kg/ha cuando cambien valores
  useEffect(() => {
    if (
      typeof sampleWeightKg === 'number' &&
      typeof drymatterPercent === 'number'
    ) {
      const calculated = calculateKgPerHectare(sampleWeightKg, drymatterPercent);
      setKgPerHectare(calculated);
      setCategory(categorizeForage(calculated));
    }
  }, [sampleWeightKg, drymatterPercent]);

  const handleSave = async () => {
    if (!paddockId || !heightCm || !sampleWeightKg || !drymatterPercent) {
      setError('Completa todos los campos requeridos');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const response: ForageResponse = await createForage({
        farmId: params.id,
        paddockId,
        sampleDate,
        heightCm: heightCm as number,
        sampleWeightKg: sampleWeightKg as number,
        drymatterPercent: drymatterPercent as number,
      });

      // Toast de éxito
      localStorage.setItem(
        'toast',
        JSON.stringify({
          type: 'success',
          message: `✅ Aforo registrado: ${response.kgPerHectare.toFixed(0)} kg/ha (${response.category})`,
        })
      );

      // Retornar a Decision Today
      router.push(`/farms/${params.id}/decision-today`);
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

  const paddockOptions = paddocks.map((p) => ({
    value: p.id,
    label: `${p.name} (${p.hectares} ha)`,
  }));

  return (
    <div className="max-w-md mx-auto py-8 px-4">
      <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
        <h1 className="text-2xl font-bold text-gray-800">🌱 Registrar Aforo</h1>
        <p className="text-sm text-gray-600">
          Marco cuadrado - Registro de biomasa disponible
        </p>

        {error && (
          <div className="bg-red-100 text-red-700 px-4 py-2 rounded text-sm">
            {error}
          </div>
        )}

        <FormField label="Potrero" required>
          <Select
            value={paddockId}
            onChange={setPaddockId}
            options={paddockOptions}
            placeholder="Selecciona un potrero"
          />
        </FormField>

        <FormField label="Fecha del Aforo" required>
          <DatePicker
            value={sampleDate}
            onChange={setSampleDate}
            max={new Date().toISOString().split('T')[0]}
          />
        </FormField>

        <FormField label="Altura (cm)" required hint="Altura del pasto en cm">
          <NumberInput
            value={heightCm}
            onChange={setHeightCm}
            min={10}
            max={200}
            placeholder="45"
          />
        </FormField>

        <FormField
          label="Peso de Muestra (kg)"
          required
          hint="Peso de la muestra cortada en el marco"
        >
          <NumberInput
            value={sampleWeightKg}
            onChange={setSampleWeightKg}
            min={0.1}
            max={5}
            step={0.01}
            decimals={2}
            placeholder="1.25"
          />
        </FormField>

        <FormField label="MS% (Materia Seca)" required hint="Porcentaje de materia seca">
          <NumberInput
            value={drymatterPercent}
            onChange={setDrymatterPercent}
            min={20}
            max={90}
            placeholder="65"
          />
        </FormField>

        {/* Cálculos automáticos */}
        {kgPerHectare > 0 && (
          <div className="bg-blue-50 p-4 rounded-md space-y-2">
            <p className="text-sm font-medium text-gray-700">📊 Cálculos Estimados:</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-gray-600">kg/ha</p>
                <p className="text-lg font-bold text-blue-600">
                  {kgPerHectare.toFixed(0)}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Estado</p>
                <p className="text-lg font-bold text-green-600">{category}</p>
              </div>
            </div>
          </div>
        )}

        <FormActions
          onSave={handleSave}
          cancelHref={`/farms/${params.id}/decision-today`}
          isLoading={saving}
          isSaveDisabled={
            !paddockId ||
            !heightCm ||
            !sampleWeightKg ||
            !drymatterPercent ||
            saving
          }
          saveLabel="Registrar Aforo"
        />
      </div>
    </div>
  );
}
