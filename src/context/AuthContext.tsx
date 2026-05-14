'use client';

// ===== CONTEXTO DE AUTENTICACIÓN =====
// Maneja el estado de autenticación global de la aplicación

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { login, loginSocial, register as registerApi, getProfile, updateProfile } from '@/services/api';
import type { User } from '@/services/mockData';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginSocial: (provider: 'google' | 'facebook') => Promise<void>;
  register: (name: string, email: string, password: string, preferences?: string[], rol?: number, telefono?: string) => Promise<void>;
  updateProfile: (data: { name?: string; email?: string; biography?: string; photo?: string; interests?: string[] }) => Promise<void>;
  logout: () => void;
  updateFavorites: (favorites: number[]) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Verificar si hay sesión guardada al montar
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const savedUser = localStorage.getItem('user');
        if (token && savedUser) {
          setUser(JSON.parse(savedUser));
          // Opcionalmente verificar con la API
          try {
            const profile = await getProfile();
            setUser(profile);
            localStorage.setItem('user', JSON.stringify(profile));
          } catch (error) {
            // Token expirado o inválido -> limpieza de sesión
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user');
            setUser(null);
            console.warn('Sesión expirada detectada al inicio');
          }
        }
      } catch {
        // Error al leer localStorage
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  const loginFn = useCallback(async (email: string, password: string) => {
    const { token, user: userData } = await login({ email, password });
    localStorage.setItem('auth_token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  }, []);

  const loginSocialFn = useCallback(async (provider: 'google' | 'facebook') => {
    const { token, user: userData } = await loginSocial(provider);
    localStorage.setItem('auth_token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  }, []);

  const registerFn = useCallback(async (name: string, email: string, password: string, preferences?: string[], rol?: number, telefono?: string) => {
    const { token, user: userData } = await registerApi({ name, email, password, preferencias: preferences, rol, telefono });
    localStorage.setItem('auth_token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  }, []);

  const updateProfileFn = useCallback(async (data: { name?: string; email?: string; biography?: string; photo?: string; interests?: string[] }) => {
    // Mapear campos frontend -> backend
    const backendData = {
      nombre: data.name,
      correo: data.email,
      biografia: data.biography,
      foto: data.photo,
      preferencias: data.interests
    };
    
    const updatedUser = await updateProfile(backendData);
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  const updateFavorites = useCallback((favorites: number[]) => {
    if (user) {
      const updated = { ...user, favorites };
      setUser(updated);
      localStorage.setItem('user', JSON.stringify(updated));
    }
  }, [user]);

  const refreshUser = useCallback(async () => {
    try {
      const profile = await getProfile();
      setUser(profile);
      localStorage.setItem('user', JSON.stringify(profile));
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login: loginFn,
        loginSocial: loginSocialFn,
        register: registerFn,
        updateProfile: updateProfileFn,
        logout,
        updateFavorites,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}
