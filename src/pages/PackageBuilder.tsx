import React, { useState, useEffect, useRef } from 'react';
import { PackageCatalogItem, PreMadePackage, PackageCategory } from '../types/package';
import { api } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useUserAuth } from '../context/UserAuthContext';
import {
  formatPrice,
  getItemDisplayName,
  getItemDisplayDescription,
  getItemDisplayUnit,
  getPackageTitle,
  getPackageDescription
} from '../utils/formatters';
import { PackageOrderModal } from '../components/modals/PackageOrderModal';
import { AnimatedReveal } from '../components/common/AnimatedReveal';
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
  const [packageName, setPackageName] = useState('');
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

  // Set default package title according to language if empty
  useEffect(() => {
    if (!packageName || packageName === 'My Custom Celebration Package' || packageName === 'የኔ ልዩ የበዓል ጥቅል') {
      setPackageName(isAmharic ? 'የኔ ልዩ የበዓል ጥቅል' : 'My Custom Celebration Package');
    }
  }, [isAmharic]);

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

  // Cleanup touch card timer on unmount
  useEffect(() => {
    return () => {
      if (touchCardTimerRef.current) clearTimeout(touchCardTimerRef.current);
    };
  }, []);

  const handleSaveToMyPackages = async () => {
    if (!isAuthenticated) {
      openAuthModal(
        'login',
        isAmharic
          ? 'ያዘጋጁትን ጥቅል ወደ መለያዎ ለማስቀመጥ እባክዎ መጀመሪያ ይግቡ።'
          : 'Please sign in to save your custom package to your collection.'
      );
      return;
    }
    if (!isEligible) return;

    try {
      const res = await api.savePackage({
        name: packageName.trim() || (isAmharic ? 'የኔ ልዩ የበዓል ጥቅል' : 'My Custom Celebration Package'),
        items: selectedItems,
        totalPrice
      });
      if (res.success) {
        setSaveSuccessMsg(
          isAmharic
            ? 'ጥቅሉ በመለያዎ ተቀምጧል! በ "የተቀመጡ ጥቅሎች" ውስጥ ማየት ይችላሉ።'
            : 'Package saved to your collection! View it in "My Packages".'
        );
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

  const categories: { id: PackageCategory; name: string; amharicName: string; icon: any; color: string }[] = [
    { id: 'meat_livestock', name: 'Livestock & Prime Meat', amharicName: 'የቀንድ ከብትና ልዩ ሥጋ', icon: Beef, color: 'text-amber-500' },
    { id: 'wine', name: 'Wines, Whiskies & Tej', amharicName: 'ወይኖች፣ ዊስኪና ማር ጠጅ', icon: Wine, color: 'text-amber-500' },
    { id: 'eggs', name: 'Farm Fresh Eggs', amharicName: 'ትኩስ የጓሮ እንቁላል', icon: Egg, color: 'text-amber-500' },
    { id: 'flowers', name: 'Celebration Flowers', amharicName: 'የበዓል አበቦች', icon: Flower2, color: 'text-amber-500' }
  ];

  return (
    <div className="min-h-screen pb-24">
      {/* Hero Banner */}
      <section className="relative overflow-hidden pt-8 pb-10 sm:pt-12 sm:pb-12 border-b border-black/10 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-500">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>{isAmharic ? 'የበዓልና የደስታ ልዩ ጥቅሎች' : 'Holiday Hampers & Custom Packages'}</span>
            </div>

            <h1 className="font-serif font-bold text-3xl sm:text-5xl tracking-tight leading-tight">
              {isAmharic ? (
                <>
                  <span className="block">የበዓል ድግስና የስጦታ</span>
                  <span className="block">ሙሉ ጥቅል</span>
                </>
              ) : (
                <>
                  <span className="block">Build or Choose Your</span>
                  <span className="block">Celebration Package</span>
                </>
              )}
            </h1>

            <p className="text-sm sm:text-base text-stone-600 dark:text-[#D8C5A8] leading-relaxed max-w-2xl mx-auto">
              {isAmharic ? (
                <span>የስጋና የቀንድ ከብት፣ የተመረጡ ወይኖች፣ ጆኒ ዎከር ዊስኪዎችና ማር ጠጅ፣ የጓሮ እንቁላል እንዲሁም የበዓል አበቦችን በአንድ ላይ አቀናጅተው ያዙ።</span>
              ) : (
                <span>Combine your choice of <strong>Livestock or Prime Meat</strong>, <strong>Wines, Johnnie Walker Whiskies &amp; Honey Tej</strong>, <strong>Farm Fresh Eggs</strong>, and <strong>Celebration Flowers</strong>.</span>
              )}
            </p>

            {/* Benefit Highlights (Minimal divider row without pill cards) */}
            <div className={`grid grid-cols-3 py-3 border-y max-w-2xl mx-auto ${
              isDark ? 'border-[#4A2C16] divide-[#4A2C16]' : 'border-[#E4D4BC] divide-[#E4D4BC]'
            } divide-x`}>
              <div className="px-2 flex items-center justify-center gap-1.5 text-center">
                <Truck className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span className="text-[11px] sm:text-xs font-semibold">
                  {isAmharic ? '100% ነፃ ማድረሻ' : 'Free Delivery'}
                </span>
              </div>
              <div className="px-2 flex items-center justify-center gap-1.5 text-center">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span className="text-[11px] sm:text-xs font-semibold">
                  {isAmharic ? '50% ቅድመ-ክፍያ' : '50% Deposit'}
                </span>
              </div>
              <div className="px-2 flex items-center justify-center gap-1.5 text-center">
                <Gift className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span className="text-[11px] sm:text-xs font-semibold">
                  {isAmharic ? 'ቢያንስ 3 ምድቦች' : 'Min. 3 Categories'}
                </span>
              </div>
            </div>

            {/* View Switcher Tabs */}
            <div className="pt-3 flex justify-center">
              <div
                className={`p-1 rounded-2xl border flex items-center gap-1 ${
                  isDark ? 'bg-[#2A1A0D] border-[#4A2C16]' : 'bg-[#FAF7F0] border-[#E4D4BC]'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setActiveTab('premade')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    activeTab === 'premade'
                      ? 'bg-amber-500 text-black shadow-sm'
                      : 'text-stone-700 dark:text-[#F4EAD9] bg-transparent hover:bg-black/5 dark:hover:bg-[rgba(244,234,217,0.08)]'
                  }`}
                >
                  <Gift className="w-4 h-4" />
                  <span>{isAmharic ? 'የተዘጋጁ ጥቅሎች' : 'Curated Packages'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('builder')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    activeTab === 'builder'
                      ? 'bg-amber-500 text-black shadow-sm'
                      : 'text-stone-700 dark:text-[#F4EAD9] bg-transparent hover:bg-black/5 dark:hover:bg-[rgba(244,234,217,0.08)]'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isAmharic ? 'የራስዎን ጥቅል ያዘጋጁ' : 'Custom Package Builder'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {loading ? (
          <div className="text-center py-20 opacity-80 animate-in fade-in duration-200">
            <div className="w-8 h-8 rounded-full border-2 border-amber-500 border-t-transparent animate-spin mx-auto mb-3" />
            <p className="text-xs font-semibold text-amber-500">
              {isAmharic ? 'በመጫን ላይ...' : 'Loading...'}
            </p>
          </div>
        ) : activeTab === 'premade' ? (
          /* ==================== PRE-MADE PACKAGES VIEW ==================== */
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h2 className="font-serif font-bold text-xl sm:text-2xl">
                  {isAmharic ? 'በልዩ ባለሙያና ለበዓል የተዘጋጁ ሙሉ ጥቅሎች' : 'Chef & Holiday Curated Bundles'}
                </h2>
                <p className="text-xs opacity-75 mt-0.5">
                  {isAmharic ? 'ለማዘዝ የተዘጋጁ ሙሉ የበዓል ስብስቦች ከነፃ ማድረሻ ጋር' : 'Ready-to-order complete celebration sets with complimentary delivery'}
                </p>
              </div>
              <button
                onClick={() => setActiveTab('builder')}
                className="flex items-center gap-1.5 text-xs font-bold text-amber-500 hover:underline cursor-pointer"
              >
                <span>{isAmharic ? 'ልዩ ጥቅል ማዘጋጃን ይክፈቱ' : 'Open Custom Builder'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 items-start">
              {preMadePackages.map((pkg, idx) => {
                const isExpanded = expandedPreMadeId === pkg.id;
                return (
                  <AnimatedReveal key={pkg.id} direction="up" delay={80 + idx * 80} className="self-start h-fit w-full">
                    <div
                      onTouchStart={() => handleTouchCard(pkg.id)}
                      onTouchEnd={() => handleTouchCard(pkg.id)}
                      className={`self-start h-fit w-full group rounded-2xl border overflow-hidden transition-all duration-300 hover:shadow-lg flex flex-col justify-between select-none ${
                        isDark ? 'bg-[#24170D] border-[#4A2C16]' : 'bg-white border-[#E4D4BC]'
                      }`}
                    >
                      <div>
                        {/* Image Banner */}
                        <div className="relative h-36 sm:h-40 w-full overflow-hidden bg-black/10">
                          <img
                            src={pkg.image}
                            alt={pkg.name}
                            className={`w-full h-full object-cover card-zoom-img transition-transform duration-500 ease-out ${
                              touchedCardId === pkg.id ? 'scale-100' : 'scale-105'
                            } group-hover:scale-100 group-active:scale-100 active:scale-100`}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />

                          <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white flex items-center gap-1 shadow-xs">
                              <Truck className="w-2.5 h-2.5" /> {isAmharic ? 'ነፃ ማድረሻ' : 'Free Delivery'}
                            </span>
                          </div>

                          {/* Out of Stock Notice */}
                          {(() => {
                            const avail = pkg.availableSlots !== undefined ? pkg.availableSlots : 10;
                            const isSoldOut = Boolean(pkg.isOutOfStock || avail <= 0);
                            if (isSoldOut) {
                              return (
                                <div className="absolute top-2.5 right-2.5">
                                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-red-600 text-white shadow-xs">
                                    {isAmharic ? 'አልቋል' : 'Sold Out'}
                                  </span>
                                </div>
                              );
                            }
                            return null;
                          })()}

                          <div className="absolute bottom-2.5 left-3 right-3 text-white">
                            <div className="text-[9.5px] font-mono opacity-80 uppercase tracking-wider truncate">
                              {isAmharic && pkg.amharicTagline ? pkg.amharicTagline : pkg.tagline}
                            </div>
                            <h3 className="font-serif font-bold text-sm sm:text-base line-clamp-1">
                              {getPackageTitle(pkg, isAmharic)}
                            </h3>
                          </div>
                        </div>

                        {/* Description & Included Items Minimal List (No nested cards) */}
                        <div className="p-3.5 space-y-2.5">
                          <p className="text-xs opacity-75 leading-relaxed line-clamp-2">
                            {getPackageDescription(pkg, isAmharic)}
                          </p>

                          {/* Interactive "Show details" Toggle */}
                          <button
                            type="button"
                            onClick={() => setExpandedPreMadeId(isExpanded ? null : pkg.id)}
                            className="w-full text-xs font-semibold flex items-center justify-between py-1 text-amber-500 hover:text-amber-400 opacity-90 hover:opacity-100 transition-colors cursor-pointer"
                          >
                            <span>{isExpanded ? (isAmharic ? 'ዝርዝር አሳንስ' : 'Hide details') : (isAmharic ? 'የጥቅሉ ዝርዝር' : 'Show details')}</span>
                            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                          </button>

                          {/* Included Items: Clean, Minimalist List without nested cards */}
                          {isExpanded && (
                            <div className="pt-1.5 space-y-1.5 animate-in fade-in duration-150">
                              <div className="text-[10px] font-bold uppercase tracking-wider opacity-60">
                                {isAmharic ? `የተካተቱ ምድቦች (${pkg.categoryCount}):` : `Included Items (${pkg.categoryCount} Categories):`}
                              </div>
                              <div className={`divide-y text-xs ${
                                isDark ? 'divide-[#4A2C16]/50' : 'divide-[#E4D4BC]/60'
                              }`}>
                                {pkg.items.map((item, idx) => (
                                  <div
                                    key={idx}
                                    className="py-1.5 flex items-center justify-between gap-2"
                                  >
                                    <div className="flex items-center gap-2 truncate">
                                      <Check className="w-3 h-3 text-emerald-500 shrink-0" />
                                      <span className="font-medium truncate opacity-90">{getItemDisplayName(item, isAmharic)}</span>
                                    </div>
                                    <span className="text-[10px] font-mono opacity-60 shrink-0">{formatPrice(item.price)}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Pricing & Order Action */}
                      <div className={`p-3.5 border-t space-y-2.5 ${
                        isDark ? 'border-[#4A2C16]' : 'border-[#E4D4BC]'
                      }`}>
                        <div className="flex items-end justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] line-through opacity-50 font-mono">
                                {formatPrice(pkg.originalPrice)}
                              </span>
                              <span className="text-[10px] font-bold text-emerald-500">
                                {isAmharic ? 'ቁጠባ ' : 'Save '}{formatPrice(pkg.savings)}
                              </span>
                            </div>
                            <div className="font-serif font-bold text-base text-amber-500">
                              {formatPrice(pkg.packagePrice)}
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="text-[9.5px] text-emerald-500 font-bold">
                              {isAmharic ? '50% ቅድመ-ክፍያ' : '50% deposit'}
                            </div>
                            <div className="text-[11px] font-mono font-bold text-emerald-500">
                              {formatPrice(pkg.packagePrice * 0.5)}
                            </div>
                          </div>
                        </div>

                        <div>
                          {(() => {
                            const avail = pkg.availableSlots !== undefined ? pkg.availableSlots : 10;
                            const isSoldOut = Boolean(pkg.isOutOfStock || avail <= 0);
                            if (isSoldOut) {
                              return (
                                <button
                                  type="button"
                                  disabled
                                  className="w-full py-2 rounded-xl bg-stone-700/60 text-stone-300 font-bold text-xs cursor-not-allowed opacity-80 flex items-center justify-center gap-1"
                                >
                                  <span>{isAmharic ? 'አልቋል (Out of Stock)' : 'Sold Out'}</span>
                                </button>
                              );
                            }
                            return (
                              <button
                                type="button"
                                onClick={() => handleOrderPreMade(pkg)}
                                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.99]"
                              >
                                <Gift className="w-3.5 h-3.5 shrink-0" />
                                <span>{isAmharic ? 'ይዘዙ / በ50% ይያዙ' : 'Order / 50% Reserve'}</span>
                              </button>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  </AnimatedReveal>
                );
              })}
            </div>
          </div>
        ) : (
          /* ==================== CUSTOM PACKAGE BUILDER ==================== */
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
                      <Icon className={`w-3.5 h-3.5 ${activeCategoryFilter === cat.id ? 'text-black' : cat.color}`} />
                      <span>{isAmharic ? cat.amharicName : cat.name}</span>
                      {isCatSelected && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Items Grid (Clean minimal item layout) */}
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
                              src={item.image}
                              alt={item.name}
                              className={`w-full h-full object-cover card-zoom-img transition-transform duration-300 ${
                                touchedCardId === item.id ? 'scale-100' : 'scale-105'
                              } group-hover:scale-100`}
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
                                  className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-colors ${
                                    isSelected
                                      ? 'bg-amber-500 text-black'
                                      : 'bg-black/10 dark:bg-white/10 opacity-60'
                                  }`}
                                >
                                  {isSelected ? <Check className="w-3 h-3 stroke-[3]" /> : <Plus className="w-3 h-3" />}
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

            {/* Right 4 Cols: Sticky Custom Package Summary (Minimal and clean, no nested cards) */}
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

                {/* Minimalist 3-Category Requirement Bar (No nested card box) */}
                <div className="space-y-1.5 pt-1 border-t border-black/5 dark:border-white/5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <div className="flex items-center gap-1.5">
                      {isEligible ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                      )}
                      <span>{isAmharic ? `የምድብ መስፈርት፡ ${categoryCount}/3` : `Categories: ${categoryCount}/3`}</span>
                    </div>
                    <span className={`text-[10px] font-bold ${isEligible ? 'text-emerald-500' : 'opacity-60'}`}>
                      {isEligible ? (isAmharic ? '✓ ነፃ ማድረሻ' : '✓ Free Delivery') : (isAmharic ? 'ቢያንስ 3 ይምረጡ' : 'Min. 3 required')}
                    </span>
                  </div>

                  {/* Clean Category Checklist */}
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

                {/* Selected Items Minimalist List (No nested item cards) */}
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
                              <Trash2 className="w-3 h-3" />
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
                      {isEligible ? (isAmharic ? 'ነፃ' : 'FREE') : (isAmharic ? '≥3 ምድብ ያስፈልጋል' : '≥3 categories')}
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
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
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
                    <Gift className="w-4 h-4" />
                    <span>{isAmharic ? 'ይዘዙ / በ50% ይያዙ' : 'Proceed to Order / 50% Reserve'}</span>
                  </button>

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
                    <BookmarkPlus className="w-3.5 h-3.5" />
                    <span>{isAmharic ? 'ወደ መለያዬ አስቀምጥ' : 'Save to My Packages'}</span>
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
