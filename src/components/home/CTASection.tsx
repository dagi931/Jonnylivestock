import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { Phone } from 'lucide-react';
import { business } from '../../config/business';
import { getPhoneCallLink } from '../../utils/formatters';

export const CTASection: React.FC = () => {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const isDark = theme === 'design7';

  return (
    <section className="py-12 sm:py-16 text-center">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <span
          className={`text-xs font-bold uppercase tracking-wider block mb-2 ${
            isDark ? 'text-[#C58A3A]' : 'text-[#B8792F]'
          }`}
        >
          {t.cta.badge}
        </span>

        <h2
          className={`font-serif font-extrabold text-2xl sm:text-3xl lg:text-4xl mb-3 tracking-tight leading-tight ${
            isDark ? 'text-[#F4E8D0]' : 'text-[#241A12]'
          }`}
        >
          {t.cta.title}
        </h2>

        <p
          className={`text-sm sm:text-base mb-6 leading-relaxed ${
            isDark ? 'text-[#D8C5A8]' : 'text-[#746556]'
          }`}
        >
          {t.cta.subtext}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-sm font-semibold">
          <Link
            to="/sheep"
            className={`hover:underline transition-colors ${
              isDark ? 'text-[#C58A3A]' : 'text-[#B8792F]'
            }`}
          >
            {t.common.browseSheep}
          </Link>

          <span className="opacity-30">•</span>

          <Link
            to="/goats"
            className={`hover:underline transition-colors ${
              isDark ? 'text-[#C58A3A]' : 'text-[#B8792F]'
            }`}
          >
            {t.common.browseGoats}
          </Link>

          <span className="opacity-30">•</span>

          <Link
            to="/cows"
            className={`hover:underline transition-colors ${
              isDark ? 'text-[#C58A3A]' : 'text-[#B8792F]'
            }`}
          >
            {t.common.browseCows}
          </Link>

          <span className="opacity-30">•</span>

          <a
            href={getPhoneCallLink(business.phone)}
            className={`hover:underline transition-colors inline-flex items-center gap-1.5 ${
              isDark ? 'text-[#E0B15A]' : 'text-[#B8792F]'
            }`}
          >
            <Phone className="w-3.5 h-3.5" />
            <span>{t.cta.callPhone} {business.displayPhone}</span>
          </a>
        </div>
      </div>
    </section>
  );
};
