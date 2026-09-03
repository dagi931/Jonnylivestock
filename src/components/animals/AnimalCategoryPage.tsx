import React from 'react';
import { useAnimals } from '../../hooks/useAnimals';
import { useAnimalFilters } from '../../hooks/useAnimalFilters';
import { AnimalFilters } from './AnimalFilters';
import { AnimalGrid } from './AnimalGrid';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { AnimalType } from '../../types/animal';
import { AnimatedReveal } from '../common/AnimatedReveal';

export interface AnimalCategoryPageProps {
  type: AnimalType;
  breadcrumbLabel: string;
  title: {
    en: string;
    am: string;
  };
  description: {
    en: string;
    am: string;
  };
  typeLabel: {
    en: string;
    am: string;
  };
  emptyTitle: {
    en: string;
    am: string;
  };
  emptySubtitle: {
    en: string;
    am: string;
  };
}

export const AnimalCategoryPage: React.FC<AnimalCategoryPageProps> = ({
  type,
  breadcrumbLabel,
  title,
  description,
  typeLabel,
  emptyTitle,
  emptySubtitle
}) => {
  const { theme } = useTheme();
  const { t, isAmharic } = useLanguage();
  const isDark = theme === 'design7';

  const { animals: allAnimals, breeds: availableBreeds } = useAnimals(type);

  const {
    filters,
    updateFilter,
    resetFilters,
    isFiltered,
    filteredAnimals,
    totalCount,
    filteredCount
  } = useAnimalFilters(allAnimals);

  return (
    <div className="min-h-screen py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs & Page Title */}
        <AnimatedReveal direction="up" delay={50}>
          <nav className="flex items-center gap-2 text-xs mb-3 opacity-70">
            <Link to="/" className="hover:underline">{t.nav.home}</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="font-semibold">{breadcrumbLabel}</span>
          </nav>

          <div className="mb-6">
            <h1
              className={`font-serif font-bold text-2xl sm:text-3xl lg:text-4xl ${
                isDark ? 'text-[#F4E8D0]' : 'text-[#241A12]'
              }`}
            >
              {isAmharic ? title.am : title.en}
            </h1>
            <p
              className={`mt-1 text-xs sm:text-sm max-w-2xl ${
                isDark ? 'text-[#D8C5A8]' : 'text-[#746556]'
              }`}
            >
              {isAmharic ? description.am : description.en}
            </p>
          </div>
        </AnimatedReveal>

        {/* 2-Column Layout: Left Sidebar Filters + Right Animal Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Left Column: Filters Sidebar */}
          <div className="lg:col-span-4 xl:col-span-3">
            <AnimatedReveal direction="up" delay={100}>
              <AnimalFilters
                filters={filters}
                availableBreeds={availableBreeds}
                onUpdateFilter={updateFilter}
                onResetFilters={resetFilters}
                isFiltered={isFiltered}
                totalCount={totalCount}
                filteredCount={filteredCount}
                animalTypeTitle={isAmharic ? typeLabel.am : typeLabel.en}
              />
            </AnimatedReveal>
          </div>

          {/* Right Column: Animal Grid */}
          <div className="lg:col-span-8 xl:col-span-9">
            {/* Top Bar Summary */}
            <AnimatedReveal direction="up" delay={120}>
              <div className="flex items-center justify-between mb-4 text-xs">
                <span className="opacity-70">
                  {isAmharic ? 'የሚታዩት' : 'Showing'} <strong className={isDark ? 'text-[#E0B15A]' : 'text-[#B8792F]'}>{filteredCount}</strong> / {totalCount} {isAmharic ? typeLabel.am : typeLabel.en}
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
            </AnimatedReveal>

            {/* Responsive Grid */}
            <AnimalGrid
              animals={filteredAnimals}
              onResetFilters={resetFilters}
              emptyTitle={isAmharic ? emptyTitle.am : emptyTitle.en}
              emptySubtitle={isAmharic ? emptySubtitle.am : emptySubtitle.en}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
