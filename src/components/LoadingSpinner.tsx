'use client';

// ===== SPINNER DE CARGA =====
// Componente de loading reutilizable

import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

export default function LoadingSpinner({ size = 'md', text }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12">
      <div
        className={`${sizeClasses[size]} border-2 border-neutral-200 border-t-airbnb rounded-full animate-spin`}
      />
      {text && <p className="text-sm text-neutral-500">{text}</p>}
    </div>
  );
}
