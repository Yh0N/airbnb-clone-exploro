'use client';

// ===== PÁGINA DE DETALLE DEL LUGAR - ESTILO AIRBNB PREMIUM 2025 =====
// Muestra información completa de un lugar turístico con diseño de alta gama

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Star, MapPin, Share, Heart, ChevronRight, Award, 
  Shield, Calendar, Flag, Mountain, TreePine, 
  Camera, Info, InfoIcon, ExternalLink,
  Map, MessageCircle, Bookmark, AlertTriangle, ChevronLeft
} from 'lucide-react';
import ImageGallery from '@/components/ImageGallery';
import PlaceCard from '@/components/PlaceCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import { getPlace, getPlaces, toggleFavorite, getPlaceReviews, resolvePhotoUrl } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import CreateReviewModal from '@/components/exploro/CreateReviewModal';
import CreatePlaceModal from '@/components/exploro/CreatePlaceModal';
import ReportModal from '@/components/exploro/ReportModal';
import type { Place } from '@/types/place';

// Componente de mapa dinámico
import dynamic from 'next/dynamic';
const MapComponent = dynamic(() => import('@/components/MapView'), { ssr: false });

const featureIcons: Record<string, React.ReactNode> = {
  'Senderismo': <Mountain className="w-6 h-6" />,
  'Fotografía': <Camera className="w-6 h-6" />,
  'Trekking': <Mountain className="w-6 h-6" />,
  'Avistamiento de aves': <TreePine className="w-6 h-6" />,
  'default': <ChevronRight className="w-6 h-6" />,
};

export default function PlaceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated, updateFavorites } = useAuth();
  const [place, setPlace] = useState<Place | null>(null);
  const [similarPlaces, setSimilarPlaces] = useState<Place[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);

  const placeId = Number(params.id);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const placeData = await getPlace(placeId);
        if (placeData) {
          setPlace(placeData);
          setIsLiked(user?.favorites?.includes(placeData.id) || false);

          const allPlaces = await getPlaces(undefined, placeData.category);
          setSimilarPlaces(allPlaces.filter((p) => p.id !== placeData.id).slice(0, 4));
          
          // Cargar reseñas
          setLoadingReviews(true);
          const reviewsData = await getPlaceReviews(placeId);
          setReviews(reviewsData);
        }
      } catch (error) {
        console.error('Error cargando lugar:', error);
      } finally {
        setIsLoading(false);
        setLoadingReviews(false);
      }
    };
    fetchData();
  }, [placeId, user?.favorites]);

  const handleFavorite = async () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    const previousState = isLiked;
    setIsLiked(!isLiked);
    try {
      const result = await toggleFavorite(placeId);
      updateFavorites(result.favorites);
    } catch {
      setIsLiked(previousState);
    }
  };

  if (isLoading) {
    return <LoadingSpinner size="lg" text="Preparando tu próximo destino..." />;
  }

  if (!place) {
    return (
      <div className="max-w-[2520px] mx-auto px-4 sm:px-6 md:px-10 xl:px-20 py-32 text-center bg-neutral-50 min-h-screen">
        <div className="w-24 h-24 bg-white rounded-3xl shadow-sm flex items-center justify-center mx-auto mb-8">
          <span className="text-5xl">🏔️</span>
        </div>
        <h2 className="text-3xl font-bold text-neutral-800 mb-3 tracking-tight">Lugar no encontrado</h2>
        <p className="text-neutral-500 mb-10 max-w-md mx-auto leading-relaxed">
          El destino que buscas parece haberse movido o no está disponible en este momento.
        </p>
        <button
          onClick={() => router.push('/')}
          className="bg-neutral-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-neutral-800 transition-all shadow-lg hover:scale-105 active:scale-95"
        >
          Explorar otros destinos
        </button>
      </div>
    );
  }

  const isGuestFavorite = (place.rating ?? 0) >= 4.8;
  const isAdmin = user?.rol === 3;
  const isOwner = isAuthenticated && user?.id === place.id_usuario;
  const canEdit = isAdmin || isOwner;

  // Determinar si es PyME o Lugar Turístico (Si tiene id_pyme o si la categoría indica negocio)
  const isPyme = !!(place as any).id_pyme || ['hotel', 'restaurante', 'café', 'tienda', 'agencia'].includes(place.category?.toLowerCase() || '');

  const handleShare = async () => {
    const shareData = {
      title: place.name,
      text: `¡Mira este increíble destino en Exploro: ${place.name}!`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('Enlace copiado al portapapeles');
      }
    } catch (err) {
      console.error('Error al compartir:', err);
    }
  };

  const handleDirections = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}`;
    window.open(url, '_blank');
  };

  const handleWhatsApp = () => {
    const numero = place.whatsapp || place.telefono;
    if (!numero) return;
    const phone = numero.startsWith('57') ? numero : `57${numero}`;
    const message = encodeURIComponent(`Hola, vi tu negocio "${place.name}" en Exploro y me gustaría obtener más información.`);
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  };

  const handleReport = () => {
    setIsReportModalOpen(true);
  };

  const handleEditReview = (review: any) => {
    setEditingReview({
      id: review.id_resena || review.id,
      puntuacion: review.puntuacion,
      comentarios: review.comentarios
    });
    setIsReviewModalOpen(true);
  };

  return (
    <div className="max-w-[1120px] mx-auto px-4 sm:px-6 py-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Botón Volver */}
      <button 
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm font-bold text-neutral-500 hover:text-neutral-900 transition-all mb-6 group w-fit"
      >
        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Volver
      </button>
      <div className="mb-8">
        <div className="flex flex-col gap-4">
          
          {/* Categoría y Tipo Visual Badge */}
          <div className="flex items-center gap-3">
            <span className="bg-neutral-100 text-neutral-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-neutral-200">
              {place.category || 'Destino'}
            </span>
            {((place as any).subcategoria || (place as any).subcategory) && (
              <span className="bg-airbnb text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-airbnb/20 shadow-sm shadow-airbnb/20">
                {(place as any).subcategoria || (place as any).subcategory}
              </span>
            )}
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest border ${
              isPyme 
                ? 'bg-amber-50 text-amber-700 border-amber-200' 
                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}>
              {isPyme ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  PyME / Negocio Local
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Lugar Turístico
                </>
              )}
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex-1">
              <h1 className="text-4xl md:text-5xl font-black text-neutral-900 tracking-tighter mb-4">
                {place.name}
              </h1>
              
              <div className="flex items-center gap-4 text-[15px] text-neutral-600 flex-wrap font-medium">
                <div className="flex items-center gap-1.5 text-neutral-900 font-bold">
                  <Star className="w-4 h-4 fill-neutral-900" />
                  <span>{place.rating?.toFixed(1) || '0.0'}</span>
                  <span className="text-neutral-400 mx-1">·</span>
                  <button 
                    onClick={() => document.getElementById('reviews-section')?.scrollIntoView({ behavior: 'smooth' })}
                    className="underline decoration-neutral-300 hover:decoration-neutral-900 transition-all underline-offset-4"
                  >
                    {reviews.length} reseñas
                  </button>
                </div>
                
                <span className="text-neutral-300">·</span>
                
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-airbnb" />
                  <span className="underline underline-offset-4 decoration-neutral-200">{place.location}</span>
                </div>
              </div>
            </div>
            
            {/* ACCIONES PRINCIPALES — Responsive layout */}
            <div className="flex flex-col gap-3 w-full md:w-auto">
              {/* Fila 1: acciones secundarias (scroll horizontal en mobile) */}
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
                <button
                  onClick={handleDirections}
                  className="flex items-center gap-2 text-xs font-bold text-neutral-700 bg-neutral-50 hover:bg-white border border-neutral-200 px-4 py-2.5 rounded-xl transition-all hover:shadow-md whitespace-nowrap flex-shrink-0"
                >
                  <Map className="w-4 h-4 text-blue-600" />
                  Cómo llegar
                </button>

                {isPyme && (place.whatsapp || place.telefono) && (
                  <button
                    onClick={handleWhatsApp}
                    className="flex items-center gap-2 text-xs font-bold text-neutral-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-4 py-2.5 rounded-xl transition-all hover:shadow-md whitespace-nowrap flex-shrink-0"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-600" />
                    WhatsApp
                  </button>
                )}
                {isPyme && place.telefono && (
                  <a
                    href={`tel:${place.telefono}`}
                    className="flex items-center gap-2 text-xs font-bold text-neutral-700 bg-neutral-50 hover:bg-white border border-neutral-200 px-4 py-2.5 rounded-xl transition-all hover:shadow-md whitespace-nowrap flex-shrink-0"
                  >
                    <span className="text-blue-500">📞</span>
                    {place.telefono}
                  </a>
                )}

                <button
                  onClick={handleFavorite}
                  className="flex items-center gap-2 text-xs font-bold text-neutral-700 bg-neutral-50 hover:bg-white border border-neutral-200 px-4 py-2.5 rounded-xl transition-all hover:shadow-md whitespace-nowrap flex-shrink-0 group"
                >
                  <Bookmark className={`w-4 h-4 transition-all duration-300 ${isLiked ? 'fill-airbnb text-airbnb scale-110' : 'group-hover:scale-110'}`} />
                  {isLiked ? 'Guardado' : 'Guardar'}
                </button>

                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 text-xs font-bold text-neutral-700 bg-neutral-50 hover:bg-white border border-neutral-200 px-4 py-2.5 rounded-xl transition-all hover:shadow-md whitespace-nowrap flex-shrink-0"
                >
                  <Share className="w-3.5 h-3.5" />
                  Compartir
                </button>

                <button
                  onClick={handleReport}
                  className="flex items-center gap-2 text-xs font-bold text-neutral-400 hover:text-red-500 bg-neutral-50 hover:bg-red-50 border border-neutral-200 hover:border-red-100 px-3 py-2.5 rounded-xl transition-all whitespace-nowrap flex-shrink-0"
                  title="Reportar este lugar"
                >
                  <AlertTriangle className="w-4 h-4" />
                </button>
              </div>

              {/* Fila 2: CTA principal (y editar si es owner) */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (!isAuthenticated) { router.push('/login'); return; }
                    setIsReviewModalOpen(true);
                  }}
                  className="flex-1 bg-neutral-900 text-white px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-neutral-800 transition-all shadow-xl active:scale-95 text-center"
                >
                  Calificar
                </button>

                {canEdit && (
                  <button
                    onClick={() => setIsEditModalOpen(true)}
                    className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-white bg-blue-600 hover:bg-blue-700 px-5 py-3 rounded-2xl transition-all shadow-xl active:scale-95 whitespace-nowrap"
                  >
                    <Info className="w-4 h-4" />
                    Editar
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Galería Premium */}
      <div className="mb-12 shadow-2xl rounded-2xl overflow-hidden">
        <ImageGallery 
          images={place.images || []} 
          placeName={place.name || 'Lugar'} 
          entityId={place.id}
          entityType="place"
          isOwner={isAuthenticated && user?.id === place.id_usuario}
          currentUser={user}
          onImageUploaded={(newUrl) => {
            const fullUrl = resolvePhotoUrl(newUrl);
            setPlace(prev => prev ? {
              ...prev,
              images: [...(prev.images || []), fullUrl],
              image: prev.image || fullUrl
            } : null);
          }}
          onImageDeleted={(deletedUrl) => {
            setPlace(prev => prev ? {
              ...prev,
              images: (prev.images || []).filter(url => url !== deletedUrl)
            } : null);
          }}
        />
      </div>

      {/* Contenido Principal - Columna Única */}
      <div className="max-w-4xl mx-auto space-y-12">
          
          {/* Info del Host con Tarjeta Premium */}
          <div className="flex items-center justify-between pb-10 border-b border-neutral-100">
            <div>
              <h2 className="text-2xl font-bold text-neutral-900 tracking-tight">
                Destino gestionado por {place.host_name || 'Anfitrión local'}
              </h2>
              <div className="flex items-center gap-2 text-neutral-500 mt-2 font-medium">
                <span>Desde {place.host_since || '2024'}</span>
                <span>·</span>
                <span className="capitalize">{place.category}</span>
                {place.features && place.features.length > 0 && (
                  <>
                    <span>·</span>
                    <span>{place.features.length} actividades</span>
                  </>
                )}
              </div>
            </div>
            <div className="relative group">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-airbnb to-airbnb-dark flex items-center justify-center text-white text-2xl font-black shadow-lg group-hover:rotate-6 transition-transform">
                {(place.host_name || 'E').charAt(0)}
              </div>
              <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full shadow-md">
                <Shield className="w-4 h-4 text-airbnb" fill="currentColor" fillOpacity={0.2} />
              </div>
            </div>
          </div>

          {/* Rating Destacado */}
          {isGuestFavorite && (
            <div className="py-2 border-b border-neutral-100">
              <div className="flex items-center gap-8 bg-neutral-50/50 p-6 rounded-3xl border border-neutral-100">
                <div className="flex flex-col items-center">
                  <span className="text-5xl font-black text-neutral-900">{place.rating}</span>
                  <div className="flex mt-1 text-neutral-900">
                    {[1,2,3,4,5].map(i => (
                      <Star key={i} className="w-3 h-3 fill-current" />
                    ))}
                  </div>
                </div>
                <div className="w-px h-16 bg-neutral-200" />
                <div>
                  <h3 className="font-bold text-lg text-neutral-900">Favorito de viajeros</h3>
                  <p className="text-neutral-500 text-[15px] mt-1 leading-relaxed">
                    Uno de los destinos más queridos en Exploro según las opiniones reales de nuestra comunidad.
                  </p>
                </div>
              </div>
            </div>
          )}


          {/* Descripción con Mejor Legibilidad */}
          <div className="pb-12 border-b border-neutral-100">
            <h3 className="text-xl font-bold text-neutral-900 mb-6 tracking-tight">Sobre este lugar</h3>
            <div className="text-neutral-600 leading-8 text-[17px] space-y-4">
              {place.description ? (
                place.description.split('\n').map((para, i) => <p key={i}>{para}</p>)
              ) : (
                <div className="bg-neutral-50 p-6 rounded-2xl border border-dashed border-neutral-200 flex items-center gap-4 text-neutral-400">
                  <InfoIcon className="w-5 h-5" />
                  <p>Aún no hay una descripción detallada para este destino.</p>
                </div>
              )}
            </div>
          </div>

          {/* Características / Amenidades */}
          {place.features && place.features.length > 0 && (
            <div className="pb-12 border-b border-neutral-100">
              <h3 className="text-xl font-bold text-neutral-900 mb-8 tracking-tight">Lo que ofrece este lugar</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                {place.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-4 group">
                      <div className="text-neutral-700 group-hover:scale-110 transition-transform">
                        {featureIcons[feature] || featureIcons['default']}
                      </div>
                      <span className="text-neutral-700 font-medium text-[16px]">{feature}</span>
                    </div>
                  ))}
              </div>
              {place.features.length > 5 && (
                <button className="mt-10 px-6 py-3 border border-neutral-900 rounded-xl font-bold text-neutral-900 hover:bg-neutral-50 transition-all active:scale-95">
                  Mostrar las {place.features.length} actividades
                </button>
              )}
            </div>
          )}

          {/* Ubicación y Mapa */}
          <div>
            <h3 className="text-xl font-bold text-neutral-900 mb-2 tracking-tight">Dónde estarás</h3>
            <p className="text-neutral-500 mb-8 font-medium">{place.location}, Nariño</p>
            <div className="h-[450px] rounded-3xl overflow-hidden border border-neutral-200 shadow-inner group">
              <MapComponent
                latitude={place.latitude || 0}
                longitude={place.longitude || 0}
                name={place.name || 'Lugar'}
              />
            </div>
          </div>
      </div>

      {/* Sección de Reseñas y Comentarios */}
      <div id="reviews-section" className="mt-24 pt-16 border-t border-neutral-100">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-neutral-900 tracking-tight flex items-center gap-3">
              <Star className="w-8 h-8 text-amber-400 fill-amber-400" />
              {place.rating?.toFixed(1) || '0.0'} · {reviews.length} reseñas
            </h2>
            <p className="text-neutral-500 mt-2 font-medium">Lo que opinan otros viajeros sobre este destino</p>
          </div>
          
          <button 
            onClick={() => {
              if (!isAuthenticated) {
                router.push('/login');
                return;
              }
              setIsReviewModalOpen(true);
            }}
            className="bg-neutral-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-neutral-800 transition-all shadow-lg active:scale-95"
          >
            Escribir una reseña
          </button>
        </div>

        {loadingReviews ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner size="md" text="Cargando comentarios..." />
          </div>
        ) : reviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-12">
            {reviews.map((review, idx) => (
              <div key={idx} className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => router.push(`/users/${review.id_usuario}`)}
                    className="flex items-center gap-4 hover:opacity-80 transition-opacity text-left"
                  >
                    <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center text-lg font-black text-neutral-400">
                      {review.nombre_usuario?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <h4 className="font-bold text-neutral-900 hover:underline decoration-neutral-300 underline-offset-4">{review.nombre_usuario || 'Usuario de Exploro'}</h4>
                      <p className="text-xs text-neutral-400 font-medium">{new Date(review.fecha).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}</p>
                    </div>
                  </button>

                  {user && review.id_usuario === user.id && (
                    <button 
                      onClick={() => handleEditReview(review)}
                      className="ml-auto text-xs font-bold text-neutral-400 hover:text-neutral-900 underline underline-offset-4 decoration-neutral-200 hover:decoration-neutral-900 transition-all"
                    >
                      Editar
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-1 text-neutral-900 scale-90 origin-left">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-3 h-3 ${i < review.puntuacion ? 'fill-current text-amber-400' : 'text-neutral-200'}`} />
                  ))}
                </div>
                <p className="text-neutral-600 leading-relaxed text-[15px]">
                  {review.comentarios}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-neutral-50 rounded-[40px] p-16 text-center border-2 border-dashed border-neutral-200">
            <div className="w-20 h-20 bg-white rounded-3xl shadow-sm flex items-center justify-center mx-auto mb-6 text-3xl">
              ✨
            </div>
            <h3 className="text-xl font-bold text-neutral-800 mb-2">Aún no hay reseñas</h3>
            <p className="text-neutral-500 max-w-sm mx-auto mb-8 font-medium">
              Sé el primero en compartir tu experiencia en este lugar para ayudar a otros viajeros de la comunidad.
            </p>
            <button 
              onClick={() => setIsReviewModalOpen(true)}
              className="font-bold text-neutral-900 underline underline-offset-8 decoration-2 hover:text-airbnb transition-colors"
            >
              Calificar ahora
            </button>
          </div>
        )}
      </div>

      {/* Lugares Similares - Carrusel de Recomendaciones */}
      {similarPlaces.length > 0 && (
        <div className="mt-24 pt-16 border-t border-neutral-100">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-neutral-900 tracking-tight">
                Destinos que te enamorarán
              </h2>
              <p className="text-neutral-500 mt-2 font-medium">Basado en tus intereses y la categoría {place.category}</p>
            </div>
            <button className="hidden md:flex items-center gap-1 font-bold text-neutral-900 underline underline-offset-8 decoration-2 hover:text-airbnb transition-colors">
              Ver todos <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {similarPlaces.map((p) => (
              <div key={p.id} className="hover:-translate-y-2 transition-transform duration-300">
                <PlaceCard place={p as any} />
              </div>
            ))}
          </div>
        </div>
      )}

      <CreateReviewModal 
        isOpen={isReviewModalOpen}
        onClose={() => {
          setIsReviewModalOpen(false);
          setEditingReview(null);
        }}
        onCreated={() => {
          // Recargar lugar y reseñas para ver la nueva calificación
          getPlace(placeId).then(setPlace);
          getPlaceReviews(placeId).then(setReviews);
        }}
        initialTargetType="place"
        initialTargetId={String(placeId)}
        initialData={editingReview}
      />

      <CreatePlaceModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onCreated={() => {
          // Recargar datos tras edición
          getPlace(placeId).then(setPlace);
        }}
        initialData={place}
      />

      <ReportModal 
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        entityName={place.name}
      />
    </div>
  );
}
