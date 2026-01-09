"use client";

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useProfile } from '@web/hooks/useAuth';
import { LoadingSpinner } from '@web/components/common/LoadingSpinner';

export function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { data, isLoading, isError } = useProfile();

  useEffect(() => {
    if (!isLoading && isError) {
      router.push('/auth/login');
    }
  }, [isError, isLoading, router]);

  if (pathname.startsWith('/auth')) {
    return <>{children}</>;
  }

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner text="Validando sesión" /></div>;
  }

  return <>{children}</>;
}
