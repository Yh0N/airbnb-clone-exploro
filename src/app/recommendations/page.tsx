'use client';

// ===== PÁGINA DE RECOMENDACIONES - ESTILO AIRBNB =====
// Muestra lugares recomendados por el sistema

import React, { useState, useEffect } from 'react';
import { Sparkles, TrendingUp, MapPin } from 'lucide-react';
import PlaceGrid from '@/components/PlaceGrid';
import { getRecommendations, getPlaces } from '@/services/api';
import type { Place } from '@/services/mockData';

export default function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState<Place[]>([]);
  const [trending, setTrending] = useState<Place[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [recs, allPlaces] = await Promise.all([
          getRecommendations(),
          getPlaces(),
        ]);
        setRecommendations(recs);
        // Trending: los mejor valorados
        const sorted = [...allPlaces].sort((a, b) => b.rating - a.rating);
        setTrending(sorted.slice(0, 4));
      } catch (error) {
        console.error('Error cargando recomendaciones:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="max-w-[2520px] mx-auto px-4 sm:px-6 md:px-10 xl:px-20 py-8">
      {/* Hero section */}
      <div className="relative bg-gradient-to-r from-[#BD1E59] via-[#D70466] to-[#92174D] rounded-2xl p-8 md:p-12 mb-10 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-8 h-8 text-white" />
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              Recomendaciones para ti
            </h1>
          </div>
          <p className="text-white/80 text-lg max-w-2xl">
            Descubre los destinos turísticos más increíbles de Pasto y Nariño,
            seleccionados especialmente según tus preferencias e intereses.
          </p>
        </div>
      </div>

      {/* Recomendaciones principales */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <Sparkles className="w-6 h-6 text-airbnb" />
          <h2 className="text-2xl font-bold text-neutral-800 dark:text-white">
            Seleccionados para ti
          </h2>
        </div>
        <PlaceGrid places={recommendations} isLoading={isLoading} />
      </div>

      {/* Trending */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <TrendingUp className="w-6 h-6 text-green-600" />
          <h2 className="text-2xl font-bold text-neutral-800 dark:text-white">
            Tendencias en Nariño
          </h2>
        </div>
        <PlaceGrid places={trending} isLoading={isLoading} />
      </div>

      {/* CTA Section */}
      <div className="bg-neutral-100 dark:bg-neutral-800 rounded-2xl p-8 md:p-12 text-center">
        <MapPin className="w-12 h-12 text-airbnb mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-neutral-800 dark:text-white mb-3">
          ¿Quieres recomendaciones más precisas?
        </h3>
        <p className="text-neutral-500 dark:text-neutral-400 max-w-lg mx-auto mb-6">
          Inicia sesión y guarda tus lugares favoritos para que nuestro sistema de
          recomendaciones pueda sugerirte destinos personalizados.
        </p>
        <button
          onClick={() => window.location.href = '/login'}
          className="bg-gradient-to-r from-[#E61E4D] via-[#E31C5F] to-[#D70466] text-white px-8 py-3.5 rounded-lg font-bold text-base hover:opacity-90 transition-opacity"
        >
          Iniciar sesión
        </button>
      </div>
    </div>
  );
}
