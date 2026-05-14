'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock, User, Phone, MapPin, Building, Info, Link as LinkIcon } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import * as api from '@/services/api';

export default function RegisterPage() {
  const { register, loginSocial } = useAuth();
  const router = useRouter();
  
  // Common states
  const [accountType, setAccountType] = useState<'user' | 'pyme'>('user');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // User states
  const [name, setName] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  // Pyme states
  const [companyName, setCompanyName] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [socialMedia, setSocialMedia] = useState('');

  const categories = [
    'naturaleza', 'cultura', 'gastronomia', 'aventura', 'religion', 'artesania', 'termal', 'mirador'
  ];

  // Reglas de seguridad de contraseña (mismas que el backend)
  const passwordRules = [
    { id: 'length',   label: 'Mínimo 8 caracteres',          test: (p: string) => p.length >= 8 },
    { id: 'upper',    label: 'Una letra mayúscula (A-Z)',      test: (p: string) => /[A-Z]/.test(p) },
    { id: 'lower',    label: 'Una letra minúscula (a-z)',      test: (p: string) => /[a-z]/.test(p) },
    { id: 'number',   label: 'Un número (0-9)',               test: (p: string) => /[0-9]/.test(p) },
    { id: 'special',  label: 'Un carácter especial (!@#$...)', test: (p: string) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(p) },
  ];

  const passedRules = passwordRules.filter(r => r.test(password)).length;
  const strengthLabel = passedRules <= 2 ? 'Débil' : passedRules <= 4 ? 'Media' : 'Fuerte';
  const strengthColor = passedRules <= 2 ? 'bg-red-500' : passedRules <= 4 ? 'bg-yellow-500' : 'bg-green-500';
  const strengthWidth = `${(passedRules / 5) * 100}%`;

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev => 
      prev.includes(interest) 
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    if (passedRules < 5) {
      setError('La contraseña no cumple todos los requisitos de seguridad');
      return;
    }

    if (accountType === 'user' && selectedInterests.length < 3) {
      setError('Debes seleccionar al menos 3 preferencias');
      return;
    }

    setIsLoading(true);
    try {
      if (accountType === 'user') {
        await register(name, email, password, selectedInterests, 1, phone);
        router.push('/');
      } else {
        await register(companyName, email, password, [], 2, phone);
        try {
          await api.createPyme({
            nombre: companyName,
            descripcion: description,
            ubicacion_textual: address,
            telefono: phone,
            redes_sociales: socialMedia,
            tipo: 'otro' // Default type
          });
        } catch (err) {
          console.error("Error creating PYME profile", err);
        }
        // Redirect to dashboard where they can manage their pyme
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Error al crear la cuenta. Intenta de nuevo.');
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
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white border border-neutral-200 rounded-xl shadow-card overflow-hidden">
          <div className="border-b border-neutral-200 p-6 text-center">
            <h1 className="text-lg font-bold text-neutral-800">Regístrate en Exploro</h1>
          </div>

          <div className="p-6">
            {error && (
              <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm animate-slide-down">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Tipo de Cuenta - AT TOP */}
              <div>
                <p className="text-sm font-semibold text-neutral-800 mb-3 text-center">
                  ¿Cómo quieres usar Exploro?
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setAccountType('user')}
                    className={`p-3 rounded-xl border-2 text-sm font-bold flex flex-col items-center gap-2 transition-all ${
                      accountType === 'user' 
                      ? 'border-neutral-900 bg-neutral-900 text-white shadow-md' 
                      : 'border-neutral-200 bg-white text-neutral-500 hover:border-neutral-300 hover:bg-neutral-50'
                    }`}
                  >
                    <span className="text-xl">👤</span>
                    Turista
                  </button>
                  <button
                    type="button"
                    onClick={() => setAccountType('pyme')}
                    className={`p-3 rounded-xl border-2 text-sm font-bold flex flex-col items-center gap-2 transition-all ${
                      accountType === 'pyme' 
                      ? 'border-airbnb bg-airbnb text-white shadow-md' 
                      : 'border-neutral-200 bg-white text-neutral-500 hover:border-neutral-300 hover:bg-neutral-50'
                    }`}
                  >
                    <span className="text-xl">🏢</span>
                    Negocio / PYME
                  </button>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-neutral-100">
                
                {/* CAMPOS ESPECÍFICOS: USUARIO VS PYME */}
                {accountType === 'user' ? (
                  <>
                    <div className="relative">
                      <label className="absolute top-2 left-4 text-xs text-neutral-500 font-medium z-10">
                        Nombre y Apellido
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full pt-7 pb-3 px-4 pr-12 border border-neutral-300 rounded-lg focus:border-neutral-800 focus:ring-1 focus:ring-neutral-800 outline-none text-base transition-colors"
                          required
                          placeholder="Tu nombre completo"
                        />
                        <User className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                      </div>
                    </div>

                    <div className="relative">
                      <label className="absolute top-2 left-4 text-xs text-neutral-500 font-medium z-10">
                        Teléfono (Opcional)
                      </label>
                      <div className="relative">
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full pt-7 pb-3 px-4 pr-12 border border-neutral-300 rounded-lg focus:border-neutral-800 focus:ring-1 focus:ring-neutral-800 outline-none text-base transition-colors"
                          placeholder="Tu número de teléfono"
                        />
                        <Phone className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="relative">
                      <label className="absolute top-2 left-4 text-xs text-neutral-500 font-medium z-10">
                        Nombre de Empresa
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          className="w-full pt-7 pb-3 px-4 pr-12 border border-neutral-300 rounded-lg focus:border-neutral-800 focus:ring-1 focus:ring-neutral-800 outline-none text-base transition-colors"
                          required
                          placeholder="Nombre comercial"
                        />
                        <Building className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                      </div>
                    </div>

                    <div className="relative">
                      <label className="absolute top-2 left-4 text-xs text-neutral-500 font-medium z-10">
                        Descripción
                      </label>
                      <div className="relative">
                        <textarea
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          className="w-full pt-7 pb-3 px-4 pr-12 border border-neutral-300 rounded-lg focus:border-neutral-800 focus:ring-1 focus:ring-neutral-800 outline-none text-base transition-colors resize-none h-24"
                          required
                          placeholder="Breve descripción del negocio"
                        />
                        <Info className="absolute right-4 top-4 w-5 h-5 text-neutral-400" />
                      </div>
                    </div>

                    <div className="relative">
                      <label className="absolute top-2 left-4 text-xs text-neutral-500 font-medium z-10">
                        Dirección
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          className="w-full pt-7 pb-3 px-4 pr-12 border border-neutral-300 rounded-lg focus:border-neutral-800 focus:ring-1 focus:ring-neutral-800 outline-none text-base transition-colors"
                          required
                          placeholder="Ubicación de la empresa"
                        />
                        <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                      </div>
                    </div>

                    <div className="relative">
                      <label className="absolute top-2 left-4 text-xs text-neutral-500 font-medium z-10">
                        Teléfono
                      </label>
                      <div className="relative">
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full pt-7 pb-3 px-4 pr-12 border border-neutral-300 rounded-lg focus:border-neutral-800 focus:ring-1 focus:ring-neutral-800 outline-none text-base transition-colors"
                          required
                          placeholder="Teléfono de contacto"
                        />
                        <Phone className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                      </div>
                    </div>

                    <div className="relative">
                      <label className="absolute top-2 left-4 text-xs text-neutral-500 font-medium z-10">
                        Redes Sociales (Opcional)
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={socialMedia}
                          onChange={(e) => setSocialMedia(e.target.value)}
                          className="w-full pt-7 pb-3 px-4 pr-12 border border-neutral-300 rounded-lg focus:border-neutral-800 focus:ring-1 focus:ring-neutral-800 outline-none text-base transition-colors"
                          placeholder="Instagram, Facebook, etc."
                        />
                        <LinkIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                      </div>
                    </div>
                  </>
                )}

                {/* COMMON FIELDS */}
                <div className="relative">
                  <label className="absolute top-2 left-4 text-xs text-neutral-500 font-medium z-10">
                    Correo electrónico
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pt-7 pb-3 px-4 pr-12 border border-neutral-300 rounded-lg focus:border-neutral-800 focus:ring-1 focus:ring-neutral-800 outline-none text-base transition-colors"
                      required
                      placeholder="correo@ejemplo.com"
                    />
                    <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                  </div>
                </div>

                {/* CAMPOS CONTRASEÑA */}
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                      <label className="absolute top-2 left-4 text-xs text-neutral-500 font-medium z-10">
                        Contraseña
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full pt-7 pb-3 px-4 pr-10 border border-neutral-300 rounded-lg focus:border-neutral-800 focus:ring-1 focus:ring-neutral-800 outline-none text-base transition-colors"
                          required
                          placeholder="Mínimo 8 caracteres"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="relative">
                      <label className="absolute top-2 left-4 text-xs text-neutral-500 font-medium z-10">
                        Confirmar
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full pt-7 pb-3 px-4 pr-10 border border-neutral-300 rounded-lg focus:border-neutral-800 focus:ring-1 focus:ring-neutral-800 outline-none text-base transition-colors"
                          required
                          placeholder="Repetir"
                        />
                        <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                      </div>
                    </div>
                  </div>

                  {/* Indicador de fortaleza */}
                  {password.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 bg-neutral-200 rounded-full h-1.5 mr-3">
                          <div
                            className={`h-1.5 rounded-full transition-all duration-500 ${strengthColor}`}
                            style={{ width: strengthWidth }}
                          />
                        </div>
                        <span className={`text-xs font-bold ${
                          passedRules <= 2 ? 'text-red-500' : passedRules <= 4 ? 'text-yellow-600' : 'text-green-600'
                        }`}>{strengthLabel}</span>
                      </div>
                      <div className="grid grid-cols-1 gap-1">
                        {passwordRules.map(rule => (
                          <div key={rule.id} className="flex items-center gap-2">
                            <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-black flex-shrink-0 ${
                              rule.test(password) ? 'bg-green-100 text-green-600' : 'bg-neutral-100 text-neutral-400'
                            }`}>
                              {rule.test(password) ? '✓' : '·'}
                            </span>
                            <span className={`text-xs ${
                              rule.test(password) ? 'text-green-700 font-medium' : 'text-neutral-400'
                            }`}>{rule.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Preferencias (Solo Turista) */}
              {accountType === 'user' && (
                <div className="pt-2">
                  <p className="text-sm font-semibold text-neutral-800 mb-1">
                    Tus intereses (Selecciona al menos 3) <span className="text-red-500">*</span>
                  </p>
                  <p className="text-xs text-neutral-500 mb-3">
                    Seleccionados: {selectedInterests.length}/3
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => toggleInterest(cat)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                          selectedInterests.includes(cat)
                            ? 'bg-neutral-800 text-white border-neutral-800'
                            : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-400'
                        }`}
                      >
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Submit */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-[#E61E4D] via-[#E31C5F] to-[#D70466] text-white py-3.5 rounded-lg font-bold text-base hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Creando cuenta...
                    </>
                  ) : (
                    accountType === 'user' ? 'Comenzar a explorar' : 'Registrar Negocio'
                  )}
                </button>
              </div>
            </form>

            {/* Redes Sociales Divisor */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-[1px] bg-neutral-200" />
              <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">o</span>
              <div className="flex-1 h-[1px] bg-neutral-200" />
            </div>

            {/* Social Buttons */}
            <div className="grid grid-cols-1 gap-3">
              <button 
                type="button"
                onClick={() => handleSocialLogin('google')}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 border border-neutral-300 rounded-xl py-3 text-sm font-bold text-neutral-700 hover:bg-neutral-50 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Registrarse con Google
              </button>
              <button 
                type="button"
                onClick={() => handleSocialLogin('facebook')}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 border border-neutral-300 rounded-xl py-3 text-sm font-bold text-neutral-700 hover:bg-neutral-50 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                <svg className="w-6 h-6 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z"/>
                </svg>
                Registrarse con Facebook
              </button>
            </div>

            <div className="text-center mt-6">
              <p className="text-sm text-neutral-600">
                ¿Ya tienes cuenta?{' '}
                <Link href="/login" className="text-airbnb font-semibold hover:underline">
                  Inicia sesión
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
