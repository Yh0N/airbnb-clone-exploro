'use client';

import React, { useState } from 'react';
import { X, Building2, User, CheckCircle2, ArrowRight } from 'lucide-react';
import { createPyme } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { useAppStore } from '@/store/useAppStore';

interface BecomeHostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BecomeHostModal({ isOpen, onClose }: BecomeHostModalProps) {
  const { user, refreshUser } = useAuth();
  const setActiveTab = useAppStore(state => state.setActiveTab);
  const [step, setStep] = useState(1); // 1: Select Type, 2: Form, 3: Success
  const [hostType, setHostType] = useState<'natural' | 'pyme' | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    tipo: 'hotel'
  });

  if (!isOpen) return null;

  const handleSelectType = (type: 'natural' | 'pyme') => {
    setHostType(type);
    if (type === 'natural') {
      // For Natural, we can pre-fill or just proceed to a simplified confirmation
      setFormData({
        nombre: user?.name || 'Anfitrión Individual',
        tipo: 'alojamiento'
      });
    }
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createPyme({
        nombre: formData.nombre,
        tipo: formData.tipo,
        ubicacion_textual: 'Pasto, Nariño' // Default
      });
      await refreshUser();
      setStep(3);
    } catch (error) {
      console.error('Error becoming host:', error);
      alert('Hubo un error al procesar tu solicitud.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-lg bg-white dark:bg-bg-secondary rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-100 dark:border-border-color">
          <h2 className="text-xl font-bold text-neutral-800 dark:text-white">
            {step === 1 ? 'Conviértete en Anfitrión' : step === 2 ? 'Detalles de tu perfil' : '¡Todo listo!'}
          </h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-neutral-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8">
          {step === 1 && (
            <div className="space-y-6">
              <p className="text-neutral-600 dark:text-neutral-400">
                Elige cómo quieres publicar tus lugares en Exploro. Podrás cambiar esto más adelante.
              </p>
              
              <div className="grid grid-cols-1 gap-4">
                <button 
                  onClick={() => handleSelectType('natural')}
                  className="flex items-center gap-4 p-5 border-2 border-neutral-100 dark:border-neutral-800 rounded-2xl hover:border-airbnb hover:bg-airbnb/5 dark:hover:bg-airbnb/10 transition-all text-left group"
                >
                  <div className="w-12 h-12 bg-neutral-100 dark:bg-neutral-800 rounded-xl flex items-center justify-center group-hover:bg-airbnb/20 transition-colors">
                    <User className="w-6 h-6 text-neutral-600 dark:text-neutral-300 group-hover:text-airbnb" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-neutral-800 dark:text-white">Persona Natural</h3>
                    <p className="text-sm text-neutral-500">Para quienes ofrecen su propio alojamiento o experiencia personal.</p>
                  </div>
                </button>

                <button 
                  onClick={() => handleSelectType('pyme')}
                  className="flex items-center gap-4 p-5 border-2 border-neutral-100 dark:border-neutral-800 rounded-2xl hover:border-airbnb hover:bg-airbnb/5 dark:hover:bg-airbnb/10 transition-all text-left group"
                >
                  <div className="w-12 h-12 bg-neutral-100 dark:bg-neutral-800 rounded-xl flex items-center justify-center group-hover:bg-airbnb/20 transition-colors">
                    <Building2 className="w-6 h-6 text-neutral-600 dark:text-neutral-300 group-hover:text-airbnb" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-neutral-800 dark:text-white">Empresa (PYME)</h3>
                    <p className="text-sm text-neutral-500">Para negocios formales, hoteles, restaurantes o agencias de turismo.</p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-neutral-700 dark:text-neutral-300">
                  {hostType === 'pyme' ? 'Nombre Comercial de la Pyme' : 'Nombre de Anfitrión'}
                </label>
                <input 
                  type="text"
                  required
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  placeholder={hostType === 'pyme' ? 'Ej. Restaurante Sabores de Pasto' : 'Tu nombre'}
                  className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-border-color rounded-xl outline-none focus:ring-2 focus:ring-airbnb/50 transition-all dark:text-white"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-neutral-700 dark:text-neutral-300">Tipo de Servicio principal</label>
                <select 
                  value={formData.tipo}
                  onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                  className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-border-color rounded-xl outline-none focus:ring-2 focus:ring-airbnb/50 transition-all dark:text-white appearance-none"
                >
                  <option value="hotel">Alojamiento / Hotel</option>
                  <option value="restaurante">Restaurante / Gastronomía</option>
                  <option value="agencia">Agencia de Viajes / Tours</option>
                  <option value="cultura">Centro Cultural / Artesanía</option>
                  <option value="otro">Otro</option>
                </select>
              </div>

              <div className="flex items-center gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 px-6 py-3 border border-neutral-200 dark:border-border-color text-neutral-600 dark:text-neutral-400 font-bold rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                >
                  Atrás
                </button>
                <button 
                  type="submit"
                  disabled={loading}
                  className="flex-2 bg-airbnb text-white px-8 py-3 rounded-xl font-bold hover:bg-airbnb-dark transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? 'Procesando...' : 'Confirmar Registro'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {step === 3 && (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-500" />
              </div>
              <h3 className="text-2xl font-bold text-neutral-800 dark:text-white">¡Bienvenido, Anfitrión!</h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                Tu perfil ha sido actualizado. Ahora puedes acceder al panel de administración y empezar a publicar tus lugares.
              </p>
              <button 
                onClick={() => {
                  onClose();
                  setActiveTab('exploro');
                }}
                className="w-full bg-neutral-900 dark:bg-white dark:text-neutral-900 text-white px-8 py-4 rounded-xl font-bold hover:opacity-90 transition-all"
              >
                Ir al Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
