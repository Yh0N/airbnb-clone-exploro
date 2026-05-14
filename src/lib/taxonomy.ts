/**
 * Taxonomía de categorías y subcategorías para Lugares y PYMEs en Exploro.
 * Usada en CreatePlaceModal y CreatePymeModal para mantener consistencia.
 */

export interface SubcategoriaOption {
  value: string;
  label: string;
}

export interface CategoriaOption {
  value: string;
  label: string;
  emoji: string;
  subcategorias: SubcategoriaOption[];
}

// ─── TAXONOMÍA PARA LUGARES ──────────────────────────────────────────────────
export const CATEGORIAS_LUGAR: CategoriaOption[] = [
  {
    value: 'gastronomia',
    label: 'Gastronomía',
    emoji: '🍽️',
    subcategorias: [
      { value: 'restaurante', label: '🍴 Restaurante' },
      { value: 'cafeteria', label: '☕ Cafetería' },
      { value: 'panaderia', label: '🥐 Panadería' },
      { value: 'comida_tipica', label: '🫕 Comida típica' },
    ],
  },
  {
    value: 'hospedaje',
    label: 'Hospedaje',
    emoji: '🏨',
    subcategorias: [
      { value: 'hotel', label: '🏨 Hotel' },
      { value: 'hostal', label: '🛏️ Hostal' },
      { value: 'cabana', label: '🏡 Cabaña' },
      { value: 'apartahotel', label: '🏢 Apartahotel' },
    ],
  },
  {
    value: 'naturaleza',
    label: 'Naturaleza',
    emoji: '🌿',
    subcategorias: [
      { value: 'parque', label: '🌳 Parque' },
      { value: 'mirador', label: '🔭 Mirador' },
      { value: 'laguna', label: '🏞️ Laguna / Lago' },
      { value: 'sendero', label: '🥾 Sendero' },
      { value: 'termal', label: '♨️ Termal' },
    ],
  },
  {
    value: 'cultura',
    label: 'Cultura',
    emoji: '🏛️',
    subcategorias: [
      { value: 'museo', label: '🏛️ Museo' },
      { value: 'iglesia', label: '⛪ Iglesia / Catedral' },
      { value: 'monumento', label: '🗿 Monumento' },
      { value: 'plaza', label: '🏙️ Plaza' },
      { value: 'historico', label: '📜 Sitio histórico' },
    ],
  },
  {
    value: 'comercio',
    label: 'Comercio',
    emoji: '🛍️',
    subcategorias: [
      { value: 'artesanias', label: '🎨 Artesanías' },
      { value: 'tienda_local', label: '🏪 Tienda local' },
      { value: 'centro_comercial', label: '🏬 Centro comercial' },
      { value: 'mercado', label: '🧺 Mercado' },
    ],
  },
  {
    value: 'recreacion',
    label: 'Recreación',
    emoji: '🎡',
    subcategorias: [
      { value: 'parque_recreativo', label: '🎢 Parque recreativo' },
      { value: 'evento', label: '🎪 Evento / Festival' },
      { value: 'deporte', label: '⚽ Deporte / Aventura' },
      { value: 'zona_familiar', label: '👨‍👩‍👧 Zona familiar' },
    ],
  },
  {
    value: 'servicios',
    label: 'Servicios',
    emoji: '🏥',
    subcategorias: [
      { value: 'hospital', label: '🏥 Hospital / Clínica' },
      { value: 'farmacia', label: '💊 Farmacia' },
      { value: 'transporte', label: '🚌 Terminal / Transporte' },
      { value: 'parqueadero', label: '🅿️ Parqueadero' },
    ],
  },
];

// ─── TAXONOMÍA PARA PYMES ─────────────────────────────────────────────────────
export const CATEGORIAS_PYME: CategoriaOption[] = [
  {
    value: 'gastronomia',
    label: 'Gastronomía',
    emoji: '🍽️',
    subcategorias: [
      { value: 'restaurante', label: '🍴 Restaurante' },
      { value: 'cafeteria', label: '☕ Cafetería' },
      { value: 'panaderia', label: '🥐 Panadería' },
      { value: 'comida_tipica', label: '🫕 Comida típica' },
    ],
  },
  {
    value: 'hospedaje',
    label: 'Hospedaje',
    emoji: '🏨',
    subcategorias: [
      { value: 'hotel', label: '🏨 Hotel' },
      { value: 'hostal', label: '🛏️ Hostal' },
      { value: 'cabana', label: '🏡 Cabaña' },
      { value: 'apartahotel', label: '🏢 Apartahotel' },
    ],
  },
  {
    value: 'turismo',
    label: 'Turismo & Tours',
    emoji: '🧭',
    subcategorias: [
      { value: 'agencia_viajes', label: '✈️ Agencia de viajes' },
      { value: 'guia_turistica', label: '🗺️ Guía turística' },
      { value: 'tour_operadora', label: '🚐 Tour operadora' },
      { value: 'alquiler_equipos', label: '⛺ Alquiler de equipos' },
    ],
  },
  {
    value: 'comercio',
    label: 'Comercio',
    emoji: '🛍️',
    subcategorias: [
      { value: 'artesanias', label: '🎨 Artesanías' },
      { value: 'tienda_local', label: '🏪 Tienda local' },
      { value: 'minimercado', label: '🧺 Minimercado' },
    ],
  },
  {
    value: 'servicios',
    label: 'Servicios',
    emoji: '🔧',
    subcategorias: [
      { value: 'transporte', label: '🚌 Transporte' },
      { value: 'parqueadero', label: '🅿️ Parqueadero' },
      { value: 'servicio_local', label: '🔧 Servicio local' },
    ],
  },
];

// ─── UTILIDADES ───────────────────────────────────────────────────────────────

/** Devuelve la configuración de una categoría por su value */
export const getCategoriaConfig = (value: string, tipo: 'lugar' | 'pyme') => {
  const lista = tipo === 'pyme' ? CATEGORIAS_PYME : CATEGORIAS_LUGAR;
  return lista.find((c) => c.value === value) ?? null;
};

/** Devuelve el label de una subcategoría dado categoría + subcategoría */
export const getSubcategoriaLabel = (
  categoria: string,
  subcategoria: string,
  tipo: 'lugar' | 'pyme'
) => {
  const cat = getCategoriaConfig(categoria, tipo);
  if (!cat) return subcategoria;
  return cat.subcategorias.find((s) => s.value === subcategoria)?.label ?? subcategoria;
};
