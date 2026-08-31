import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { ArrowRight, Phone } from 'lucide-react';
import { business } from '../../config/business';
import { getPhoneCallLink } from '../../utils/formatters';

export const CTASection: React.FC = () => {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const isDark = theme === 'design7';

  return (
    <section className="py-10 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`relative rounded-3xl overflow-hidden p-6 sm:p-10 lg:p-12 border text-center transition-all ${
            isDark
              ? 'bg-gradient-to-br from-[#2A1A0D] via-[#1B1208] to-[#2A1A0D] border-[#C58A3A]/40 shadow-xl'
              : 'bg-gradient-to-br from-[#FAF7F0] via-[#F1E8D8] to-[#FAF7F0] border-[#E4D4BC] shadow-lg'
          }`}
        >
          {/* Subtle background glow */}
          <div
            className={`absolute -top-20 -right-20 w-60 h-60 rounded-full blur-3xl opacity-20 pointer-events-none ${
              isDark ? 'bg-[#C58A3A]' : 'bg-[#B8792F]'
            }`}
          />
          <div
            className={`absolute -bottom-20 -left-20 w-60 h-60 rounded-full blur-3xl opacity-20 pointer-events-none ${
              isDark ? 'bg-[#E0B15A]' : 'bg-[#4A2C16]'
            }`}
          />

          <div className="relative z-10 max-w-2xl mx-auto">
            <span
              className={`text-xs font-bold uppercase tracking-wider ${
                isDark ? 'text-[#C58A3A]' : 'text-[#B8792F]'
              }`}
            >
              {t.cta.badge}
            </span>

            <h2
              className={`font-serif font-extrabold text-2xl sm:text-3xl lg:text-4xl mt-1.5 mb-3 tracking-tight leading-tight ${
                isDark ? 'text-[#F4E8D0]' : 'text-[#241A12]'
              }`}
            >
              {t.cta.title}
            </h2>

            <p
              className={`text-xs sm:text-sm lg:text-base mb-6 leading-relaxed ${
                isDark ? 'text-[#D8C5A8]' : 'text-[#746556]'
              }`}
            >
              {t.cta.subtext}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/sheep"
                className={`w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-sm transform hover:-translate-y-0.5 ${
                  isDark
                    ? 'bg-[#C58A3A] hover:bg-[#E0B15A] text-[#1B1208]'
                    : 'bg-[#B8792F] hover:bg-[#9E6523] text-[#FAF7F0]'
                }`}
              >
                <span>{t.common.browseSheep}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to="/goats"
                className={`w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all border transform hover:-translate-y-0.5 ${
                  isDark
                    ? 'bg-[#1B1208] hover:bg-[#4A2C16] text-[#F4E8D0] border-[#4A2C16]'
                    : 'bg-[#FAF7F0] hover:bg-[#F1E8D8] text-[#241A12] border-[#E4D4BC]'
                }`}
              >
                <span>{t.common.browseGoats}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to="/cows"
                className={`w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all border transform hover:-translate-y-0.5 ${
                  isDark
                    ? 'bg-[#1B1208] hover:bg-[#4A2C16] text-[#F4E8D0] border-[#4A2C16]'
                    : 'bg-[#FAF7F0] hover:bg-[#F1E8D8] text-[#241A12] border-[#E4D4BC]'
                }`}
              >
                <span>{t.common.browseCows}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <a
                href={getPhoneCallLink(business.phone)}
                className={`w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all ${
                  isDark
                    ? 'text-[#E0B15A] hover:underline'
                    : 'text-[#B8792F] hover:underline'
                }`}
              >
                <Phone className="w-3.5 h-3.5" />
                <span>{t.cta.callPhone} {business.displayPhone}</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
