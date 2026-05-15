import { useState, useEffect, useCallback } from 'react';
import { getPlaces, getNearbyPlaces } from '@/services/api';
import { Place } from '@/types/place';

/**
 * Hook para gestionar la carga y filtrado de lugares desde la API.
 */
export const usePlaces = () => {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlaces = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPlaces();
      setPlaces(data);
    } catch (err) {
      console.error('Error fetching places:', err);
      setError('No se pudieron cargar los lugares turísticos.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchNearby = useCallback(async (lat: number, lng: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getNearbyPlaces(lat, lng, 2); // 2km de radio
      setPlaces(data);
    } catch (err) {
      console.error('Error fetching nearby places:', err);
      setError('No se pudieron cargar los lugares cercanos.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlaces();
  }, [fetchPlaces]);

  return { places, loading, error, fetchPlaces, fetchNearby };
};
