'use client';

// ===== PÁGINA DE LOGIN - ESTILO AIRBNB PREMIUM =====
// Implementación de alta fidelidad con labels flotantes y micro-interacciones

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock, ChevronLeft } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const { login, loginSocial } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(email, password);
      router.push('/');
    } catch {
      setError('Credenciales inválidas. Por favor intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'facebook') => {
    setError('');
    setIsLoading(true);
    try {
      // Pedimos al backend la URL de autorización
      const API_URL = 'http://localhost:8000';
      const response = await fetch(`${API_URL}/api/v1/auth/${provider}/login`);
      const data = await response.json();
      
      if (data.auth_url) {
        window.location.href = data.auth_url;
      } else {
        throw new Error('No se pudo obtener la URL de autenticación');
      }
    } catch (err) {
      console.error(err);
      setError(`Error al conectar con ${provider}. Intenta de nuevo.`);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20 bg-neutral-50/50">
      <div className="w-full max-w-[480px] animate-in fade-in zoom-in-95 duration-500">
        
        {/* Card Contenedora Premium */}
        <div className="bg-white border border-neutral-200 rounded-3xl shadow-[0_24px_64px_rgba(0,0,0,0.06)] overflow-hidden">
          
          {/* Header con botón de volver */}
          <div className="relative border-b border-neutral-100 px-6 py-5 flex items-center justify-center">
            <button 
              onClick={() => router.back()}
              className="absolute left-6 p-2 hover:bg-neutral-100 rounded-full transition-colors text-neutral-600"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h1 className="text-base font-extrabold text-neutral-900 tracking-tight">Iniciar sesión</h1>
          </div>

          {/* Body del Formulario */}
          <div className="p-8 md:p-10">
            <div className="mb-10 text-left">
              <h2 className="text-2xl font-black text-neutral-900 tracking-tight mb-2">
                Bienvenido a Exploro
              </h2>
              <p className="text-neutral-500 text-[15px] font-medium leading-relaxed">
                Inicia sesión para descubrir y gestionar los mejores destinos de Nariño.
              </p>
            </div>

            {/* Banner de Error Dinámico */}
            {error && (
              <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-700 text-sm font-semibold animate-in slide-in-from-top-2 duration-300">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-0">
              {/* Contenedor de Inputs agrupados estilo Airbnb */}
              <div className={`rounded-2xl border transition-all shadow-sm overflow-hidden ${focusedField ? 'border-2 border-airbnb' : 'border-neutral-300'}`}>
                
                {/* Campo Email */}
                <div 
                  className="relative p-4 bg-white"
                >
                  <label 
                    htmlFor="login-email"
                    className={`absolute left-4 transition-all duration-200 pointer-events-none font-bold uppercase tracking-widest ${
                      focusedField === 'email' || email 
                        ? 'top-2.5 text-[10px] text-airbnb' 
                        : 'top-6 text-sm text-neutral-400'
                    }`}
                  >
                    Correo electrónico
                  </label>
                  <input
                    type="email"
                    id="login-email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    className="w-full pt-4 pb-0 bg-transparent text-neutral-900 text-base font-medium border-0 focus:ring-0 focus:outline-none focus-visible:ring-0 placeholder:opacity-0 focus:placeholder:opacity-50 transition-all min-h-[48px] shadow-none outline-none"
                    required
                    placeholder="ejemplo@correo.com"
                  />
                  <Mail className={`absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${focusedField === 'email' ? 'text-airbnb' : 'text-neutral-300'}`} />
                </div>

                {/* Línea divisoria limpia */}
                <div className="h-[1px] bg-neutral-100 mx-4" />

                {/* Campo Contraseña */}
                <div 
                  className="relative p-4 bg-white"
                >
                  <label 
                    htmlFor="login-password"
                    className={`absolute left-4 transition-all duration-200 pointer-events-none font-bold uppercase tracking-widest ${
                      focusedField === 'password' || password 
                        ? 'top-2.5 text-[10px] text-airbnb' 
                        : 'top-6 text-sm text-neutral-400'
                    }`}
                  >
                    Contraseña
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="login-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    className="w-full pt-4 pb-0 bg-transparent text-neutral-900 text-base font-medium border-0 focus:ring-0 focus:outline-none focus-visible:ring-0 placeholder:opacity-0 focus:placeholder:opacity-50 transition-all min-h-[48px] shadow-none outline-none"
                    required
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors ${focusedField === 'password' ? 'text-airbnb' : 'text-neutral-300'} hover:text-neutral-600 outline-none`}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="mt-6 flex flex-col items-center gap-4">
                <Link 
                  href="#" 
                  className="text-xs font-bold text-neutral-900 hover:text-airbnb transition-colors underline underline-offset-4 decoration-neutral-200 hover:decoration-airbnb"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
                
                <p className="text-[11px] text-neutral-400 font-medium italic">
                  Para fines de demostración, puedes usar cualquier credencial.
                </p>
              </div>

              {/* Botón de Acción Principal */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-8 relative overflow-hidden group bg-gradient-to-r from-airbnb via-airbnb-dark to-airbnb text-white py-4 rounded-2xl font-black text-lg shadow-xl active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="relative z-10">
                  {isLoading ? 'Verificando...' : 'Continuar'}
                </span>
              </button>
            </form>

            {/* Divisor con Estilo */}
            <div className="flex items-center gap-4 my-10 px-2">
              <div className="flex-1 h-[1px] bg-neutral-200" />
              <span className="text-[11px] font-black text-neutral-400 uppercase tracking-widest">o</span>
              <div className="flex-1 h-[1px] bg-neutral-200" />
            </div>

            {/* Redes Sociales Premium */}
            <div className="grid grid-cols-1 gap-4">
              <button 
                type="button"
                onClick={() => handleSocialLogin('google')}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-4 border-2 border-neutral-100 rounded-2xl py-3.5 font-bold text-sm text-neutral-800 hover:bg-neutral-50 hover:border-neutral-200 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continuar con Google
              </button>
              <button 
                type="button"
                onClick={() => handleSocialLogin('facebook')}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-4 border-2 border-neutral-100 rounded-2xl py-3.5 font-bold text-sm text-neutral-800 hover:bg-neutral-50 hover:border-neutral-200 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                <svg className="w-6 h-6 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z"/>
                </svg>
                Continuar con Facebook
              </button>
            </div>

            {/* Footer de Registro */}
            <div className="mt-12 text-center space-y-2">
              <p className="text-neutral-500 text-sm font-medium">
                ¿Aún no eres parte de la comunidad?{' '}
                <Link href="/register" className="text-airbnb font-semibold hover:underline">
                  Crea una cuenta
                </Link>
              </p>
              <p className="text-neutral-400 text-xs">
                Puedes registrarte como turista o como PYME.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


