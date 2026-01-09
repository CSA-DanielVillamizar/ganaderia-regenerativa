'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { herdService } from '@web/services/api.service';
import { useFarmContext } from '@web/context/FarmContext';
import { Alert } from '@web/components/common/Alert';
import { LoadingSpinner } from '@web/components/common/LoadingSpinner';
import { Button } from '@web/components/common/Button';
import { formatKg, formatUA } from '@web/lib/utils';
import { Plus } from 'lucide-react';

export default function HerdsPage() {
  const { activeFarmId } = useFarmContext();

  const { data: herds = [], isLoading, error } = useQuery({
    queryKey: ['herds', activeFarmId],
    queryFn: () => herdService.getByFarm(activeFarmId as string).then((res) => res.data),
    enabled: !!activeFarmId,
  });

  if (!activeFarmId) {
    return <Alert type="info" message="Selecciona una finca para ver los lotes" />;
  }

  if (isLoading) return <LoadingSpinner text="Cargando lotes..." />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">🐄 Lotes</h1>
        <Link href={`/farms/${activeFarmId}/herds/new`}>
          <Button variant="primary" size="md">
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Lote
          </Button>
        </Link>
      </div>

      {error && <Alert type="error" message="Error al cargar lotes" />}

      {herds.length === 0 ? (
        <Alert type="info" message="No hay lotes en esta finca. Crea el primero." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {herds.map((herd: any) => (
            <Link key={herd.id} href={`/farms/${herd.farmId}/herds/${herd.id}`}>
              <div className="bg-white rounded-lg shadow p-5 hover:shadow-lg transition cursor-pointer">
                <h3 className="text-lg font-semibold text-gray-900">{herd.name}</h3>
                <p className="text-sm text-gray-600 mt-1">Animales: {herd.animalCount}</p>
                <p className="text-sm text-gray-600">Peso actual: {formatKg(herd.currentWeight || herd.initialWeight)}</p>
                <p className="text-sm text-gray-600">UA: {formatUA((herd.currentWeight || herd.initialWeight) / 450)}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
