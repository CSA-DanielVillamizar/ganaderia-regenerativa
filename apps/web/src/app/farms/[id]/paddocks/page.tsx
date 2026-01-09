'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paddockService, forageService } from '@web/services/api.service';
import { LoadingSpinner } from '@web/components/common/LoadingSpinner';
import { Alert } from '@web/components/common/Alert';
import { Input } from '@web/components/common/Input';
import { Button } from '@web/components/common/Button';
import ForageForm from '@web/components/forms/ForageForm';

export default function PaddocksPage() {
  const params = useParams();
  const farmId = params.id as string;
  const queryClient = useQueryClient();
  const [error, setError] = React.useState('');
  const [form, setForm] = React.useState({ name: '', hectares: '', description: '', minRestDays: '7', pastureType: '' });
  const [selectedPaddockForAforo, setSelectedPaddockForAforo] = React.useState<any | null>(null);

  const { data: paddocks = [], isLoading } = useQuery({
    queryKey: ['paddocks', farmId],
    queryFn: () => paddockService.getByFarm(farmId).then((res) => res.data),
    enabled: !!farmId,
  });

  const createMutation = useMutation({
    mutationFn: (payload: any) => paddockService.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['paddocks', farmId] }),
  });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      await createMutation.mutateAsync({
        farmId,
        name: form.name,
        hectares: Number(form.hectares),
        description: form.description,
        minRestDays: form.minRestDays ? Number(form.minRestDays) : undefined,
        pastureType: form.pastureType || undefined,
      });
      setForm({ name: '', hectares: '', description: '', minRestDays: '7', pastureType: '' });
    } catch (err: any) {
      setError(err.response?.data?.message || 'No se pudo crear el potrero');
    }
  };

  if (isLoading) return <LoadingSpinner text="Cargando potreros..." />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Potreros</h1>
          <p className="text-gray-600">Administra potreros y aforos.</p>
        </div>
      </div>

      {error && <Alert type="error" message={error} />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-5">
          {paddocks.length === 0 ? (
            <Alert type="info" message="No hay potreros registrados" />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {paddocks.map((p: any) => (
                <div
                  key={p.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedPaddockForAforo(p)}
                >
                  <h3 className="text-lg font-semibold text-gray-900">{p.name}</h3>
                  <p className="text-gray-600 text-sm">{p.hectares} ha</p>
                  {p.minRestDays && (
                    <p className="text-sm text-blue-600 font-medium mt-1">
                      ⏳ Descanso mín: {p.minRestDays} días
                    </p>
                  )}
                  {p.pastureType && (
                    <p className="text-gray-500 text-sm">Tipo: {p.pastureType}</p>
                  )}
                  {p.description && <p className="text-gray-500 text-sm mt-1">{p.description}</p>}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPaddockForAforo(p);
                    }}
                    className="mt-3 text-sm px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                  >
                    📊 Registrar Aforo
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Formulario de Aforo o Crear Potrero */}
        <div className="bg-white rounded-lg shadow p-5 space-y-3">
          {selectedPaddockForAforo ? (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Aforo Forrajero</h3>
                <button
                  onClick={() => setSelectedPaddockForAforo(null)}
                  className="text-gray-500 hover:text-gray-700 text-xl"
                >
                  ✕
                </button>
              </div>
              <ForageForm
                paddockId={selectedPaddockForAforo.id}
                paddockName={selectedPaddockForAforo.name}
                paddockHectares={selectedPaddockForAforo.hectares}
                onSuccess={() => {
                  setSelectedPaddockForAforo(null);
                  queryClient.invalidateQueries({ queryKey: ['paddocks', farmId] });
                }}
                onCancel={() => setSelectedPaddockForAforo(null)}
              />
            </div>
          ) : (
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Agregar potrero</h3>
              <form className="space-y-3 mt-3" onSubmit={onSubmit}>
                <Input
                  label="Nombre"
                  required
                  value={form.name}
                  onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
                />
                <Input
                  label="Hectáreas"
                  type="number"
                  step="0.1"
                  required
                  value={form.hectares}
                  onChange={(e) => setForm((s) => ({ ...s, hectares: e.target.value }))}
                />
                <Input
                  label="Días mínimos de descanso"
                  type="number"
                  value={form.minRestDays}
                  onChange={(e) => setForm((s) => ({ ...s, minRestDays: e.target.value }))}
                  helperText="Default: 7 días"
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Pasto
                  </label>
                  <select
                    value={form.pastureType}
                    onChange={(e) => setForm((s) => ({ ...s, pastureType: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="">Seleccionar...</option>
                    <option value="PERENNE">Perenne</option>
                    <option value="ANUAL">Anual</option>
                    <option value="MEZCLA">Mezcla</option>
                    <option value="LEGUMINOSA">Leguminosa</option>
                  </select>
                </div>
                <Input
                  label="Descripción"
                  value={form.description}
                  onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))}
                />
                <Button type="submit" variant="primary" loading={createMutation.isPending} className="w-full">
                  Crear potrero
                </Button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
