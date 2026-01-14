'use client';

import React from 'react';
import Link from 'next/link';
import { Plus, LayoutDashboard } from 'lucide-react';
import AnalyticsDashboard from '@web/components/dashboard/AnalyticsDashboard';
import SeedDataButton from '@web/components/debug/SeedDataButton';
import { Button } from '@web/components/common/Button';
import { useFarmContext } from '@web/context/FarmContext';

/**
 * Dashboard Agronómico con acción rápida de registro
 * Integra el componente inteligente de analítica y un CTA flotante
 */
export default function DashboardPage(): React.ReactNode {
  const { activeFarmId } = useFarmContext();
  const ctaHref = activeFarmId ? `/farms/${activeFarmId}/decision-today` : '/farms';

  return (
    <div className="relative min-h-screen bg-gray-50 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <LayoutDashboard className="w-8 h-8 text-green-700" />
              Dashboard Agronómico
            </h1>
            <p className="text-sm text-gray-600">
              Análisis Voisin en tiempo real con soporte offline-first
            </p>
          </div>
          <Link href={ctaHref}>
            <Button variant="primary" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Nuevo Registro
            </Button>
          </Link>
        </div>

        <AnalyticsDashboard />
      </div>

      {/* Floating Action Button para registro rápido en campo */}
      <Link
        href={ctaHref}
        className="fixed bottom-6 right-6 z-50"
        aria-label="Registrar nueva acción"
      >
        <Button
          variant="primary"
          size="lg"
          className="rounded-full shadow-lg flex items-center gap-2 px-5 py-3"
        >
          <Plus className="w-5 h-5" />
          Nuevo Registro
        </Button>
      </Link>

      {/* Seed Data Button - TEMPORAL para desarrollo */}
      <SeedDataButton />
    </div>
  );
}
