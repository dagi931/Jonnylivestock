import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
import { PackageCatalogItem, PreMadePackage, PackageCategory } from '../types/package';
import { PRE_MADE_PACKAGES } from '../data/packagesData';
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
import { validatePackageLivestock } from '../utils/packageValidators';
import { AnimatedReveal } from '../components/common/AnimatedReveal';
import {
  Gift,
  Sparkles,
  Truck,
  ShieldCheck,
  Check,
  ArrowRight,
  ChevronDown
} from 'lucide-react';

// Lazy-load modal to eliminate Leaflet and heavy form bundles from initial page load
const PackageOrderModal = lazy(() =>
  import('../components/modals/PackageOrderModal').then(m => ({ default: m.PackageOrderModal }))
);

// Lazy-load interactive Custom Package Builder to reduce initial critical path JS
const CustomPackageBuilderTab = lazy(() =>
  import('../components/packages/CustomPackageBuilderTab')
);

const FALLBACK_PACKAGE_IMAGE =
  'https://images.unsplash.com/photo-1484557052118-f32bd25b45b5?auto=format&fit=crop&fm=webp&q=65&w=480&h=208';

/** Validate and ensure package image URL is safe and secure */
function getSafeImageUrl(url?: string | null): string {
  if (!url || typeof url !== 'string') return FALLBACK_PACKAGE_IMAGE;
  const trimmed = url.trim();
  if (
    trimmed.startsWith('https://') ||
    trimmed.startsWith('/') ||
    trimmed.startsWith('http://localhost') ||
    trimmed.startsWith('http://127.0.0.1')
  ) {
    return trimmed;
  }
  return FALLBACK_PACKAGE_IMAGE;
}

/**
 * Optimize an Unsplash URL with exact dimensions, WebP format, and quality.
 */
function getOptimizedUnsplashUrl(url: string, width = 480, height = 208): string {
  const safe = getSafeImageUrl(url);
  if (!safe.includes('images.unsplash.com')) return safe;
  try {
    const parsed = new URL(safe);
    parsed.searchParams.set('auto', 'format');
    parsed.searchParams.set('fit', 'crop');
    parsed.searchParams.set('fm', 'webp');
    parsed.searchParams.set('q', '65');
    parsed.searchParams.set('w', String(width));
    parsed.searchParams.set('h', String(height));
    return parsed.toString();
  } catch {
    return safe;
  }
}

/** Build a responsive srcSet for pre-made package banner cards */
function buildPackageBannerSrcSet(url: string): string | undefined {
  const safe = getSafeImageUrl(url);
  if (!safe.includes('images.unsplash.com')) return undefined;
  try {
    const s360 = `${getOptimizedUnsplashUrl(safe, 360, 155)} 360w`;
    const s480 = `${getOptimizedUnsplashUrl(safe, 480, 208)} 480w`;
    return `${s360}, ${s480}`;
  } catch {
    return undefined;
  }
}

/** Build a responsive srcSet for builder thumbnail items (64px) */
function buildThumbnailSrcSet(url: string): string | undefined {
  const safe = getSafeImageUrl(url);
  if (!safe.includes('images.unsplash.com')) return undefined;
  try {
    const s96 = `${getOptimizedUnsplashUrl(safe, 96, 96)} 96w`;
    const s160 = `${getOptimizedUnsplashUrl(safe, 160, 160)} 160w`;
    return `${s96}, ${s160}`;
  } catch {
    return undefined;
  }
}

export const PackageBuilder: React.FC = () => {
  const { theme } = useTheme();
  const { isAmharic } = useLanguage();
  const { isAuthenticated, openAuthModal } = useUserAuth();
  const isDark = theme === 'design7';

  const [activeTab, setActiveTab] = useState<'premade' | 'builder'>('premade');
  // Catalog is only needed by the custom builder tab — start empty to avoid a CLS-inducing
  // re-render when the API returns 21 items but static PACKAGE_CATALOG has 25 (size mismatch
  // would unconditionally call setCatalog during the CLS measurement window).
  const [catalog, setCatalog] = useState<PackageCatalogItem[]>([]);
  const [preMadePackages, setPreMadePackages] = useState<PreMadePackage[]>(PRE_MADE_PACKAGES);
  // Loading is only gated on preMadePackages — catalog starts empty deliberately
  const loading = preMadePackages.length === 0;
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
    let isMounted = true;
    let controller: AbortController | null = null;

    // Defer API sync until after initial page paint and critical path have completed
    const scheduleSync = () => {
      controller = new AbortController();
      api.getPackagesData({ signal: controller.signal })
        .then(data => {
          if (!isMounted) return;
          if (data?.catalog && data.catalog.length > 0) {
            // Only update if content actually changed (avoids unnecessary re-renders)
            setCatalog(prev => {
              if (prev.length === data.catalog.length) {
                const identical = prev.every((c, i) => data.catalog[i] && c.id === data.catalog[i].id);
                if (identical) return prev;
              }
              return data.catalog;
            });
          }
          if (data?.preMadePackages && data.preMadePackages.length > 0) {
            setPreMadePackages(prev => {
              // Deep equality check: avoid triggering re-render if canonical packages are already rendered
              if (prev.length === data.preMadePackages.length) {
                const identical = prev.every((p, i) => {
                  const incoming = data.preMadePackages[i];
                  return (
                    incoming &&
                    p.id === incoming.id &&
                    p.packagePrice === incoming.packagePrice &&
                    p.availableSlots === incoming.availableSlots &&
                    p.isOutOfStock === incoming.isOutOfStock
                  );
                });
                if (identical) return prev;
              }
              return data.preMadePackages;
            });
          }
        })
        .catch(() => {
          // Gracefully continue using initial in-memory packages
        });
    };

    let timerId: any;
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      timerId = (window as any).requestIdleCallback(scheduleSync, { timeout: 2500 });
    } else {
      timerId = setTimeout(scheduleSync, 1200);
    }

    return () => {
      isMounted = false;
      if (typeof window !== 'undefined' && 'cancelIdleCallback' in window && typeof timerId === 'number') {
        (window as any).cancelIdleCallback(timerId);
      } else {
        clearTimeout(timerId);
      }
      if (controller) controller.abort();
    };
  }, []);

  // Set default package title according to language if empty
  useEffect(() => {
    if (!packageName || packageName === 'My Custom Celebration Package' || packageName === 'የኔ ልዩ የበዓል ጥቅል') {
      setPackageName(isAmharic ? 'የኔ ልዩ የበዓል ጥቅል' : 'My Custom Celebration Package');
    }
  }, [isAmharic]);

  // Category counts and mandatory livestock validation (Cow/Ox or Sheep/Goat)
  const selectedCategories = new Set(selectedItems.map(i => i.category));
  const categoryCount = selectedCategories.size;
  const livestockValidation = validatePackageLivestock(selectedItems);
  const hasLivestock = livestockValidation.hasLivestock;
  const isEligible = categoryCount >= 3 && hasLivestock;
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
    if (!hasLivestock) {
      alert(
        isAmharic
          ? 'ጥቅሉን ለማስቀመጥ ቢያንስ አንድ ሰንጋ በሬ ወይም በግ/ፍየል ማካተት አለብዎት።'
          : 'Your custom package must include at least one Cow/Ox or Sheep/Goat to be saved.'
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
    if (!hasLivestock) {
      alert(
        isAmharic
          ? 'ጥቅሉን ለማዘዝ ቢያንስ አንድ ሰንጋ በሬ ወይም በግ/ፍየል ማካተት አለብዎት።'
          : 'Your custom package must include at least one Cow/Ox or Sheep/Goat to proceed.'
      );
      return;
    }
    if (!isEligible) return;
    setSelectedPreMade(null);
    setIsOrderModalOpen(true);
  };

  return (
    <div className="min-h-screen pb-24">
      {/* Hero Banner */}
      <section className="relative overflow-hidden pt-8 pb-10 sm:pt-12 sm:pb-12 border-b border-black/10 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-500">
              <Sparkles size={14} className="w-3.5 h-3.5 text-amber-500" />
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
                <span>Combine your choice of <strong>Livestock or Prime Meat</strong>, <strong>Wines, Johnnie Walker Whiskies &amp; Honey Tej</strong>, <strong>Organic Fresh Eggs</strong>, and <strong>Celebration Flowers</strong>.</span>
              )}
            </p>

            {/* Benefit Highlights */}
            <div className={`grid grid-cols-3 py-3 border-y max-w-2xl mx-auto ${
              isDark ? 'border-[#4A2C16] divide-[#4A2C16]' : 'border-[#E4D4BC] divide-[#E4D4BC]'
            } divide-x`}>
              <div className="px-2 flex items-center justify-center gap-1.5 text-center">
                <Truck size={14} className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span className="text-[11px] sm:text-xs font-semibold">
                  {isAmharic ? '100% ነፃ ማድረሻ' : 'Free Delivery'}
                </span>
              </div>
              <div className="px-2 flex items-center justify-center gap-1.5 text-center">
                <ShieldCheck size={14} className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span className="text-[11px] sm:text-xs font-semibold">
                  {isAmharic ? '50% ቅድመ-ክፍያ' : '50% Deposit'}
                </span>
              </div>
              <div className="px-2 flex items-center justify-center gap-1.5 text-center">
                <Gift size={14} className="w-3.5 h-3.5 text-amber-500 shrink-0" />
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
                      : 'text-stone-700 dark:text-[#F4E8D0] bg-transparent hover:bg-black/5 dark:hover:bg-[rgba(244,234,217,0.08)]'
                  }`}
                >
                  <Gift size={16} className="w-4 h-4" />
                  <span>{isAmharic ? 'የተዘጋጁ ጥቅሎች' : 'Curated Packages'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('builder')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    activeTab === 'builder'
                      ? 'bg-amber-500 text-black shadow-sm'
                      : 'text-stone-700 dark:text-[#F4E8D0] bg-transparent hover:bg-black/5 dark:hover:bg-[rgba(244,234,217,0.08)]'
                  }`}
                >
                  <Sparkles size={16} className="w-4 h-4" />
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
                type="button"
                onClick={() => setActiveTab('builder')}
                className="flex items-center gap-1.5 text-xs font-bold text-amber-500 hover:underline cursor-pointer"
              >
                <span>{isAmharic ? 'ልዩ ጥቅል ማዘጋጃን ይክፈቱ' : 'Open Custom Builder'}</span>
                <ArrowRight size={14} className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 items-start">
              {preMadePackages.map((pkg, idx) => {
                const isExpanded = expandedPreMadeId === pkg.id;
                // Dynamic LCP optimization: First visible package card gets eager & high priority
                const isFirstVisible = idx === 0;

                return (
                  <AnimatedReveal key={pkg.id} immediate={true} direction="up" delay={0} className="self-start h-fit w-full">
                    <div
                      onTouchStart={() => handleTouchCard(pkg.id)}
                      onTouchEnd={() => handleTouchCard(pkg.id)}
                      className={`self-start h-fit w-full group rounded-2xl border overflow-hidden transition-all duration-300 hover:shadow-lg flex flex-col justify-between select-none ${
                        isDark ? 'bg-[#24170D] border-[#4A2C16]' : 'bg-white border-[#E4D4BC]'
                      }`}
                    >
                      <div>
                        {/* Image Banner - aspect-ratio is the sole height authority, no conflicting h-* classes */}
                        <div className="relative aspect-[480/208] w-full overflow-hidden bg-black/10 shrink-0">
                          <img
                            src={getOptimizedUnsplashUrl(pkg.image, 480, 208)}
                            srcSet={buildPackageBannerSrcSet(pkg.image)}
                            sizes="(max-width: 640px) 360px, (max-width: 1024px) 320px, 280px"
                            alt={pkg.name}
                            width={480}
                            height={208}
                            loading={isFirstVisible ? "eager" : "lazy"}
                            {...(isFirstVisible ? ({ fetchPriority: "high" } as any) : {})}
                            decoding={isFirstVisible ? "sync" : "async"}
                            style={{ aspectRatio: '480 / 208' }}
                            className={`w-full h-full object-cover card-zoom-img will-change-transform transition-transform duration-500 ease-out ${
                              touchedCardId === pkg.id ? 'scale-100' : 'scale-105'
                            } group-hover:scale-100 group-active:scale-100 active:scale-100`}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />

                          <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white flex items-center gap-1 shadow-xs">
                              <Truck size={10} className="w-2.5 h-2.5" /> {isAmharic ? 'ነፃ ማድረሻ' : 'Free Delivery'}
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

                        {/* Description & Included Items */}
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
                            <ChevronDown size={14} className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                          </button>

                          {/* Included Items Minimalist List */}
                          {isExpanded && (
                            <div className="pt-1.5 space-y-1.5 animate-in fade-in duration-150">
                              <div className="text-[10px] font-bold uppercase tracking-wider opacity-60">
                                {isAmharic ? `የተካተቱ ምድቦች (${pkg.categoryCount}):` : `Included Items (${pkg.categoryCount} Categories):`}
                              </div>
                              <div className={`divide-y text-xs ${
                                isDark ? 'divide-[#4A2C16]/50' : 'divide-[#E4D4BC]/60'
                              }`}>
                                {pkg.items.map((item, itemIdx) => (
                                  <div
                                    key={itemIdx}
                                    className="py-1.5 flex items-center justify-between gap-2"
                                  >
                                    <div className="flex items-center gap-2 truncate">
                                      <Check size={12} className="w-3 h-3 text-emerald-500 shrink-0" />
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

                        {/* CTA: min-h stabilises card height whether sold-out or orderable, preventing CLS */}
                        <div className="min-h-[40px] flex flex-col justify-end">
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
                                <Gift size={14} className="w-3.5 h-3.5 shrink-0" />
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
          <Suspense
            fallback={
              <div className="py-20 text-center opacity-80">
                <div className="w-8 h-8 rounded-full border-2 border-amber-500 border-t-transparent animate-spin mx-auto mb-3" />
                <p className="text-xs font-semibold text-amber-500">
                  {isAmharic ? 'ጥቅል ማዘጋጃ በመጫን ላይ...' : 'Loading Custom Package Builder...'}
                </p>
              </div>
            }
          >
            <CustomPackageBuilderTab
              catalog={catalog}
              selectedItems={selectedItems}
              setSelectedItems={setSelectedItems}
              packageName={packageName}
              setPackageName={setPackageName}
              activeCategoryFilter={activeCategoryFilter}
              setActiveCategoryFilter={setActiveCategoryFilter}
              toggleItem={toggleItem}
              handleOrderCustom={handleOrderCustom}
              handleSaveToMyPackages={handleSaveToMyPackages}
              isEligible={isEligible}
              hasLivestock={hasLivestock}
              categoryCount={categoryCount}
              selectedCategories={selectedCategories}
              totalPrice={totalPrice}
              saveSuccessMsg={saveSuccessMsg}
              touchedCardId={touchedCardId}
              handleTouchCard={handleTouchCard}
              isDark={isDark}
              isAmharic={isAmharic}
              getOptimizedUnsplashUrl={getOptimizedUnsplashUrl}
              buildThumbnailSrcSet={buildThumbnailSrcSet}
            />
          </Suspense>
        )}
      </div>

      {/* Package Order Modal */}
      {isOrderModalOpen && (
        <Suspense fallback={null}>
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
        </Suspense>
      )}
    </div>
  );
};
