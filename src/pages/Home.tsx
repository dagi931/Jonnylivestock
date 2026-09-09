import React, { useState, useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Hero } from '../components/home/Hero';
import { TrustSection } from '../components/home/TrustSection';
import { CelebrationPackagesSection } from '../components/home/CelebrationPackagesSection';
import { MeatByKgPromoSection } from '../components/home/MeatByKgPromoSection';
import { AnimalCard } from '../components/common/AnimalCard';
import { AnimatedReveal } from '../components/common/AnimatedReveal';
import { getFeaturedAnimals } from '../data/animals';
import { ServicesOverview } from '../components/home/ServicesOverview';
import { HowItWorks } from '../components/home/HowItWorks';
import { CTASection } from '../components/home/CTASection';
import { useAnimals } from '../hooks/useAnimals';
import { ArrowRight, CheckCircle2, X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

export const Home: React.FC = () => {
  const { theme } = useTheme();
  const { t, isAmharic } = useLanguage();
  const location = useLocation();
  const isDark = theme === 'design7';
  const [expandedAnimalId, setExpandedAnimalId] = useState<string | null>(null);

  const { animals: liveAnimals } = useAnimals();

  const [showAccountNotice, setShowAccountNotice] = useState(() => {
    return Boolean((location.state as any)?.accountCreated);
  });
  const newUserName = (location.state as any)?.userName;

  useEffect(() => {
    if ((location.state as any)?.accountCreated) {
      setShowAccountNotice(true);
      const timer = setTimeout(() => {
        setShowAccountNotice(false);
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  const featuredSheep = useMemo(() => {
    const fromLive = liveAnimals.filter((a) => a.type === 'sheep' && a.featured);
    return fromLive.length > 0 ? fromLive : getFeaturedAnimals('sheep');
  }, [liveAnimals]);

  const featuredGoats = useMemo(() => {
    const fromLive = liveAnimals.filter((a) => a.type === 'goat' && a.featured);
    return fromLive.length > 0 ? fromLive : getFeaturedAnimals('goat');
  }, [liveAnimals]);

  const featuredCows = useMemo(() => {
    const fromLive = liveAnimals.filter((a) => a.type === 'cow' && a.featured);
    return fromLive.length > 0 ? fromLive : getFeaturedAnimals('cow');
  }, [liveAnimals]);

  return (
    <div className="min-h-screen">
      {/* Account Creation Success Banner (Without emojis) */}
      {showAccountNotice && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="p-4 rounded-2xl border bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-between gap-3 shadow-md animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-xs sm:text-sm">
                  {isAmharic ? 'መለያዎ በተሳካ ሁኔታ ተፈጥሯል' : 'Account Created Successfully'}
                </h4>
                <p className="text-[11px] sm:text-xs opacity-90 mt-0.5 leading-relaxed truncate sm:whitespace-normal">
                  {isAmharic
                    ? `እንኳን ወደ ጆኒ የቀንድ ከብት አቅራቢ በደህና መጡ ${newUserName ? newUserName + ' ' : ''}! አሁን ከብቶችን እና የበዓል ጥቅሎችን በቀላሉ መያዝ እና ማዘዝ ይችላሉ።`
                    : `Welcome to Jonny Livestock${newUserName ? ', ' + newUserName : ''}! Your account is now active. You can now reserve livestock and customize celebration packages.`}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowAccountNotice(false)}
              className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 opacity-75 hover:opacity-100 transition-opacity cursor-pointer shrink-0"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Hero Banner */}
      <Hero />

      {/* Trust & Value Points */}
      <TrustSection />

      {/* Celebration & Holiday Packages Section */}
      <CelebrationPackagesSection />

      {/* Featured Sheep Section */}
      <section className="py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedReveal direction="up" delay={50}>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-3">
              <div>
                <span
                  className={`text-xs font-semibold uppercase tracking-wider ${
                    isDark ? 'text-[#C58A3A]' : 'text-[#B8792F]'
                  }`}
                >
                  {t.common.selectedLivestock}
                </span>
                <h2
                  className={`font-serif font-bold text-2xl sm:text-3xl mt-0.5 ${
                    isDark ? 'text-[#F4E8D0]' : 'text-[#241A12]'
                  }`}
                >
                  {isAmharic ? 'የተመረጡ በጎች' : 'Featured Sheep'}
                </h2>
              </div>

              <Link
                to="/sheep"
                className={`inline-flex items-center gap-1.5 font-semibold text-xs sm:text-sm transition-colors group ${
                  isDark ? 'text-[#E0B15A] hover:text-[#F4E8D0]' : 'text-[#B8792F] hover:text-[#241A12]'
                }`}
              >
                <span>{t.common.viewAllSheep}</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </AnimatedReveal>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-6 items-start">
            {featuredSheep.slice(0, 3).map((sheep, idx) => (
              <AnimalCard
                key={sheep.id}
                animal={sheep}
                animationIndex={idx}
                isExpanded={expandedAnimalId === sheep.id}
                onToggleExpand={() => setExpandedAnimalId((prev) => (prev === sheep.id ? null : sheep.id))}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Goats Section */}
      <section
        className={`py-8 sm:py-12 ${
          isDark ? 'bg-[#1F150A]' : 'bg-[#F1E8D8]/40 border-y border-[#E4D4BC]/40'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedReveal direction="up" delay={50}>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-3">
              <div>
                <span
                  className={`text-xs font-semibold uppercase tracking-wider ${
                    isDark ? 'text-[#C58A3A]' : 'text-[#B8792F]'
                  }`}
                >
                  {t.common.selectedLivestock}
                </span>
                <h2
                  className={`font-serif font-bold text-2xl sm:text-3xl mt-0.5 ${
                    isDark ? 'text-[#F4E8D0]' : 'text-[#241A12]'
                  }`}
                >
                  {isAmharic ? 'የተመረጡ ፍየሎች' : 'Featured Goats'}
                </h2>
              </div>

              <Link
                to="/goats"
                className={`inline-flex items-center gap-1.5 font-semibold text-xs sm:text-sm transition-colors group ${
                  isDark ? 'text-[#E0B15A] hover:text-[#F4E8D0]' : 'text-[#B8792F] hover:text-[#241A12]'
                }`}
              >
                <span>{t.common.viewAllGoats}</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </AnimatedReveal>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-6 items-start">
            {featuredGoats.slice(0, 3).map((goat, idx) => (
              <AnimalCard
                key={goat.id}
                animal={goat}
                animationIndex={idx}
                isExpanded={expandedAnimalId === goat.id}
                onToggleExpand={() => setExpandedAnimalId((prev) => (prev === goat.id ? null : goat.id))}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Cows Section */}
      <section className="py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedReveal direction="up" delay={50}>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-3">
              <div>
                <span
                  className={`text-xs font-semibold uppercase tracking-wider ${
                    isDark ? 'text-[#C58A3A]' : 'text-[#B8792F]'
                  }`}
                >
                  {t.common.selectedLivestock}
                </span>
                <h2
                  className={`font-serif font-bold text-2xl sm:text-3xl mt-0.5 ${
                    isDark ? 'text-[#F4E8D0]' : 'text-[#241A12]'
                  }`}
                >
                  {isAmharic ? 'የተመረጡ ከብቶችና ሰንጋዎች' : 'Featured Cows & Cattle'}
                </h2>
              </div>

              <Link
                to="/cows"
                className={`inline-flex items-center gap-1.5 font-semibold text-xs sm:text-sm transition-colors group ${
                  isDark ? 'text-[#E0B15A] hover:text-[#F4E8D0]' : 'text-[#B8792F] hover:text-[#241A12]'
                }`}
              >
                <span>{t.common.viewAllCows}</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </AnimatedReveal>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-6 items-start">
            {featuredCows.slice(0, 3).map((cow, idx) => (
              <AnimalCard
                key={cow.id}
                animal={cow}
                animationIndex={idx}
                isExpanded={expandedAnimalId === cow.id}
                onToggleExpand={() => setExpandedAnimalId((prev) => (prev === cow.id ? null : cow.id))}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Do you want to buy meat in KG? Section */}
      <MeatByKgPromoSection />

      {/* Farm to Table Additional Services Overview */}
      <ServicesOverview />

      {/* How It Works (3 Steps) */}
      <HowItWorks />

      {/* Final Call to Action */}
      <CTASection />
    </div>
  );
};
