'use client';

// ===== GRID DE LUGARES - ESTILO AIRBNB 2025 =====
// Grid responsivo de tarjetas con skeleton loading

import React from 'react';
import PlaceCard from './PlaceCard';
import type { Place } from '@/services/mockData';

interface PlaceGridProps {
  places: Place[];
  isLoading?: boolean;
}

// Skeleton de carga estilo Airbnb
function PlaceCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-square rounded-xl skeleton mb-3" />
      <div className="space-y-2">
        <div className="flex justify-between">
          <div className="h-4 skeleton w-3/4 rounded" />
          <div className="h-4 skeleton w-8 rounded" />
        </div>
        <div className="h-3 skeleton w-1/2 rounded" />
        <div className="h-3 skeleton w-1/3 rounded" />
        <div className="h-4 skeleton w-2/5 rounded mt-1" />
      </div>
    </div>
  );
}

export default function PlaceGrid({ places, isLoading }: PlaceGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-x-6 gap-y-10">
        {Array.from({ length: 12 }).map((_, i) => (
          <PlaceCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (places.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-xl font-semibold text-neutral-800 dark:text-white mb-2">
          No se encontraron lugares
        </h3>
        <p className="text-neutral-500 dark:text-neutral-400 text-center max-w-md">
          Intenta buscar con otros términos o explora diferentes categorías para descubrir
          los increíbles destinos turísticos de Pasto y Nariño.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-x-6 gap-y-10">
      {places.map((place, index) => (
        <div
          key={place.id}
          className="animate-fade-in"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <PlaceCard place={place} />
        </div>
      ))}
    </div>
  );
}
