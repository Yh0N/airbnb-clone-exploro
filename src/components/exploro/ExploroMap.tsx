'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Loader2, Navigation, MapPin, Store, Plus, Minus, Target, ArrowRight, Star, ChevronDown, ChevronUp } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Corregir problemas de iconos de Leaflet en Next.js
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// Configuración extendida de categorías: Color e Icono
const CATEGORY_CONFIG: Record<string, { color: string; icon: string }> = {
  gastronomia: { color: '#3B82F6', icon: '🍽️' },
  hospedaje: { color: '#10B981', icon: '🏨' },
  naturaleza: { color: '#EAB308', icon: '🌿' },
  cultura: { color: '#8B5CF6', icon: '🏛️' },
  comercio: { color: '#EC4899', icon: '🛍️' },
  recreacion: { color: '#F97316', icon: '🎡' },
  servicios: { color: '#64748B', icon: '🏥' },
  turismo: { color: '#FF385C', icon: '🧭' },
  
  // Mapeo por subcategorías o palabras clave para mayor precisión
  restaurante: { color: '#3B82F6', icon: '🍴' },
  cafeteria: { color: '#3B82F6', icon: '☕' },
  parque: { color: '#F97316', icon: '🎢' },
  mirador: { color: '#EAB308', icon: '🔭' },
  museo: { color: '#8B5CF6', icon: '🏛️' },
  iglesia: { color: '#8B5CF6', icon: '⛪' },
  tienda: { color: '#EC4899', icon: '🏪' },
  hospital: { color: '#64748B', icon: '🏥' },
  transporte: { color: '#64748B', icon: '🚌' },
  default: { color: '#FF385C', icon: '📍' }
};

const createCustomIcon = (entity: any) => {
  const isPyme = !!entity.id_pyme;
  const category = (entity.categoria || entity.category || entity.tipo || '').toLowerCase();
  const subcategory = (entity.subcategoria || '').toLowerCase();
  
  // Buscar primero por subcategoría, luego por categoría
  let config = CATEGORY_CONFIG[subcategory] || CATEGORY_CONFIG[category] || CATEGORY_CONFIG.default;
  
  // Si no coincide exactamente, buscar si la categoría contiene alguna de nuestras llaves
  if (config === CATEGORY_CONFIG.default) {
    const foundKey = Object.keys(CATEGORY_CONFIG).find(key => 
      category.includes(key) || subcategory.includes(key)
    );
    if (foundKey) config = CATEGORY_CONFIG[foundKey];
  }

  const bgColor = config.color;
  const icon = config.icon;
  
  // Estilo visual: PYMES con borde punteado, LUGARES sólido
  const html = `
    <div class="flex items-center justify-center rounded-full shadow-lg transform transition-all hover:scale-125 border-2 border-white" 
         style="background-color: ${bgColor}; width: 36px; height: 36px; font-size: 18px; ${isPyme ? 'border-style: dashed;' : 'border-style: solid;'}">
      ${icon}
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-div-icon',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
};

const UserIcon = L.divIcon({
  html: `<div class="relative flex items-center justify-center">
          <div class="absolute w-8 h-8 bg-blue-500 rounded-full animate-ping opacity-20"></div>
          <div class="relative w-5 h-5 bg-blue-500 rounded-full border-[3px] border-white shadow-xl"></div>
        </div>`,
  className: '',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

// Componente para gestionar la vista y acciones del mapa
function MapController({ selectedEntity, userLocation }: { selectedEntity: any, userLocation: [number, number] | null }) {
  const map = useMap();

  useEffect(() => {
    if (selectedEntity) {
      const lat = selectedEntity.latitud || selectedEntity.latitude;
      const lng = selectedEntity.longitud || selectedEntity.longitude;
      if (lat && lng) {
        map.flyTo([lat, lng], 17, { duration: 1.5 });
      }
    }
  }, [selectedEntity, map]);

  return null;
}

interface MapProps {
  entities: any[];
  userLocation: [number, number] | null;
  selectedEntity?: any;
  onSelectEntity?: (entity: any) => void;
  onOpenReview?: (entity: any) => void;
}

export default function ExploroMap({ entities, userLocation, selectedEntity, onSelectEntity, onOpenReview }: MapProps) {
  const router = useRouter();
  const [pastoCenter] = useState<[number, number]>([1.2136, -77.2811]);
  const mapCenter = userLocation || pastoCenter;
  const mapRef = useRef<L.Map | null>(null);
  const [isLegendOpen, setIsLegendOpen] = useState(true);

  useEffect(() => {
    const savedState = localStorage.getItem('exploro_legend_open');
    if (savedState !== null) {
      setIsLegendOpen(savedState === 'true');
    }
  }, []);

  const toggleLegend = () => {
    setIsLegendOpen(prev => {
      const newState = !prev;
      localStorage.setItem('exploro_legend_open', String(newState));
      return newState;
    });
  };

  const handleViewDetail = useCallback((item: any) => {
    const id = item.id_lugar || item.id_pyme || item.id;
    router.push(`/places/${id}`);
  }, [router]);

  const handleMarkerClick = (item: any) => {
    if (onSelectEntity) onSelectEntity(item);
  };

  return (
    <div className="w-full h-full relative rounded-3xl overflow-hidden shadow-2xl border border-neutral-200 dark:border-border-color bg-neutral-100">
      <MapContainer 
        center={mapCenter} 
        zoom={14} 
        className="w-full h-full z-0"
        zoomControl={false}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapController selectedEntity={selectedEntity} userLocation={userLocation} />
        
        {/* Posición del Usuario */}
        {userLocation && (
          <>
            <Marker position={userLocation} icon={UserIcon}>
              <Popup className="rounded-2xl overflow-hidden">
                <div className="p-2 text-center">
                  <p className="font-black text-blue-600 uppercase text-[10px] tracking-widest mb-1">Tu Ubicación</p>
                  <p className="text-xs font-bold text-neutral-800">Estás aquí ahora</p>
                </div>
              </Popup>
            </Marker>
            <Circle 
                center={userLocation} 
                radius={150} 
                pathOptions={{ fillColor: '#3B82F6', fillOpacity: 0.1, color: '#3B82F6', weight: 1, dashArray: '5, 5' }} 
            />
          </>
        )}

        {/* Entidades (Lugares y Pymes) */}
        {entities.map((item, idx) => {
          const lat = item.latitud || item.latitude;
          const lng = item.longitud || item.longitude;
          
          if (!lat || !lng) return null;

          const isPyme = !!item.id_pyme;
          const entityId = item.id_pyme || item.id_lugar || item.id || idx;
          const isSelected = selectedEntity?.id === entityId;

          return (
            <Marker 
              key={`${isPyme ? 'pyme' : 'place'}-${entityId}`} 
              position={[lat, lng]} 
              icon={createCustomIcon(item)}
              eventHandlers={{
                click: () => handleMarkerClick(item)
              }}
            >
              <Popup className="custom-popup" autoPan={true} autoPanPadding={[50, 50]}>
                <div className="w-[240px] overflow-hidden rounded-2xl bg-white dark:bg-bg-secondary">
                  {/* Imagen de cabecera */}
                  <div className="h-28 w-full relative group">
                    {(item.image || item.images?.[0]) ? (
                      <img 
                        src={item.image || item.images[0]} 
                        alt={item.nombre || item.name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-airbnb/20 to-blue-600/20 flex items-center justify-center">
                        <MapPin className="w-8 h-8 text-airbnb/40" />
                      </div>
                    )}
                    <div className="absolute top-2 left-2">
                       <span className="text-[9px] font-black bg-white/90 backdrop-blur-md text-neutral-800 px-2 py-1 rounded-lg shadow-sm uppercase tracking-wider border border-white/20">
                          {item.categoria || item.tipo || 'Lugar'}
                      </span>
                    </div>
                  </div>

                  {/* Contenido */}
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-1 gap-2">
                      <h3 className="font-extrabold text-neutral-900 dark:text-white text-base leading-tight">
                        {item.nombre || item.name}
                      </h3>
                      {item.rating > 0 && (
                        <div className="flex items-center gap-1 bg-neutral-50 dark:bg-neutral-800 px-1.5 py-0.5 rounded-md">
                          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
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
                        className="flex-1 flex items-center justify-center gap-1.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 px-3 py-2.5 rounded-xl text-[11px] font-black transition-all hover:scale-[1.02] active:scale-95 shadow-md"
                      >
                        Ver Ficha
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                      {onOpenReview && (
                        <button 
                          onClick={() => onOpenReview(item)}
                          className="flex-1 flex items-center justify-center gap-1.5 bg-airbnb/10 text-airbnb dark:bg-airbnb/20 px-3 py-2.5 rounded-xl text-[11px] font-black transition-all hover:bg-airbnb hover:text-white active:scale-95 shadow-md"
                        >
                          <Star className="w-3.5 h-3.5" />
                          Calificar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Floating Controls */}
      <div className="absolute top-6 right-6 z-10 flex flex-col gap-2">
        <div className="bg-white/80 dark:bg-bg-secondary/80 backdrop-blur-md p-1.5 rounded-2xl shadow-xl border border-neutral-200 dark:border-border-color flex flex-col gap-1">
            <button 
                onClick={() => mapRef.current?.zoomIn()}
                className="p-2.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-colors text-neutral-600 dark:text-neutral-400"
                title="Aumentar zoom"
            >
                <Plus className="w-5 h-5" />
            </button>
            <div className="h-[1px] bg-neutral-100 dark:bg-neutral-800 mx-1" />
            <button 
                onClick={() => mapRef.current?.zoomOut()}
                className="p-2.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-colors text-neutral-600 dark:text-neutral-400"
                title="Disminuir zoom"
            >
                <Minus className="w-5 h-5" />
            </button>
        </div>
        
        <button 
            onClick={() => {
                if (userLocation) {
                    mapRef.current?.flyTo(userLocation, 16, { duration: 1.5 });
                } else {
                    alert("Obteniendo tu ubicación...");
                }
            }}
            className="bg-white/80 dark:bg-bg-secondary/80 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-neutral-200 dark:border-border-color text-airbnb hover:scale-105 transition-all active:scale-95"
            title="Mi ubicación"
        >
            <Target className="w-5 h-5" />
        </button>
      </div>

      {/* Geolocator Overlay UI */}
      {!userLocation && (
        <div className="absolute top-6 left-6 z-10 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="bg-white/90 dark:bg-bg-secondary/90 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-lg border border-neutral-200 dark:border-border-color flex items-center gap-3">
                <div className="relative">
                    <Loader2 className="w-4 h-4 text-airbnb animate-spin" />
                    <div className="absolute inset-0 bg-airbnb/20 rounded-full animate-ping"></div>
                </div>
                <span className="text-xs font-black text-neutral-700 dark:text-neutral-200 uppercase tracking-tight">Localizando posición...</span>
            </div>
        </div>
      )}
      
      {/* Legend */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 hidden md:block transition-all duration-300">
         <div className="bg-white/90 dark:bg-bg-secondary/90 backdrop-blur-md rounded-3xl shadow-2xl border border-neutral-200 dark:border-border-color overflow-hidden">
            <button 
              onClick={toggleLegend}
              className="w-full flex items-center justify-center py-2 bg-neutral-50 dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors border-b border-neutral-200 dark:border-border-color"
              title={isLegendOpen ? "Ocultar Leyenda" : "Mostrar Leyenda"}
            >
              <div className="w-12 h-1 bg-neutral-300 dark:bg-neutral-600 rounded-full mb-1" />
              {isLegendOpen ? <ChevronDown className="w-4 h-4 text-neutral-400 absolute right-4" /> : <ChevronUp className="w-4 h-4 text-neutral-400 absolute right-4" />}
              {!isLegendOpen && <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mx-2">Leyenda</span>}
            </button>
            
            <div className={`transition-all duration-300 ease-in-out ${isLegendOpen ? 'max-h-96 opacity-100 px-6 py-4' : 'max-h-0 opacity-0 px-6 py-0'}`}>
              <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-center gap-4">
                      <div className="flex items-center gap-1.5">
                          <div className="w-4 h-4 rounded-full bg-neutral-400 shadow-sm" style={{ border: '2px dashed white', boxSizing: 'border-box' }} />
                          <span className="text-[10px] font-black text-neutral-600 uppercase tracking-tight">Pyme (Establecimiento)</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                          <div className="w-4 h-4 rounded-full bg-neutral-400 shadow-sm border-2 border-white" />
                          <span className="text-[10px] font-black text-neutral-600 uppercase tracking-tight">Lugar (Punto de Interés)</span>
                      </div>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pt-2.5 border-t border-neutral-100 dark:border-neutral-800 w-full">
                      <div className="flex items-center gap-1.5">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#3B82F6' }} />
                          <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-tight">Gastro</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#10B981' }} />
                          <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-tight">Hospedaje</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#EAB308' }} />
                          <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-tight">Naturaleza</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#8B5CF6' }} />
                          <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-tight">Cultura</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#EC4899' }} />
                          <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-tight">Comercio</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#F97316' }} />
                          <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-tight">Recreación</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#64748B' }} />
                          <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-tight">Servicios</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#FF385C' }} />
                          <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-tight">Turismo</span>
                      </div>
                  </div>
              </div>
            </div>
         </div>
      </div>
    </div>
  );
}

// Estilos globales para Leaflet Popups
const styles = `
  .custom-popup .leaflet-popup-content-wrapper {
    padding: 0;
    overflow: hidden;
    border-radius: 20px;
    background: transparent;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
  }
  .custom-popup .leaflet-popup-content {
    margin: 0;
    width: 240px !important;
  }
  .custom-popup .leaflet-popup-tip-container {
    display: none;
  }
  .custom-popup .leaflet-popup-close-button {
    color: #fff !important;
    background: rgba(0,0,0,0.2) !important;
    border-radius: 50% !important;
    width: 24px !important;
    height: 24px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    margin: 10px !important;
    backdrop-filter: blur(4px) !important;
    z-index: 10 !important;
  }
`;

if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
}
