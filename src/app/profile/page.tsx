'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { User, Heart, MapPin, Settings, Shield, Star, ChevronRight, Camera, Key, Upload, Image, ChevronLeft } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import PlaceGrid from '@/components/PlaceGrid';
import LoadingSpinner from '@/components/LoadingSpinner';
import { getPlaces, getRecommendations } from '@/services/api';
import type { Place } from '@/services/mockData';

// Componente para seleccionar intereses en el form
function InterestSelector({ 
  selected, 
  onToggle 
}: { 
  selected: string[], 
  onToggle: (id: string) => void 
}) {
  const categories = [
    { id: 'naturaleza', icon: '🌳', label: 'Naturaleza' },
    { id: 'cultura', icon: '🏛️', label: 'Cultura' },
    { id: 'gastronomia', icon: '🍕', label: 'Gastronomía' },
    { id: 'aventura', icon: '🧗', label: 'Aventura' },
    { id: 'religion', icon: '⛪', label: 'Religión' },
    { id: 'artesania', icon: '🎨', label: 'Artesanía' },
    { id: 'termal', icon: '♨️', label: 'Termal' },
    { id: 'mirador', icon: '👀', label: 'Mirador' }
  ];

  return (
    <div className="flex flex-wrap gap-3">
      {categories.map((cat) => (
        <button
          key={cat.id}
          type="button"
          onClick={() => onToggle(cat.id)}
          className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 transition-all shadow-sm ${
            selected.includes(cat.id)
              ? 'bg-airbnb text-white shadow-airbnb/20'
              : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
          }`}
        >
          <span>{cat.icon}</span> {cat.label}
        </button>
      ))}
    </div>
  );
}

function ProfileContent() {
  const { user, isAuthenticated, isLoading: authLoading, logout, updateProfile } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab') || 'info';

  const [activeTab, setActiveTab] = useState(tabParam);
  const [settingsTab, setSettingsTab] = useState<'personal' | 'security'>('personal');
  const [favorites, setFavorites] = useState<Place[]>([]);
  const [recommendations, setRecommendations] = useState<Place[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Estado para el formulario de edición personal
  const [editForm, setEditForm] = useState({
    name: '',
    photo: '',
    biography: '',
    interests: [] as string[],
    is_public: true
  });

  // Estado para el formulario de seguridad
  const [securityForm, setSecurityForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Referencias para los inputs ocultos de foto
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const cameraInputRef = React.useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditForm(prev => ({ ...prev, photo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Mensaje de estado para configuraciones
  const [settingsMsg, setSettingsMsg] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  // Inicializar formulario cuando el usuario carga
  useEffect(() => {
    if (user) {
      setEditForm({
        name: user.name || '',
        photo: user.avatar || '',
        biography: user.biography || '',
        interests: user.interests || [],
        is_public: user.is_public !== undefined ? user.is_public : true
      });
    }
  }, [user]);

  // Redirigir si no está autenticado
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  // Cargar datos según pestaña activa
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      setIsLoading(true);
      try {
        if (activeTab === 'recommendations') {
          const recs = await getRecommendations();
          setRecommendations(recs);
        } else if (activeTab === 'favorites') {
          const allPlaces = await getPlaces();
          const favIds = user.favorites?.map((f: any) => typeof f === 'object' ? f.id : f) || [];
          const favs = allPlaces.filter(p => favIds.includes(p.id));
          setFavorites(favs);
        }
      } catch (error) {
        console.error('Error cargando datos:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [activeTab, user]);

  useEffect(() => {
    setActiveTab(tabParam);
  }, [tabParam]);

  if (authLoading) {
    return <LoadingSpinner size="lg" text="Cargando perfil..." />;
  }

  if (!user) return null;

  const tabs = [
    { id: 'info', label: 'Resumen', icon: User },
    { id: 'favorites', label: 'Favoritos', icon: Heart },
    { id: 'recommendations', label: 'Recomendaciones', icon: MapPin },
    { id: 'settings', label: 'Configuración', icon: Settings },
  ];

  const handleSaveProfile = async () => {
    setIsLoading(true);
    setSettingsMsg(null);
    try {
      await updateProfile(editForm);
      setSettingsMsg({ text: 'Perfil actualizado exitosamente', type: 'success' });
    } catch (err) {
      console.error("Error actualizando perfil:", err);
      setSettingsMsg({ text: 'Error al actualizar el perfil', type: 'error' });
    } finally {
      setIsLoading(false);
      setTimeout(() => setSettingsMsg(null), 3000);
    }
  };

  const handleSaveSecurity = async () => {
    setSettingsMsg(null);
    if (securityForm.newPassword !== securityForm.confirmPassword) {
      setSettingsMsg({ text: 'Las contraseñas no coinciden', type: 'error' });
      return;
    }
    if (securityForm.newPassword.length < 6) {
      setSettingsMsg({ text: 'La contraseña debe tener al menos 6 caracteres', type: 'error' });
      return;
    }

    setIsLoading(true);
    try {
      // Simular cambio de contraseña
      await new Promise(resolve => setTimeout(resolve, 800));
      // Reset form
      setSecurityForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setSettingsMsg({ text: 'Contraseña actualizada exitosamente', type: 'success' });
    } catch (err) {
      setSettingsMsg({ text: 'Error al actualizar la contraseña', type: 'error' });
    } finally {
      setIsLoading(false);
      setTimeout(() => setSettingsMsg(null), 3000);
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8">
      {/* Botón Volver */}
      <button 
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm font-bold text-neutral-500 hover:text-neutral-900 transition-all mb-6 group w-fit"
      >
        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Volver
      </button>
      {/* Header del perfil general */}
      <div className="flex flex-col md:flex-row gap-8 mb-10">
        
        {/* Contenido principal */}
        <div className="flex-1 w-full">
          {/* Tabs */}
          <div className="flex gap-2 border-b border-neutral-200 mb-8 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-4 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-airbnb text-airbnb'
                      : 'border-transparent text-neutral-500 hover:text-neutral-800 hover:border-neutral-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab: Resumen (Antiguo Información) */}
          {activeTab === 'info' && (
            <div className="animate-fade-in flex flex-col md:flex-row gap-8">
              {/* Tarjeta de Perfil Izquierda */}
              <div className="w-full md:w-[320px] shrink-0">
                <div className="border border-neutral-200 rounded-3xl p-8 text-center shadow-sm bg-white">
                  <div className="w-32 h-32 mx-auto rounded-full overflow-hidden mb-5 ring-4 ring-neutral-50 shadow-md">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-airbnb to-airbnb-dark flex items-center justify-center">
                        <User className="text-white w-12 h-12" />
                      </div>
                    )}
                  </div>
                  <h2 className="text-2xl font-black text-neutral-800 tracking-tight">{user.name}</h2>
                  <p className="text-neutral-500 text-sm mt-1 font-medium">Miembro desde {user.member_since}</p>

                  {/* Stats */}
                  <div className="flex justify-center gap-6 mt-6 pt-6 border-t border-neutral-100">
                    <div className="text-center">
                      <p className="text-xl font-black text-neutral-800">{user.favorites?.length || 0}</p>
                      <p className="text-xs text-neutral-500 font-bold uppercase tracking-tight">Favoritos</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-black text-neutral-800">12</p>
                      <p className="text-xs text-neutral-500 font-bold uppercase tracking-tight">Visitados</p>
                    </div>
                  </div>

                  <button 
                    onClick={() => setActiveTab('settings')}
                    className="w-full mt-8 py-3.5 bg-neutral-100 hover:bg-neutral-200 rounded-xl font-bold text-neutral-800 transition-colors"
                  >
                    Editar Perfil
                  </button>
                </div>
              </div>

              {/* Contenido Derecha */}
              <div className="flex-1 space-y-8">
                <div className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm">
                  <h3 className="text-xl font-black text-neutral-800 mb-4">Sobre mí</h3>
                  <p className="text-neutral-600 leading-relaxed">
                    {user.biography || `Aún no has añadido una biografía. Cuéntale a la comunidad un poco sobre ti.`}
                  </p>
                </div>
                
                <div className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm">
                  <h3 className="text-xl font-black text-neutral-800 mb-4">Detalles</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-neutral-50 rounded-2xl">
                      <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1">Email</p>
                      <p className="font-bold text-neutral-800">{user.email}</p>
                    </div>
                    <div className="p-4 bg-neutral-50 rounded-2xl">
                      <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1">Región</p>
                      <p className="font-bold text-neutral-800">Pasto, Nariño</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm">
                  <h3 className="text-xl font-black text-neutral-800 mb-4">Mis Intereses</h3>
                  <div className="flex flex-wrap gap-2">
                    {user.interests && user.interests.length > 0 ? (
                      user.interests.map((interest) => (
                        <span
                          key={interest}
                          className="px-4 py-2 bg-neutral-100 text-neutral-700 rounded-xl text-sm font-bold capitalize"
                        >
                          {interest}
                        </span>
                      ))
                    ) : (
                      <p className="text-sm text-neutral-500 italic">No has seleccionado intereses todavía.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab: Favoritos */}
          {activeTab === 'favorites' && (
            <div className="animate-fade-in">
              <h3 className="text-2xl font-black text-neutral-800 mb-2">
                Tus Lugares Favoritos
              </h3>
              <p className="text-neutral-500 mb-6 font-medium">
                Lugares que has guardado para visitar después.
              </p>
              {isLoading ? (
                <LoadingSpinner text="Cargando favoritos..." />
              ) : favorites.length > 0 ? (
                <PlaceGrid places={favorites} />
              ) : (
                <div className="text-center py-20 bg-neutral-50 rounded-3xl border border-neutral-200">
                  <Heart className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
                  <h4 className="text-xl font-bold text-neutral-800 mb-2">Aún no tienes favoritos</h4>
                  <p className="text-neutral-500 max-w-sm mx-auto">Explora el mapa y guarda los lugares que más te gusten haciendo clic en el corazón.</p>
                </div>
              )}
            </div>
          )}

          {/* Tab: Recomendaciones */}
          {activeTab === 'recommendations' && (
            <div className="animate-fade-in">
              <h3 className="text-2xl font-black text-neutral-800 mb-2">
                Recomendados para ti
              </h3>
              <p className="text-neutral-500 mb-6 font-medium">
                Basado en tus favoritos e intereses
              </p>
              {isLoading ? (
                <LoadingSpinner text="Generando recomendaciones..." />
              ) : (
                <PlaceGrid places={recommendations} />
              )}
            </div>
          )}

          {/* Tab: Configuración (Reemplaza el modal) */}
          {activeTab === 'settings' && (
            <div className="flex flex-col md:flex-row gap-8 animate-fade-in items-start">
              {/* Sidebar de Configuración */}
              <aside className="w-full md:w-64 shrink-0">
                <div className="mb-6 px-2">
                  <h2 className="text-2xl font-black text-neutral-800">Ajustes</h2>
                  <p className="text-neutral-500 text-sm font-medium mt-1">Gestiona tu cuenta</p>
                </div>
                <nav className="flex flex-col gap-2">
                  <button 
                    onClick={() => setSettingsTab('personal')} 
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all ${
                      settingsTab === 'personal' 
                      ? 'bg-white shadow-sm text-airbnb ring-1 ring-neutral-200' 
                      : 'text-neutral-600 hover:translate-x-1 hover:bg-neutral-50'
                    }`}
                  >
                    <User className="w-5 h-5" /> Información Personal
                  </button>
                  <button 
                    onClick={() => setSettingsTab('security')} 
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all ${
                      settingsTab === 'security' 
                      ? 'bg-white shadow-sm text-airbnb ring-1 ring-neutral-200' 
                      : 'text-neutral-600 hover:translate-x-1 hover:bg-neutral-50'
                    }`}
                  >
                    <Shield className="w-5 h-5" /> Seguridad y Acceso
                  </button>
                  
                  <div className="h-px bg-neutral-200 my-2" />
                  
                  <button
                    onClick={() => {
                      logout();
                      router.push('/');
                    }}
                    className="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold text-red-500 hover:bg-red-50 hover:translate-x-1 transition-all"
                  >
                    Cerrar sesión
                  </button>
                </nav>
              </aside>

              {/* Contenido Principal de Configuración */}
              <div className="flex-1 bg-white rounded-[32px] shadow-sm border border-neutral-200 overflow-hidden">
                {/* Header de la sección */}
                <div className="px-8 py-6 border-b border-neutral-100 flex justify-between items-center bg-neutral-50/50">
                  <h1 className="text-xl font-black text-neutral-800">
                    {settingsTab === 'personal' ? 'Editar Perfil' : 'Seguridad'}
                  </h1>
                </div>

                {settingsMsg && (
                  <div className={`mx-8 mt-6 p-4 rounded-xl text-sm font-bold ${
                    settingsMsg.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                  }`}>
                    {settingsMsg.text}
                  </div>
                )}

                <div className="p-8">
                  {/* FORMULARIO: INFORMACIÓN PERSONAL */}
                  {settingsTab === 'personal' && (
                    <div className="space-y-10 animate-fade-in">
                      {/* Grid de avatar y datos */}
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Izquierda: Avatar */}
                        <div className="lg:col-span-4 flex flex-col items-center justify-center p-8 bg-neutral-50 rounded-3xl border border-neutral-200 border-dashed">
                          <div className="relative group cursor-pointer">
                            <div className="w-32 h-32 rounded-full overflow-hidden ring-4 ring-white shadow-md bg-neutral-200">
                              {editForm.photo ? (
                                <img src={editForm.photo} alt="Avatar" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                              ) : (
                                <User className="w-full h-full p-6 text-neutral-400" />
                              )}
                            </div>
                            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <Camera className="text-white w-8 h-8" />
                            </div>
                          </div>
                          <p className="mt-4 font-bold text-airbnb text-sm mb-3">Cambiar foto</p>
                          <div className="flex flex-col gap-2 w-full">
                            <div className="flex gap-2">
                              <button 
                                onClick={() => fileInputRef.current?.click()}
                                className="flex-1 flex items-center justify-center gap-1 bg-white border border-neutral-200 text-neutral-600 text-xs font-bold py-2 rounded-lg hover:bg-neutral-50 transition-colors shadow-sm"
                                title="Subir desde dispositivo"
                              >
                                <Upload className="w-3.5 h-3.5" /> Subir
                              </button>
                              <button 
                                onClick={() => cameraInputRef.current?.click()}
                                className="flex-1 flex items-center justify-center gap-1 bg-white border border-neutral-200 text-neutral-600 text-xs font-bold py-2 rounded-lg hover:bg-neutral-50 transition-colors shadow-sm"
                                title="Tomar foto con cámara"
                              >
                                <Camera className="w-3.5 h-3.5" /> Cámara
                              </button>
                            </div>
                            
                            <div className="relative my-1">
                              <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-neutral-200"></div>
                              </div>
                              <div className="relative flex justify-center text-[10px]">
                                <span className="bg-neutral-50 px-2 text-neutral-400 font-bold uppercase tracking-wider">o usa una URL</span>
                              </div>
                            </div>

                            <div className="relative">
                              <input 
                                type="text"
                                value={editForm.photo}
                                onChange={(e) => setEditForm({...editForm, photo: e.target.value})}
                                className="w-full pl-8 pr-2 py-2 bg-white border border-neutral-300 rounded-lg text-xs outline-none focus:border-airbnb transition-colors"
                                placeholder="https://..."
                              />
                              <Image className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
                            </div>
                            
                            {/* Inputs ocultos */}
                            <input 
                              type="file" 
                              ref={fileInputRef} 
                              className="hidden" 
                              accept="image/*" 
                              onChange={handleImageUpload} 
                            />
                            <input 
                              type="file" 
                              ref={cameraInputRef} 
                              className="hidden" 
                              accept="image/*" 
                              capture="environment" 
                              onChange={handleImageUpload} 
                            />
                          </div>
                        </div>

                        {/* Derecha: Datos */}
                        <div className="lg:col-span-8 space-y-6">
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Nombre Completo</label>
                            <input 
                              type="text"
                              value={editForm.name}
                              onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                              className="w-full px-5 py-4 bg-neutral-50 border border-neutral-200 focus:border-airbnb focus:bg-white rounded-2xl outline-none font-bold text-neutral-800 transition-all"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Biografía</label>
                            <textarea 
                              value={editForm.biography}
                              onChange={(e) => setEditForm({...editForm, biography: e.target.value})}
                              className="w-full px-5 py-4 bg-neutral-50 border border-neutral-200 focus:border-airbnb focus:bg-white rounded-2xl outline-none text-neutral-800 transition-all resize-none min-h-[120px]"
                              placeholder="Cuéntanos un poco sobre ti..."
                            />
                          </div>
                          
                          {/* Toggle de Perfil Público */}
                          <div className="flex items-center justify-between p-5 bg-neutral-50 border border-neutral-200 rounded-2xl mt-4">
                            <div>
                              <h4 className="font-bold text-neutral-800">Perfil Público</h4>
                              <p className="text-xs text-neutral-500 mt-1">Permite que otros vean tu perfil y tus lugares favoritos.</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input 
                                type="checkbox" 
                                className="sr-only peer" 
                                checked={editForm.is_public}
                                onChange={(e) => setEditForm({...editForm, is_public: e.target.checked})}
                              />
                              <div className="w-11 h-6 bg-neutral-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-airbnb/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-airbnb"></div>
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* Intereses */}
                      <div className="pt-8 border-t border-neutral-100">
                        <div className="mb-4">
                          <h3 className="text-lg font-black text-neutral-800">Tus Intereses</h3>
                          <p className="text-sm text-neutral-500 font-medium">Personaliza tus recomendaciones seleccionando lo que te apasiona.</p>
                        </div>
                        <InterestSelector 
                          selected={editForm.interests}
                          onToggle={(id) => {
                            setEditForm(prev => ({
                              ...prev,
                              interests: prev.interests.includes(id) 
                                ? prev.interests.filter(i => i !== id)
                                : [...prev.interests, id]
                            }));
                          }}
                        />
                      </div>

                      {/* Botones de acción */}
                      <div className="pt-6 flex justify-end gap-4">
                        <button 
                          onClick={() => setActiveTab('info')}
                          className="px-6 py-3.5 rounded-xl font-bold text-neutral-500 hover:bg-neutral-100 transition-colors"
                        >
                          Cancelar
                        </button>
                        <button 
                          onClick={handleSaveProfile}
                          disabled={isLoading}
                          className="px-8 py-3.5 rounded-xl bg-airbnb text-white font-bold shadow-lg shadow-airbnb/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2"
                        >
                          {isLoading ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* FORMULARIO: SEGURIDAD */}
                  {settingsTab === 'security' && (
                    <div className="space-y-8 animate-fade-in max-w-2xl">
                      <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100 flex gap-4">
                        <Key className="w-6 h-6 text-amber-600 shrink-0" />
                        <div>
                          <p className="font-bold text-amber-800">Cambiar Contraseña</p>
                          <p className="text-sm text-amber-700/80 mt-1 font-medium">
                            Asegúrate de usar una contraseña larga y segura que no utilices en otras cuentas.
                          </p>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Contraseña Actual</label>
                          <input 
                            type="password"
                            value={securityForm.currentPassword}
                            onChange={(e) => setSecurityForm({...securityForm, currentPassword: e.target.value})}
                            className="w-full px-5 py-4 bg-neutral-50 border border-neutral-200 focus:border-neutral-400 focus:bg-white rounded-2xl outline-none font-bold text-neutral-800 transition-all"
                            placeholder="••••••••"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Nueva Contraseña</label>
                          <input 
                            type="password"
                            value={securityForm.newPassword}
                            onChange={(e) => setSecurityForm({...securityForm, newPassword: e.target.value})}
                            className="w-full px-5 py-4 bg-neutral-50 border border-neutral-200 focus:border-neutral-400 focus:bg-white rounded-2xl outline-none font-bold text-neutral-800 transition-all"
                            placeholder="Mínimo 6 caracteres"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Confirmar Nueva Contraseña</label>
                          <input 
                            type="password"
                            value={securityForm.confirmPassword}
                            onChange={(e) => setSecurityForm({...securityForm, confirmPassword: e.target.value})}
                            className="w-full px-5 py-4 bg-neutral-50 border border-neutral-200 focus:border-neutral-400 focus:bg-white rounded-2xl outline-none font-bold text-neutral-800 transition-all"
                            placeholder="Repite la contraseña"
                          />
                        </div>
                      </div>

                      {/* Botones de acción */}
                      <div className="pt-6 flex justify-end gap-4 border-t border-neutral-100">
                        <button 
                          onClick={() => setSecurityForm({currentPassword: '', newPassword: '', confirmPassword: ''})}
                          className="px-6 py-3.5 rounded-xl font-bold text-neutral-500 hover:bg-neutral-100 transition-colors"
                        >
                          Limpiar
                        </button>
                        <button 
                          onClick={handleSaveSecurity}
                          disabled={isLoading || !securityForm.currentPassword || !securityForm.newPassword || !securityForm.confirmPassword}
                          className="px-8 py-3.5 rounded-xl bg-neutral-900 text-white font-bold shadow-lg hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2"
                        >
                          {isLoading ? 'Actualizando...' : 'Actualizar Contraseña'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<LoadingSpinner size="lg" text="Cargando perfil..." />}>
      <ProfileContent />
    </Suspense>
  );
}
