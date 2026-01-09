'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@web/services/api.service';
import { LoadingSpinner } from '@web/components/common/LoadingSpinner';
import { Alert } from '@web/components/common/Alert';
import { formatKg, formatUA } from '@web/lib/utils';
import { useFarmContext } from '@web/context/FarmContext';
import DashboardKPIs from '@web/components/common/DashboardKPIs';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const { activeFarmId } = useFarmContext();
  const farmId = (searchParams?.get('farmId') || activeFarmId) as string;

  const summaryQuery = useQuery({
    queryKey: ['dashboard-summary', farmId],
    // Usar el endpoint oficial con query param (evita 404)
    queryFn: () => dashboardService.getSummary(farmId).then((res) => res.data),
    enabled: !!farmId,
  });

  const trendsQuery = useQuery({
    queryKey: ['dashboard-trends', farmId],
    queryFn: () => dashboardService.getTrends(farmId).then((res) => res.data),
    enabled: !!farmId,
  });

  const forageQuery = useQuery({
    queryKey: ['dashboard-forage', farmId],
    queryFn: () => dashboardService.getForageStats(farmId).then((res) => res.data),
    enabled: !!farmId,
  });

  const alertsQuery = useQuery({
    queryKey: ['dashboard-alerts', farmId],
    queryFn: () => dashboardService.getAlerts(farmId).then((res) => res.data),
    enabled: !!farmId,
  });

  if (!farmId) {
    return <Alert type="info" message="Selecciona una finca para ver el dashboard" />;
  }

  if (summaryQuery.isLoading) return <LoadingSpinner text="Cargando dashboard..." />;

  const summary = summaryQuery.data;
  const trends = trendsQuery.data || [];
  const forage = forageQuery.data || [];
  const alerts = alertsQuery.data || [];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">📊 Dashboard Operativo</h1>

      {/* Componente MVP con KPIs, Alertas y Estados de Potreros */}
      {summary && <DashboardKPIs summary={summary} />}

      {/* Gráficas complementarias */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tendencia de Peso */}
        {trends.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Evolución de Peso</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="weight" stroke="#22c55e" name="Peso (kg)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Tendencia de UA */}
        {trends.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Evolución de UA</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="ua" stroke="#a78bfa" name="UA" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Forraje por Potrero */}
        {forage.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Forraje Disponible (kg/ha)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={forage}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="paddockName" fontSize={12} angle={-45} height={80} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Legend />
                <Bar dataKey="kgPerHectare" fill="#22c55e" name="kg/ha" />
                <Bar dataKey="dryMatter" fill="#8b5cf6" name="MS %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
