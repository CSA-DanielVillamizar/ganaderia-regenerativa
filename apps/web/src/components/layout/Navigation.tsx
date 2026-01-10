'use client';

import React from 'react';
import Link from 'next/link';
import { useLogout } from '@web/hooks/useAuth';
import { Button } from '@web/components/common/Button';
import { LogOut, Home, Leaf, Beef, BarChart3, MoveRight, Grid3x3 } from 'lucide-react';
import { FarmSwitcher } from './FarmSwitcher';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
  { name: 'Fincas', href: '/farms', icon: Leaf },
  { name: 'Potreros', href: '/paddocks', icon: Grid3x3 },
  { name: 'Lotes', href: '/herds', icon: Beef },
  { name: 'Movimientos', href: '/dashboard/movements', icon: MoveRight },
];

export function Sidebar() {
  const logout = useLogout();

  return (
    <div className="bg-green-800 text-white w-64 min-h-screen p-6 fixed hidden lg:block">
      <div className="mb-8">
        <h2 className="text-2xl font-bold">🐄 Magrotec</h2>
        <p className="text-green-200 text-xs mt-1">Ganadería Regenerativa</p>
        <div className="mt-4">
          <FarmSwitcher />
        </div>
      </div>

      <nav className="space-y-2 mb-8">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href}>
              <div className="flex items-center px-4 py-2 rounded-lg hover:bg-green-700 transition-colors cursor-pointer">
                <Icon className="w-5 h-5 mr-3" />
                <span className="text-sm font-medium">{item.name}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-green-700 pt-4">
        <Button
          variant="ghost"
          size="md"
          onClick={logout}
          className="w-full text-left justify-start text-white hover:bg-green-700"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Salir
        </Button>
      </div>
    </div>
  );
}

export function BottomNav() {
  const logout = useLogout();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 lg:hidden flex justify-around">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <Link key={item.href} href={item.href}>
            <div className="flex flex-col items-center text-xs text-gray-700 hover:text-green-600">
              <Icon className="w-6 h-6 mb-1" />
              {item.name}
            </div>
          </Link>
        );
      })}
      <button
        onClick={logout}
        className="flex flex-col items-center text-xs text-gray-700 hover:text-green-600"
      >
        <LogOut className="w-6 h-6 mb-1" />
        Salir
      </button>
    </div>
  );
}
