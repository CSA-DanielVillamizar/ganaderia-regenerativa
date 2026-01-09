'use client';

import React from 'react';

/**
 * Skeleton Loader para estados de carga
 * Muestra un placeholder animado mientras los datos se cargan
 */
export const SkeletonLoader: React.FC<{ 
  count?: number;
  rows?: number;
  columns?: number;
}> = ({ count = 1, rows = 3, columns = 4 }) => {
  // Para lista de items
  if (count > 1) {
    return (
      <div className="space-y-4">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-16 bg-gray-200 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  // Para tabla
  return (
    <div className="space-y-4">
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div key={rowIdx} className="flex gap-2">
          {Array.from({ length: columns }).map((_, colIdx) => (
            <div
              key={colIdx}
              className="flex-1 h-10 bg-gray-200 rounded animate-pulse"
            ></div>
          ))}
        </div>
      ))}
    </div>
  );
};

/**
 * Skeleton para tarjetas de estado
 */
export const CardSkeleton: React.FC = () => (
  <div className="animate-pulse bg-white rounded-lg shadow p-6 space-y-4">
    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
    <div className="space-y-3">
      <div className="h-4 bg-gray-200 rounded"></div>
      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
    </div>
    <div className="pt-4 space-y-2">
      <div className="h-8 bg-gray-200 rounded w-1/2"></div>
    </div>
  </div>
);
