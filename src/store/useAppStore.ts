import { create } from 'zustand';

export type Tab = 'stays' | 'experiences' | 'services' | 'exploro';
type Theme = 'light' | 'dark' | 'system';

interface AppState {
  // Tabs
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;

  // Search Context
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchDates: { start: string | null; end: string | null };
  setSearchDates: (start: string | null, end: string | null) => void;
  guests: number;
  setGuests: (count: number) => void;

  // Theme Handling
  theme: Theme;
  setTheme: (theme: Theme) => void;

  // Filters
  activeCategory: string;
  setActiveCategory: (categoryId: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Defaults
  activeTab: 'stays',
  setActiveTab: (tab) => set({ activeTab: tab }),

  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
  
  searchDates: { start: null, end: null },
  setSearchDates: (start, end) => set({ searchDates: { start, end } }),
  
  guests: 1,
  setGuests: (count) => set({ guests: count }),

  // Initialize theme from localStorage if available, otherwise system
  theme: 'system',
  setTheme: (theme) => {
    // 1. Guardar en store
    set({ theme });
    // 2. Ejecutar la lógica de inyección de clases (fuera de React para velocidad)
    if (typeof window !== 'undefined') {
      const isDark = 
        theme === 'dark' || 
        (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
        
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      
      // Update localStorage
      if (theme === 'system') {
        localStorage.removeItem('theme');
      } else {
        localStorage.theme = theme;
      }
    }
  },

  activeCategory: 'all',
  setActiveCategory: (categoryId) => set({ activeCategory: categoryId }),
}));

// Listener para cambios en OS preferences cuando el theme es "system"
if (typeof window !== 'undefined') {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    const currentTheme = useAppStore.getState().theme;
    if (currentTheme === 'system') {
      if (e.matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  });
}
