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

  const handleSaveToMyPackages = async () => {
    if (!isAuthenticated) {
      openAuthModal('login');
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
            ? '🎉 ጥቅሉ በመለያዎ ተቀምጧል! በ "የተቀመጡ ጥቅሎች" ውስጥ ማየት ይችላሉ።'
            : '🎉 Package saved to your collection! View it in "My Packages".'
        );
        setTimeout(() => setSaveSuccessMsg(null), 4000);
      }
    } catch (err) {
      console.error('Failed to save package:', err);
    }
  };

  const handleOrderPreMade = (pkg: PreMadePackage) => {
    if (!isAuthenticated) {
      openAuthModal(
        'register',
        isAmharic
          ? `የበዓል ጥቅል "${pkg.name}" ለማዘዝ እባክዎ መጀመሪያ ይመዝገቡ ወይም ይግቡ።`
          : `To order celebration package "${pkg.name}", please create an account or sign in first.`
      );
      return;
    }
    setSelectedPreMade(pkg);
    setIsOrderModalOpen(true);
  };

  const handleOrderCustom = () => {
    if (!isAuthenticated) {
      openAuthModal(
        'register',
        isAmharic
          ? 'ያዘጋጁትን ልዩ የበዓል ጥቅል ለማዘዝ እባክዎ መጀመሪያ ይመዝገቡ ወይም ይግቡ።'
          : 'To order your custom celebration bundle, please create an account or sign in first.'
      );
      return;
    }
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
      <section className="relative overflow-hidden pt-8 pb-12 sm:pt-12 sm:pb-16 border-b border-black/10 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3.5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/15 border border-amber-500/30 text-amber-500">
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

            <div className="space-y-2.5 max-w-2xl mx-auto">
              <p className="text-sm sm:text-base text-stone-600 dark:text-[#D8C5A8] leading-relaxed">
                {isAmharic ? (
                  <>
                    <span className="block">የስጋና የቀንድ ከብት፣ የተመረጡ ወይኖች፣ ጆኒ ዎከር ዊስኪዎችና ማር ጠጅ፣</span>
                    <span className="block">የጓሮ እንቁላል እንዲሁም የበዓል አበቦችን በአንድ ላይ አቀናጅተው ያዙ።</span>
                  </>
                ) : (
                  <>
                    <span className="block">
                      Combine your choice of <strong className="font-semibold text-stone-900 dark:text-[#F4EAD9]">Livestock or Prime Meat</strong>, <strong className="font-semibold text-stone-900 dark:text-[#F4EAD9]">Wines, Johnnie Walker Whiskies &amp; Honey Tej</strong>,
                    </span>
                    <span className="block">
                      <strong className="font-semibold text-stone-900 dark:text-[#F4EAD9]">Farm Fresh Eggs</strong>, and <strong className="font-semibold text-stone-900 dark:text-[#F4EAD9]">Celebration Flowers</strong>.
                    </span>
                  </>
                )}
              </p>

              {/* Benefit Badges */}
              <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 pt-0.5">
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border border-black/10 dark:border-white/15 bg-black/[0.03] dark:bg-white/[0.04] text-stone-700 dark:text-[#F4EAD9]">
                  <Truck className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>{isAmharic ? 'በማቀዝቀዣ መኪና ነፃ ማድረስ' : 'Free Refrigerated Delivery'}</span>
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border border-black/10 dark:border-white/15 bg-black/[0.03] dark:bg-white/[0.04] text-stone-700 dark:text-[#F4EAD9]">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>{isAmharic ? '50% ቅድመ ክፍያ ማስያዣ' : '50% Deposit Reservation'}</span>
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border border-black/10 dark:border-white/15 bg-black/[0.03] dark:bg-white/[0.04] text-stone-700 dark:text-[#F4EAD9]">
                  <Gift className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>{isAmharic ? 'ቢያንስ 3 የጥቅል ክፍሎች' : 'Min. 3 Categories'}</span>
                </span>
              </div>
            </div>

            {/* View Switcher Tabs */}
            <div className="pt-4 flex justify-center">
              <div
                className={`p-1.5 rounded-2xl border flex items-center gap-1 shadow-sm ${isDark ? 'bg-[#2A1A0D] border-[#4A2C16]' : 'bg-[#FAF7F0] border-[#E4D4BC]'
                  }`}
              >
                <button
                  type="button"
                  onClick={() => setActiveTab('premade')}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${activeTab === 'premade'
                      ? 'bg-amber-500 text-black shadow-md'
                      : 'text-stone-700 dark:text-[#F4EAD9] bg-transparent hover:bg-black/5 dark:hover:bg-[rgba(244,234,217,0.08)]'
                    }`}
                >
                  <Gift className="w-4 h-4" />
                  <span>{isAmharic ? 'የተዘጋጁ ጥቅሎች' : 'Curated Packages'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('builder')}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${activeTab === 'builder'
                      ? 'bg-amber-500 text-black shadow-md'
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10">
        {loading ? (
          <div className="text-center py-20 opacity-60">
            {isAmharic ? 'የበዓል ጥቅሎችን በመጫን ላይ...' : 'Loading celebration packages...'}
          </div>
        ) : activeTab === 'premade' ? (
          /* ==================== PRE-MADE PACKAGES VIEW ==================== */
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h2 className="font-serif font-bold text-2xl">
                  {isAmharic ? 'በልዩ ባለሙያና ለበዓል የተዘጋጁ ሙሉ ጥቅሎች' : 'Chef & Holiday Curated Bundles'}
                </h2>
                <p className="text-xs opacity-75">
                  {isAmharic ? 'ለማዘዝ የተዘጋጁ ሙሉ የበዓል ስብስቦች ከነፃ ማድረሻ ጋር' : 'Ready-to-order complete celebration sets with complimentary delivery'}
                </p>
              </div>
              <button
                onClick={() => setActiveTab('builder')}
                className="flex items-center gap-2 text-xs font-bold text-amber-500 hover:underline cursor-pointer"
              >
                <span>{isAmharic ? 'የራስዎን እቃዎች መምረጥ ይፈልጋሉ? ልዩ ጥቅል ማዘጋጃን ይክፈቱ' : 'Prefer to pick your own items? Open Custom Builder'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-4 lg:gap-4.5 items-start">
              {preMadePackages.map((pkg, idx) => {
                const isExpanded = expandedPreMadeId === pkg.id;
                return (
                  <AnimatedReveal key={pkg.id} direction="up" delay={80 + idx * 80} className="self-start h-fit w-full">
                    <div
                      onTouchStart={() => handleTouchCard(pkg.id)}
                      onTouchEnd={() => handleTouchCard(pkg.id)}
                      className={`self-start h-fit w-full group rounded-2xl border overflow-hidden transition-all duration-300 hover:shadow-xl flex flex-col justify-between cursor-pointer select-none ${isDark ? 'bg-[#24170D] border-[#4A2C16]' : 'bg-white border-[#E4D4BC]'
                        }`}
                    >
                      <div>
                        {/* Image & Badge Banner */}
                        <div className="relative h-32 sm:h-40 lg:h-36 w-full overflow-hidden bg-black/10">
                          <img
                            src={pkg.image}
                            alt={pkg.name}
                            className={`w-full h-full object-cover card-zoom-img transition-transform duration-500 ease-out ${touchedCardId === pkg.id ? 'scale-100' : 'scale-110'
                              } group-hover:scale-100 group-active:scale-100 active:scale-100`}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                          <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex flex-wrap gap-1">
                            <span className="px-2 py-0.5 sm:px-2.5 sm:py-0.5 rounded-full text-[9px] sm:text-[11px] font-bold bg-emerald-600 text-white flex items-center gap-1 shadow-md">
                              <Truck className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> {isAmharic ? 'ነፃ ማድረሻ' : 'Free Delivery'}
                            </span>
                          </div>

                          {/* Out of Stock Notice */}
                          {(() => {
                            const avail = pkg.availableSlots !== undefined ? pkg.availableSlots : 10;
                            const isSoldOut = Boolean(pkg.isOutOfStock || avail <= 0);
                            if (isSoldOut) {
                              return (
                                <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
                                  <span className="px-2 py-0.5 sm:px-2 sm:py-0.5 rounded-full text-[8.5px] sm:text-[10px] font-bold bg-red-600 text-white shadow-md">
                                    {isAmharic ? 'አልቋል' : 'Sold Out'}
                                  </span>
                                </div>
                              );
                            }
                            return null;
                          })()}

                          <div className="absolute bottom-2 left-2 right-2 sm:bottom-3 sm:left-3 sm:right-3 text-white">
                            <div className="text-[9px] sm:text-[10px] font-mono opacity-80 uppercase tracking-wider truncate">
                              {isAmharic && pkg.amharicTagline ? pkg.amharicTagline : pkg.tagline}
                            </div>
                            <h3 className="font-serif font-bold text-xs sm:text-base lg:text-sm line-clamp-1">
                              {getPackageTitle(pkg, isAmharic)}
                            </h3>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-2.5 sm:p-4 lg:p-3.5 space-y-2 sm:space-y-2.5">
                          <p className="text-[10px] sm:text-xs opacity-80 leading-relaxed line-clamp-1 sm:line-clamp-2">
                            {getPackageDescription(pkg, isAmharic)}
                          </p>

                          {/* Interactive "Show details / Show more" Toggle */}
                          <button
                            type="button"
                            onClick={() => setExpandedPreMadeId(isExpanded ? null : pkg.id)}
                            className="w-full text-[10px] sm:text-xs font-semibold flex items-center justify-between py-1 px-1.5 rounded-md hover:bg-black/5 dark:hover:bg-white/5 opacity-80 hover:opacity-100 transition-colors border border-black/5 dark:border-white/5 cursor-pointer"
                          >
                            <span>{isExpanded ? (isAmharic ? 'ዝርዝር አሳንስ' : 'Hide details') : (isAmharic ? 'የጥቅሉ ዝርዝር' : 'Show details')}</span>
                            <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                          </button>

                          {/* Items Included Breakdown */}
                          {isExpanded && (
                            <div className="space-y-2 pt-1 animate-in fade-in duration-150">
                              <div className="text-[9px] sm:text-[10.5px] font-bold uppercase tracking-wider opacity-60">
                                {isAmharic ? `የተካተቱ ምድቦች (${pkg.categoryCount}):` : `Package Breakdown (${pkg.categoryCount} Categories):`}
                              </div>
                              <div className="grid grid-cols-1 gap-1.5">
                                {pkg.items.map((item, idx) => (
                                  <div
                                    key={idx}
                                    className={`p-1.5 sm:p-2 rounded-lg border flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs ${isDark ? 'bg-[#1D130A] border-[#4A2C16]' : 'bg-[#FAF7F0] border-[#E4D4BC]'
                                      }`}
                                  >
                                    <img
                                      src={item.image}
                                      alt={item.name}
                                      className="w-6 h-6 sm:w-7 sm:h-7 rounded-md object-cover shrink-0"
                                    />
                                    <div className="truncate">
                                      <div className="font-semibold truncate">{getItemDisplayName(item, isAmharic)}</div>
                                      <div className="text-[8.5px] sm:text-[9.5px] opacity-60 font-mono">{formatPrice(item.price)}</div>
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
                        className={`p-2.5 sm:p-4 lg:p-3.5 border-t flex flex-col items-stretch justify-between gap-2 sm:gap-3 ${isDark ? 'bg-[#1D130A]/60 border-[#4A2C16]' : 'bg-[#FAF7F0]/60 border-[#E4D4BC]'
                          }`}
                      >
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[9.5px] sm:text-[11px] line-through opacity-50 font-mono">
                              {formatPrice(pkg.originalPrice)}
                            </span>
                            <span className="text-[9.5px] sm:text-[11px] font-bold text-emerald-500">
                              {isAmharic ? 'ቁጠባ ' : 'Save '}{formatPrice(pkg.savings)}
                            </span>
                          </div>
                          <div className="font-serif font-bold text-sm sm:text-lg lg:text-base text-amber-500">
                            {formatPrice(pkg.packagePrice)}
                          </div>
                          <div className="text-[9px] sm:text-[10.5px] opacity-70 flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-emerald-500 shrink-0" />
                            <span className="truncate">{isAmharic ? '50% ቅድመ-ክፍያ' : '50% deposit'} ({formatPrice(pkg.packagePrice * 0.5)})</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 pt-1">
                          {(() => {
                            const avail = pkg.availableSlots !== undefined ? pkg.availableSlots : 10;
                            const isSoldOut = Boolean(pkg.isOutOfStock || avail <= 0);
                            if (isSoldOut) {
                              return (
                                <button
                                  type="button"
                                  disabled
                                  className="w-full px-2.5 py-2 sm:px-3 sm:py-2.5 rounded-xl bg-stone-700/60 text-stone-300 font-bold text-[10px] sm:text-xs cursor-not-allowed opacity-80 flex items-center justify-center gap-1"
                                >
                                  <span>{isAmharic ? '🚫 አልቋል (Out of Stock)' : '🚫 Sold Out (Out of Stock)'}</span>
                                </button>
                              );
                            }
                            return (
                              <button
                                type="button"
                                onClick={() => handleOrderPreMade(pkg)}
                                className="w-full px-2.5 py-2 sm:px-3 sm:py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-bold text-[10px] sm:text-xs transition-all shadow-md flex items-center justify-center gap-1 cursor-pointer active:scale-[0.99]"
                              >
                                <Gift className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                                <span className="truncate">{isAmharic ? 'ይዘዙ / በ50% ይያዙ' : 'Order / 50% Reserve'}</span>
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
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left 8 Cols: Item Catalog Selector */}
            <div className="lg:col-span-8 space-y-6">
              {/* Category Filters */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveCategoryFilter('all')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeCategoryFilter === 'all'
                      ? 'bg-amber-500 text-black shadow-sm'
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
                      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeCategoryFilter === cat.id
                          ? 'bg-amber-500 text-black shadow-sm'
                          : isDark
                            ? 'bg-[#24170D] border border-[#4A2C16] text-[#F4E8D0]'
                            : 'bg-white border border-[#E4D4BC] text-[#241A12]'
                        }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${activeCategoryFilter === cat.id ? 'text-black' : cat.color}`} />
                      <span>{isAmharic ? cat.amharicName : cat.name}</span>
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
                  .map((item, idx) => {
                    const isSelected = selectedItems.some(i => i.id === item.id);
                    return (
                      <AnimatedReveal key={item.id} direction="up" delay={Math.min(idx * 50, 350)} className="h-full">
                        <div
                          onClick={() => toggleItem(item)}
                          onTouchStart={() => handleTouchCard(item.id)}
                          onTouchEnd={() => handleTouchCard(item.id)}
                          className={`h-full group p-4 rounded-2xl border cursor-pointer transition-all duration-200 flex gap-3.5 select-none hover:-translate-y-0.5 ${isSelected
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
                              className={`w-full h-full object-cover card-zoom-img transition-transform duration-500 ease-out ${touchedCardId === item.id ? 'scale-100' : 'scale-110'
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
                                  className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-colors ${isSelected
                                      ? 'bg-amber-500 text-black'
                                      : 'bg-black/10 dark:bg-white/10 opacity-60'
                                    }`}
                                >
                                  {isSelected ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Plus className="w-3.5 h-3.5" />}
                                </button>
                              </div>
                              <p className="text-[11px] opacity-70 line-clamp-2 mt-0.5">
                                {getItemDisplayDescription(item, isAmharic)}
                              </p>
                            </div>
                            <div className="flex items-center justify-between mt-2 pt-1 border-t border-black/5 dark:border-white/5">
                              <span className="font-serif font-bold text-sm text-amber-500">
                                {formatPrice(item.price)}
                              </span>
                              {item.unit && (
                                <span className="text-[10px] opacity-60 font-mono">
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
                className={`p-5 rounded-3xl border shadow-xl space-y-5 ${isDark ? 'bg-[#24170D] border-[#4A2C16]' : 'bg-white border-[#E4D4BC]'
                  }`}
              >
                {/* Package Name Input */}
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider opacity-70 block mb-1">
                    {isAmharic ? 'የጥቅሉ ስያሜ' : 'Custom Package Title'}
                  </label>
                  <input
                    type="text"
                    value={packageName}
                    onChange={e => setPackageName(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl border text-sm font-bold focus:outline-none focus:ring-2 focus:ring-amber-500 ${isDark ? 'bg-[#1D130A] border-[#4A2C16] text-[#F4E8D0]' : 'bg-[#FAF7F0] border-[#E4D4BC] text-[#241A12]'
                      }`}
                  />
                </div>

                {/* 3 Categories Validator Box */}
                <div
                  className={`p-3.5 rounded-2xl border space-y-2 ${isEligible
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
                      <span>{isAmharic ? `የምድብ መስፈርት፡ ${categoryCount} / 3` : `Category Requirement: ${categoryCount} / 3`}</span>
                    </div>
                    {isEligible && (
                      <span className="text-[10px] uppercase font-bold bg-emerald-500 text-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                        <Truck className="w-3 h-3" />
                        {isAmharic ? '100% ነፃ ማድረሻ ተፈቅዷል' : '100% Free Delivery Ready'}
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] opacity-80 leading-tight">
                    {isEligible
                      ? (isAmharic ? '🎉 እንኳን ደስ አለዎት! ጥቅልዎ የ3 ምድቦችን መስፈርት ስላሟላ 100% ነፃ የበር ማድረሻ (0 ETB) እና የ50% ቅድመ ክፍያ ማስያዣ ተፈቅዷል!' : '🎉 Congratulations! Your package fulfills the 3-category rule and qualifies for 100% FREE Doorstep Delivery (0 ETB) & 50% reservation deposit!')
                      : (isAmharic ? '⚠️ 100% ነፃ የበር ማድረሻ ለማግኘት ቢያንስ ከ3 የተለያዩ ምድቦች (ሥጋ/ከብት፣ ወይን/መጠጥ፣ እንቁላል፣ አበባ) ይምረጡ።' : '⚠️ Select items from at least 3 distinct categories (Livestock/Meat, Wine/Drinks, Eggs, Flowers) to unlock 100% Free Delivery.')}
                  </p>

                  {/* Checklist */}
                  <div className="grid grid-cols-2 gap-1.5 pt-1 text-[11px]">
                    {categories.map(cat => {
                      const isCatActive = selectedCategories.has(cat.id);
                      return (
                        <div
                          key={cat.id}
                          className={`flex items-center gap-1 font-medium ${isCatActive ? 'text-emerald-500 font-bold' : 'opacity-50'
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
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  <div className="text-xs font-bold uppercase tracking-wider opacity-60 flex justify-between">
                    <span>{isAmharic ? `የተመረጡ እቃዎች (${selectedItems.length})` : `Selected Items (${selectedItems.length})`}</span>
                    {selectedItems.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setSelectedItems([])}
                        className="text-[10px] text-red-400 hover:underline cursor-pointer"
                      >
                        {isAmharic ? 'ሁሉንም አጽዳ' : 'Clear all'}
                      </button>
                    )}
                  </div>

                  {selectedItems.length === 0 ? (
                    <div className="p-4 rounded-xl border border-dashed text-center text-xs opacity-50">
                      {isAmharic ? 'እስካሁን የተመረጠ እቃ የለም። እቃዎችን ለመጨመር በግራ በኩል ካሉት ዝርዝሮች ይጫኑ።' : 'No items selected yet. Click any item on the left to add it to your custom celebration box.'}
                    </div>
                  ) : (
                    selectedItems.map(item => (
                      <div
                        key={item.id}
                        className={`p-2 rounded-xl border flex items-center justify-between text-xs ${isDark ? 'bg-[#1D130A] border-[#4A2C16]' : 'bg-[#FAF7F0] border-[#E4D4BC]'
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
                            className="p-0.5 text-neutral-400 hover:text-red-400 cursor-pointer"
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
                    <span className="opacity-70">{isAmharic ? 'የማድረሻ ክፍያ፡' : 'Delivery Fee:'}</span>
                    <span className={isEligible ? 'text-emerald-500 font-bold' : 'opacity-70'}>
                      {isEligible ? (isAmharic ? 'ነፃ' : 'FREE') : (isAmharic ? 'ቢያንስ 3 ምድቦችን ይምረጡ' : 'Select ≥3 categories')}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold text-sm">{isAmharic ? 'ጠቅላላ የጥቅል ዋጋ፡' : 'Total Package Price:'}</span>
                    <span className="font-serif font-bold text-2xl text-amber-500">{formatPrice(totalPrice)}</span>
                  </div>
                  {isEligible && (
                    <div className="flex justify-between text-xs text-emerald-500 font-medium">
                      <span>{isAmharic ? '50% ቅድመ ክፍያ ማስያዣ፡' : '50% Deposit to Reserve:'}</span>
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
                    className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed text-black font-bold text-xs sm:text-sm tracking-wide transition-all shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Gift className="w-4 h-4" />
                    <span>{isAmharic ? 'ይዘዙ / በ50% ይያዙ' : 'Proceed to Order / 50% Reserve'}</span>
                  </button>

                  <button
                    type="button"
                    disabled={!isEligible}
                    onClick={handleSaveToMyPackages}
                    className={`w-full py-2.5 rounded-2xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${!isEligible
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
