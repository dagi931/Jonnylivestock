import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Animal, AnimalStatus } from '../../types/animal';
import { StatusBadge } from './StatusBadge';
import { formatPrice, formatWeight } from '../../utils/formatters';
import { MapPin, Scale, ArrowRight, Video, ChevronDown } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { useInView } from '../../hooks/useInView';

interface AnimalCardProps {
  animal: Animal;
  animationIndex?: number;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  eager?: boolean;
}

/** Build an optimized responsive image URL supporting both Unsplash and local /uploads/ variants */
export function getOptimizedImageUrl(url: string, width = 340, height?: number, quality = 50): string {
  if (!url) return '';
  if (url.includes('images.unsplash.com')) {
    const baseUrl = url.split('?')[0];
    const hParam = height ? `&h=${height}` : '';
    return `${baseUrl}?auto=format&fit=crop&w=${width}${hParam}&q=${quality}`;
  }
  if (url.startsWith('/uploads/')) {
    if (url.includes('-sm.') || url.includes('-md.')) return url;
    const dotIdx = url.lastIndexOf('.');
    if (dotIdx === -1) return url;
    const base = url.substring(0, dotIdx);
    const ext = url.substring(dotIdx);
    if (width <= 360) return `${base}-sm${ext}`;
    if (width <= 640) return `${base}-md${ext}`;
    return url;
  }
  return url;
}

/** Build a responsive srcSet for both Unsplash and local /uploads/ images */
export function buildImageSrcSet(url: string, quality = 50): string | undefined {
  if (!url) return undefined;
  if (url.includes('images.unsplash.com')) {
    const baseUrl = url.split('?')[0];
    const s260 = `${baseUrl}?auto=format&fit=crop&w=260&q=${quality}&fm=webp 260w`;
    const s340 = `${baseUrl}?auto=format&fit=crop&w=340&q=${quality}&fm=webp 340w`;
    const s420 = `${baseUrl}?auto=format&fit=crop&w=420&q=${quality}&fm=webp 420w`;
    const s600 = `${baseUrl}?auto=format&fit=crop&w=600&q=${quality}&fm=webp 600w`;
    return `${s260}, ${s340}, ${s420}, ${s600}`;
  }
  if (url.startsWith('/uploads/')) {
    const dotIdx = url.lastIndexOf('.');
    if (dotIdx === -1) return undefined;
    let base = url.substring(0, dotIdx);
    base = base.replace(/-sm$/, '').replace(/-md$/, '');
    const ext = url.substring(dotIdx);
    return `${base}-sm${ext} 360w, ${base}-md${ext} 640w, ${base}${ext} 1200w`;
  }
  return undefined;
}

export const getOptimizedUnsplashUrl = getOptimizedImageUrl;
export const buildUnsplashSrcSet = buildImageSrcSet;

export const AnimalCard: React.FC<AnimalCardProps> = ({
  animal,
  animationIndex = 0,
  isExpanded,
  onToggleExpand,
  eager = false
}) => {
  const [localShowMore, setLocalShowMore] = useState(false);
  const showMore = isExpanded !== undefined ? isExpanded : localShowMore;
  const [isTouched, setIsTouched] = useState(false);
  const touchTimerRef = useRef<any>(null);
  const { ref: cardRef, isInView } = useInView({ rootMargin: '200px 0px 100px 0px' });
  const { theme } = useTheme();
  const { t, isAmharic } = useLanguage();
  const isDark = theme === 'design7';
  // Render top card immediately if explicitly marked eager (above-the-fold catalog LCP)
  const isInitialViewport = Boolean(eager);
  const isCardVisible = isInitialViewport || isInView;

  const handleToggleShowMore = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onToggleExpand) {
      onToggleExpand();
    } else {
      setLocalShowMore((prev) => !prev);
    }
  };

  const handleTouch = () => {
    setIsTouched(true);
    if (touchTimerRef.current) clearTimeout(touchTimerRef.current);
    touchTimerRef.current = setTimeout(() => {
      setIsTouched(false);
    }, 1800);
  };

  const getTypeLabel = () => {
    if (animal.type === 'sheep') return isAmharic ? 'በግ' : 'Sheep';
    if (animal.type === 'goat') return isAmharic ? 'ፍየል' : 'Goat';
    return isAmharic ? 'ከብት / ላም' : 'Cow';
  };

  const getGenderLabel = () => {
    if (animal.gender === 'Male') return t.common.male;
    return t.common.female;
  };

  const isSold = animal.status === 'sold' || (animal.quantity !== undefined && animal.quantity <= 0);
  const displayStatus: AnimalStatus = isSold ? 'sold' : animal.status;

  return (
    <div
      ref={cardRef}
      onTouchStart={handleTouch}
      onTouchEnd={handleTouch}
      style={{
        transitionProperty: isInitialViewport ? 'none' : 'transform, opacity, border-color, box-shadow',
        transitionDelay: isInitialViewport ? '0ms' : `${Math.min(animationIndex * 50, 250)}ms`,
        transitionDuration: isInitialViewport ? '0ms' : '300ms',
        transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
      }}
      className={`group relative rounded-xl sm:rounded-2xl border flex flex-col overflow-hidden hover:-translate-y-1 active:-translate-y-0.5 cursor-pointer select-none transition-[transform,opacity,border-color,box-shadow] self-start h-fit w-full ${
        isInitialViewport
          ? 'opacity-100 translate-y-0 scale-100'
          : isCardVisible
            ? 'opacity-100 translate-y-0 scale-100'
            : 'opacity-0 scale-[0.99]'
      } ${
        isDark
          ? 'bg-[#2A1A0D] border-[#4A2C16] hover:border-[#C58A3A]/70 shadow-sm hover:shadow-lg'
          : 'bg-[#F1E8D8] border-[#E4D4BC] hover:border-[#8A4B08]/70 shadow-sm hover:shadow-md'
      }`}
    >
      {/* Compact Image Container */}
      <div className="relative aspect-[16/11] sm:aspect-[16/9] w-full overflow-hidden bg-stone-900">
        {isCardVisible ? (
          <img
            src={getOptimizedUnsplashUrl(animal.images[0], 340, undefined, 50)}
            srcSet={buildUnsplashSrcSet(animal.images[0], 50)}
            sizes="(max-width: 640px) calc(50vw - 16px), (max-width: 1024px) 280px, 360px"
            alt={`${animal.breed} ${animal.type} ${animal.id}`}
            width="340"
            loading={eager && animationIndex === 0 ? "eager" : "lazy"}
            {...(eager && animationIndex === 0 ? ({ fetchPriority: "high" } as any) : {})}
            decoding="async"
            className={`w-full h-full object-cover object-center card-zoom-img transition-transform duration-500 ease-out ${
              isTouched ? 'scale-100' : 'scale-110'
            } group-hover:scale-100 group-active:scale-100 active:scale-100`}
          />
        ) : (
          <div className="w-full h-full bg-stone-900/60" />
        )}

        {/* Subtle Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

        {/* Top Badges: Animal ID & Status Tag */}
        <div className="absolute top-1.5 sm:top-2.5 inset-x-1.5 sm:inset-x-2.5 flex items-center justify-between gap-1 z-20">
          <span className="px-1.5 py-0.5 rounded text-[9px] sm:text-[11px] font-mono font-bold tracking-wider uppercase bg-black/70 text-[#FAF7F0] backdrop-blur-sm border border-white/10 shadow-xs">
            {animal.id}
          </span>
          <StatusBadge status={displayStatus} size="sm" />
        </div>

        {/* Video Indicator */}
        {animal.video && (
          <div className="absolute bottom-1.5 left-1.5 sm:bottom-2 sm:left-2 flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-black/70 text-[#E0B15A] text-[9px] sm:text-[10px] font-medium backdrop-blur-sm border border-white/10 z-20">
            <Video className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            <span>{isAmharic ? 'ቪዲዮ' : 'Video'}</span>
          </div>
        )}
      </div>

      {/* Compact Card Body */}
      <div className="p-2 sm:p-4 flex-1 flex flex-col justify-between space-y-1.5 sm:space-y-2.5">
        <div>
          {/* Category & Breed */}
          <div className="flex items-start justify-between gap-1 sm:gap-2">
            <div className="min-w-0">
              <span
                className={`block text-[9px] sm:text-[10px] font-bold uppercase tracking-wider ${
                  isDark ? 'text-[#C58A3A]' : 'text-[#8A4B08]'
                }`}
              >
                {getTypeLabel()}
              </span>
              <h2
                className={`font-serif font-bold text-xs sm:text-base leading-tight truncate transition-colors ${
                  isDark
                    ? 'text-[#F4E8D0] group-hover:text-[#E0B15A]'
                    : 'text-[#241A12] group-hover:text-[#8A4B08]'
                }`}
              >
                {animal.breed}
              </h2>
            </div>

            {/* Gender Pill */}
            <span
              className={`px-1 sm:px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-semibold shrink-0 ${
                animal.gender === 'Male'
                  ? isDark
                    ? 'bg-[#1B1208] text-[#D8C5A8] border border-[#4A2C16]'
                    : 'bg-[#FAF7F0] text-[#3D2E20] border border-[#E4D4BC]'
                  : isDark
                    ? 'bg-[#4A2C16]/40 text-[#F4E8D0] border border-[#4A2C16]'
                    : 'bg-[#FAF7F0] text-[#4A3B2C] border border-[#E4D4BC]'
              }`}
            >
              {getGenderLabel()}
            </span>
          </div>

          {/* Key Specs (Weight & Location) */}
          <div className="mt-1.5 sm:mt-2 grid grid-cols-2 gap-1 sm:gap-1.5 text-xs">
            <div
              className={`flex items-center gap-1 sm:gap-1.5 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-md sm:rounded-lg ${
                isDark ? 'bg-[#1B1208]/70 text-[#D8C5A8]' : 'bg-[#FAF7F0] text-[#3D2E20] border border-[#E4D4BC]/40'
              }`}
            >
              <Scale className={`w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0 ${isDark ? 'text-[#C58A3A]' : 'text-[#8A4B08]'}`} />
              <span className="font-bold text-[10px] sm:text-xs truncate">
                {formatWeight(animal.weight)}
              </span>
            </div>

            <div
              className={`flex items-center gap-1 sm:gap-1.5 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-md sm:rounded-lg truncate ${
                isDark ? 'bg-[#1B1208]/70 text-[#D8C5A8]' : 'bg-[#FAF7F0] text-[#3D2E20] border border-[#E4D4BC]/40'
              }`}
            >
              <MapPin className={`w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0 ${isDark ? 'text-[#C58A3A]' : 'text-[#8A4B08]'}`} />
              <span className="truncate text-[9.5px] sm:text-[11px] font-medium">{animal.location}</span>
            </div>
          </div>

          {/* Expandable "Show more / Details" Toggle */}
          <div className="mt-1 sm:mt-1.5">
            <button
              type="button"
              onClick={handleToggleShowMore}
              className="w-full text-[9.5px] sm:text-xs font-semibold flex items-center justify-between py-0.5 px-1 rounded hover:bg-black/5 dark:hover:bg-white/5 opacity-75 hover:opacity-100 transition-colors"
            >
              <span>{showMore ? (isAmharic ? 'አሳንስ' : 'Show less') : (isAmharic ? 'ተጨማሪ ዝርዝር' : 'Show more')}</span>
              <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${showMore ? 'rotate-180' : ''}`} />
            </button>

            {showMore && (
              <div className="pt-1.5 pb-1 space-y-1 text-[9.5px] sm:text-xs border-t border-black/5 dark:border-white/5 animate-in fade-in duration-150">
                {animal.color && (
                  <div className="flex justify-between opacity-80">
                    <span className="font-medium">{isAmharic ? 'ቀለም:' : 'Color:'}</span>
                    <span className="font-semibold truncate">{animal.color}</span>
                  </div>
                )}
                {animal.description && (
                  <p className="opacity-75 line-clamp-2 leading-tight">
                    {animal.description}
                  </p>
                )}
                {animal.characteristics && animal.characteristics.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-0.5">
                    {animal.characteristics.slice(0, 2).map((char, i) => (
                      <span
                        key={i}
                        className="px-1 py-0.2 rounded text-[8.5px] sm:text-[9.5px] bg-amber-500/10 text-amber-600 dark:text-amber-400 font-medium"
                      >
                        {char}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Card Bottom: Price & View Details Link */}
        <div
          className={`pt-1.5 sm:pt-2.5 border-t flex items-center justify-between gap-1 sm:gap-2 ${
            isDark ? 'border-[#4A2C16]' : 'border-[#E4D4BC]'
          }`}
        >
          <div>
            <span className="block text-[8px] sm:text-[9px] uppercase tracking-wider font-semibold text-[#54473A] dark:text-[#D8C5A8]/80 leading-tight">
              {t.common.farmPrice}
            </span>
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span
                className={`text-xs sm:text-base font-bold font-serif ${
                  isDark ? 'text-[#E0B15A]' : 'text-[#8A4B08]'
                }`}
              >
                {formatPrice(animal.price)}
              </span>
              {displayStatus === 'available' && (
                <span className="text-[9px] sm:text-[10.5px] font-bold text-emerald-600 dark:text-emerald-500 font-mono">
                  (50%: {formatPrice(animal.price * 0.5)})
                </span>
              )}
            </div>
          </div>

          <Link
            to={`/animals/${animal.id}`}
            aria-label={`${t.common.details} - ${animal.breed} ${animal.id}`}
            className={`inline-flex items-center gap-0.5 sm:gap-1 px-1.5 py-1 sm:px-2.5 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-semibold transition-all ${
              displayStatus === 'sold'
                ? isDark
                  ? 'bg-[#1B1208] text-[#D8C5A8]/50 border border-[#4A2C16]'
                  : 'bg-[#E4D4BC] text-[#4A3B2C]/70 border border-[#E4D4BC]'
                : isDark
                  ? 'bg-[#C58A3A] hover:bg-[#E0B15A] text-[#1B1208]'
                  : 'bg-[#8A4B08] hover:bg-[#6D3A05] text-[#FAF7F0]'
            }`}
          >
            <span>{t.common.details}</span>
            <ArrowRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};
