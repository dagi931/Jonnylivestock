import React, { useState, useEffect, useRef } from 'react';
import { PackageCatalogItem, PreMadePackage, PackageCategory } from '../types/package';
import { api } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useUserAuth } from '../context/UserAuthContext';
import {
  formatPrice,
  getItemDisplayName,
  getPackageTitle,
  getPackageDescription
} from '../utils/formatters';
import { PackageOrderModal } from '../components/modals/PackageOrderModal';
import {
  Gift,
  Sparkles,
  Truck,
  ShieldCheck,
  Plus,
  Check,
  Trash2,
  BookmarkPlus,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Wine,
  Egg,
  Flower2,
  Beef,
  ChevronDown
} from 'lucide-react';

export const PackageBuilder: React.FC = () => {
  const { theme } = useTheme();
  const { isAmharic } = useLanguage();
  const { isAuthenticated, openAuthModal } = useUserAuth();
  const isDark = theme === 'design7';

  const [activeTab, setActiveTab] = useState<'premade' | 'builder'>('premade');
  const [catalog, setCatalog] = useState<PackageCatalogItem[]>([]);
  const [preMadePackages, setPreMadePackages] = useState<PreMadePackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedPreMadeId, setExpandedPreMadeId] = useState<string | null>(null);
  const [touchedCardId, setTouchedCardId] = useState<string | null>(null);
  const touchCardTimerRef = useRef<any>(null);

  const handleTouchCard = (id: string) => {
    setTouchedCardId(id);
    if (touchCardTimerRef.current) clearTimeout(touchCardTimerRef.current);
    touchCardTimerRef.current = setTimeout(() => {
      setTouchedCardId(null);
    }, 1800);
  };

  // Builder State
  const [selectedItems, setSelectedItems] = useState<PackageCatalogItem[]>([]);
  const [packageName, setPackageName] = useState('My Custom Celebration Package');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<PackageCategory | 'all'>('all');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Order Modal State
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [selectedPreMade, setSelectedPreMade] = useState<PreMadePackage | null>(null);

  useEffect(() => {
    const fetchPackageData = async () => {
      setLoading(true);
      try {
        const data = await api.getPackagesData();
        setCatalog(data.catalog);
        setPreMadePackages(data.preMadePackages);
      } catch (err) {
        console.error('Failed to load packages data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPackageData();
  }, []);

  // Category counts
  const selectedCategories = new Set(selectedItems.map(i => i.category));
  const categoryCount = selectedCategories.size;
  const isEligible = categoryCount >= 3;
  const totalPrice = selectedItems.reduce((sum, item) => sum + item.price, 0);

  const toggleItem = (item: PackageCatalogItem) => {
    if (selectedItems.some(i => i.id === item.id)) {
      setSelectedItems(selectedItems.filter(i => i.id !== item.id));
    } else {
      setSelectedItems([...selectedItems, item]);
    }
  };

  const handleSaveToMyPackages = async () => {
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }
    if (!isEligible) return;

    try {
      const res = await api.savePackage({
        name: packageName.trim() || 'My Custom Celebration Package',
        items: selectedItems,
        totalPrice
      });
      if (res.success) {
        setSaveSuccessMsg('🎉 Package saved to your collection! View it in "My Packages".');
        setTimeout(() => setSaveSuccessMsg(null), 4000);
      }
    } catch (err) {
      console.error('Failed to save package:', err);
    }
  };

  const handleOrderPreMade = (pkg: PreMadePackage) => {
    setSelectedPreMade(pkg);
    setIsOrderModalOpen(true);
  };

  const handleOrderCustom = () => {
    if (!isEligible) return;
    setSelectedPreMade(null);
    setIsOrderModalOpen(true);
  };

  const categories: { id: PackageCategory; name: string; icon: any; color: string }[] = [
    { id: 'meat_livestock', name: 'Livestock & Prime Meat', icon: Beef, color: 'text-rose-500' },
    { id: 'wine', name: 'Wines & Traditional Tej', icon: Wine, color: 'text-purple-500' },
    { id: 'eggs', name: 'Farm Fresh Eggs', icon: Egg, color: 'text-amber-500' },
    { id: 'flowers', name: 'Celebration Flowers', icon: Flower2, color: 'text-pink-500' }
  ];

  return (
    <div className="min-h-screen pb-24">
      {/* Hero Banner */}
      <section className="relative overflow-hidden pt-8 pb-12 sm:pt-12 sm:pb-16 border-b border-black/10 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/15 border border-amber-500/30 text-amber-500">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isAmharic ? 'የበዓልና የደስታ ልዩ ጥቅሎች' : 'Holiday Hampers & Custom Packages'}</span>
            </div>

            <h1 className="font-serif font-bold text-3xl sm:text-5xl tracking-tight leading-tight">
              {isAmharic ? 'የበዓል ድግስና የስጦታ ሙሉ ጥቅል' : 'Build or Choose Your Celebration Package'}
            </h1>

            <p className="text-sm sm:text-base opacity-80 max-w-2xl mx-auto leading-relaxed">
              Combine your choice of <strong>Livestock or Prime Meat</strong>, <strong>Ethiopian Wines or Honey Tej</strong>, <strong>Farm Eggs</strong>, and <strong>Celebration Flowers</strong>.
            </p>

            {/* Benefit Badges */}
            <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-4 pt-2">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                <Truck className="w-3.5 h-3.5" /> Free Refrigerated Delivery
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-500 border border-amber-500/30">
                <ShieldCheck className="w-3.5 h-3.5" /> 50% Deposit Reservation
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/15 text-purple-400 border border-purple-500/30">
                <Gift className="w-3.5 h-3.5" /> Min. 3 Categories
              </span>
            </div>

            {/* View Switcher Tabs */}
            <div className="pt-4 flex justify-center">
              <div
                className={`p-1.5 rounded-2xl border flex items-center gap-1 shadow-sm ${
                  isDark ? 'bg-[#2A1A0D] border-[#4A2C16]' : 'bg-[#FAF7F0] border-[#E4D4BC]'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setActiveTab('premade')}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    activeTab === 'premade'
                      ? 'bg-amber-500 text-black shadow-md'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  <Gift className="w-4 h-4" />
                  <span>Curated Packages</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('builder')}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    activeTab === 'builder'
                      ? 'bg-amber-500 text-black shadow-md'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Custom Package Builder</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10">
        {loading ? (
          <div className="text-center py-20 opacity-60">Loading celebration packages...</div>
        ) : activeTab === 'premade' ? (
          /* ==================== PRE-MADE PACKAGES VIEW ==================== */
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h2 className="font-serif font-bold text-2xl">Chef & Holiday Curated Bundles</h2>
                <p className="text-xs opacity-75">Ready-to-order complete celebration sets with complimentary delivery</p>
              </div>
              <button
                onClick={() => setActiveTab('builder')}
                className="flex items-center gap-2 text-xs font-bold text-amber-500 hover:underline"
              >
                <span>Prefer to pick your own items? Open Custom Builder</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-2 gap-2.5 sm:gap-6">
              {preMadePackages.map((pkg) => {
                const isExpanded = expandedPreMadeId === pkg.id;
                return (
                  <div
                    key={pkg.id}
                    onTouchStart={() => handleTouchCard(pkg.id)}
                    onTouchEnd={() => handleTouchCard(pkg.id)}
                    className={`group rounded-2xl sm:rounded-3xl border overflow-hidden transition-all duration-300 hover:shadow-2xl flex flex-col justify-between cursor-pointer select-none ${
                      isDark ? 'bg-[#24170D] border-[#4A2C16]' : 'bg-white border-[#E4D4BC]'
                    }`}
                  >
                    <div>
                      {/* Image & Badge Banner */}
                      <div className="relative h-32 sm:h-56 w-full overflow-hidden bg-black/10">
                        <img
                          src={pkg.image}
                          alt={pkg.name}
                          className={`w-full h-full object-cover card-zoom-img transition-transform duration-500 ease-out ${
                            touchedCardId === pkg.id ? 'scale-100' : 'scale-110'
                          } group-hover:scale-100 group-active:scale-100 active:scale-100`}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        
                        <div className="absolute top-2 left-2 sm:top-4 sm:left-4 flex flex-wrap gap-1 sm:gap-2">
                          <span className="px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[9px] sm:text-xs font-bold bg-emerald-600 text-white flex items-center gap-1 shadow-md">
                            <Truck className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> Free Delivery
                          </span>
                        </div>

                        <div className="absolute bottom-2 left-2 right-2 sm:bottom-4 sm:left-4 sm:right-4 text-white">
                          <div className="text-[9px] sm:text-xs font-mono opacity-80 uppercase tracking-wider truncate">
                            {isAmharic && pkg.amharicTagline ? pkg.amharicTagline : pkg.tagline}
                          </div>
                          <h3 className="font-serif font-bold text-xs sm:text-2xl line-clamp-1">
                            {getPackageTitle(pkg, isAmharic)}
                          </h3>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-2.5 sm:p-6 space-y-2 sm:space-y-4">
                        <p className="text-[10px] sm:text-sm opacity-80 leading-relaxed line-clamp-1 sm:line-clamp-2">
                          {getPackageDescription(pkg, isAmharic)}
                        </p>

                        {/* Interactive "Show details / Show more" Toggle */}
                        <button
                          type="button"
                          onClick={() => setExpandedPreMadeId(isExpanded ? null : pkg.id)}
                          className="w-full text-[10px] sm:text-xs font-semibold flex items-center justify-between py-1 px-1.5 rounded-md hover:bg-black/5 dark:hover:bg-white/5 opacity-80 hover:opacity-100 transition-colors border border-black/5 dark:border-white/5"
                        >
                          <span>{isExpanded ? (isAmharic ? 'ዝርዝር አሳንስ' : 'Hide details') : (isAmharic ? 'የጥቅሉ ዝርዝር' : 'Show details')}</span>
                          <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Items Included Breakdown (Expandable on mobile, always visible on larger) */}
                        {isExpanded && (
                          <div className="space-y-2 pt-1 animate-in fade-in duration-150">
                            <div className="text-[9.5px] sm:text-xs font-bold uppercase tracking-wider opacity-60">
                              {isAmharic ? `የተካተቱ ምድቦች (${pkg.categoryCount}):` : `Package Breakdown (${pkg.categoryCount} Categories):`}
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2">
                              {pkg.items.map((item, idx) => (
                                <div
                                  key={idx}
                                  className={`p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl border flex items-center gap-1.5 sm:gap-2.5 text-[10px] sm:text-xs ${
                                    isDark ? 'bg-[#1D130A] border-[#4A2C16]' : 'bg-[#FAF7F0] border-[#E4D4BC]'
                                  }`}
                                >
                                  <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-6 h-6 sm:w-8 sm:h-8 rounded-md sm:rounded-lg object-cover shrink-0"
                                  />
                                  <div className="truncate">
                                    <div className="font-semibold truncate">{getItemDisplayName(item, isAmharic)}</div>
                                    <div className="text-[8.5px] sm:text-[10px] opacity-60 font-mono">{formatPrice(item.price)}</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Pricing & Actions Footer */}
                    <div
                      className={`p-2.5 sm:p-6 border-t flex flex-col items-stretch justify-between gap-2 sm:gap-4 ${
                        isDark ? 'bg-[#1D130A]/60 border-[#4A2C16]' : 'bg-[#FAF7F0]/60 border-[#E4D4BC]'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <span className="text-[9.5px] sm:text-xs line-through opacity-50 font-mono">
                            {formatPrice(pkg.originalPrice)}
                          </span>
                          <span className="text-[9.5px] sm:text-xs font-bold text-emerald-500">
                            Save {formatPrice(pkg.savings)}
                          </span>
                        </div>
                        <div className="font-serif font-bold text-sm sm:text-2xl text-amber-500">
                          {formatPrice(pkg.packagePrice)}
                        </div>
                        <div className="text-[9px] sm:text-[11px] opacity-70 flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-emerald-500 shrink-0" />
                          <span className="truncate">50% deposit ({formatPrice(pkg.packagePrice * 0.5)})</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 pt-1">
                        <button
                          type="button"
                          onClick={() => handleOrderPreMade(pkg)}
                          className="w-full px-2.5 py-2 sm:px-6 sm:py-3 rounded-xl sm:rounded-2xl bg-amber-500 hover:bg-amber-600 text-black font-bold text-[10px] sm:text-sm transition-all shadow-md flex items-center justify-center gap-1 sm:gap-1.5"
                        >
                          <Gift className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
                          <span className="truncate">Order / 50% Reserve</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* ==================== CUSTOM PACKAGE BUILDER ==================== */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left 8 Cols: Item Catalog Selector */}
            <div className="lg:col-span-8 space-y-6">
              {/* Category Filters */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveCategoryFilter('all')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeCategoryFilter === 'all'
                      ? 'bg-amber-500 text-black shadow-sm'
                      : isDark
                        ? 'bg-[#24170D] border border-[#4A2C16] text-[#F4E8D0] opacity-75 hover:opacity-100'
                        : 'bg-white border border-[#E4D4BC] text-[#241A12] opacity-75 hover:opacity-100'
                  }`}
                >
                  All Items
                </button>
                {categories.map(cat => {
                  const Icon = cat.icon;
                  const isCatSelected = selectedCategories.has(cat.id);
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setActiveCategoryFilter(cat.id)}
                      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                        activeCategoryFilter === cat.id
                          ? 'bg-amber-500 text-black shadow-sm'
                          : isDark
                            ? 'bg-[#24170D] border border-[#4A2C16] text-[#F4E8D0]'
                            : 'bg-white border border-[#E4D4BC] text-[#241A12]'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${activeCategoryFilter === cat.id ? 'text-black' : cat.color}`} />
                      <span>{cat.name}</span>
                      {isCatSelected && (
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Items Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {catalog
                  .filter(item => activeCategoryFilter === 'all' || item.category === activeCategoryFilter)
                  .map(item => {
                    const isSelected = selectedItems.some(i => i.id === item.id);
                    return (
                      <div
                        key={item.id}
                        onClick={() => toggleItem(item)}
                        onTouchStart={() => handleTouchCard(item.id)}
                        onTouchEnd={() => handleTouchCard(item.id)}
                        className={`group p-4 rounded-2xl border cursor-pointer transition-all duration-200 flex gap-3.5 select-none ${
                          isSelected
                            ? isDark
                              ? 'bg-amber-500/10 border-amber-500 ring-1 ring-amber-500 shadow-md'
                              : 'bg-amber-50 border-amber-600 ring-1 ring-amber-600 shadow-md'
                            : isDark
                              ? 'bg-[#24170D] border-[#4A2C16] hover:border-amber-500/40'
                              : 'bg-white border-[#E4D4BC] hover:border-amber-500/40'
                        }`}
                      >
                        <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 shadow-sm">
                          <img
                            src={item.image}
                            alt={item.name}
                            className={`w-full h-full object-cover card-zoom-img transition-transform duration-500 ease-out ${
                              touchedCardId === item.id ? 'scale-100' : 'scale-110'
                            } group-hover:scale-100 group-active:scale-100 active:scale-100`}
                          />
                        </div>
                        <div className="flex-1 flex flex-col justify-between min-w-0">
                          <div>
                            <div className="flex items-start justify-between gap-1">
                              <h4 className="font-bold text-xs sm:text-sm truncate">
                                {getItemDisplayName(item, isAmharic)}
                              </h4>
                              <button
                                type="button"
                                className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                                  isSelected
                                    ? 'bg-amber-500 text-black'
                                    : 'bg-black/10 dark:bg-white/10 opacity-60'
                                }`}
                              >
                                {isSelected ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Plus className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                            <p className="text-[11px] opacity-70 line-clamp-2 mt-0.5">{item.description}</p>
                          </div>
                          <div className="flex items-center justify-between mt-2 pt-1 border-t border-black/5 dark:border-white/5">
                            <span className="font-serif font-bold text-sm text-amber-500">
                              {formatPrice(item.price)}
                            </span>
                            {item.unit && (
                              <span className="text-[10px] opacity-60 font-mono">{item.unit}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Right 4 Cols: Sticky Custom Package Summary */}
            <div className="lg:col-span-4 sticky top-24 space-y-4">
              <div
                className={`p-5 rounded-3xl border shadow-xl space-y-5 ${
                  isDark ? 'bg-[#24170D] border-[#4A2C16]' : 'bg-white border-[#E4D4BC]'
                }`}
              >
                {/* Package Name Input */}
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider opacity-70 block mb-1">
                    Custom Package Title
                  </label>
                  <input
                    type="text"
                    value={packageName}
                    onChange={e => setPackageName(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl border text-sm font-bold focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                      isDark ? 'bg-[#1D130A] border-[#4A2C16] text-[#F4E8D0]' : 'bg-[#FAF7F0] border-[#E4D4BC] text-[#241A12]'
                    }`}
                  />
                </div>

                {/* 3 Categories Validator Box */}
                <div
                  className={`p-3.5 rounded-2xl border space-y-2 ${
                    isEligible
                      ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                      : isDark
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                        : 'bg-amber-50 border-amber-200 text-amber-900'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-bold">
                    <div className="flex items-center gap-1.5">
                      {isEligible ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                      )}
                      <span>Category Requirement: {categoryCount} / 3</span>
                    </div>
                    {isEligible && (
                      <span className="text-[10px] uppercase font-bold bg-emerald-500 text-black px-2 py-0.5 rounded-full">
                        Free Delivery Ready
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] opacity-80 leading-tight">
                    {isEligible
                      ? '✓ Package meets the 3-category rule and qualifies for complimentary VIP delivery and 50% reservation!'
                      : '⚠️ Choose items from at least 3 distinct categories (Meat, Wine, Eggs, Flowers) to unlock package benefits.'}
                  </p>

                  {/* Checklist */}
                  <div className="grid grid-cols-2 gap-1.5 pt-1 text-[11px]">
                    {categories.map(cat => {
                      const isCatActive = selectedCategories.has(cat.id);
                      return (
                        <div
                          key={cat.id}
                          className={`flex items-center gap-1 font-medium ${
                            isCatActive ? 'text-emerald-500 font-bold' : 'opacity-50'
                          }`}
                        >
                          <span>{isCatActive ? '✓' : '○'}</span>
                          <span className="truncate">{cat.name.split(' ')[0]}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Selected Items List */}
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  <div className="text-xs font-bold uppercase tracking-wider opacity-60 flex justify-between">
                    <span>Selected Items ({selectedItems.length})</span>
                    {selectedItems.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setSelectedItems([])}
                        className="text-[10px] text-red-400 hover:underline"
                      >
                        Clear all
                      </button>
                    )}
                  </div>

                  {selectedItems.length === 0 ? (
                    <div className="p-4 rounded-xl border border-dashed text-center text-xs opacity-50">
                      No items selected yet. Click any item on the left to add it to your custom celebration box.
                    </div>
                  ) : (
                    selectedItems.map(item => (
                      <div
                        key={item.id}
                        className={`p-2 rounded-xl border flex items-center justify-between text-xs ${
                          isDark ? 'bg-[#1D130A] border-[#4A2C16]' : 'bg-[#FAF7F0] border-[#E4D4BC]'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate pr-2">
                          <img src={item.image} alt={item.name} className="w-6 h-6 rounded object-cover shrink-0" />
                          <span className="truncate font-semibold">
                            {getItemDisplayName(item, isAmharic)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-mono font-bold text-amber-500">{formatPrice(item.price)}</span>
                          <button
                            type="button"
                            onClick={() => toggleItem(item)}
                            className="p-0.5 text-neutral-400 hover:text-red-400"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Price Summary */}
                <div className="pt-3 border-t border-black/10 dark:border-white/10 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="opacity-70">Delivery Fee:</span>
                    <span className={isEligible ? 'text-emerald-500 font-bold' : 'opacity-70'}>
                      {isEligible ? 'FREE' : 'Select ≥3 categories'}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold text-sm">Total Package Price:</span>
                    <span className="font-serif font-bold text-2xl text-amber-500">{formatPrice(totalPrice)}</span>
                  </div>
                  {isEligible && (
                    <div className="flex justify-between text-xs text-emerald-500 font-medium">
                      <span>50% Deposit to Reserve:</span>
                      <span className="font-bold font-mono">{formatPrice(totalPrice * 0.5)}</span>
                    </div>
                  )}
                </div>

                {saveSuccessMsg && (
                  <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{saveSuccessMsg}</span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-2 pt-2">
                  <button
                    type="button"
                    disabled={!isEligible}
                    onClick={handleOrderCustom}
                    className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed text-black font-bold text-xs sm:text-sm tracking-wide transition-all shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2"
                  >
                    <Gift className="w-4 h-4" />
                    <span>Proceed to Order / 50% Reserve</span>
                  </button>

                  <button
                    type="button"
                    disabled={!isEligible}
                    onClick={handleSaveToMyPackages}
                    className={`w-full py-2.5 rounded-2xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      !isEligible
                        ? 'opacity-30 cursor-not-allowed'
                        : isDark
                          ? 'border-[#4A2C16] hover:bg-[#2A1A0D] text-amber-400'
                          : 'border-[#E4D4BC] hover:bg-[#FAF7F0] text-amber-800'
                    }`}
                  >
                    <BookmarkPlus className="w-3.5 h-3.5" />
                    <span>Save to My Packages</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Package Order Modal */}
      <PackageOrderModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        packageItem={selectedPreMade}
        customPackage={
          selectedPreMade
            ? null
            : {
                name: packageName,
                items: selectedItems,
                totalPrice,
                categoriesCount: categoryCount
              }
        }
      />
    </div>
  );
};
