'use client';

import { useState, useEffect } from 'react';
import { Season } from '@shared/index';
import { Cloud, Sun } from 'lucide-react';

interface ClimateToggleProps {
  onChange?: (season: Season) => void;
  defaultSeason?: Season;
}

/**
 * Componente toggle para seleccionar temporada (Invierno/Verano).
 * Persiste la selección en localStorage y permite ajustar dinámicamente
 * los días de descanso según la temporada seleccionada.
 */
export function ClimateToggle({ onChange, defaultSeason = Season.INVIERNO }: ClimateToggleProps) {
  const [season, setSeason] = useState<Season>(defaultSeason);
  const [isHydrated, setIsHydrated] = useState(false);

  // Cargar preferencia del localStorage al montar
  useEffect(() => {
    const savedSeason = localStorage.getItem('selectedSeason') as Season | null;
    if (savedSeason && Object.values(Season).includes(savedSeason)) {
      setSeason(savedSeason);
    }
    setIsHydrated(true);
  }, []);

  const handleToggle = () => {
    const newSeason = season === Season.INVIERNO ? Season.VERANO : Season.INVIERNO;
    setSeason(newSeason);
    localStorage.setItem('selectedSeason', newSeason);
    onChange?.(newSeason);
  };

  if (!isHydrated) return null;

  const isInvierno = season === Season.INVIERNO;
  const seasonLabel = isInvierno ? 'Temporada de Lluvias' : 'Temporada Seca';
  const factorInfo = isInvierno ? '(Factor: 1.0x)' : '(Factor: 1.5x)';

  return (
    <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-50 to-amber-50 border border-blue-200">
      {/* Invierno */}
      <button
        onClick={handleToggle}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
          isInvierno
            ? 'bg-blue-500 text-white shadow-md'
            : 'bg-white text-gray-600 hover:bg-blue-100'
        }`}
        title="Temporada de Lluvias - Días de descanso normales"
      >
        <Cloud size={18} />
        <span className="text-sm font-medium">Lluvias</span>
      </button>

      {/* Separador visual */}
      <div className="h-6 w-px bg-gradient-to-b from-transparent via-gray-300 to-transparent" />

      {/* Verano */}
      <button
        onClick={handleToggle}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
          !isInvierno
            ? 'bg-amber-500 text-white shadow-md'
            : 'bg-white text-gray-600 hover:bg-amber-100'
        }`}
        title="Temporada Seca - Requiere 50% más días de descanso"
      >
        <Sun size={18} />
        <span className="text-sm font-medium">Seca</span>
      </button>

      {/* Info tooltip */}
      <div className="ml-2 text-xs text-gray-600 font-semibold">
        {seasonLabel} {factorInfo}
      </div>
    </div>
  );
}
