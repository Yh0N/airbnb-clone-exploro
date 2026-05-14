'use client';

import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Crosshair, MapPin, Check } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const UserIcon = L.divIcon({
  className: 'custom-div-icon',
  html: `<div style="background-color: #3b82f6; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface LocationPickerMapProps {
  position: { lat: number; lng: number } | null;
  onPositionChange: (pos: { lat: number; lng: number }) => void;
  height?: string;
}

function LocationMarker({ position, onPositionChange }: { position: { lat: number; lng: number } | null, onPositionChange: (pos: { lat: number; lng: number }) => void }) {
  const map = useMap();
  
  useMapEvents({
    click(e) {
      onPositionChange(e.latlng);
    },
  });

  useEffect(() => {
    if (position) {
      map.flyTo(position, map.getZoom());
    }
  }, [position, map]);

  return position === null ? null : (
    <Marker position={position} />
  );
}

function UserLocationMarker() {
  const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(null);
  const map = useMap();

  useEffect(() => {
    map.locate().on('locationfound', (e) => {
      setUserPos(e.latlng);
    });
  }, [map]);

  return userPos ? (
    <Marker position={userPos} icon={UserIcon} />
  ) : null;
}

export default function LocationPickerMap({ position, onPositionChange, height = "350px" }: LocationPickerMapProps) {
  const defaultCenter = { lat: 1.2136, lng: -77.2811 }; // Pasto, Nariño

  return (
    <div className="w-full rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-700 relative z-0" style={{ height }}>
      <MapContainer
        center={position || defaultCenter}
        zoom={15}
        className="w-full h-full"
        style={{ zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <UserLocationMarker />
        <LocationMarker position={position} onPositionChange={onPositionChange} />
      </MapContainer>
      
      {/* Overlay controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-[400]">
        <div className="bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md px-3 py-2 rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-800">
          <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest flex items-center gap-1.5">
            <MapPin className="w-3 h-3 text-airbnb" />
            Toca el mapa para marcar
          </p>
        </div>
      </div>

      <style jsx global>{`
        .leaflet-control-zoom {
          border: none !important;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1) !important;
          border-radius: 12px !important;
          overflow: hidden;
        }
        .leaflet-control-zoom-in, .leaflet-control-zoom-out {
          background: white !important;
          color: #444 !important;
          border: none !important;
          width: 36px !important;
          height: 36px !important;
          line-height: 36px !important;
          font-weight: bold !important;
        }
        .dark .leaflet-control-zoom-in, .dark .leaflet-control-zoom-out {
          background: #171717 !important;
          color: white !important;
        }
      `}</style>
    </div>
  );
}
