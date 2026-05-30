'use client';

// ===== GALERÍA DE IMÁGENES - ESTILO AIRBNB PREMIUM =====
// Layout de 5 imágenes con fallbacks y estados de carga

import React, { useState, useRef, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Grid3X3, Image as ImageIcon, Camera, Upload, Loader2, RotateCcw, Check, Trash2 } from 'lucide-react';
import { uploadPhoto, getEntityImages, deletePhoto, deleteLegacyPhoto, resolvePhotoUrl } from '@/services/api';
import { useAlert } from '@/context/AlertContext';

interface ImageGalleryProps {
  images: string[];
  placeName: string;
  entityId?: number;
  entityType?: 'place' | 'pyme';
  onImageUploaded?: (newUrl: string) => void;
  onImageDeleted?: (deletedUrl: string) => void;
  isOwner?: boolean;
  currentUser?: any;
}

export default function ImageGallery({ 
  images = [], 
  placeName, 
  entityId, 
  entityType, 
  onImageUploaded,
  onImageDeleted,
  isOwner = false,
  currentUser
}: ImageGalleryProps) {
  const [showModal, setShowModal] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [modalIndex, setModalIndex] = useState(0);
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [detailedImages, setDetailedImages] = useState<any[]>([]);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const { showAlert } = useAlert();

  const validImages = images && images.length > 0 ? images : [];

  // Cargar metadatos detallados (IDs y autores) para permitir eliminación
  useEffect(() => {
    if (entityId && entityType) {
      const loadMetadata = async () => {
        try {
          const data = await getEntityImages(entityType, entityId);
          setDetailedImages(data);
        } catch (error) {
          console.error("Error loading image metadata:", error);
        }
      };
      loadMetadata();
    }
  }, [entityId, entityType, images.length]);

  const handleDelete = async (e: React.MouseEvent, imageUrl: string) => {
    e.stopPropagation();
    
    // Buscar la imagen en los metadatos para obtener su ID (comparando solo el nombre del archivo)
    const imgData = detailedImages.find(img => {
      const filename = img.url.split('/').pop();
      return imageUrl.includes(filename || '---');
    });

    const proceedWithDeletion = async () => {
      if (!imgData) {
        // INTENTAR ELIMINACIÓN LEGACY (POR URL)
        if (!entityId || !entityType) {
          showAlert({ type: 'error', title: 'Error de Datos', message: 'No se puede eliminar: Faltan datos de la entidad.' });
          return;
        }
        
        setIsDeleting(-1);
        try {
          await deleteLegacyPhoto(entityType, entityId, imageUrl);
          if (onImageDeleted) onImageDeleted(imageUrl);
          showAlert({ type: 'success', title: 'Foto Eliminada', message: 'La imagen antigua ha sido eliminada correctamente.' });
        } catch (error) {
          console.error("Error deleting legacy image:", error);
          showAlert({ type: 'error', title: 'Error al Eliminar', message: 'No se pudo eliminar la imagen antigua de los registros.' });
        } finally {
          setIsDeleting(null);
        }
        return;
      }

      setIsDeleting(imgData.id_imagen);
      try {
        await deletePhoto(imgData.id_imagen);
        if (onImageDeleted) {
          onImageDeleted(imageUrl);
        }
        setDetailedImages(prev => prev.filter(img => img.id_imagen !== imgData.id_imagen));
        showAlert({ type: 'success', title: 'Foto Eliminada', message: 'La imagen se ha borrado permanentemente.' });
      } catch (error) {
        console.error("Error deleting image:", error);
        showAlert({ type: 'error', title: 'Acceso Denegado', message: 'No tienes permisos suficientes para eliminar esta imagen o hubo un error en el servidor.' });
      } finally {
        setIsDeleting(null);
      }
    };

    showAlert({
      type: 'warning', 
      title: '¿Eliminar fotografía?', 
      message: 'Esta acción no se puede deshacer. La imagen desaparecerá de la galería para siempre.',
      onConfirm: proceedWithDeletion,
      confirmText: 'Eliminar'
    });
  };

  const canDelete = (imageUrl: string) => {
    if (!currentUser) return false;
    if (currentUser.rol === 3) return true; // Admin
    
    // Si hay metadatos, verificar autoría
    const imgData = detailedImages.find(img => {
      const filename = img.url.split('/').pop();
      return imageUrl.includes(filename || '---');
    });

    if (imgData && imgData.id_usuario === currentUser.id_usuario) return true;
    
    // Si es dueño del lugar/pyme, puede borrar cualquier cosa (incluso legacy)
    if (isOwner) return true;

    return false;
  };

  const handleImageError = (index: number) => {
    setImageErrors(prev => ({ ...prev, [index]: true }));
  };

  const openModal = (index: number) => {
    if (validImages.length === 0) return;
    setModalIndex(index);
    setShowModal(true);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setShowModal(false);
    document.body.style.overflow = 'auto';
  };

  const nextImage = () => {
    setModalIndex((prev) => (prev + 1) % validImages.length);
  };

  const prevImage = () => {
    setModalIndex((prev) => (prev - 1 + validImages.length) % validImages.length);
  };

  // Renderiza una imagen o un placeholder si hay error
  const [loadedImages, setLoadedImages] = useState<Record<number, boolean>>({});

  const renderImage = (src: string, index: number, className: string) => {
    if (imageErrors[index] || !src) {
      return (
        <div className={`${className} bg-neutral-100 flex flex-col items-center justify-center gap-2 border border-neutral-200`}>
          <ImageIcon className="w-8 h-8 text-neutral-300" />
          <span className="text-[10px] text-neutral-400 font-medium uppercase tracking-wider">No disponible</span>
        </div>
      );
    }

    return (
      <div className={`relative ${className} overflow-hidden bg-neutral-200 animate-pulse`}>
        {!loadedImages[index] && (
           <div className="absolute inset-0 skeleton flex items-center justify-center">
              <ImageIcon className="w-6 h-6 text-neutral-300" />
           </div>
        )}
        <img
          src={src}
          alt={`${placeName} - ${index + 1}`}
          className={`${className} object-cover group-hover:brightness-90 transition-all duration-700 ${loadedImages[index] ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setLoadedImages(prev => ({ ...prev, [index]: true }))}
          onError={() => handleImageError(index)}
        />
        
        {/* Botón Eliminar - Solo si tiene permisos */}
        {canDelete(src) && (
          <button
            onClick={(e) => handleDelete(e, src)}
            disabled={isDeleting !== null}
            className="absolute top-2 right-2 p-2 bg-black/50 hover:bg-red-600 text-white rounded-full backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all z-10 hover:scale-110 active:scale-95 disabled:opacity-50"
            title="Eliminar imagen"
          >
            {isDeleting === detailedImages.find(img => resolvePhotoUrl(img.url) === src)?.id_imagen ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </button>
        )}
      </div>
    );
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement> | File) => {
    let file: File | undefined;
    
    if (e instanceof File) {
      file = e;
    } else {
      file = e.target.files?.[0];
    }

    if (!file || !entityId || !entityType) return;

    setIsUploading(true);
    try {
      const result = await uploadPhoto(entityType, entityId, file);
      console.log('Upload success:', result);
      if (onImageUploaded) onImageUploaded(result.url);
      showAlert({ type: 'success', title: '¡Imagen subida!', message: 'La nueva foto ha sido añadida a la galería con éxito.' });
      setShowCamera(false);
      setCapturedImage(null);
    } catch (error) {
      console.error('Error al subir imagen:', error);
      showAlert({ type: 'error', title: 'Error de Subida', message: 'No se pudo procesar la imagen. Asegúrate de que el formato sea válido (JPG/PNG/WEBP) y no pese más de 5MB.' });
    } finally {
      setIsUploading(false);
      // Resetear el input para permitir subir la misma foto o varias seguidas
      if (!(e instanceof File) && e.target) {
        e.target.value = '';
      }
    }
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' }, 
        audio: false 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setShowCamera(true);
    } catch (err) {
      console.error("Error accessing camera:", err);
      showAlert({ type: 'error', title: 'Acceso a cámara', message: 'No se pudo acceder a la cámara. Asegúrate de dar permisos.' });
      // Fallback a input file con capture
      fileInputRef.current?.setAttribute('capture', 'environment');
      fileInputRef.current?.click();
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setShowCamera(false);
    setCapturedImage(null);
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setCapturedImage(dataUrl);
      }
    }
  };

  const uploadCapturedImage = async () => {
    if (!capturedImage) return;
    
    const res = await fetch(capturedImage);
    const blob = await res.blob();
    const file = new File([blob], `camera_${Date.now()}.jpg`, { type: 'image/jpeg' });
    
    handleFileUpload(file);
  };

  return (
    <>
      {/* Controles ocultos (Inputs y Canvas) - Siempre presentes */}
      <input 
        type="file" 
        accept="image/*" 
        className="hidden" 
        ref={fileInputRef}
        onChange={handleFileUpload}
      />
      <canvas ref={canvasRef} className="hidden" />

      {/* Caso: No hay imágenes */}
      {validImages.length === 0 ? (
        <div className="relative rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-700 h-[400px] md:h-[460px] bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-800 flex flex-col items-center justify-center gap-6 group">
          <div className="w-24 h-24 rounded-full bg-white dark:bg-neutral-800 shadow-md flex items-center justify-center text-neutral-300 dark:text-neutral-600 group-hover:scale-110 transition-transform duration-500 relative">
            <ImageIcon className="w-10 h-10" />
            {isUploading && (
              <div className="absolute inset-0 bg-white/80 dark:bg-neutral-800/80 rounded-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-airbnb animate-spin" />
              </div>
            )}
          </div>
          <div className="text-center px-6">
            <h3 className="text-neutral-800 dark:text-white font-bold text-xl mb-2">Aún no hay fotos</h3>
            <p className="text-neutral-500 dark:text-neutral-400 text-sm max-w-xs mx-auto mb-8">
              El anfitrión no ha subido imágenes todavía. Si eres el dueño, puedes subir una ahora.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="flex items-center gap-3 bg-neutral-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-neutral-800 transition-all shadow-lg active:scale-95 disabled:opacity-50"
              >
                <Upload className="w-5 h-5" />
                Subir Foto
              </button>
              
              <button 
                onClick={startCamera}
                disabled={isUploading}
                className="flex items-center gap-3 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-700 px-8 py-4 rounded-2xl font-bold hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-all shadow-sm active:scale-95 disabled:opacity-50"
              >
                <Camera className="w-5 h-5" />
                Tomar Foto
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Layout de Imágenes */
        <div className="relative rounded-2xl overflow-hidden group/gallery">
        
        {/* Mobile Slider (Solo visible en móviles) */}
        <div className="md:hidden flex overflow-x-auto snap-x snap-mandatory scrollbar-hide h-[350px] gap-1">
          {validImages.map((src, idx) => (
            <div 
              key={idx} 
              className="flex-shrink-0 w-full h-full snap-start cursor-pointer"
              onClick={() => openModal(idx)}
            >
              {renderImage(src, idx, "w-full h-full")}
            </div>
          ))}
        </div>

        {/* Desktop Grid (Oculto en móviles) */}
        <div className={`hidden md:grid gap-2 h-[460px] ${
          validImages.length === 1 ? 'grid-cols-1' : 
          validImages.length === 2 ? 'grid-cols-2' : 
          'grid-cols-4 grid-rows-2'
        }`}>
          {/* Layout para 1 imagen */}
          {validImages.length === 1 && (
            <div className="w-full h-full cursor-pointer overflow-hidden group bg-neutral-50 dark:bg-neutral-900/50 flex items-center justify-center" onClick={() => openModal(0)}>
              {renderImage(validImages[0], 0, "max-w-full max-h-full object-contain")}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
            </div>
          )}

          {/* Layout para 2 imágenes */}
          {validImages.length === 2 && validImages.map((src, idx) => (
            <div key={idx} className="w-full h-full cursor-pointer overflow-hidden group" onClick={() => openModal(idx)}>
              {renderImage(src, idx, "w-full h-full")}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
            </div>
          ))}

          {/* Layout para 3 imágenes */}
          {validImages.length === 3 && (
            <>
              <div className="col-span-2 row-span-2 cursor-pointer overflow-hidden group" onClick={() => openModal(0)}>
                {renderImage(validImages[0], 0, "w-full h-full")}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
              </div>
              <div className="col-span-2 row-span-1 cursor-pointer overflow-hidden group" onClick={() => openModal(1)}>
                {renderImage(validImages[1], 1, "w-full h-full")}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
              </div>
              <div className="col-span-2 row-span-1 cursor-pointer overflow-hidden group" onClick={() => openModal(2)}>
                {renderImage(validImages[2], 2, "w-full h-full")}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
              </div>
            </>
          )}

          {/* Layout para 4 imágenes */}
          {validImages.length === 4 && (
            <>
              <div className="col-span-2 row-span-2 cursor-pointer overflow-hidden group" onClick={() => openModal(0)}>
                {renderImage(validImages[0], 0, "w-full h-full")}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
              </div>
              <div className="col-span-2 row-span-1 cursor-pointer overflow-hidden group" onClick={() => openModal(1)}>
                {renderImage(validImages[1], 1, "w-full h-full")}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
              </div>
              <div className="col-span-1 row-span-1 cursor-pointer overflow-hidden group" onClick={() => openModal(2)}>
                {renderImage(validImages[2], 2, "w-full h-full")}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
              </div>
              <div className="col-span-1 row-span-1 cursor-pointer overflow-hidden group" onClick={() => openModal(3)}>
                {renderImage(validImages[3], 3, "w-full h-full")}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
              </div>
            </>
          )}

          {/* Layout para 5 o más imágenes (Standard Airbnb) */}
          {validImages.length >= 5 && (
            <>
              <div className="col-span-2 row-span-2 cursor-pointer overflow-hidden group" onClick={() => openModal(0)}>
                {renderImage(validImages[0], 0, "w-full h-full")}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
              </div>
              {validImages.slice(1, 5).map((src, idx) => {
                const isLast = idx === 3; // El índice 3 del slice es la 5ta imagen total
                const hasMore = validImages.length > 5;
                
                return (
                  <div 
                    key={idx + 1} 
                    className="cursor-pointer overflow-hidden group relative" 
                    onClick={() => openModal(isLast && hasMore ? 5 : idx + 1)}
                  >
                    {renderImage(src, idx + 1, "w-full h-full")}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                    
                    {isLast && hasMore && (
                      <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white backdrop-blur-[2px]">
                        <span className="text-2xl font-black">+{validImages.length - 5}</span>
                        <span className="text-[10px] font-bold uppercase tracking-widest mt-1">Ver fotos</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          )}
        </div>

        {/* Botón ver todas las fotos - Estilo Premium Glassmorphism */}
        <div className="absolute bottom-6 right-6 flex items-center gap-3">
          {isOwner && (
            <>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 bg-white/90 backdrop-blur-md border border-neutral-300 text-neutral-800 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-white transition-all shadow-xl hover:scale-105 active:scale-95"
              >
                <Upload className="w-4 h-4" />
                Añadir
              </button>
              <button
                onClick={startCamera}
                className="flex items-center gap-2 bg-white/90 backdrop-blur-md border border-neutral-300 text-neutral-800 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-white transition-all shadow-xl hover:scale-105 active:scale-95"
              >
                <Camera className="w-4 h-4" />
                Tomar
              </button>
            </>
          )}
          <button
            onClick={() => openModal(0)}
            className="flex items-center gap-2 bg-white/90 backdrop-blur-md border border-neutral-300 text-neutral-800 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-white transition-all shadow-xl hover:scale-105 active:scale-95"
          >
            <Grid3X3 className="w-4 h-4" />
            Mostrar todas
          </button>
        </div>
      </div>
    )}

      {/* Modal fullscreen - Estilo Cinema */}
      {showModal && (
        <div className="fixed inset-0 z-[100] bg-neutral-950 flex items-center justify-center animate-in fade-in duration-300">
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-6 z-10 bg-gradient-to-b from-black/50 to-transparent">
            <button
              onClick={closeModal}
              className="flex items-center gap-2 text-white hover:bg-white/20 px-4 py-2 rounded-full transition-all backdrop-blur-sm border border-white/10"
            >
              <X className="w-5 h-5" />
              <span className="text-sm font-medium">Cerrar</span>
            </button>
            <div className="px-4 py-1.5 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 text-white text-xs font-medium tracking-widest">
              {modalIndex + 1} / {validImages.length}
            </div>
          </div>

          {/* Imagen con animación suave */}
          <div className="relative w-full h-full flex items-center justify-center p-4 md:p-12">
            {imageErrors[modalIndex] ? (
              <div className="flex flex-col items-center justify-center gap-4 text-white/50">
                <ImageIcon className="w-20 h-20" />
                <p className="text-sm font-medium">Imagen no disponible</p>
              </div>
            ) : (
              <img
                src={validImages[modalIndex]}
                alt={`${placeName} - ${modalIndex + 1}`}
                className="max-w-full max-h-full object-contain select-none shadow-2xl transition-all duration-500"
                onError={() => setImageErrors(prev => ({ ...prev, [modalIndex]: true }))}
              />
            )}

            {/* Botón eliminar en modal */}
            {canDelete(validImages[modalIndex]) && (
              <button
                onClick={(e) => {
                  const isLastImage = validImages.length <= 1;
                  const isLastIndex = modalIndex === validImages.length - 1;
                  
                  handleDelete(e, validImages[modalIndex]);
                  
                  if (isLastImage) {
                    closeModal();
                  } else if (isLastIndex) {
                    setModalIndex(prev => prev - 1);
                  }
                }}
                disabled={isDeleting !== null}
                className="absolute bottom-10 right-10 flex items-center gap-2 bg-red-600/80 hover:bg-red-600 text-white px-6 py-3 rounded-2xl font-bold backdrop-blur-md transition-all shadow-2xl active:scale-95 disabled:opacity-50 z-[110]"
              >
                {isDeleting && (
                  isDeleting === -1 || 
                  detailedImages.find(img => validImages[modalIndex].includes(img.url.split('/').pop() || ''))?.id_imagen === isDeleting
                ) ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Trash2 className="w-5 h-5" />
                )}
                Eliminar Foto
              </button>
            )}
          </div>

          {/* Flechas Navegación Premium */}
          {validImages.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 border border-white/10 rounded-full flex items-center justify-center text-white transition-all hover:scale-110 active:scale-90 backdrop-blur-sm"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 border border-white/10 rounded-full flex items-center justify-center text-white transition-all hover:scale-110 active:scale-90 backdrop-blur-sm"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Miniaturas en el modal (Opcional, pero añade premium feel) */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 overflow-x-auto max-w-[80vw] p-2 scrollbar-hide">
             {validImages.map((img, i) => (
               <button 
                key={i} 
                onClick={() => setModalIndex(i)}
                className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${modalIndex === i ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-50 hover:opacity-100'}`}
               >
                 <img src={img} className="w-full h-full object-cover" alt="thumb" />
               </button>
             ))}
          </div>
        </div>
      )}
      {/* Modal Cámara */}
      {showCamera && (
        <div className="fixed inset-0 z-[110] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 md:p-10 animate-in fade-in duration-300">
          <div className="bg-neutral-900 w-full max-w-3xl rounded-[32px] overflow-hidden shadow-2xl border border-white/10 relative flex flex-col">
            {/* Header */}
            <div className="p-6 flex items-center justify-between border-b border-white/5">
              <h3 className="text-white font-bold text-lg flex items-center gap-2">
                <Camera className="w-5 h-5 text-airbnb" />
                Capturar Foto
              </h3>
              <button 
                onClick={stopCamera}
                className="p-2 hover:bg-white/10 rounded-full text-white/70 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Video Feed / Capture */}
            <div className="relative aspect-video bg-black flex items-center justify-center group">
              {!capturedImage ? (
                <>
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    className="w-full h-full object-cover mirror"
                  />
                  {/* Grid overlay for better framing */}
                  <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-20">
                    {[...Array(4)].map((_, i) => (
                      <div key={`v-${i}`} className="border-r border-white" />
                    ))}
                    {[...Array(4)].map((_, i) => (
                      <div key={`h-${i}`} className="border-b border-white" />
                    ))}
                  </div>
                </>
              ) : (
                <img 
                  src={capturedImage} 
                  className="w-full h-full object-cover" 
                  alt="Captured" 
                />
              )}
              
              <canvas ref={canvasRef} className="hidden" />
              
              {isUploading && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center gap-4 text-white">
                  <Loader2 className="w-12 h-12 animate-spin text-airbnb" />
                  <p className="font-bold tracking-widest text-sm uppercase">Subiendo imagen...</p>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="p-8 flex items-center justify-center gap-6">
              {!capturedImage ? (
                <button 
                  onClick={takePhoto}
                  className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center group hover:scale-105 active:scale-95 transition-all shadow-xl"
                >
                  <div className="w-14 h-14 bg-white rounded-full group-hover:scale-90 transition-transform" />
                </button>
              ) : (
                <div className="flex items-center gap-4 w-full max-w-sm">
                  <button 
                    onClick={() => setCapturedImage(null)}
                    disabled={isUploading}
                    className="flex-1 flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white py-4 rounded-2xl font-bold transition-all border border-white/10 active:scale-95 disabled:opacity-50"
                  >
                    <RotateCcw className="w-5 h-5" />
                    Repetir
                  </button>
                  <button 
                    onClick={uploadCapturedImage}
                    disabled={isUploading}
                    className="flex-1 flex items-center justify-center gap-2 bg-airbnb hover:bg-airbnb-dark text-white py-4 rounded-2xl font-bold transition-all shadow-lg shadow-airbnb/20 active:scale-95 disabled:opacity-50"
                  >
                    <Check className="w-5 h-5" />
                    Usar Foto
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
