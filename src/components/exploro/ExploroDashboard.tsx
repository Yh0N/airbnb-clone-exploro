import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import {
  Users,
  MapPin,
  Store,
  MessageSquare,
  Zap,
  Settings,
  Plus,
  Trash2,
  Edit,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Map as MapIcon,
  LayoutList,
  Navigation,
  Star,
  User,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Search,
  X,
  Image as ImageIcon
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import * as api from '@/services/api';
import { getCategoriaConfig } from '@/lib/taxonomy';
import CreatePlaceModal from './CreatePlaceModal';
import CreatePymeModal from './CreatePymeModal';
import CreateReviewModal from './CreateReviewModal';

// Cargar el mapa dinámicamente para evitar errores de SSR con Leaflet
const ExploroMap = dynamic(() => import('./ExploroMap'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-neutral-100 dark:bg-neutral-800 rounded-3xl animate-pulse">
        <Loader2 className="w-8 h-8 animate-spin text-airbnb mb-2" />
        <p className="text-xs font-bold text-neutral-500 italic uppercase">Dibujando cartografía...</p>
    </div>
  )
});

type ManagementType = 'users' | 'places_pymes' | 'reviews' | 'recommendations' | 'approvals' | 'nearby' | 'my_places';
type ViewMode = 'table' | 'map';
type EntityFilter = 'all' | 'places' | 'pymes';
type RecommendationType = 'personalized' | 'popular' | 'nearby';

const ExpandedRowContent = ({ item, isAdmin, router, itemId, onOpenReview }: { item: any, isAdmin: boolean, router: any, itemId: string, onOpenReview: (item: any) => void }) => {
    const [reviews, setReviews] = useState<any[]>([]);
    const [loadingReviews, setLoadingReviews] = useState(true);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                let fetched = [];
                if (item.id_pyme) {
                    fetched = await api.getPymeReviews(item.id_pyme);
                } else if (item.id_lugar || item.id) {
                    fetched = await api.getPlaceReviews(item.id_lugar || item.id);
                }
                setReviews(fetched.slice(0, 3));
            } catch (e) {
                console.error("Error fetching reviews", e);
            } finally {
                setLoadingReviews(false);
            }
        };
        fetchReviews();
    }, [item]);

    return (
        <tr className="bg-white dark:bg-neutral-900 shadow-sm border-t border-neutral-100 dark:border-neutral-800 rounded-b-2xl">
            <td colSpan={4} className="p-6 rounded-b-2xl border-x border-b border-neutral-100 dark:border-neutral-800">
                <div className="flex flex-col md:flex-row gap-6">
                    {/* Image Section */}
                    {(item.avatar || item.image || (item.images && item.images.length > 0)) ? (
                        <div className="w-full md:w-1/3 h-48 rounded-xl overflow-hidden shadow-sm border border-neutral-100 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-800">
                            <img 
                                src={item.avatar || item.image || item.images?.[0]} 
                                alt={item.nombre || item.name} 
                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" 
                            />
                        </div>
                    ) : (
                        <div className="w-full md:w-1/3 h-48 rounded-xl overflow-hidden shadow-sm border border-neutral-100 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                            <ImageIcon className="w-10 h-10 text-neutral-300 dark:text-neutral-600" />
                        </div>
                    )}
                    
                    {/* Info Section */}
                    <div className="flex-1 flex flex-col gap-4">
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <h4 className="text-sm font-bold text-neutral-800 dark:text-white flex items-center gap-2">
                                    <LayoutList className="w-4 h-4 text-airbnb" /> Descripción (Bibliografía)
                                </h4>
                                {isAdmin && (
                                    <div className="px-3 py-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-500 font-mono text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 font-bold shadow-sm" title="ID de Sistema (Solo Admins)">
                                        ID: #{itemId}
                                    </div>
                                )}
                            </div>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed bg-neutral-50 dark:bg-neutral-800/50 p-4 rounded-xl border border-neutral-100 dark:border-neutral-800">
                                {item.descripcion || item.biografia || 'Sin descripción detallada disponible para este elemento.'}
                            </p>
                            
                            {item.razones && item.razones.length > 0 && (
                                <div className="mt-4 flex flex-wrap gap-2">
                                    {item.razones.map((razon: string, idx: number) => (
                                        <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1 bg-airbnb/10 text-airbnb text-[10px] font-bold uppercase tracking-wider rounded-full border border-airbnb/20">
                                            <Zap className="w-3 h-3" />
                                            {razon}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Reseñas Section */}
                        {(!item.id_usuario) && (
                            <div className="mt-2">
                                <h4 className="text-sm font-bold text-neutral-800 dark:text-white mb-2 flex items-center gap-2">
                                    <MessageSquare className="w-4 h-4 text-amber-500" /> Reseñas Recientes
                                </h4>
                                {loadingReviews ? (
                                    <p className="text-xs text-neutral-500">Cargando reseñas...</p>
                                ) : reviews.length > 0 ? (
                                    <div className="flex flex-col gap-2">
                                        {reviews.map((r, i) => (
                                            <div key={i} className="bg-white dark:bg-neutral-800 p-3 rounded-lg border border-neutral-100 dark:border-neutral-700 shadow-sm text-sm">
                                                <div className="flex items-center gap-1 mb-1">
                                                    {[...Array(5)].map((_, idx) => (
                                                        <Star key={idx} className={`w-3 h-3 ${idx < (r.calificacion || r.puntuacion || 0) ? 'fill-amber-400 text-amber-400' : 'text-neutral-300 dark:text-neutral-600'}`} />
                                                    ))}
                                                    <span className="font-semibold text-neutral-700 dark:text-neutral-300 ml-2 text-xs">{r.usuario?.nombre || 'Usuario'}</span>
                                                </div>
                                                <p className="text-neutral-600 dark:text-neutral-400 italic text-xs">"{r.comentarios || r.comentario || 'Sin comentario'}"</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-xs text-neutral-500 italic bg-neutral-50 dark:bg-neutral-800/50 p-3 rounded-lg border border-neutral-100 dark:border-neutral-800">
                                        No hay reseñas todavía.
                                    </p>
                                )}
                            </div>
                        )}
                        
                        {/* Quick Actions / More Info */}
                        <div className="flex flex-wrap gap-3 mt-auto pt-2 border-t border-neutral-100 dark:border-neutral-800">
                            <button 
                                onClick={() => {
                                    if (item.id_pyme) {
                                        router.push(`/pymes/${item.id_pyme}`);
                                    } else if (item.id_lugar || item.id) {
                                        router.push(`/places/${item.id_lugar || item.id}`);
                                    }
                                }}
                                className="flex items-center gap-2 px-4 py-2 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-lg text-sm font-bold hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors"
                            >
                                <MessageSquare className="w-4 h-4" />
                                Ver Página Detallada
                            </button>
                            
                            {item.latitud && item.longitud && (
                                <button 
                                    onClick={() => {
                                        const url = `https://www.google.com/maps/dir/?api=1&destination=${item.latitud},${item.longitud}`;
                                        window.open(url, '_blank');
                                    }}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg text-sm font-bold border border-blue-100 dark:border-blue-900/30 hover:bg-blue-100 transition-colors"
                                >
                                    <Navigation className="w-4 h-4" />
                                    Cómo llegar
                                </button>
                            )}

                            {item.id_pyme && (
                                <button 
                                    onClick={() => {
                                        const phone = "573000000000"; 
                                        const message = encodeURIComponent(`Hola, vi tu negocio "${item.nombre}" en Exploro y me gustaría obtener más información.`);
                                        window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
                                    }}
                                    className="flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-lg text-sm font-bold border border-emerald-100 dark:border-emerald-900/30 hover:bg-emerald-100 transition-colors"
                                >
                                    <MessageSquare className="w-4 h-4" />
                                    WhatsApp
                                </button>
                            )}

                            <button 
                                onClick={() => onOpenReview(item)}
                                className="flex items-center gap-2 px-4 py-2 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-lg text-sm font-bold hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors"
                            >
                                <Star className="w-4 h-4 fill-amber-400" />
                                Calificar
                            </button>
                        </div>
                    </div>
                </div>
            </td>
        </tr>
    );
};

export default function ExploroDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<ManagementType>('places_pymes');
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [entityFilter, setEntityFilter] = useState<EntityFilter>('all');
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
  const [isCreatePlaceOpen, setIsCreatePlaceOpen] = useState(false);
  const [isCreatePymeOpen, setIsCreatePymeOpen] = useState(false);
  const [isCreateReviewOpen, setIsCreateReviewOpen] = useState(false);
  const [reviewTarget, setReviewTarget] = useState<{type: 'place' | 'pyme' | 'user', id: string} | null>(null);
  const [reviewFilter, setReviewFilter] = useState<{type: 'place' | 'pyme' | 'user', id: number, name: string} | null>(null);
  const [selectedEntity, setSelectedEntity] = useState<any>(null);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
  const [nearbyRadius, setNearbyRadius] = useState<number>(1);
  const [recommendationType, setRecommendationType] = useState<RecommendationType>('personalized');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 15;
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<{ 
    isOpen: boolean, 
    title: string, 
    message: string, 
    onConfirm: () => void 
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  // Intentar geolocalizar al usuario al entrar al dashboard
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.error("Error obteniendo ubicación:", error);
        }
      );
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [activeTab, nearbyRadius, recommendationType]);

  const isAdmin = user?.rol === 3;
  const isPyme = user?.rol === 2;

  const fetchData = async () => {
    setIsLoading(true);
    try {
      let result;
      switch (activeTab) {
        case 'users':
          result = await api.getAllUsers();
          break;
        case 'places_pymes':
        case 'my_places': {
          // Si no hay usuario, usar endpoints públicos. Si hay, usar admin para ver más info.
          const canSeeAdmin = !!user;
          const [lugares, pymes] = await Promise.all([
            canSeeAdmin ? api.getAllPlacesAdmin() : api.getAllPlaces(),
            api.getAllPymes(),
          ]);
          result = [...(Array.isArray(lugares) ? lugares : []), ...(Array.isArray(pymes) ? pymes : [])];
          break;
        }
        case 'reviews':
          result = await api.getAllReviewsAdmin();
          break;
        case 'approvals': {
          result = await api.getPendingPymes();
          break;
        }
        case 'nearby': {
          if (userLocation) {
            result = await api.getNearbyPlaces(userLocation[0], userLocation[1], nearbyRadius);
          } else {
            showMsg('Debes permitir el acceso a tu ubicación', 'error');
            setActiveTab('places_pymes');
            return;
          }
          break;
        }
        case 'recommendations':
          if (recommendationType === 'personalized') {
            result = await api.getRecommendations(userLocation?.[0], userLocation?.[1]);
          } else if (recommendationType === 'popular') {
            result = await api.getPopularPlaces();
          } else {
            if (userLocation) {
              result = await api.getNearbyRecommendations(userLocation[0], userLocation[1]);
            } else {
              showMsg('Ubicación necesaria para recomendaciones cercanas', 'error');
              result = [];
            }
          }
          break;
      }
      setData(Array.isArray(result) ? result : [result]);
    } catch (error) {
      console.error('Error fetching data:', error);
      showMsg('Error al cargar datos de la API', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const showMsg = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleDelete = async (item: any) => {
    const id = item.id || item.id_usuario || item.id_lugar || item.id_pyme || item.id_resena || item.id_reseña;
    console.log('[Dashboard] Iniciando proceso de eliminación:', { tab: activeTab, id, item });
    
    if (!id) {
        showMsg('No se pudo identificar el ID del elemento', 'error');
        return;
    }

    const entityName = item.id_pyme ? 'pyme' : item.id_lugar ? 'lugar' : activeTab.slice(0, -1);
    
    setConfirmModal({
      isOpen: true,
      title: 'Confirmar Eliminación',
      message: `¿Estás seguro de que deseas eliminar este ${entityName}? Esta acción no se puede deshacer y se borrará permanentemente de la base de datos.`,
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        setIsLoading(true);
        try {
          console.log(`[Dashboard] Llamando a api.delete para ${activeTab}...`);
          let response;
          
          if (activeTab === 'users') {
            response = await api.deleteUser(Number(id));
          } else if (activeTab === 'places_pymes' || activeTab === 'my_places') {
            if (item.id_pyme) {
              response = await api.deletePyme(Number(item.id_pyme));
            } else {
              response = await api.deletePlace(Number(item.id_lugar || item.id));
            }
          } else if (activeTab === 'reviews') {
            response = await api.deleteReview(Number(id));
          }

          console.log('[Dashboard] Respuesta de eliminación:', response);
          showMsg('Eliminado exitosamente', 'success');
          await fetchData();
        } catch (error: any) {
          console.error('[Dashboard] Error crítico al eliminar:', error);
          const errorMessage = error.response?.data?.detail || error.message || 'Error desconocido al eliminar';
          showMsg(typeof errorMessage === 'string' ? errorMessage : 'Error de servidor', 'error');
        } finally {
          setIsLoading(false);
        }
      }
    });
  };

  const getItemEmoji = (item: any) => {
    if (activeTab === 'users') return '👤';
    if (activeTab === 'reviews') return '💬';
    
    const catValue = (item.categoria || item.tipo || '').toLowerCase();
    const isPymeItem = !!item.id_pyme;
    
    const config = getCategoriaConfig(catValue, isPymeItem ? 'pyme' : 'lugar');
    
    if (config) {
      if (item.subcategoria) {
        const subConfig = config.subcategorias.find(s => s.value === item.subcategoria);
        if (subConfig) {
          return subConfig.label.split(' ')[0]; // Extrae el emoji que está al inicio del label
        }
      }
      return config.emoji;
    }
    
    // Fallback si la categoría no está en la taxonomía
    const cat = catValue;
    if (isPymeItem) {
      if (cat.includes('hotel') || cat.includes('alojamiento')) return '🏨';
      if (cat.includes('restaurante') || cat.includes('gastronomia') || cat.includes('comida')) return '🍴';
      if (cat.includes('agencia') || cat.includes('tour') || cat.includes('guia')) return '🧭';
      if (cat.includes('artesania') || cat.includes('tienda')) return '🎨';
      if (cat.includes('transporte')) return '🚐';
      if (cat.includes('cultura') || cat.includes('museo')) return '🏛️';
      return '🏢';
    }
    
    if (cat.includes('naturaleza') || cat.includes('parque') || cat.includes('volcan')) return '🌋';
    if (cat.includes('iglesia') || cat.includes('catedral')) return '⛪';
    if (cat.includes('mirador')) return '🔭';
    if (cat.includes('cascada') || cat.includes('rio')) return '🌊';
    if (cat.includes('restaurante')) return '🍕';
    if (cat.includes('plaza') || cat.includes('parque')) return '🌳';
    
    return '📍';
  };

  const handleApprove = async (id: number) => {
    const key = `approve-${id}`;
    setActionLoadingId(key);
    try {
      await api.approvePyme(id);
      showMsg('Pyme aprobada exitosamente ✓', 'success');
      fetchData();
    } catch (error) {
      showMsg('Error al aprobar', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };



  const filteredData = React.useMemo(() => {
    let baseData = data;
    
    if (activeTab === 'reviews') {
       if (reviewFilter) {
          baseData = data.filter(item => {
             if (reviewFilter.type === 'pyme') return item.id_pyme === reviewFilter.id;
             if (reviewFilter.type === 'place') return item.id_lugar === reviewFilter.id;
             if (reviewFilter.type === 'user') return item.id_usuario_destino === reviewFilter.id;
             return true;
          });
       }
       return baseData;
    } else if (activeTab === 'my_places') {
       baseData = data.filter(item => item.id_usuario === user?.id);
    } else if (activeTab === 'places_pymes') {
       baseData = data.filter(item => {
         if (user?.rol === 3) return true;
         if (item.aprobado) return true;
         if (item.id_usuario === user?.id) return true;
         return false;
       });
    }

    if (entityFilter === 'places') return baseData.filter(item => !item.id_pyme);
    if (entityFilter === 'pymes') return baseData.filter(item => !!item.id_pyme);
    return baseData;
  }, [data, activeTab, entityFilter, user?.id, user?.rol, reviewFilter]);

  // Búsqueda en tiempo real sobre filteredData
  const searchedData = React.useMemo(() => {
    if (!searchQuery.trim()) return filteredData;
    const q = searchQuery.toLowerCase();
    return filteredData.filter(item =>
      (item.nombre || item.name || '').toLowerCase().includes(q) ||
      (item.categoria || item.tipo || '').toLowerCase().includes(q) ||
      (item.descripcion || item.biography || '').toLowerCase().includes(q) ||
      (item.ubicacion_textual || item.location || '').toLowerCase().includes(q)
    );
  }, [filteredData, searchQuery]);

  // Paginación
  const totalPages = Math.max(1, Math.ceil(searchedData.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedData = React.useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return searchedData.slice(start, start + PAGE_SIZE);
  }, [searchedData, safePage, PAGE_SIZE]);

  // Resetear página al cambiar tab, filtro o búsqueda
  React.useEffect(() => { setCurrentPage(1); }, [activeTab, entityFilter, searchQuery, reviewFilter]);

  return (
    <div className={`flex flex-col md:flex-row ${viewMode === 'map' ? 'h-[calc(100vh-100px)]' : 'min-h-[calc(100vh-100px)] md:h-[calc(100vh-100px)]'} bg-neutral-50 dark:bg-bg-primary md:rounded-[40px] overflow-hidden shadow-2xl border border-neutral-200 dark:border-border-color mt-6 mb-10 mx-0 md:mx-10 xl:mx-16`}>

      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-white dark:bg-bg-secondary border-b md:border-r md:border-b-0 border-neutral-200 dark:border-border-color p-3 md:p-6 flex flex-col shrink-0">
        <div className="flex-1 md:space-y-2 overflow-x-auto md:overflow-y-auto custom-scrollbar md:pr-1 pb-1 md:pb-0">
          <div className="hidden md:block mb-8 pl-2">
            <h2 className="text-xl font-bold text-airbnb tracking-tight flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Ecosistema Exploro
            </h2>
            <p className="text-xs text-neutral-500 font-medium">Panel de gestión integral</p>
          </div>

          <nav className="flex flex-row md:flex-col gap-1.5 md:gap-0 md:space-y-1 w-max md:w-full">
            <TabButton
              active={activeTab === 'places_pymes'}
              onClick={() => setActiveTab('places_pymes')}
              icon={
                <span className="flex items-center gap-0.5">
                  <MapPin className="w-3.5 h-3.5" />
                  <Store className="w-3.5 h-3.5" />
                </span>
              }
              label={isAdmin ? "Todos los Lugares" : "Explorar Lugares"}
              mobileLabel={isAdmin ? "Todos" : "Explorar"}
            />
            <TabButton
              active={activeTab === 'my_places'}
              onClick={() => setActiveTab('my_places')}
              icon={<MapPin className="w-4 h-4" />}
              label={isPyme ? "Mis Lugares y Pymes" : "Mis Lugares"}
              mobileLabel="Mis Lugares"
            />
            {isAdmin && (
              <TabButton
                  active={activeTab === 'users'}
                  onClick={() => setActiveTab('users')}
                  icon={<Users className="w-4 h-4" />}
                  label="Usuarios"
                  mobileLabel="Usuarios"
              />
            )}
            {isAdmin && (
              <TabButton
                  active={activeTab === 'approvals'}
                  onClick={() => setActiveTab('approvals')}
                  icon={<CheckCircle className="w-4 h-4" />}
                  label="Solicitudes Pyme"
                  mobileLabel="Solicitudes"
              />
            )}

            <TabButton
              active={activeTab === 'reviews'}
              onClick={() => { setActiveTab('reviews'); setReviewFilter(null); }}
              icon={<MessageSquare className="w-4 h-4" />}
              label="Reseñas"
              mobileLabel="Reseñas"
            />
            <TabButton
              active={activeTab === 'recommendations'}
              onClick={() => setActiveTab('recommendations')}
              icon={<Zap className="w-4 h-4" />}
              label="IA Recomendaciones"
              mobileLabel="IA"
            />
            <TabButton
              active={activeTab === 'nearby'}
              onClick={() => setActiveTab('nearby')}
              icon={<Navigation className="w-4 h-4" />}
              label="Cercanos (1km)"
              mobileLabel="Cercanos"
            />
          </nav>
        </div>

        <div className="hidden md:block pt-6 border-t border-neutral-100 dark:border-neutral-800 mt-4">
            <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-2xl border border-neutral-100 dark:border-neutral-700/50">
                <p className="text-[10px] font-black text-neutral-400 uppercase mb-2 tracking-widest">Tu Rol</p>
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full animate-pulse ${isAdmin ? 'bg-purple-500' : isPyme ? 'bg-blue-500' : 'bg-green-500'}`} />
                    <span className="text-sm font-black text-neutral-800 dark:text-white capitalize tracking-tight">
                        {user?.rol === 3 ? 'Administrador' : user?.rol === 2 ? 'Empresario (Pyme)' : 'Usuario Regular'}
                    </span>
                </div>
            </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-bg-primary">

        {/* Header content area */}
        <header className="px-4 md:px-8 py-3 md:py-5 border-b border-neutral-200 dark:border-border-color bg-white dark:bg-bg-secondary">
          {/* Top row: title + refresh */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="min-w-0 flex-1">
              <h1 className="text-lg md:text-2xl font-bold text-neutral-800 dark:text-white flex items-center gap-2 flex-wrap">
                <span className="truncate">
                  {activeTab === 'places_pymes' ? (isAdmin ? 'Todos los Lugares y Pymes' : 'Explorar Lugares y Pymes') :
                   activeTab === 'my_places' ? (isPyme ? 'Mis Lugares y Pymes' : 'Mis Lugares') :
                   activeTab === 'users' ? 'Usuarios' :
                   activeTab === 'nearby' ? 'Lugares Cercanos' :
                   activeTab === 'reviews' ? (reviewFilter ? `Reseñas de ${reviewFilter.name}` : 'Reseñas') : 'IA Recomendaciones'}
                </span>
                {viewMode === 'map' && (
                  <span className="inline-flex items-center gap-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-2.5 py-0.5 rounded-full border border-blue-100 dark:border-blue-800/30 text-[9px] font-black uppercase tracking-wider flex-shrink-0">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-blue-500"></span>
                    </span>
                    En Vivo
                  </span>
                )}
              </h1>
              <p className="text-xs md:text-sm text-neutral-500 mt-0.5">Gestión en tiempo real</p>
            </div>
            <button
                onClick={fetchData}
                className="p-2 border border-neutral-200 dark:border-border-color rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors flex-shrink-0"
                title="Refrescar datos"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Settings className="w-4 h-4 text-neutral-500" />}
            </button>
          </div>

          {/* Controls row: view toggle + filters + CTAs */}
          <div className="flex flex-wrap items-center gap-2">

            {/* Entity filter: All / Lugares / Pymes */}
            {(activeTab === 'places_pymes' || activeTab === 'my_places') && (
              <div className="flex bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl border border-neutral-200 dark:border-border-color">
                {(['all', 'places', 'pymes'] as EntityFilter[]).map((f) => (
                  <button
                    key={f}
                    onClick={() => setEntityFilter(f)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${entityFilter === f ? 'bg-white dark:bg-neutral-700 shadow-sm text-airbnb' : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'}`}
                  >
                    {f === 'all' ? 'Todos' : f === 'places' ? '📍 Lugares' : '🏢 Pymes'}
                  </button>
                ))}
              </div>
            )}

            {/* reviewFilter clear button */}
            {activeTab === 'reviews' && reviewFilter && (
              <button
                onClick={() => setReviewFilter(null)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-airbnb/10 text-airbnb border border-airbnb/20 rounded-xl text-xs font-bold hover:bg-airbnb/20 transition-all"
              >
                <XCircle className="w-3.5 h-3.5" />
                Limpiar filtro
              </button>
            )}

            {/* View Toggle */}
            {activeTab !== 'users' && (
              <div className="flex bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl border border-neutral-200 dark:border-border-color">
                  <button
                    onClick={() => setViewMode('table')}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'table' ? 'bg-white dark:bg-neutral-700 shadow-sm text-airbnb' : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'}`}
                  >
                      <LayoutList className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Tabla</span>
                  </button>
                  <button
                    onClick={() => setViewMode('map')}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'map' ? 'bg-white dark:bg-neutral-700 shadow-sm text-airbnb' : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'}`}
                  >
                      <MapIcon className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Mapa</span>
                  </button>
              </div>
            )}

            {activeTab === 'recommendations' && (
              <div className="flex bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl border border-neutral-200 dark:border-border-color">
                <button
                  onClick={() => setRecommendationType('personalized')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${recommendationType === 'personalized' ? 'bg-white dark:bg-neutral-700 shadow-sm text-airbnb' : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'}`}
                >
                  Para ti
                </button>
                <button
                  onClick={() => setRecommendationType('popular')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${recommendationType === 'popular' ? 'bg-white dark:bg-neutral-700 shadow-sm text-airbnb' : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'}`}
                >
                  Populares
                </button>
                <button
                  onClick={() => setRecommendationType('nearby')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${recommendationType === 'nearby' ? 'bg-white dark:bg-neutral-700 shadow-sm text-airbnb' : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'}`}
                >
                  Cercanos
                </button>
              </div>
            )}

            {activeTab === 'nearby' && (
              <div className="flex items-center gap-1 bg-white dark:bg-neutral-900 p-1 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
                <span className="text-[10px] font-black text-neutral-400 uppercase pl-2 pr-1 flex items-center gap-1">
                  <Navigation className="w-2.5 h-2.5" /> Radio:
                </span>
                {[0.4, 0.7, 1, 1.4].map((r) => (
                  <button
                    key={r}
                    onClick={() => setNearbyRadius(r)}
                    className={`px-2.5 py-1 rounded-xl text-[10px] font-black transition-all ${
                      nearbyRadius === r
                        ? 'bg-airbnb text-white shadow-md shadow-airbnb/20'
                        : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-800'
                    }`}
                  >
                    {r < 1 ? `${r * 1000}m` : `${r}km`}
                  </button>
                ))}
              </div>
            )}

            {/* Spacer to push CTAs right on larger screens */}
            <div className="flex-1 hidden sm:block" />

            {(activeTab === 'places_pymes' || activeTab === 'my_places') && (user?.rol === 1 || isPyme || isAdmin) && (
              <>
                <button onClick={() => setIsCreatePlaceOpen(true)} className="flex items-center gap-1.5 bg-airbnb hover:bg-airbnb-dark text-white px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95">
                  <Plus className="w-3.5 h-3.5" />
                  <span>Agregar Lugar</span>
                </button>
                <button
                  onClick={() => {
                    if (isAdmin) {
                      setIsCreatePymeOpen(true);
                    } else {
                      router.push('/pyme-onboarding');
                    }
                  }}
                  className="flex items-center gap-1.5 bg-neutral-800 dark:bg-neutral-700 hover:bg-neutral-900 dark:hover:bg-neutral-600 text-white px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{user?.rol === 1 ? 'Ser Pyme' : 'Agregar Pyme'}</span>
                </button>
              </>
            )}
            {activeTab === 'reviews' && (user?.rol === 1 || isPyme || isAdmin) && (
              <button onClick={() => setIsCreateReviewOpen(true)} className="flex items-center gap-1.5 bg-airbnb hover:bg-airbnb-dark text-white px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95">
                <Plus className="w-3.5 h-3.5" />
                Agregar reseña
              </button>
            )}
          </div>

          {/* Search bar */}
          {activeTab !== 'recommendations' && viewMode === 'table' && (
            <div className="relative mt-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Buscar en ${
                  activeTab === 'places_pymes' ? 'lugares y pymes' :
                  activeTab === 'my_places' ? 'mis lugares' :
                  activeTab === 'users' ? 'usuarios' :
                  activeTab === 'reviews' ? 'reseñas' :
                  activeTab === 'nearby' ? 'lugares cercanos' : 'solicitudes'
                }...`}
                className="w-full pl-9 pr-9 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-border-color rounded-xl text-sm outline-none focus:ring-2 focus:ring-airbnb/30 focus:border-airbnb transition-all dark:text-white placeholder:text-neutral-400 font-medium"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-full transition-colors"
                >
                  <X className="w-3.5 h-3.5 text-neutral-400" />
                </button>
              )}
            </div>
          )}
        </header>

        {/* Message Banner */}
        {message && (
          <div className={`mx-4 md:mx-8 mt-3 p-3 rounded-xl flex items-center gap-3 animate-slide-in ${
            message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900/30' : 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/30'
          }`}>
            {message.type === 'success' ? <CheckCircle className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
            <span className="text-sm font-medium">{message.text}</span>
          </div>
        )}

        {/* Dynamic Table/List View OR Map View */}
        <div className={`flex-1 ${viewMode === 'map' ? 'overflow-hidden' : 'overflow-auto'} p-4 md:p-8 h-full`}>
            {viewMode === 'map' ? (
                <div className="w-full h-full animate-fade-in">
                    <ExploroMap 
                        entities={filteredData} 
                        userLocation={userLocation} 
                        selectedEntity={selectedEntity}
                        onSelectEntity={setSelectedEntity}
                        onOpenReview={(item) => {
                          const type = item.id_pyme ? 'pyme' : item.id_lugar ? 'place' : 'place';
                          const id = item.id_pyme || item.id_lugar || item.id;
                          setReviewTarget({ type, id: String(id) });
                          setIsCreateReviewOpen(true);
                        }}
                    />
                </div>
            ) : isLoading ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-neutral-400">
                    <Loader2 className="w-10 h-10 animate-spin" />
                    <p className="font-medium">Sincronizando con Exploro API...</p>
                </div>
            ) : searchedData.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-neutral-400 py-20">
                    <Navigation className="w-16 h-16 opacity-10 animate-pulse" />
                    <div className="text-center">
                        <p className="font-bold text-xl text-neutral-800 dark:text-white">
                          {searchQuery ? `Sin resultados para "${searchQuery}"` : 'No hay datos en esta sección'}
                        </p>
                        <p className="text-sm font-medium max-w-xs mx-auto mt-1">
                          {searchQuery
                            ? 'Intenta con otro término de búsqueda.'
                            : activeTab === 'nearby'
                              ? 'Prueba aumentando el radio de búsqueda o asegúrate de que el GPS esté activo.'
                              : 'Aún no hay contenido registrado aquí.'}
                        </p>
                    </div>
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="mt-2 px-6 py-2 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 rounded-xl font-bold text-xs hover:bg-neutral-200 transition-all flex items-center gap-2"
                        >
                            <X className="w-3.5 h-3.5" /> Limpiar búsqueda
                        </button>
                    )}
                    {!searchQuery && activeTab === 'nearby' && (
                        <button
                            onClick={() => setNearbyRadius(1.4)}
                            className="mt-4 px-6 py-2 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 rounded-xl font-bold text-xs hover:bg-neutral-200 transition-all"
                        >
                            Ver a 1.4km a la redonda
                        </button>
                    )}
                </div>
            ) : (
                <div className="space-y-4 animate-fade-in overflow-x-auto pb-4 w-full">
                    {/* Contador de resultados */}
                    <div className="flex items-center justify-between px-1 min-w-[800px]">
                        <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest">
                            {searchedData.length} resultado{searchedData.length !== 1 ? 's' : ''}
                            {searchQuery && <span className="text-airbnb"> · "{searchQuery}"</span>}
                        </span>
                        {totalPages > 1 && (
                          <span className="text-xs font-semibold text-neutral-400">
                            Página {safePage} de {totalPages}
                          </span>
                        )}
                    </div>

                    {/* ... Table UI ... */}
                    <table className="w-full text-left border-separate border-spacing-y-3 min-w-[800px]">
                        <thead>
                            <tr className="text-xs font-bold text-neutral-400 uppercase tracking-widest pl-4">
                                <th className="px-6 py-2">Información</th>
                                <th className="px-6 py-2">Categoría</th>
                                <th className="px-6 py-2">Estado</th>
                                <th className="px-6 py-2 text-right pr-10">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedData.map((item, idx) => {
                                const itemId = String(item.id || item.id_usuario || item.id_lugar || item.id_pyme || item.id_resena || idx);
                                const isExpanded = expandedRowId === itemId;
                                return (
                                <React.Fragment key={idx}>
                                <tr className={`bg-neutral-50 dark:bg-bg-secondary hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all group border-b border-transparent hover:border-neutral-200 dark:hover:border-border-color shadow-sm ${isExpanded ? 'rounded-t-2xl border-b-neutral-200 dark:border-b-neutral-800' : 'rounded-2xl'}`}>
                                    <td className={`px-6 py-5 ${isExpanded ? 'rounded-tl-2xl' : 'rounded-l-2xl'}`}>
                                        <div className="flex items-center gap-3">
                                            {activeTab !== 'reviews' && (
                                                <button 
                                                    onClick={() => setExpandedRowId(isExpanded ? null : itemId)}
                                                    className={`p-1.5 rounded-lg transition-colors flex-shrink-0 ${isExpanded ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400' : 'text-neutral-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/30'}`} 
                                                    title="Ver Más Detalles"
                                                >
                                                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                                </button>
                                            )}
                                            <button 
                                                onClick={() => {
                                                    if (activeTab === 'users') {
                                                        router.push(`/users/${item.id}`);
                                                    } else if (item.id_pyme) {
                                                        router.push(`/pymes/${item.id_pyme}`);
                                                    } else if (item.id_lugar || (item.id && activeTab !== 'reviews')) {
                                                        router.push(`/places/${item.id_lugar || item.id}`);
                                                    }
                                                }}
                                                className="w-14 h-14 bg-white dark:bg-bg-primary rounded-xl flex items-center justify-center shadow-sm text-2xl overflow-hidden shrink-0 border border-neutral-100 dark:border-neutral-800 hover:opacity-80 transition-opacity active:scale-95"
                                            >
                                                {item.avatar || item.image || (item.images && item.images.length > 0) ? (
                                                    <img src={item.avatar || item.image || item.images[0]} alt={item.nombre || item.name || 'Imagen'} className="w-full h-full object-cover" />
                                                ) : activeTab === 'users' && item.avatar ? (
                                                    <img src={item.avatar} alt={item.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    getItemEmoji(item)
                                                )}
                                            </button>
                                            <div className="flex flex-col gap-1">
                                                <button 
                                                    onClick={() => {
                                                        if (activeTab === 'users') {
                                                            router.push(`/users/${item.id}`);
                                                        } else if (item.id_pyme) {
                                                            router.push(`/pymes/${item.id_pyme}`);
                                                        } else if (item.id_lugar || (item.id && activeTab !== 'reviews')) {
                                                            router.push(`/places/${item.id_lugar || item.id}`);
                                                        }
                                                    }}
                                                    className="font-bold text-base text-neutral-800 dark:text-white hover:text-airbnb transition-colors text-left"
                                                >
                                                    {item.nombre || item.name || 'Sin nombre'}
                                                </button>
                                                <div className="flex items-center gap-2">
                                                    <div className="flex items-center gap-0.5 text-amber-400">
                                                        <Star className={`w-3.5 h-3.5 ${item.rating > 0 ? 'fill-amber-400' : 'text-neutral-300'}`} />
                                                    </div>
                                                    <span className="text-xs font-medium text-neutral-500">
                                                        {item.rating > 0 ? item.rating.toFixed(1) : '0.0'} ({item.reviews_count || 0} reseñas)
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 align-middle">
                                        <div className="px-3 py-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 rounded-full text-xs font-semibold border border-neutral-200 dark:border-neutral-700 w-fit">
                                            {item.id_pyme ? '🏢 Pyme' : '📍 Lugar'} • {item.categoria || item.tipo || 'General'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 align-middle">
                                        {(activeTab === 'places_pymes' || activeTab === 'my_places') && item.id_pyme && (
                                            <div className={`px-3 py-1 rounded-full text-xs font-semibold border w-fit ${item.aprobado ? 'bg-green-50 text-green-700 border-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900/30' : 'bg-yellow-50 text-yellow-700 border-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-900/30'}`}>
                                                {item.aprobado ? 'Pyme Aprobada' : 'Pyme Pendiente'}
                                            </div>
                                        )}
                                        {(activeTab === 'places_pymes' || activeTab === 'my_places') && !item.id_pyme && (
                                            <div className={`px-3 py-1 rounded-full text-xs font-semibold border w-fit ${item.aprobado ? 'bg-green-50 text-green-700 border-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900/30' : 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-900/30'}`}>
                                                {item.aprobado ? 'Lugar Publicado' : 'Lugar en Revisión'}
                                            </div>
                                        )}
                                    </td>

                                    <td className={`px-6 py-5 text-right pr-10 ${isExpanded ? 'rounded-tr-2xl' : 'rounded-r-2xl'}`}>
                                        <div className="flex justify-end gap-2">
                                            {(activeTab === 'places_pymes' || activeTab === 'my_places' || activeTab === 'approvals') && !item.aprobado && isAdmin && (
                                                <div className="flex gap-1">
                                                    <button
                                                      onClick={() => handleApprove(item.id_pyme || item.id)}
                                                      disabled={actionLoadingId === `approve-${item.id_pyme || item.id}`}
                                                      className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-colors disabled:opacity-50"
                                                      title="Aprobar"
                                                    >
                                                      {actionLoadingId === `approve-${item.id_pyme || item.id}`
                                                        ? <Loader2 className="w-4 h-4 animate-spin" />
                                                        : <CheckCircle className="w-4 h-4" />}
                                                    </button>
                                                    <button 
                                                      onClick={() => {
                                                        const isPymeItem = !!item.id_pyme;
                                                        const entityId = isPymeItem ? item.id_pyme : (item.id_lugar || item.id);
                                                        setConfirmModal({
                                                          isOpen: true,
                                                          title: 'Rechazar Solicitud',
                                                          message: `¿Estás seguro de que deseas rechazar "${item.nombre}"? Se eliminará permanentemente.`,
                                                          onConfirm: async () => {
                                                            setConfirmModal(prev => ({ ...prev, isOpen: false }));
                                                            setIsLoading(true);
                                                            try {
                                                              if (isPymeItem) {
                                                                await api.deletePyme(Number(entityId));
                                                              } else {
                                                                await api.deletePlace(Number(entityId));
                                                              }
                                                              showMsg('Solicitud rechazada exitosamente', 'success');
                                                              await fetchData();
                                                            } catch (err) {
                                                              showMsg('Error al rechazar', 'error');
                                                            } finally {
                                                              setIsLoading(false);
                                                            }
                                                          }
                                                        });
                                                      }}
                                                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                                      title="Rechazar"
                                                    >
                                                        <XCircle className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            )}
                                            <button 
                                                onClick={() => {
                                                    setSelectedEntity(item);
                                                    setViewMode('map');
                                                }}
                                                className="p-2 text-airbnb hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors" 
                                                title="Ver en mapa"
                                             >
                                                <MapPin className="w-4 h-4" />
                                             </button>

                                            <button 
                                                onClick={() => router.push(`/users/${item.id_usuario || item.id}`)}
                                                className="p-2 text-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-lg transition-colors" 
                                                title="Ver Perfil Público"
                                             >
                                                <User className="w-4 h-4" />
                                            </button>
                                            {(isAdmin || item.id_usuario === user?.id) && (
                                              <>
                                                {activeTab === 'approvals' && !item.aprobado && (
                                                  <>
                                                    <button
                                                      onClick={() => handleApprove(item.id)}
                                                      disabled={actionLoadingId === `approve-${item.id}`}
                                                      className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-colors disabled:opacity-50"
                                                      title="Aprobar"
                                                    >
                                                      {actionLoadingId === `approve-${item.id}`
                                                        ? <Loader2 className="w-4 h-4 animate-spin" />
                                                        : <CheckCircle className="w-4 h-4" />}
                                                    </button>
                                                    <button 
                                                      onClick={() => {
                                                        setConfirmModal({
                                                          isOpen: true,
                                                          title: 'Rechazar Solicitud',
                                                          message: '¿Estás seguro de que deseas rechazar esta solicitud de PYME? Se eliminará permanentemente del sistema.',
                                                          onConfirm: async () => {
                                                            setConfirmModal(prev => ({ ...prev, isOpen: false }));
                                                            setIsLoading(true);
                                                            try {
                                                              await api.deletePyme(Number(item.id));
                                                              showMsg('Solicitud rechazada exitosamente', 'success');
                                                              await fetchData();
                                                            } catch (err) {
                                                              showMsg('Error al rechazar la solicitud', 'error');
                                                            } finally {
                                                              setIsLoading(false);
                                                            }
                                                          }
                                                        });
                                                      }}
                                                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                                      title="Rechazar"
                                                    >
                                                        <XCircle className="w-4 h-4" />
                                                    </button>
                                                  </>
                                                )}
                                                <button 
                                                  onClick={() => {
                                                    setEditingItem(item);
                                                    if (item.id_pyme) {
                                                      setIsCreatePymeOpen(true);
                                                    } else {
                                                      setIsCreatePlaceOpen(true);
                                                    }
                                                  }}
                                                  className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                                                  title="Editar Información"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDelete(item)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                              </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                                {isExpanded && (
                                    <ExpandedRowContent 
                                        item={item} 
                                        isAdmin={isAdmin} 
                                        router={router} 
                                        itemId={itemId} 
                                        onOpenReview={(item) => {
                                            const type = item.id_pyme ? 'pyme' : item.id_lugar ? 'place' : (item.id_usuario ? 'user' : 'place');
                                            const id = item.id_pyme || item.id_lugar || item.id_usuario || item.id;
                                            setReviewTarget({ type, id: String(id) });
                                            setIsCreateReviewOpen(true);
                                        }}
                                    />
                                )}
                                </React.Fragment>
                                );
                            })}
                        </tbody>
                    </table>

                    {/* Paginación */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-center gap-2 pt-4 pb-2 min-w-[800px]">
                        <button
                          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                          disabled={safePage === 1}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-neutral-200 dark:border-border-color text-sm font-bold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                          <ChevronLeft className="w-4 h-4" /> Anterior
                        </button>

                        <div className="flex items-center gap-1">
                          {Array.from({ length: totalPages }, (_, i) => i + 1)
                            .filter(p => p === 1 || p === totalPages || Math.abs(p - safePage) <= 1)
                            .reduce<(number | '...')[]>((acc, p, idx, arr) => {
                              if (idx > 0 && (p as number) - (arr[idx - 1] as number) > 1) acc.push('...');
                              acc.push(p);
                              return acc;
                            }, [])
                            .map((p, i) =>
                              p === '...' ? (
                                <span key={`ellipsis-${i}`} className="px-2 text-neutral-400 text-sm">…</span>
                              ) : (
                                <button
                                  key={p}
                                  onClick={() => setCurrentPage(p as number)}
                                  className={`w-9 h-9 rounded-xl text-sm font-bold transition-all ${
                                    safePage === p
                                      ? 'bg-airbnb text-white shadow-md shadow-airbnb/20'
                                      : 'text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-800 dark:hover:text-white'
                                  }`}
                                >
                                  {p}
                                </button>
                              )
                            )}
                        </div>

                        <button
                          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                          disabled={safePage === totalPages}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-neutral-200 dark:border-border-color text-sm font-bold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                          Siguiente <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                </div>
            )}
        </div>
      </main>

      {/* Modales de Creación */}
      <CreatePlaceModal
        isOpen={isCreatePlaceOpen}
        onClose={() => { setIsCreatePlaceOpen(false); setEditingItem(null); }}
        onCreated={() => { showMsg(editingItem ? 'Lugar actualizado exitosamente.' : 'Lugar creado exitosamente.', 'success'); fetchData(); }}
        initialData={editingItem}
      />
      <CreatePymeModal
        isOpen={isCreatePymeOpen}
        onClose={() => { setIsCreatePymeOpen(false); setEditingItem(null); }}
        onCreated={() => { showMsg(editingItem ? 'Pyme actualizada exitosamente.' : 'Pyme registrada exitosamente.', 'success'); fetchData(); }}
        initialData={editingItem}
      />
      <CreateReviewModal
        isOpen={isCreateReviewOpen}
        onClose={() => { setIsCreateReviewOpen(false); setReviewTarget(null); }}
        onCreated={() => { showMsg('Reseña publicada exitosamente.', 'success'); fetchData(); setReviewTarget(null); }}
        initialTargetType={reviewTarget?.type}
        initialTargetId={reviewTarget?.id}
      />
      {/* MODAL DE CONFIRMACIÓN CUSTOM */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-bg-secondary w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-scale-in border border-neutral-200 dark:border-border-color">
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trash2 className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-black text-neutral-800 dark:text-white mb-2">{confirmModal.title}</h3>
              <p className="text-neutral-500 dark:text-neutral-400 font-medium leading-relaxed">
                {confirmModal.message}
              </p>
            </div>
            <div className="p-6 bg-neutral-50 dark:bg-neutral-800/50 flex gap-3">
              <button 
                onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                className="flex-1 py-3.5 rounded-2xl font-bold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={confirmModal.onConfirm}
                className="flex-1 py-3.5 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-bold shadow-lg shadow-red-200 dark:shadow-none transition-all active:scale-95"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TabButton({ active, onClick, icon, label, mobileLabel }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string, mobileLabel?: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2.5 md:py-3 rounded-2xl text-xs md:text-sm font-semibold transition-all duration-200 whitespace-nowrap md:w-full ${
        active
          ? 'bg-airbnb text-white shadow-md shadow-airbnb/20'
          : 'text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-800 dark:hover:text-white'
      }`}
    >
      <span className={`flex-shrink-0 ${active ? 'text-white' : 'text-neutral-400'}`}>{icon}</span>
      <span className="hidden md:inline">{label}</span>
      <span className="md:hidden">{mobileLabel || label}</span>
    </button>
  );
}
