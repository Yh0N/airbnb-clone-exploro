import React, { useState } from 'react';
import { X, AlertTriangle, ShieldAlert, Flag, Send, Loader2, CheckCircle2, ChevronRight, Info } from 'lucide-react';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  entityName: string;
}

const REPORT_REASONS = [
  { id: 'incorrect_info', label: 'Información incorrecta', description: 'Ubicación, horarios o datos desactualizados', color: 'blue' },
  { id: 'non_existent', label: 'El lugar no existe', description: 'Este destino ya no se encuentra en esta ubicación', color: 'orange' },
  { id: 'inappropriate', label: 'Contenido inapropiado', description: 'Fotos o textos ofensivos o vulgares', color: 'red' },
  { id: 'scam', label: 'Posible estafa o fraude', description: 'Actividad sospechosa o intento de engaño', color: 'purple' },
  { id: 'other', label: 'Otro motivo', description: 'Cualquier otra irregularidad no listada', color: 'neutral' },
];

export default function ReportModal({ isOpen, onClose, entityName }: ReportModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReason) return;

    setIsSubmitting(true);
    // Simulamos el envío del reporte con un delay realista
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSubmitting(false);
    setIsSuccess(true);
    
    // Auto cerrar después de mostrar éxito
    setTimeout(() => {
      onClose();
      // Reset state for next time
      setTimeout(() => {
        setIsSuccess(false);
        setStep(1);
        setSelectedReason(null);
        setDescription('');
      }, 500);
    }, 3000);
  };

  if (!isOpen) return null;

  const selectedReasonObj = REPORT_REASONS.find(r => r.id === selectedReason);

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-neutral-900/40 backdrop-blur-md animate-fade-in" onClick={onClose} />
      
      <div className="relative bg-white dark:bg-neutral-900 w-full max-w-md rounded-[32px] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)] animate-scale-in border border-white/20 overflow-hidden">
        
        {isSuccess ? (
          <div className="p-12 flex flex-col items-center text-center animate-in zoom-in-95 duration-700">
            <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mb-6 relative">
              <div className="absolute inset-0 bg-emerald-400/20 rounded-full animate-ping" />
              <CheckCircle2 className="w-12 h-12 text-emerald-600" />
            </div>
            <h3 className="text-3xl font-black text-neutral-900 dark:text-white mb-4 tracking-tighter">¡Gracias por tu reporte!</h3>
            <p className="text-neutral-500 dark:text-neutral-400 font-medium leading-relaxed max-w-sm mx-auto">
              Hemos recibido tus comentarios sobre <span className="text-neutral-900 dark:text-white font-bold">"{entityName}"</span>. Nuestro equipo de moderación lo revisará pronto.
            </p>
          </div>
        ) : (
          <>
            {/* Header Moderno */}
            <div className="relative px-8 pt-8 pb-4">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-red-50 dark:bg-red-500/10 rounded-[18px] flex items-center justify-center border border-red-100 dark:border-red-500/20 shadow-sm shadow-red-500/5">
                    <ShieldAlert className="w-6 h-6 text-red-500" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-neutral-900 dark:text-white tracking-tighter leading-tight">Reportar</h2>
                    <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                        <p className="text-[10px] text-neutral-400 font-black uppercase tracking-[0.2em]">{entityName}</p>
                    </div>
                  </div>
                </div>
                <button 
                    onClick={onClose} 
                    className="p-2 bg-neutral-50 dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-xl transition-all group"
                >
                  <X className="w-4 h-4 text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white" />
                </button>
              </div>

              {/* Progress Bar */}
              <div className="flex gap-2 h-1.5 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden mb-2">
                  <div className={`h-full bg-red-500 transition-all duration-500 rounded-full ${step === 1 ? 'w-1/2' : 'w-full'}`} />
              </div>
            </div>

            <div className="px-8 pb-8">
              {step === 1 ? (
                <div className="space-y-4 animate-in slide-in-from-right-4 duration-500">
                  <div>
                    <p className="text-neutral-900 dark:text-white font-bold text-[15px] mb-1">¿Qué sucede?</p>
                    <p className="text-neutral-400 text-[12px] font-medium">Selecciona el motivo de tu reporte</p>
                  </div>

                  <div className="grid grid-cols-1 gap-2">
                    {REPORT_REASONS.map((reason) => (
                      <button
                        key={reason.id}
                        type="button"
                        onClick={() => {
                          setSelectedReason(reason.id);
                          setStep(2);
                        }}
                        className="flex items-center justify-between p-3.5 rounded-[20px] bg-neutral-50 dark:bg-neutral-800/50 border-2 border-transparent hover:border-neutral-200 dark:hover:border-neutral-700 hover:bg-white dark:hover:bg-neutral-800 transition-all text-left group shadow-sm"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold transition-all shadow-sm ${
                            reason.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                            reason.color === 'orange' ? 'bg-orange-100 text-orange-600' :
                            reason.color === 'red' ? 'bg-red-100 text-red-600' :
                            reason.color === 'purple' ? 'bg-purple-100 text-purple-600' :
                            'bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300'
                          }`}>
                            {reason.id === 'incorrect_info' && <Info className="w-4 h-4" />}
                            {reason.id === 'non_existent' && <AlertTriangle className="w-4 h-4" />}
                            {reason.id === 'inappropriate' && <ShieldAlert className="w-4 h-4" />}
                            {reason.id === 'scam' && <ShieldAlert className="w-4 h-4" />}
                            {reason.id === 'other' && <Flag className="w-4 h-4" />}
                          </div>
                          <div>
                            <p className="text-[14px] font-bold text-neutral-900 dark:text-white">{reason.label}</p>
                            <p className="text-[11px] text-neutral-400 font-medium leading-none">{reason.description}</p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-neutral-300 group-hover:text-neutral-900 dark:group-hover:text-white transition-all transform group-hover:translate-x-1" />
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 animate-in slide-in-from-right-4 duration-500">
                  <div className="flex items-center gap-3">
                    <button 
                        type="button" 
                        onClick={() => setStep(1)}
                        className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white font-bold text-xs underline underline-offset-4"
                    >
                        Cambiar motivo
                    </button>
                  </div>

                  <div className="bg-neutral-50 dark:bg-neutral-800 p-4 rounded-2xl border border-neutral-100 dark:border-neutral-700">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="p-1.5 bg-white dark:bg-neutral-900 rounded-lg shadow-sm">
                            <Info className="w-3.5 h-3.5 text-neutral-800 dark:text-white" />
                        </div>
                        <p className="text-[13px] font-bold text-neutral-900 dark:text-white">Has seleccionado: {selectedReasonObj?.label}</p>
                    </div>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Detalles adicionales (Opcional)..."
                      className="w-full bg-white dark:bg-neutral-900 border-2 border-neutral-100 dark:border-neutral-700 rounded-xl p-4 focus:border-red-500 outline-none transition-all resize-none min-h-[120px] text-sm dark:text-white shadow-inner"
                      autoFocus
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="flex-1 py-3.5 rounded-xl font-bold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all active:scale-95 border border-neutral-200 dark:border-neutral-700 text-sm"
                    >
                        Volver
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-[2] bg-red-500 hover:bg-red-600 disabled:bg-neutral-200 text-white font-black uppercase tracking-widest text-[10px] py-3.5 rounded-xl shadow-lg shadow-red-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Procesando...
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          Enviar Reporte
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
