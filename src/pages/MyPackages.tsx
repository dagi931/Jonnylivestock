import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Link } from 'react-router-dom';
import { SavedPackage } from '../types/package';
import { api } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useUserAuth } from '../context/UserAuthContext';
import { formatPrice, getItemDisplayName } from '../utils/formatters';
const PackageOrderModal = lazy(() =>
  import('../components/modals/PackageOrderModal').then(m => ({ default: m.PackageOrderModal }))
);
import {
  Gift,
  Bookmark,
  Trash2,
  Sparkles,
  Plus
} from 'lucide-react';

export const MyPackages: React.FC = () => {
  const { theme } = useTheme();
  const { isAmharic } = useLanguage();
  const { isAuthenticated, openAuthModal } = useUserAuth();
  const isDark = theme === 'design7';

  const [savedPackages, setSavedPackages] = useState<SavedPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPackageToOrder, setSelectedPackageToOrder] = useState<SavedPackage | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  const fetchSaved = async () => {
    setLoading(true);
    try {
      const data = await api.getSavedPackages();
      setSavedPackages(data);
    } catch (err) {
      console.error('Failed to fetch saved packages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchSaved();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const handleDelete = async (id: string) => {
    try {
      const res = await api.deleteSavedPackage(id);
      if (res.success) {
        setSavedPackages(savedPackages.filter(p => p.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete package:', err);
    }
  };

  const handleOrder = (pkg: SavedPackage) => {
    setSelectedPackageToOrder(pkg);
    setIsOrderModalOpen(true);
  };

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <section className="py-10 border-b border-black/10 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/15 border border-amber-500/30 text-amber-500 mb-2">
                <Bookmark className="w-3.5 h-3.5" />
                <span>{isAmharic ? 'የተቀመጡ ስብስቦች' : 'My Saved Collections'}</span>
              </div>
              <h1 className="font-serif font-bold text-3xl sm:text-4xl tracking-tight">
                {isAmharic ? 'የተቀመጡ የበዓል ጥቅሎች' : 'My Saved Packages'}
              </h1>
              <p className="text-xs sm:text-sm opacity-75 mt-1">
                {isAmharic
                  ? 'የቀንድ ከብት፣ ወይን፣ እንቁላልና አበቦች ያካተቱ ያዘጋጇቸው ልዩ ጥቅሎች ለቀጥታ ማዘዣ ተዘጋጅተዋል'
                  : 'Your customized combinations of livestock/meat, wine, eggs, and flowers ready for instant reservation'}
              </p>
            </div>

            <Link
              to="/packages"
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs sm:text-sm transition-all shadow-lg shadow-amber-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>{isAmharic ? 'አዲስ ጥቅል አዘጋጅ' : 'Create New Package'}</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {!isAuthenticated ? (
          <div
            className={`p-10 rounded-3xl border text-center max-w-lg mx-auto space-y-4 ${
              isDark ? 'bg-[#24170D] border-[#4A2C16]' : 'bg-white border-[#E4D4BC]'
            }`}
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-500 flex items-center justify-center mx-auto">
              <Bookmark className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-bold text-xl">
              {isAmharic ? 'የተቀመጡ ጥቅሎችን ለማየት ይግቡ' : 'Sign In to View Saved Packages'}
            </h3>
            <p className="text-xs opacity-75">
              {isAmharic
                ? 'ያዘጋጇቸውን ልዩ የበዓል ጥቅሎች በማንኛውም ስልክ ወይም ኮምፒውተር ለማየትና በአንድ ጠቅታ ለማዘዝ ይግቡ።'
                : 'Access your personalized celebration hampers across your devices and order with a single click.'}
            </p>
            <button
              onClick={() => openAuthModal('login')}
              className="px-6 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs transition-all shadow-md cursor-pointer"
            >
              {isAmharic ? 'ይግቡ' : 'Sign In'}
            </button>
          </div>
        ) : loading ? (
          <div className="text-center py-20 opacity-80 animate-in fade-in duration-200">
            <div className="w-8 h-8 rounded-full border-2 border-amber-500 border-t-transparent animate-spin mx-auto mb-3" />
            <p className="text-xs font-semibold text-amber-500">
              {isAmharic ? 'በመጫን ላይ...' : 'Loading...'}
            </p>
          </div>
        ) : savedPackages.length === 0 ? (
          <div
            className={`p-12 rounded-3xl border text-center max-w-lg mx-auto space-y-4 ${
              isDark ? 'bg-[#24170D] border-[#4A2C16]' : 'bg-white border-[#E4D4BC]'
            }`}
          >
            <div className="w-14 h-14 rounded-2xl bg-amber-500/15 text-amber-500 flex items-center justify-center mx-auto">
              <Gift className="w-7 h-7" />
            </div>
            <h3 className="font-serif font-bold text-xl">
              {isAmharic ? 'እስካሁን ምንም የተቀመጠ ጥቅል የለም' : 'No Saved Packages Yet'}
            </h3>
            <p className="text-xs opacity-75 leading-relaxed">
              {isAmharic
                ? 'የጥቅል ማዘጋጃውን በመጠቀም የራስዎን የበዓል ጥቅል ያዘጋጁ እና ለመጪው በዓላት እዚህ ያስቀምጡ!'
                : 'Use our interactive package builder to craft your ideal celebration hamper and save it here for upcoming holidays!'}
            </p>
            <Link
              to="/packages"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs transition-all shadow-lg"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isAmharic ? 'የጥቅል ማዘጋጃን ክፈት' : 'Open Package Builder'}</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedPackages.map((pkg) => (
              <div
                key={pkg.id}
                className={`rounded-3xl border overflow-hidden flex flex-col justify-between transition-all duration-300 hover:shadow-xl ${
                  isDark ? 'bg-[#24170D] border-[#4A2C16]' : 'bg-white border-[#E4D4BC]'
                }`}
              >
                <div className="p-6 space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-serif font-bold text-lg">{pkg.name}</h3>
                      <div className="text-[11px] opacity-60">
                        {isAmharic ? 'የተቀመጠው በ' : 'Saved on'} {new Date(pkg.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(pkg.id)}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-red-400 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                      title={isAmharic ? 'ጥቅሉን ሰርዝ' : 'Delete package'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Items in Saved Package */}
                  <div className="space-y-2">
                    <div className="text-[11px] font-bold uppercase tracking-wider opacity-60">
                      {isAmharic ? `${pkg.items.length} እቃዎችን ይዟል:` : `Contains ${pkg.items.length} items:`}
                    </div>
                    <div className="space-y-1.5">
                      {pkg.items.map((item, idx) => (
                        <div
                          key={idx}
                          className={`p-2 rounded-xl border flex items-center justify-between text-xs ${
                            isDark ? 'bg-[#1D130A] border-[#4A2C16]' : 'bg-[#FAF7F0] border-[#E4D4BC]'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <img src={item.image} alt={item.name} className="w-6 h-6 rounded object-cover shrink-0" />
                            <span className="truncate font-medium">{getItemDisplayName(item, isAmharic)}</span>
                          </div>
                          <span className="font-mono font-bold text-amber-500 shrink-0">{formatPrice(item.price)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div
                  className={`p-5 border-t space-y-3 ${
                    isDark ? 'bg-[#1D130A]/60 border-[#4A2C16]' : 'bg-[#FAF7F0]/60 border-[#E4D4BC]'
                  }`}
                >
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs opacity-70">{isAmharic ? 'ጠቅላላ ዋጋ:' : 'Total Value:'}</span>
                    <span className="font-serif font-bold text-xl text-amber-500">{formatPrice(pkg.totalPrice)}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleOrder(pkg)}
                    className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Gift className="w-3.5 h-3.5" />
                    <span>{isAmharic ? 'ይዘዙ / በ50% ይያዙ' : 'Order / 50% Reserve Now'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Package Order Modal */}
      {selectedPackageToOrder && isOrderModalOpen && (
        <Suspense fallback={null}>
          <PackageOrderModal
            isOpen={isOrderModalOpen}
            onClose={() => {
              setIsOrderModalOpen(false);
              setSelectedPackageToOrder(null);
            }}
            customPackage={{
              name: selectedPackageToOrder.name,
              items: selectedPackageToOrder.items,
              totalPrice: selectedPackageToOrder.totalPrice,
              categoriesCount: new Set(selectedPackageToOrder.items.map(i => i.category)).size
            }}
          />
        </Suspense>
      )}
    </div>
  );
};
