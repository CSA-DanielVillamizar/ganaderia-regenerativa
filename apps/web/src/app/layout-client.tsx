'use client';

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Sidebar, BottomNav } from '@web/components/layout/Navigation';
import { AuthGate } from '@web/components/layout/AuthGate';
import { FarmProvider } from '@web/context/FarmContext';
import InstallPrompt from '@web/components/pwa/InstallPrompt';
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
            <div className="flex">
              <Sidebar />
              <main className="flex-1 lg:ml-64 pb-20 lg:pb-0">
                <div className="p-4 lg:p-8">{children}</div>
              </main>
              <BottomNav />
            </div>
            {/* PWA Install Prompt */}
            <InstallPrompt />
          </FarmProvider>
        )}
      </AuthGate>
    </QueryClientProvider>
  );
}
