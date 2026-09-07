import React, { useState } from 'react';
import { AnimalFilterOptions, SortOption } from '../../types/animal';
import { Search, SlidersHorizontal, RotateCcw, X, ChevronDown, Filter } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

interface AnimalFiltersProps {
  filters: AnimalFilterOptions;
  availableBreeds: string[];
  onUpdateFilter: <K extends keyof AnimalFilterOptions>(key: K, value: AnimalFilterOptions[K]) => void;
  onResetFilters: () => void;
  isFiltered: boolean;
  totalCount: number;
  filteredCount: number;
  animalTypeTitle: string; // "Sheep", "Goats", or "Cows"
}

export const AnimalFilters: React.FC<AnimalFiltersProps> = ({
  filters,
  availableBreeds,
  onUpdateFilter,
  onResetFilters,
  isFiltered,
  totalCount,
  filteredCount,
  animalTypeTitle
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme } = useTheme();
  const { t, isAmharic } = useLanguage();
  const isDark = theme === 'design7';

  const filterContent = (
    <div className="space-y-4">
      {/* Sidebar Title & Reset */}
      <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: isDark ? '#4A2C16' : '#E4D4BC' }}>
        <div className="flex items-center gap-2 font-serif font-bold text-sm sm:text-base">
          <Filter className="w-4 h-4 text-amber-500" />
          <span>{isAmharic ? `${animalTypeTitle} ማጣሪያ` : `Filter ${animalTypeTitle}`}</span>
        </div>

        {isFiltered && (
          <button
            onClick={onResetFilters}
            type="button"
            className={`inline-flex items-center gap-1 text-xs font-semibold hover:underline ${
              isDark ? 'text-[#E0B15A]' : 'text-[#B8792F]'
            }`}
          >
            <RotateCcw className="w-3 h-3" />
            <span>{t.common.reset}</span>
          </button>
        )}
      </div>

      {/* 1. Search Bar */}
      <div>
        <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1 opacity-80">
          {t.common.search}
        </label>
        <div className="relative">
          <Search
            className={`absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 ${
              isDark ? 'text-[#D8C5A8]/60' : 'text-[#746556]/60'
            }`}
          />
          <input
            type="text"
            placeholder={isAmharic ? 'ዝርያ፣ መለያ ቁጥር፣ ቀለም...' : 'Breed, ID, color...'}
            value={filters.searchQuery}
            onChange={(e) => onUpdateFilter('searchQuery', e.target.value)}
            className={`w-full pl-8 pr-7 py-2 rounded-lg text-xs border transition-all focus:outline-none focus:ring-2 ${
              isDark
                ? 'bg-[#1B1208] border-[#4A2C16] text-[#F4E8D0] placeholder-[#D8C5A8]/40 focus:ring-[#C58A3A]'
                : 'bg-[#FAF7F0] border-[#E4D4BC] text-[#2A1A0D] placeholder-[#746556]/40 focus:ring-[#B8792F]'
            }`}
          />
          {filters.searchQuery && (
            <button
              onClick={() => onUpdateFilter('searchQuery', '')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Sort Dropdown */}
      <div>
        <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1 opacity-80">
          {t.common.sortBy}
        </label>
        <div className="relative">
          <select
            value={filters.sortBy}
            onChange={(e) => onUpdateFilter('sortBy', e.target.value as SortOption)}
            className={`w-full px-3 py-2 rounded-lg text-xs border appearance-none pr-8 font-medium cursor-pointer focus:outline-none focus:ring-2 ${
              isDark
                ? 'bg-[#1B1208] border-[#4A2C16] text-[#F4E8D0] focus:ring-[#C58A3A]'
                : 'bg-[#FAF7F0] border-[#E4D4BC] text-[#2A1A0D] focus:ring-[#B8792F]'
            }`}
          >
            <option value="newest">{t.common.newestListed}</option>
            <option value="price-asc">{t.common.priceLowHigh}</option>
            <option value="price-desc">{t.common.priceHighLow}</option>
            <option value="weight-asc">{t.common.weightLightHeavy}</option>
            <option value="weight-desc">{t.common.weightHeavyLight}</option>
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none opacity-60" />
        </div>
      </div>

      {/* 3. Breed Filter */}
      <div>
        <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1 opacity-80">
          {t.common.breed}
        </label>
        <div className="relative">
          <select
            value={filters.breed}
            onChange={(e) => onUpdateFilter('breed', e.target.value)}
            className={`w-full px-3 py-2 rounded-lg text-xs border appearance-none pr-8 font-medium cursor-pointer focus:outline-none focus:ring-2 ${
              isDark
                ? 'bg-[#1B1208] border-[#4A2C16] text-[#F4E8D0] focus:ring-[#C58A3A]'
                : 'bg-[#FAF7F0] border-[#E4D4BC] text-[#2A1A0D] focus:ring-[#B8792F]'
            }`}
          >
            <option value="all">{t.common.allBreeds}</option>
            {availableBreeds.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none opacity-60" />
        </div>
      </div>

      {/* 4. Gender Filter */}
      <div>
        <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1 opacity-80">
          {t.common.gender}
        </label>
        <div className="grid grid-cols-3 gap-1.5">
          {[
            { id: 'all', label: t.common.all },
            { id: 'Male', label: t.common.male },
            { id: 'Female', label: t.common.female }
          ].map((genderOption) => {
            const isSelected = filters.gender === genderOption.id;
            return (
              <button
                key={genderOption.id}
                type="button"
                onClick={() => onUpdateFilter('gender', genderOption.id)}
                className={`py-1.5 rounded-lg text-xs font-semibold border transition-all truncate px-1 ${
                  isSelected
                    ? isDark
                      ? 'bg-[#C58A3A] text-[#1B1208] border-[#C58A3A]'
                      : 'bg-[#B8792F] text-[#FAF7F0] border-[#B8792F]'
                    : isDark
                      ? 'bg-[#1B1208] border-[#4A2C16] text-[#D8C5A8] hover:border-[#C58A3A]/60'
                      : 'bg-[#FAF7F0] border-[#E4D4BC] text-[#746556] hover:border-[#B8792F]/60'
                }`}
              >
                {genderOption.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. Availability Status Filter */}
      <div>
        <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1 opacity-80">
          {t.common.status}
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {[
            { id: 'all', label: t.common.all },
            { id: 'available', label: t.common.available },
            { id: 'reserved', label: t.common.reserved },
            { id: 'sold', label: t.common.sold }
          ].map((statusOpt) => {
            const isSelected = filters.status === statusOpt.id;
            return (
              <button
                key={statusOpt.id}
                type="button"
                onClick={() => onUpdateFilter('status', statusOpt.id)}
                className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all text-center truncate ${
                  isSelected
                    ? isDark
                      ? 'bg-[#C58A3A] text-[#1B1208] border-[#C58A3A]'
                      : 'bg-[#B8792F] text-[#FAF7F0] border-[#B8792F]'
                    : isDark
                      ? 'bg-[#1B1208] border-[#4A2C16] text-[#D8C5A8] hover:border-[#C58A3A]/60'
                      : 'bg-[#FAF7F0] border-[#E4D4BC] text-[#746556] hover:border-[#B8792F]/60'
                }`}
              >
                {statusOpt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 6. Price Range (Min & Max in ETB) */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-[11px] font-semibold uppercase tracking-wider opacity-80">
            {t.common.priceRange}
          </label>
          {(filters.minPrice !== null || filters.maxPrice !== null) && (
            <button
              type="button"
              onClick={() => {
                onUpdateFilter('minPrice', null);
                onUpdateFilter('maxPrice', null);
              }}
              className="text-[10px] opacity-60 hover:opacity-100 hover:underline"
            >
              {t.common.clearFilters}
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min ETB"
            min="0"
            step="1000"
            value={filters.minPrice ?? ''}
            onChange={(e) =>
              onUpdateFilter('minPrice', e.target.value ? Number(e.target.value) : null)
            }
            className={`w-1/2 px-2.5 py-1.5 rounded-lg text-xs border focus:outline-none focus:ring-1 ${
              isDark
                ? 'bg-[#1B1208] border-[#4A2C16] text-[#F4E8D0] placeholder-[#D8C5A8]/40 focus:ring-[#C58A3A]'
                : 'bg-[#FAF7F0] border-[#E4D4BC] text-[#2A1A0D] placeholder-[#746556]/40 focus:ring-[#B8792F]'
            }`}
          />
          <span className="opacity-40 text-xs">-</span>
          <input
            type="number"
            placeholder="Max ETB"
            min="0"
            step="1000"
            value={filters.maxPrice ?? ''}
            onChange={(e) =>
              onUpdateFilter('maxPrice', e.target.value ? Number(e.target.value) : null)
            }
            className={`w-1/2 px-2.5 py-1.5 rounded-lg text-xs border focus:outline-none focus:ring-1 ${
              isDark
                ? 'bg-[#1B1208] border-[#4A2C16] text-[#F4E8D0] placeholder-[#D8C5A8]/40 focus:ring-[#C58A3A]'
                : 'bg-[#FAF7F0] border-[#E4D4BC] text-[#2A1A0D] placeholder-[#746556]/40 focus:ring-[#B8792F]'
            }`}
          />
        </div>
      </div>

      {/* 7. Weight Range (Min & Max in kg) */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-[11px] font-semibold uppercase tracking-wider opacity-80">
            {t.common.weightRange}
          </label>
          {(filters.minWeight !== null || filters.maxWeight !== null) && (
            <button
              type="button"
              onClick={() => {
                onUpdateFilter('minWeight', null);
                onUpdateFilter('maxWeight', null);
              }}
              className="text-[10px] opacity-60 hover:opacity-100 hover:underline"
            >
              {t.common.clearFilters}
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min kg"
            min="0"
            value={filters.minWeight ?? ''}
            onChange={(e) =>
              onUpdateFilter('minWeight', e.target.value ? Number(e.target.value) : null)
            }
            className={`w-1/2 px-2.5 py-1.5 rounded-lg text-xs border focus:outline-none focus:ring-1 ${
              isDark
                ? 'bg-[#1B1208] border-[#4A2C16] text-[#F4E8D0] placeholder-[#D8C5A8]/40 focus:ring-[#C58A3A]'
                : 'bg-[#FAF7F0] border-[#E4D4BC] text-[#2A1A0D] placeholder-[#746556]/40 focus:ring-[#B8792F]'
            }`}
          />
          <span className="opacity-40 text-xs">-</span>
          <input
            type="number"
            placeholder="Max kg"
            min="0"
            value={filters.maxWeight ?? ''}
            onChange={(e) =>
              onUpdateFilter('maxWeight', e.target.value ? Number(e.target.value) : null)
            }
            className={`w-1/2 px-2.5 py-1.5 rounded-lg text-xs border focus:outline-none focus:ring-1 ${
              isDark
                ? 'bg-[#1B1208] border-[#4A2C16] text-[#F4E8D0] placeholder-[#D8C5A8]/40 focus:ring-[#C58A3A]'
                : 'bg-[#FAF7F0] border-[#E4D4BC] text-[#2A1A0D] placeholder-[#746556]/40 focus:ring-[#B8792F]'
            }`}
          />
        </div>
      </div>

      {/* Results summary in sidebar */}
      <div className="pt-3 border-t text-[11px] flex items-center justify-between opacity-80" style={{ borderColor: isDark ? '#4A2C16' : '#E4D4BC' }}>
        <span>{t.common.matches}:</span>
        <strong className={isDark ? 'text-[#E0B15A]' : 'text-[#B8792F]'}>
          {filteredCount} / {totalCount}
        </strong>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Filter Trigger Button (visible only on small screens) */}
      <div className="lg:hidden mb-4 flex items-center justify-between gap-3">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          type="button"
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold border transition-colors ${
            isFiltered
              ? isDark ? 'bg-[#C58A3A] text-[#1B1208] border-[#C58A3A]' : 'bg-[#B8792F] text-[#FAF7F0] border-[#B8792F]'
              : isDark ? 'bg-[#2A1A0D] border-[#4A2C16] text-[#F4E8D0]' : 'bg-[#F1E8D8] border-[#E4D4BC] text-[#241A12]'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>{mobileOpen ? t.common.hideFilters : t.common.filterAndSort}</span>
          {isFiltered && <span className="w-2 h-2 rounded-full bg-amber-400" />}
        </button>

        {isFiltered && (
          <button
            onClick={onResetFilters}
            type="button"
            className={`py-2.5 px-3 rounded-xl text-xs font-semibold border ${
              isDark ? 'bg-[#2A1A0D] border-[#4A2C16] text-[#E0B15A]' : 'bg-[#F1E8D8] border-[#E4D4BC] text-[#B8792F]'
            }`}
          >
            {t.common.reset}
          </button>
        )}
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div
          className={`lg:hidden mb-6 p-5 rounded-xl border shadow-xs animate-in slide-in-from-top-2 duration-150 ${
            isDark ? 'bg-[#2A1A0D] border-[#4A2C16]' : 'bg-[#F1E8D8] border-[#E4D4BC]'
          }`}
        >
          {filterContent}
        </div>
      )}

      {/* Desktop Sticky Left Sidebar Panel */}
      <aside className="hidden lg:block w-full">
        <div
          className={`sticky top-24 rounded-xl border p-5 transition-colors shadow-xs ${
            isDark ? 'bg-[#2A1A0D] border-[#4A2C16]' : 'bg-[#F1E8D8] border-[#E4D4BC]'
          }`}
        >
          {filterContent}
        </div>
      </aside>
    </>
  );
};
