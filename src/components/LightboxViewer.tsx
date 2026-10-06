import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';
import { useKeyPress } from '../hooks/useKeyPress';
import { useScrollLock } from '../hooks/useScrollLock';

interface LightboxViewerProps {
  images: string[];
  initialIndex: number;
  onClose: () => void;
}

export const LightboxViewer: React.FC<LightboxViewerProps> = ({ images, initialIndex, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [scale, setScale] = useState(1);

  useScrollLock(true);

  const handleNext = () => {
    setScale(1);
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrev = () => {
    setScale(1);
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const toggleZoom = () => {
    setScale((prev) => (prev === 1 ? 2.5 : 1));
  };

  useKeyPress('Escape', onClose);
  useKeyPress('ArrowRight', handleNext);
  useKeyPress('ArrowLeft', handlePrev);

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex flex-col animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent absolute top-0 w-full z-20">
        <div className="text-white/70 text-sm font-medium">
          {currentIndex + 1} / {images.length}
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={(e) => { e.stopPropagation(); toggleZoom(); }} 
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            {scale === 1 ? <ZoomIn className="w-5 h-5" /> : <ZoomOut className="w-5 h-5" />}
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onClose(); }} 
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Image Container */}
      <div 
        className="flex-1 flex items-center justify-center overflow-hidden z-10" 
        onClick={toggleZoom}
      >
        <img
          src={images[currentIndex]}
          alt={`Gallery image ${currentIndex + 1}`}
          className="max-w-full max-h-full object-contain transition-transform duration-300 ease-out select-none"
          style={{ 
            transform: `scale(${scale})`, 
            cursor: scale > 1 ? 'zoom-out' : 'zoom-in' 
          }}
          draggable={false}
        />
      </div>

      {/* Navigation Arrows */}
      {images.length > 1 && (
        <>
          <button 
            onClick={(e) => { e.stopPropagation(); handlePrev(); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md transition-all z-20"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); handleNext(); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md transition-all z-20"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        </>
      )}
      
      {/* Thumbnails */}
      <div className="absolute bottom-0 w-full p-4 bg-gradient-to-t from-black/80 to-transparent flex justify-center gap-2 overflow-x-auto z-20">
         {images.map((img, idx) => (
           <button
             key={idx}
             onClick={(e) => { e.stopPropagation(); setScale(1); setCurrentIndex(idx); }}
             className={`w-16 h-12 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${
               currentIndex === idx ? 'border-blue-500 scale-110 shadow-lg shadow-blue-500/50' : 'border-transparent opacity-50 hover:opacity-100'
             }`}
           >
             <img src={img} alt="thumb" className="w-full h-full object-cover" />
           </button>
         ))}
      </div>
    </div>
  );
};
