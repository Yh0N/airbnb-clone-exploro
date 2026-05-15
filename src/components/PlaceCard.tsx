'use client';

// ===== TARJETA DE LUGAR - ESTILO AIRBNB 2025 =====
// Componente reutilizable para mostrar un lugar turístico

import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import { Heart, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Place } from '@/services/mockData';
import { useAuth } from '@/context/AuthContext';
import { toggleFavorite } from '@/services/api';

interface PlaceCardProps {
  place: Place;
}

export default function PlaceCard({ place }: PlaceCardProps) {
  const { user, isAuthenticated, updateFavorites } = useAuth();
  const [currentImage, setCurrentImage] = useState(0);
  const [isLiked, setIsLiked] = useState(
    user?.favorites?.includes(place.id) || false
  );
  const [heartAnimating, setHeartAnimating] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleFavorite = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) return;

    setHeartAnimating(true);
    setIsLiked(!isLiked);
    setTimeout(() => setHeartAnimating(false), 300);

    try {
      const result = await toggleFavorite(place.id);
      updateFavorites(result.favorites);
    } catch {
      setIsLiked(isLiked); // Revertir en caso de error
    }
  }, [isAuthenticated, isLiked, place.id, updateFavorites]);

  const goToImage = (index: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentImage(index);
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const nextImage = (e: React.MouseEvent) => {
    goToImage((currentImage + 1) % place.images.length, e);
  };

  const prevImage = (e: React.MouseEvent) => {
    goToImage((currentImage - 1 + place.images.length) % place.images.length, e);
  };

  // Badge "Favorito de viajeros" para los mejor valorados
  const isGuestFavorite = place.rating >= 4.8;

  return (
    <Link href={`/places/${place.id}`} className="group block">
      <div className="relative aspect-square rounded-xl overflow-hidden mb-3">
        {/* Imagen con transición */}
        {!imageLoaded && (
          <div className="absolute inset-0 skeleton" />
        )}
        <div className="relative w-full h-full overflow-hidden">
          <img
            src={place.images[currentImage]}
            alt={place.name}
            className={`w-full h-full object-cover transition-all duration-500 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
            loading="lazy"
            decoding="async"
          />
        </div>

        {/* Botón favorito */}
        <button
          onClick={handleFavorite}
          className="absolute top-3 right-3 z-10"
          aria-label={isLiked ? 'Quitar de favoritos' : 'Añadir a favoritos'}
        >
          <Heart
            className={`w-6 h-6 drop-shadow-lg transition-all ${
              heartAnimating ? 'animate-heart-beat' : ''
            } ${
              isLiked
                ? 'fill-airbnb text-airbnb'
                : 'fill-black/40 text-white hover:fill-black/60'
            }`}
          />
        </button>

        {/* Badge "Favorito entre huéspedes" */}
        {isGuestFavorite && (
          <div className="absolute top-3 left-3 z-10 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-md shadow-sm border border-neutral-100">
            <span className="text-[11px] font-bold text-neutral-800">Favorito entre huéspedes</span>
          </div>
        )}

        {/* Badges de Categoría y Subcategoría (Estilo Mapa) */}
        <div className={`absolute left-3 flex gap-1.5 z-10 transition-all duration-300 ${isGuestFavorite ? 'top-12' : 'top-3'}`}>
          <span className="text-[9px] font-black bg-white/90 backdrop-blur-md text-neutral-800 px-2 py-1 rounded-lg shadow-sm uppercase tracking-wider border border-white/20">
            {place.category || 'Destino'}
          </span>
          {(place.subcategoria || place.subcategory) && (
            <span className="text-[9px] font-black bg-airbnb text-white px-2 py-1 rounded-lg shadow-sm uppercase tracking-wider border border-airbnb/20">
              {place.subcategoria || place.subcategory}
            </span>
          )}
        </div>

        {/* Flechas de navegación */}
        {place.images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className={`absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-white/95 rounded-full flex items-center justify-center shadow-md hover:bg-white hover:scale-105 transition-all ${
                currentImage === 0
                  ? 'opacity-0 pointer-events-none'
                  : 'opacity-0 group-hover:opacity-100'
              }`}
            >
              <ChevronLeft className="w-3.5 h-3.5 text-neutral-800" />
            </button>
            <button
              onClick={nextImage}
              className={`absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-white/95 rounded-full flex items-center justify-center shadow-md hover:bg-white hover:scale-105 transition-all ${
                currentImage === place.images.length - 1
                  ? 'opacity-0 pointer-events-none'
                  : 'opacity-0 group-hover:opacity-100'
              }`}
            >
              <ChevronRight className="w-3.5 h-3.5 text-neutral-800" />
            </button>
          </>
        )}

        {/* Dots de navegación */}
        {place.images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
            {place.images.slice(0, 5).map((_, idx) => (
              <div
                key={idx}
                className={`rounded-full transition-all duration-300 ${
                  currentImage === idx
                    ? 'bg-white w-[6px] h-[6px]'
                    : 'bg-white/60 w-[5px] h-[5px]'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Info — Layout estilo Airbnb */}
      <div className="space-y-0.5">
        <div className="flex items-start justify-between gap-1">
          <h3 className="font-bold text-[15px] text-neutral-800 group-hover:underline decoration-neutral-300 decoration-1 underline-offset-2 transition-all">
            {place.name}
          </h3>
          <div className="flex items-center gap-1 flex-shrink-0">
            <Star className="w-3 h-3 fill-neutral-800 text-neutral-800" />
            <span className="text-sm font-medium">{place.rating?.toFixed(2) || '0.00'}</span>
          </div>
        </div>
        <p className="text-[14px] text-neutral-500 font-medium">
          {place.price} <span className="font-normal">por 2 noches</span>
        </p>
        <p className="text-[14px] text-neutral-500 flex items-center gap-1">
          <span className="text-neutral-400">★</span> {place.rating}
        </p>
      </div>
    </Link>
  );
}
