'use client';

import React, { useState, useMemo } from 'react';
import { 
  Map, 
  MapMarker, 
  MarkerContent, 
  MarkerPopup, 
  MapControls 
} from '@/components/ui/map';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePlaces } from '@/hooks/usePlaces';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useAuth } from '@/context/AuthContext';
import { Category, Place } from '@/types/place';
import { Star, MapPin, Navigation, Info, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// Categorías disponibles
const CATEGORIES: Category[] = ['Todos', 'Gastronomía', 'Cultura', 'Naturaleza', 'Religioso'];

// Colores según categoría
const getCategoryColor = (category: string) => {
  switch (category.toLowerCase()) {
    case 'gastronomía': return 'bg-orange-500';
    case 'cultura': return 'bg-purple-500';
    case 'naturaleza': return 'bg-green-500';
    case 'religioso': return 'bg-blue-500';
    default: return 'bg-slate-500';
  }
};

/**
 * Componente principal del mapa de Exploro.
 * Utiliza MapLibre via mapcn para una experiencia geoespacial premium.
 */
export default function ExploroMap() {
  const { places, loading, error, fetchNearby } = usePlaces();
  const { coords, loading: geoLoading, error: geoError, getPosition } = useGeolocation();
  const { user, isAuthenticated } = useAuth();
  
  const [selectedCategory, setSelectedCategory] = useState<Category>('Todos');
  const [viewport, setViewport] = useState({
    center: [-77.2811, 1.2136] as [number, number], // Pasto, Colombia
    zoom: 13
  });

  // Filtrado local de lugares
  const filteredPlaces = useMemo(() => {
    if (selectedCategory === 'Todos') return places;
    return places.filter(p => (p.categoria || p.category || '').toLowerCase() === selectedCategory.toLowerCase());
  }, [places, selectedCategory]);

  // Manejador para "Cerca de mí"
  const handleNearbySearch = async () => {
    if (!coords) {
      getPosition();
      return;
    }
    await fetchNearby(coords.lat, coords.lng);
    setViewport({
      center: [coords.lng, coords.lat],
      zoom: 15
    });
  };

  // Manejador para "Ubicarme"
  const handleLocate = () => {
    getPosition();
    if (coords) {
      setViewport({
        center: [coords.lng, coords.lat],
        zoom: 15
      });
    }
  };

  if (error) {
    return (
      <div className="w-full h-[600px] flex items-center justify-center bg-red-50 border border-red-100 rounded-xl p-8">
        <div className="text-center">
          <Info className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-600 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[700px] bg-slate-50 rounded-2xl shadow-xl overflow-hidden border border-slate-200">
      {/* Panel Lateral de Filtros (Desktop) */}
      <div className="absolute top-4 left-4 z-20 hidden md:flex flex-col gap-2 p-3 bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-slate-100 w-48">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest px-2 mb-1">Categorías</h3>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={cn(
              "text-left px-3 py-2 rounded-xl text-sm font-semibold transition-all",
              selectedCategory === cat 
                ? "bg-slate-800 text-white shadow-md scale-[1.02]" 
                : "text-slate-600 hover:bg-slate-100"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Drawer de Filtros (Móvil) */}
      <div className="absolute bottom-0 left-0 right-0 z-30 md:hidden p-4 bg-white rounded-t-3xl shadow-2xl border-t border-slate-100">
        <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mb-4" />
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold transition-all",
                selectedCategory === cat 
                  ? "bg-slate-800 text-white shadow-md" 
                  : "bg-slate-100 text-slate-600"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Botones de Acción (Esquina Superior Derecha) */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
        <Button 
          variant="secondary" 
          size="sm" 
          onClick={handleLocate}
          className="bg-white/90 backdrop-blur-md shadow-md hover:bg-white rounded-xl font-bold gap-2"
        >
          {geoLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Locate className="w-4 h-4" />}
          Ubicarme
        </Button>
        
        {isAuthenticated && (
          <Button 
            variant="default" 
            size="sm" 
            onClick={handleNearbySearch}
            className="bg-airbnb hover:bg-airbnb/90 text-white shadow-md rounded-xl font-bold gap-2"
          >
            <Navigation className="w-4 h-4" />
            Cerca de mí
          </Button>
        )}
      </div>

      {/* Mapa Principal */}
      <Map
        viewport={viewport}
        onViewportChange={setViewport}
        className="w-full h-full"
        loading={loading}
      >
        <MapControls showZoom showCompass position="bottom-right" />

        {/* Marcador del Usuario */}
        {coords && (
          <MapMarker latitude={coords.lat} longitude={coords.lng}>
            <MarkerContent>
              <div className="relative">
                <div className="w-5 h-5 bg-blue-500 border-2 border-white rounded-full shadow-lg animate-pulse" />
                <div className="absolute -inset-2 bg-blue-400 opacity-20 rounded-full animate-ping" />
              </div>
            </MarkerContent>
          </MapMarker>
        )}

        {/* Marcadores de Lugares */}
        {filteredPlaces.map((place) => (
          <MapMarker 
            key={place.id} 
            latitude={place.latitud || place.latitude || 0} 
            longitude={place.longitud || place.longitude || 0}
          >
            <MarkerContent>
              <div className={cn(
                "w-8 h-8 rounded-full border-2 border-white shadow-md flex items-center justify-center text-white transition-transform hover:scale-110",
                getCategoryColor(place.categoria || place.category || '')
              )}>
                <MapPin className="w-4 h-4" />
              </div>
            </MarkerContent>
            
            <MarkerPopup className="p-0 overflow-hidden border-none shadow-2xl rounded-2xl max-w-[240px]">
              <div className="flex flex-col">
                <img 
                  src={place.foto_principal || place.image || 'https://via.placeholder.com/400x200?text=Exploro'} 
                  alt={place.nombre}
                  className="w-full h-28 object-cover"
                />
                <div className="p-3 bg-white">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="text-sm font-bold text-slate-800 line-clamp-1">{place.nombre}</h4>
                    <div className="flex items-center gap-0.5 text-xs font-bold text-slate-600">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      {place.calificacion_promedio || place.rating || 0}
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-100 font-bold px-2 py-0">
                    {place.categoria || place.category || 'General'}
                  </Badge>
                </div>
              </div>
            </MarkerPopup>
          </MapMarker>
        ))}
      </Map>

      {/* Overlay de Carga Geolocation */}
      {(geoLoading) && (
        <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-[2px] z-50 flex items-center justify-center pointer-events-none">
          <div className="bg-white p-4 rounded-2xl shadow-xl flex items-center gap-3 animate-in fade-in zoom-in duration-300">
            <Loader2 className="w-5 h-5 text-slate-800 animate-spin" />
            <span className="text-sm font-bold text-slate-800">Obteniendo ubicación...</span>
          </div>
        </div>
      )}
      
      {geoError && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50">
          <div className="bg-red-500 text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg flex items-center gap-2">
            <Info className="w-3 h-3" />
            {geoError}
          </div>
        </div>
      )}
    </div>
  );
}

// Icono personalizado para el botón de ubicación
function Locate({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="3" />
      <line x1="12" y1="2" x2="12" y2="5" />
      <line x1="12" y1="19" x2="12" y2="22" />
      <line x1="2" y1="12" x2="5" y2="12" />
      <line x1="19" y1="12" x2="22" y2="12" />
    </svg>
  );
}
