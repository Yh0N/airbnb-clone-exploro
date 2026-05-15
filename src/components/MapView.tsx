'use client';

import React, { useState } from 'react';
import { Map, MapMarker, MarkerContent, MarkerPopup, MapControls } from '@/components/ui/map';
import { MapPin } from 'lucide-react';

interface MapViewProps {
  latitude: number;
  longitude: number;
  name: string;
}

export default function MapView({ latitude, longitude, name }: MapViewProps) {
  const [viewport, setViewport] = useState({
    center: [longitude, latitude] as [number, number],
    zoom: 14
  });

  return (
    <div className="w-full h-full rounded-xl z-0 overflow-hidden relative">
      <Map
        viewport={viewport}
        onViewportChange={setViewport}
        className="w-full h-full"
      >
        <MapControls showZoom position="top-right" className="mr-2 mt-2" />
        <MapMarker latitude={latitude} longitude={longitude}>
          <MarkerContent>
            <div className="flex items-center justify-center rounded-full shadow-lg transform transition-all hover:scale-125 w-10 h-10 bg-airbnb border-2 border-white">
              <MapPin className="w-6 h-6 text-white" />
            </div>
          </MarkerContent>
          <MarkerPopup className="rounded-xl font-bold p-3 text-center border-none shadow-xl">
            {name}
          </MarkerPopup>
        </MapMarker>
      </Map>
    </div>
  );
}
