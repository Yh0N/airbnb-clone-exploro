'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { 
  Map, 
  MapMarker, 
  MarkerContent, 
  MarkerPopup, 
  MapControls 
} from '@/components/ui/map';
import { 
  Loader2, MapPin, Target, ArrowRight, Star, ChevronDown, ChevronUp,
  Utensils, Bed, TreePine, Church, ShoppingBag, PartyPopper, Wrench, Compass, 
  Coffee, Telescope, Store, Bus, LucideIcon
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

// Mapeo de clases Tailwind a colores hexadecimales para efectos de brillo (glow)
const TAILWIND_COLOR_MAP: Record<string, string> = {
  'bg-orange-500': '#f97316',
  'bg-emerald-500': '#10b981',
  'bg-green-500': '#22c55e',
  'bg-purple-500': '#a855f7',
  'bg-pink-500': '#ec4899',
  'bg-amber-500': '#f59e0b',
  'bg-slate-500': '#64748b',
  'bg-blue-500': '#3b82f6',
  'bg-airbnb': '#FF385C',
};

// Configuración de categorías con colores e iconos tipo neón
const CATEGORY_CONFIG: Record<string, { color: string; icon: LucideIcon; label: string }> = {
  gastronomia: { color: 'bg-orange-500',  icon: Utensils,     label: 'Gastronomía' },
  hospedaje:   { color: 'bg-emerald-500', icon: Bed,          label: 'Hospedaje' },
  naturaleza:  { color: 'bg-green-500',   icon: TreePine,     label: 'Naturaleza' },
  cultura:     { color: 'bg-purple-500',  icon: Church,       label: 'Cultura' },
  comercio:    { color: 'bg-pink-500',    icon: ShoppingBag,  label: 'Comercio' },
  recreacion:  { color: 'bg-amber-500',   icon: PartyPopper,  label: 'Recreación' },
  servicios:   { color: 'bg-slate-500',   icon: Wrench,       label: 'Servicios' },
  turismo:     { color: 'bg-blue-500',    icon: Compass,      label: 'Turismo' },
  
  // Subcategorías (heredan o personalizan)
  restaurante: { color: 'bg-orange-500', icon: Utensils,     label: 'Restaurante' },
  cafeteria:   { color: 'bg-orange-500', icon: Coffee,       label: 'Cafetería' },
  parque:      { color: 'bg-green-500',  icon: TreePine,     label: 'Parque' },
  mirador:     { color: 'bg-green-500',  icon: Telescope,    label: 'Mirador' },
  museo:       { color: 'bg-purple-500', icon: Church,       label: 'Museo' },
  iglesia:     { color: 'bg-purple-500', icon: Church,       label: 'Iglesia' },
  tienda:      { color: 'bg-pink-500',   icon: Store,        label: 'Tienda' },
  hospital:    { color: 'bg-slate-500',  icon: Wrench,       label: 'Hospital' },
  transporte:  { color: 'bg-slate-500',  icon: Bus,          label: 'Transporte' },
  default:     { color: 'bg-airbnb',     icon: MapPin,       label: 'Otro' }
};

const getCategoryConfig = (item: any) => {
  const category = (item.categoria || item.category || item.tipo || '').toLowerCase();
  const subcategory = (item.subcategoria || '').toLowerCase();
  
  if (CATEGORY_CONFIG[subcategory]) return CATEGORY_CONFIG[subcategory];
  if (CATEGORY_CONFIG[category]) return CATEGORY_CONFIG[category];
  
  const foundKey = Object.keys(CATEGORY_CONFIG).find(key => 
    category.includes(key) || subcategory.includes(key)
  );
  
  return foundKey ? CATEGORY_CONFIG[foundKey] : CATEGORY_CONFIG.default;
};

interface MapProps {
  entities: any[];
  userLocation: [number, number] | null;
  selectedEntity?: any;
  onSelectEntity?: (entity: any) => void;
  onOpenReview?: (entity: any) => void;
}

export default function ExploroMap({ entities, userLocation, selectedEntity, onSelectEntity, onOpenReview }: MapProps) {
  const router = useRouter();
  const [viewport, setViewport] = useState({
    center: [-77.2811, 1.2136] as [number, number], // Pasto, Colombia
    zoom: 14
  });
  const [isLegendOpen, setIsLegendOpen] = useState(true);

  // Centrar mapa si hay un selectedEntity o si llega el userLocation inicial
  useEffect(() => {
    if (selectedEntity) {
      const lat = selectedEntity.latitud || selectedEntity.latitude;
      const lng = selectedEntity.longitud || selectedEntity.longitude;
      if (lat && lng) {
        setViewport({ center: [lng, lat], zoom: 16 });
      }
    } else if (userLocation) {
      setViewport(prev => ({ ...prev, center: [userLocation[1], userLocation[0]] }));
    }
  }, [selectedEntity, userLocation]);

  const toggleLegend = () => {
    setIsLegendOpen(prev => !prev);
  };

  const handleViewDetail = useCallback((item: any) => {
    const id = item.id_lugar || item.id_pyme || item.id;
    if (item.id_pyme) router.push(`/pymes/${id}`);
    else router.push(`/places/${id}`);
  }, [router]);

  return (
    <div className="w-full h-full relative rounded-3xl overflow-hidden shadow-2xl border border-neutral-200 dark:border-border-color bg-neutral-100">
      <Map
        viewport={viewport}
        onViewportChange={setViewport}
        className="w-full h-full"
      >
        <MapControls showZoom position="top-right" className="mr-2 mt-2" />

        {/* Marcador del Usuario */}
        {userLocation && (
          <MapMarker latitude={userLocation[0]} longitude={userLocation[1]}>
            <MarkerContent>
              <div className="relative flex items-center justify-center">
                <div className="absolute w-8 h-8 bg-blue-500 rounded-full animate-ping opacity-20"></div>
                <div className="relative w-5 h-5 bg-blue-500 rounded-full border-[3px] border-white shadow-xl"></div>
              </div>
            </MarkerContent>
            <MarkerPopup className="p-2 text-center rounded-xl max-w-[150px]">
              <p className="font-black text-blue-600 uppercase text-[10px] tracking-widest mb-1">Tu Ubicación</p>
              <p className="text-xs font-bold text-neutral-800">Estás aquí ahora</p>
            </MarkerPopup>
          </MapMarker>
        )}

        {/* Marcadores de Entidades */}
        {entities.map((item, idx) => {
          const lat = item.latitud || item.latitude;
          const lng = item.longitud || item.longitude;
          if (!lat || !lng) return null;

          const isPyme = !!item.id_pyme;
          const entityId = item.id_pyme || item.id_lugar || item.id || idx;
          const isSelected = selectedEntity?.id === entityId;
          const catConfig = getCategoryConfig(item);

          return (
            <MapMarker 
              key={`${isPyme ? 'pyme' : 'place'}-${entityId}`} 
              latitude={lat} 
              longitude={lng}
            >
              <MarkerContent>
                <div 
                  className={cn(
                    "flex items-center justify-center rounded-full transform transition-all duration-300 hover:scale-110 w-[38px] h-[38px]",
                    catConfig.color,
                    isSelected ? "ring-[3px] ring-white scale-110 z-50" : "z-10"
                  )}
                  style={{ 
                    borderWidth: '2px',
                    borderStyle: isPyme ? 'dashed' : 'solid',
                    borderColor: 'white',
                    boxShadow: isSelected 
                      ? `0 0 20px ${TAILWIND_COLOR_MAP[catConfig.color]}, 0 0 40px ${TAILWIND_COLOR_MAP[catConfig.color]}` 
                      : `0 0 12px ${TAILWIND_COLOR_MAP[catConfig.color]}90` // Neon glow effect
                  }}
                  onClick={() => onSelectEntity?.(item)}
                >
                  <catConfig.icon className="w-[18px] h-[18px] text-white drop-shadow-md" />
                </div>
              </MarkerContent>
              
              <MarkerPopup className="p-0 overflow-hidden border-none shadow-2xl rounded-2xl max-w-[240px]">
                <div className="flex flex-col">
                  {/* Imagen de cabecera */}
                  <div className="h-28 w-full relative">
                    {(item.image || item.images?.[0] || item.avatar) ? (
                      <img 
                        src={item.image || item.images?.[0] || item.avatar} 
                        alt={item.nombre || item.name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-airbnb/20 to-blue-600/20 flex items-center justify-center">
                        <MapPin className="w-8 h-8 text-airbnb/40" />
                      </div>
                    )}
                    <div className="absolute top-2 left-2 flex gap-1.5">
                       <span className="text-[9px] font-black bg-white/90 backdrop-blur-md text-neutral-800 px-2 py-1 rounded-lg shadow-sm uppercase tracking-wider border border-white/20">
                          {item.categoria || item.tipo || 'Lugar'}
                      </span>
                      {(item.subcategoria || item.subcategory) && (
                        <span className="text-[9px] font-black bg-airbnb text-white px-2 py-1 rounded-lg shadow-sm uppercase tracking-wider border border-airbnb/20">
                          {item.subcategoria || item.subcategory}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Contenido */}
                  <div className="p-4 bg-white dark:bg-bg-secondary">
                    <div className="flex justify-between items-start mb-1 gap-2">
                      <h3 className="font-extrabold text-neutral-900 dark:text-white text-base leading-tight">
                        {item.nombre || item.name}
                      </h3>
                      {item.rating > 0 && (
                        <div className="flex items-center gap-1 bg-neutral-50 dark:bg-neutral-800 px-1.5 py-0.5 rounded-md">
                          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                          <span className="text-[11px] font-bold text-neutral-800 dark:text-white">{item.rating}</span>
                        </div>
                      )}
                    </div>
                    
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2 mb-4 leading-relaxed font-medium italic">
                      {item.descripcion || item.ubicacion_textual || 'Sin descripción disponible'}
                    </p>
                    
                    <div className="flex gap-2 mt-3">
                      <button 
                        onClick={() => handleViewDetail(item)}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-neutral-900 dark:bg-neutral-800 text-white px-3 py-2.5 rounded-xl text-[11px] font-black transition-all hover:scale-[1.02] shadow-md"
                      >
                        Ver Ficha <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                      {onOpenReview && (
                        <button 
                          onClick={() => onOpenReview(item)}
                          className="flex-1 flex items-center justify-center gap-1.5 bg-airbnb/10 text-airbnb px-3 py-2.5 rounded-xl text-[11px] font-black transition-all hover:bg-airbnb hover:text-white shadow-md"
                        >
                          <Star className="w-3.5 h-3.5" /> Calificar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </MarkerPopup>
            </MapMarker>
          );
        })}
      </Map>

      {/* Geolocator Overlay UI */}
      {!userLocation && (
        <div className="absolute top-6 left-6 z-10 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="bg-white/90 dark:bg-bg-secondary/90 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-lg border border-neutral-200 dark:border-border-color flex items-center gap-3">
                <div className="relative">
                    <Loader2 className="w-4 h-4 text-airbnb animate-spin" />
                </div>
                <span className="text-xs font-black text-neutral-700 dark:text-neutral-200 uppercase tracking-tight">Localizando posición...</span>
            </div>
        </div>
      )}

      <div className="absolute top-6 right-6 mt-24 z-10 flex flex-col gap-2">
        <button 
            onClick={() => {
                if (userLocation) {
                    setViewport({ center: [userLocation[1], userLocation[0]], zoom: 16 });
                }
            }}
            className="bg-white/90 dark:bg-bg-secondary/90 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-neutral-200 dark:border-border-color text-airbnb hover:scale-105 transition-all"
            title="Mi ubicación"
        >
            <Target className="w-5 h-5" />
        </button>
      </div>
      
      {/* Legend */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 hidden md:block transition-all duration-300">
         <div className="bg-white/90 dark:bg-bg-secondary/90 backdrop-blur-md rounded-3xl shadow-2xl border border-neutral-200 dark:border-border-color overflow-hidden">
            <button 
              onClick={toggleLegend}
              className="w-full flex items-center justify-center py-2 bg-neutral-50 dark:bg-neutral-800 hover:bg-neutral-100 transition-colors border-b border-neutral-200"
            >
              <div className="w-12 h-1 bg-neutral-300 rounded-full mb-1" />
              {isLegendOpen ? <ChevronDown className="w-4 h-4 text-neutral-400 absolute right-4" /> : <ChevronUp className="w-4 h-4 text-neutral-400 absolute right-4" />}
              {!isLegendOpen && <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mx-2">Leyenda</span>}
            </button>
            
            <div className={cn("transition-all duration-300 ease-in-out", isLegendOpen ? 'max-h-96 opacity-100 px-6 py-4' : 'max-h-0 opacity-0 px-6 py-0')}>
              <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-center gap-4">
                      <div className="flex items-center gap-1.5">
                          <div className="w-4 h-4 rounded-full bg-neutral-400 shadow-sm" style={{ border: '2px dashed white', boxSizing: 'border-box' }} />
                          <span className="text-[10px] font-black text-neutral-600 uppercase tracking-tight">Pyme (Establecimiento)</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                          <div className="w-4 h-4 rounded-full bg-neutral-400 shadow-sm border-2 border-solid border-white" />
                          <span className="text-[10px] font-black text-neutral-600 uppercase tracking-tight">Lugar (Punto de Interés)</span>
                      </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pt-2.5 border-t border-neutral-100 dark:border-neutral-800 w-full">
                      {Object.entries(CATEGORY_CONFIG)
                        .filter(([key]) => !['default', 'restaurante', 'cafeteria', 'parque', 'mirador', 'museo', 'iglesia', 'tienda', 'transporte', 'hospital'].includes(key))
                        .map(([key, config]) => (
                          <div key={key} className="flex items-center gap-1.5">
                              <div className={cn("w-2.5 h-2.5 rounded-full", config.color)} />
                              <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-tight">{config.label}</span>
                          </div>
                        ))
                      }
                  </div>
              </div>
            </div>
         </div>
      </div>
    </div>
  );
}
