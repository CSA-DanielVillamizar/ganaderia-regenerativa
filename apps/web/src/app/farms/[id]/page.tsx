'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { farmService, herdService, weighingService } from '@web/services/api.service';
import { LoadingSpinner } from '@web/components/common/LoadingSpinner';
import { Alert } from '@web/components/common/Alert';
import { formatKg, formatUA } from '@web/lib/utils';
import Link from 'next/link';
import { Button } from '@web/components/common/Button';
import { Plus, Edit2 } from 'lucide-react';

export default function FarmDetailPage() {
  const params = useParams();
  const farmId = params.id as string;

  const farmQuery = useQuery({
    queryKey: ['farm', farmId],
    queryFn: () => farmService.getById(farmId).then((res) => res.data),
    enabled: !!farmId,
  });

  const herdsQuery = useQuery({
    queryKey: ['herds', farmId],
    queryFn: () => herdService.getByFarm(farmId).then((res) => res.data),
    enabled: !!farmId,
  });

  if (farmQuery.isLoading) return <LoadingSpinner text="Cargando finca..." />;

  const farm = farmQuery.data;
  const herds = herdsQuery.data || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{farm?.name}</h1>
          {farm?.location && <p className="text-gray-600 mt-2">📍 {farm.location}</p>}
          {farm?.hectares && <p className="text-gray-600">📐 {farm.hectares} ha</p>}
        </div>
        <Link href={`/farms/${farmId}/edit`}>
          <Button variant="secondary" size="md">
            <Edit2 className="w-4 h-4 mr-2" />
            Editar
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Lotes Activos" value={herds.length.toString()} />
        <StatCard
          label="Animales"
          value={herds.reduce((sum, h) => sum + h.animalCount, 0).toString()}
        />
        <StatCard
          label="Peso Total"
          value={formatKg(herds.reduce((sum, h) => sum + (h.currentWeight || h.initialWeight || 0), 0))}
        />
        <StatCard
          label="UA Total"
          value={formatUA(
            herds.reduce((sum, h) => sum + ((h.currentWeight || h.initialWeight || 0) / 450), 0)
          )}
        />
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Lotes</h2>
        <Link href={`/farms/${farmId}/herds/new`}>
          <Button variant="primary" size="md">
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Lote
          </Button>
        </Link>
      </div>

      {herds.length === 0 ? (
        <Alert type="info" message="No hay lotes registrados en esta finca." />
      ) : (
        <div className="space-y-4">
          {herds.map((herd: any) => (
            <Link key={herd.id} href={`/farms/${farmId}/herds/${herd.id}`}>
              <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer">
                <h3 className="text-lg font-semibold text-gray-900">{herd.name}</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  <InfoItem label="Animales" value={herd.animalCount.toString()} />
                  <InfoItem label="Peso Actual" value={formatKg(herd.currentWeight || herd.initialWeight)} />
                  <InfoItem label="UA" value={formatUA((herd.currentWeight || herd.initialWeight) / 450)} />
                  <InfoItem label="Estado" value={herd.active ? '✅ Activo' : '❌ Inactivo'} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <Link href="/farms">
        <Button variant="ghost">← Volver a Fincas</Button>
      </Link>
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string;
}

function StatCard({ label, value }: StatCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <p className="text-gray-600 text-sm">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
    </div>
  );
}

interface InfoItemProps {
  label: string;
  value: string;
}

function InfoItem({ label, value }: InfoItemProps) {
  return (
    <div>
      <p className="text-gray-600 text-xs">{label}</p>
      <p className="text-gray-900 font-semibold text-sm mt-1">{value}</p>
    </div>
  );
}
