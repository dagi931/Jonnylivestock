import React from 'react';
import { PackageCatalogItem, PackageCategory } from '../../types/package';
import {
  formatPrice,
  getItemDisplayName,
  getItemDisplayDescription,
  getItemDisplayUnit
} from '../../utils/formatters';
import { AnimatedReveal } from '../common/AnimatedReveal';
import {
  Gift,
  Plus,
  Check,
  Trash2,
  BookmarkPlus,
  CheckCircle2,
  AlertTriangle,
  Wine,
  Egg,
  Flower2,
  Beef
} from 'lucide-react';
import { isLivestockCoreAnimal } from '../../utils/packageValidators';

interface CustomPackageBuilderTabProps {
  catalog: PackageCatalogItem[];
  selectedItems: PackageCatalogItem[];
  setSelectedItems: (items: PackageCatalogItem[]) => void;
  packageName: string;
  setPackageName: (name: string) => void;
  activeCategoryFilter: PackageCategory | 'all';
  setActiveCategoryFilter: (cat: PackageCategory | 'all') => void;
  toggleItem: (item: PackageCatalogItem) => void;
  handleOrderCustom: () => void;
  handleSaveToMyPackages: () => void;
  isEligible: boolean;
  hasLivestock: boolean;
  categoryCount: number;
  selectedCategories: Set<PackageCategory>;
  totalPrice: number;
  saveSuccessMsg: string | null;
  touchedCardId: string | null;
  handleTouchCard: (id: string) => void;
  isDark: boolean;
  isAmharic: boolean;
  getOptimizedUnsplashUrl: (url: string, width?: number, height?: number) => string;
  buildThumbnailSrcSet: (url: string) => string | undefined;
}

export const CustomPackageBuilderTab: React.FC<CustomPackageBuilderTabProps> = ({
  catalog,
  selectedItems,
  setSelectedItems,
  packageName,
  setPackageName,
  activeCategoryFilter,
  setActiveCategoryFilter,
  toggleItem,
  handleOrderCustom,
  handleSaveToMyPackages,
  isEligible,
  hasLivestock,
  categoryCount,
  selectedCategories,
  totalPrice,
  saveSuccessMsg,
  touchedCardId,
  handleTouchCard,
  isDark,
  isAmharic,
  getOptimizedUnsplashUrl,
  buildThumbnailSrcSet
}) => {
  const categories: { id: PackageCategory; name: string; amharicName: string; icon: any; color: string }[] = [
    { id: 'meat_livestock', name: 'Livestock & Prime Meat', amharicName: 'የቀንድ ከብትና ልዩ ሥጋ', icon: Beef, color: 'text-amber-500' },
    { id: 'wine', name: 'Wines, Whiskies & Tej', amharicName: 'ወይኖች፣ ዊስኪና ማር ጠጅ', icon: Wine, color: 'text-amber-500' },
    { id: 'eggs', name: 'Fresh Organic Eggs', amharicName: 'ትኩስ የጓሮ እንቁላል', icon: Egg, color: 'text-amber-500' },
    { id: 'flowers', name: 'Celebration Flowers', amharicName: 'የበዓል አበቦች', icon: Flower2, color: 'text-amber-500' }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
      {/* Left 8 Cols: Item Catalog Selector */}
      <div className="lg:col-span-8 space-y-5">
        {/* Category Filters */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActiveCategoryFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeCategoryFilter === 'all'
                ? 'bg-amber-500 text-black shadow-xs'
                : isDark
                ? 'bg-[#24170D] border border-[#4A2C16] text-[#F4E8D0] opacity-75 hover:opacity-100'
                : 'bg-white border border-[#E4D4BC] text-[#241A12] opacity-75 hover:opacity-100'
            }`}
          >
            {isAmharic ? 'ሁሉም እቃዎች' : 'All Items'}
          </button>
          {categories.map(cat => {
            const Icon = cat.icon;
            const isCatSelected = selectedCategories.has(cat.id);
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategoryFilter(cat.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeCategoryFilter === cat.id
                    ? 'bg-amber-500 text-black shadow-xs'
                    : isDark
                    ? 'bg-[#24170D] border border-[#4A2C16] text-[#F4E8D0]'
                    : 'bg-white border border-[#E4D4BC] text-[#241A12]'
                }`}
              >
                <Icon size={14} className={`w-3.5 h-3.5 ${activeCategoryFilter === cat.id ? 'text-black' : cat.color}`} />
                <span>{isAmharic ? cat.amharicName : cat.name}</span>
                {isCatSelected && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                )}
              </button>
            );
          })}
        </div>

        {/* Items Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {catalog
            .filter(item => activeCategoryFilter === 'all' || item.category === activeCategoryFilter)
            .map((item, idx) => {
              const isSelected = selectedItems.some(i => i.id === item.id);
              return (
                <AnimatedReveal key={item.id} direction="up" delay={Math.min(idx * 40, 300)} className="h-full">
                  <div
                    onClick={() => toggleItem(item)}
                    onTouchStart={() => handleTouchCard(item.id)}
                    onTouchEnd={() => handleTouchCard(item.id)}
                    className={`h-full group p-3.5 rounded-2xl border cursor-pointer transition-all duration-150 flex gap-3 select-none ${
                      isSelected
                        ? isDark
                          ? 'bg-amber-500/10 border-amber-500 shadow-sm'
                          : 'bg-amber-50 border-amber-500 shadow-sm'
                        : isDark
                        ? 'bg-[#24170D] border-[#4A2C16] hover:border-amber-500/40'
                        : 'bg-white border-[#E4D4BC] hover:border-amber-500/40'
                    }`}
                  >
                    <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-black/5">
                      <img
                        src={getOptimizedUnsplashUrl(item.image, 96, 96)}
                        srcSet={buildThumbnailSrcSet(item.image)}
                        sizes="64px"
                        width={64}
                        height={64}
                        alt={item.name}
                        loading="lazy"
                        decoding="async"
                        className={`w-full h-full object-cover card-zoom-img transition-transform duration-300 ${
                          touchedCardId === item.id ? 'scale-100' : 'scale-105'
                        } group-hover:scale-100`}
                      />
                    </div>
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        <div className="flex items-start justify-between gap-1">
                          <div className="min-w-0 flex-1">
                            <h4 className="font-bold text-xs sm:text-sm truncate">
                              {getItemDisplayName(item, isAmharic)}
                            </h4>
                            {isLivestockCoreAnimal(item) && (
                              <span className="inline-block mt-0.5 px-1.5 py-0.5 rounded text-[9.5px] font-semibold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25">
                                {isAmharic ? '★ የቀንድ ከብት / በግ / ፍየል' : '★ Core Livestock'}
                              </span>
                            )}
                          </div>
                          <button
                            type="button"
                            className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-colors ${
                              isSelected
                                ? 'bg-amber-500 text-black'
                                : 'bg-black/10 dark:bg-white/10 opacity-60'
                            }`}
                          >
                            {isSelected ? <Check size={12} className="w-3 h-3 stroke-[3]" /> : <Plus size={12} className="w-3 h-3" />}
                          </button>
                        </div>
                        <p className="text-[10.5px] opacity-70 line-clamp-1 mt-0.5">
                          {getItemDisplayDescription(item, isAmharic)}
                        </p>
                      </div>
                      <div className="flex items-center justify-between mt-1.5 pt-1 border-t border-black/5 dark:border-white/5">
                        <span className="font-serif font-bold text-xs text-amber-500">
                          {formatPrice(item.price)}
                        </span>
                        {item.unit && (
                          <span className="text-[9.5px] opacity-60 font-mono">
                            {getItemDisplayUnit(item, isAmharic)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </AnimatedReveal>
              );
            })}
        </div>
      </div>

      {/* Right 4 Cols: Sticky Custom Package Summary */}
      <div className="lg:col-span-4 sticky top-24 space-y-4">
        <div
          className={`p-5 rounded-3xl border shadow-md space-y-4 ${
            isDark ? 'bg-[#24170D] border-[#4A2C16]' : 'bg-white border-[#E4D4BC]'
          }`}
        >
          {/* Package Name Input */}
          <div>
            <label className="text-[10.5px] font-bold uppercase tracking-wider opacity-70 block mb-1">
              {isAmharic ? 'የጥቅሉ ስያሜ' : 'Custom Package Title'}
            </label>
            <input
              type="text"
              value={packageName}
              onChange={e => setPackageName(e.target.value)}
              className={`w-full px-3 py-2 rounded-xl border text-xs font-bold focus:outline-none focus:border-amber-500 ${
                isDark ? 'bg-[#1D130A] border-[#4A2C16] text-[#F4E8D0]' : 'bg-[#FAF7F0] border-[#E4D4BC] text-[#241A12]'
              }`}
            />
          </div>

          {/* Requirement 1: Mandatory Livestock (Cow/Ox or Sheep/Goat) */}
          <div className="space-y-1.5 pt-1 border-t border-black/5 dark:border-white/5">
            <div className="flex items-center justify-between text-xs font-bold">
              <div className="flex items-center gap-1.5">
                {hasLivestock ? (
                  <CheckCircle2 size={14} width={14} height={14} className="w-3.5 h-3.5 text-emerald-500 shrink-0" aria-hidden="true" />
                ) : (
                  <AlertTriangle size={14} width={14} height={14} className="w-3.5 h-3.5 text-amber-500 shrink-0" aria-hidden="true" />
                )}
                <span>{isAmharic ? 'የቀንድ ከብት / በግ ወይም ፍየል' : 'Livestock: Cow/Ox or Sheep/Goat'}</span>
              </div>
              <span className={`text-[10px] font-bold ${hasLivestock ? 'text-emerald-500' : 'text-amber-500 font-semibold'}`}>
                {hasLivestock ? (isAmharic ? '✓ ተካትቷል' : '✓ Included') : (isAmharic ? 'የግዴታ ያስፈልጋል' : 'Required')}
              </span>
            </div>
            {!hasLivestock && (
              <p className="text-[10.5px] text-amber-600 dark:text-amber-400/90 leading-tight">
                {isAmharic
                  ? 'ጥቅሉን ለማጠናቀቅ ቢያንስ አንድ ሰንጋ በሬ፣ በግ ወይም ፍየል መምረጥ አለብዎት።'
                  : 'Your custom package must include at least one Cow/Ox or Sheep/Goat.'}
              </p>
            )}
          </div>

          {/* Requirement 2: 3-Category Requirement Bar */}
          <div className="space-y-1.5 pt-1 border-t border-black/5 dark:border-white/5">
            <div className="flex items-center justify-between text-xs font-bold">
              <div className="flex items-center gap-1.5">
                {categoryCount >= 3 ? (
                  <CheckCircle2 size={14} width={14} height={14} className="w-3.5 h-3.5 text-emerald-500 shrink-0" aria-hidden="true" />
                ) : (
                  <AlertTriangle size={14} width={14} height={14} className="w-3.5 h-3.5 text-amber-500 shrink-0" aria-hidden="true" />
                )}
                <span>{isAmharic ? `የምድብ መስፈርት፡ ${categoryCount}/3` : `Categories: ${categoryCount}/3`}</span>
              </div>
              <span className={`text-[10px] font-bold ${categoryCount >= 3 ? 'text-emerald-500' : 'opacity-60'}`}>
                {categoryCount >= 3 ? (isAmharic ? '✓ ነፃ ማድረሻ' : '✓ Free Delivery') : (isAmharic ? 'ቢያንስ 3 ይምረጡ' : 'Min. 3 required')}
              </span>
            </div>

            {/* Category Checklist */}
            <div className="grid grid-cols-2 gap-1 pt-1 text-[10.5px]">
              {categories.map(cat => {
                const isCatActive = selectedCategories.has(cat.id);
                return (
                  <div
                    key={cat.id}
                    className={`flex items-center gap-1 ${
                      isCatActive ? 'text-emerald-500 font-bold' : 'opacity-50'
                    }`}
                  >
                    <span>{isCatActive ? '✓' : '○'}</span>
                    <span className="truncate">{isAmharic ? cat.amharicName.split(' ')[0] : cat.name.split(' ')[0]}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Items List */}
          <div className="space-y-1.5 pt-1 border-t border-black/5 dark:border-white/5">
            <div className="text-[10px] font-bold uppercase tracking-wider opacity-60 flex justify-between">
              <span>{isAmharic ? `የተመረጡ እቃዎች (${selectedItems.length})` : `Selected Items (${selectedItems.length})`}</span>
              {selectedItems.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedItems([])}
                  className="text-[9.5px] text-red-400 hover:underline cursor-pointer"
                >
                  {isAmharic ? 'ሁሉንም አጽዳ' : 'Clear all'}
                </button>
              )}
            </div>

            {selectedItems.length === 0 ? (
              <div className="py-4 text-center text-xs opacity-50">
                {isAmharic ? 'እቃዎችን ለመምረጥ በግራ በኩል ይጫኑ' : 'Click items on the left to add them'}
              </div>
            ) : (
              <div className={`divide-y max-h-44 overflow-y-auto pr-1 text-xs ${
                isDark ? 'divide-[#4A2C16]/50' : 'divide-[#E4D4BC]/60'
              }`}>
                {selectedItems.map(item => (
                  <div
                    key={item.id}
                    className="py-1.5 flex items-center justify-between gap-2"
                  >
                    <span className="truncate font-medium opacity-90">
                      {getItemDisplayName(item, isAmharic)}
                    </span>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-mono font-bold text-amber-500 text-[11px]">{formatPrice(item.price)}</span>
                      <button
                        type="button"
                        onClick={() => toggleItem(item)}
                        className="text-stone-400 hover:text-red-400 cursor-pointer p-0.5"
                      >
                        <Trash2 size={12} width={12} height={12} className="w-3 h-3" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Price Summary */}
          <div className="pt-2 border-t border-black/10 dark:border-white/10 space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="opacity-70">{isAmharic ? 'የማድረሻ ክፍያ፡' : 'Delivery:'}</span>
              <span className={isEligible ? 'text-emerald-500 font-bold' : 'opacity-70'}>
                {isEligible ? (isAmharic ? 'ነፃ' : 'FREE') : (isAmharic ? 'መስፈርቶች ያስፈልጋሉ' : 'Requirements pending')}
              </span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="font-bold text-xs">{isAmharic ? 'ጠቅላላ ዋጋ፡' : 'Total Price:'}</span>
              <span className="font-serif font-bold text-xl text-amber-500">{formatPrice(totalPrice)}</span>
            </div>
            {isEligible && (
              <div className="flex justify-between text-[11px] text-emerald-500 font-medium">
                <span>{isAmharic ? '50% ቅድመ ክፍያ፡' : '50% Deposit:'}</span>
                <span className="font-bold font-mono">{formatPrice(totalPrice * 0.5)}</span>
              </div>
            )}
          </div>

          {saveSuccessMsg && (
            <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 text-xs flex items-center gap-2">
              <CheckCircle2 size={14} width={14} height={14} className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>{saveSuccessMsg}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-2 pt-1">
            <button
              type="button"
              disabled={!isEligible}
              onClick={handleOrderCustom}
              className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed text-black font-bold text-xs sm:text-sm transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <Gift size={16} width={16} height={16} className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>{isAmharic ? 'ይዘዙ / በ50% ይያዙ' : 'Proceed to Order / 50% Reserve'}</span>
            </button>

            {!isEligible && (
              <p className="text-[10.5px] text-center text-stone-500 dark:text-stone-400">
                {!hasLivestock
                  ? (isAmharic ? '⚠️ የበሬ/ሰንጋ ወይም የበግ/ፍየል መምረጥ ያስፈልጋል' : '⚠️ Must include Cow/Ox or Sheep/Goat')
                  : (isAmharic ? `⚠️ ተጨማሪ ${3 - categoryCount} ምድብ ይምረጡ` : `⚠️ Select ${3 - categoryCount} more categories`)}
              </p>
            )}

            <button
              type="button"
              disabled={!isEligible}
              onClick={handleSaveToMyPackages}
              className={`w-full py-2 rounded-2xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                !isEligible
                  ? 'opacity-30 cursor-not-allowed'
                  : isDark
                  ? 'border-[#4A2C16] hover:bg-[#2A1A0D] text-amber-400'
                  : 'border-[#E4D4BC] hover:bg-[#FAF7F0] text-amber-800'
              }`}
            >
              <BookmarkPlus size={14} width={14} height={14} className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>{isAmharic ? 'ወደ መለያዬ አስቀምጥ' : 'Save to My Packages'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default CustomPackageBuilderTab;
