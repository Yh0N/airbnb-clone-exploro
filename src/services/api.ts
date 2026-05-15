import axios from 'axios';
import { 
  mockPlaces as places, 
  mockUser, 
  experiences, 
  services,
  simulateApiDelay as delay,
  type Place, 
  type User, 
  type Experience, 
  type Service 
} from './mockData';


// Constante temporal mientras no hay backend real
const USE_MOCK = false;

// ===== CONFIGURACIÓN DE AXIOS =====
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para añadir el token de autenticación a cada petición
api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para manejar errores globales (como el 401 Unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Si recibimos un 401 em cualquier petición, el token ha expirado
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        // Redirigir al inicio para forzar re-login si es necesario
        // window.location.href = '/login'; 
      }
    }
    return Promise.reject(error);
  }
);

// ===== MAPPERS (Transformación Backend -> Frontend) =====

const mapUser = (b: any): any => ({
  id: b.id_usuario,
  nombre: b.nombre,
  name: b.nombre,
  descripcion: b.perfil?.biografia || 'Sin biografía',
  email: b.correo,
  avatar: b.perfil?.foto || '',
  rol: b.rol,
  member_since: b.fecha_registro ? new Date(b.fecha_registro).getFullYear().toString() : '2024',
  favorites: b.favorites || [],
  biography: b.perfil?.biografia || '',
  interests: b.preferencias || [],
  rating: b.calificacion_promedio || 0,
  reviews_count: b.numero_reseñas || 0
});

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const resolvePhotoUrl = (url: string): string => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${API_BASE}${url}`;
};

const mapPlace = (b: any): any => ({
  id: b.id_lugar,
  nombre: b.nombre,
  name: b.nombre,
  descripcion: b.descripcion || '',
  description: b.descripcion || '',
  category: b.categoria || 'naturaleza',
  categoria: b.categoria,
  subcategoria: b.subcategoria,
  image: resolvePhotoUrl(b.foto_principal || ''),
  images: (b.fotos || []).map((f: string) => resolvePhotoUrl(f)).filter((f: string) => f),
  price: b.precio ? `$${b.precio.toLocaleString()} COP` : 'Acceso gratuito',
  price_category: b.precio ? `$${b.precio.toLocaleString()} COP` : 'Acceso gratuito',
  rating: b.calificacion_promedio || 0,
  reviews_count: b.numero_reseñas || 0,
  location: b.ubicacion_textual || b.ubicacion || 'Pasto, Nariño',
  latitude: b.latitud || 1.2136,
  longitude: b.longitud || -77.2811,
  id_usuario: b.id_usuario,
  aprobado: b.aprobado,
  features: b.servicios || [],
  host_name: b.host_name || b.pyme?.nombre || 'Anfitrión de Exploro',
  host_since: b.host_since || '2024'
});

const mapExperience = (b: any): Experience => ({
  id: b.id_experiencia || b.id,
  title: b.titulo || b.title,
  category: b.categoria || b.category,
  host: b.anfitrion || b.host,
  image: b.foto || b.image,
  price: b.precio || b.price,
  rating: b.calificacion || b.rating,
  reviews_count: b.numero_reseñas || b.reviews_count,
  duration: b.duracion || b.duration,
  isOriginal: b.es_original || b.isOriginal
});

const mapService = (b: any): Service => ({
  id: b.id_servicio || b.id,
  title: b.titulo || b.title,
  provider: b.proveedor || b.provider,
  category: b.categoria || b.category,
  image: b.foto || b.image,
  price: b.precio || b.price,
  pricingType: b.tipo_cobro || b.pricingType,
  rating: b.calificacion || b.rating,
  reviews_count: b.numero_reseñas || b.reviews_count
});

const mapPyme = (b: any): any => ({
  id: b.id_pyme,
  id_pyme: b.id_pyme,
  nombre: b.nombre,
  descripcion: `Empresa de tipo: ${b.tipo || 'General'}`,
  tipo: b.tipo,
  categoria: b.tipo,
  ubicacion: b.ubicacion_textual || 'Sin ubicación',
  latitud: b.latitud,
  longitud: b.longitud,
  id_usuario: b.id_usuario,
  rating: b.calificacion_promedio || 0,
  reviews_count: b.numero_reseñas || 0,
  aprobado: b.aprobado,
  subcategoria: b.subcategoria,
  image: resolvePhotoUrl(b.foto_principal || ''),
  images: (b.fotos || []).map((f: string) => resolvePhotoUrl(f)).filter((f: string) => f),
});

const mapReview = (b: any): any => ({
  id: b.id_reseña || b.id_resena || b.id_review,
  nombre: b.lugar?.nombre 
    ? `📍 ${b.lugar.nombre}` 
    : (b.pyme?.nombre ? `🏢 ${b.pyme.nombre}` : (b.id_usuario_destino ? `Calificación al usuario` : (b.usuario?.nombre ? `Reseña por ${b.usuario.nombre}` : 'Reseña de Exploro'))),
  descripcion: b.comentarios || b.comentario || (b.id_usuario_destino ? 'Solo calificación' : 'Sin comentario'),
  tipo: `Calificación: ${b.puntuacion || b.calificacion || 0}/5`,
  calificacion: b.puntuacion || b.calificacion,
  id_usuario: b.id_usuario,
  id_lugar: b.id_lugar,
  id_pyme: b.id_pyme,
  id_usuario_destino: b.id_usuario_destino
});

export const createPlaceReview = async (idLugar: number, data: any) => {
    if (USE_MOCK) {
        await delay(500);
        const place = places.find(p => p.id === idLugar);
        if (place) {
            const currentCount = place.reviews_count || 0;
            const currentRating = place.rating || 0;
            const newCount = currentCount + 1;
            const newRating = (currentRating * currentCount + data.puntuacion) / newCount;
            place.reviews_count = newCount;
            place.rating = parseFloat(newRating.toFixed(1));
        }
        return { message: "Reseña creada (Mock)" };
    }
    const response = await api.post(`/places/${idLugar}/reviews`, data);
    return response.data;
};

export const createPymeReview = async (idPyme: number, data: any) => {
    if (USE_MOCK) {
        await delay(500);
        // En el mock las pymes están mezcladas o simuladas, pero podemos simular éxito
        return { message: "Reseña de Pyme creada (Mock)" };
    }
    const response = await api.post(`/pymes/${idPyme}/reviews`, data);
    return response.data;
};

export const createUserReview = async (idUsuario: number, data: any) => {
    if (USE_MOCK) {
        await delay(500);
        if (mockUser.id === idUsuario) {
            const currentCount = mockUser.reviews_count || 0;
            const currentRating = mockUser.rating || 0;
            const newCount = currentCount + 1;
            const newRating = (currentRating * currentCount + data.puntuacion) / newCount;
            mockUser.reviews_count = newCount;
            mockUser.rating = parseFloat(newRating.toFixed(1));
        }
        return { message: "Reseña de Usuario creada (Mock)" };
    }
    const response = await api.post(`/users/${idUsuario}/reviews`, data);
    return response.data;
};

export const login = async (credentials: any) => {
  if (USE_MOCK) {
    await delay(800);
    if (credentials.email && credentials.password) {
      localStorage.setItem('auth_token', 'mock-jwt-token-123');
      return { token: 'mock-jwt-token-123', user: mockUser };
    }
    throw new Error('Credenciales inválidas');
  }
  const response = await api.post('/auth/login', {
    correo: credentials.email, 
    contraseña: credentials.password
  });
  
  const token = response.data.access_token;
  if (token) {
    localStorage.setItem('auth_token', token);
    // Obtener el perfil real
    const userResponse = await api.get('/users/me', {
        headers: { Authorization: `Bearer ${token}` }
    });
    return { token, user: mapUser(userResponse.data) };
  }
  return response.data;
};

export const register = async (userData: any) => {
  if (USE_MOCK) {
    await delay(1000);
    return { token: 'mock-jwt-token-new', user: { ...mockUser, name: userData.name, email: userData.email } };
  }
  
  // 1. Registrar al usuario con los campos que espera el backend
  await api.post('/auth/register', {
    nombre: userData.name,
    correo: userData.email,
    contraseña: userData.password,
    preferencias: userData.preferencias || [],
    rol: userData.rol || 1,
    telefono: userData.telefono
  });

  // 2. Hacer login automático para obtener el token y el perfil completo
  return await login({
    email: userData.email,
    password: userData.password
  });
};

export const getProfile = async () => {
  if (USE_MOCK) {
    await delay(500);
    return mockUser;
  }
  const response = await api.get('/users/me');
  return mapUser(response.data);
};

export const getUserPublicProfile = async (userId: number) => {
  if (USE_MOCK) {
    await delay(500);
    return mockUser;
  }
  const response = await api.get(`/users/${userId}`);
  return mapUser(response.data);
};

export const updateProfile = async (data: any) => {
  if (USE_MOCK) {
    await delay(800);
    return { ...mockUser, ...data };
  }
  const response = await api.put('/users/me', data);
  return mapUser(response.data);
};

export const toggleFavorite = async (placeId: number) => {
  if (USE_MOCK) {
    await delay(400);
    const newFavorites = mockUser.favorites?.includes(placeId)
      ? mockUser.favorites.filter((id) => id !== placeId)
      : [...(mockUser.favorites || []), placeId];
    mockUser.favorites = newFavorites;
    return { favorites: newFavorites };
  }
  const response = await api.post(`/users/me/favorites/${placeId}`);
  return response.data;
};

export const getPlaces = async (search?: string, category?: string): Promise<Place[]> => {
  if (USE_MOCK) {
    await delay(800);
    let results = [...places];
    if (category && category !== 'all') {
      results = results.filter((p: Place) => p.category.toLowerCase() === category.toLowerCase());
    }
    if (search) {
      const q = search.toLowerCase();
      results = results.filter((p: Place) => 
        p.name.toLowerCase().includes(q) || 
        p.location.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    }
    return results;
  }
  const params: any = {};
  if (category && category !== 'all') {
    params.categoria = category;
  }
  if (search) {
    params.search = search; // El backend parece no tener este parámetro aún en list_places, pero lo dejamos por si acaso
  }
  
  const response = await api.get('/places', { params });
  return response.data.map(mapPlace);
};

export const getNearbyPlaces = async (lat: number, lng: number, radiusKm: number = 1): Promise<Place[]> => {
  if (USE_MOCK) {
    await delay(600);
    return places.slice(0, 3);
  }
  const response = await api.get('/places/nearby', { 
    params: { 
      latitud: lat, 
      longitud: lng, 
      radio_km: radiusKm 
    } 
  });
  return response.data.map(mapPlace);
};

export const getPlace = async (id: number): Promise<Place | null> => {
  if (USE_MOCK) {
    await delay(600);
    const place = places.find((p: Place) => p.id === id);
    if (!place) throw new Error('Place not found');
    return place;
  }
  const response = await api.get(`/places/${id}`);
  return mapPlace(response.data);
};

export const getExperiences = async (category?: string): Promise<Experience[]> => {
  if (USE_MOCK) {
    await delay(600);
    if (category && category !== 'all') {
      return experiences.filter(exp => exp.category.toLowerCase() === category.toLowerCase());
    }
    return experiences;
  }
  const response = await api.get('/experiences', { params: { category } });
  return (response.data as any[]).map(mapExperience);
};

export const getServices = async (category?: string): Promise<Service[]> => {
  if (USE_MOCK) {
    await delay(600);
    if (category && category !== 'all') {
      return services.filter(srv => srv.category.toLowerCase() === category.toLowerCase());
    }
    return services;
  }
  const response = await api.get('/services', { params: { category } });
  return (response.data as any[]).map(mapService);
};

export const loginSocial = async (provider: 'google' | 'facebook', rol: number = 1) => {
    if (USE_MOCK) {
        await delay(1500);
        return {
            token: 'mock_social_token',
            user: {
                id: 999,
                name: `Usuario ${provider === 'google' ? 'Google' : 'Facebook'}`,
                email: `social@${provider}.com`,
                rol: 1,
                favorites: [],
                biography: 'Usuario autenticado vía redes sociales.'
            }
        };
    }
    // En producción, aquí se enviaría el token de Google/FB al backend
    const response = await api.post('/auth/social-login', { 
        provider,
        rol,
        nombre: `Usuario ${provider.charAt(0).toUpperCase() + provider.slice(1)}`,
        correo: `social_${provider}@exploro.com` 
    });
    
    const token = response.data.access_token;
    if (token) {
        localStorage.setItem('auth_token', token);
        // Obtener el perfil real del usuario recién autenticado
        const userResponse = await api.get('/users/me', {
            headers: { Authorization: `Bearer ${token}` }
        });
        return { token, user: mapUser(userResponse.data) };
    }
    
    return response.data;
};

// ===== CRUD USUARIOS =====
export const getAllUsers = async () => {
    if (USE_MOCK) return [mockUser];
    const response = await api.get('/admin/users');
    return (response.data as any[]).map(mapUser);
};

export const deleteUser = async (id: number) => {
    if (USE_MOCK) return { message: 'Usuario eliminado (Mock)' };
    const response = await api.delete(`/admin/users/${id}`);
    return response.data;
};

// ===== CRUD LUGARES =====
export const getAllPlacesAdmin = async () => {
    if (USE_MOCK) return places;
    const response = await api.get('/admin/all-places');
    return (response.data as any[]).map(mapPlace);
};

export const getAllPlaces = async () => {
    if (USE_MOCK) return places;
    const response = await api.get('/places');
    return (response.data as any[]).map(mapPlace);
};

export const getPendingPymes = async () => {
    if (USE_MOCK) return [];
    const response = await api.get('/admin/pymes/pending');
    return (response.data as any[]).map(mapPyme);
};

export const createPlace = async (data: any) => {
    if (USE_MOCK) return { ...data, id: Math.random() };
    const response = await api.post('/places', data);
    return response.data;
};

export const updatePlace = async (id: number, data: any) => {
    if (USE_MOCK) return { ...data, id };
    const response = await api.put(`/places/${id}`, data);
    return response.data;
};

export const deletePlace = async (id: number) => {
    if (USE_MOCK) return { message: 'Eliminado (Mock)' };
    const response = await api.delete(`/places/${id}`);
    return response.data;
};



export const approvePyme = async (id: number) => {
    if (USE_MOCK) return { message: 'Pyme Aprobada (Mock)' };
    const response = await api.put(`/admin/pymes/${id}/approve`);
    return response.data;
};

// ===== CRUD PYMES =====
export const getAllPymes = async () => {
    if (USE_MOCK) return [{ id: 1, nombre: 'Pyme Mock', tipo: 'Restaurante' }];
    const response = await api.get('/pymes');
    return (response.data as any[]).map(mapPyme); 
};

export const deletePyme = async (id: number) => {
    if (USE_MOCK) return { message: 'Pyme eliminada (Mock)' };
    const response = await api.delete(`/pymes/${id}`);
    return response.data;
};

export const createPyme = async (data: any) => {
    if (USE_MOCK) return { ...data, id: 1 };
    const response = await api.post('/pymes', data);
    return response.data;
};

export const updatePyme = async (id: number, data: any) => {
    if (USE_MOCK) return { ...data, id };
    const response = await api.put(`/pymes/${id}`, data);
    return response.data;
};

// ===== CRUD RESEÑAS =====
export const getPlaceReviews = async (placeId: number) => {
    if (USE_MOCK) return [];
    const response = await api.get(`/places/${placeId}/reviews`);
    return response.data;
};

export const getPymeReviews = async (pymeId: number) => {
    if (USE_MOCK) return [];
    const response = await api.get(`/pymes/${pymeId}/reviews`);
    return response.data;
};

export const getAllReviewsAdmin = async () => {
    if (USE_MOCK) return [];
    const response = await api.get('/admin/all-reviews');
    return (response.data as any[]).map(mapReview);
};

export const deleteReview = async (id: number) => {
    if (USE_MOCK) return { message: 'Reseña eliminada (Mock)' };
    const response = await api.delete(`/reviews/${id}`);
    return response.data;
};

export const updateReview = async (id: number, data: any) => {
    if (USE_MOCK) {
        await delay(500);
        return { message: 'Reseña actualizada (Mock)' };
    }
    const response = await api.put(`/reviews/${id}`, data);
    return response.data;
};

// ===== RECOMENDACIONES =====
export const getRecommendations = async (lat?: number, lng?: number) => {
    if (USE_MOCK) return [];
    let url = '/recommendations';
    if (lat !== undefined && lng !== undefined) {
        url += `?latitud=${lat}&longitud=${lng}`;
    }
    const response = await api.get(url);
    return (response.data as any[]).map(mapPlace);
};

export const getPopularPlaces = async () => {
    if (USE_MOCK) return [];
    const response = await api.get('/recommendations/popular');
    return (response.data as any[]).map(mapPlace);
};

export const getNearbyRecommendations = async (lat: number, lng: number) => {
    if (USE_MOCK) return [];
    const response = await api.get(`/recommendations/nearby?latitud=${lat}&longitud=${lng}`);
    return (response.data as any[]).map(mapPlace);
};

// ===== GESTIÓN DE ARCHIVOS / FOTOS (RF12) =====
export const uploadPhoto = async (entityType: 'place' | 'pyme', entityId: number, file: File) => {
    if (USE_MOCK) return { url: 'https://via.placeholder.com/800', id_imagen: 123 };
    const formData = new FormData();
    formData.append('file', file);
    
    // El backend usa 'lugares' o 'pymes' en la ruta
    const endpoint = entityType === 'place' ? 'lugares' : 'pymes';
    
    const response = await api.post(`/api/v1/imagenes/${endpoint}/${entityId}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const deletePhoto = async (imageId: number) => {
    if (USE_MOCK) return { message: 'Imagen eliminada (Mock)' };
    const response = await api.delete(`/api/v1/imagenes/${imageId}`);
    return response.data;
};

export const deleteLegacyPhoto = async (entityType: 'place' | 'pyme', entityId: number, url: string) => {
    if (USE_MOCK) return { message: 'Imagen legacy eliminada (Mock)' };
    const endpoint = entityType === 'place' ? 'lugar' : 'pyme';
    const response = await api.delete(`/api/v1/imagenes/legacy`, {
        params: {
            entity_type: endpoint,
            entity_id: entityId,
            url_to_delete: url
        }
    });
    return response.data;
};

export const getEntityImages = async (entityType: 'place' | 'pyme', entityId: number) => {
    if (USE_MOCK) return [];
    const endpoint = entityType === 'place' ? 'lugares' : 'pymes';
    const response = await api.get(`/api/v1/imagenes/${endpoint}/${entityId}`);
    return response.data; // Lista de ImagenResponse
};

// Exportar la instancia de axios por si se necesita en otro lugar
export { api };
