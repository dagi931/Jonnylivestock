import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { Award, Tag, UserCheck, PhoneCall } from 'lucide-react';
import { AnimatedReveal } from '../common/AnimatedReveal';

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
    <section className="py-6 sm:py-14">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <AnimatedReveal direction="up" delay={50}>
          <div className="text-center max-w-3xl mx-auto mb-5 sm:mb-10">
            <span
              className={`text-[10px] sm:text-xs font-semibold uppercase tracking-wider ${
                isDark ? 'text-[#C58A3A]' : 'text-[#B8792F]'
              }`}
            >
              {t.trust.badge}
            </span>
            <h2
              className={`font-serif font-bold text-xl sm:text-3xl mt-0.5 sm:mt-1 mb-1.5 sm:mb-3 ${
                isDark ? 'text-[#F4E8D0]' : 'text-[#241A12]'
              }`}
            >
              {t.trust.title}
            </h2>
            <p
              className={`text-xs sm:text-sm leading-relaxed max-w-2xl mx-auto line-clamp-2 sm:line-clamp-none ${
                isDark ? 'text-[#D8C5A8]' : 'text-[#746556]'
              }`}
            >
              {t.trust.description}
            </p>
          </div>
        </AnimatedReveal>

        {/* Feature Cards: Clean, Intentional Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <AnimatedReveal key={idx} direction="up" delay={80 + idx * 80} className="h-full">
                <div
                  className={`h-full p-4 sm:p-6 rounded-xl border flex flex-col items-start text-left transition-colors ${
                    isDark
                      ? 'bg-[#2A1A0D] border-[#4A2C16] hover:border-[#C58A3A]/40'
                      : 'bg-[#FAF7F0] border-[#E4D4BC] hover:border-[#B8792F]/40'
                  }`}
                >
                  <div
                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center mb-3 sm:mb-4 shrink-0 ${
                      isDark
                        ? 'bg-[#1B1208] text-[#C58A3A] border border-[#4A2C16]'
                        : 'bg-[#F1E8D8] text-[#B8792F] border border-[#E4D4BC]'
                    }`}
                  >
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>

                  <h3
                    className={`font-serif font-bold text-sm sm:text-base mb-1.5 leading-snug ${
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
              </AnimatedReveal>
            );
          })}
        </div>

      </div>
    </section>
  );
};
