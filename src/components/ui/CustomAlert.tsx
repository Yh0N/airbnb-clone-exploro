'use client';

import React from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  X, 
  XCircle, 
  Loader2 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';

interface CustomAlertProps {
  type: 'error' | 'success' | 'warning' | 'info';
  title: string;
  message: string;
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
}

const typeConfig = {
  error: {
    icon: XCircle,
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-800',
    iconColor: 'text-red-500',
    btnClass: 'bg-red-600 hover:bg-red-700'
  },
  success: {
    icon: CheckCircle2,
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-800',
    iconColor: 'text-emerald-500',
    btnClass: 'bg-emerald-600 hover:bg-emerald-700'
  },
  warning: {
    icon: AlertTriangle,
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-800',
    iconColor: 'text-amber-500',
    btnClass: 'bg-amber-600 hover:bg-amber-700'
  },
  info: {
    icon: Info,
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-800',
    iconColor: 'text-blue-500',
    btnClass: 'bg-blue-600 hover:bg-blue-700'
  }
};

export const CustomAlert: React.FC<CustomAlertProps> = ({
  type,
  title,
  message,
  isOpen,
  onClose,
  onConfirm,
  confirmText = 'Aceptar',
  cancelText = 'Cancelar',
  isLoading = false
}) => {
  if (!isOpen) return null;

  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-neutral-950/40 backdrop-blur-sm" 
        onClick={onConfirm ? undefined : onClose} 
      />
      
      {/* Modal Card */}
      <div className={cn(
        "relative w-full max-w-md overflow-hidden rounded-3xl border shadow-2xl transition-all zoom-in-95 duration-200",
        config.bg,
        config.border
      )}>
        {/* Header con Icono */}
        <div className="flex items-start justify-between p-6 pb-2">
          <div className="flex items-center gap-4">
            <div className={cn("p-2 rounded-2xl bg-white shadow-sm", config.iconColor)}>
              <Icon className="w-6 h-6" />
            </div>
            <h3 className={cn("text-lg font-bold leading-none", config.text)}>
              {title}
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-black/5 transition-colors"
          >
            <X className="w-5 h-5 text-neutral-400" />
          </button>
        </div>

        {/* Cuerpo */}
        <div className="px-6 py-4">
          <p className={cn("text-sm font-medium leading-relaxed opacity-90", config.text)}>
            {message}
          </p>
        </div>

        {/* Footer con Botones */}
        <div className="flex items-center justify-end gap-3 p-6 pt-2 bg-white/50 backdrop-blur-md">
          {onConfirm && (
            <button
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-semibold text-neutral-600 hover:text-neutral-900 transition-colors disabled:opacity-50"
            >
              {cancelText}
            </button>
          )}
          
          <Button
            onClick={onConfirm || onClose}
            disabled={isLoading}
            className={cn(
              "rounded-xl px-6 py-2 h-auto text-sm font-bold shadow-lg shadow-black/5 transition-all active:scale-95",
              onConfirm ? config.btnClass : "bg-neutral-800 hover:bg-neutral-900"
            )}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Procesando...
              </div>
            ) : (
              confirmText
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
