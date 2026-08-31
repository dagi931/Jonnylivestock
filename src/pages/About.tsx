import React from 'react';
import { Link } from 'react-router-dom';
import { business } from '../config/business';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { ShieldCheck, MapPin, Award, CheckCircle2, Truck, Sparkles } from 'lucide-react';
import { FarmMap } from '../components/common/FarmMap';

export const About: React.FC = () => {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const isDark = theme === 'design7';

  return (
    <div className="min-h-screen py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Hero */}
        <div className="max-w-3xl mb-10">
          <span
            className={`text-xs font-semibold uppercase tracking-wider ${
              isDark ? 'text-[#C58A3A]' : 'text-[#B8792F]'
            }`}
          >
            {t.aboutPage.badge}
          </span>
          <h1
            className={`font-serif font-bold text-3xl sm:text-4xl lg:text-5xl mt-1.5 mb-4 ${
              isDark ? 'text-[#F4E8D0]' : 'text-[#241A12]'
            }`}
          >
            {t.aboutPage.title}
          </h1>
          <p
            className={`text-sm sm:text-base leading-relaxed ${
              isDark ? 'text-[#D8C5A8]' : 'text-[#746556]'
            }`}
          >
            {business.name} {t.aboutPage.heroDesc}
          </p>
        </div>

        {/* 2-Column Story Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-center mb-12">
          <div className="relative rounded-3xl overflow-hidden aspect-[4/3] border shadow-lg" style={{ borderColor: isDark ? '#4A2C16' : '#E4D4BC' }}>
            <img
              src="https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=1200&q=80"
              alt="Healthy cattle and livestock pasture"
              className="w-full h-full object-cover"
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className={`p-4 rounded-2xl border ${isDark ? 'bg-[#1B1208] border-[#4A2C16]' : 'bg-[#FAF7F0] border-[#E4D4BC]'}`}>
              <ShieldCheck className="w-5 h-5 text-amber-500 mb-2" />
              <h3 className="font-serif font-bold text-sm mb-1">{t.aboutPage.trust1Title}</h3>
              <p className="text-xs opacity-80 leading-relaxed">
                {t.aboutPage.trust1Desc}
              </p>
            </div>

            <div className={`p-4 rounded-2xl border ${isDark ? 'bg-[#1B1208] border-[#4A2C16]' : 'bg-[#FAF7F0] border-[#E4D4BC]'}`}>
              <Award className="w-5 h-5 text-amber-500 mb-2" />
              <h3 className="font-serif font-bold text-sm mb-1">{t.aboutPage.trust2Title}</h3>
              <p className="text-xs opacity-80 leading-relaxed">
                {t.aboutPage.trust2Desc}
              </p>
            </div>

            <div className={`p-4 rounded-2xl border ${isDark ? 'bg-[#1B1208] border-[#4A2C16]' : 'bg-[#FAF7F0] border-[#E4D4BC]'}`}>
              <Truck className="w-5 h-5 text-amber-500 mb-2" />
              <h3 className="font-serif font-bold text-sm mb-1">{t.aboutPage.trust3Title}</h3>
              <p className="text-xs opacity-80 leading-relaxed">
                {t.aboutPage.trust3Desc}
              </p>
            </div>

            <div className={`p-4 rounded-2xl border ${isDark ? 'bg-[#1B1208] border-[#4A2C16]' : 'bg-[#FAF7F0] border-[#E4D4BC]'}`}>
              <Sparkles className="w-5 h-5 text-amber-500 mb-2" />
              <h3 className="font-serif font-bold text-sm mb-1">{t.aboutPage.trust4Title}</h3>
              <p className="text-xs opacity-80 leading-relaxed">
                {t.aboutPage.trust4Desc}
              </p>
            </div>
          </div>
        </div>

        {/* Location & CTA Banner */}
        <div
          className={`p-6 sm:p-10 rounded-3xl border text-center max-w-3xl mx-auto ${
            isDark ? 'bg-[#2A1A0D] border-[#4A2C16]' : 'bg-[#F1E8D8] border-[#E4D4BC]'
          }`}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-3 border" style={{ borderColor: isDark ? '#4A2C16' : '#E4D4BC' }}>
            <MapPin className="w-3.5 h-3.5 text-amber-500" />
            <span>{t.aboutPage.ctaLocation}: {business.location}</span>
          </div>

          <h2 className={`font-serif font-bold text-xl sm:text-2xl mb-2 ${isDark ? 'text-[#F4E8D0]' : 'text-[#241A12]'}`}>
            {t.aboutPage.ctaTitle}
          </h2>
          <p className={`text-xs sm:text-sm max-w-lg mx-auto mb-6 ${isDark ? 'text-[#D8C5A8]' : 'text-[#746556]'}`}>
            {t.aboutPage.ctaSubtext}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/contact"
              className={`w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm ${
                isDark
                  ? 'bg-[#C58A3A] hover:bg-[#E0B15A] text-[#1B1208]'
                  : 'bg-[#B8792F] hover:bg-[#9E6523] text-[#FAF7F0]'
              }`}
            >
              {t.aboutPage.getInTouch}
            </Link>

            <Link
              to="/services"
              className={`w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border transition-colors flex items-center justify-center gap-1.5 ${
                isDark
                  ? 'bg-[#1B1208] border-[#4A2C16] text-[#F4E8D0] hover:text-[#E0B15A]'
                  : 'bg-[#FAF7F0] border-[#E4D4BC] text-[#241A12] hover:text-[#B8792F]'
              }`}
            >
              <Truck className="w-4 h-4" />
              <span>{t.aboutPage.exploreServices}</span>
            </Link>
          </div>
        </div>

        {/* Live GIS Map Section (decreased width from left & right) */}
        <div className="mt-12 max-w-5xl mx-auto px-2 sm:px-4">
          <FarmMap />
        </div>

      </div>
    </div>
  );
};
