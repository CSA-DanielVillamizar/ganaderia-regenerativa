"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { farmService } from '@web/services/api.service';

interface FarmContextState {
  activeFarmId: string | null;
  setActiveFarmId: (id: string) => void;
  farms: any[];
  isLoading: boolean;
}

const FarmContext = createContext<FarmContextState | undefined>(undefined);

const STORAGE_KEY = 'active_farm_id';

export function FarmProvider({ children }: { children: React.ReactNode }) {
  const [activeFarmId, setActiveFarmId] = useState<string | null>(null);

  const { data: farms = [], isLoading } = useQuery({
    queryKey: ['farms'],
    queryFn: () => farmService.getAll().then((res) => res.data),
  });

  // Inicializar desde localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setActiveFarmId(stored);
    }
  }, []);

  // Validar/ajustar la finca activa con la lista real desde el backend
  useEffect(() => {
    if (!farms) return;

    // Si no hay fincas, limpiar selección
    if (farms.length === 0) {
      if (activeFarmId) {
        setActiveFarmId(null);
      }
      if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY);
      }
      return;
    }

    // Si hay un id guardado pero no existe en la lista (BD recreada), seleccionar la primera
    const exists = activeFarmId ? farms.some(f => f.id === activeFarmId) : false;
    if (!activeFarmId || !exists) {
      const firstId = farms[0].id;
      setActiveFarmId(firstId);
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, firstId);
      }
    }
  }, [activeFarmId, farms]);

  const value = useMemo(
    () => ({
      activeFarmId,
      setActiveFarmId: (id: string) => {
        setActiveFarmId(id);
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEY, id);
        }
      },
      farms,
      isLoading,
    }),
    [activeFarmId, farms, isLoading]
  );

  return <FarmContext.Provider value={value}>{children}</FarmContext.Provider>;
}

export function useFarmContext() {
  const ctx = useContext(FarmContext);
  if (!ctx) throw new Error('useFarmContext debe usarse dentro de FarmProvider');
  return ctx;
}
