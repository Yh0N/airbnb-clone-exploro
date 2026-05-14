import React, { useState, useEffect } from 'react';
import { X, Star, MessageSquare, MapPin, Store, User, Loader2 } from 'lucide-react';
import * as api from '@/services/api';
import CustomSelect from './CustomSelect';
import { CATEGORIAS_LUGAR, CATEGORIAS_PYME } from '@/lib/taxonomy';

interface CreateReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
  initialTargetType?: 'place' | 'pyme' | 'user';
  initialTargetId?: string;
  initialData?: {
    id: number;
    puntuacion: number;
    comentarios: string;
  };
}

export default function CreateReviewModal({ isOpen, onClose, onCreated, initialTargetType, initialTargetId, initialData }: CreateReviewModalProps) {
  const [targetType, setTargetType] = useState<'place' | 'pyme' | 'user'>(initialTargetType || 'place');
  const [targetId, setTargetId] = useState(initialTargetId || '');
  const [comentarios, setComentarios] = useState('');
  const [puntuacion, setPuntuacion] = useState(5);
  const [options, setOptions] = useState<{ value: string, label: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialTargetType) setTargetType(initialTargetType);
      if (initialTargetId) setTargetId(initialTargetId);
      if (initialData) {
        setPuntuacion(initialData.puntuacion);
        setComentarios(initialData.comentarios || '');
        setTargetId(String(initialTargetId || ''));
      }
      loadOptions();
    }
  }, [isOpen, targetType, initialTargetType, initialTargetId, initialData]);

  const loadOptions = async () => {
    setIsLoading(true);
    try {
      if (targetType === 'place') {
        const places = await api.getAllPlacesAdmin();
        setOptions(places.map((p: any) => {
          const cat = CATEGORIAS_LUGAR.find(c => c.value === p.categoria || c.value === p.category);
          const emoji = cat ? cat.emoji : '📍';
          return { value: String(p.id || p.id_lugar), label: `${emoji} ${p.nombre || p.name}` };
        }));
      } else if (targetType === 'pyme') {
        const pymes = await api.getAllPymes();
        setOptions(pymes.map((p: any) => {
          const cat = CATEGORIAS_PYME.find(c => c.value === p.tipo || c.value === p.categoria);
          const emoji = cat ? cat.emoji : '🏢';
          return { value: String(p.id || p.id_pyme), label: `${emoji} ${p.nombre || p.name}` };
        }));
      } else if (targetType === 'user') {
        const users = await api.getAllUsers();
        setOptions(users.map((u: any) => ({ value: String(u.id), label: `👤 ${u.nombre || u.name}` })));
      }
    } catch (error) {
      console.error('Error loading options:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetId) return;
    
    setIsSubmitting(true);
    try {
      const data = {
        comentarios,
        puntuacion
      };
      
      if (initialData) {
        await api.updateReview(initialData.id, data);
      } else {
        if (targetType === 'place') {
          await api.createPlaceReview(Number(targetId), data);
        } else if (targetType === 'pyme') {
          await api.createPymeReview(Number(targetId), data);
        } else if (targetType === 'user') {
          await api.createUserReview(Number(targetId), data);
        }
      }
      
      onCreated();
      onClose();
      // Reset form
      setComentarios('');
      setPuntuacion(5);
      setTargetId('');
    } catch (error: any) {
      console.error('Error creating review:', error);
      const msg = error.response?.data?.detail || 'Error al publicar la reseña. ¿Ya habías reseñado este lugar?';
      setError(msg);
      setTimeout(() => setError(null), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      
      <div className="relative bg-white dark:bg-bg-secondary w-full max-w-lg rounded-3xl shadow-2xl animate-scale-in border border-neutral-200 dark:border-border-color overflow-hidden">
        <header className="px-8 py-6 border-b border-neutral-100 dark:border-neutral-800 flex justify-between items-center bg-neutral-50 dark:bg-neutral-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-airbnb/10 rounded-xl flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-airbnb" />
            </div>
            <div>
              <h2 className="text-xl font-bold dark:text-white">{initialData ? 'Editar Reseña' : 'Nueva Reseña'}</h2>
              <p className="text-xs text-neutral-500 font-medium uppercase tracking-wider">{initialData ? 'Actualiza tus comentarios' : 'Comparte tu experiencia'}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-full transition-colors group">
            <X className="w-6 h-6 text-neutral-400 group-hover:text-neutral-600 dark:group-hover:text-white" />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 p-4 rounded-2xl flex items-center gap-3 animate-shake">
              <div className="w-8 h-8 bg-red-100 dark:bg-red-900/40 rounded-full flex items-center justify-center shrink-0">
                <X className="w-4 h-4 text-red-600" />
              </div>
              <p className="text-sm font-bold text-red-600 dark:text-red-400 leading-tight">
                {error}
              </p>
            </div>
          )}

          {initialTargetId ? (
            <div className="bg-neutral-50 dark:bg-neutral-800 p-4 rounded-2xl border border-neutral-100 dark:border-neutral-700 flex flex-col items-center justify-center gap-2">
              <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                Estás calificando {targetType === 'place' ? 'un lugar turístico' : targetType === 'pyme' ? 'un negocio (pyme)' : 'a un usuario/guía'}
              </span>
              <span className="text-lg font-black text-neutral-800 dark:text-white">
                {options.find(o => o.value === initialTargetId)?.label || (isLoading ? 'Cargando...' : 'Destino seleccionado')}
              </span>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                <label className="text-sm font-bold text-neutral-700 dark:text-neutral-300">¿Qué deseas calificar?</label>
                <div className="grid grid-cols-3 gap-4">
                  <button
                    type="button"
                    onClick={() => { setTargetType('place'); setTargetId(''); }}
                    className={`flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all ${
                      targetType === 'place' 
                        ? 'border-airbnb bg-airbnb/5 text-airbnb' 
                        : 'border-neutral-100 dark:border-neutral-800 text-neutral-400 grayscale'
                    }`}
                  >
                    <MapPin className="w-8 h-8" />
                    <span className="text-sm font-bold">Lugar Turístico</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setTargetType('pyme'); setTargetId(''); }}
                    className={`flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all ${
                      targetType === 'pyme' 
                        ? 'border-blue-600 bg-blue-500/5 text-blue-600' 
                        : 'border-neutral-100 dark:border-neutral-800 text-neutral-400 grayscale'
                    }`}
                  >
                    <Store className="w-8 h-8" />
                    <span className="text-sm font-bold">Empresa (Pyme)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setTargetType('user'); setTargetId(''); }}
                    className={`flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all ${
                      targetType === 'user' 
                        ? 'border-green-600 bg-green-500/5 text-green-600' 
                        : 'border-neutral-100 dark:border-neutral-800 text-neutral-400 grayscale'
                    }`}
                  >
                    <User className="w-8 h-8" />
                    <span className="text-sm font-bold">Usuario/Guía</span>
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-neutral-700 dark:text-neutral-300">Seleccionar destino</label>
                <CustomSelect
                  options={options}
                  value={targetId}
                  onChange={setTargetId}
                  placeholder={isLoading ? "Cargando opciones..." : `Selecciona el ${targetType === 'place' ? 'lugar' : targetType === 'pyme' ? 'negocio' : 'usuario'}`}
                />
              </div>
            </>
          )}

          <div className="space-y-2">
            <label className="text-sm font-bold text-neutral-700 dark:text-neutral-300">Puntuación</label>
            <div className="flex gap-2 justify-center py-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setPuntuacion(star)}
                  className={`p-2 transition-all hover:scale-110 ${star <= puntuacion ? 'text-yellow-400 fill-yellow-400' : 'text-neutral-300'}`}
                >
                  <Star className={`w-10 h-10 ${star <= puntuacion ? 'fill-current' : ''}`} />
                </button>
              ))}
            </div>
          </div>

          {targetType !== 'user' && (
            <div className="space-y-2">
              <label className="text-sm font-bold text-neutral-700 dark:text-neutral-300">Tu comentario</label>
              <textarea
                value={comentarios}
                onChange={(e) => setComentarios(e.target.value)}
                placeholder={`Cuéntanos qué tal te pareció este ${targetType === 'place' ? 'lugar' : 'negocio'}... (Opcional)`}
                className="w-full bg-neutral-50 dark:bg-neutral-800 border-2 border-neutral-100 dark:border-neutral-700 rounded-2xl p-4 focus:border-airbnb outline-none transition-all resize-none min-h-[120px] dark:text-white"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || !targetId}
            className="w-full bg-airbnb hover:bg-airbnb-dark disabled:bg-neutral-300 text-white font-bold py-4 rounded-2xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {initialData ? 'Guardando cambios...' : 'Publicando...'}
              </>
            ) : (
              initialData ? 'Guardar Cambios' : 'Publicar Reseña'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
