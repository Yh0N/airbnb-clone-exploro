'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Heart, Star } from 'lucide-react';
import type { Experience } from '@/services/mockData';
import { useAuth } from '@/context/AuthContext';

interface ExperienceCardProps {
  experience: Experience;
}

export default function ExperienceCard({ experience }: ExperienceCardProps) {
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

  const sinFoto = !experience.image || imageError;

  const href = experience.entityType === 'pyme'
    ? `/pymes/${experience.entityId}`
    : `/places/${experience.entityId ?? experience.id}`;

  return (
    <Link href={href} className="group block h-full">
      <div className="relative aspect-[3/4] rounded-2xl overflow-hidden mb-3">
        {sinFoto ? (
          <div className="w-full h-full bg-neutral-100 dark:bg-neutral-800 flex flex-col items-center justify-center gap-2">
            <span className="text-5xl opacity-25">🎭</span>
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Sin foto</span>
          </div>
        ) : (
          <>
            {!imageLoaded && <div className="absolute inset-0 skeleton" />}
            <img
              src={experience.image}
              alt={experience.title}
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

        {experience.isOriginal && (
          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm">
            <span className="text-xs font-bold text-neutral-800">Originals</span>
          </div>
        )}
      </div>

      <div className="space-y-1">
        <div className="flex items-center gap-1 text-[13px] text-neutral-800 dark:text-neutral-300 font-semibold mb-1">
          <Star className="w-3.5 h-3.5 fill-current" />
          <span>{experience.rating} ({experience.reviews_count})</span>
          <span className="text-neutral-400">·</span>
          <span className="text-neutral-500 font-normal">{experience.category}</span>
        </div>
        <h3 className="font-semibold text-base text-neutral-800 dark:text-white line-clamp-2 leading-tight">
          {experience.title}
        </h3>
      </div>
    </Link>
  );
}
