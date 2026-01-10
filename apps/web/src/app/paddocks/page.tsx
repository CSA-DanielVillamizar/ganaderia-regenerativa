'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@web/components/common/Button';
import { paddockService, farmService } from '@web/services/api.service';

interface Paddock {
  id: string;
  name: string;
  farmId: string;
  hectares: number;
  currentForageCoverage: number;
  farm?: {
    name: string;
  };
}

interface Farm {
  id: string;
  name: string;
}

/**
 * Página de listado general de todos los potreros
 * Permite ver potreros agrupados por finca y navegar a detalles
 */
export default function PaddocksPage() {
  const router = useRouter();
  const [paddocks, setPaddocks] = useState<Paddock[]>([]);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Cargar fincas primero
      const farmsResponse = await farmService.getAll();
      const farmsData = Array.isArray(farmsResponse) ? farmsResponse : farmsResponse.data || [];
      setFarms(farmsData);

      // Cargar todos los potreros de cada finca
      const allPaddocks: Paddock[] = [];
      for (const farm of farmsData) {
        try {
          const paddocksResponse = await paddockService.getByFarm(farm.id);
          const farmPaddocks = Array.isArray(paddocksResponse) 
            ? paddocksResponse 
            : paddocksResponse.data || [];
          
          // Agregar información de la finca a cada potrero
          const paddocksWithFarm = farmPaddocks.map((p: Paddock) => ({
            ...p,
            farm: { name: farm.name }
          }));
          
          allPaddocks.push(...paddocksWithFarm);
        } catch (err) {
          console.warn(`No se pudieron cargar potreros para finca ${farm.name}:`, err);
        }
      }

      setPaddocks(allPaddocks);
    } catch (err: any) {
      console.error('Error cargando datos:', err);
      setError(err.message || 'Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  // Agrupar potreros por finca
  const paddocksByFarm = paddocks.reduce((acc, paddock) => {
    const farmName = paddock.farm?.name || 'Sin finca';
    if (!acc[farmName]) {
      acc[farmName] = [];
    }
    acc[farmName].push(paddock);
    return acc;
  }, {} as Record<string, Paddock[]>);

  const handleViewFarmPaddocks = (farmId: string) => {
    router.push(`/farms/${farmId}/paddocks`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando potreros...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-red-800 font-semibold mb-2">Error al cargar potreros</h3>
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={loadData} variant="primary">
          Reintentar
        </Button>
      </div>
    );
  }

  const totalPaddocks = paddocks.length;
  const totalHectares = paddocks.reduce((sum, p) => sum + p.hectares, 0);

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">🌾 Potreros</h1>
          <p className="text-gray-600 mt-2">
            Gestión de divisiones del terreno y áreas de pastoreo
          </p>
        </div>
      </div>

      {/* Estadísticas generales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-xl p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-500 rounded-lg">
              <span className="text-2xl">🌾</span>
            </div>
            <div>
              <p className="text-sm text-green-700 font-medium">Total Potreros</p>
              <p className="text-3xl font-bold text-green-900">{totalPaddocks}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500 rounded-lg">
              <span className="text-2xl">📏</span>
            </div>
            <div>
              <p className="text-sm text-blue-700 font-medium">Hectáreas Totales</p>
              <p className="text-3xl font-bold text-blue-900">{totalHectares.toFixed(1)}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 rounded-xl p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-500 rounded-lg">
              <span className="text-2xl">🏡</span>
            </div>
            <div>
              <p className="text-sm text-purple-700 font-medium">Fincas con Potreros</p>
              <p className="text-3xl font-bold text-purple-900">{Object.keys(paddocksByFarm).length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de potreros agrupados por finca */}
      {totalPaddocks === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
          <p className="text-lg text-yellow-800 mb-2">📋 No hay potreros registrados</p>
          <p className="text-yellow-700">
            Los potreros se crean desde el detalle de cada finca.
          </p>
          <Button 
            onClick={() => router.push('/farms')} 
            variant="primary"
            className="mt-4"
          >
            Ir a Fincas
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(paddocksByFarm).map(([farmName, farmPaddocks]) => (
            <div key={farmName} className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-white">{farmName}</h2>
                  <p className="text-green-100 text-sm">
                    {farmPaddocks.length} potrero{farmPaddocks.length !== 1 ? 's' : ''} · {' '}
                    {farmPaddocks.reduce((sum, p) => sum + p.hectares, 0).toFixed(1)} ha totales
                  </p>
                </div>
                <Button
                  onClick={() => {
                    const farmId = farmPaddocks[0]?.farmId;
                    if (farmId) handleViewFarmPaddocks(farmId);
                  }}
                  variant="secondary"
                  className="bg-white text-green-700 hover:bg-green-50"
                >
                  Ver Detalles
                </Button>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {farmPaddocks.map((paddock) => (
                    <div
                      key={paddock.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => handleViewFarmPaddocks(paddock.farmId)}
                    >
                      <h3 className="font-semibold text-gray-900 mb-2">{paddock.name}</h3>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p>📏 <span className="font-medium">{paddock.hectares} ha</span></p>
                        <p>🌱 Cobertura: <span className="font-medium">{paddock.currentForageCoverage}%</span></p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
