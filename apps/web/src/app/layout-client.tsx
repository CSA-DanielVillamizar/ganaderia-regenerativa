
'use client';

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Sidebar, BottomNav } from '@web/components/layout/Navigation';
import { Header } from '@web/components/layout/Header';
import { AuthGate } from '@web/components/layout/AuthGate';
import { FarmProvider } from '@web/context/FarmContext';
import { NotificationContainer } from '@web/components/NotificationContainer';
import '@web/styles/globals.css';
import { usePathname } from 'next/navigation';
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    },
  },
});

export function RootLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuth = pathname?.startsWith('/auth');

  return (
    <QueryClientProvider client={queryClient}>
      <AuthGate>
        {isAuth ? (
          <>{children}</>
        ) : (
          <FarmProvider>
            <NotificationContainer />
            <div className="flex flex-col h-screen bg-gray-50">
              <Header />
              <div className="flex flex-1 overflow-hidden">
              <Sidebar />
                <main className="flex-1 overflow-auto bg-gray-50">
                <div className="p-4 lg:p-8 pb-20 lg:pb-8">{children}</div>
              </main>
              </div>
              <BottomNav />
            </div>
          </FarmProvider>
        )}
      </AuthGate>
    </QueryClientProvider>
  );
}
