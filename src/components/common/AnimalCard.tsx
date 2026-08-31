import React from 'react';
import { Link } from 'react-router-dom';
import { Animal } from '../../types/animal';
import { StatusBadge } from './StatusBadge';
import { formatPrice, formatWeight } from '../../utils/formatters';
import { MapPin, Scale, ArrowRight, Video } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

interface AnimalCardProps {
  animal: Animal;
}

export const AnimalCard: React.FC<AnimalCardProps> = ({ animal }) => {
  const { theme } = useTheme();
  const { t, isAmharic } = useLanguage();
  const isDark = theme === 'design7';

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
      className={`group relative rounded-2xl border transition-all duration-200 flex flex-col overflow-hidden hover:-translate-y-1 ${
        isDark
          ? 'bg-[#2A1A0D] border-[#4A2C16] hover:border-[#C58A3A]/70 shadow-sm hover:shadow-lg'
          : 'bg-[#F1E8D8] border-[#E4D4BC] hover:border-[#B8792F]/70 shadow-sm hover:shadow-md'
      }`}
    >
      {/* Compact Image Container */}
      <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full overflow-hidden bg-stone-900">
        <img
          src={animal.images[0]}
          alt={`${animal.breed} ${animal.type} ${animal.id}`}
          loading="lazy"
          className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
        />

        {/* Subtle Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

        {/* Top Badges: Animal ID & Status */}
        <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between gap-1.5">
          <span className="px-2 py-0.5 rounded-md text-[11px] font-mono font-bold tracking-wider uppercase bg-black/70 text-[#FAF7F0] backdrop-blur-sm border border-white/10 shadow-xs">
            {animal.id}
          </span>
          <StatusBadge status={animal.status} size="sm" />
        </div>

        {/* Video Indicator */}
        {animal.video && (
          <div className="absolute bottom-2 left-2 flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-black/70 text-[#E0B15A] text-[10px] font-medium backdrop-blur-sm border border-white/10">
            <Video className="w-3 h-3" />
            <span>{isAmharic ? 'ቪዲዮ' : 'Video'}</span>
          </div>
        )}
      </div>

      {/* Compact Card Body */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between space-y-2.5">
        <div>
          {/* Category & Breed */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <span
                className={`block text-[10px] font-bold uppercase tracking-wider ${
                  isDark ? 'text-[#C58A3A]' : 'text-[#B8792F]'
                }`}
              >
                {getTypeLabel()}
              </span>
              <h3
                className={`font-serif font-bold text-base leading-tight truncate transition-colors ${
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
              className={`px-1.5 py-0.5 rounded text-[10px] font-semibold shrink-0 ${
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
          <div className="mt-2 grid grid-cols-2 gap-1.5 text-xs">
            <div
              className={`flex items-center gap-1.5 px-2 py-1 rounded-lg ${
                isDark ? 'bg-[#1B1208]/70 text-[#D8C5A8]' : 'bg-[#FAF7F0] text-[#746556] border border-[#E4D4BC]/40'
              }`}
            >
              <Scale className={`w-3 h-3 shrink-0 ${isDark ? 'text-[#C58A3A]' : 'text-[#B8792F]'}`} />
              <span className="font-bold text-xs">
                {formatWeight(animal.weight)}
              </span>
            </div>

            <div
              className={`flex items-center gap-1.5 px-2 py-1 rounded-lg truncate ${
                isDark ? 'bg-[#1B1208]/70 text-[#D8C5A8]' : 'bg-[#FAF7F0] text-[#746556] border border-[#E4D4BC]/40'
              }`}
            >
              <MapPin className={`w-3 h-3 shrink-0 ${isDark ? 'text-[#C58A3A]' : 'text-[#B8792F]'}`} />
              <span className="truncate text-[11px] font-medium">{animal.location}</span>
            </div>
          </div>
        </div>

        {/* Card Bottom: Price & View Link */}
        <div
          className={`pt-2.5 border-t flex items-center justify-between gap-2 ${
            isDark ? 'border-[#4A2C16]' : 'border-[#E4D4BC]'
          }`}
        >
          <div>
            <span className="block text-[9px] uppercase tracking-wider font-semibold opacity-70 leading-tight">
              {t.common.farmPrice}
            </span>
            <span
              className={`text-sm sm:text-base font-bold font-serif ${
                isDark ? 'text-[#E0B15A]' : 'text-[#B8792F]'
              }`}
            >
              {formatPrice(animal.price)}
            </span>
          </div>

          <Link
            to={`/animals/${animal.id}`}
            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
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
            <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};
