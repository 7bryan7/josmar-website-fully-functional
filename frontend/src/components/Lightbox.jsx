import React, { useState, useEffect } from 'react';
import { XMarkIcon, MagnifyingGlassPlusIcon, MagnifyingGlassMinusIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

export default function Lightbox({ isOpen, images = [], initialIndex = 0, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    setCurrentIndex(initialIndex);
    setScale(1);
  }, [initialIndex, isOpen]);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Key listeners
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, currentIndex, onClose]);

  if (!isOpen || images.length === 0) return null;

  const currentImage = images[currentIndex];

  const handlePrev = () => {
    setScale(1);
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setScale(1);
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const zoomIn = () => setScale((s) => Math.min(s + 0.25, 3));
  const zoomOut = () => setScale((s) => Math.max(s - 0.25, 0.5));

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-between bg-slate-950/95 backdrop-blur-md transition-opacity">
      {/* Top Controls */}
      <div className="flex justify-between items-center px-6 py-4 z-10">
        <div className="text-white text-sm font-medium">
          {currentIndex + 1} / {images.length}
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={zoomOut} 
            disabled={scale <= 0.5}
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-30 transition-all"
            title="Zoom Out"
          >
            <MagnifyingGlassMinusIcon className="h-6 w-6" />
          </button>
          <button 
            onClick={zoomIn} 
            disabled={scale >= 3}
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-30 transition-all"
            title="Zoom In"
          >
            <MagnifyingGlassPlusIcon className="h-6 w-6" />
          </button>
          <button 
            onClick={onClose} 
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-all"
            title="Close (Esc)"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Main Image Container */}
      <div className="flex-grow relative flex items-center justify-center p-4">
        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-6 p-3 rounded-full text-slate-400 hover:text-white bg-black/20 hover:bg-black/40 transition-all z-10"
            >
              <ChevronLeftIcon className="h-7 w-7" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-6 p-3 rounded-full text-slate-400 hover:text-white bg-black/20 hover:bg-black/40 transition-all z-10"
            >
              <ChevronRightIcon className="h-7 w-7" />
            </button>
          </>
        )}

        {/* Zoomed Image */}
        <div 
          className="transition-transform duration-200 ease-out max-w-full max-h-[75vh]"
          style={{ transform: `scale(${scale})` }}
        >
          <img 
            src={currentImage.path.startsWith('http') ? currentImage.path : `/media/${currentImage.path}`} 
            alt={currentImage.alt_text || currentImage.title || 'Lightbox view'} 
            className="max-w-full max-h-[75vh] object-contain rounded shadow-2xl select-none"
            draggable={false}
          />
        </div>
      </div>

      {/* Info Bar at the Bottom */}
      <div className="bg-black/50 text-center py-6 px-4 z-10">
        <h4 className="text-white font-semibold text-lg">{currentImage.title || currentImage.name || 'Image Preview'}</h4>
        {currentImage.description && (
          <p className="text-slate-400 text-sm mt-1 max-w-2xl mx-auto">{currentImage.description || currentImage.caption}</p>
        )}
      </div>
    </div>
  );
}
