'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FormField, DatePicker, TextArea, FormActions } from '@/components/forms';
import {
  closeMovement,
  calculateOccupancyDays,
  formatDate,
  type MovementResponse,
} from '@/services/movement.service';

interface PageProps {
  params: {
    id: string;
    movementId: string;
  };
}

export default function MovementClosePage({ params }: PageProps) {
  const router = useRouter();

  const [movement, setMovement] = useState<MovementResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [exitDate, setExitDate] = useState('');
  const [notes, setNotes] = useState('');

  // Cargar movimiento
  useEffect(() => {
    async function loadMovement() {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/movements/${params.movementId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.ok) {
          const data = await response.json();
          setMovement(data);
          // Pre-llenar fecha salida como hoy
          setExitDate(new Date().toISOString().split('T')[0]);
        } else {
          setError('Movimiento no encontrado');
        }
      } catch (err) {
        setError('Error cargando movimiento');
      } finally {
        setLoading(false);
      }
    }
    loadMovement();
  }, [params.movementId]);

  const handleSave = async () => {
    if (!movement || !exitDate) {
      setError('Datos incompletos');
      return;
    }

    // Validar que exitDate >= entryDate
    const entryD = new Date(movement.entryDate);
    const exitD = new Date(exitDate);
    if (exitD < entryD) {
      setError(`La salida debe ser ≥ entrada (${formatDate(movement.entryDate)})`);
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await closeMovement(params.movementId, {
        exitDate,
        notes: notes || undefined,
      });

      const occupancy = calculateOccupancyDays(
        movement.entryDate,
        exitDate
      );

      const message = encodeURIComponent(`✅ Movimiento cerrado - Ocupación: ${occupancy} días`);
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
        <p>Cargando movimiento...</p>
      </div>
    );
  }

  if (!movement) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-100 text-red-700 px-4 py-2 rounded text-sm space-y-3">
          <p>Movimiento no encontrado</p>
          <div className="flex items-center gap-2">
            <button
              className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded"
              onClick={() => router.push(`/farms/${params.id}/movements/new`)}
            >
              Registrar Movimiento
            </button>
            <button
              className="px-3 py-2 bg-white border hover:bg-gray-50 rounded"
              onClick={() => router.push(`/farms/${params.id}/decision-today`)}
            >
              Volver a Decision Today
            </button>
          </div>
        </div>
      </div>
    );
  }

  const occupancyDays = calculateOccupancyDays(
    movement.entryDate,
    exitDate || new Date().toISOString().split('T')[0]
  );

  return (
    <div className="max-w-md mx-auto py-8 px-4">
      <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
        <h1 className="text-2xl font-bold text-gray-800">🚪 Cerrar Movimiento</h1>
        <p className="text-sm text-gray-600">
          Registrar salida del lote del potrero
        </p>

        {error && (
          <div className="bg-red-100 text-red-700 px-4 py-2 rounded text-sm">
            {error}
          </div>
        )}

        {/* Información Read-Only */}
        <div className="bg-gray-50 p-4 rounded-md space-y-2">
          <p className="text-sm font-medium text-gray-700">📋 Información del Movimiento:</p>
          <div className="space-y-1 text-sm">
            <p>
              <span className="text-gray-600">Lote:</span>{' '}
              <span className="font-bold">{movement.herdId}</span>
            </p>
            <p>
              <span className="text-gray-600">Potrero:</span>{' '}
              <span className="font-bold">{movement.paddockId}</span>
            </p>
            <p>
              <span className="text-gray-600">Entrada:</span>{' '}
              <span className="font-bold">{formatDate(movement.entryDate)}</span>
            </p>
            <p>
              <span className="text-gray-600">Salida Estimada:</span>{' '}
              <span className="font-bold">{formatDate(movement.estimatedExitDate)}</span>
            </p>
          </div>
        </div>

        {/* Campos de entrada */}
        <FormField label="Fecha de Salida Real" required>
          <DatePicker
            value={exitDate}
            onChange={setExitDate}
            min={movement.entryDate}
            max={new Date().toISOString().split('T')[0]}
          />
        </FormField>

        <FormField label="Observaciones" hint="Opcional - Estado del potrero, comportamiento, etc.">
          <TextArea
            value={notes}
            onChange={setNotes}
            placeholder="Ej: Forraje bajó más de lo esperado"
            rows={3}
            maxLength={200}
          />
        </FormField>

        {/* Cálculos */}
        {exitDate && (
          <div className="bg-blue-50 p-4 rounded-md space-y-2">
            <p className="text-sm font-medium text-gray-700">📊 Ocupación Registrada:</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-gray-600">Días Ocupado</p>
                <p className="text-lg font-bold text-blue-600">{occupancyDays}</p>
              </div>
              <div>
                <p className="text-gray-600">vs. Estimado</p>
                <p className="text-lg font-bold text-blue-600">
                  {movement.estimatedExitDate
                    ? calculateOccupancyDays(
                        movement.entryDate,
                        movement.estimatedExitDate
                      )
                    : '-'}
                </p>
              </div>
            </div>
          </div>
        )}

        <FormActions
          onSave={handleSave}
          cancelHref={`/farms/${params.id}/decision-today`}
          isLoading={saving}
          isSaveDisabled={!exitDate || saving}
          saveLabel="Cerrar Movimiento"
        />
      </div>
    </div>
  );
}
