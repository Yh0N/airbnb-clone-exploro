'use client';

import React, { useState } from 'react';
import { X, Building2, Loader2, MapPin, Navigation, Compass, LayoutList, Map as MapIcon, User, Store, ArrowLeft, ArrowRight, Edit } from 'lucide-react';
import * as api from '@/services/api';
import CustomSelect from './CustomSelect';
import { CATEGORIAS_PYME } from '@/lib/taxonomy';
import dynamic from 'next/dynamic';

const LocationPickerMap = dynamic(() => import('./LocationPickerMap'), { ssr: false });

interface CreatePymeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
  initialData?: any; // Para edición
}

type RegistrationType = null | 'pyme' | 'persona';
type LocationMode = 'address' | 'coordinates' | 'map';


const PREFIJOS_DIRECCION = [
  { value: 'Calle', label: '🛣️ Calle' },
  { value: 'Carrera', label: '🛣️ Carrera' },
  { value: 'Avenida', label: '🛣️ Avenida' },
  { value: 'Diagonal', label: '🛣️ Diagonal' },
  { value: 'Transversal', label: '🛣️ Transversal' },
];

export default function CreatePymeModal({ isOpen, onClose, onCreated, initialData }: CreatePymeModalProps) {
  const [registrationType, setRegistrationType] = useState<RegistrationType>(null);
  const [loading, setLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [locationMode, setLocationMode] = useState<LocationMode>('address');
  const [form, setForm] = useState({
    nombre: '',
    categoria: '',
    subcategoria: '',
    prefijo_direccion: 'Calle',
    direccion_detalle: '',
    ciudad: 'Pasto',
    latitud: '',
    longitud: '',
  });

  // Inicialización para edición
  React.useEffect(() => {
    if (initialData) {
      setRegistrationType('pyme'); // Forzar modo formulario
      
      // Parsear dirección si es posible
      let prefijo = 'Calle';
      let detalle = initialData.ubicacion || initialData.ubicacion_textual || '';
      
      const prefijos = PREFIJOS_DIRECCION.map(p => p.value);
      for (const p of prefijos) {
        if (detalle.startsWith(p)) {
          prefijo = p;
          detalle = detalle.replace(p, '').trim();
          // Quitar ciudad si está al final
          detalle = detalle.replace(', Pasto', '').trim();
          break;
        }
      }

      setForm({
        nombre: initialData.nombre || '',
        categoria: initialData.tipo || initialData.categoria || '',
        subcategoria: initialData.subcategoria || '',
        prefijo_direccion: prefijo,
        direccion_detalle: detalle,
        ciudad: 'Pasto',
        latitud: initialData.latitud?.toString() || '',
        longitud: initialData.longitud?.toString() || '',
      });

      if (initialData.latitud && initialData.longitud) {
        setLocationMode('coordinates');
      } else {
        setLocationMode('address');
      }
    } else {
      setRegistrationType(null);
      setForm({ nombre: '', categoria: '', subcategoria: '', prefijo_direccion: 'Calle', direccion_detalle: '', ciudad: 'Pasto', latitud: '', longitud: '' });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleClose = () => {
    if (!initialData) {
      setRegistrationType(null);
      setForm({ nombre: '', categoria: '', subcategoria: '', prefijo_direccion: 'Calle', direccion_detalle: '', ciudad: 'Pasto', latitud: '', longitud: '' });
      setLocationMode('address');
    }
    onClose();
  };

  const handleBack = () => {
    if (initialData) {
        handleClose();
    } else {
        setRegistrationType(null);
    }
  };

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
      (err) => {
        console.error('Geolocation error:', err);
        alert('No se pudo obtener tu ubicación. Ingresa las coordenadas manualmente.');
        setGeoLoading(false);
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fullDireccion = locationMode === 'address' 
        ? `${form.prefijo_direccion} ${form.direccion_detalle}, ${form.ciudad}`
        : 'Ubicación por coordenadas';

      const payload = {
        nombre: form.nombre,
        tipo: form.categoria,
        subcategoria: form.subcategoria,
        ubicacion_textual: fullDireccion,
        latitud: form.latitud ? parseFloat(form.latitud) : undefined,
        longitud: form.longitud ? parseFloat(form.longitud) : undefined,
      };

      if (initialData?.id_pyme) {
        await api.updatePyme(initialData.id_pyme, payload);
      } else {
        await api.createPyme(payload);
      }
      
      onCreated();
      handleClose();
    } catch (error: any) {
      console.error('Error saving pyme:', error);
      const detail = error?.response?.data?.detail;
      if (typeof detail === 'string') {
        alert(detail);
      } else if (Array.isArray(detail)) {
        const messages = detail.map((err: any) => `${err.loc.join('.')}: ${err.msg}`).join('\n');
        alert(`Error de validación:\n${messages}`);
      } else {
        alert('Error al guardar. Intenta de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  // ─── PASO 1: Selección de tipo de registro ───
  const renderTypeSelection = () => (
    <div className="p-8 space-y-6 overflow-y-auto custom-scrollbar flex-1">
      <div className="text-center space-y-2">
        <h3 className="text-xl font-black text-neutral-800 dark:text-white tracking-tight">¿Cómo deseas registrarte?</h3>
        <p className="text-sm text-neutral-500 max-w-sm mx-auto">Elige el tipo de registro que mejor se ajuste a tu actividad</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {/* Opción PYME / Negocio */}
        <button
          type="button"
          onClick={() => {
            setRegistrationType('pyme');
            setForm(prev => ({ ...prev, tipo: 'hotel' }));
          }}
          className="group relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-200 dark:border-blue-800 hover:border-blue-400 dark:hover:border-blue-600 rounded-2xl p-6 text-left transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 hover:scale-[1.02] active:scale-[0.98]"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -translate-y-12 translate-x-12 group-hover:scale-150 transition-transform duration-500" />
          <div className="relative flex items-start gap-4">
            <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/30 shrink-0">
              <Building2 className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="text-lg font-black text-neutral-800 dark:text-white">Negocio / PYME</h4>
                <span className="text-[9px] font-black bg-blue-600 text-white px-2 py-0.5 rounded-full uppercase tracking-wider">Empresa</span>
              </div>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
                Registra tu empresa, restaurante, hotel, agencia de viajes u otro establecimiento comercial.
              </p>
              <div className="flex items-center gap-2 mt-3">
                <span className="text-[10px] font-bold bg-white dark:bg-neutral-800 text-neutral-500 px-2 py-1 rounded-lg border border-neutral-100 dark:border-neutral-700">🏨 Hoteles</span>
                <span className="text-[10px] font-bold bg-white dark:bg-neutral-800 text-neutral-500 px-2 py-1 rounded-lg border border-neutral-100 dark:border-neutral-700">🍕 Restaurantes</span>
                <span className="text-[10px] font-bold bg-white dark:bg-neutral-800 text-neutral-500 px-2 py-1 rounded-lg border border-neutral-100 dark:border-neutral-700">🧭 Tours</span>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-blue-400 group-hover:translate-x-1 transition-transform shrink-0 mt-1" />
          </div>
        </button>

        {/* Opción Persona Natural */}
        <button
          type="button"
          onClick={() => {
            setRegistrationType('persona');
            setForm(prev => ({ ...prev, tipo: 'restaurante' }));
          }}
          className="group relative overflow-hidden bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-2 border-amber-200 dark:border-amber-800 hover:border-amber-400 dark:hover:border-amber-600 rounded-2xl p-6 text-left transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/10 hover:scale-[1.02] active:scale-[0.98]"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full -translate-y-12 translate-x-12 group-hover:scale-150 transition-transform duration-500" />
          <div className="relative flex items-start gap-4">
            <div className="w-14 h-14 bg-amber-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/30 shrink-0">
              <User className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="text-lg font-black text-neutral-800 dark:text-white">Persona Natural</h4>
                <span className="text-[9px] font-black bg-amber-500 text-white px-2 py-0.5 rounded-full uppercase tracking-wider">Individual</span>
              </div>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
                ¿Conoces un negocio local que te encantó? Agrégalo para que otros turistas puedan descubrirlo también.
              </p>
              <div className="flex items-center gap-2 mt-3">
                <span className="text-[10px] font-bold bg-white dark:bg-neutral-800 text-neutral-500 px-2 py-1 rounded-lg border border-neutral-100 dark:border-neutral-700">⭐ Recomendar</span>
                <span className="text-[10px] font-bold bg-white dark:bg-neutral-800 text-neutral-500 px-2 py-1 rounded-lg border border-neutral-100 dark:border-neutral-700">📍 Compartir</span>
                <span className="text-[10px] font-bold bg-white dark:bg-neutral-800 text-neutral-500 px-2 py-1 rounded-lg border border-neutral-100 dark:border-neutral-700">💡 Descubrir</span>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-amber-400 group-hover:translate-x-1 transition-transform shrink-0 mt-1" />
          </div>
        </button>
      </div>

      <button
        type="button"
        onClick={handleClose}
        className="w-full py-4 text-sm font-black text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors uppercase tracking-widest"
      >
        Cancelar
      </button>
    </div>
  );

  // ─── PASO 2: Formulario de registro ───
  const renderForm = () => {
    const isPymeType = registrationType === 'pyme';
    const accentColor = isPymeType ? 'blue' : 'amber';
    const headerTitle = initialData ? 'Editar Información' : (isPymeType ? 'Registrar Negocio' : 'Agregar Negocio Descubierto');
    const headerSubtitle = initialData 
      ? 'Actualiza los datos de tu establecimiento' 
      : (isPymeType ? 'Completa los datos de tu establecimiento' : 'Agrega un negocio que te haya gustado');
    const headerIcon = isPymeType 
      ? <Building2 className="w-5 h-5 text-white" /> 
      : <User className="w-5 h-5 text-white" />;
    const submitLabel = initialData ? 'Guardar Cambios' : (isPymeType ? 'Registrar Negocio' : 'Agregar Negocio');
    const submitIcon = initialData 
      ? <Edit className="w-4 h-4" />
      : (isPymeType ? <Building2 className="w-4 h-4" /> : <MapPin className="w-4 h-4" />);
    const namePlaceholder = isPymeType 
      ? 'Ej. Restaurante Sabores de Pasto' 
      : 'Ej. La Tienda de Don Carlos';
    const nameLabel = isPymeType ? 'Nombre Comercial *' : 'Nombre del Negocio *';

    // Taxonomía en cascada
    const categoriaOpts = CATEGORIAS_PYME.map((c) => ({ value: c.value, label: `${c.emoji} ${c.label}` }));
    const catConfig = CATEGORIAS_PYME.find((c) => c.value === form.categoria);
    const subcategoriaOpts = catConfig?.subcategorias ?? [];

    const handleCategoriaChange = (val: string) => {
      setForm((prev) => ({ ...prev, categoria: val, subcategoria: '' }));
    };

    return (
      <form onSubmit={handleSubmit} className="flex flex-col h-full overflow-hidden">
        
        {/* Map Picker Overlay */}
        {showMapPicker && (
          <div className="absolute inset-0 z-[110] bg-white dark:bg-bg-secondary animate-in slide-in-from-bottom duration-500 flex flex-col">
            <div className="p-6 border-b border-neutral-100 dark:border-border-color flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg"
                     style={{ backgroundColor: isPymeType ? '#2563EB' : '#F59E0B' }}>
                  <MapIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-neutral-900 dark:text-white">Ubicación en Mapa</h3>
                  <p className="text-xs text-neutral-500">Marca el punto exacto de tu negocio</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setShowMapPicker(false)}
                className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-neutral-500" />
              </button>
            </div>
            
            <div className="flex-1 relative">
              <LocationPickerMap 
                height="100%"
                position={form.latitud && form.longitud ? { lat: Number(form.latitud), lng: Number(form.longitud) } : null}
                onPositionChange={(pos) => setForm({ ...form, latitud: String(pos.lat), longitud: String(pos.lng) })}
              />
            </div>

            <div className="p-6 border-t border-neutral-100 dark:border-border-color bg-neutral-50/50 dark:bg-neutral-800/50 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block">Coordenadas</span>
                <div className="text-xs font-mono font-bold text-neutral-700 dark:text-neutral-300">
                  {form.latitud && form.longitud ? `${form.latitud}, ${form.longitud}` : 'Sin marcar'}
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setLocationMode('coordinates');
                  setShowMapPicker(false);
                }}
                className="text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg"
                style={{ backgroundColor: isPymeType ? '#2563EB' : '#F59E0B' }}
              >
                <Check className="w-4 h-4" />
                Confirmar Ubicación
              </button>
            </div>
          </div>
        )}

        {/* Header (Fijo) */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-100 dark:border-border-color bg-white dark:bg-bg-secondary rounded-t-3xl z-20">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleBack}
              className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-colors"
              title="Volver"
            >
              <ArrowLeft className="w-4 h-4 text-neutral-500" />
            </button>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg`}
                 style={{ backgroundColor: isPymeType ? '#2563EB' : '#F59E0B' }}>
              {headerIcon}
            </div>
            <div>
              <h2 className="text-lg font-bold text-neutral-800 dark:text-white">{headerTitle}</h2>
              <p className="text-xs text-neutral-500">{headerSubtitle}</p>
            </div>
          </div>
          <button onClick={handleClose} className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors">
            <X className="w-5 h-5 text-neutral-500" />
          </button>
        </div>

        {/* Form Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar overflow-x-visible">
          {/* Badge de tipo */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-dashed"
               style={{ 
                 borderColor: isPymeType ? '#BFDBFE' : '#FDE68A',
                 backgroundColor: isPymeType ? '#EFF6FF' : '#FFFBEB'
               }}>
            <span className="text-sm">{isPymeType ? '🏢' : '👤'}</span>
            <span className="text-xs font-bold" style={{ color: isPymeType ? '#2563EB' : '#D97706' }}>
              {isPymeType ? 'Registrándote como Negocio / PYME' : 'Agregando un negocio que descubriste'}
            </span>
          </div>

          {/* Nombre */}
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-neutral-700 dark:text-neutral-300">{nameLabel}</label>
            <input
              type="text"
              required
              value={form.nombre}
              onChange={e => setForm({ ...form, nombre: e.target.value })}
              placeholder={namePlaceholder}
              className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-border-color rounded-xl outline-none focus:ring-2 focus:ring-blue-500/50 transition-all dark:text-white placeholder:text-neutral-400"
            />
          </div>

          {/* Categoría principal */}
          <CustomSelect
            label="Categoría principal *"
            options={categoriaOpts}
            value={form.categoria}
            onChange={handleCategoriaChange}
          />

          {/* Subcategoría (aparece al seleccionar categoría) */}
          {form.categoria && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-200">
              <CustomSelect
                label="Subcategoría *"
                options={subcategoriaOpts}
                value={form.subcategoria}
                onChange={(val) => setForm({ ...form, subcategoria: val })}
              />
            </div>
          )}

          {/* Toggle de Ubicación */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-neutral-700 dark:text-neutral-300">Método de ubicación</label>
            <div className="grid grid-cols-2 gap-2 p-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700">
                <button
                    type="button"
                    onClick={() => setLocationMode('address')}
                    className={`flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all ${
                        locationMode === 'address' 
                        ? 'bg-white dark:bg-neutral-700 text-blue-600 shadow-md scale-[1.02]' 
                        : 'text-neutral-500 hover:text-neutral-700'
                    }`}
                >
                    <LayoutList className="w-4 h-4" />
                    Por Dirección
                </button>
                <button
                    type="button"
                    onClick={() => setLocationMode('coordinates')}
                    className={`flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all ${
                        locationMode === 'coordinates' 
                        ? 'bg-white dark:bg-neutral-700 text-blue-600 shadow-md scale-[1.02]' 
                        : 'text-neutral-500 hover:text-neutral-700'
                    }`}
                >
                    <MapIcon className="w-4 h-4" />
                    Por Coordenadas
                </button>
            </div>
          </div>

          {locationMode === 'address' ? (
              /* Dirección Estructurada */
              <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-left-2 duration-300">
                <div className="space-y-1.5 col-span-2">
                  <label className="text-sm font-bold text-neutral-700 dark:text-neutral-300">Escribir Dirección</label>
                  <div className="flex gap-2">
                      <div className="w-1/3">
                          <CustomSelect
                              options={PREFIJOS_DIRECCION}
                              value={form.prefijo_direccion}
                              onChange={val => setForm({ ...form, prefijo_direccion: val })}
                          />
                      </div>
                      <div className="flex-1">
                          <input
                              type="text"
                              required={locationMode === 'address'}
                              value={form.direccion_detalle}
                              onChange={e => setForm({ ...form, direccion_detalle: e.target.value })}
                              placeholder="Ej. 18 #25-30, Centro"
                              className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-border-color rounded-xl outline-none focus:ring-2 focus:ring-blue-500/50 transition-all dark:text-white placeholder:text-neutral-400 h-[48px]"
                          />
                      </div>
                  </div>
                </div>
                <div className="space-y-1.5 col-span-2">
                  <label className="text-sm font-bold text-neutral-700 dark:text-neutral-300">Ciudad / Municipio</label>
                  <input
                    type="text"
                    required={locationMode === 'address'}
                    value={form.ciudad}
                    onChange={e => setForm({ ...form, ciudad: e.target.value })}
                    placeholder="Pasto"
                    className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-border-color rounded-xl outline-none focus:ring-2 focus:ring-blue-500/50 transition-all dark:text-white placeholder:text-neutral-400"
                  />
                </div>
              </div>
          ) : (
              /* Coordenadas Geográficas */
              <div className="space-y-1.5 bg-blue-50/50 dark:bg-blue-900/10 p-4 rounded-2xl border border-blue-100 dark:border-blue-900/30 animate-in slide-in-from-right-2 duration-300">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <label className="text-xs font-black text-blue-600 uppercase tracking-widest flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5" />
                    Ubicación Precisa
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowMapPicker(true)}
                      className="flex items-center gap-1.5 text-[10px] font-black text-blue-600 hover:text-blue-700 transition-colors uppercase bg-white dark:bg-neutral-800 px-2 py-1 rounded-lg shadow-sm border border-blue-100 dark:border-blue-900/50"
                    >
                      <MapIcon className="w-3 h-3" />
                      Elegir en Mapa
                    </button>
                    <button
                      type="button"
                      onClick={handleGeolocate}
                      disabled={geoLoading}
                      className="flex items-center gap-1.5 text-[10px] font-black text-airbnb hover:text-rose-600 transition-colors disabled:opacity-50 uppercase bg-white dark:bg-neutral-800 px-2 py-1 rounded-lg shadow-sm border border-rose-100 dark:border-rose-900/50"
                    >
                      {geoLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Navigation className="w-3 h-3" />}
                      Mi ubicación
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-neutral-400 ml-1 uppercase">Latitud</span>
                    <input
                        type="number"
                        step="any"
                        required={locationMode === 'coordinates'}
                        value={form.latitud}
                        onChange={e => setForm({ ...form, latitud: e.target.value })}
                        placeholder="1.2136"
                        className="w-full px-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/50 transition-all dark:text-white text-xs font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-neutral-400 ml-1 uppercase">Longitud</span>
                    <input
                        type="number"
                        step="any"
                        required={locationMode === 'coordinates'}
                        value={form.longitud}
                        onChange={e => setForm({ ...form, longitud: e.target.value })}
                        placeholder="-77.2811"
                        className="w-full px-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/50 transition-all dark:text-white text-xs font-mono"
                    />
                  </div>
                </div>
              </div>
          )}
              /* Dirección Estructurada */
              <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-left-2 duration-300">
                <div className="space-y-1.5 col-span-2">
                  <label className="text-sm font-bold text-neutral-700 dark:text-neutral-300">Escribir Dirección</label>
                  <div className="flex gap-2">
                      <div className="w-1/3">
                          <CustomSelect
                              options={PREFIJOS_DIRECCION}
                              value={form.prefijo_direccion}
                              onChange={val => setForm({ ...form, prefijo_direccion: val })}
                          />
                      </div>
                      <div className="flex-1">
                          <input
                              type="text"
                              required={locationMode === 'address'}
                              value={form.direccion_detalle}
                              onChange={e => setForm({ ...form, direccion_detalle: e.target.value })}
                              placeholder="Ej. 18 #25-30, Centro"
                              className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-border-color rounded-xl outline-none focus:ring-2 focus:ring-blue-500/50 transition-all dark:text-white placeholder:text-neutral-400 h-[48px]"
                          />
                      </div>
                  </div>
                </div>
                <div className="space-y-1.5 col-span-2">
                  <label className="text-sm font-bold text-neutral-700 dark:text-neutral-300">Ciudad / Municipio</label>
                  <input
                    type="text"
                    required={locationMode === 'address'}
                    value={form.ciudad}
                    onChange={e => setForm({ ...form, ciudad: e.target.value })}
                    placeholder="Pasto"
                    className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-border-color rounded-xl outline-none focus:ring-2 focus:ring-blue-500/50 transition-all dark:text-white placeholder:text-neutral-400"
                  />
                </div>
              </div>
          ) : (
              /* Coordenadas Geográficas */
              <div className="space-y-1.5 bg-blue-50/50 dark:bg-blue-900/10 p-4 rounded-2xl border border-blue-100 dark:border-blue-900/30 animate-in slide-in-from-right-2 duration-300">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-black text-blue-600 uppercase tracking-widest flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5" />
                    Entrada por Mapa
                  </label>
                  <button
                    type="button"
                    onClick={handleGeolocate}
                    disabled={geoLoading}
                    className="flex items-center gap-1.5 text-[10px] font-black text-blue-600 hover:text-blue-700 transition-colors disabled:opacity-50 uppercase bg-white dark:bg-neutral-800 px-2 py-1 rounded-lg shadow-sm border border-blue-100 dark:border-blue-900/50"
                  >
                    {geoLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Navigation className="w-3 h-3" />}
                    Mi ubicación actual
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-neutral-400 ml-1 uppercase">Latitud</span>
                    <input
                        type="number"
                        step="any"
                        required={locationMode === 'coordinates'}
                        value={form.latitud}
                        onChange={e => setForm({ ...form, latitud: e.target.value })}
                        placeholder="1.2136"
                        className="w-full px-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/50 transition-all dark:text-white text-xs font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-neutral-400 ml-1 uppercase">Longitud</span>
                    <input
                        type="number"
                        step="any"
                        required={locationMode === 'coordinates'}
                        value={form.longitud}
                        onChange={e => setForm({ ...form, longitud: e.target.value })}
                        placeholder="-77.2811"
                        className="w-full px-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/50 transition-all dark:text-white text-xs font-mono"
                    />
                  </div>
                </div>
              </div>
          )}
          
          {/* Espacio extra al final para que los dropdowns no se corten */}
          <div className="h-32" />
        </div>

        {/* Footer (Fijo) */}
        <div className="p-6 border-t border-neutral-100 dark:border-border-color bg-neutral-50/50 dark:bg-neutral-800/50 rounded-b-3xl">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleBack}
              className="flex-1 px-6 py-3 border border-neutral-200 dark:border-border-color text-neutral-600 dark:text-neutral-400 font-bold rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-[2] text-white px-8 py-3 rounded-xl font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg active:scale-[0.98]"
              style={{ backgroundColor: isPymeType ? '#2563EB' : '#F59E0B' }}
            >
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Registrando...</> : <>{submitIcon} {submitLabel}</>}
            </button>
          </div>
        </div>
      </form>
    );
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-6 bg-black/60 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={handleClose} />
      <div className="relative w-full max-w-lg h-auto max-h-[90vh] bg-white dark:bg-bg-secondary rounded-3xl shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden flex flex-col">

        {registrationType === null ? (
          <div className="flex flex-col h-full overflow-hidden">
            {/* Header para selección (Fijo) */}
            <div className="flex items-center justify-between p-6 border-b border-neutral-100 dark:border-border-color bg-white dark:bg-bg-secondary rounded-t-3xl flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Store className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-neutral-800 dark:text-white">Nuevo Registro</h2>
                  <p className="text-xs text-neutral-500">Únete al ecosistema turístico de Pasto</p>
                </div>
              </div>
              <button onClick={handleClose} className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors">
                <X className="w-5 h-5 text-neutral-500" />
              </button>
            </div>
            {renderTypeSelection()}
          </div>
        ) : (
          renderForm()
        )}

      </div>
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e5e5e5;
          border-radius: 10px;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #404040;
        }
      `}</style>
    </div>
  );
}
