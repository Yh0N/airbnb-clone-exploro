'use client';

import React, { useState } from 'react';
import { X, MapPin, Navigation, Loader2, Plus, Map, Hash, Edit } from 'lucide-react';
import * as api from '@/services/api';
import CustomSelect from './CustomSelect';
import { CATEGORIAS_LUGAR } from '@/lib/taxonomy';
import dynamic from 'next/dynamic';

const LocationPickerMap = dynamic(() => import('./LocationPickerMap'), { ssr: false });

interface CreatePlaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
  initialData?: any; // Para edición
}

export default function CreatePlaceModal({ isOpen, onClose, onCreated, initialData }: CreatePlaceModalProps) {
  const [loading, setLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [locationMode, setLocationMode] = useState<'direccion' | 'coordenadas'>('direccion');

  const [form, setForm] = useState({
    nombre: initialData?.nombre || initialData?.name || '',
    descripcion: initialData?.descripcion || initialData?.description || '',
    categoria: initialData?.categoria || initialData?.category || '',
    subcategoria: initialData?.subcategoria || '',
    direccion: initialData?.location || initialData?.ubicacion_textual || '',
    latitud: initialData?.latitude?.toString() || initialData?.latitud?.toString() || '',
    longitud: initialData?.longitude?.toString() || initialData?.longitud?.toString() || '',
  });

  // Efecto para cargar datos si cambian (para edición)
  React.useEffect(() => {
    if (initialData) {
      setForm({
        nombre: initialData.nombre || initialData.name || '',
        descripcion: initialData.descripcion || initialData.description || '',
        categoria: initialData.categoria || initialData.category || '',
        subcategoria: initialData.subcategoria || '',
        direccion: initialData.location || initialData.ubicacion_textual || '',
        latitud: initialData.latitude?.toString() || initialData.latitud?.toString() || '',
        longitud: initialData.longitude?.toString() || initialData.longitud?.toString() || '',
      });
      if (initialData.latitude && initialData.longitude) {
        setLocationMode('coordenadas');
      } else if (initialData.location || initialData.ubicacion_textual) {
        setLocationMode('direccion');
      }
    } else {
      setForm({ nombre: '', descripcion: '', categoria: '', subcategoria: '', direccion: '', latitud: '', longitud: '' });
    }
  }, [initialData]);

  if (!isOpen) return null;

  // Categorías para CustomSelect
  const categoriaOpts = CATEGORIAS_LUGAR.map((c) => ({
    value: c.value,
    label: `${c.emoji} ${c.label}`,
  }));

  // Subcategorías según categoría seleccionada
  const catConfig = CATEGORIAS_LUGAR.find((c) => c.value === form.categoria);
  const subcategoriaOpts = catConfig?.subcategorias ?? [];

  const handleCategoriaChange = (val: string) => {
    setForm((prev) => ({ ...prev, categoria: val, subcategoria: '' }));
  };

  const handleGeolocate = () => {
    if (!('geolocation' in navigator)) {
      alert('Tu navegador no soporta geolocalización.');
      return;
    }
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((prev) => ({
          ...prev,
          latitud: pos.coords.latitude.toFixed(6),
          longitud: pos.coords.longitude.toFixed(6),
        }));
        setGeoLoading(false);
        setLocationMode('coordenadas');
      },
      (err) => {
        console.error('Geolocation error:', err);
        alert('No se pudo obtener tu ubicación. Ingresa las coordenadas o dirección manualmente.');
        setGeoLoading(false);
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.categoria) {
      alert('Selecciona una categoría.');
      return;
    }
    if (!form.subcategoria) {
      alert('Selecciona una subcategoría.');
      return;
    }
    if (locationMode === 'coordenadas' && (!form.latitud || !form.longitud)) {
      alert('Las coordenadas son obligatorias en este modo.');
      return;
    }
    if (locationMode === 'direccion' && !form.direccion) {
      alert('La dirección es obligatoria en este modo.');
      return;
    }

    setLoading(true);
    try {
      const payload: any = {
        nombre: form.nombre,
        descripcion: form.descripcion,
        categoria: form.categoria,
        subcategoria: form.subcategoria,
      };

      if (locationMode === 'coordenadas') {
        payload.latitud = parseFloat(form.latitud);
        payload.longitud = parseFloat(form.longitud);
      } else {
        payload.ubicacion_textual = form.direccion;
      }

      if (initialData?.id) {
        await api.updatePlace(initialData.id, payload);
      } else {
        await api.createPlace(payload);
      }
      
      onCreated();
      onClose();
      if (!initialData) {
        setForm({ nombre: '', descripcion: '', categoria: '', subcategoria: '', direccion: '', latitud: '', longitud: '' });
      }
    } catch (error: any) {
      console.error('Error saving place:', error);
      const detail = error?.response?.data?.detail;
      alert(detail || 'Error al guardar el lugar. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-xl bg-white dark:bg-bg-secondary rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">

        {/* Map Picker Overlay */}
        {showMapPicker && (
          <div className="absolute inset-0 z-[110] bg-white dark:bg-bg-secondary animate-in slide-in-from-bottom duration-500 flex flex-col">
            <div className="p-6 border-b border-neutral-100 dark:border-border-color flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-airbnb/10 rounded-xl flex items-center justify-center text-airbnb">
                  <Map className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-neutral-900 dark:text-white">Explorar Mapa</h3>
                  <p className="text-xs text-neutral-500">Toca para fijar el punto exacto</p>
                </div>
              </div>
              <button 
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
                <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block">Punto Seleccionado</span>
                <div className="text-xs font-mono font-bold text-neutral-700 dark:text-neutral-300">
                  {form.latitud && form.longitud ? `${form.latitud}, ${form.longitud}` : 'Ninguno'}
                </div>
              </div>
              <button
                onClick={() => {
                  setLocationMode('coordenadas');
                  setShowMapPicker(false);
                }}
                className="bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <MapPin className="w-4 h-4" />
                Confirmar Punto
              </button>
            </div>
          </div>
        )}

        {/* Decorative Background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-airbnb/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

        {/* Header */}
        <div className="relative px-8 pt-8 pb-6 border-b border-neutral-100 dark:border-border-color flex justify-between items-start">
          <div>
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-airbnb/20 to-orange-500/20 text-airbnb mb-4">
              <MapPin className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-black tracking-tight text-neutral-900 dark:text-white">
              {initialData ? 'Editar Información' : 'Nuevo Lugar'}
            </h2>
            <p className="text-sm font-medium text-neutral-500 mt-1">
              {initialData ? 'Actualiza los detalles de este destino' : 'Comparte un lugar increíble en el mapa'}
            </p>
          </div>
          <button onClick={onClose} className="p-2.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 rounded-full transition-colors text-neutral-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="relative p-8 space-y-6 max-h-[65vh] overflow-y-auto custom-scrollbar">

          {/* ── Info básica ── */}
          <div className="space-y-5 bg-neutral-50/50 dark:bg-neutral-800/20 p-6 rounded-2xl border border-neutral-100 dark:border-border-color">
            <div className="space-y-1.5">
              <label className="text-[13px] font-black text-neutral-400 uppercase tracking-wider">Nombre del lugar</label>
              <input
                type="text"
                required
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                placeholder="Ej. Laguna de la Cocha"
                className="w-full px-4 py-3.5 bg-white dark:bg-bg-primary border border-neutral-200 dark:border-border-color rounded-xl outline-none focus:ring-2 focus:ring-airbnb/30 focus:border-airbnb transition-all dark:text-white font-semibold"
              />
            </div>

            <div className="space-y-4">
              <label className="text-[13px] font-black text-neutral-400 uppercase tracking-wider block">Clasificación</label>

              <CustomSelect
                label="Categoría principal"
                options={categoriaOpts}
                value={form.categoria}
                onChange={handleCategoriaChange}
              />

              {form.categoria && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                  <CustomSelect
                    label="Subcategoría"
                    options={subcategoriaOpts}
                    value={form.subcategoria}
                    onChange={(val) => setForm({ ...form, subcategoria: val })}
                  />
                </div>
              )}
            </div>

            <div className="space-y-1.5 pt-2">
              <label className="text-[13px] font-black text-neutral-400 uppercase tracking-wider">Descripción</label>
              <textarea
                value={form.descripcion}
                onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                placeholder="Describe qué lo hace especial..."
                rows={3}
                className="w-full px-4 py-3.5 bg-white dark:bg-bg-primary border border-neutral-200 dark:border-border-color rounded-xl outline-none focus:ring-2 focus:ring-airbnb/30 focus:border-airbnb transition-all dark:text-white resize-none font-medium text-sm"
              />
            </div>
          </div>

          {/* ── Ubicación ── */}
          <div className="space-y-5 bg-neutral-50/50 dark:bg-neutral-800/20 p-6 rounded-2xl border border-neutral-100 dark:border-border-color">
            <div className="flex items-center justify-between">
              <label className="text-[13px] font-black text-neutral-400 uppercase tracking-wider flex items-center gap-2">
                <Navigation className="w-4 h-4" /> Ubicación
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowMapPicker(true)}
                  className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-lg transition-all"
                >
                  <Map className="w-3.5 h-3.5" />
                  Elegir en Mapa
                </button>
                <button
                  type="button"
                  onClick={handleGeolocate}
                  disabled={geoLoading}
                  className="flex items-center gap-1.5 text-xs font-bold text-airbnb hover:text-airbnb-dark bg-airbnb/10 hover:bg-airbnb/20 px-3 py-1.5 rounded-lg transition-all"
                >
                  {geoLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <MapPin className="w-3.5 h-3.5" />}
                  Autodetectar
                </button>
              </div>
            </div>

            {/* Tabs (Solo Dirección y Coords) */}
            <div className="flex bg-neutral-200 dark:bg-neutral-700 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setLocationMode('direccion')}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${locationMode === 'direccion' ? 'bg-white dark:bg-neutral-800 shadow-sm text-neutral-900 dark:text-white' : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'}`}
              >
                <Map className="w-4 h-4" /> Dirección
              </button>
              <button
                type="button"
                onClick={() => setLocationMode('coordenadas')}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${locationMode === 'coordenadas' ? 'bg-white dark:bg-neutral-800 shadow-sm text-neutral-900 dark:text-white' : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'}`}
              >
                <Hash className="w-4 h-4" /> Coordenadas
              </button>
            </div>

            {locationMode === 'direccion' ? (
              <div className="space-y-2 animate-in fade-in slide-in-from-right-4 duration-300">
                <input
                  type="text"
                  required={locationMode === 'direccion'}
                  value={form.direccion}
                  onChange={(e) => setForm({ ...form, direccion: e.target.value })}
                  placeholder="Ej. Calle 18 # 25-10, Centro, Pasto"
                  className="w-full px-4 py-3.5 bg-white dark:bg-bg-primary border border-neutral-200 dark:border-border-color rounded-xl outline-none focus:ring-2 focus:ring-airbnb/30 focus:border-airbnb transition-all dark:text-white font-medium"
                />
                <p className="text-[11px] text-neutral-400 font-medium pl-1">Se geocodificará automáticamente al guardar.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-left-4 duration-300">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-neutral-400 ml-1 uppercase">Latitud</span>
                  <input
                    type="number"
                    step="any"
                    required={locationMode === 'coordenadas'}
                    value={form.latitud}
                    onChange={(e) => setForm({ ...form, latitud: e.target.value })}
                    placeholder="1.2136"
                    className="w-full px-4 py-3.5 bg-white dark:bg-bg-primary border border-neutral-200 dark:border-border-color rounded-xl outline-none focus:ring-2 focus:ring-airbnb/30 focus:border-airbnb transition-all dark:text-white font-medium text-sm font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-neutral-400 ml-1 uppercase">Longitud</span>
                  <input
                    type="number"
                    step="any"
                    required={locationMode === 'coordenadas'}
                    value={form.longitud}
                    onChange={(e) => setForm({ ...form, longitud: e.target.value })}
                    placeholder="-77.2811"
                    className="w-full px-4 py-3.5 bg-white dark:bg-bg-primary border border-neutral-200 dark:border-border-color rounded-xl outline-none focus:ring-2 focus:ring-airbnb/30 focus:border-airbnb transition-all dark:text-white font-medium text-sm font-mono"
                  />
                </div>
              </div>
            )}
          </div>

          {/* ── Acciones ── */}
          <div className="pt-2 flex items-center justify-between">
            <p className="text-[11px] font-bold text-neutral-400">
              {initialData ? 'Los cambios se verán reflejados al instante' : 'Pendiente de aprobación por admin'}
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3.5 text-sm font-bold text-neutral-500 hover:text-neutral-800 dark:hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-airbnb to-rose-500 text-white px-8 py-3.5 rounded-xl font-bold shadow-lg shadow-airbnb/20 hover:shadow-airbnb/40 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (initialData ? <Edit className="w-5 h-5" /> : <Plus className="w-5 h-5" />)}
                {initialData ? 'Guardar Cambios' : 'Crear Lugar'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
