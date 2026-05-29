// Interface para los lugares turísticos de Exploro
export interface Place {
  id: number;
  nombre?: string;
  name?: string; // Alias para compatibilidad
  descripcion?: string;
  description?: string; // Alias para compatibilidad
  categoria?: string;
  category?: string; // Alias para compatibilidad
  latitud?: number;
  latitude?: number; // Alias para compatibilidad
  longitud?: number;
  longitude?: number; // Alias para compatibilidad
  calificacion_promedio?: number;
  rating?: number; // Alias para compatibilidad
  numero_reseñas?: number;
  reviews_count?: number; // Alias para compatibilidad
  foto_principal?: string;
  image?: string; // Alias para compatibilidad
  fotos?: string[];
  images?: string[];
  ubicacion_textual?: string;
  id_usuario?: number;
  servicios?: string[];
  features?: string[];
  telefono?: string;
  whatsapp?: string;
  location?: string;
  id_pyme?: number;
  subcategoria?: string;
  subcategory?: string;
  host_name?: string;
  host_since?: string;
  price?: number | string;
  price_category?: string;
}

export type Category = 'Todos' | 'Gastronomía' | 'Cultura' | 'Naturaleza' | 'Religioso';
