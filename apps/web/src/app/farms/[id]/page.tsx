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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Tarjeta Potreros */}
        <Link href={`/farms/${farmId}/paddocks`}>
          <div className="group bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-md p-6 hover:shadow-xl transition-all duration-300 cursor-pointer border-2 border-green-200 hover:border-green-500 hover:scale-[1.02]">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-green-500 rounded-lg group-hover:bg-green-600 transition-colors">
                <span className="text-3xl">🌾</span>
              </div>
              <div className="text-green-600 group-hover:text-green-700 transition-all transform group-hover:translate-x-1">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Potreros</h3>
            <p className="text-gray-700 text-sm leading-relaxed">
              Gestiona las <strong>divisiones del terreno</strong> donde rotan los animales. 
              Define hectáreas, días de descanso y tipo de pasto.
            </p>
            <div className="mt-4 flex items-center text-green-700 font-medium text-sm">
              <span>Ver y gestionar potreros</span>
            </div>
          </div>
        </Link>

        {/* Tarjeta Lotes */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-md p-6 border-2 border-blue-200">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-blue-500 rounded-lg">
              <span className="text-3xl">🐄</span>
            </div>
            <Link href={`/farms/${farmId}/herds/new`}>
              <Button variant="primary" size="sm" className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-1" />
                Nuevo Lote
              </Button>
            </Link>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Lotes</h3>
          <p className="text-gray-700 text-sm leading-relaxed mb-4">
            Administra <strong>grupos de animales</strong> para gestionar pesajes, 
            movimientos entre potreros y seguimiento de rendimiento.
          </p>
          <div className="flex items-center text-blue-700 font-medium text-sm">
            <span>{herds.length} {herds.length === 1 ? 'lote registrado' : 'lotes registrados'}</span>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-900">📋 Lotes Registrados</h2>
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
