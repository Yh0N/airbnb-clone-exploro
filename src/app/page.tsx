'use client';

// ===== HOME PAGE - AIRBNB NEXT GEN =====
// Hub central que alterna entre Alojamientos, Experiencias y Servicios con Carruceles y Grillas

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Map, List } from 'lucide-react';

import CategoryBar from '@/components/CategoryBar';
import PlaceCard from '@/components/PlaceCard';
import PlaceGrid from '@/components/PlaceGrid';
import CarouselGrid from '@/components/CarouselGrid';
import ExperienceCard from '@/components/ExperienceCard';
import ServiceCard from '@/components/ServiceCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import ExploroDashboard from '@/components/exploro/ExploroDashboard';

import { useAppStore } from '@/store/useAppStore';
import { getPlaces, getExperiences, getServices } from '@/services/api';
import type { Place, Experience, Service } from '@/services/mockData';

// Dynamic Map Component (client-side only to avoid SSR issues with Leaflet)
import dynamic from 'next/dynamic';
const MapView = dynamic(() => import('@/components/MapView'), { ssr: false, loading: () => <LoadingSpinner /> });

export default function Home() {
  const searchParams = useSearchParams();
  const searchParam = searchParams.get('search');
  
  // Zustand State
  const activeTab = useAppStore(state => state.activeTab);
  const activeCategory = useAppStore(state => state.activeCategory);
  const setActiveCategory = useAppStore(state => state.setActiveCategory);
  const searchQuery = useAppStore(state => state.searchQuery);

  // Local Data State
  const [places, setPlaces] = useState<Place[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [showMapView, setShowMapView] = useState(false);

  // Efecto principal para cargar la data dependiendo del Tab
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const query = searchParam || searchQuery;
        
        if (activeTab === 'stays') {
          const data = await getPlaces(query, activeCategory);
          setPlaces(data);
        } else if (activeTab === 'experiences') {
          const data = await getExperiences(activeCategory);
          setExperiences(data);
        } else if (activeTab === 'services') {
          const data = await getServices(activeCategory);
          setServices(data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        // Simular transition delay suave
        setTimeout(() => setIsLoading(false), 300);
      }
    };

    fetchData();
  }, [activeTab, activeCategory, searchParam, searchQuery]);

  // Si estamos en Mobile y ocultamos Search, aseguremos que el state esté limpio
  useEffect(() => {
    setActiveCategory('all');
  }, [activeTab, setActiveCategory]);

  return (
    <div className="min-h-screen bg-bg-primary transition-colors duration-300 relative pb-20">
      
      {/* Tab: Alojamientos */}
      {activeTab === 'stays' && (
        <>
          <div className="max-w-[2520px] mx-auto px-4 sm:px-6 md:px-10 xl:px-20 mt-6 md:mt-10">
            {showMapView ? (
              <div className="h-[calc(100vh-250px)] w-full rounded-2xl overflow-hidden shadow-card border border-neutral-200 dark:border-border-color animate-fade-in relative z-0">
                <MapView 
                  latitude={1.2136} 
                  longitude={-77.2811} 
                  name="Pasto Central" 
                  // Here we could pass places[] to MapView to render multiple pins
                />
              </div>
            ) : isLoading ? (
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

      {/* Floating Map Toggle Button (Solo en stays y mobile) */}
      {activeTab === 'stays' && !isLoading && places.length > 0 && (
        <div className="fixed bottom-24 md:bottom-12 left-1/2 -translate-x-1/2 z-40 animate-fade-in drop-shadow-2xl">
          <button
            onClick={() => setShowMapView(!showMapView)}
            className="flex items-center gap-2 bg-neutral-900 dark:bg-neutral-800 hover:bg-black dark:hover:bg-neutral-700 hover:scale-105 transition-all text-white px-5 py-3.5 rounded-full font-bold shadow-lg border border-neutral-700"
          >
            {showMapView ? (
              <>
                <span>Mostrar lista</span>
                <List className="w-4 h-4" />
              </>
            ) : (
              <>
                <span>Mostrar mapa</span>
                <Map className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
