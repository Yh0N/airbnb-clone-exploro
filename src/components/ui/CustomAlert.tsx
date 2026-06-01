'use client';

import React from 'react';
import { AlertTriangle, CheckCircle2, Info, X, XCircle, Loader2 } from 'lucide-react';
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
    iconBg: 'bg-red-100 dark:bg-red-900/30',
    iconColor: 'text-red-500 dark:text-red-400',
    title: 'text-red-700 dark:text-red-300',
    message: 'text-red-600 dark:text-red-400',
    accent: 'border-t-2 border-red-300 dark:border-red-700',
    btnClass: 'bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600',
  },
  success: {
    icon: CheckCircle2,
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/30',
    iconColor: 'text-emerald-500 dark:text-emerald-400',
    title: 'text-emerald-700 dark:text-emerald-300',
    message: 'text-emerald-600 dark:text-emerald-400',
    accent: 'border-t-2 border-emerald-300 dark:border-emerald-700',
    btnClass: 'bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600',
  },
  warning: {
    icon: AlertTriangle,
    iconBg: 'bg-amber-100 dark:bg-amber-900/30',
    iconColor: 'text-amber-500 dark:text-amber-400',
    title: 'text-amber-700 dark:text-amber-300',
    message: 'text-amber-600 dark:text-amber-400',
    accent: 'border-t-2 border-amber-300 dark:border-amber-700',
    btnClass: 'bg-amber-600 hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-600',
  },
  info: {
    icon: Info,
    iconBg: 'bg-blue-100 dark:bg-blue-900/30',
    iconColor: 'text-blue-500 dark:text-blue-400',
    title: 'text-blue-700 dark:text-blue-300',
    message: 'text-blue-600 dark:text-blue-400',
    accent: 'border-t-2 border-blue-300 dark:border-blue-700',
    btnClass: 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600',
  },
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
  isLoading = false,
}) => {
  if (!isOpen) return null;

  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-neutral-950/50 backdrop-blur-sm"
        onClick={onConfirm ? undefined : onClose}
      />

      {/* Card */}
      <div className={cn(
        "relative w-full max-w-sm overflow-hidden rounded-3xl shadow-2xl",
        "bg-white dark:bg-neutral-900",
        "border border-neutral-200 dark:border-neutral-700",
        "animate-in zoom-in-95 duration-200",
        config.accent,
      )}>
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6 pb-3">
          <div className="flex items-center gap-3">
            <div className={cn("p-2.5 rounded-2xl shadow-sm", config.iconBg)}>
              <Icon className={cn("w-5 h-5", config.iconColor)} />
            </div>
            <h3 className={cn("text-base font-bold leading-tight", config.title)}>
              {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-4 h-4 text-neutral-400 dark:text-neutral-500" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 pb-5">
          <p className={cn("text-sm leading-relaxed", config.message)}>
            {message}
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-neutral-50 dark:bg-neutral-800/60 border-t border-neutral-100 dark:border-neutral-700/50">
          {onConfirm && (
            <button
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-semibold text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors disabled:opacity-50 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-700"
            >
              {cancelText}
            </button>
          )}
          <Button
            onClick={onConfirm || onClose}
            disabled={isLoading}
            className={cn(
              "rounded-xl px-5 py-2 h-auto text-sm font-bold text-white shadow-md transition-all active:scale-95",
              onConfirm ? config.btnClass : "bg-neutral-800 hover:bg-neutral-700 dark:bg-neutral-700 dark:hover:bg-neutral-600"
            )}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Procesando...
              </span>
            ) : confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};
