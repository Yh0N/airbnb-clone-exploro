'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Building2, 
  MapPin, 
  Navigation, 
  Compass, 
  LayoutList, 
  Map as MapIcon, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  Loader2, 
  Zap, 
  ShieldCheck, 
  Star,
  Store,
  Globe,
  AlertTriangle,
  UserPlus,
  User,
  LogIn,
  ArrowRightLeft,
  X
} from 'lucide-react';
import dynamic from 'next/dynamic';
import * as api from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import CustomSelect from '@/components/exploro/CustomSelect';

const MapPicker = dynamic(() => import('@/components/MapPicker'), { ssr: false });

const TIPOS_PYME = [
  { value: 'hotel', label: '🏨 Alojamiento / Hotel' },
  { value: 'restaurante', label: '🍕 Restaurante / Gastronomía' },
  { value: 'agencia', label: '🧭 Agencia de Viajes / Tours' },
  { value: 'artesania', label: '🎨 Artesanía' },
  { value: 'transporte', label: '🚐 Transporte Turístico' },
  { value: 'cultura', label: '🏛️ Centro Cultural' },
  { value: 'otro', label: '📦 Otro' },
];

const PREFIJOS_DIRECCION = [
  { value: 'Calle', label: '🛣️ Calle' },
  { value: 'Carrera', label: '🛣️ Carrera' },
  { value: 'Avenida', label: '🛣️ Avenida' },
  { value: 'Diagonal', label: '🛣️ Diagonal' },
  { value: 'Transversal', label: '🛣️ Transversal' },
];

export default function PymeOnboarding() {
  const router = useRouter();
  const { user, isLoading: authLoading, logout } = useAuth();
  const [hasCheckedRole, setHasCheckedRole] = useState(false);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [locationMode, setLocationMode] = useState<'address' | 'coordinates'>('coordinates');
  const [showWarning, setShowWarning] = useState(false);
  
  const [form, setForm] = useState({
    nombre: '',
    tipo: 'hotel',
    prefijo_direccion: 'Calle',
    direccion_detalle: '',
    ciudad: 'Pasto',
    latitud: '',
    longitud: '',
    telefono: '',
    whatsapp: '',
  });

  // Verificación de auth y rol
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login?redirect=/pyme-onboarding');
      } else if (user.rol === 1 && !hasCheckedRole) {
        setShowWarning(true);
        setHasCheckedRole(true);
      }
    }
  }, [user, authLoading, router, hasCheckedRole]);

  if (authLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-bg-primary">
      <Loader2 className="w-10 h-10 animate-spin text-airbnb" />
    </div>
  );

  const handleGeolocate = () => {
    if (!('geolocation' in navigator)) {
      alert('Tu navegador no soporta geolocalización.');
      return;
    }
    setGeoLoading(true);
    setLocationMode('coordinates');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm(prev => ({
          ...prev,
          latitud: pos.coords.latitude.toFixed(6),
          longitud: pos.coords.longitude.toFixed(6),
        }));
        setGeoLoading(false);
      },
      () => {
        alert('No se pudo obtener tu ubicación.');
        setGeoLoading(false);
      }
    );
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const fullDireccion = locationMode === 'address' 
        ? `${form.prefijo_direccion} ${form.direccion_detalle}, ${form.ciudad}`
        : 'Ubicación por coordenadas';

      const payload: any = {
        nombre: form.nombre,
        tipo: form.tipo,
        ubicacion_textual: fullDireccion,
        telefono: form.telefono || undefined,
        whatsapp: form.whatsapp || undefined,
      };

      // Solo añadir coordenadas si son números válidos
      const lat = parseFloat(form.latitud);
      const lng = parseFloat(form.longitud);
      
      if (!isNaN(lat)) payload.latitud = lat;
      if (!isNaN(lng)) payload.longitud = lng;

      // REGISTRO DE NEGOCIO OFICIAL
      await api.createPyme(payload);
      // Actualizar el perfil localmente para que el rol cambie a 2 (Pyme)
      const updatedProfile = await api.getProfile();
      // Nota: El AuthContext debería manejar esto, pero forzamos una actualización si es necesario
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(updatedProfile));
      }
      
      setStep(4); // Pantalla de éxito
    } catch (error: any) {
      console.error('[Onboarding] Error al registrar:', error);
      const detail = error?.response?.data?.detail;
      if (Array.isArray(detail)) {
        alert(`Error de validación: ${detail.map((d: any) => d.msg).join(', ')}`);
      } else {
        alert(detail || 'Error al registrar el negocio.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-bg-primary font-sans selection:bg-airbnb/20">

      {/* ─── MODAL DE ADVERTENCIA DE CAMBIO DE ROL ─── */}
      {showWarning && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center px-4 bg-black/70 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-white dark:bg-neutral-900 rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            
            {/* Header con degradado de advertencia */}
            <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-8 text-white relative overflow-hidden">
              <div className="absolute -top-6 -right-6 w-32 h-32 bg-white/10 rounded-full" />
              <div className="absolute -bottom-8 -left-4 w-24 h-24 bg-white/5 rounded-full" />
              <div className="relative z-10 space-y-3">
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <AlertTriangle className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-black tracking-tight">¡Atención!</h2>
                  <p className="text-sm text-amber-100 font-medium mt-1">Tu cuenta está a punto de cambiar</p>
                </div>
              </div>
            </div>

            {/* Contenido */}
            <div className="p-8 space-y-6">
              {/* Explicación del cambio */}
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-neutral-50 dark:bg-neutral-800 rounded-2xl">
                  <div className="flex flex-col items-center gap-1.5">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/40 rounded-xl flex items-center justify-center">
                      <span className="text-xl">👤</span>
                    </div>
                    <span className="text-[9px] font-black text-blue-600 uppercase tracking-wider">Usuario</span>
                  </div>
                  <div className="flex-1 h-[2px] bg-gradient-to-r from-blue-400 to-amber-400 rounded-full relative">
                    <ArrowRightLeft className="w-4 h-4 text-neutral-400 absolute -top-[7px] left-1/2 -translate-x-1/2 bg-neutral-50 dark:bg-neutral-800 rounded-full p-0.5" />
                  </div>
                  <div className="flex flex-col items-center gap-1.5">
                    <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/40 rounded-xl flex items-center justify-center">
                      <span className="text-xl">🏢</span>
                    </div>
                    <span className="text-[9px] font-black text-amber-600 uppercase tracking-wider">PYME</span>
                  </div>
                </div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  Al registrar un negocio, tu cuenta pasará de ser un <strong className="text-neutral-900 dark:text-white">Usuario Regular</strong> a ser una <strong className="text-amber-600">PYME / Anfitrión</strong>. Este cambio es permanente para esta cuenta.
                </p>
              </div>

              {/* Opciones */}
              <div className="space-y-3">
                {/* Opción 1: Continuar con esta cuenta */}
                <button
                  onClick={() => setShowWarning(false)}
                  className="w-full flex items-center gap-4 p-4 bg-airbnb hover:bg-airbnb-dark text-white rounded-2xl transition-all hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-airbnb/20"
                >
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="font-black text-sm">Continuar con esta cuenta</p>
                    <p className="text-xs text-white/70 font-medium">Mi cuenta se convertirá en PYME</p>
                  </div>
                  <ArrowRight className="w-5 h-5 ml-auto opacity-70" />
                </button>

                {/* Opción 2: Iniciar sesión con otra cuenta */}
                <button
                  onClick={async () => {
                    await logout();
                    router.push('/login?redirect=/pyme-onboarding');
                  }}
                  className="w-full flex items-center gap-4 p-4 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-white rounded-2xl transition-all hover:scale-[1.01] active:scale-[0.99]"
                >
                  <div className="w-10 h-10 bg-white dark:bg-neutral-700 rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                    <LogIn className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-black text-sm">Iniciar sesión con otra cuenta</p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">Cerraré sesión y entraré con otra cuenta</p>
                  </div>
                  <ArrowRight className="w-5 h-5 ml-auto opacity-40" />
                </button>

                {/* Opción 3: Crear cuenta nueva */}
                <Link
                  href="/register?role=pyme&redirect=/pyme-onboarding"
                  className="w-full flex items-center gap-4 p-4 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-white rounded-2xl transition-all hover:scale-[1.01] active:scale-[0.99]"
                >
                  <div className="w-10 h-10 bg-white dark:bg-neutral-700 rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                    <UserPlus className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-black text-sm">Crear una cuenta nueva</p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">Quiero ser pyme desde cero</p>
                  </div>
                  <ArrowRight className="w-5 h-5 ml-auto opacity-40" />
                </Link>
              </div>

              {/* Cancelar */}
              <button
                onClick={() => router.push('/')}
                className="w-full py-3 text-xs font-black text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors uppercase tracking-widest"
              >
                Cancelar y volver
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Background Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20 dark:opacity-10">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-airbnb rounded-full blur-[120px]" />
        <div className="absolute top-[20%] -right-[5%] w-[30%] h-[30%] bg-blue-600 rounded-full blur-[100px]" />
      </div>

      <div className="relative max-w-6xl mx-auto px-6 py-12 md:py-20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* Left Side: Information & Progress */}
        <div className="lg:col-span-5 space-y-12">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 bg-airbnb/10 text-airbnb px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">
              <Zap className="w-3.5 h-3.5" />
              Programa de Anfitriones
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-neutral-900 dark:text-white leading-[1.1] tracking-tighter">
              Lleva tu negocio al <span className="text-airbnb">siguiente nivel</span>
            </h1>
            <p className="text-lg text-neutral-500 dark:text-neutral-400 font-medium leading-relaxed">
              Únete a la red de turismo más grande de Pasto. Conecta con miles de viajeros que buscan experiencias auténticas.
            </p>
          </div>

          {/* Stepper */}
          <div className="space-y-8">
             <StepItem 
               num={1} 
               active={step === 1} 
               done={step > 1} 
               title="Identidad de Marca" 
               desc="Define cómo te verán los turistas"
             />
             <StepItem 
               num={2} 
               active={step === 2} 
               done={step > 2} 
               title="Ubicación Estratégica" 
               desc="Dinos dónde encontrarte"
             />
             <StepItem 
               num={3} 
               active={step === 3} 
               done={step > 3} 
               title="Verificación Final" 
               desc="Revisa y publica tu perfil"
             />
          </div>

          {/* Testimonial/Trust Box */}
          <div className="bg-white dark:bg-bg-secondary p-8 rounded-3xl shadow-xl shadow-neutral-200/50 dark:shadow-none border border-neutral-100 dark:border-border-color">
            <div className="flex gap-1 mb-4">
               {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />)}
            </div>
            <p className="text-sm font-bold text-neutral-800 dark:text-white mb-4 italic leading-relaxed">
              "Desde que registré mi restaurante en PastoExplora, las reservas de turistas nacionales han aumentado un 40%. La plataforma es intuitiva y el soporte es excelente."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-neutral-200 dark:bg-neutral-600 rounded-full overflow-hidden">
                <img src="https://i.pravatar.cc/150?u=rest" alt="User" />
              </div>
              <div>
                <p className="text-xs font-black text-neutral-900 dark:text-white uppercase tracking-tight">Elena Rodríguez</p>
                <p className="text-[10px] text-neutral-500 dark:text-neutral-400 font-bold uppercase">Dueña de "Sabores del Galeras"</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: The Form Card / Selection */}
        <div className="lg:col-span-7 bg-white dark:bg-bg-secondary rounded-[40px] shadow-2xl border border-neutral-100 dark:border-border-color overflow-hidden">
          
          {step === 4 ? (
            /* SUCCESS STATE */
            <div className="p-12 text-center space-y-8 animate-in zoom-in-95 duration-500">
               <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-green-600/10">
                 <CheckCircle2 className="w-12 h-12" />
               </div>
               <div className="space-y-3">
                 <h2 className="text-3xl font-black text-neutral-900 dark:text-white tracking-tight">¡Bienvenido a la comunidad!</h2>
                 <p className="text-neutral-500 dark:text-neutral-400 font-medium">
                   Tu negocio ha sido registrado exitosamente. Ahora eres oficialmente un Anfitrión de PastoExplora.
                 </p>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-6 bg-neutral-50 dark:bg-neutral-800 rounded-3xl text-left space-y-2">
                    <ShieldCheck className="w-6 h-6 text-blue-500" />
                    <p className="text-sm font-black dark:text-white uppercase">Perfil Verificado</p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">Tu cuenta ahora tiene permisos especiales.</p>
                  </div>
                  <div className="p-6 bg-neutral-50 dark:bg-neutral-800 rounded-3xl text-left space-y-2">
                    <Globe className="w-6 h-6 text-airbnb" />
                    <p className="text-sm font-black dark:text-white uppercase">Visibilidad Global</p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">Ya apareces en el mapa interactivo.</p>
                  </div>
               </div>
               <button 
                 onClick={() => router.push('/')}
                 className="w-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 py-5 rounded-3xl font-black text-lg transition-all hover:scale-[1.02] active:scale-95 shadow-xl"
               >
                 Ir a mi Panel de Gestión
               </button>
            </div>
          ) : (
            <>
              {/* Form Header */}
              <div className="bg-neutral-900 dark:bg-neutral-800 p-8 text-white relative overflow-hidden">
                <div className="relative z-10 flex items-center justify-between">
                  <div className="space-y-1">
                    <h2 className="text-2xl font-black tracking-tight">Paso {step} de 3</h2>
                    <p className="text-sm text-neutral-400 font-medium">
                      Registro Oficial de Negocio
                    </p>
                  </div>
                  <button 
                    onClick={() => router.push('/')}
                    className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                </div>
                <Store className="absolute -right-8 -bottom-8 w-40 h-40 text-white/5 rotate-12" />
              </div>

              {/* Form Content */}
              <div className="p-8 md:p-12 min-h-[500px] flex flex-col">
                <div className="flex-1">
                  {step === 1 && (
                    <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
                      <div className="space-y-2">
                        <label className="text-xs font-black text-neutral-500 dark:text-neutral-400 uppercase tracking-widest ml-1">Nombre Comercial</label>
                        <input 
                          type="text" 
                          value={form.nombre}
                          onChange={e => setForm({...form, nombre: e.target.value})}
                          placeholder="Ej. Hotel Gran Galeras"
                          className="w-full px-6 py-4 bg-neutral-50 dark:bg-neutral-800 border-2 border-transparent focus:border-airbnb/30 focus:bg-white dark:focus:bg-neutral-900 rounded-2xl outline-none transition-all text-neutral-900 dark:text-white font-bold text-lg placeholder:text-neutral-400 shadow-inner"
                        />
                      </div>
                      
                      <CustomSelect
                        label="Categoría del Negocio"
                        options={TIPOS_PYME}
                        value={form.tipo}
                        onChange={val => setForm({...form, tipo: val})}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs font-black text-neutral-500 uppercase tracking-widest ml-1">📞 Teléfono</label>
                          <input
                            type="tel"
                            value={form.telefono}
                            onChange={e => setForm({...form, telefono: e.target.value})}
                            placeholder="3001234567"
                            maxLength={15}
                            className="w-full px-6 py-4 bg-neutral-50 dark:bg-neutral-800 border-2 border-transparent focus:border-blue-400/40 focus:bg-white dark:focus:bg-neutral-900 rounded-2xl outline-none transition-all text-neutral-900 dark:text-white font-bold placeholder:text-neutral-400"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-black text-neutral-500 uppercase tracking-widest ml-1">💬 WhatsApp</label>
                          <input
                            type="tel"
                            value={form.whatsapp}
                            onChange={e => setForm({...form, whatsapp: e.target.value})}
                            placeholder="3001234567"
                            maxLength={15}
                            className="w-full px-6 py-4 bg-neutral-50 dark:bg-neutral-800 border-2 border-transparent focus:border-emerald-400/40 focus:bg-white dark:focus:bg-neutral-900 rounded-2xl outline-none transition-all text-neutral-900 dark:text-white font-bold placeholder:text-neutral-400"
                          />
                        </div>
                      </div>

                      <div className="p-6 bg-blue-50 dark:bg-blue-900/10 rounded-3xl border border-blue-100 dark:border-blue-900/30 flex gap-4">
                        <CheckCircle2 className="w-6 h-6 text-blue-500 shrink-0" />
                        <p className="text-sm text-blue-700 dark:text-blue-300 font-medium leading-relaxed">
                          Este nombre es el que aparecerá en los resultados de búsqueda y en el mapa. Asegúrate de que sea fácil de recordar.
                        </p>
                      </div>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
                      {/* Método de ubicación */}
                      <div className="hidden flex bg-neutral-100 dark:bg-neutral-800 p-1.5 rounded-[22px] border border-neutral-200 dark:border-neutral-700">
                          <button
                              onClick={() => setLocationMode('address')}
                              className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-[18px] text-sm font-black transition-all ${
                                  locationMode === 'address' 
                                  ? 'bg-white dark:bg-neutral-700 text-airbnb shadow-xl scale-[1.02]' 
                                  : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300'
                              }`}
                          >
                              <LayoutList className="w-5 h-5" />
                              Por Dirección
                          </button>
                          <button
                              onClick={() => setLocationMode('coordinates')}
                              className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-[18px] text-sm font-black transition-all ${
                                  locationMode === 'coordinates' 
                                  ? 'bg-white dark:bg-neutral-700 text-airbnb shadow-xl scale-[1.02]' 
                                  : 'text-neutral-500 hover:text-neutral-700'
                              }`}
                          >
                              <MapIcon className="w-5 h-5" />
                              Coordenadas
                          </button>
                      </div>

                      {locationMode === 'address' ? (
                          <div className="space-y-4">
                            <CustomSelect 
                              label="Prefijo de Vía"
                              options={PREFIJOS_DIRECCION}
                              value={form.prefijo_direccion}
                              onChange={val => setForm({...form, prefijo_direccion: val})}
                            />
                            <div className="space-y-2">
                              <label className="text-xs font-black text-neutral-500 dark:text-neutral-400 uppercase tracking-widest ml-1">Dirección Exacta</label>
                              <input 
                                type="text" 
                                value={form.direccion_detalle}
                                onChange={e => setForm({...form, direccion_detalle: e.target.value})}
                                placeholder="Ej. Calle 18 #25-30, Centro"
                                className="w-full px-6 py-4 bg-neutral-50 dark:bg-neutral-800 border-2 border-transparent focus:border-airbnb/30 focus:bg-white dark:focus:bg-neutral-900 rounded-2xl outline-none transition-all text-neutral-900 dark:text-white font-bold"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-xs font-black text-neutral-500 dark:text-neutral-400 uppercase tracking-widest ml-1">Ciudad / Municipio</label>
                              <input 
                                type="text" 
                                value={form.ciudad}
                                onChange={e => setForm({...form, ciudad: e.target.value})}
                                placeholder="Pasto"
                                className="w-full px-6 py-4 bg-neutral-50 dark:bg-neutral-800 border-2 border-transparent focus:border-airbnb/30 focus:bg-white dark:focus:bg-neutral-900 rounded-2xl outline-none transition-all text-neutral-900 dark:text-white font-bold"
                              />
                            </div>
                          </div>
                      ) : (
                        <div className="space-y-6">
                           <div className="p-8 bg-blue-600 rounded-[32px] text-white space-y-6 shadow-xl shadow-blue-600/20">
                              <div className="flex justify-between items-center">
                                <div className="space-y-1">
                                  <h3 className="text-lg font-black tracking-tight uppercase">Precisión Satelital</h3>
                                  <p className="text-xs text-blue-100">Usa el GPS para un posicionamiento perfecto</p>
                                </div>
                                <Navigation className="w-8 h-8 opacity-50" />
                              </div>
                              <button 
                                onClick={handleGeolocate}
                                disabled={geoLoading}
                                className="w-full bg-white text-blue-600 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all hover:bg-blue-50 flex items-center justify-center gap-3 disabled:opacity-50 shadow-lg"
                              >
                                {geoLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <MapPin className="w-5 h-5" />}
                                {geoLoading ? "Obteniendo coordenadas..." : "Fijar mi ubicación actual"}
                              </button>
                           </div>
                           <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2 text-center">
                                <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Latitud</span>
                                <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-2xl border-2 border-neutral-100 dark:border-neutral-700 font-mono text-sm font-bold dark:text-white">
                                  {form.latitud || "---.---"}
                                </div>
                              </div>
                              <div className="space-y-2 text-center">
                                <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Longitud</span>
                                <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-2xl border-2 border-neutral-100 dark:border-neutral-700 font-mono text-sm font-bold dark:text-white">
                                  {form.longitud || "---.---"}
                                </div>
                              </div>
                           </div>

                           <MapPicker
                             lat={parseFloat(form.latitud) || 1.2136}
                             lng={parseFloat(form.longitud) || -77.2811}
                             onChange={(lat, lng) => setForm(f => ({ ...f, latitud: String(lat), longitud: String(lng) }))}
                           />
                        </div>
                      )}
                    </div>
                  )}

                  {step === 3 && (
                    <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
                      <div className="p-8 bg-neutral-900 dark:bg-neutral-800 rounded-[32px] text-white space-y-6 border border-white/10">
                        <div className="space-y-6">
                           <div className="flex items-center gap-4">
                             <div className="w-12 h-12 bg-airbnb rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-airbnb/20">
                               {TIPOS_PYME.find(t => t.value === form.tipo)?.label.split(' ')[0]}
                             </div>
                             <div>
                               <h3 className="text-2xl font-black tracking-tight">{form.nombre}</h3>
                               <p className="text-sm text-neutral-400 font-medium capitalize">
                                 {TIPOS_PYME.find(t => t.value === form.tipo)?.label.split(' ').slice(1).join(' ')}
                               </p>
                             </div>
                           </div>
                           <div className="h-[1px] bg-white/10" />
                           <div className="space-y-4">
                              <div className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-neutral-500 mt-0.5" />
                                <div className="space-y-1">
                                  <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Ubicación Registrada</p>
                                  <p className="text-sm font-bold">
                                    {locationMode === 'address' 
                                      ? `${form.prefijo_direccion} ${form.direccion_detalle}, ${form.ciudad}`
                                      : `Coords: ${form.latitud}, ${form.longitud}`}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-start gap-3">
                                <ShieldCheck className="w-5 h-5 text-green-500 mt-0.5" />
                                <div className="space-y-1">
                                  <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Estado del Registro</p>
                                  <p className="text-sm font-bold text-green-400">Listo para publicación inmediata</p>
                                </div>
                              </div>
                           </div>
                        </div>
                      </div>

                      <div className="p-6 rounded-3xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700 flex gap-4">
                        <div className="w-10 h-10 bg-white dark:bg-neutral-900 rounded-xl flex items-center justify-center shadow-sm text-airbnb font-black">!</div>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed font-medium">
                          Al hacer clic en "Finalizar Registro", declaras que eres el propietario o representante legal de este establecimiento y aceptas nuestros términos de servicio para anfitriones.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Actions */}
                <div className="pt-10 flex gap-4">
                  {step > 1 ? (
                    <button 
                      onClick={() => setStep(step - 1)}
                      className="p-5 border-2 border-neutral-100 dark:border-neutral-800 rounded-3xl hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all active:scale-95 text-neutral-500"
                    >
                      <ArrowLeft className="w-6 h-6" />
                    </button>
                  ) : (
                    <button 
                      onClick={() => router.push('/')}
                      className="p-5 border-2 border-neutral-100 dark:border-neutral-800 rounded-3xl hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all active:scale-95 text-neutral-500"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  )}
                  <button 
                    disabled={loading || (step === 1 && !form.nombre)}
                    onClick={() => {
                      if (step < 3) setStep(step + 1);
                      else handleSubmit();
                    }}
                    className="flex-1 bg-airbnb hover:bg-airbnb-dark text-white py-5 rounded-3xl font-black text-lg transition-all hover:scale-[1.02] active:scale-95 shadow-xl shadow-airbnb/20 flex items-center justify-center gap-3 disabled:opacity-50 disabled:hover:scale-100"
                  >
                    {loading ? (
                      <><Loader2 className="w-6 h-6 animate-spin" /> Procesando...</>
                    ) : (
                      <>
                        {step === 3 ? "Finalizar Registro" : "Siguiente Paso"}
                        <ArrowRight className="w-6 h-6" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slide-up 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

function StepItem({ num, active, done, title, desc }: { num: number, active: boolean, done: boolean, title: string, desc: string }) {
  return (
    <div className={`flex items-start gap-4 transition-all duration-500 ${active ? 'scale-105 origin-left' : 'opacity-60 grayscale'}`}>
       <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm transition-all shadow-lg ${
         done ? 'bg-green-500 text-white shadow-green-500/20' : 
         active ? 'bg-airbnb text-white shadow-airbnb/20' : 
         'bg-neutral-200 dark:bg-neutral-800 text-neutral-500'
       }`}>
         {done ? <CheckCircle2 className="w-5 h-5" /> : num}
       </div>
       <div className="space-y-0.5">
          <h4 className={`text-base font-black tracking-tight ${active ? 'text-neutral-900 dark:text-white' : 'text-neutral-400'}`}>
            {title}
          </h4>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 font-bold uppercase tracking-tight">{desc}</p>
       </div>
    </div>
  );
}
