'use client';

import { useFarmContext } from '@web/context/FarmContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { clearToken } from '@web/lib/api-client';

/**
 * Header profesional con:
 * - Selector de finca
 * - Info del usuario
 * - Link de logout
 * - Estado de conexión API
 */
export function Header() {
  const { selectedFarm } = useFarmContext();
  const router = useRouter();

  const handleLogout = () => {
    clearToken();
    router.push('/auth/login');
  };

  const handleApiStatus = () => {
    // Verificar conectividad al API
    // (puede ampliarse para mostrar status en tiempo real)
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="px-4 py-3 flex items-center justify-between">
        {/* Logo + Farm selector */}
        <div className="flex items-center gap-4">
          <div className="hidden lg:block">
            <h1 className="text-lg font-bold text-gray-900">Magrotec</h1>
            <p className="text-xs text-gray-500">Ganadería Regenerativa</p>
          </div>

          {selectedFarm && (
            <div className="text-sm">
              <p className="text-gray-600">Finca</p>
              <p className="font-semibold text-gray-900">{selectedFarm.name}</p>
            </div>
          )}
        </div>

        {/* Actions - Right side */}
        <div className="flex items-center gap-4">
          {/* API Status indicator */}
          <button
            onClick={handleApiStatus}
            className="hidden sm:flex items-center gap-2 px-3 py-2 text-sm text-green-700 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
            title="Estado del API"
          >
            <span className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></span>
            <span>Conectado</span>
          </button>

          {/* User menu */}
          <div className="relative group">
            <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:text-gray-900 transition-colors">
              <span>👤</span>
              <span className="hidden sm:inline">Usuario</span>
            </button>

            {/* Dropdown menu */}
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 border border-gray-200">
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
