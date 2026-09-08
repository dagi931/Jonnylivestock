import React, { useState } from 'react';
import { Animal } from '../../types/animal';
import { AnimalCard } from '../common/AnimalCard';
import { SkeletonCard } from '../common/SkeletonCard';
import { SearchX, RotateCcw } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

interface AnimalGridProps {
  animals: Animal[];
  isLoading?: boolean;
  onResetFilters?: () => void;
  emptyTitle?: string;
  emptySubtitle?: string;
}

export const AnimalGrid: React.FC<AnimalGridProps> = ({
  animals,
  isLoading = false,
  onResetFilters,
  emptyTitle = "No animals match your search",
  emptySubtitle = "Try adjusting or clearing your filters to see available animals."
}) => {
  const { theme } = useTheme();
  const { isAmharic } = useLanguage();
  const isDark = theme === 'design7';
  const [expandedAnimalId, setExpandedAnimalId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col items-center justify-center py-8 text-center animate-in fade-in duration-200">
          <div className="w-8 h-8 rounded-full border-2 border-amber-500 border-t-transparent animate-spin mb-2.5" />
          <p className="text-xs font-semibold text-amber-500">
            {isAmharic ? 'በመጫን ላይ...' : 'Loading...'}
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <SkeletonCard key={n} />
          ))}
        </div>
      </div>
    );
  }

  if (animals.length === 0) {
    return (
      <div
        className={`rounded-3xl border p-8 sm:p-12 text-center my-4 flex flex-col items-center justify-center max-w-xl mx-auto transition-colors ${
          isDark
            ? 'bg-[#2A1A0D] border-[#4A2C16] text-[#D8C5A8]'
            : 'bg-[#F1E8D8] border-[#E4D4BC] text-[#746556]'
        }`}
      >
        <div
          className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 ${
            isDark ? 'bg-[#1B1208] text-[#C58A3A] border border-[#4A2C16]' : 'bg-[#FAF7F0] text-[#B8792F] border border-[#E4D4BC]'
          }`}
        >
          <SearchX className="w-7 h-7" />
        </div>
        <h3
          className={`font-serif font-bold text-lg sm:text-xl mb-1.5 ${
            isDark ? 'text-[#F4E8D0]' : 'text-[#241A12]'
          }`}
        >
          {emptyTitle}
        </h3>
        <p className="text-xs sm:text-sm max-w-md mx-auto mb-5 opacity-80">
          {emptySubtitle}
        </p>

        {onResetFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm ${
              isDark
                ? 'bg-[#C58A3A] hover:bg-[#E0B15A] text-[#1B1208]'
                : 'bg-[#B8792F] hover:bg-[#9E6523] text-[#FAF7F0]'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All Filters</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-2 sm:gap-5 items-start">
      {animals.map((animal, idx) => (
        <AnimalCard
          key={animal.id}
          animal={animal}
          animationIndex={idx}
          eager={idx < 4}
          isExpanded={expandedAnimalId === animal.id}
          onToggleExpand={() => setExpandedAnimalId((prev) => (prev === animal.id ? null : animal.id))}
        />
      ))}
    </div>
  );
};
