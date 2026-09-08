import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { ArrowRight, CheckCircle, Scale, Truck } from 'lucide-react';
import { AnimatedReveal } from '../common/AnimatedReveal';

export const Hero: React.FC = () => {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const isDark = theme === 'design7';

  return (
    <section className="relative overflow-hidden min-h-[460px] sm:min-h-[500px] lg:min-h-[530px] flex items-center py-8 sm:py-10 lg:py-12">
      {/* Background Hero Image */}
      <div className="absolute inset-0 z-0">
        <picture className="block w-full h-full">
          <source type="image/avif" srcSet="/hero-livestock.avif" />
          <source type="image/webp" srcSet="/hero-livestock.webp" />
          <img
            src="/hero-livestock.webp"
            alt="Jonny Livestock - Sheep, Goats, and Cows at the farm"
            className="w-full h-full object-cover"
            style={{ objectPosition: '75% 24%' }}
            loading="eager"
            fetchPriority="high"
            decoding="async"
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
          <AnimatedReveal delay={50} direction="up">
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
          </AnimatedReveal>

          {/* Supporting Text */}
          <AnimatedReveal delay={150} direction="up">
            <p
              className={`text-xs sm:text-sm md:text-base font-normal leading-relaxed mb-5 max-w-lg ${
                isDark ? 'text-[#D8C5A8]' : 'text-[#746556]'
              }`}
            >
              {t.hero.subtext}
            </p>
          </AnimatedReveal>

          {/* Primary Action Buttons: Sheep, Goats, Cows in a row */}
          <AnimatedReveal delay={250} direction="up">
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
              <Link
                to="/sheep"
                className={`inline-flex items-center justify-center gap-1.5 px-4 sm:px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-150 shadow-sm transform hover:-translate-y-0.5 ${
                  isDark
                    ? 'bg-[#C58A3A] hover:bg-[#E0B15A] text-[#1B1208]'
                    : 'bg-[#B8792F] hover:bg-[#9E6523] text-[#FAF7F0]'
                }`}
              >
                <span>{t.common.browseSheep}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>

              <Link
                to="/goats"
                className={`inline-flex items-center justify-center gap-1.5 px-4 sm:px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-150 border transform hover:-translate-y-0.5 ${
                  isDark
                    ? 'bg-[#1B1208]/85 hover:bg-[#2A1A0D] text-[#F4E8D0] border-[#4A2C16]'
                    : 'bg-[#FAF7F0] hover:bg-[#F1E8D8] text-[#241A12] border-[#E4D4BC]'
                }`}
              >
                <span>{t.common.browseGoats}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>

              <Link
                to="/cows"
                className={`inline-flex items-center justify-center gap-1.5 px-4 sm:px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-150 border transform hover:-translate-y-0.5 ${
                  isDark
                    ? 'bg-[#1B1208]/85 hover:bg-[#2A1A0D] text-[#E0B15A] border-[#C58A3A]/40'
                    : 'bg-[#F1E8D8] hover:bg-[#E4D4BC] text-[#4A2C16] border-[#B8792F]/40'
                }`}
              >
                <span>{t.common.browseCows}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </AnimatedReveal>

          {/* Key Value Points Row */}
          <AnimatedReveal delay={350} direction="up">
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
          </AnimatedReveal>
        </div>
      </div>
    </section>
  );
};
