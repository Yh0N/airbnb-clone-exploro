'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, Search, ChevronRight, Loader2, ChevronLeft } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getPlaces } from '@/services/api';
import type { Place } from '@/services/mockData';
import PlaceCard from '@/components/PlaceCard';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function FavoritesPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [favoritePlaces, setFavoritePlaces] = useState<Place[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    const fetchFavorites = async () => {
      if (!user?.favorites || user.favorites.length === 0) {
        setFavoritePlaces([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        // Obtenemos todos los lugares y filtramos por los IDs en favoritos
        // En una API real, habría un endpoint específico: GET /api/v1/favorites
        const allPlaces = await getPlaces();
        const filtered = allPlaces.filter(p => user.favorites.includes(p.id));
        setFavoritePlaces(filtered);
      } catch (error) {
        console.error('Error fetching favorites:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchFavorites();
    }
  }, [user?.favorites, isAuthenticated, authLoading, router]);

  if (authLoading || (isLoading && favoritePlaces.length === 0)) {
    return <LoadingSpinner size="lg" text="Cargando tus favoritos..." />;
  }

  return (
    <div className="max-w-[2520px] mx-auto px-4 sm:px-6 md:px-10 xl:px-20 py-8 min-h-[70vh]">
      <button 
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm font-bold text-neutral-500 hover:text-neutral-900 transition-all mb-6 group w-fit"
      >
        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Volver
      </button>
      <header className="mb-10">
        <div className="flex items-center gap-2 text-sm text-neutral-500 mb-2 font-medium">
          <span className="hover:underline cursor-pointer" onClick={() => router.push('/')}>Exploro</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-neutral-900 font-bold">Favoritos</span>
        </div>
        <h1 className="text-3xl font-black text-neutral-900 dark:text-white tracking-tight">Favoritos</h1>
      </header>

      {favoritePlaces.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {favoritePlaces.map((place) => (
            <PlaceCard key={place.id} place={place} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center animate-in zoom-in-95 duration-500">
          <div className="w-24 h-24 bg-neutral-50 dark:bg-neutral-800 rounded-full flex items-center justify-center mb-6 shadow-inner">
            <Heart className="w-10 h-10 text-neutral-300 dark:text-neutral-600" />
          </div>
          <h2 className="text-2xl font-bold text-neutral-800 dark:text-white mb-3">Aún no tienes favoritos</h2>
          <p className="text-neutral-500 dark:text-neutral-400 max-w-sm mb-10 leading-relaxed">
            Guarda los lugares que más te gusten para encontrarlos fácilmente cuando estés listo para viajar.
          </p>
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-3 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 px-8 py-4 rounded-2xl font-bold hover:scale-105 active:scale-95 transition-all shadow-xl"
          >
            <Search className="w-5 h-5" />
            Explorar destinos
          </button>
        </div>
      )}
    </div>
  );
}
