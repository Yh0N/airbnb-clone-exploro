'use client';

import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

interface MapPickerProps {
  lat: number;
  lng: number;
  onChange: (lat: number, lng: number) => void;
}

const PASTO_CENTER: [number, number] = [-77.2811, 1.2136];

export default function MapPicker({ lat, lng, onChange }: MapPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);

  const isDark =
    typeof document !== 'undefined' &&
    document.documentElement.classList.contains('dark');

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const center: [number, number] = lat && lng ? [lng, lat] : PASTO_CENTER;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: isDark
        ? 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'
        : 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
      center,
      zoom: lat && lng ? 15 : 13,
    });

    mapRef.current = map;

    // Marker arrastrable
    const marker = new maplibregl.Marker({ color: '#e11d48', draggable: true })
      .setLngLat(center)
      .addTo(map);

    markerRef.current = marker;

    marker.on('dragend', () => {
      const { lat: newLat, lng: newLng } = marker.getLngLat();
      onChange(Math.round(newLat * 1e6) / 1e6, Math.round(newLng * 1e6) / 1e6);
    });

    // Click en el mapa mueve el marcador
    map.on('click', (e) => {
      const { lat: newLat, lng: newLng } = e.lngLat;
      marker.setLngLat([newLng, newLat]);
      onChange(Math.round(newLat * 1e6) / 1e6, Math.round(newLng * 1e6) / 1e6);
    });

    map.addControl(new maplibregl.NavigationControl(), 'top-right');

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []);

  // Sincronizar marcador cuando lat/lng cambian externamente (GPS)
  useEffect(() => {
    if (!markerRef.current || !mapRef.current || !lat || !lng) return;
    markerRef.current.setLngLat([lng, lat]);
    mapRef.current.flyTo({ center: [lng, lat], zoom: 15, duration: 800 });
  }, [lat, lng]);

  return (
    <div className="space-y-2">
      <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">
        Toca el mapa o arrastra el marcador para ajustar la posición
      </p>
      <div
        ref={containerRef}
        className="w-full h-64 rounded-2xl overflow-hidden border-2 border-neutral-200 dark:border-neutral-700"
      />
    </div>
  );
}
