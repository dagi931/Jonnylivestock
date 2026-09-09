import React from 'react';
import { Link } from 'react-router-dom';
import { business } from '../config/business';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { ShieldCheck, MapPin, Award, CheckCircle2, Truck, Sparkles } from 'lucide-react';
import { useInView } from '../hooks/useInView';
import { FarmMap } from '../components/common/FarmMap';

export const About: React.FC = () => {
  const { theme } = useTheme();
  const { t, isAmharic } = useLanguage();
  const isDark = theme === 'design7';
  const { ref: mapRef, isInView: isMapInView } = useInView({ rootMargin: '0px' });

  return (
    <div className="min-h-screen py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Hero Section (Exact Pixel-Matched Layout) */}
        <div className="max-w-4xl mb-12 sm:mb-14">
          {/* Top Badge Pill */}
          <div
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider border mb-4 ${
              isDark
                ? 'border-[#C58A3A]/40 bg-[#2A1A0D]/70 text-[#E0B15A]'
                : 'border-[#B8792F]/40 bg-[#F1E8D8]/70 text-[#B8792F]'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>{t.aboutPage.badge}</span>
          </div>

          {/* Main Title Heading */}
          <h1
            className={`font-serif font-bold text-3xl sm:text-5xl lg:text-[52px] leading-[1.14] tracking-tight ${
              isDark ? 'text-[#F4E8D0]' : 'text-[#241A12]'
            }`}
          >
            {isAmharic ? (
              t.aboutPage.title
            ) : (
              <>
                <span className="block">Single-Seller Quality Sheep,</span>
                <span className="block">Direct Supplier &amp;</span>
                <span className="block">Meat Services</span>
              </>
            )}
          </h1>

          {/* Description Lead */}
          <p
            className={`mt-4 text-sm sm:text-base leading-relaxed max-w-3xl ${
              isDark ? 'text-[#D8C5A8]' : 'text-[#746556]'
            }`}
          >
            <strong className={`font-bold ${isDark ? 'text-[#F4E8D0]' : 'text-[#241A12]'}`}>
              {business.name}
            </strong>{' '}
            {t.aboutPage.heroDesc}
          </p>

          {/* Credibility Pill Badges */}
          <div className="mt-6 flex flex-wrap items-center gap-2 sm:gap-3">
            <div
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-normal ${
                isDark
                  ? 'border-[#4A2C16] bg-[#2A1A0D]/80 text-[#D8C5A8]'
                  : 'border-[#E4D4BC] bg-[#F1E8D8]/80 text-[#746556]'
              }`}
            >
              <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>{business.location}</span>
            </div>

            <div
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-normal ${
                isDark
                  ? 'border-[#4A2C16] bg-[#2A1A0D]/80 text-[#D8C5A8]'
                  : 'border-[#E4D4BC] bg-[#F1E8D8]/80 text-[#746556]'
              }`}
            >
              <Award className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>{isAmharic ? 'የቀጥታ አቅራቢ ዋጋ' : 'Single-Seller Direct Price'}</span>
            </div>

            <div
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-normal ${
                isDark
                  ? 'border-[#4A2C16] bg-[#2A1A0D]/80 text-[#D8C5A8]'
                  : 'border-[#E4D4BC] bg-[#F1E8D8]/80 text-[#746556]'
              }`}
            >
              <Truck className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>{isAmharic ? 'የማድረስና የዕርድ አገልግሎት' : 'Delivery & Sanitary Prep'}</span>
            </div>
          </div>
        </div>

        {/* 2-Column Story Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-center mb-12">
          <div className="relative rounded-3xl overflow-hidden border shadow-lg" style={{ borderColor: isDark ? '#4A2C16' : '#E4D4BC' }}>
            <img
              src="/about-farm.jpg"
              alt="Jonny Livestock - Authentic livestock pastoral herder and healthy cattle"
              loading="eager"
              fetchPriority="high"
              decoding="sync"
              className="w-full h-auto object-contain block will-change-transform"
            />
          </div>

          <div className="space-y-4">
            <h2
              className={`font-serif font-bold text-2xl sm:text-3xl ${
                isDark ? 'text-[#F4E8D0]' : 'text-[#241A12]'
              }`}
            >
              {t.aboutPage.differenceTitle}
            </h2>
            <p
              className={`text-xs sm:text-sm leading-relaxed ${
                isDark ? 'text-[#D8C5A8]' : 'text-[#746556]'
              }`}
            >
              {t.aboutPage.differenceDesc}
            </p>

            <div className="space-y-2.5 pt-1">
              {[
                { title: t.aboutPage.point1Title, desc: t.aboutPage.point1Desc },
                { title: t.aboutPage.point2Title, desc: t.aboutPage.point2Desc },
                { title: t.aboutPage.point3Title, desc: t.aboutPage.point3Desc },
                { title: t.aboutPage.point4Title, desc: t.aboutPage.point4Desc }
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-2.5">
                  <CheckCircle2 className={`w-4 h-4 mt-0.5 shrink-0 ${isDark ? 'text-[#C58A3A]' : 'text-[#B8792F]'}`} />
                  <div>
                    <strong className={`block text-xs sm:text-sm ${isDark ? 'text-[#F4E8D0]' : 'text-[#241A12]'}`}>
                      {item.title}
                    </strong>
                    <span className={`text-xs ${isDark ? 'text-[#D8C5A8]/80' : 'text-[#746556]/90'}`}>
                      {item.desc}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 3 Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div
            className={`p-6 rounded-3xl border transition-all ${
              isDark ? 'bg-[#2A1A0D] border-[#4A2C16] shadow-rustic' : 'bg-[#F1E8D8] border-[#E4D4BC] shadow-premium'
            }`}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 bg-[#1B1208] text-[#C58A3A] border border-[#4A2C16]">
              <Award className="w-5 h-5" />
            </div>
            <h3 className={`font-serif font-bold text-lg mb-1.5 ${isDark ? 'text-[#F4E8D0]' : 'text-[#241A12]'}`}>
              {t.aboutPage.sheepCardTitle}
            </h3>
            <p className={`text-xs sm:text-sm leading-relaxed mb-3 ${isDark ? 'text-[#D8C5A8]' : 'text-[#746556]'}`}>
              {t.aboutPage.sheepCardDesc}
            </p>
            <Link to="/sheep" className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-[#E0B15A]' : 'text-[#B8792F]'} hover:underline`}>
              {t.common.browseSheep} →
            </Link>
          </div>

          <div
            className={`p-6 rounded-3xl border transition-all ${
              isDark ? 'bg-[#2A1A0D] border-[#4A2C16] shadow-rustic' : 'bg-[#F1E8D8] border-[#E4D4BC] shadow-premium'
            }`}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 bg-[#1B1208] text-[#C58A3A] border border-[#4A2C16]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className={`font-serif font-bold text-lg mb-1.5 ${isDark ? 'text-[#F4E8D0]' : 'text-[#241A12]'}`}>
              {t.aboutPage.goatCardTitle}
            </h3>
            <p className={`text-xs sm:text-sm leading-relaxed mb-3 ${isDark ? 'text-[#D8C5A8]' : 'text-[#746556]'}`}>
              {t.aboutPage.goatCardDesc}
            </p>
            <Link to="/goats" className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-[#E0B15A]' : 'text-[#B8792F]'} hover:underline`}>
              {t.common.browseGoats} →
            </Link>
          </div>

          <div
            className={`p-6 rounded-3xl border transition-all ${
              isDark ? 'bg-[#2A1A0D] border-[#4A2C16] shadow-rustic' : 'bg-[#F1E8D8] border-[#E4D4BC] shadow-premium'
            }`}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 bg-[#1B1208] text-[#C58A3A] border border-[#4A2C16]">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className={`font-serif font-bold text-lg mb-1.5 ${isDark ? 'text-[#F4E8D0]' : 'text-[#241A12]'}`}>
              {t.aboutPage.cowCardTitle}
            </h3>
            <p className={`text-xs sm:text-sm leading-relaxed mb-3 ${isDark ? 'text-[#D8C5A8]' : 'text-[#746556]'}`}>
              {t.aboutPage.cowCardDesc}
            </p>
            <Link to="/cows" className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-[#E0B15A]' : 'text-[#B8792F]'} hover:underline`}>
              {t.common.browseCows} →
            </Link>
          </div>
        </div>

        {/* Why Choose Us Section */}
        <div
          className={`p-8 sm:p-10 rounded-3xl border mb-12 ${
            isDark ? 'bg-[#2A1A0D] border-[#4A2C16]' : 'bg-[#F1E8D8] border-[#E4D4BC]'
          }`}
        >
          <div className="max-w-3xl mb-8">
            <span
              className={`text-xs font-semibold uppercase tracking-wider ${
                isDark ? 'text-[#C58A3A]' : 'text-[#B8792F]'
              }`}
            >
              {t.trust.badge}
            </span>
            <h2
              className={`font-serif font-bold text-2xl sm:text-3xl mt-1 mb-2.5 ${
                isDark ? 'text-[#F4E8D0]' : 'text-[#241A12]'
              }`}
            >
              {t.aboutPage.whyChooseTitle}
            </h2>
            <p
              className={`text-xs sm:text-sm leading-relaxed ${
                isDark ? 'text-[#D8C5A8]' : 'text-[#746556]'
              }`}
            >
              {t.aboutPage.whyChooseDesc}
            </p>
          </div>

          <div className="grid grid-cols-4 gap-1.5 sm:gap-5">
            <div className={`p-2 sm:p-4 rounded-xl sm:rounded-2xl border flex flex-col items-center sm:items-start text-center sm:text-left ${isDark ? 'bg-[#1B1208] border-[#4A2C16]' : 'bg-[#FAF7F0] border-[#E4D4BC]'}`}>
              <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 mb-1 sm:mb-2 shrink-0" />
              <h3 className="font-serif font-bold text-[10.5px] sm:text-sm mb-0.5 sm:mb-1 leading-tight">{t.aboutPage.trust1Title}</h3>
              <p className="hidden sm:block text-xs opacity-80 leading-relaxed">
                {t.aboutPage.trust1Desc}
              </p>
            </div>

            <div className={`p-2 sm:p-4 rounded-xl sm:rounded-2xl border flex flex-col items-center sm:items-start text-center sm:text-left ${isDark ? 'bg-[#1B1208] border-[#4A2C16]' : 'bg-[#FAF7F0] border-[#E4D4BC]'}`}>
              <Award className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 mb-1 sm:mb-2 shrink-0" />
              <h3 className="font-serif font-bold text-[10.5px] sm:text-sm mb-0.5 sm:mb-1 leading-tight">{t.aboutPage.trust2Title}</h3>
              <p className="hidden sm:block text-xs opacity-80 leading-relaxed">
                {t.aboutPage.trust2Desc}
              </p>
            </div>

            <div className={`p-2 sm:p-4 rounded-xl sm:rounded-2xl border flex flex-col items-center sm:items-start text-center sm:text-left ${isDark ? 'bg-[#1B1208] border-[#4A2C16]' : 'bg-[#FAF7F0] border-[#E4D4BC]'}`}>
              <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 mb-1 sm:mb-2 shrink-0" />
              <h3 className="font-serif font-bold text-[10.5px] sm:text-sm mb-0.5 sm:mb-1 leading-tight">{t.aboutPage.trust3Title}</h3>
              <p className="hidden sm:block text-xs opacity-80 leading-relaxed">
                {t.aboutPage.trust3Desc}
              </p>
            </div>

            <div className={`p-2 sm:p-4 rounded-xl sm:rounded-2xl border flex flex-col items-center sm:items-start text-center sm:text-left ${isDark ? 'bg-[#1B1208] border-[#4A2C16]' : 'bg-[#FAF7F0] border-[#E4D4BC]'}`}>
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 mb-1 sm:mb-2 shrink-0" />
              <h3 className="font-serif font-bold text-[10.5px] sm:text-sm mb-0.5 sm:mb-1 leading-tight">{t.aboutPage.trust4Title}</h3>
              <p className="hidden sm:block text-xs opacity-80 leading-relaxed">
                {t.aboutPage.trust4Desc}
              </p>
            </div>
          </div>
        </div>

        {/* Location & CTA Section (Open layout without card/container) */}
        <div className="py-10 text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-500">
            <MapPin className="w-3.5 h-3.5" />
            <span>{t.aboutPage.ctaLocation}: {business.location}</span>
          </div>

          <h2 className={`font-serif font-bold text-2xl sm:text-3xl tracking-tight ${isDark ? 'text-[#F4E8D0]' : 'text-[#241A12]'}`}>
            {t.aboutPage.ctaTitle}
          </h2>

          <p className={`text-xs sm:text-sm max-w-xl mx-auto leading-relaxed ${isDark ? 'text-[#D8C5A8]' : 'text-[#746556]'}`}>
            {t.aboutPage.ctaSubtext}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-6 pt-2 text-xs sm:text-sm font-bold">
            <Link
              to="/contact"
              className="text-amber-500 hover:text-amber-400 hover:underline transition-colors"
            >
              {t.aboutPage.getInTouch}
            </Link>

            <span className="opacity-30">•</span>

            <Link
              to="/services"
              className="text-amber-500 hover:text-amber-400 hover:underline transition-colors"
            >
              {t.aboutPage.exploreServices}
            </Link>
          </div>
        </div>

        {/* Live GIS Map Section (decreased width from left & right) */}
        <div ref={mapRef} className="mt-12 max-w-5xl mx-auto px-2 sm:px-4">
          {isMapInView ? (
            <FarmMap />
          ) : (
            <div className="h-[320px] sm:h-[380px] rounded-3xl bg-stone-900/5 border border-stone-800/10" />
          )}
        </div>

      </div>
    </div>
  );
};
