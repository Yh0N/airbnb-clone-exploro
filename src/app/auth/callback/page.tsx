'use client';

import React, { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import LoadingSpinner from '@/components/LoadingSpinner';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshUser } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    const refreshToken = searchParams.get('refresh_token');

    if (token) {
      // Guardar tokens en localStorage
      localStorage.setItem('auth_token', token);
      if (refreshToken) {
        localStorage.setItem('refresh_token', refreshToken);
      }

      // Refrescar el estado del usuario en el contexto
      const handleLogin = async () => {
        try {
          // Intentar obtener el perfil del usuario con el nuevo token
          await refreshUser();
          router.push('/');
        } catch (error) {
          console.error('Error during social login callback:', error);
          router.push('/login?error=auth_failed');
        }
      };

      handleLogin();
    } else {
      router.push('/login?error=no_token');
    }
  }, [searchParams, router, refreshUser]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-bg-primary">
      <LoadingSpinner size="lg" text="Autenticando con Exploro..." />
      <p className="mt-4 text-neutral-500 animate-pulse">Finalizando inicio de sesión seguro...</p>
    </div>
  );
}

export default function AuthCallback() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center bg-bg-primary">
        <LoadingSpinner size="lg" text="Preparando..." />
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}
