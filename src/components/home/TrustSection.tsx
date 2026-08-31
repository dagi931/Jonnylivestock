import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { Award, Tag, UserCheck, PhoneCall } from 'lucide-react';

export const TrustSection: React.FC = () => {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const isDark = theme === 'design7';

  const features = [
    {
      icon: Award,
      title: t.trust.card1Title,
      description: t.trust.card1Desc
    },
    {
      icon: Tag,
      title: t.trust.card2Title,
      description: t.trust.card2Desc
    },
    {
      icon: UserCheck,
      title: t.trust.card3Title,
      description: t.trust.card3Desc
    },
    {
      icon: PhoneCall,
      title: t.trust.card4Title,
      description: t.trust.card4Desc
    }
  ];

  return (
    <section className="py-10 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span
            className={`text-xs font-semibold uppercase tracking-wider ${
              isDark ? 'text-[#C58A3A]' : 'text-[#B8792F]'
            }`}
          >
            {t.trust.badge}
          </span>
          <h2
            className={`font-serif font-bold text-2xl sm:text-3xl mt-1 mb-3 ${
              isDark ? 'text-[#F4E8D0]' : 'text-[#241A12]'
            }`}
          >
            {t.trust.title}
          </h2>
          <p
            className={`text-xs sm:text-sm leading-relaxed max-w-2xl mx-auto ${
              isDark ? 'text-[#D8C5A8]' : 'text-[#746556]'
            }`}
          >
            {t.trust.description}
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={idx}
                className={`p-5 sm:p-6 rounded-2xl border transition-all duration-200 flex flex-col items-start ${
                  isDark
                    ? 'bg-[#2A1A0D] border-[#4A2C16] shadow-rustic hover:border-[#C58A3A]/50'
                    : 'bg-[#F1E8D8] border-[#E4D4BC] shadow-premium hover:border-[#B8792F]/50'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${
                    isDark
                      ? 'bg-[#1B1208] text-[#C58A3A] border border-[#4A2C16]'
                      : 'bg-[#FAF7F0] text-[#B8792F] border border-[#E4D4BC]'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>

                <h3
                  className={`font-serif font-bold text-base sm:text-lg mb-1.5 ${
                    isDark ? 'text-[#F4E8D0]' : 'text-[#241A12]'
                  }`}
                >
                  {feature.title}
                </h3>

                <p
                  className={`text-xs sm:text-sm leading-relaxed ${
                    isDark ? 'text-[#D8C5A8]' : 'text-[#746556]'
                  }`}
                >
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
