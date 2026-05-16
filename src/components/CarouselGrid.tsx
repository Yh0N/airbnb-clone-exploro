'use client';

import React, { useRef, useState, useEffect, ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CarouselGridProps {
  title: string;
  subtitle?: string;
  children: ReactNode[];
}

export default function CarouselGrid({ title, subtitle, children }: CarouselGridProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(true);

  // Mouse drag state
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // Touch swipe state
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchScrollLeft, setTouchScrollLeft] = useState(0);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeft(scrollLeft > 5);
      setShowRight(scrollLeft < scrollWidth - clientWidth - 5);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [children]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = window.innerWidth > 768 ? window.innerWidth * 0.6 : window.innerWidth * 0.85;
      scrollRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
      setTimeout(checkScroll, 400);
    }
  };

  // ── Mouse drag (desktop) ──
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.pageX - (scrollRef.current?.offsetLeft || 0));
    setScrollLeft(scrollRef.current?.scrollLeft || 0);
  };
  const handleMouseLeave = () => setIsDragging(false);
  const handleMouseUp = () => setIsDragging(false);
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - (scrollRef.current?.offsetLeft || 0);
    if (scrollRef.current) scrollRef.current.scrollLeft = scrollLeft - (x - startX) * 1.5;
  };

  // ── Touch swipe (mobile) ──
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].pageX);
    setTouchScrollLeft(scrollRef.current?.scrollLeft || 0);
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!scrollRef.current) return;
    const diff = touchStartX - e.touches[0].pageX;
    scrollRef.current.scrollLeft = touchScrollLeft + diff;
  };
  const handleTouchEnd = () => {
    setTimeout(checkScroll, 150);
  };

  return (
    <div className="py-5 md:py-6">
      <div className="flex items-center justify-between mb-5 px-4 sm:px-6 md:px-10 xl:px-20 max-w-[2520px] mx-auto">
        <div className="flex-1 min-w-0">
          <h2 className="text-[20px] md:text-[24px] font-bold text-neutral-800 dark:text-white leading-tight truncate">
            {title}
          </h2>
          {subtitle && (
            <p className="text-[14px] text-neutral-500 dark:text-neutral-400 mt-0.5 hidden md:block">
              {subtitle}
            </p>
          )}
        </div>

        {/* Controles de navegación desktop */}
        <div className="hidden md:flex items-center gap-2 ml-4 flex-shrink-0">
          <button
            onClick={() => scroll('left')}
            disabled={!showLeft}
            className={`flex items-center justify-center w-8 h-8 rounded-full border border-neutral-300 dark:border-border-color bg-white dark:bg-bg-secondary text-neutral-800 dark:text-white transition-all ${
              !showLeft ? 'opacity-25 cursor-not-allowed' : 'hover:shadow-md hover:scale-105 active:scale-95'
            }`}
            aria-label="Scroll izquierda"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll('right')}
            disabled={!showRight}
            className={`flex items-center justify-center w-8 h-8 rounded-full border border-neutral-300 dark:border-border-color bg-white dark:bg-bg-secondary text-neutral-800 dark:text-white transition-all ${
              !showRight ? 'opacity-25 cursor-not-allowed' : 'hover:shadow-md hover:scale-105 active:scale-95'
            }`}
            aria-label="Scroll derecha"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="relative max-w-[2520px] mx-auto">
        <div
          ref={scrollRef}
          onScroll={checkScroll}
          // Mouse events
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          // Touch events
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className={`flex overflow-x-auto scrollbar-hide py-2 px-4 sm:px-6 md:px-10 xl:px-20 gap-x-4 md:gap-x-5 lg:gap-x-6 ${
            isDragging ? 'cursor-grabbing select-none' : 'cursor-grab'
          }`}
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            scrollSnapType: isDragging ? 'none' : 'x mandatory',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {React.Children.map(children, (child, idx) => (
            <div
              key={idx}
              className="flex-shrink-0"
              style={{
                scrollSnapAlign: 'start',
                width: 'clamp(240px, 72vw, 340px)',
              }}
            >
              {child}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
