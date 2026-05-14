'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Search } from 'lucide-react';

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  searchable?: boolean;
}

export default function CustomSelect({ 
  options, 
  value, 
  onChange, 
  label, 
  placeholder,
  searchable = false 
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const selectedOption = options.find(opt => opt.value === value);
  const filteredOptions = options.filter(opt => 
    opt.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Cerrar al hacer click afuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Manejo de teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Foco automático en búsqueda
  useEffect(() => {
    if (isOpen && searchable && inputRef.current) {
      inputRef.current.focus();
    }
    if (!isOpen) setSearchTerm('');
  }, [isOpen, searchable]);

  return (
    <div className="space-y-2 relative" ref={containerRef}>
      {label && (
        <label className="text-xs font-black text-neutral-500 dark:text-neutral-400 uppercase tracking-widest ml-1">
          {label}
        </label>
      )}
      
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-4 py-3.5 bg-white dark:bg-neutral-900 border-2 rounded-2xl outline-none transition-all duration-300 text-left ${
          isOpen 
            ? 'border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.15)] ring-4 ring-blue-500/10' 
            : 'border-neutral-100 dark:border-neutral-800 hover:border-neutral-200 dark:hover:border-neutral-700 shadow-sm'
        }`}
      >
        <span className="flex items-center gap-3">
          {selectedOption ? (
            <>
              <span className="w-8 h-8 flex items-center justify-center bg-neutral-100 dark:bg-neutral-800 rounded-lg text-lg shadow-inner">
                {selectedOption.label.split(' ')[0]}
              </span>
              <span className="text-neutral-800 dark:text-white font-extrabold text-sm tracking-tight">
                {selectedOption.label.split(' ').slice(1).join(' ')}
              </span>
            </>
          ) : (
            <span className="text-neutral-400 font-medium text-sm">{placeholder || 'Seleccionar...'}</span>
          )}
        </span>
        <div className={`p-1 rounded-lg transition-colors ${isOpen ? 'bg-blue-50 text-blue-500' : 'text-neutral-400'}`}>
           <ChevronDown className={`w-4 h-4 transition-transform duration-500 ${isOpen ? 'rotate-180 scale-110' : ''}`} />
        </div>
      </button>

      {isOpen && (
        <div className="absolute z-[150] w-full mt-2 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-xl border-2 border-neutral-100 dark:border-neutral-800 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top">
          
          {searchable && (
            <div className="p-3 border-b border-neutral-100 dark:border-neutral-800">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  ref={inputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar..."
                  className="w-full pl-10 pr-4 py-2 bg-neutral-50 dark:bg-neutral-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none dark:text-white"
                />
              </div>
            </div>
          )}

          <div className="max-h-64 overflow-y-auto py-2 custom-scrollbar">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => {
                const [emoji, ...textParts] = option.label.split(' ');
                const text = textParts.join(' ');
                const isSelected = value === option.value;
                
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      onChange(option.value);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-3 text-sm transition-all group ${
                      isSelected 
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-black' 
                        : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 hover:text-neutral-900 dark:hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <span className={`text-xl transition-transform duration-300 group-hover:scale-125 ${isSelected ? 'scale-110 drop-shadow-md' : 'grayscale-[0.5] group-hover:grayscale-0'}`}>
                        {emoji}
                      </span>
                      <span className="truncate tracking-tight">{text}</span>
                    </div>
                    {isSelected && (
                      <div className="bg-blue-600 text-white rounded-full p-0.5 shadow-lg shadow-blue-600/30 animate-in zoom-in duration-300">
                        <Check className="w-3 h-3" strokeWidth={4} />
                      </div>
                    )}
                  </button>
                );
              })
            ) : (
              <div className="px-4 py-8 text-center">
                <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest italic">No hay resultados</p>
              </div>
            )}
          </div>
        </div>
      )}
      
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e5e5e5;
          border-radius: 10px;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #333;
        }
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-scale-in {
          animation: scale-in 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
