'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner: React.FC<{ text?: string }> = ({ text = 'Cargando...' }) => {
  return (
    <div className="flex items-center justify-center p-8">
      <Loader2 className="w-6 h-6 text-green-600 animate-spin mr-2" />
      <span className="text-gray-700">{text}</span>
    </div>
  );
};
