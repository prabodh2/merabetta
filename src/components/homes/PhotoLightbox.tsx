'use client';

import React, { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';

interface PhotoLightboxProps {
  photos: Array<{ url: string; caption: string }>;
  activeIndex: number | null;
  onClose: () => void;
  onSelectIndex: (idx: number) => void;
  facilityName: string;
}

export default function PhotoLightbox({
  photos,
  activeIndex,
  onClose,
  onSelectIndex,
  facilityName,
}: PhotoLightboxProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeIndex === null) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onSelectIndex((activeIndex + 1) % photos.length);
      if (e.key === 'ArrowLeft') onSelectIndex((activeIndex - 1 + photos.length) % photos.length);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, photos.length, onClose, onSelectIndex]);

  if (activeIndex === null || !photos[activeIndex]) return null;

  const current = photos[activeIndex];

  return (
    <div className="fixed inset-0 z-50 h-dvh bg-black/95 backdrop-blur-md flex flex-col justify-between p-3 sm:p-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-2 text-white pb-3 border-b border-white/10">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <ImageIcon className="w-5 h-5 text-[#E86A33] shrink-0" />
          <div className="min-w-0">
            <h4 className="text-sm sm:text-base font-bold text-white line-clamp-1">
              {facilityName}
            </h4>
            <p className="text-xs text-slate-400 truncate">
              Photo {activeIndex + 1} of {photos.length} • {current.caption}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
        >
          <X className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      </div>

      {/* Main Image Stage */}
      <div className="flex-1 flex items-center justify-center relative my-2 sm:my-4 overflow-hidden">
        <button
          type="button"
          onClick={() => onSelectIndex((activeIndex - 1 + photos.length) % photos.length)}
          className="absolute left-1.5 sm:left-4 z-10 w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-all cursor-pointer hover:scale-105"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        <div className="max-h-[72dvh] max-w-5xl w-full flex flex-col items-center justify-center">
          <img
            src={current.url}
            alt={current.caption}
            className="max-h-[65dvh] max-w-full object-contain rounded-2xl shadow-2xl transition-all"
          />
          {current.caption && (
            <p className="text-xs sm:text-sm text-slate-300 text-center mt-3 bg-black/60 px-4 py-1.5 rounded-full backdrop-blur-xs max-w-full truncate">
              {current.caption}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={() => onSelectIndex((activeIndex + 1) % photos.length)}
          className="absolute right-1.5 sm:right-4 z-10 w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-all cursor-pointer hover:scale-105"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      </div>

      {/* Bottom Thumbnail Strip */}
      <div className="flex items-center justify-center gap-2 overflow-x-auto py-2 scrollbar-none">
        {photos.map((p, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onSelectIndex(i)}
            className={`w-16 h-12 rounded-lg overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
              i === activeIndex ? 'border-[#E86A33] scale-105 opacity-100' : 'border-transparent opacity-50 hover:opacity-80'
            }`}
          >
            <img src={p.url} alt={p.caption} className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}
