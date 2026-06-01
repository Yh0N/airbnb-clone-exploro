'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Heart, Star, CheckCircle } from 'lucide-react';
import type { Service } from '@/services/mockData';
import { useAuth } from '@/context/AuthContext';

interface ServiceCardProps {
  service: Service;
}

export default function ServiceCard({ service }: ServiceCardProps) {
  const { isAuthenticated } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [heartAnimating, setHeartAnimating] = useState(false);

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) return;
    setHeartAnimating(true);
    setIsLiked(!isLiked);
    setTimeout(() => setHeartAnimating(false), 300);
  };

  const sinFoto = !service.image || imageError;

  const href = service.entityType === 'pyme'
    ? `/pymes/${service.entityId}`
    : `/places/${service.entityId ?? service.id}`;

  return (
    <Link href={href} className="group block h-full">
      <div className="relative aspect-video sm:aspect-square rounded-2xl overflow-hidden mb-3">
        {sinFoto ? (
          <div className="w-full h-full bg-neutral-100 dark:bg-neutral-800 flex flex-col items-center justify-center gap-2">
            <span className="text-5xl opacity-25">🛎️</span>
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Sin foto</span>
          </div>
        ) : (
          <>
            {!imageLoaded && <div className="absolute inset-0 skeleton" />}
            <img
              src={service.image}
              alt={service.title}
              loading="lazy"
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
              className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
            />
          </>
        )}

        <button
          onClick={handleFavorite}
          className="absolute top-3 right-3 z-10"
          aria-label={isLiked ? 'Quitar de favoritos' : 'Añadir a favoritos'}
        >
          <Heart
            className={`w-6 h-6 drop-shadow-lg transition-transform ${
              heartAnimating ? 'animate-heart-beat' : ''
            } ${
              isLiked
                ? 'fill-airbnb text-airbnb'
                : 'fill-black/40 text-white hover:fill-black/60 hover:scale-110'
            }`}
          />
        </button>

        <div className="absolute bottom-3 left-3 bg-white shadow-md px-2 py-1 rounded-lg flex items-center gap-1.5">
          <div className="w-5 h-5 bg-gradient-to-tr from-airbnb to-airbnb-dark rounded-full flex items-center justify-center text-white text-[10px] font-bold">
            {service.provider.charAt(0)}
          </div>
          <span className="text-xs font-semibold text-neutral-800">{service.provider}</span>
          <CheckCircle className="w-3 h-3 text-blue-500" />
        </div>
      </div>

      <div className="space-y-0.5">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-semibold text-base text-neutral-800 dark:text-white line-clamp-1">
            {service.title}
          </h3>
          <div className="flex items-center gap-1 text-[13px] text-neutral-800 dark:text-neutral-300 font-semibold flex-shrink-0">
            <Star className="w-3 h-3 fill-current" />
            <span>{service.rating} ({service.reviews_count})</span>
          </div>
        </div>
        <p className="text-[14px] text-neutral-500 dark:text-neutral-400 line-clamp-1">
          Servicio de {service.category} profesional
        </p>
      </div>
    </Link>
  );
}
