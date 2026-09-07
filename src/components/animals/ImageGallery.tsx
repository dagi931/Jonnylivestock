import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Maximize2, X } from 'lucide-react';

interface ImageGalleryProps {
  images: string[];
  alt: string;
  isSold?: boolean;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({ images, alt }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === 'design7';

  if (!images || images.length === 0) return null;

  return (
    <div className="space-y-4">
      {/* Main Image Container (Refined Compact Aspect Ratio) */}
      <div
        className={`relative aspect-[16/10] sm:aspect-[16/11] max-h-[340px] sm:max-h-[400px] w-full rounded-2xl sm:rounded-3xl overflow-hidden border group shadow-md ${
          isDark ? 'bg-[#1B1208] border-[#4A2C16]' : 'bg-[#FAF7F0] border-[#E4D4BC]'
        }`}
      >
        <img
          src={images[selectedIndex]}
          alt={`${alt} - View ${selectedIndex + 1}`}
          className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-102"
        />

        {/* Fullscreen Button - Visible on touch screens & hover on desktop */}
        <button
          onClick={() => setIsLightboxOpen(true)}
          type="button"
          className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 p-2 sm:p-2.5 rounded-xl bg-black/70 hover:bg-black/90 text-[#FAF7F0] backdrop-blur-sm border border-white/20 transition-all opacity-90 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100 cursor-pointer shadow-md"
          title="Open Fullscreen Gallery"
          aria-label="Open Fullscreen Gallery"
        >
          <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>

        {/* Counter Badge */}
        {images.length > 1 && (
          <div className="absolute top-3 right-3 sm:top-4 sm:right-4 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-black/70 text-[#FAF7F0] text-[10px] sm:text-xs font-mono font-bold backdrop-blur-sm border border-white/10 shadow-xs">
            {selectedIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-1.5 scrollbar-thin">
          {images.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setSelectedIndex(idx)}
              className={`relative shrink-0 w-14 h-14 sm:w-20 sm:h-20 rounded-lg sm:rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                selectedIndex === idx
                  ? isDark
                    ? 'border-[#C58A3A] ring-2 ring-[#C58A3A]/40 scale-105'
                    : 'border-[#B8792F] ring-2 ring-[#B8792F]/40 scale-105'
                  : isDark
                    ? 'border-[#4A2C16] opacity-60 hover:opacity-100'
                    : 'border-[#E4D4BC] opacity-60 hover:opacity-100'
              }`}
            >
              <img
                src={img}
                alt={`${alt} thumbnail ${idx + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen Lightbox Modal */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4">
          <button
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-6 right-6 p-3 rounded-full bg-white/10 hover:bg-white/20 text-[#FAF7F0] transition-colors"
            aria-label="Close fullscreen view"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="max-w-5xl max-h-[85vh] w-full flex flex-col items-center justify-center">
            <img
              src={images[selectedIndex]}
              alt={`${alt} fullscreen`}
              className="max-h-[75vh] w-auto max-w-full object-contain rounded-2xl shadow-2xl"
            />
            {images.length > 1 && (
              <div className="flex items-center gap-2 mt-4">
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedIndex(idx)}
                    className={`w-3 h-3 rounded-full transition-all ${
                      selectedIndex === idx ? 'bg-[#C58A3A] scale-125' : 'bg-white/40 hover:bg-white/70'
                    }`}
                    aria-label={`View photo ${idx + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
