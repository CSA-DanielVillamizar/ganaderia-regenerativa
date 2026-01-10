'use client';

import { DecisionTodayPage } from '@/components/dashboard/DecisionTodayPage';

interface PageProps {
  params: {
    id: string;
  };
}

export default function Page({ params }: PageProps) {
  return <DecisionTodayPage farmId={params.id} />;
}
