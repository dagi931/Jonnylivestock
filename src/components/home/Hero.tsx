import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { ArrowRight, CheckCircle, Scale, Truck } from 'lucide-react';

export const Hero: React.FC = () => {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const isDark = theme === 'design7';

  return (
    <section className="relative overflow-hidden min-h-[460px] sm:min-h-[500px] lg:min-h-[530px] flex items-center py-8 sm:py-10 lg:py-12">
      {/* Background Hero Image */}
      <div className="absolute inset-0 z-0">
        <picture className="block w-full h-full">
          <img
            src="/hero-livestock.jpg"
            alt="Jonny Livestock - Sheep, Goats, Cows & Prime Meat Supplier"
            className="w-full h-full object-cover"
            style={{ objectPosition: '75% 24%' }}
            loading="eager"
            fetchPriority="high"
            decoding="sync"
          />
        </picture>
        
        {/* Soft Radial/Linear Gradient Backdrop */}
        <div
          className={`absolute inset-0 transition-colors duration-300 ${
            isDark
              ? 'bg-gradient-to-r from-[#1B1208] via-[#1B1208]/90 sm:via-[#1B1208]/75 to-transparent'
              : 'bg-gradient-to-r from-[#FAF7F0] via-[#FAF7F0]/90 sm:via-[#FAF7F0]/75 to-transparent'
          }`}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="max-w-xl lg:max-w-2xl">
          
          {/* Headline */}
          <div className="animate-hero-1">
            <h1
              className={`font-serif font-extrabold text-3xl sm:text-4xl lg:text-5xl tracking-tight leading-[1.15] mb-3 ${
                isDark ? 'text-[#F4E8D0]' : 'text-[#241A12]'
              }`}
            >
              {t.hero.headlineLine1}<br />
              <span
                className={
                  isDark
                    ? 'text-transparent bg-clip-text bg-gradient-to-r from-[#C58A3A] to-[#E0B15A]'
                    : 'text-[#B8792F]'
                }
              >
                {t.hero.headlineHighlight}
              </span>
            </h1>
          </div>

          {/* Supporting Text */}
          <div className="animate-hero-2">
            <p
              className={`text-xs sm:text-sm md:text-base font-normal leading-relaxed mb-5 max-w-lg ${
                isDark ? 'text-[#D8C5A8]' : 'text-[#746556]'
              }`}
            >
              {t.hero.subtext}
            </p>
          </div>

          {/* Primary Navigation Links: Sheep, Goats, Cows, Meat */}
          <div className="animate-hero-3">
            <div className="flex flex-wrap items-center gap-x-5 sm:gap-x-7 gap-y-3 pt-1">
              <Link
                to="/sheep"
                className={`inline-flex items-center gap-1.5 font-bold text-sm sm:text-base transition-colors duration-150 group hover:underline ${
                  isDark ? 'text-[#C58A3A] hover:text-[#E0B15A]' : 'text-[#B8792F] hover:text-[#9E6523]'
                }`}
              >
                <span>{t.common.browseSheep}</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-150 group-hover:translate-x-1 shrink-0" />
              </Link>

              <Link
                to="/goats"
                className={`inline-flex items-center gap-1.5 font-bold text-sm sm:text-base transition-colors duration-150 group hover:underline ${
                  isDark ? 'text-[#F4E8D0] hover:text-[#C58A3A]' : 'text-[#241A12] hover:text-[#B8792F]'
                }`}
              >
                <span>{t.common.browseGoats}</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-150 group-hover:translate-x-1 shrink-0" />
              </Link>

              <Link
                to="/cows"
                className={`inline-flex items-center gap-1.5 font-bold text-sm sm:text-base transition-colors duration-150 group hover:underline ${
                  isDark ? 'text-[#F4E8D0] hover:text-[#C58A3A]' : 'text-[#241A12] hover:text-[#B8792F]'
                }`}
              >
                <span>{t.common.browseCows}</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-150 group-hover:translate-x-1 shrink-0" />
              </Link>

              <Link
                to="/#meat-by-kg"
                onClick={(e) => {
                  const el = document.getElementById('meat-by-kg');
                  if (el) {
                    e.preventDefault();
                    el.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className={`inline-flex items-center gap-1.5 font-bold text-sm sm:text-base transition-colors duration-150 group hover:underline ${
                  isDark ? 'text-[#F4E8D0] hover:text-[#C58A3A]' : 'text-[#241A12] hover:text-[#B8792F]'
                }`}
              >
                <span>{t.common.browseMeat}</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-150 group-hover:translate-x-1 shrink-0" />
              </Link>
            </div>
          </div>

          {/* Key Value Points Row */}
          <div className="animate-hero-4">
            <div
              className={`mt-6 pt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-semibold ${
                isDark ? 'text-[#D8C5A8]' : 'text-[#746556]'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <CheckCircle className={`w-3.5 h-3.5 shrink-0 ${isDark ? 'text-[#C58A3A]' : 'text-[#B8792F]'}`} />
                <span>{t.hero.valuePoint1}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Scale className={`w-3.5 h-3.5 shrink-0 ${isDark ? 'text-[#C58A3A]' : 'text-[#B8792F]'}`} />
                <span>{t.hero.valuePoint2}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Truck className={`w-3.5 h-3.5 shrink-0 ${isDark ? 'text-[#C58A3A]' : 'text-[#B8792F]'}`} />
                <span>{t.hero.valuePoint3}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
