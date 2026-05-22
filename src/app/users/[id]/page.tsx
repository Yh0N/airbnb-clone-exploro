'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { User, MapPin, Star, Calendar, MessageSquare, Award, ArrowLeft, Loader2 } from 'lucide-react';
import * as api from '@/services/api';
import PlaceGrid from '@/components/PlaceGrid';
import LoadingSpinner from '@/components/LoadingSpinner';
import CreateReviewModal from '@/components/exploro/CreateReviewModal';
import { useAuth } from '@/context/AuthContext';
import { isImageValid } from '@/components/exploro/ExploroDashboard';

export default function PublicProfilePage() {
  const params = useParams();
  const router = useRouter();
  const userId = Number(params.id);
  
  const [profile, setProfile] = useState<any>(null);
  const [userPlaces, setUserPlaces] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const { user: currentUser } = useAuth();
  const [avatarError, setAvatarError] = useState(false);

  useEffect(() => {
    const fetchPublicData = async () => {
      setIsLoading(true);
      try {
        const [userData, allPlaces] = await Promise.all([
          api.getUserPublicProfile(userId),
          api.getPlaces()
        ]);
        
        setProfile(userData);
        
        // Filtrar lugares que pertenecen a este usuario
        const filteredPlaces = allPlaces.filter((p: any) => p.id_usuario === userId);
        setUserPlaces(filteredPlaces);
        
      } catch (err: any) {
        console.error("Error cargando perfil público:", err);
        setError("No se pudo cargar el perfil del usuario.");
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      fetchPublicData();
    }
  }, [userId]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 animate-spin text-airbnb mb-4" />
        <p className="text-neutral-500 font-bold italic uppercase tracking-widest">Consultando Ecosistema Exploro...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 py-20 text-center">
        <div className="bg-red-50 text-red-600 p-8 rounded-3xl border border-red-100 inline-block">
          <Award className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <h2 className="text-2xl font-black mb-2">¡Ups! Algo salió mal</h2>
          <p className="font-medium mb-6">{error || "El usuario solicitado no existe."}</p>
          <button 
            onClick={() => router.back()}
            className="bg-neutral-800 text-white px-8 py-3 rounded-xl font-bold hover:bg-neutral-900 transition-all"
          >
            Volver atrás
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8 md:py-12 animate-fade-in">
      {/* Botón de volver */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-neutral-500 hover:text-neutral-800 dark:hover:text-white font-bold mb-6 md:mb-8 transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
        Volver al Dashboard
      </button>

      <div className="flex flex-col md:flex-row gap-6 md:gap-10">
        {/* Lado Izquierdo: Tarjeta de Perfil */}
        <aside className="w-full md:w-[320px] lg:w-[350px] shrink-0">
          {/* En móvil: layout horizontal compacto. En desktop: tarjeta sticky vertical */}
          <div className="bg-white dark:bg-neutral-900 rounded-3xl md:rounded-[40px] border border-neutral-200 dark:border-neutral-800 p-5 md:p-8 shadow-lg shadow-neutral-100 dark:shadow-none md:sticky md:top-24 md:max-h-[calc(100vh-120px)] md:overflow-y-auto">

            {/* Mobile: fila horizontal avatar + info + botón */}
            <div className="flex md:flex-col items-center gap-4 md:gap-0">
              {/* Avatar */}
              <div className="relative flex-shrink-0 md:mb-6">
                <div className="w-20 h-20 md:w-32 md:h-32 md:mx-auto rounded-full overflow-hidden ring-4 ring-neutral-50 dark:ring-neutral-800 shadow-lg">
                  {profile.avatar && isImageValid(profile.avatar) && !avatarError ? (
                    <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" onError={() => setAvatarError(true)} />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-airbnb to-airbnb-dark flex items-center justify-center">
                      <User className="text-white w-8 h-8 md:w-12 md:h-12" />
                    </div>
                  )}
                </div>
                {profile.rol === 3 && (
                  <div className="absolute -bottom-1 -right-1 bg-purple-500 text-white p-1 md:p-1.5 rounded-full shadow-md border-2 border-white">
                    <Award className="w-3 h-3 md:w-4 md:h-4" />
                  </div>
                )}
              </div>

              {/* Nombre + badge + calificar (en móvil alineado a la izquierda) */}
              <div className="flex-1 md:text-center md:w-full">
                <h1 className="text-xl md:text-3xl font-black text-neutral-800 dark:text-white tracking-tight leading-tight">{profile.name}</h1>
                <div className="flex items-center gap-2 mt-1 md:justify-center">
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${
                    profile.rol === 3 ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' :
                    profile.rol === 2 ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' :
                    'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                  }`}>
                    {profile.rol === 3 ? 'Administrador' : profile.rol === 2 ? 'Empresario' : 'Explorador'}
                  </span>
                </div>

                {/* Botón calificar — visible en móvil junto al nombre */}
                {currentUser && currentUser.id !== userId && (
                  <button
                    onClick={() => setIsReviewModalOpen(true)}
                    className="mt-3 md:hidden flex items-center gap-2 px-4 py-2.5 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/30 rounded-2xl font-bold text-sm hover:bg-amber-100 transition-all active:scale-95"
                  >
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    Calificar Usuario
                  </button>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mt-5 md:mt-8 py-4 md:py-6 border-y border-neutral-100 dark:border-neutral-800">
              <div className="text-center">
                <p className="text-lg md:text-xl font-black text-neutral-800 dark:text-white">{userPlaces.length}</p>
                <p className="text-[10px] font-bold text-neutral-400 uppercase">Lugares</p>
              </div>
              <div className="text-center">
                <p className="text-lg md:text-xl font-black text-neutral-800 dark:text-white">{profile.rating?.toFixed(1) || '0.0'}</p>
                <p className="text-[10px] font-bold text-neutral-400 uppercase">Rating</p>
              </div>
            </div>

            {/* Botón calificar — solo en desktop */}
            {currentUser && currentUser.id !== userId && (
              <div className="hidden md:flex flex-col gap-3 mt-6">
                <button
                  onClick={() => setIsReviewModalOpen(true)}
                  className="w-full py-4 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-2 border-amber-100 dark:border-amber-900/30 rounded-2xl font-bold hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  Calificar Usuario
                </button>
              </div>
            )}
          </div>
        </aside>

        {/* Lado Derecho: Biografía e Intereses */}
        <main className="flex-1 space-y-6 md:space-y-10">
            {/* Biografía Section */}
            <section className="bg-white dark:bg-neutral-900 p-6 md:p-10 rounded-3xl md:rounded-[40px] border border-neutral-200 dark:border-neutral-800 shadow-sm">
                <h2 className="text-2xl font-black text-neutral-800 dark:text-white mb-6">Sobre mí</h2>
                <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed text-lg italic">
                    {profile.biography || `${profile.name} aún no ha añadido una biografía pública.`}
                </p>

                {profile.interests && profile.interests.length > 0 && (
                    <div className="mt-8">
                        <h3 className="text-xs font-black text-neutral-400 uppercase tracking-widest mb-4">Intereses</h3>
                        <div className="flex flex-wrap gap-2">
                            {profile.interests.map((interest: string) => (
                                <span key={interest} className="px-4 py-2 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-xl text-xs font-bold capitalize border border-neutral-200 dark:border-neutral-700">
                                    {interest}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </section>

            {/* Lugares de este usuario */}
            <section>
                <div className="flex items-center justify-between mb-8 px-2">
                    <h2 className="text-2xl font-black text-neutral-800 dark:text-white">Lugares de {profile.name}</h2>
                    <span className="text-sm font-bold text-neutral-400">{userPlaces.length} resultados</span>
                </div>

                {userPlaces.length > 0 ? (
                    <PlaceGrid places={userPlaces} />
                ) : (
                    <div className="bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-100 dark:border-neutral-800 rounded-[40px] py-20 text-center">
                        <MapPin className="w-16 h-16 text-neutral-200 dark:text-neutral-800 mx-auto mb-4" />
                        <p className="text-neutral-500 font-bold italic">Este usuario aún no ha publicado lugares.</p>
                    </div>
                )}
            </section>
        </main>
      </div>

      <CreateReviewModal 
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        onCreated={() => {
          // Recargar perfil para ver la nueva calificación
          api.getUserPublicProfile(userId).then(setProfile);
        }}
        initialTargetType="user"
        initialTargetId={String(userId)}
      />
    </div>
  );
}
