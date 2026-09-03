import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Animal } from '../../types/animal';
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
}

export const AnimalCard: React.FC<AnimalCardProps> = ({
  animal,
  animationIndex = 0,
  isExpanded,
  onToggleExpand
}) => {
  const [localShowMore, setLocalShowMore] = useState(false);
  const showMore = isExpanded !== undefined ? isExpanded : localShowMore;
  const [isTouched, setIsTouched] = useState(false);
  const touchTimerRef = useRef<any>(null);
  const { ref: cardRef, isInView } = useInView();
  const { theme } = useTheme();
  const { t, isAmharic } = useLanguage();
  const isDark = theme === 'design7';

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

  return (
    <div
      ref={cardRef}
      onTouchStart={handleTouch}
      onTouchEnd={handleTouch}
      style={{
        transitionDelay: `${Math.min(animationIndex * 75, 450)}ms`,
        transitionDuration: '650ms',
        transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
      }}
      className={`group relative rounded-xl sm:rounded-2xl border flex flex-col overflow-hidden hover:-translate-y-1 active:-translate-y-0.5 cursor-pointer select-none transition-all self-start h-fit w-full ${
        isInView
          ? 'opacity-100 translate-y-0 scale-100'
          : 'opacity-0 translate-y-7 scale-[0.98]'
      } ${
        isDark
          ? 'bg-[#2A1A0D] border-[#4A2C16] hover:border-[#C58A3A]/70 shadow-sm hover:shadow-lg'
          : 'bg-[#F1E8D8] border-[#E4D4BC] hover:border-[#B8792F]/70 shadow-sm hover:shadow-md'
      }`}
    >
      {/* Compact Image Container */}
      <div className="relative aspect-[16/11] sm:aspect-[16/9] w-full overflow-hidden bg-stone-900">
        <img
          src={animal.images[0]}
          alt={`${animal.breed} ${animal.type} ${animal.id}`}
          loading="lazy"
          className={`w-full h-full object-cover object-center card-zoom-img transition-transform duration-500 ease-out ${
            isTouched ? 'scale-100' : 'scale-110'
          } group-hover:scale-100 group-active:scale-100 active:scale-100`}
        />

        {/* Subtle Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

        {/* Top Badges: Animal ID & Status */}
        <div className="absolute top-1.5 sm:top-2.5 inset-x-1.5 sm:inset-x-2.5 flex items-center justify-between gap-1">
          <span className="px-1.5 py-0.5 rounded text-[9px] sm:text-[11px] font-mono font-bold tracking-wider uppercase bg-black/70 text-[#FAF7F0] backdrop-blur-sm border border-white/10 shadow-xs">
            {animal.id}
          </span>
          <StatusBadge status={animal.status} size="sm" />
        </div>

        {/* Video Indicator */}
        {animal.video && (
          <div className="absolute bottom-1.5 left-1.5 sm:bottom-2 sm:left-2 flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-black/70 text-[#E0B15A] text-[9px] sm:text-[10px] font-medium backdrop-blur-sm border border-white/10">
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
                  isDark ? 'text-[#C58A3A]' : 'text-[#B8792F]'
                }`}
              >
                {getTypeLabel()}
              </span>
              <h3
                className={`font-serif font-bold text-xs sm:text-base leading-tight truncate transition-colors ${
                  isDark
                    ? 'text-[#F4E8D0] group-hover:text-[#E0B15A]'
                    : 'text-[#241A12] group-hover:text-[#B8792F]'
                }`}
              >
                {animal.breed}
              </h3>
            </div>

            {/* Gender Pill */}
            <span
              className={`px-1 sm:px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-semibold shrink-0 ${
                animal.gender === 'Male'
                  ? isDark
                    ? 'bg-[#1B1208] text-[#D8C5A8] border border-[#4A2C16]'
                    : 'bg-[#FAF7F0] text-[#4A2C16] border border-[#E4D4BC]'
                  : isDark
                    ? 'bg-[#4A2C16]/40 text-[#F4E8D0] border border-[#4A2C16]'
                    : 'bg-[#FAF7F0] text-[#746556] border border-[#E4D4BC]'
              }`}
            >
              {getGenderLabel()}
            </span>
          </div>

          {/* Key Specs (Weight & Location) */}
          <div className="mt-1.5 sm:mt-2 grid grid-cols-2 gap-1 sm:gap-1.5 text-xs">
            <div
              className={`flex items-center gap-1 sm:gap-1.5 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-md sm:rounded-lg ${
                isDark ? 'bg-[#1B1208]/70 text-[#D8C5A8]' : 'bg-[#FAF7F0] text-[#746556] border border-[#E4D4BC]/40'
              }`}
            >
              <Scale className={`w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0 ${isDark ? 'text-[#C58A3A]' : 'text-[#B8792F]'}`} />
              <span className="font-bold text-[10px] sm:text-xs truncate">
                {formatWeight(animal.weight)}
              </span>
            </div>

            <div
              className={`flex items-center gap-1 sm:gap-1.5 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-md sm:rounded-lg truncate ${
                isDark ? 'bg-[#1B1208]/70 text-[#D8C5A8]' : 'bg-[#FAF7F0] text-[#746556] border border-[#E4D4BC]/40'
              }`}
            >
              <MapPin className={`w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0 ${isDark ? 'text-[#C58A3A]' : 'text-[#B8792F]'}`} />
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
                        className="px-1 py-0.2 rounded text-[8.5px] sm:text-[9.5px] bg-amber-500/10 text-amber-500 font-medium"
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
            <span className="block text-[8px] sm:text-[9px] uppercase tracking-wider font-semibold opacity-70 leading-tight">
              {t.common.farmPrice}
            </span>
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span
                className={`text-xs sm:text-base font-bold font-serif ${
                  isDark ? 'text-[#E0B15A]' : 'text-[#B8792F]'
                }`}
              >
                {formatPrice(animal.price)}
              </span>
              {animal.status === 'available' && (
                <span className="text-[9px] sm:text-[10.5px] font-bold text-emerald-500 font-mono">
                  (50%: {formatPrice(animal.price * 0.5)})
                </span>
              )}
            </div>
          </div>

          <Link
            to={`/animals/${animal.id}`}
            className={`inline-flex items-center gap-0.5 sm:gap-1 px-1.5 py-1 sm:px-2.5 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-semibold transition-all ${
              animal.status === 'sold'
                ? isDark
                  ? 'bg-[#1B1208] text-[#D8C5A8]/50 border border-[#4A2C16]'
                  : 'bg-[#E4D4BC] text-[#746556]/60 border border-[#E4D4BC]'
                : isDark
                  ? 'bg-[#C58A3A] hover:bg-[#E0B15A] text-[#1B1208]'
                  : 'bg-[#B8792F] hover:bg-[#9E6523] text-[#FAF7F0]'
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
