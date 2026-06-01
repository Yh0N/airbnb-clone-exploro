'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Star, MapPin, Share,
  Shield, Store, Phone,
  MessageCircle, ChevronLeft
} from 'lucide-react';
import ImageGallery from '@/components/ImageGallery';
import LoadingSpinner from '@/components/LoadingSpinner';
import { getPyme, getPymeReviews, resolvePhotoUrl } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import CreateReviewModal from '@/components/exploro/CreateReviewModal';

import dynamic from 'next/dynamic';
const MapComponent = dynamic(() => import('@/components/MapView'), { ssr: false });

export default function PymeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [pyme, setPyme] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);

  const pymeId = Number(params.id);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const pymeData = await getPyme(pymeId);
        if (pymeData) {
          setPyme(pymeData);

          setLoadingReviews(true);
          const reviewsData = await getPymeReviews(pymeId);
          setReviews(reviewsData);
        }
      } catch (error) {
        console.error('Error cargando pyme:', error);
      } finally {
        setIsLoading(false);
        setLoadingReviews(false);
      }
    };
    fetchData();
  }, [pymeId]);

  const handleShare = async () => {
    const shareData = {
      title: pyme?.nombre || 'PyME en Exploro',
      text: `¡Mira este negocio en Exploro: ${pyme?.nombre}!`,
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
    const url = `https://www.google.com/maps/dir/?api=1&destination=${pyme.latitud},${pyme.longitud}`;
    window.open(url, '_blank');
  };

  const handleWhatsApp = () => {
    const numero = pyme.whatsapp || pyme.telefono;
    if (!numero) return;
    const phone = numero.startsWith('57') ? numero : `57${numero}`;
    const message = encodeURIComponent(`Hola, vi tu negocio "${pyme.nombre}" en Exploro y me gustaría obtener más información.`);
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  };

  const handleEditReview = (review: any) => {
    setEditingReview({
      id: review.id_resena || review.id,
      puntuacion: review.puntuacion,
      comentarios: review.comentarios
    });
    setIsReviewModalOpen(true);
  };

  if (isLoading) {
    return <LoadingSpinner size="lg" text="Cargando información del negocio..." />;
  }

  if (!pyme) {
    return (
      <div className="max-w-[2520px] mx-auto px-4 sm:px-6 md:px-10 xl:px-20 py-32 text-center bg-neutral-50 dark:bg-neutral-900 min-h-screen">
        <div className="w-24 h-24 bg-white dark:bg-neutral-800 rounded-3xl shadow-sm flex items-center justify-center mx-auto mb-8">
          <Store className="w-12 h-12 text-neutral-400" />
        </div>
        <h2 className="text-3xl font-bold text-neutral-800 dark:text-white mb-3 tracking-tight">Negocio no encontrado</h2>
        <p className="text-neutral-500 dark:text-neutral-400 mb-10 max-w-md mx-auto leading-relaxed">
          El negocio que buscas no está disponible o se ha movido.
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

  const isAdmin = user?.rol === 3;
  const isOwner = isAuthenticated && user?.id === pyme.id_usuario;

  if (!pyme.aprobado && !isAdmin && !isOwner) {
    return (
      <div className="max-w-[2520px] mx-auto px-4 sm:px-6 md:px-10 xl:px-20 py-32 text-center bg-neutral-50 dark:bg-neutral-900 min-h-screen">
        <div className="w-24 h-24 bg-amber-50 dark:bg-amber-900/20 rounded-3xl shadow-sm flex items-center justify-center mx-auto mb-8">
          <Store className="w-12 h-12 text-amber-400" />
        </div>
        <h2 className="text-3xl font-bold text-neutral-800 dark:text-white mb-3 tracking-tight">Negocio pendiente de aprobación</h2>
        <p className="text-neutral-500 dark:text-neutral-400 mb-10 max-w-md mx-auto leading-relaxed">
          Este negocio aún no ha sido aprobado por el equipo de Exploro. Vuelve pronto.
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

  const isGuestFavorite = (pyme.rating ?? 0) >= 4.8;

  return (
    <div className="max-w-[1120px] mx-auto px-4 sm:px-6 py-8 pb-24 md:pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Botón Volver */}
      <button 
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm font-bold text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-all mb-6 group w-fit"
      >
        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Volver
      </button>

      <div className="mb-8">
        <div className="flex flex-col gap-4">
          
          {/* Tipo y Badge PyME */}
          <div className="flex items-center gap-3">
            <span className="bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-neutral-200 dark:border-neutral-700">
              {pyme.tipo || pyme.categoria || 'PyME'}
            </span>
            {pyme.subcategoria && (
              <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-blue-600/20 shadow-sm shadow-blue-600/20">
                {pyme.subcategoria}
              </span>
            )}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest border bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/30">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              PyME / Negocio Local
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl md:text-5xl font-black text-neutral-900 dark:text-white tracking-tighter mb-4">
                {pyme.nombre}
              </h1>
              
              <div className="flex items-center gap-4 text-[15px] text-neutral-600 dark:text-neutral-400 flex-wrap font-medium">
                <div className="flex items-center gap-1.5 text-neutral-900 dark:text-white font-bold">
                  <Star className="w-4 h-4 fill-neutral-900 dark:fill-white" />
                  <span>{pyme.rating?.toFixed(1) || '0.0'}</span>
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
                  <span className="underline underline-offset-4 decoration-neutral-200">{pyme.ubicacion}</span>
                </div>
              </div>
            </div>
            
            {/* ACCIONES PRINCIPALES */}
            <div className="flex flex-col gap-3 w-full md:w-auto">
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${pyme.latitud},${pyme.longitud}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs font-bold text-neutral-700 dark:text-neutral-200 bg-neutral-50 dark:bg-neutral-800 hover:bg-white dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-700 px-4 py-2.5 rounded-xl transition-all hover:shadow-md whitespace-nowrap flex-shrink-0"
                >
                  <MapPin className="w-4 h-4 text-blue-600" />
                  Cómo llegar
                </a>

                {pyme.whatsapp && (
                  <button
                    onClick={handleWhatsApp}
                    className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-800/40 px-4 py-2.5 rounded-xl transition-all hover:shadow-md whitespace-nowrap flex-shrink-0"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-600" />
                    {pyme.whatsapp}
                  </button>
                )}
                {pyme.telefono && (
                  <a
                    href={`tel:${pyme.telefono}`}
                    className="flex items-center gap-2 text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 border border-blue-200 dark:border-blue-800/40 px-4 py-2.5 rounded-xl transition-all hover:shadow-md whitespace-nowrap flex-shrink-0"
                  >
                    <Phone className="w-4 h-4 text-blue-500" />
                    {pyme.telefono}
                  </a>
                )}

                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 text-xs font-bold text-neutral-700 dark:text-neutral-200 bg-neutral-50 dark:bg-neutral-800 hover:bg-white dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-700 px-4 py-2.5 rounded-xl transition-all hover:shadow-md whitespace-nowrap flex-shrink-0"
                >
                  <Share className="w-3.5 h-3.5" />
                  Compartir
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (!isAuthenticated) { router.push('/login'); return; }
                    setIsReviewModalOpen(true);
                  }}
                  className="flex-1 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-all shadow-xl active:scale-95 text-center"
                >
                  Calificar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Galería */}
      <div className="mb-12 shadow-2xl rounded-2xl overflow-hidden">
        <ImageGallery 
          images={pyme.images || []} 
          placeName={pyme.nombre || 'PyME'} 
          entityId={pyme.id}
          entityType="pyme"
          isOwner={isAuthenticated && user?.id === pyme.id_usuario}
          currentUser={user}
          onImageUploaded={(newUrl: string) => {
            const fullUrl = resolvePhotoUrl(newUrl);
            setPyme((prev: any) => prev ? {
              ...prev,
              images: [...(prev.images || []), fullUrl],
              image: prev.image || fullUrl
            } : null);
          }}
          onImageDeleted={(deletedUrl: string) => {
            setPyme((prev: any) => prev ? {
              ...prev,
              images: (prev.images || []).filter((url: string) => url !== deletedUrl)
            } : null);
          }}
        />
      </div>

      {/* Contenido Principal */}
      <div className="max-w-4xl mx-auto space-y-12">
          
          {/* Info del negocio */}
          <div className="flex items-center justify-between pb-10 border-b border-neutral-100 dark:border-neutral-800">
            <div>
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">
                Negocio local registrado en Exploro
              </h2>
              <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400 mt-2 font-medium">
                <span className="capitalize">{pyme.tipo || pyme.categoria || 'PyME'}</span>
              </div>
            </div>
            <div className="relative group">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white text-2xl font-black shadow-lg group-hover:rotate-6 transition-transform">
                <Store className="w-8 h-8" />
              </div>
              <div className="absolute -bottom-1 -right-1 bg-white dark:bg-neutral-800 p-1 rounded-full shadow-md">
                <Shield className="w-4 h-4 text-amber-500" fill="currentColor" fillOpacity={0.2} />
              </div>
            </div>
          </div>

          {/* Rating Destacado */}
          {isGuestFavorite && (
            <div className="py-2 border-b border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center gap-8 bg-neutral-50/50 dark:bg-neutral-800/50 p-6 rounded-3xl border border-neutral-100 dark:border-neutral-700">
                <div className="flex flex-col items-center">
                  <span className="text-5xl font-black text-neutral-900 dark:text-white">{pyme.rating}</span>
                  <div className="flex mt-1 text-neutral-900 dark:text-white">
                    {[1,2,3,4,5].map(i => (
                      <Star key={i} className="w-3 h-3 fill-current" />
                    ))}
                  </div>
                </div>
                <div className="w-px h-16 bg-neutral-200 dark:bg-neutral-700" />
                <div>
                  <h3 className="font-bold text-lg text-neutral-900 dark:text-white">Favorito de viajeros</h3>
                  <p className="text-neutral-500 dark:text-neutral-400 text-[15px] mt-1 leading-relaxed">
                    Uno de los negocios más queridos en Exploro según las opiniones reales de nuestra comunidad.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Descripción */}
          <div className="pb-12 border-b border-neutral-100 dark:border-neutral-800">
            <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-6 tracking-tight">Sobre este negocio</h3>
            <div className="text-neutral-600 dark:text-neutral-300 leading-8 text-[17px] space-y-4">
              {pyme.descripcion ? (
                <p>{pyme.descripcion}</p>
              ) : (
                <div className="bg-neutral-50 dark:bg-neutral-800 p-6 rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-700 flex items-center gap-4 text-neutral-400 dark:text-neutral-500">
                  <Store className="w-5 h-5" />
                  <p>Aún no hay una descripción detallada para este negocio.</p>
                </div>
              )}
            </div>
          </div>

          {/* Ubicación y Mapa */}
          <div>
            <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2 tracking-tight">Dónde están</h3>
            <p className="text-neutral-500 dark:text-neutral-400 mb-8 font-medium">{pyme.ubicacion}, Nariño</p>
            <div className="h-[450px] rounded-3xl overflow-hidden border border-neutral-200 dark:border-neutral-700 shadow-inner group">
              <MapComponent
                latitude={pyme.latitud || 0}
                longitude={pyme.longitud || 0}
                name={pyme.nombre || 'PyME'}
              />
            </div>
          </div>
      </div>

      {/* Sección de Reseñas */}
      <div id="reviews-section" className="mt-24 pt-16 border-t border-neutral-100 dark:border-neutral-800">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-12">
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-neutral-900 dark:text-white tracking-tight flex items-center gap-3">
              <Star className="w-8 h-8 text-amber-400 fill-amber-400" />
              {pyme.rating?.toFixed(1) || '0.0'} · {reviews.length} reseñas
            </h2>
            <p className="text-neutral-500 dark:text-neutral-400 mt-2 font-medium">Lo que opinan otros sobre este negocio</p>
          </div>
          
          <button 
            onClick={() => {
              if (!isAuthenticated) {
                router.push('/login');
                return;
              }
              setIsReviewModalOpen(true);
            }}
            className="bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 px-8 py-4 rounded-2xl font-bold hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-all shadow-lg active:scale-95"
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
            {reviews.map((review: any, idx: number) => (
              <div key={idx} className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => router.push(`/users/${review.id_usuario}`)}
                    className="flex items-center gap-4 hover:opacity-80 transition-opacity text-left"
                  >
                    <div className="w-12 h-12 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-lg font-black text-neutral-400 dark:text-neutral-500">
                      {review.nombre_usuario?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <h4 className="font-bold text-neutral-900 dark:text-white hover:underline decoration-neutral-300 underline-offset-4">{review.nombre_usuario || 'Usuario de Exploro'}</h4>
                      <p className="text-xs text-neutral-400 dark:text-neutral-500 font-medium">{new Date(review.fecha).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}</p>
                    </div>
                  </button>

                  {user && review.id_usuario === user.id && (
                    <button 
                      onClick={() => handleEditReview(review)}
                      className="ml-auto text-xs font-bold text-neutral-400 hover:text-neutral-900 dark:hover:text-white underline underline-offset-4 decoration-neutral-200 hover:decoration-neutral-900 transition-all"
                    >
                      Editar
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-1 text-neutral-900 dark:text-white scale-90 origin-left">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-3 h-3 ${i < review.puntuacion ? 'fill-current text-amber-400' : 'text-neutral-200 dark:text-neutral-700'}`} />
                  ))}
                </div>
                <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed text-[15px]">
                  {review.comentarios}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded-[40px] p-16 text-center border-2 border-dashed border-neutral-200 dark:border-neutral-700">
            <div className="w-20 h-20 bg-white dark:bg-neutral-800 rounded-3xl shadow-sm flex items-center justify-center mx-auto mb-6 text-3xl">
              <Store className="w-10 h-10 text-neutral-400" />
            </div>
            <h3 className="text-xl font-bold text-neutral-800 dark:text-white mb-2">Aún no hay reseñas</h3>
            <p className="text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto mb-8 font-medium">
              Sé el primero en compartir tu experiencia con este negocio para ayudar a otros viajeros de la comunidad.
            </p>
            <button 
              onClick={() => setIsReviewModalOpen(true)}
              className="font-bold text-neutral-900 dark:text-white underline underline-offset-8 decoration-2 hover:text-airbnb transition-colors"
            >
              Calificar ahora
            </button>
          </div>
        )}
      </div>

      <CreateReviewModal 
        isOpen={isReviewModalOpen}
        onClose={() => {
          setIsReviewModalOpen(false);
          setEditingReview(null);
        }}
        onCreated={() => {
          getPyme(pymeId).then(setPyme);
          getPymeReviews(pymeId).then(setReviews);
        }}
        initialTargetType="pyme"
        initialTargetId={String(pymeId)}
        initialData={editingReview}
      />

    </div>
  );
}
