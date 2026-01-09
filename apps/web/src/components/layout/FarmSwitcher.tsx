"use client";

import React from 'react';
import { useFarmContext } from '@web/context/FarmContext';
import { ChevronDown } from 'lucide-react';
import { cn } from '@web/lib/utils';

export function FarmSwitcher({ className }: { className?: string }) {
  const { farms, activeFarmId, setActiveFarmId, isLoading } = useFarmContext();

  if (isLoading) {
    return <p className="text-xs text-green-100">Cargando fincas...</p>;
  }

  if (!farms || farms.length === 0) {
    return <p className="text-xs text-green-100">No hay fincas</p>;
  }

  return (
    <div className={cn('bg-green-700/60 rounded-lg p-3', className)}>
      <p className="text-[11px] text-green-100 uppercase tracking-wide mb-1">Finca activa</p>
      <div className="relative">
        <select
          value={activeFarmId ?? ''}
          onChange={(e) => setActiveFarmId(e.target.value)}
          className="w-full bg-green-800 text-white text-sm font-semibold rounded-md px-3 py-2 pr-8 border border-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 appearance-none cursor-pointer"
        >
          {farms.map((farm) => (
            <option key={farm.id} value={farm.id}>
              {farm.name}
            </option>
          ))}
        </select>
        <ChevronDown className="w-4 h-4 text-green-200 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>
    </div>
  );
}
