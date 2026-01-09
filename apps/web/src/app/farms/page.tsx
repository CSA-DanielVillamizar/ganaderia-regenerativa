'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { farmService } from '@web/services/api.service';
import { LoadingSpinner } from '@web/components/common/LoadingSpinner';
import { Alert } from '@web/components/common/Alert';
import { Button } from '@web/components/common/Button';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { useFarmContext } from '@web/context/FarmContext';

export default function FarmsPage() {
  const { setActiveFarmId } = useFarmContext();
  const { data: farms, isLoading, error } = useQuery({
    queryKey: ['farms'],
    queryFn: () => farmService.getAll().then((res) => res.data),
  });

  if (isLoading) return <LoadingSpinner text="Cargando fincas..." />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">🏞️ Mis Fincas</h1>
        <Link href="/farms/new">
          <Button variant="primary" size="md">
            <Plus className="w-4 h-4 mr-2 inline" />
            Nueva Finca
          </Button>
        </Link>
      </div>

      {error && <Alert type="error" message="Error al cargar fincas" />}

      {!farms || farms.length === 0 ? (
        <Alert type="info" message="No tienes fincas registradas. ¡Crea una nueva!" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {farms.map((farm: any) => (
            <Link key={farm.id} href={`/farms/${farm.id}`} onClick={() => setActiveFarmId(farm.id)}>
              <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer">
                <h3 className="text-lg font-semibold text-gray-900">{farm.name}</h3>
                <p className="text-gray-600 text-sm mt-2">{farm.location}</p>
                <p className="text-gray-500 text-sm mt-1">{farm.hectares} ha</p>
                <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center text-xs text-gray-500">
                  <span>Creada: {new Date(farm.createdAt).toLocaleDateString('es-CO')}</span>
                  <span className="text-green-600 font-semibold">Activar</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
