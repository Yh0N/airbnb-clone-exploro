'use client';

import React, { useState, useEffect } from 'react';
import { Map, MapMarker, MarkerContent, useMap } from '@/components/ui/map';
import { MapPin } from 'lucide-react';

interface LocationPickerMapProps {
  position: { lat: number; lng: number } | null;
  onPositionChange: (pos: { lat: number; lng: number }) => void;
  height?: string;
}

function LocationMarker({ position, onPositionChange }: { position: { lat: number; lng: number } | null, onPositionChange: (pos: { lat: number; lng: number }) => void }) {
  const { map } = useMap();
  
  useEffect(() => {
    if (!map) return;
    
    const handleClick = (e: any) => {
      onPositionChange({ lat: e.lngLat.lat, lng: e.lngLat.lng });
    };
    
    map.on('click', handleClick);
    
    return () => {
      map.off('click', handleClick);
    };
  }, [map, onPositionChange]);

  useEffect(() => {
    if (map && position) {
      map.flyTo({ center: [position.lng, position.lat] });
    }
  }, [position, map]);

  return position === null ? null : (
    <MapMarker latitude={position.lat} longitude={position.lng}>
      <MarkerContent>
        <div className="text-airbnb relative -top-4 shadow-xl shadow-airbnb/20 rounded-full animate-bounce">
            <MapPin className="w-8 h-8 fill-current text-white stroke-airbnb stroke-2" />
        </div>
      </MarkerContent>
    </MapMarker>
  );
}

function UserLocationMarker() {
  const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(null);
  const { map } = useMap();

  useEffect(() => {
    if (!map) return;
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = { lat: position.coords.latitude, lng: position.coords.longitude };
          setUserPos(coords);
          map.flyTo({ center: [coords.lng, coords.lat], zoom: 16 });
        },
        (error) => {
          console.error("Error obteniendo ubicación:", error);
        }
      );
    }
  }, [map]);

  return userPos ? (
    <MapMarker latitude={userPos.lat} longitude={userPos.lng}>
      <MarkerContent>
        <div className="relative flex items-center justify-center">
            <div className="absolute w-8 h-8 bg-blue-500 rounded-full animate-ping opacity-20"></div>
            <div className="relative w-5 h-5 bg-blue-500 rounded-full border-[3px] border-white shadow-xl"></div>
        </div>
      </MarkerContent>
    </MapMarker>
  ) : null;
}

export default function LocationPickerMap({ position, onPositionChange, height = "350px" }: LocationPickerMapProps) {
  const defaultCenter = [-77.2811, 1.2136]; // Pasto, Nariño [lng, lat]
  
  const [viewport, setViewport] = useState({
    center: position ? [position.lng, position.lat] as [number, number] : defaultCenter as [number, number],
    zoom: 15
  });

  return (
    <div className="w-full rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-700 relative z-0" style={{ height }}>
      <Map
        viewport={viewport}
        onViewportChange={setViewport}
        className="w-full h-full"
      >
        <UserLocationMarker />
        <LocationMarker position={position} onPositionChange={onPositionChange} />
      </Map>
      
      {/* Overlay controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-10 pointer-events-none">
        <div className="bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md px-3 py-2 rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-800 pointer-events-auto">
          <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest flex items-center gap-1.5">
            <MapPin className="w-3 h-3 text-airbnb" />
            Toca el mapa para marcar
          </p>
        </div>
      </div>
    </div>
  );
}
