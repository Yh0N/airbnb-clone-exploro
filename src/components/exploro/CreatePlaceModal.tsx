'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, MapPin, Navigation, Loader2, Plus, Map, Hash, Edit, Camera, Upload, Image as ImageIcon, Trash2, Search } from 'lucide-react';
import { resolvePhotoUrl } from '@/services/api';
import * as api from '@/services/api';
import { useAlert } from '@/context/AlertContext';
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
  const { showAlert } = useAlert();
  const [locationMode, setLocationMode] = useState<'direccion' | 'coordenadas'>('direccion');

  // Autocomplete de dirección (Photon — Komoot, sin API key, CORS permitido)
  type Suggestion = { label: string; sublabel: string; lat: number; lon: number };
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (suggestRef.current && !suggestRef.current.contains(e.target as Node))
        setShowSuggestions(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const buscarSugerencias = useCallback((valor: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (valor.length < 3) { setSuggestions([]); setShowSuggestions(false); return; }
    debounceRef.current = setTimeout(async () => {
      setSuggestLoading(true);
      try {
        // Photon: OSM geocoder con soporte CORS completo
        const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(valor)}&limit=5&lang=es&bbox=-78.9,-4.2,-66.8,12.4`;
        const res = await fetch(url);
        const data = await res.json();
        const items: Suggestion[] = (data.features ?? []).map((f: any) => {
          const p = f.properties ?? {};
          const parts = [p.name, p.street, p.housenumber].filter(Boolean).join(' ');
          const sub = [p.city || p.town || p.village, p.state, p.country].filter(Boolean).join(', ');
          const [lon, lat] = f.geometry?.coordinates ?? [0, 0];
          return { label: parts || sub, sublabel: sub, lat, lon };
        });
        setSuggestions(items);
        setShowSuggestions(items.length > 0);
      } catch { setSuggestions([]); }
      finally { setSuggestLoading(false); }
    }, 450);
  }, []);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(resolvePhotoUrl(initialData?.foto_principal || initialData?.image) || null);

  const [form, setForm] = useState({
    nombre: initialData?.nombre || initialData?.name || '',
    descripcion: initialData?.descripcion || initialData?.description || '',
    categoria: initialData?.categoria || initialData?.category || '',
    subcategoria: initialData?.subcategoria || '',
    direccion: initialData?.location || initialData?.ubicacion_textual || '',
    latitud: initialData?.latitude?.toString() || initialData?.latitud?.toString() || '',
    longitud: initialData?.longitude?.toString() || initialData?.longitud?.toString() || '',
  });

  const seleccionarSugerencia = (s: { label: string; sublabel: string; lat: number; lon: number }) => {
    const direccion = [s.label, s.sublabel].filter(Boolean).join(', ');
    setForm(f => ({ ...f, direccion, latitud: String(s.lat), longitud: String(s.lon) }));
    setSuggestions([]);
    setShowSuggestions(false);
  };

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
      setImagePreview(resolvePhotoUrl(initialData.foto_principal || initialData.image) || null);
    } else {
      setForm({ nombre: '', descripcion: '', categoria: '', subcategoria: '', direccion: '', latitud: '', longitud: '' });
      setImagePreview(null);
      setSelectedImage(null);
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
      showAlert({ type: 'error', title: 'Geolocalización', message: 'Tu navegador no soporta geolocalización.' });
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
        showAlert({ type: 'warning', title: 'Ubicación', message: 'No se pudo obtener tu ubicación automáticamente. Por favor, ingresa las coordenadas o dirección manualmente.' });
        setGeoLoading(false);
      }
    );
  };
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.categoria) {
      showAlert({ type: 'warning', title: 'Faltan datos', message: 'Selecciona una categoría para el lugar.' });
      return;
    }
    if (!form.subcategoria) {
      showAlert({ type: 'warning', title: 'Faltan datos', message: 'Selecciona una subcategoría específica.' });
      return;
    }
    if (locationMode === 'coordenadas' && (!form.latitud || !form.longitud)) {
      showAlert({ type: 'warning', title: 'Faltan datos', message: 'Las coordenadas son obligatorias en este modo.' });
      return;
    }
    if (locationMode === 'direccion' && !form.direccion) {
      showAlert({ type: 'warning', title: 'Faltan datos', message: 'La dirección es obligatoria en este modo.' });
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

      let placeId = initialData?.id;
      if (initialData?.id) {
        await api.updatePlace(initialData.id, payload);
      } else {
        const newPlace = await api.createPlace(payload);
        placeId = newPlace.id_lugar;
      }
      
      // Subir imagen si se seleccionó una nueva
      if (selectedImage && placeId) {
        await api.uploadPhoto('place', placeId, selectedImage);
      }
      
      onCreated();
      onClose();
      if (!initialData) {
        setForm({ nombre: '', descripcion: '', categoria: '', subcategoria: '', direccion: '', latitud: '', longitud: '' });
      }
    } catch (error: any) {
      console.error('Error saving place:', error);
      const detail = error?.response?.data?.detail;
      showAlert({ type: 'error', title: 'Error al guardar', message: detail || 'No pudimos guardar los cambios. Por favor, verifica tu conexión e intenta de nuevo.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:px-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full sm:max-w-xl bg-white dark:bg-bg-secondary rounded-t-[32px] sm:rounded-[32px] shadow-2xl animate-in slide-in-from-bottom sm:zoom-in-95 duration-300">

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
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">Toca para fijar el punto exacto</p>
                </div>
              </div>
              <button 
                onClick={() => setShowMapPicker(false)}
                className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-neutral-500 dark:text-neutral-400" />
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
        <div className="relative px-6 md:px-8 pt-6 md:pt-8 pb-5 md:pb-6 border-b border-neutral-100 dark:border-border-color flex justify-between items-start">
          <div>
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-airbnb/20 to-orange-500/20 text-airbnb mb-4">
              <MapPin className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-black tracking-tight text-neutral-900 dark:text-white">
              {initialData ? 'Editar Información' : 'Nuevo Lugar'}
            </h2>
            <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mt-1">
              {initialData ? 'Actualiza los detalles de este destino' : 'Comparte un lugar increíble en el mapa'}
            </p>
          </div>
          <button onClick={onClose} className="p-2.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 rounded-full transition-colors text-neutral-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="relative p-5 md:p-8 space-y-5 md:space-y-6 max-h-[75vh] sm:max-h-[65vh] overflow-y-auto custom-scrollbar">

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

          {/* ── Carga de Imagen ── */}
          <div className="space-y-4 bg-neutral-50/50 dark:bg-neutral-800/20 p-6 rounded-2xl border border-neutral-100 dark:border-border-color">
            <label className="text-[13px] font-black text-neutral-400 uppercase tracking-wider block mb-2">Foto del Lugar</label>
            
            {imagePreview ? (
              <div className="relative group aspect-video rounded-2xl overflow-hidden border-2 border-airbnb shadow-lg">
                <img src={imagePreview} alt="Vista previa" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                  <button 
                    type="button"
                    onClick={() => document.getElementById('place-image-input')?.click()}
                    className="p-3 bg-white text-neutral-900 rounded-full hover:scale-110 transition-transform shadow-xl"
                  >
                    <Upload className="w-5 h-5" />
                  </button>
                  <button 
                    type="button"
                    onClick={() => { setSelectedImage(null); setImagePreview(null); }}
                    className="p-3 bg-white text-rose-500 rounded-full hover:scale-110 transition-transform shadow-xl"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => document.getElementById('place-image-input')?.click()}
                className="w-full aspect-video rounded-2xl border-2 border-dashed border-neutral-200 dark:border-neutral-700 hover:border-airbnb dark:hover:border-airbnb hover:bg-airbnb/5 transition-all flex flex-col items-center justify-center gap-3 group"
              >
                <div className="w-12 h-12 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center group-hover:scale-110 group-hover:bg-airbnb/20 transition-all">
                  <Camera className="w-6 h-6 text-neutral-400 group-hover:text-airbnb" />
                </div>
                <div className="text-center">
                  <span className="text-sm font-bold text-neutral-600 dark:text-neutral-400 block group-hover:text-airbnb">Subir fotografía</span>
                  <span className="text-[10px] font-medium text-neutral-400">JPG, PNG o WebP (Máx. 5MB)</span>
                </div>
              </button>
            )}
            <input 
              id="place-image-input"
              type="file" 
              accept="image/*"
              className="hidden" 
              onChange={handleImageChange}
            />
          </div>

          {/* ── Ubicación ── */}
          <div className="space-y-5 bg-neutral-50/50 dark:bg-neutral-800/20 p-6 rounded-2xl border border-neutral-100 dark:border-border-color">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="text-[13px] font-black text-neutral-400 uppercase tracking-wider flex items-center gap-2">
                <Navigation className="w-4 h-4" /> Ubicación
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowMapPicker(true)}
                  className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap"
                >
                  <Map className="w-3.5 h-3.5 shrink-0" />
                  Elegir en Mapa
                </button>
                <button
                  type="button"
                  onClick={handleGeolocate}
                  disabled={geoLoading}
                  className="flex items-center gap-1.5 text-xs font-bold text-airbnb hover:text-airbnb-dark bg-airbnb/10 hover:bg-airbnb/20 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap"
                >
                  {geoLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" /> : <MapPin className="w-3.5 h-3.5 shrink-0" />}
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
                <div className="relative" ref={suggestRef}>
                  <div className="relative">
                    <input
                      type="text"
                      required={locationMode === 'direccion'}
                      value={form.direccion}
                      onChange={(e) => {
                        setForm({ ...form, direccion: e.target.value });
                        buscarSugerencias(e.target.value);
                      }}
                      onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                      placeholder="Ej. Calle 18 # 25-10, Centro, Pasto"
                      className="w-full pl-4 pr-10 py-3.5 bg-white dark:bg-bg-primary border border-neutral-200 dark:border-border-color rounded-xl outline-none focus:ring-2 focus:ring-airbnb/30 focus:border-airbnb transition-all dark:text-white font-medium"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400">
                      {suggestLoading
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : <Search className="w-4 h-4" />}
                    </div>
                  </div>

                  {showSuggestions && suggestions.length > 0 && (
                    <ul className="absolute z-50 left-0 right-0 mt-1 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-lg overflow-hidden">
                      {suggestions.map((s, i) => (
                        <li key={i}>
                          <button
                            type="button"
                            onMouseDown={() => seleccionarSugerencia(s)}
                            className="w-full text-left px-4 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-700 flex items-start gap-3 transition-colors border-b border-neutral-100 dark:border-neutral-700 last:border-0"
                          >
                            <MapPin className="w-4 h-4 text-airbnb shrink-0 mt-0.5" />
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-neutral-800 dark:text-white truncate">{s.label}</p>
                              {s.sublabel && s.sublabel !== s.label && (
                                <p className="text-xs text-neutral-400 truncate">{s.sublabel}</p>
                              )}
                            </div>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <p className="text-[11px] text-neutral-400 font-medium pl-1">
                  Escribe para ver sugerencias. Las coordenadas se rellenan automáticamente.
                </p>
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
          <div className="pt-2 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className="text-[11px] font-bold text-neutral-400 text-center sm:text-left">
              {initialData ? 'Los cambios se verán reflejados al instante' : 'Pendiente de aprobación por admin'}
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-none px-5 py-3.5 text-sm font-bold text-neutral-500 hover:text-neutral-800 dark:hover:text-white transition-colors rounded-xl border border-neutral-200 dark:border-border-color hover:bg-neutral-50 dark:hover:bg-neutral-800"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 sm:flex-none bg-gradient-to-r from-airbnb to-rose-500 text-white px-6 py-3.5 rounded-xl font-bold shadow-lg shadow-airbnb/20 hover:shadow-airbnb/40 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
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
