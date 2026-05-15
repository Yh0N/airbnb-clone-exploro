import { useState, useCallback } from 'react';

interface GeolocationState {
  coords: { lat: number; lng: number } | null;
  error: string | null;
  loading: boolean;
}

/**
 * Hook para obtener la ubicación actual del usuario usando navigator.geolocation.
 */
export const useGeolocation = () => {
  const [state, setState] = useState<GeolocationState>({
    coords: null,
    error: null,
    loading: false,
  });

  const getPosition = useCallback(() => {
    if (!navigator.geolocation) {
      setState(prev => ({ ...prev, error: 'La geolocalización no está soportada por tu navegador' }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          coords: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          },
          loading: false,
          error: null,
        });
      },
      (error) => {
        let errorMsg = 'Error al obtener la ubicación';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMsg = 'Permiso de ubicación denegado';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMsg = 'Información de ubicación no disponible';
            break;
          case error.TIMEOUT:
            errorMsg = 'Tiempo de espera agotado al obtener ubicación';
            break;
        }
        setState(prev => ({ ...prev, error: errorMsg, loading: false }));
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  }, []);

  return { ...state, getPosition };
};
