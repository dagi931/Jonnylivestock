import React, { useMemo } from 'react';
import { useAnimals } from '../hooks/useAnimals';
import { useAnimalFilters } from '../hooks/useAnimalFilters';
import { AnimalFilters } from '../components/animals/AnimalFilters';
import { AnimalGrid } from '../components/animals/AnimalGrid';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export const Sheep: React.FC = () => {
  const { theme } = useTheme();
  const { t, isAmharic } = useLanguage();
  const isDark = theme === 'design7';

  const { animals: allSheep, breeds: availableBreeds } = useAnimals('sheep');

  const {
    filters,
    updateFilter,
    resetFilters,
    isFiltered,
    filteredAnimals,
    totalCount,
    filteredCount
  } = useAnimalFilters(allSheep);

  return (
    <div className="min-h-screen py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs mb-3 opacity-70">
          <Link to="/" className="hover:underline">{t.nav.home}</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="font-semibold">{t.nav.sheep}</span>
        </nav>

        {/* Page Title & Intro */}
        <div className="mb-6">
          <h1
            className={`font-serif font-bold text-2xl sm:text-3xl lg:text-4xl ${
              isDark ? 'text-[#F4E8D0]' : 'text-[#241A12]'
            }`}
          >
            {isAmharic ? 'የሚገኙ በጎች' : 'Available Sheep'}
          </h1>
          <p
            className={`mt-1 text-xs sm:text-sm max-w-2xl ${
              isDark ? 'text-[#D8C5A8]' : 'text-[#746556]'
            }`}
          >
            {isAmharic
              ? 'የሆሮ፣ የመንዝ፣ የቦንጋ፣ የዋሸራና የሶማሊ ዝርያ በጎችን ይመልከቱ። ሁሉም እንስሳት በትክክለኛ ሚዛን የተመዘኑና የቀጥታ እርሻ ዋጋ ያላቸው ናቸው።'
              : 'Browse our current flock of Horro, Menz, Bonga, Washera, and Somali sheep. All animals are weighed accurately with transparent direct pricing.'}
          </p>
        </div>

        {/* 2-Column Layout: Left Sidebar Filters + Right Animal Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* Left Column: Filters Sidebar */}
          <div className="lg:col-span-4 xl:col-span-3">
            <AnimalFilters
              filters={filters}
              availableBreeds={availableBreeds}
              onUpdateFilter={updateFilter}
              onResetFilters={resetFilters}
              isFiltered={isFiltered}
              totalCount={totalCount}
              filteredCount={filteredCount}
              animalTypeTitle={isAmharic ? 'በጎች' : 'Sheep'}
            />
          </div>

          {/* Right Column: Animal Grid */}
          <div className="lg:col-span-8 xl:col-span-9">
            {/* Top Bar Summary */}
            <div className="flex items-center justify-between mb-4 text-xs">
              <span className="opacity-70">
                {isAmharic ? 'የሚታዩት' : 'Showing'} <strong className={isDark ? 'text-[#E0B15A]' : 'text-[#B8792F]'}>{filteredCount}</strong> / {totalCount} {isAmharic ? 'በጎች' : 'sheep'}
              </span>
              {isFiltered && (
                <button
                  onClick={resetFilters}
                  className={`hover:underline font-semibold ${
                    isDark ? 'text-[#E0B15A]' : 'text-[#B8792F]'
                  }`}
                >
                  {t.common.clearFilters}
                </button>
              )}
            </div>

            {/* Responsive Grid */}
            <AnimalGrid
              animals={filteredAnimals}
              onResetFilters={resetFilters}
              emptyTitle={isAmharic ? 'ምንም አይነት የተገኘ በግ የለም' : 'No sheep match your criteria'}
              emptySubtitle={isAmharic ? 'እባክዎ ማጣሪያዎችን ያጽዱ ወይም የዋጋና የክብደት ክልሎችን ያስተካክሉ።' : 'Try resetting your filters or adjusting your price/weight ranges.'}
            />
          </div>

        </div>

      </div>
    </div>
  );
};
