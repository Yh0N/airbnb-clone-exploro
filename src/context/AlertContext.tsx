'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { CustomAlert } from '@/components/ui/CustomAlert';

type AlertType = 'error' | 'success' | 'warning' | 'info';

interface AlertContextType {
  showAlert: (config: {
    type: AlertType;
    title: string;
    message: string;
    onConfirm?: () => void;
    confirmText?: string;
    cancelText?: string;
  }) => void;
  hideAlert: () => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [alert, setAlert] = useState<{
    isOpen: boolean;
    type: AlertType;
    title: string;
    message: string;
    onConfirm?: () => void;
    confirmText?: string;
    cancelText?: string;
  }>({
    isOpen: false,
    type: 'info',
    title: '',
    message: ''
  });

  const showAlert = useCallback((config: {
    type: AlertType;
    title: string;
    message: string;
    onConfirm?: () => void;
    confirmText?: string;
    cancelText?: string;
  }) => {
    setAlert({ ...config, isOpen: true });
  }, []);

  const hideAlert = useCallback(() => {
    setAlert(prev => ({ ...prev, isOpen: false }));
  }, []);

  return (
    <AlertContext.Provider value={{ showAlert, hideAlert }}>
      {children}
      <CustomAlert
        {...alert}
        onClose={hideAlert}
        onConfirm={alert.onConfirm ? () => {
          alert.onConfirm?.();
          hideAlert();
        } : undefined}
      />
    </AlertContext.Provider>
  );
};

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (context === undefined) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};
