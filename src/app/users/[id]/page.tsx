'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { User, MapPin, Star, Calendar, MessageSquare, Award, ArrowLeft, Loader2 } from 'lucide-react';
import * as api from '@/services/api';
import PlaceGrid from '@/components/PlaceGrid';
import LoadingSpinner from '@/components/LoadingSpinner';
import CreateReviewModal from '@/components/exploro/CreateReviewModal';
import { useAuth } from '@/context/AuthContext';

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
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-12 animate-fade-in">
      {/* Botón de volver */}
      <button 
        onClick={() => router.back()}
        className="flex items-center gap-2 text-neutral-500 hover:text-neutral-800 font-bold mb-8 transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
        Volver al Dashboard
      </button>

      <div className="flex flex-col md:flex-row gap-10">
        {/* Lado Izquierdo: Tarjeta de Perfil */}
        <aside className="w-full md:w-[350px] shrink-0">
          <div className="bg-white dark:bg-neutral-900 rounded-[40px] border border-neutral-200 dark:border-neutral-800 p-8 shadow-xl shadow-neutral-100 dark:shadow-none sticky top-24">
            {/* Avatar Section */}
            <div className="relative mb-6">
                <div className="w-32 h-32 mx-auto rounded-full overflow-hidden ring-4 ring-neutral-50 dark:ring-neutral-800 shadow-lg">
                    {profile.avatar ? (
                        <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-airbnb to-airbnb-dark flex items-center justify-center">
                            <User className="text-white w-12 h-12" />
                        </div>
                    )}
                </div>
                {profile.rol === 3 && (
                    <div className="absolute bottom-1 right-1/2 translate-x-10 bg-purple-500 text-white p-1.5 rounded-full shadow-md border-2 border-white">
                        <Award className="w-4 h-4" />
                    </div>
                )}
            </div>

            <div className="text-center">
                <h1 className="text-3xl font-black text-neutral-800 dark:text-white tracking-tight">{profile.name}</h1>
                <div className="flex items-center justify-center gap-2 mt-2">
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${
                        profile.rol === 3 ? 'bg-purple-100 text-purple-600' : 
                        profile.rol === 2 ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
                    }`}>
                        {profile.rol === 3 ? 'Administrador' : profile.rol === 2 ? 'Empresario' : 'Explorador'}
                    </span>
                </div>
            </div>

            {/* Stats Rápidos */}
            <div className="grid grid-cols-2 gap-4 mt-8 py-6 border-y border-neutral-100 dark:border-neutral-800">
                <div className="text-center">
                    <p className="text-xl font-black text-neutral-800 dark:text-white">{userPlaces.length}</p>
                    <p className="text-[10px] font-bold text-neutral-400 uppercase">Lugares</p>
                </div>
                <div className="text-center">
                    <p className="text-xl font-black text-neutral-800 dark:text-white">{profile.rating?.toFixed(1) || '0.0'}</p>
                    <p className="text-[10px] font-bold text-neutral-400 uppercase">Rating</p>
                </div>
            </div>

            {/* Detalles de contacto/info */}
            <div className="mt-8 space-y-4">
                <div className="flex items-center gap-3 text-neutral-600 dark:text-neutral-400">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm font-medium">Miembro desde {profile.member_since}</span>
                </div>
                <div className="flex items-center gap-3 text-neutral-600 dark:text-neutral-400">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm font-medium">Pasto, Nariño</span>
                </div>
                <div className="flex items-center gap-3 text-neutral-600 dark:text-neutral-400">
                    <MessageSquare className="w-4 h-4" />
                    <span className="text-sm font-medium">Habla Español</span>
                </div>
            </div>

            <div className="flex flex-col gap-3 mt-10">
                <button className="w-full py-4 bg-neutral-900 dark:bg-white dark:text-neutral-900 text-white rounded-2xl font-bold hover:scale-[1.02] active:scale-95 transition-all shadow-lg">
                    Enviar Mensaje
                </button>
                
                {currentUser && currentUser.id !== userId && (
                    <button 
                        onClick={() => setIsReviewModalOpen(true)}
                        className="w-full py-4 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white border-2 border-neutral-100 dark:border-neutral-700 rounded-2xl font-bold hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-all flex items-center justify-center gap-2"
                    >
                        <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                        Calificar Usuario
                    </button>
                )}
            </div>
          </div>
        </aside>

        {/* Lado Derecho: Biografía e Intereses */}
        <main className="flex-1 space-y-10">
            {/* Biografía Section */}
            <section className="bg-white dark:bg-neutral-900 p-10 rounded-[40px] border border-neutral-200 dark:border-neutral-800 shadow-sm">
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
