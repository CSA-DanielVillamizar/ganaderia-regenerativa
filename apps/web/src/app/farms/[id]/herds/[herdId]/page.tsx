'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { herdService, weighingService, movementService, paddockService } from '@web/services/api.service';
import { LoadingSpinner } from '@web/components/common/LoadingSpinner';
import { Alert } from '@web/components/common/Alert';
import { Button } from '@web/components/common/Button';
import { Input } from '@web/components/common/Input';
import { formatKg, formatUA, formatDate } from '@web/lib/utils';
import WeighingForm from '@web/components/forms/WeighingForm';

export default function HerdDetailPage() {
  const params = useParams();
  const farmId = params.id as string;
  const herdId = params.herdId as string;
  const queryClient = useQueryClient();
  const [formError, setFormError] = React.useState('');

  const herdQuery = useQuery({
    queryKey: ['herd', herdId],
    queryFn: () => herdService.getById(herdId).then((res) => res.data),
    enabled: !!herdId,
  });

  const weighingsQuery = useQuery({
    queryKey: ['weighings', herdId],
    queryFn: () => weighingService.getByHerd(herdId).then((res) => res.data),
    enabled: !!herdId,
  });

  const movementsQuery = useQuery({
    queryKey: ['movements', herdId],
    queryFn: () => movementService.getByHerd(herdId).then((res) => res.data.data),
    enabled: !!herdId,
  });

  const paddocksQuery = useQuery({
    queryKey: ['paddocks', farmId],
    queryFn: () => paddockService.getByFarm(farmId).then((res) => res.data),
    enabled: !!farmId,
  });

  const createWeighing = useMutation({
    mutationFn: (payload: any) => weighingService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weighings', herdId] });
      queryClient.invalidateQueries({ queryKey: ['herd', herdId] });
    },
  });

  const createMovement = useMutation({
    mutationFn: (payload: any) => movementService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movements', herdId] });
    },
  });

  const [weighingForm, setWeighingForm] = React.useState({ weight: '', animalCount: '', notes: '' });
  const [movementForm, setMovementForm] = React.useState({ paddockId: '', entryDate: '', exitDate: '' });
  const [showWeighingForm, setShowWeighingForm] = React.useState(false);

  if (herdQuery.isLoading || weighingsQuery.isLoading) return <LoadingSpinner text="Cargando lote..." />;
  if (herdQuery.isError) return <Alert type="error" message="No se pudo cargar el lote" />;

  const herd = herdQuery.data;
  const weighings = weighingsQuery.data || [];
  const movements = movementsQuery.data || [];
  const paddocks = paddocksQuery.data || [];

  const handleWeighingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setFormError('');
      await createWeighing.mutateAsync({
        herdId,
        weight: Number(weighingForm.weight),
        animalCount: Number(weighingForm.animalCount || herd.animalCount),
        notes: weighingForm.notes,
      });
      setWeighingForm({ weight: '', animalCount: '', notes: '' });
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Error al registrar pesaje');
    }
  };

  const handleMovementSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setFormError('');
      
      // Validar campos requeridos
      if (!movementForm.paddockId) {
        setFormError('Selecciona un potrero');
        return;
      }
      if (!movementForm.entryDate) {
        setFormError('Ingresa la fecha de entrada');
        return;
      }

      const payload = {
        herdId,
        paddockId: movementForm.paddockId,
        type: 'ENTRY',
        entryDate: new Date(movementForm.entryDate).toISOString(),
        exitDate: movementForm.exitDate ? new Date(movementForm.exitDate).toISOString() : undefined,
        notes: 'Movimiento registrado desde web',
      };

      await createMovement.mutateAsync(payload);
      setMovementForm({ paddockId: '', entryDate: '', exitDate: '' });
    } catch (err: any) {
      console.error('Movement error:', err);
      setFormError(err.response?.data?.message || err.message || 'Error al registrar movimiento');
    }
  };

  const latestWeighing = weighings[0];
  const totalUA = (herd.currentWeight || herd.initialWeight) / 450;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{herd.name}</h1>
          <p className="text-gray-600">Animales: {herd.animalCount}</p>
          <p className="text-gray-600">Peso actual: {formatKg(herd.currentWeight || herd.initialWeight)}</p>
          <p className="text-gray-600">UA: {formatUA(totalUA)}</p>
        </div>
      </div>

      {formError && <Alert type="error" message={formError} />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-5 space-y-4 lg:col-span-2">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Histórico de Pesajes</h2>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowWeighingForm(true)}
            >
              + Nuevo Pesaje
            </Button>
          </div>
          {weighings.length === 0 ? (
            <Alert type="info" message="Aún no hay pesajes registrados" />
          ) : (
            <div className="space-y-3">
              {weighings.map((w: any) => (
                <div key={w.id} className="border rounded-md p-3 flex justify-between text-sm">
                  <span className="text-gray-700">{formatDate(w.recordedAt)}</span>
                  <span className="font-semibold">{formatKg(w.weight)}</span>
                  <span className="text-gray-600">UA: {formatUA(w.weight / 450)}</span>
                  <span className="text-gray-500">Animales: {w.animalCount}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal/Drawer con el nuevo WeighingForm */}
        {showWeighingForm ? (
          <div className="bg-white rounded-lg shadow p-5 lg:col-span-1 border-2 border-blue-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Pesaje (Báscula/Cinta)</h3>
              <button
                onClick={() => setShowWeighingForm(false)}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ✕
              </button>
            </div>
            <WeighingForm
              herdId={herdId}
              herdName={herd.name}
              animalCount={herd.animalCount}
              onSuccess={() => {
                setShowWeighingForm(false);
                queryClient.invalidateQueries({ queryKey: ['weighings', herdId] });
                queryClient.invalidateQueries({ queryKey: ['herd', herdId] });
              }}
              onCancel={() => setShowWeighingForm(false)}
            />
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-5 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Registrar pesaje</h3>
            <form className="space-y-3" onSubmit={handleWeighingSubmit}>
              <Input
                label="Peso total (kg)"
                type="number"
                required
                value={weighingForm.weight}
                onChange={(e) => setWeighingForm((s) => ({ ...s, weight: e.target.value }))}
              />
              <Input
                label="Cantidad de animales"
                type="number"
                value={weighingForm.animalCount}
                onChange={(e) => setWeighingForm((s) => ({ ...s, animalCount: e.target.value }))}
                helperText="Si lo dejas vacío usamos la cantidad del lote"
              />
              <Input
                label="Notas"
                value={weighingForm.notes}
                onChange={(e) => setWeighingForm((s) => ({ ...s, notes: e.target.value }))}
              />
              <Button type="submit" variant="primary" loading={createWeighing.isPending} className="w-full">
                Guardar pesaje
              </Button>
            </form>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-5 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Rotación (Movimientos)</h3>
          {movements.length === 0 ? (
            <Alert type="info" message="Aún no hay movimientos para este lote" />
          ) : (
            <div className="space-y-3">
              {movements.map((m: any) => (
                <div key={m.id} className="border rounded-md p-3 text-sm">
                  <p className="font-semibold text-gray-900">{m.paddock.name}</p>
                  <p className="text-gray-600">Entrada: {formatDate(m.entryDate)}</p>
                  <p className="text-gray-600">Salida: {m.exitDate ? formatDate(m.exitDate) : 'En curso'}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-5 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Registrar movimiento</h3>
          {paddocks.length === 0 ? (
            <Alert type="warning" message="No hay potreros disponibles. Crea potreros primero." />
          ) : (
            <form className="space-y-3" onSubmit={handleMovementSubmit}>
              <label className="text-sm font-medium text-gray-700">Potrero *</label>
              <select
                className="w-full border rounded-lg px-3 py-2 text-sm"
                required
                value={movementForm.paddockId}
                onChange={(e) => setMovementForm((s) => ({ ...s, paddockId: e.target.value }))}
              >
                <option value="">Selecciona un potrero</option>
                {paddocks.map((p: any) => (
                  <option key={p.id} value={p.id}>
                    {p.name} - {p.hectares} ha
                  </option>
                ))}
              </select>
              <Input
                label="Fecha de entrada *"
                type="datetime-local"
                required
                value={movementForm.entryDate}
                onChange={(e) => setMovementForm((s) => ({ ...s, entryDate: e.target.value }))}
              />
              <Input
                label="Fecha de salida (opcional)"
                type="datetime-local"
                value={movementForm.exitDate}
                onChange={(e) => setMovementForm((s) => ({ ...s, exitDate: e.target.value }))}
              />
              <Button type="submit" variant="secondary" loading={createMovement.isPending} className="w-full">
                Guardar movimiento
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
