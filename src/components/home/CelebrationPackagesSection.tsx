import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PreMadePackage } from '../../types/package';
import { api } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { formatPrice } from '../../utils/formatters';
import { PackageOrderModal } from '../modals/PackageOrderModal';
import {
  Gift,
  Sparkles,
  Truck,
  ShieldCheck,
  ArrowRight,
  Check,
  ChevronDown
} from 'lucide-react';

export const CelebrationPackagesSection: React.FC = () => {
  const { theme } = useTheme();
  const { isAmharic } = useLanguage();
  const isDark = theme === 'design7';

  const [packages, setPackages] = useState<PreMadePackage[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<PreMadePackage | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedPkgId, setExpandedPkgId] = useState<string | null>(null);

  useEffect(() => {
    const loadPackages = async () => {
      try {
        const data = await api.getPackagesData();
        setPackages(data.preMadePackages || []);
      } catch (e) {
        console.error('Failed to load packages in home:', e);
      }
    };
    loadPackages();
  }, []);

  const handleOrder = (pkg: PreMadePackage) => {
    setSelectedPackage(pkg);
    setIsModalOpen(true);
  };

  return (
    <section
      className={`py-12 sm:py-16 border-y ${
        isDark
          ? 'bg-gradient-to-b from-[#1F150A] via-[#24170D] to-[#1F150A] border-[#4A2C16]'
          : 'bg-gradient-to-b from-[#FAF7F0] via-[#F6EFE2] to-[#FAF7F0] border-[#E4D4BC]'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider mb-1 ${
                isDark ? 'text-[#E0B15A]' : 'text-[#B8792F]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isAmharic ? 'የበዓልና የደስታ ልዩ ጥቅሎች' : 'Celebration & Holiday Packages'}</span>
            </span>
            <h2 className="font-serif font-bold text-2xl sm:text-4xl mt-0.5">
              {isAmharic ? 'የበዓል ድግስና የስጦታ ሙሉ ጥቅሎች' : 'All-in-One Festive Hampers & Bundles'}
            </h2>
            <p className="text-xs sm:text-sm opacity-75 mt-1 max-w-xl">
              Complete celebration packages with livestock/meat, authentic wines/tej, fresh eggs, and flowers with <strong>Free Delivery</strong>.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/packages"
              className="inline-flex items-center gap-1.5 font-bold text-xs sm:text-sm text-amber-500 hover:text-amber-400 transition-colors group"
            >
              <span>{isAmharic ? 'ሁሉንም ጥቅሎች ይመልከቱ' : 'View All & Custom Builder'}</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* 3 Prominent Benefit Highlights: 1 Row on Mobile (grid-cols-3), Minimized & Less Content */}
        <div className="grid grid-cols-3 gap-1.5 sm:gap-3 mb-6 sm:mb-8">
          <div
            className={`p-2 sm:p-3.5 rounded-xl sm:rounded-2xl border flex flex-col items-center sm:flex-row sm:items-center text-center sm:text-left gap-1 sm:gap-3 justify-center ${
              isDark ? 'bg-[#1D130A]/80 border-[#4A2C16]' : 'bg-white border-[#E4D4BC]'
            }`}
          >
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center shrink-0">
              <Truck className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
            </div>
            <div>
              <div className="font-bold text-[10.5px] sm:text-xs leading-tight sm:leading-normal">
                {isAmharic ? '100% ነፃ ማድረሻ' : '100% Free Doorstep Delivery'}
              </div>
              <div className="hidden sm:block text-[11px] opacity-70">
                {isAmharic ? 'በአዲስ አበባና ቢሾፍቱ ዙሪያ ላሉ ጥቅሎች' : 'On all celebration packages across Addis & Bishoftu'}
              </div>
            </div>
          </div>

          <div
            className={`p-2 sm:p-3.5 rounded-xl sm:rounded-2xl border flex flex-col items-center sm:flex-row sm:items-center text-center sm:text-left gap-1 sm:gap-3 justify-center ${
              isDark ? 'bg-[#1D130A]/80 border-[#4A2C16]' : 'bg-white border-[#E4D4BC]'
            }`}
          >
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
            </div>
            <div>
              <div className="font-bold text-[10.5px] sm:text-xs leading-tight sm:leading-normal">
                {isAmharic ? '50% ቅድመ-ክፍያ' : '50% Reservation Guarantee'}
              </div>
              <div className="hidden sm:block text-[11px] opacity-70">
                {isAmharic ? 'ግማሹን ከፍለው ያስይዙ፣ ቀሪውን ከመረከብዎ በፊት ይጨርሱ' : 'Pay half now to lock items, settle rest before delivery'}
              </div>
            </div>
          </div>

          <div
            className={`p-2 sm:p-3.5 rounded-xl sm:rounded-2xl border flex flex-col items-center sm:flex-row sm:items-center text-center sm:text-left gap-1 sm:gap-3 justify-center ${
              isDark ? 'bg-[#1D130A]/80 border-[#4A2C16]' : 'bg-white border-[#E4D4BC]'
            }`}
          >
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center shrink-0">
              <Gift className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
            </div>
            <div>
              <div className="font-bold text-[10.5px] sm:text-xs leading-tight sm:leading-normal">
                {isAmharic ? 'የራስዎን ጥቅል ያዘጋጁ' : 'Build Your Own Combination'}
              </div>
              <div className="hidden sm:block text-[11px] opacity-70">
                {isAmharic ? 'ከ3 ወይም ከዚያ በላይ ምድቦች መርጠው ያዘጋጁ' : 'Pick 3 or more categories for customized sets'}
              </div>
            </div>
          </div>
        </div>

        {/* Packages Cards Grid: 2 Cards per Row on Mobile (grid-cols-2), Compact with Show Details */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-5">
          {packages.slice(0, 4).map((pkg) => {
            const isExpanded = expandedPkgId === pkg.id;
            return (
              <div
                key={pkg.id}
                className={`rounded-2xl sm:rounded-3xl border overflow-hidden flex flex-col justify-between transition-all duration-300 hover:shadow-xl group ${
                  isDark ? 'bg-[#1D130A] border-[#4A2C16]' : 'bg-white border-[#E4D4BC]'
                }`}
              >
                <div>
                  {/* Compact Image */}
                  <div className="relative h-28 sm:h-44 w-full overflow-hidden bg-black/10">
                    <img
                      src={pkg.image}
                      alt={pkg.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    <div className="absolute bottom-1.5 left-1.5 right-1.5 sm:bottom-3 sm:left-3 sm:right-3 text-white">
                      <h3 className="font-serif font-bold text-xs sm:text-base line-clamp-1">{pkg.name}</h3>
                      <div className="text-[9px] sm:text-[11px] opacity-85 flex items-center gap-1 text-emerald-400 font-semibold truncate">
                        <Truck className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" />
                        <span className="truncate">Free Delivery • {pkg.categoryCount} Cat.</span>
                      </div>
                    </div>
                  </div>

                  {/* Compact Content */}
                  <div className="p-2 sm:p-4 space-y-1.5 sm:space-y-3">
                    <p className="text-[9.5px] sm:text-[11px] opacity-75 line-clamp-1 sm:line-clamp-2 leading-tight">
                      {pkg.description}
                    </p>

                    {/* Interactive "Show details / Show more" Toggle */}
                    <button
                      type="button"
                      onClick={() => setExpandedPkgId(isExpanded ? null : pkg.id)}
                      className="w-full text-[9.5px] sm:text-xs font-semibold flex items-center justify-between py-1 px-1 rounded-md hover:bg-black/5 dark:hover:bg-white/5 opacity-80 hover:opacity-100 transition-colors border border-black/5 dark:border-white/5"
                    >
                      <span>{isExpanded ? (isAmharic ? 'ዝርዝር አሳንስ' : 'Hide details') : (isAmharic ? 'የጥቅሉ ዝርዝር' : 'Show details')}</span>
                      <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Expandable Items List */}
                    {isExpanded && (
                      <div className="space-y-1 pt-1 animate-in fade-in duration-150">
                        <div className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider opacity-60">Includes:</div>
                        <div className="space-y-1">
                          {pkg.items.map((item, i) => (
                            <div key={i} className="text-[10px] sm:text-xs flex items-center gap-1 opacity-85 truncate">
                              <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-500 shrink-0" />
                              <span className="truncate">{item.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Price & Action */}
                <div
                  className={`p-2 sm:p-4 border-t space-y-1.5 sm:space-y-2.5 ${
                    isDark ? 'bg-[#24170D] border-[#4A2C16]' : 'bg-[#FAF7F0] border-[#E4D4BC]'
                  }`}
                >
                  <div className="flex justify-between items-baseline gap-1">
                    <div className="min-w-0">
                      <span className="text-[9px] line-through opacity-50 font-mono mr-1">
                        {formatPrice(pkg.originalPrice)}
                      </span>
                      <div className="font-serif font-bold text-xs sm:text-lg text-amber-500 truncate">
                        {formatPrice(pkg.packagePrice)}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-[8.5px] sm:text-[10px] text-emerald-500 font-bold">
                        50% Deposit:
                      </div>
                      <div className="font-mono font-bold text-[10px] sm:text-xs text-emerald-500">
                        {formatPrice(pkg.packagePrice * 0.5)}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleOrder(pkg)}
                    className="w-full py-1.5 sm:py-2.5 rounded-lg sm:rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-bold text-[10px] sm:text-xs transition-all shadow-md flex items-center justify-center gap-1"
                  >
                    <Gift className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    <span>Order / 50% Reserve</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Banner Card: "Want to customize your own bundle?" */}
        <div
          className={`mt-8 p-6 rounded-3xl border flex flex-col sm:flex-row items-center justify-between gap-4 ${
            isDark
              ? 'bg-gradient-to-r from-[#2A1A0D] to-[#1D130A] border-[#4A2C16]'
              : 'bg-gradient-to-r from-amber-50 to-[#FAF7F0] border-[#E4D4BC]'
          }`}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-500 border border-amber-500/30 flex items-center justify-center shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-lg">Prefer to build your own celebration hamper?</h4>
              <p className="text-xs opacity-75">
                Pick your specific weight of meat, choice of vintage wine/tej, egg crates, and fresh flower bouquets.
              </p>
            </div>
          </div>

          <Link
            to="/packages"
            className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs sm:text-sm transition-all shadow-lg shrink-0 flex items-center gap-2"
          >
            <span>Launch Package Builder</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Package Order Modal */}
      <PackageOrderModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedPackage(null);
        }}
        packageItem={selectedPackage}
      />
    </section>
  );
};
