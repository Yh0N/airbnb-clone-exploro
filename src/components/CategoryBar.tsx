'use client';

// ===== BARRA DE CATEGORÍAS - ESTILO AIRBNB 2025 =====
// Categorías con iconos + botón de filtros + switch de precios

import React, { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';
import { categories } from '@/services/mockData';

interface CategoryBarProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

export default function CategoryBar({ activeCategory, onCategoryChange }: CategoryBarProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(true);
  const [showTotalPrice, setShowTotalPrice] = useState(false);

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeft(scrollLeft > 0);
      setShowRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="sticky top-[var(--navbar-h,168px)] z-40 bg-white dark:bg-bg-primary border-b border-neutral-200 dark:border-border-color transition-colors duration-300">
      <div className="max-w-[2520px] mx-auto px-4 sm:px-6 md:px-10 xl:px-20">
        <div className="flex items-center gap-4">
          {/* Categorías con scroll */}
          <div className="relative flex-1 flex items-center">
            {/* Botón izquierda */}
            {showLeft && (
              <button
                onClick={() => scroll('left')}
                className="absolute left-0 z-10 flex items-center justify-center w-7 h-7 bg-white dark:bg-bg-secondary border border-neutral-300 dark:border-border-color text-neutral-700 dark:text-neutral-300 rounded-full shadow-sm hover:shadow-md hover:scale-105 transition-all"
                aria-label="Scroll izquierda"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Gradient izquierda */}
            {showLeft && (
              <div className="absolute left-0 z-[5] w-12 h-full bg-gradient-to-r from-white dark:from-bg-primary to-transparent pointer-events-none" />
            )}

            {/* Categorías */}
            <div
              ref={scrollRef}
              onScroll={handleScroll}
              className="flex items-center gap-6 sm:gap-8 overflow-x-auto py-4 scrollbar-hide"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => onCategoryChange(cat.id)}
                  className={`flex flex-col items-center gap-1.5 min-w-fit pb-2 border-b-2 transition-all duration-200 group ${
                    activeCategory === cat.id
                      ? 'border-neutral-800 dark:border-white text-neutral-800 dark:text-white'
                      : 'border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-white hover:border-neutral-300 dark:hover:border-neutral-600'
                  }`}
                >
                  <span className={`text-[22px] transition-all duration-200 leading-none ${
                    activeCategory === cat.id ? 'opacity-100 scale-110' : 'opacity-60 group-hover:opacity-100 group-hover:scale-105'
                  }`}>
                    {cat.icon}
                  </span>
                  <span className="text-[11px] sm:text-xs font-semibold whitespace-nowrap">{cat.name}</span>
                </button>
              ))}
            </div>

            {/* Gradient derecha */}
            {showRight && (
              <div className="absolute right-0 z-[5] w-12 h-full bg-gradient-to-l from-white dark:from-bg-primary to-transparent pointer-events-none" />
            )}

            {/* Botón derecha */}
            {showRight && (
              <button
                onClick={() => scroll('right')}
                className="absolute right-0 z-10 flex items-center justify-center w-7 h-7 bg-white dark:bg-bg-secondary border border-neutral-300 dark:border-border-color text-neutral-700 dark:text-neutral-300 rounded-full shadow-sm hover:shadow-md hover:scale-105 transition-all"
                aria-label="Scroll derecha"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Botón de Filtros */}
          <button className="hidden md:flex items-center gap-2 px-4 py-3 border border-neutral-300 dark:border-border-color rounded-xl hover:shadow-md dark:hover:bg-neutral-800 transition-all text-sm font-semibold text-neutral-800 dark:text-neutral-200 bg-white dark:bg-bg-secondary flex-shrink-0">
            <SlidersHorizontal className="w-4 h-4" />
            Filtros
          </button>

          {/* Switch "Mostrar total" */}
          <div className="hidden lg:flex items-center gap-3 px-4 py-3 border border-neutral-300 dark:border-border-color rounded-xl flex-shrink-0 bg-white dark:bg-bg-secondary">
            <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 whitespace-nowrap">
              Mostrar total
            </span>
            <button
              onClick={() => setShowTotalPrice(!showTotalPrice)}
              className={`relative w-12 h-7 rounded-full transition-colors duration-200 flex-shrink-0 ${
                showTotalPrice ? 'bg-neutral-800 dark:bg-white' : 'bg-neutral-300 dark:bg-neutral-600'
              }`}
              aria-label="Toggle precios"
            >
              <span
                className={`absolute top-0.5 w-6 h-6 bg-white dark:bg-neutral-900 rounded-full shadow-md transition-transform duration-200 ${
                  showTotalPrice ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
