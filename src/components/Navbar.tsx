'use client';

// ===== NAVBAR - AIRBNB NEXT GEN =====
// Navbar avanzado con estado global Zustand, busqueda debounce y temas oscuros

import React, { useState, useRef, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Search, Globe, Menu, User, Heart, MapPin, Moon, Sun, LayoutDashboard, X, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useAppStore, type Tab } from '@/store/useAppStore';
import { useDebounce } from '@/hooks/useDebounce';
import { mockPlaces as places, experiences, services } from '@/services/mockData';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  
  // Zustand Global State
  const activeTab = useAppStore(state => state.activeTab);
  const setActiveTab = useAppStore(state => state.setActiveTab);
  const searchQuery = useAppStore(state => state.searchQuery);
  const setSearchQuery = useAppStore(state => state.setSearchQuery);
  const theme = useAppStore(state => state.theme);
  const setTheme = useAppStore(state => state.setTheme);

  // Local State
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isFavoritesActive = pathname === '/favorites';

  // Detectar scroll para compactar las tabs móviles (ocultar emojis)
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleTabClick = (tabId: Tab) => {
    setActiveTab(tabId);
    if (pathname !== '/') {
      router.push('/');
    }
  };

  // Debounced search term for autocomplete
  const debouncedSearch = useDebounce(localSearch, 300);

  // Generate autocomplete suggestions based on active tab and term
  const suggestions = useMemo(() => {
    if (!debouncedSearch.trim() || debouncedSearch.length < 2) return [];
    
    const q = debouncedSearch.toLowerCase();
    
    if (activeTab === 'stays') {
      return places
        .filter((p: any) => p.location.toLowerCase().includes(q) || p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q))
        .slice(0, 5)
        .map((p: any) => ({ label: p.location, sub: p.name, type: 'stays' }));
    } else if (activeTab === 'experiences') {
      return experiences
        .filter((e: any) => e.title.toLowerCase().includes(q) || e.category.toLowerCase().includes(q))
        .slice(0, 5)
        .map((e: any) => ({ label: e.title, sub: e.category, type: 'experiences' }));
    } else {
      return services
        .filter((s: any) => s.title.toLowerCase().includes(q) || s.category.toLowerCase().includes(q))
        .slice(0, 5)
        .map((s: any) => ({ label: s.title, sub: s.category, type: 'services' }));
    }
  }, [debouncedSearch, activeTab]);

  // Highlight matches utility function
  const highlightMatch = (text: string, highlight: string) => {
    if (!highlight.trim()) return <span>{text}</span>;
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) => 
          part.toLowerCase() === highlight.toLowerCase() 
            ? <span key={i} className="bg-yellow-200 dark:bg-yellow-700 font-bold">{part}</span> 
            : <span key={i}>{part}</span>
        )}
      </span>
    );
  };

  // Sync localized search input with global search state when debounced changes
  useEffect(() => {
    setSearchQuery(debouncedSearch);
  }, [debouncedSearch, setSearchQuery]);

  // Click outside handlers
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchExpanded(false);
        setSelectedIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation for suggestions
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!searchExpanded || suggestions.length === 0) return;
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && suggestions[selectedIndex]) {
        executeSearch(suggestions[selectedIndex].label);
      } else {
        executeSearch(localSearch);
      }
    } else if (e.key === 'Escape') {
      setSearchExpanded(false);
      setSelectedIndex(-1);
    }
  };

  const executeSearch = (term: string) => {
    if (term.trim()) {
      setLocalSearch(term);
      setSearchExpanded(false);
      router.push(`/?search=${encodeURIComponent(term.trim())}&tab=${activeTab}`);
    }
  };


  return (
    <nav className="sticky top-0 z-50 bg-white dark:bg-bg-primary border-b border-neutral-200 dark:border-border-color transition-colors duration-300">
      <div className="max-w-[2520px] mx-auto px-4 sm:px-6 md:px-10 xl:px-20 pt-6 pb-4">
        <div className="flex items-start justify-between">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
            <div className="relative">
              <svg viewBox="0 0 32 32" className="w-8 h-8 fill-airbnb transition-transform group-hover:scale-110" aria-label="Exploro">
                <path d="M16 1c2.008 0 3.463.963 4.751 3.269l.533 1.025c1.954 3.83 6.114 12.54 7.1 14.836l.145.353c.667 1.591.91 2.472.96 3.396l.01.415v.262c0 4.422-3.344 6.444-7.5 6.444-2.42 0-4.124-.874-5.738-2.678l-.23-.267-.188-.224-.188.224c-1.384 1.59-3.057 2.664-5.098 2.898l-.41.043-.26.008C5.344 31 2 28.978 2 24.556v-.262l.01-.415c.05-.924.293-1.805.96-3.396l.145-.353c.986-2.296 5.146-11.005 7.1-14.836l.533-1.025C12.037 1.963 13.492 1 15.5 1h.5zm0 2c-1.239 0-2.122.587-3.122 2.508l-.527 1.013C10.418 10.33 6.312 18.88 5.35 21.123l-.143.346c-.566 1.353-.784 2.1-.826 2.9L4.375 24.6v.199c0 3.191 2.376 4.7 5.625 4.7 1.924 0 3.282-.665 4.635-2.197l.264-.305.401-.478.401.478c1.498 1.705 2.873 2.502 5.14 2.502 3.249 0 5.625-1.509 5.625-4.7v-.199l-.006-.231c-.042-.8-.26-1.547-.826-2.9l-.143-.346c-.962-2.244-5.068-10.794-6.998-14.6l-.527-1.016C16.622 3.587 15.739 3 14.5 3h-1z" />
              </svg>
            </div>
            <span className="hidden lg:block text-airbnb font-bold text-xl tracking-tight">
              Exploro
            </span>
          </Link>

          {/* Central: Tabs + Search */}
          <div className="hidden md:flex flex-col items-center flex-1 mx-8 relative">
            
            {/* Real Airbnb Tabs (Colorful & Dynamic) */}
            <div className={`flex items-center gap-3 mb-4 transition-all duration-300 ${searchExpanded ? 'opacity-100' : 'opacity-100'}`}>
              <button
                onClick={() => handleTabClick('stays')}
                className={`group flex items-center gap-2.5 py-2 transition-all duration-300 rounded-full ${
                  activeTab === 'stays' 
                    ? 'bg-gradient-to-r from-rose-500/10 to-orange-500/10 text-airbnb font-bold px-5 shadow-sm border border-airbnb/20' 
                    : 'px-4 text-neutral-500 hover:text-neutral-800 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-transparent'
                }`}
              >
                <span className={`text-2xl drop-shadow-sm transition-transform duration-300 ${activeTab === 'stays' ? 'scale-110' : 'group-hover:scale-110'}`}>🏡</span>
                <span className="text-[14px]">Alojamientos</span>
              </button>

              <button
                onClick={() => handleTabClick('experiences')}
                className={`group relative flex items-center gap-2.5 py-2 transition-all duration-300 rounded-full ${
                  activeTab === 'experiences' 
                    ? 'bg-gradient-to-r from-purple-500/10 to-pink-500/10 text-purple-600 dark:text-purple-400 font-bold px-5 shadow-sm border border-purple-500/20' 
                    : 'px-4 text-neutral-500 hover:text-neutral-800 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-transparent'
                }`}
              >
                <div className={`absolute -top-1.5 left-1/2 -translate-x-1/2 text-white text-[9px] font-bold px-1.5 py-[1px] rounded-full shadow-md tracking-wide z-10 border transition-all ${
                  activeTab === 'experiences' ? 'bg-purple-600 border-purple-600' : 'bg-[#222244] border-[#222244]'
                }`}>
                  NOVEDAD
                </div>
                <span className={`text-2xl drop-shadow-sm z-0 transition-transform duration-300 ${activeTab === 'experiences' ? 'scale-110' : 'group-hover:scale-110'}`}>🎈</span>
                <span className="text-[14px]">Experiencias</span>
              </button>

              <button
                onClick={() => handleTabClick('services')}
                className={`group relative flex items-center gap-2.5 py-2 transition-all duration-300 rounded-full ${
                  activeTab === 'services' 
                    ? 'bg-gradient-to-r from-blue-500/10 to-cyan-500/10 text-blue-600 dark:text-blue-400 font-bold px-5 shadow-sm border border-blue-500/20' 
                    : 'px-4 text-neutral-500 hover:text-neutral-800 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-transparent'
                }`}
              >
                <div className={`absolute -top-1.5 left-1/2 -translate-x-1/2 text-white text-[9px] font-bold px-1.5 py-[1px] rounded-full shadow-md tracking-wide z-10 border transition-all ${
                  activeTab === 'services' ? 'bg-blue-600 border-blue-600' : 'bg-[#222244] border-[#222244]'
                }`}>
                  NOVEDAD
                </div>
                <span className={`text-2xl drop-shadow-sm z-0 transition-transform duration-300 ${activeTab === 'services' ? 'scale-110' : 'group-hover:scale-110'}`}>🛎️</span>
                <span className="text-[14px]">Servicios</span>
              </button>

              <button
                onClick={() => handleTabClick('exploro')}
                className={`group relative flex items-center gap-2.5 py-2 transition-all duration-300 rounded-full ${
                  activeTab === 'exploro' 
                    ? 'bg-gradient-to-r from-amber-500/10 to-orange-500/10 text-amber-600 dark:text-amber-400 font-bold px-5 shadow-sm border border-amber-500/20' 
                    : 'px-4 text-neutral-500 hover:text-neutral-800 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-transparent'
                }`}
              >
                <div className={`absolute -top-1.5 left-1/2 -translate-x-1/2 text-white text-[9px] font-bold px-1.5 py-[1px] rounded-full shadow-md tracking-wide z-10 border transition-all ${
                  activeTab === 'exploro' ? 'bg-amber-500 border-amber-500' : 'bg-airbnb border-airbnb'
                }`}>
                  NUEVO
                </div>
                <span className={`text-2xl drop-shadow-sm z-0 transition-transform duration-300 ${activeTab === 'exploro' ? 'scale-110' : 'group-hover:scale-110'}`}>🧭</span>
                <span className="text-[14px]">Exploro</span>
              </button>
            </div>


            {/* Smart Search Bar */}
            <div ref={searchRef} className="w-full max-w-[850px]">
              {!searchExpanded ? (
                /* Compact Bar */
                <button
                  onClick={() => setSearchExpanded(true)}
                  className="flex items-center mx-auto border border-neutral-300 dark:border-border-color rounded-full shadow-search hover:shadow-search-hover bg-white dark:bg-bg-secondary transition-all duration-300 max-w-[400px] w-full"
                >
                  <span className="flex-1 px-5 py-3 text-sm font-semibold text-neutral-800 dark:text-white truncate text-left border-r border-neutral-200 dark:border-border-color">
                    {localSearch || 'Cualquier lugar'}
                  </span>
                  <span className="hidden lg:block px-5 py-3 text-sm text-neutral-500 dark:text-neutral-400 border-r border-neutral-200 dark:border-border-color">
                    Fechas
                  </span>
                  <span className="px-5 py-3 text-sm text-neutral-500 dark:text-neutral-400 truncate">
                    ¿Cuántos?
                  </span>
                  <div className="flex items-center justify-center w-8 h-8 mr-2 bg-airbnb rounded-full text-white flex-shrink-0">
                    <Search className="w-3.5 h-3.5" />
                  </div>
                </button>
              ) : (
                /* Expanded Intelligent Search Bar */
                <div className="bg-white dark:bg-bg-secondary border border-neutral-300 dark:border-border-color rounded-full shadow-search-hover flex items-center animate-scale-in relative w-full">
                  <div className="flex flex-1 items-center relative z-10">
                    {/* Destination Input */}
                    <div className="flex-1 px-8 py-3 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-text relative">
                      <label className="block text-[13px] font-bold text-neutral-800 dark:text-white pb-0.5">Dónde</label>
                      <input
                        ref={inputRef}
                        type="text"
                        placeholder={activeTab === 'experiences' ? 'Busca por ciudad o interés' : activeTab === 'services' ? 'Explora servicios' : 'Explora destinos'}
                        value={localSearch}
                        onChange={(e) => {
                          setLocalSearch(e.target.value);
                          setSelectedIndex(-1);
                        }}
                        onKeyDown={handleKeyDown}
                        className="bg-transparent outline-none text-[15px] font-semibold text-neutral-800 dark:text-white placeholder:text-neutral-500 dark:placeholder:text-neutral-400 placeholder:font-normal w-full"
                        autoFocus
                      />
                    </div>

                    <span className="h-8 w-[1px] bg-neutral-200 dark:bg-border-color" />

                    {/* Dates Placeholder */}
                    <div className="hidden lg:flex min-w-[140px] px-6 py-3 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer">
                      <div className="flex flex-col justify-center">
                        <label className="block text-[13px] font-bold text-neutral-800 dark:text-white pb-0.5">Fechas</label>
                        <span className="text-[15px] text-neutral-500 dark:text-neutral-400 truncate">Agrega fechas</span>
                      </div>
                    </div>

                    <span className="hidden lg:block h-8 w-[1px] bg-neutral-200 dark:bg-border-color" />

                    {/* Guests/Services Placeholder with Submit Button */}
                    <div className={`min-w-[180px] flex items-center justify-between pl-6 pr-2 py-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer ${activeTab === 'services' ? 'w-[240px]' : ''}`}>
                      <div className="flex flex-col justify-center">
                        <label className="block text-[13px] font-bold text-neutral-800 dark:text-white pb-0.5">
                          {activeTab === 'services' ? 'Tipo de servicio' : 'Quién'}
                        </label>
                        <span className="text-[15px] text-neutral-500 dark:text-neutral-400 truncate">
                          {activeTab === 'services' ? 'Agregar servicio' : '¿Cuántos?'}
                        </span>
                      </div>
                      <button
                        onClick={() => executeSearch(localSearch)}
                        className="flex items-center justify-center px-4 py-3 bg-airbnb rounded-full text-white hover:bg-airbnb-dark hover:scale-[1.03] transition-transform ml-4"
                      >
                        <Search className="w-4 h-4 mr-2" />
                        <span className="font-bold text-sm">Buscar</span>
                      </button>
                    </div>
                  </div>

                  {/* Autocomplete Dropdown Panel */}
                  {searchExpanded && suggestions.length > 0 && (
                    <div className="absolute top-20 left-0 w-full md:w-[450px] bg-white dark:bg-bg-secondary rounded-3xl shadow-search-hover border border-neutral-200 dark:border-border-color py-6 px-2 animate-scale-in z-0 mt-2">
                      <p className="px-6 text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">Sugerencias por región y título</p>
                      
                      {suggestions.map((sug: any, idx: number) => (
                        <div 
                          key={idx}
                          onClick={() => executeSearch(sug.label)}
                          className={`flex items-center gap-4 px-6 py-3 cursor-pointer rounded-xl transition-colors ${idx === selectedIndex ? 'bg-neutral-100 dark:bg-neutral-800' : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/50'}`}
                        >
                          <div className="w-10 h-10 bg-neutral-100 dark:bg-neutral-800 rounded-lg flex items-center justify-center flex-shrink-0">
                            <MapPin className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-base text-neutral-800 dark:text-white truncate">
                              {highlightMatch(sug.label, localSearch)}
                            </span>
                            <span className="text-sm text-neutral-500">{sug.sub}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Menú derecha */}
          <div className="flex items-center gap-2 flex-shrink-0">

            
            {/* Botón Mapa y Tema */}
            <div className="hidden md:flex items-center mr-1 gap-2">
              {user?.rol !== 2 && (
                <Link 
                  href="/pyme-onboarding" 
                  className="hidden lg:flex items-center gap-2 px-4 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-all text-sm font-bold text-neutral-800 dark:text-neutral-300"
                >
                  Quiero ser pyme
                </Link>
              )}
              <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                {theme === 'dark' ? <Sun className="w-4 h-4 text-neutral-300" /> : <Moon className="w-4 h-4 text-neutral-700" />}
              </button>
              <button className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                <Globe className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
              </button>
            </div>

            {/* Menú de Perfil */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-3 border border-neutral-300 dark:border-border-color rounded-full p-1 pl-3 hover:shadow-md dark:bg-bg-secondary transition-all duration-200"
              >
                <Menu className="w-4 h-4 text-neutral-600 dark:text-neutral-300" />
                <div className="w-8 h-8 rounded-full bg-neutral-400 dark:bg-neutral-600 flex items-center justify-center overflow-hidden text-white">
                  {isAuthenticated && user?.avatar ? (
                    <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-[18px] h-[18px]" />
                  )}
                </div>
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-14 w-64 bg-white dark:bg-bg-secondary rounded-2xl shadow-search-hover border border-neutral-200 dark:border-border-color py-2 animate-scale-in z-50">
                  {isAuthenticated ? (
                    <>
                      <div className="px-5 py-3 border-b border-neutral-100 dark:border-border-color">
                        <p className="font-bold text-sm text-neutral-800 dark:text-white truncate">{user?.name}</p>
                      </div>
                      <Link href="/profile" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-5 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-sm text-neutral-700 dark:text-neutral-300 transition-colors">
                        Mi perfil
                      </Link>
                      <Link href="/favorites" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-5 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-sm text-neutral-700 dark:text-neutral-300 transition-colors">
                        Favoritos
                      </Link>
                      <button onClick={() => { logout(); setMenuOpen(false); router.push('/'); }} className="w-full flex items-center gap-3 px-5 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-sm text-neutral-700 dark:text-neutral-300 transition-colors border-t border-neutral-100 dark:border-border-color mt-1">
                        Cerrar sesión
                      </button>
                    </>
                  ) : (
                    <>
                      <Link href="/login" onClick={() => setMenuOpen(false)} className="block px-5 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-sm font-bold text-neutral-800 dark:text-white transition-colors">
                        Iniciar sesión
                      </Link>
                      <Link href="/register" onClick={() => setMenuOpen(false)} className="block px-5 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-sm text-neutral-700 dark:text-neutral-300 transition-colors">
                        Registrarse
                      </Link>
                    </>
                  )}
                  {/* Controles de tema móviles en dropdown */}
                  <div className="md:hidden border-t border-neutral-100 dark:border-border-color mt-2 pt-2">
                    <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="w-full flex items-center justify-between px-5 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-sm text-neutral-700 dark:text-neutral-300 transition-colors">
                      Modo Oscuro
                      {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navegación Inferior Móvil (Mobile-first app-like) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-bg-primary border-t border-neutral-100 dark:border-border-color pb-safe flex justify-around items-center px-2 py-2 shadow-[0_-1px_10px_rgba(0,0,0,0.05)]">
        <button 
          onClick={() => handleTabClick('stays')}
          className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === 'stays' && pathname === '/' ? 'text-airbnb' : 'text-neutral-400'}`}
        >
          <Search className={`w-5 h-5 ${activeTab === 'stays' && pathname === '/' ? 'stroke-[2.5px]' : ''}`} />
          <span className="text-[10px] font-bold">Explora</span>
        </button>
        <button
          onClick={() => router.push(isAuthenticated ? '/favorites' : '/login')}
          className={`flex flex-col items-center gap-1.5 transition-all ${isFavoritesActive ? 'text-airbnb' : 'text-neutral-400'}`}
        >
          <Heart className={`w-5 h-5 ${isFavoritesActive ? 'stroke-[2.5px]' : ''}`} />
          <span className="text-[10px] font-bold">Favoritos</span>
        </button>
        <button 
          onClick={() => router.push(isAuthenticated ? '/profile' : '/login')}
          className={`flex flex-col items-center gap-1.5 transition-all ${pathname === '/login' || pathname === '/profile' ? 'text-airbnb' : 'text-neutral-400'}`}
        >
          <User className={`w-5 h-5 ${pathname === '/login' || pathname === '/profile' ? 'stroke-[2.5px]' : ''}`} />
          <span className="text-[10px] font-bold">Perfil</span>
        </button>
      </div>

      {/* Búsqueda y Tabs móviles (Estilo Airbnb 2025) */}
      <div className="md:hidden pt-3 px-4 pb-1 space-y-4 bg-white dark:bg-bg-primary shadow-sm border-b border-neutral-100 dark:border-border-color">
        {/* Barra de búsqueda estilo 'Pill' — abre overlay */}
        <button
          onClick={() => setMobileSearchOpen(true)}
          className="w-full flex items-center gap-4 bg-white dark:bg-bg-secondary border border-neutral-200 dark:border-border-color rounded-full px-5 py-3 shadow-search-mobile hover:shadow-md transition-all active:scale-95 duration-200"
        >
          <Search className="w-4 h-4 text-neutral-800 dark:text-white stroke-[3px] flex-shrink-0" />
          <div className="flex flex-col items-start overflow-hidden">
            <span className="text-[13px] font-bold text-neutral-800 dark:text-white">
              {localSearch || 'Empieza la búsqueda'}
            </span>
            <span className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate w-full">
              {activeTab === 'experiences' ? 'Experiencias · Cualquier lugar' : activeTab === 'services' ? 'Servicios · Encuentra profesionales' : 'Cualquier lugar · Añade huéspedes'}
            </span>
          </div>
        </button>

        {/* Tabs de Categorías Superiores (Alojamientos, Experiencias, Servicios, Exploro) */}
        <div className="flex justify-around items-center overflow-x-auto scrollbar-hide transition-all duration-300">
          {([
            { id: 'stays',       emoji: '🏠', label: 'Alojamientos' },
            { id: 'experiences', emoji: '🎈', label: 'Experiencias'  },
            { id: 'services',    emoji: '🛎️', label: 'Servicios'    },
            { id: 'exploro',     emoji: '🧭', label: 'Exploro'       },
          ] as const).map(({ id, emoji, label }) => (
            <button
              key={id}
              onClick={() => handleTabClick(id)}
              className={`relative flex flex-col items-center gap-0.5 group min-w-[72px] flex-1 transition-all duration-300 ${scrolled ? 'pb-2 pt-1' : 'pb-3 pt-1'} ${activeTab === id ? 'text-neutral-900 dark:text-white' : 'text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200'}`}
            >
              {/* Emoji — se oculta al hacer scroll */}
              <span
                className={`text-xl transition-all duration-300 group-active:scale-90 ${scrolled ? 'max-h-0 opacity-0 overflow-hidden' : 'max-h-8 opacity-100'}`}
                aria-hidden="true"
              >
                {emoji}
              </span>
              {/* Nombre — siempre visible */}
              <span className={`text-[11px] font-bold whitespace-nowrap transition-all duration-300 ${activeTab === id ? 'opacity-100' : 'opacity-70'} ${scrolled ? 'text-xs' : ''}`}>
                {label}
              </span>
              {/* Indicador activo */}
              {activeTab === id && (
                <div className="absolute bottom-0 left-1/4 right-1/4 h-[2.5px] bg-neutral-900 dark:bg-white rounded-full animate-in fade-in slide-in-from-bottom-1" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ===== OVERLAY DE BÚSQUEDA MÓVIL ===== */}
      {mobileSearchOpen && (
        <div className="md:hidden fixed inset-0 z-[200] bg-white dark:bg-bg-primary flex flex-col animate-in slide-in-from-top-2 duration-200">
          {/* Header del overlay */}
          <div className="flex items-center gap-3 px-4 pt-5 pb-3 border-b border-neutral-100 dark:border-border-color">
            <button
              onClick={() => { setMobileSearchOpen(false); setSelectedIndex(-1); }}
              className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors flex-shrink-0"
              aria-label="Cerrar búsqueda"
            >
              <ArrowLeft className="w-5 h-5 text-neutral-700 dark:text-neutral-300" />
            </button>
            <div className="flex-1 flex items-center gap-2 bg-neutral-100 dark:bg-neutral-800 rounded-full px-4 py-2.5">
              <Search className="w-4 h-4 text-neutral-500 flex-shrink-0" />
              <input
                ref={mobileInputRef}
                type="text"
                value={localSearch}
                onChange={(e) => { setLocalSearch(e.target.value); setSelectedIndex(-1); }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    executeSearch(localSearch);
                    setMobileSearchOpen(false);
                  } else if (e.key === 'Escape') {
                    setMobileSearchOpen(false);
                  }
                }}
                placeholder={activeTab === 'experiences' ? 'Busca experiencias...' : activeTab === 'services' ? 'Busca servicios...' : 'Busca destinos...'}
                className="flex-1 bg-transparent outline-none text-[15px] font-semibold text-neutral-800 dark:text-white placeholder:text-neutral-400 placeholder:font-normal"
                autoFocus
              />
              {localSearch && (
                <button onClick={() => setLocalSearch('')} className="flex-shrink-0 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Sugerencias */}
          <div className="flex-1 overflow-y-auto">
            {suggestions.length > 0 ? (
              <>
                <p className="px-6 pt-5 pb-2 text-xs font-black text-neutral-400 uppercase tracking-widest">
                  Sugerencias
                </p>
                {suggestions.map((sug: any, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => { executeSearch(sug.label); setMobileSearchOpen(false); }}
                    className={`w-full flex items-center gap-4 px-6 py-4 transition-colors active:bg-neutral-100 dark:active:bg-neutral-800 ${
                      idx === selectedIndex ? 'bg-neutral-50 dark:bg-neutral-800' : ''
                    }`}
                  >
                    <div className="w-10 h-10 bg-neutral-100 dark:bg-neutral-700 rounded-xl flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-neutral-500 dark:text-neutral-400" />
                    </div>
                    <div className="flex flex-col items-start text-left">
                      <span className="text-[15px] font-semibold text-neutral-800 dark:text-white">
                        {highlightMatch(sug.label, localSearch)}
                      </span>
                      <span className="text-sm text-neutral-500 dark:text-neutral-400">{sug.sub}</span>
                    </div>
                  </button>
                ))}
              </>
            ) : localSearch.length < 2 ? (
              <div className="px-6 pt-8">
                <p className="text-xs font-black text-neutral-400 uppercase tracking-widest mb-5">Busca por</p>
                <div className="space-y-1">
                  {['Pasto', 'Laguna de la Cocha', 'Las Lajas', 'Volcán Galeras', 'Ipiales'].map((sugg) => (
                    <button
                      key={sugg}
                      onClick={() => { executeSearch(sugg); setMobileSearchOpen(false); }}
                      className="w-full flex items-center gap-4 py-3.5 border-b border-neutral-100 dark:border-border-color text-left active:bg-neutral-50 dark:active:bg-neutral-800 transition-colors rounded-xl px-2"
                    >
                      <div className="w-9 h-9 bg-neutral-100 dark:bg-neutral-800 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Search className="w-4 h-4 text-neutral-500" />
                      </div>
                      <span className="text-[15px] font-medium text-neutral-700 dark:text-neutral-300">{sugg}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center pt-20 px-8 text-center">
                <div className="text-4xl mb-4">🔍</div>
                <p className="text-neutral-500 dark:text-neutral-400 font-medium">No encontramos resultados para «{localSearch}»</p>
                <p className="text-sm text-neutral-400 mt-2">Intenta con otro nombre o ciudad</p>
              </div>
            )}
          </div>

          {/* Botón buscar fijo */}
          <div className="p-4 border-t border-neutral-100 dark:border-border-color bg-white dark:bg-bg-primary">
            <button
              onClick={() => { executeSearch(localSearch); setMobileSearchOpen(false); }}
              disabled={!localSearch.trim()}
              className="w-full bg-airbnb hover:bg-airbnb-dark disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-black text-[15px] flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              <Search className="w-4 h-4" />
              Buscar
            </button>
          </div>
        </div>
      )}

    </nav>
  );
}
