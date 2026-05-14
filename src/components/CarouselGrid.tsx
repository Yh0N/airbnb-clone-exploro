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

  // Dragging state
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeft(scrollLeft > 5);
      // Extra 5px tolerance to fix rounding issues
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
      const scrollAmount = window.innerWidth > 768 ? window.innerWidth * 0.6 : window.innerWidth * 0.8;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
      // Allow time for scroll to finish before checking bounds
      setTimeout(checkScroll, 400);
    }
  };

  // Mouse Drag Logic
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.pageX - (scrollRef.current?.offsetLeft || 0));
    setScrollLeft(scrollRef.current?.scrollLeft || 0);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    // Snap to nearest item logic could be added here if CSS snap isn't enough
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - (scrollRef.current?.offsetLeft || 0);
    const walk = (x - startX) * 2; // Scroll-fast multiplier
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollLeft - walk;
    }
  };

  return (
    <div className="py-6">
      <div className="flex items-end justify-between mb-6 px-4 sm:px-6 md:px-10 xl:px-20 max-w-[2520px] mx-auto">
        <div>
          <h2 className="text-[26px] font-semibold text-neutral-800 dark:text-white leading-tight">
            {title}
          </h2>
          {subtitle && (
            <p className="text-[15px] text-neutral-500 dark:text-neutral-400 mt-1">
              {subtitle}
            </p>
          )}
        </div>
        
        {/* Desktop Controls */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={() => scroll('left')}
            disabled={!showLeft}
            className={`flex flex-shrink-0 items-center justify-center w-8 h-8 rounded-full border border-neutral-300 dark:border-border-color transition-all ${
              !showLeft 
                ? 'opacity-30 cursor-not-allowed' 
                : 'hover:shadow-md hover:scale-105 bg-white dark:bg-bg-secondary text-neutral-800 dark:text-white'
            }`}
            aria-label="Scroll izquierda"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll('right')}
            disabled={!showRight}
            className={`flex flex-shrink-0 items-center justify-center w-8 h-8 rounded-full border border-neutral-300 dark:border-border-color transition-all ${
              !showRight 
                ? 'opacity-30 cursor-not-allowed' 
                : 'hover:shadow-md hover:scale-105 bg-white dark:bg-bg-secondary text-neutral-800 dark:text-white'
            }`}
            aria-label="Scroll derecha"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="relative group max-w-[2520px] mx-auto">
        {/* Carousel Container */}
        <div
          ref={scrollRef}
          onScroll={checkScroll}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          className={`flex overflow-x-auto scrollbar-hide py-2 px-4 sm:px-6 md:px-10 xl:px-20 gap-x-5 lg:gap-x-6
            ${isDragging ? 'cursor-grabbing select-none' : 'cursor-grab'} 
            ${!isDragging ? 'scroll-snap-x mandatory' : ''}
          `}
          style={{ 
            scrollbarWidth: 'none', 
            msOverflowStyle: 'none',
            scrollSnapType: !isDragging ? 'x mandatory' : 'none'
          }}
        >
          {React.Children.map(children, (child, idx) => (
            <div 
              key={idx} 
              className="scroll-snap-align-start flex-shrink-0 w-[280px] sm:w-[300px] md:w-[320px] xl:w-[340px]"
              style={{ scrollSnapAlign: 'start' }}
            >
              {child}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
