'use client';

// ===== HOME PAGE - AIRBNB NEXT GEN =====
// Hub central que alterna entre Alojamientos, Experiencias y Servicios con Carruceles y Grillas

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { X, Star, MapPin, MessageCircle, Zap, Users, CheckCircle } from 'lucide-react';

import PlaceCard from '@/components/PlaceCard';
import CarouselGrid from '@/components/CarouselGrid';
import ExperienceCard from '@/components/ExperienceCard';
import ServiceCard from '@/components/ServiceCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import ExploroDashboard from '@/components/exploro/ExploroDashboard';

import { useAppStore } from '@/store/useAppStore';
import { getPlaces, getExperiences, getServices } from '@/services/api';
import type { Place, Experience, Service } from '@/services/mockData';


function HomeContent() {
  const searchParams = useSearchParams();
  const searchParam = searchParams.get('search');

  // Zustand State
  const activeTab = useAppStore(state => state.activeTab);
  const searchQuery = useAppStore(state => state.searchQuery);

  // Local Data State
  const [places, setPlaces] = useState<Place[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [services, setServices] = useState<Service[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [dismissedHints, setDismissedHints] = useState<Set<string>>(new Set());

  const dismissHint = (tab: string) => setDismissedHints(prev => new Set(prev).add(tab));

  // Efecto principal para cargar la data dependiendo del Tab
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const query = searchParam || searchQuery;

        if (activeTab === 'stays') {
          const data = await getPlaces(query);
          setPlaces(data);
        } else if (activeTab === 'experiences') {
          const data = await getExperiences();
          setExperiences(data);
        } else if (activeTab === 'services') {
          const data = await getServices();
          setServices(data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setTimeout(() => setIsLoading(false), 300);
      }
    };

    fetchData();
  }, [activeTab, searchParam, searchQuery]);

  return (
    <div className="min-h-screen bg-bg-primary transition-colors duration-300 relative pb-20">

      {/* Tab: Alojamientos */}
      {activeTab === 'stays' && (
        <>
          <div className="max-w-[2520px] mx-auto px-4 sm:px-6 md:px-10 xl:px-20 mt-4 md:mt-8">

            {/* Hint: cómo funcionan las recomendaciones */}
            {!dismissedHints.has('stays') && (
              <div className="relative mb-6 rounded-2xl border border-airbnb/20 bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/20 dark:border-airbnb/30 p-4 animate-fade-in">
                <button
                  onClick={() => dismissHint('stays')}
                  className="absolute top-3 right-3 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
                  aria-label="Cerrar"
                >
                  <X className="w-4 h-4" />
                </button>
                <p className="text-sm font-semibold text-airbnb mb-3">¿Cómo funcionan las recomendaciones?</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="flex items-start gap-2">
                    <Star className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-neutral-800 dark:text-white">Populares</p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">Los lugares con mejor calificación y más reseñas aparecen primero.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-neutral-800 dark:text-white">Cerca de ti</p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">Activa tu ubicación para ver los lugares más cercanos a donde estás.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <MessageCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-neutral-800 dark:text-white">Deja tu reseña</p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">Califica cada lugar que visites y ayuda a otros viajeros a elegir mejor.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {isLoading ? (
              <div className="flex justify-center py-20"><LoadingSpinner size="lg" text="Cargando alojamientos..." /></div>
            ) : places.length === 0 ? (
              <div className="flex justify-center py-20 text-neutral-500 dark:text-neutral-400">No se encontraron alojamientos.</div>
            ) : (
              <div className="animate-fade-in pb-12">
                <CarouselGrid title="Alojamientos populares en tu zona">
                  {places.slice(0, 5).map(place => <PlaceCard key={place.id} place={place} />)}
                </CarouselGrid>

                {places.length > 5 && (
                  <CarouselGrid title="Disponibles este fin de semana">
                    {places.slice(5).map(place => <PlaceCard key={`weekend-${place.id}`} place={place} />)}
                  </CarouselGrid>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {/* Tab: Experiencias */}
      {activeTab === 'experiences' && (
        <div className="animate-fade-in pb-12">
          <div className="pt-8 mb-4 max-w-[2520px] mx-auto px-4 sm:px-6 md:px-10 xl:px-20">
            <h1 className="text-3xl font-bold text-neutral-800 dark:text-white mb-2">
              Experiencias inolvidables
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400">Actividades lideradas por anfitriones locales.</p>

            {/* Hint: qué son las experiencias */}
            {!dismissedHints.has('experiences') && (
              <div className="relative mt-4 rounded-2xl border border-purple-200 bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-950/30 dark:to-violet-950/20 dark:border-purple-800/40 p-4 animate-fade-in">
                <button
                  onClick={() => dismissHint('experiences')}
                  className="absolute top-3 right-3 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
                  aria-label="Cerrar"
                >
                  <X className="w-4 h-4" />
                </button>
                <p className="text-sm font-semibold text-purple-700 dark:text-purple-400 mb-3">¿Qué son las experiencias?</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="flex items-start gap-2">
                    <Zap className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-neutral-800 dark:text-white">Actividades únicas</p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">Talleres, tours y aventuras organizadas por anfitriones locales de Pasto.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Star className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-neutral-800 dark:text-white">Las más populares primero</p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">Ordenadas por las mejores calificaciones dejadas por otros viajeros.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <MessageCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-neutral-800 dark:text-white">Comparte tu opinión</p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">Tras participar, deja una reseña para que el sistema te recomiende mejores experiencias.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20"><LoadingSpinner size="lg" text="Cargando experiencias..." /></div>
          ) : experiences.length === 0 ? (
            <div className="flex justify-center py-20 text-neutral-500 dark:text-neutral-400">No hay experiencias para esta categoría.</div>
          ) : (
            <>
              {/* Carrusel Destacados */}
              <CarouselGrid title="Más populares" subtitle="Descubre las actividades favoritas">
                {experiences.map(exp => <ExperienceCard key={exp.id} experience={exp} />)}
              </CarouselGrid>

              {/* Carrusel Aventura */}
              <CarouselGrid title="Sumérgete en la cultura local" subtitle="Exploro Originals">
                {experiences.filter(e => e.isOriginal).map(exp => <ExperienceCard key={`orig-${exp.id}`} experience={exp} />)}
              </CarouselGrid>
            </>
          )}
        </div>
      )}

      {/* Tab: Servicios */}
      {activeTab === 'services' && (
        <div className="animate-fade-in pb-12">
          <div className="pt-8 mb-4 max-w-[2520px] mx-auto px-4 sm:px-6 md:px-10 xl:px-20">
            <h1 className="text-3xl font-bold text-neutral-800 dark:text-white mb-2">
              Servicios Premium
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400">Encuentra fotógrafos, guías, chefs y más a un clic.</p>

            {/* Hint: qué son los servicios */}
            {!dismissedHints.has('services') && (
              <div className="relative mt-4 rounded-2xl border border-teal-200 bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-950/30 dark:to-cyan-950/20 dark:border-teal-800/40 p-4 animate-fade-in">
                <button
                  onClick={() => dismissHint('services')}
                  className="absolute top-3 right-3 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
                  aria-label="Cerrar"
                >
                  <X className="w-4 h-4" />
                </button>
                <p className="text-sm font-semibold text-teal-700 dark:text-teal-400 mb-3">¿Cómo funcionan los servicios?</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="flex items-start gap-2">
                    <Users className="w-4 h-4 text-teal-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-neutral-800 dark:text-white">Negocios locales</p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">PYMEs de Pasto verificadas que ofrecen servicios para tu viaje.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-neutral-800 dark:text-white">Calificados por viajeros</p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">Cada proveedor tiene calificación de usuarios reales. Los mejores aparecen primero.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <MessageCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-neutral-800 dark:text-white">Reseña al proveedor</p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">Después de usar un servicio, califica al proveedor para ayudar a la comunidad.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20"><LoadingSpinner size="lg" text="Cargando servicios..." /></div>
          ) : services.length === 0 ? (
            <div className="flex justify-center py-20 text-neutral-500 dark:text-neutral-400">No hay servicios para esta categoría.</div>
          ) : (
            <>
              <CarouselGrid title="Profesionales destacados" subtitle="Altamente calificados por los viajeros">
                {services.map(srv => <ServiceCard key={srv.id} service={srv} />)}
              </CarouselGrid>
            </>
          )}
        </div>
      )}

      {/* Tab: Exploro (Dashboard CRUD) */}
      {activeTab === 'exploro' && (
        <ExploroDashboard />
      )}

    </div>
  );
}

export default function Home() {
  return (
    <React.Suspense fallback={<div className="flex justify-center py-20"><LoadingSpinner size="lg" text="Preparando Exploro..." /></div>}>
      <HomeContent />
    </React.Suspense>
  );
}
