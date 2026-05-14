// ===== DATOS MOCK - LUGARES TURÍSTICOS DE PASTO, COLOMBIA =====
// Estos datos simulan la respuesta de la API REST (FastAPI)
// Cuando la API esté lista, se reemplazarán por llamadas reales

export interface Place {
  id: number;
  name: string;
  nombre?: string; // Standardized alias for Dashboard
  category: string;
  image: string; // legacy root image
  images: string[];
  price: string;
  price_category: string;
  rating: number;
  reviews_count: number;
  location: string;
  latitude: number;
  longitude: number;
  description: string;
  descripcion?: string; // Standardized alias for Dashboard
  features: string[];
  host_name: string;
  host_since: string;
  aprobado?: boolean;
  id_usuario?: number;
}

export interface Experience {
  id: number;
  title: string;
  category: string;
  host: string;
  image: string;
  price: string;
  rating: number;
  reviews_count: number;
  duration: string;
  isOriginal: boolean;
}

export interface Service {
  id: number;
  title: string;
  provider: string;
  category: string;
  image: string;
  price: string;
  pricingType: 'per_hour' | 'per_person' | 'per_group';
  rating: number;
  reviews_count: number;
}


export interface User {
  id: number;
  name: string;
  nombre?: string; // Standardized alias for Dashboard
  email: string;
  avatar: string;
  rol: number; // 1: Regular, 2: Pyme, 3: Admin
  member_since: string;
  favorites: number[];
  biography?: string;
  descripcion?: string; // Standardized alias for Dashboard
  interests?: string[];
  rating?: number;
  reviews_count?: number;
}

// ===== CATEGORÍAS =====
export const categories = [
  { id: 'all', name: 'Todos', icon: '🌎' },
  { id: 'naturaleza', name: 'Naturaleza', icon: '🏔️' },
  { id: 'cultura', name: 'Cultura', icon: '🏛️' },
  { id: 'gastronomia', name: 'Gastronomía', icon: '🍽️' },
  { id: 'aventura', name: 'Aventura', icon: '🧗' },
  { id: 'religion', name: 'Religioso', icon: '⛪' },
  { id: 'artesania', name: 'Artesanía', icon: '🎨' },
  { id: 'termal', name: 'Termal', icon: '♨️' },
  { id: 'mirador', name: 'Miradores', icon: '🌄' },
  { id: 'historico', name: 'Histórico', icon: '📜' },
  { id: 'lago', name: 'Lagos', icon: '🏞️' },
  { id: 'parque', name: 'Parques', icon: '🌳' },
];

// ===== LUGARES TURÍSTICOS =====
export const mockPlaces: Place[] = [
  {
    id: 1,
    name: 'Cabaña Suiza con vista a la Laguna',
    location: 'El Encano, Nariño',
    description: 'Hermosa cabaña de madera estilo suizo ubicada a las orillas de la Laguna de la Cocha. Despierta con el canto de las aves y una majestuosa vista al lago cubierto de niebla. Ideal para parejas y familias que buscan una escapada romántica o un retiro de paz en la naturaleza. Cuenta con chimenea, muelle privado y kayak incluido.',
    category: 'naturaleza',
    rating: 4.95,
    reviews_count: 128,
    price_category: '$250,000 COP',
    price: '$250,000 COP',
    image: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=800&q=80',
      'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800&q=80',
      'https://images.unsplash.com/photo-1449844908441-8829872d2607?w=800&q=80'
    ],
    latitude: 1.0833,
    longitude: -77.1500,
    features: ['Chimenea', 'Muelle privado', 'Kayak', 'Cocina equipada', 'Wifi'],
    host_name: 'Santiago',
    host_since: '2019',
  },
  {
    id: 2,
    name: 'Apartamento moderno en La Aurora',
    location: 'La Aurora, Pasto',
    description: 'Espectacular apartamento de estreno en uno de los mejores barrios de Pasto. Decoración contemporánea, ventanales de piso a techo con vistas panorámicas de la ciudad y el Volcán Galeras. Cerca de los mejores restaurantes, centros comerciales y zonas seguras para caminar.',
    category: 'ciudad',
    rating: 4.88,
    reviews_count: 85,
    price_category: '$180,000 COP',
    price: '$180,000 COP',
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1e52dbb1b5?w=800&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80'
    ],
    latitude: 1.2185,
    longitude: -77.2785,
    features: ['Ascensor', 'Parqueadero cubierto', 'Smart TV', 'Cocina integral', 'Seguridad 24/7'],
    host_name: 'Marcela',
    host_since: '2021',
  },
  {
    id: 3,
    name: 'Habitación Premium en Centro Histórico',
    location: 'Centro, Pasto',
    description: 'Hospédate en una casona colonial restaurada del siglo XIX, a solo dos cuadras de la Plaza de Nariño. La habitación cuenta con cama king-size, baño en suite con acabados de lujo y un hermoso balcón de hierro forjado con vistas a la iglesia de San Juan Bautista.',
    category: 'historico',
    rating: 4.92,
    reviews_count: 210,
    price_category: '$120,000 COP',
    price: '$120,000 COP',
    image: 'https://images.unsplash.com/photo-1598928506311-c55dd182103f?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1598928506311-c55dd182103f?w=800&q=80',
      'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&q=80',
      'https://images.unsplash.com/photo-1590490359683-658d3d23f972?w=800&q=80'
    ],
    latitude: 1.2136,
    longitude: -77.2811,
    features: ['Cama King', 'Balcón', 'Desayuno de cortesía', 'Wifi de alta velocidad'],
    host_name: 'Fundación Colonial',
    host_since: '2016',
  },
  {
    id: 4,
    name: 'Cabaña Ecológica en La Florida',
    location: 'La Florida, Nariño',
    description: 'Un refugio en medio del bosque alto andino, construido sosteniblemente. Perfecto para desconectarse de la tecnología y conectar con la tierra. Ofrecemos senderos guiados, observación de aves y café local orgánico cultivado en la mima finca.',
    category: 'naturaleza',
    rating: 4.75,
    reviews_count: 64,
    price_category: '$160,000 COP',
    price: '$160,000 COP',
    image: 'https://images.unsplash.com/photo-1449198063792-7d727a810d72?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1449198063792-7d727a810d72?w=800&q=80',
      'https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=800&q=80',
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80'
    ],
    latitude: 1.3000,
    longitude: -77.3167,
    features: ['Energía solar', 'Agua de manantial', 'Desayuno orgánico', 'Senderos privados'],
    host_name: 'Finca El Ensueño',
    host_since: '2020',
  },
  {
    id: 5,
    name: 'Casa Campestre con Piscina Climatizada',
    location: 'Chachagüí, Nariño',
    description: 'A solo 10 minutos del aeropuerto Antonio Nariño, disfruta de un clima templado perfecto. Nuestra casa de campo puede albergar hasta 8 personas, cuenta con piscina privada climatizada, zona BBQ gigante y hermosos jardines llenos de flores. El lugar perfecto para familias.',
    category: 'campo',
    rating: 4.97,
    reviews_count: 156,
    price_category: '$450,000 COP',
    price: '$450,000 COP',
    image: 'https://images.unsplash.com/photo-1542314831-c53cd4caed5a?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1542314831-c53cd4caed5a?w=800&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80',
      'https://images.unsplash.com/photo-1577702312698-c4193551523c?w=800&q=80'
    ],
    latitude: 1.3833,
    longitude: -77.2833,
    features: ['Piscina climatizada', 'Zona BBQ', 'Jardines inmensos', 'Pet-friendly', 'Parqueadero para 4 autos'],
    host_name: 'Camilo',
    host_since: '2017',
  },
  {
    id: 6,
    name: 'Penthouse de Lujo',
    location: 'Palermo, Pasto',
    description: 'Increíble penthouse en el último piso con terraza 360 grados. Jacuzzi al aire libre, acabados en mármol, domótica avanzada para luces y cortinas. La vista hacia la ciudad es incomparable.',
    category: 'lujo',
    rating: 5.0,
    reviews_count: 42,
    price_category: '$600,000 COP',
    price: '$600,000 COP',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
      'https://images.unsplash.com/photo-1600607687931-cebf14210cf4?w=800&q=80',
      'https://images.unsplash.com/photo-1600210492486-724fe5c07fb1?w=800&q=80'
    ],
    latitude: 1.2220,
    longitude: -77.2750,
    features: ['Jacuzzi privado', 'Terraza panorámica', 'Domótica', 'Gimnasio en edificio', 'Chef a petición'],
    host_name: 'Inversiones Sur',
    host_since: '2022',
  },
  {
    id: 7,
    name: 'Loft Industrial para Parejas',
    location: 'Av. Panamericana, Pasto',
    description: 'Espacio de concepto abierto estilo N.Y. con paredes de ladrillo expuesto y ventanales inmensos. Perfectamente diseñado para creativos o parejas de paso. Fácil acceso a las principales vías y locales comerciales.',
    category: 'moderno',
    rating: 4.8,
    reviews_count: 91,
    price_category: '$140,000 COP',
    price: '$140,000 COP',
    image: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800&q=80',
      'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800&q=80',
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80'
    ],
    latitude: 1.2050,
    longitude: -77.2840,
    features: ['Estilo industrial', 'Cocina abierta', 'Espacio de trabajo', 'Cafetera express', 'Estacionamiento'],
    host_name: 'Daniel',
    host_since: '2020',
  },
  {
    id: 8,
    name: 'Casa Tradicional cerca a Las Lajas',
    location: 'Ipiales, Nariño',
    description: 'Una casa acogedora y familiar con chimenea y decoración andina tradicional. A tan solo 15 minutos del impresionante Santuario de Las Lajas. Desayuno campesino incluido y asesoría para cruzar la frontera o hacer turismo religioso.',
    category: 'historico',
    rating: 4.9,
    reviews_count: 275,
    price_category: '$110,000 COP',
    price: '$110,000 COP',
    image: 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80'
    ],
    latitude: 0.8250,
    longitude: -77.6350,
    features: ['Desayuno andino incluido', 'Información turística', 'Chimenea a leña', 'Habitaciones calefaccionadas'],
    host_name: 'Familia Ortega',
    host_since: '2015',
  }
];

// Experiencias Mock Data
export const experiences: Experience[] = [
  {
    id: 1,
    title: 'Clase de Cocina Nariñense Tradicional',
    category: 'Gastronomía',
    host: 'María del Carmen',
    image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=800&auto=format&fit=crop',
    price: '$80,000',
    rating: 4.9,
    reviews_count: 124,
    duration: '3 horas',
    isOriginal: true,
  },
  {
    id: 2,
    title: 'Trekking Extremo al Volcán Galeras',
    category: 'Aventura',
    host: 'Carlos Guía Nativo',
    image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=800&auto=format&fit=crop',
    price: '$120,000',
    rating: 4.7,
    reviews_count: 89,
    duration: '8 horas',
    isOriginal: false,
  },
  {
    id: 3,
    title: 'Taller de Barniz de Pasto (Mopa-Mopa)',
    category: 'Cultura',
    host: 'Maestro Obando',
    image: 'https://images.unsplash.com/photo-1460518451285-84b6daf0151f?q=80&w=800&auto=format&fit=crop',
    price: '$50,000',
    rating: 5.0,
    reviews_count: 231,
    duration: '2 horas',
    isOriginal: true,
  }
];

// Servicios Mock Data
export const services: Service[] = [
  {
    id: 1,
    title: 'Chef Privado de Alta Cena',
    provider: 'Chef Roberto',
    category: 'Gastronomía',
    image: 'https://images.unsplash.com/photo-1583394836262-5eebbc8cb1cd?q=80&w=800&auto=format&fit=crop',
    price: '$200,000',
    pricingType: 'per_group',
    rating: 4.8,
    reviews_count: 45,
  },
  {
    id: 2,
    title: 'Guía Turístico Bilingüe (Inglés/Español)',
    provider: 'Ana Tours',
    category: 'Guianza',
    image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=800&auto=format&fit=crop',
    price: '$50,000',
    pricingType: 'per_hour',
    rating: 4.9,
    reviews_count: 112,
  },
  {
    id: 3,
    title: 'Fotografía Profesional de Viajes',
    provider: 'LensNariño',
    category: 'Fotografía',
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=800&auto=format&fit=crop',
    price: '$150,000',
    pricingType: 'per_person',
    rating: 4.7,
    reviews_count: 89,
  }
];


// ===== USUARIO MOCK =====
export const mockUser: User = {
  id: 1,
  name: 'Juan Pastuso',
  email: 'juan@ejemplo.com',
  avatar: '',
  rol: 3, // Admin por defecto para pruebas
  member_since: '2024',
  favorites: [1, 3, 5, 8],
  rating: 4.9,
  reviews_count: 156,
};

// ===== FUNCIÓN PARA SIMULAR DELAY DE API =====
export const simulateApiDelay = (ms: number = 800): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};
