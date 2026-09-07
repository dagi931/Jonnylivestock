import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { Search, Eye, MessageSquareText } from 'lucide-react';
import { AnimatedReveal } from '../common/AnimatedReveal';

export const HowItWorks: React.FC = () => {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const isDark = theme === 'design7';

  const steps = [
    {
      step: '01',
      title: t.howItWorks.step1Title,
      icon: Search,
      description: t.howItWorks.step1Desc
    },
    {
      step: '02',
      title: t.howItWorks.step2Title,
      icon: Eye,
      description: t.howItWorks.step2Desc
    },
    {
      step: '03',
      title: t.howItWorks.step3Title,
      icon: MessageSquareText,
      description: t.howItWorks.step3Desc
    }
  ];

  return (
    <section
      className={`py-10 sm:py-14 border-y transition-colors ${
        isDark
          ? 'bg-[#1B1208] border-[#4A2C16]'
          : 'bg-[#F1E8D8] border-[#E4D4BC]'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <AnimatedReveal direction="up" delay={50}>
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span
              className={`text-xs font-semibold uppercase tracking-wider ${
                isDark ? 'text-[#C58A3A]' : 'text-[#B8792F]'
              }`}
            >
              {t.howItWorks.badge}
            </span>
            <h2
              className={`font-serif font-bold text-2xl sm:text-3xl mt-1 ${
                isDark ? 'text-[#F4E8D0]' : 'text-[#241A12]'
              }`}
            >
              {t.howItWorks.title}
            </h2>
            <p
              className={`mt-1.5 text-xs sm:text-sm ${
                isDark ? 'text-[#D8C5A8]' : 'text-[#746556]'
              }`}
            >
              {t.howItWorks.subtitle}
            </p>
          </div>
        </AnimatedReveal>

        {/* Steps Grid - Clean Editorial Flow */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <AnimatedReveal key={idx} direction="up" delay={80 + idx * 90} className="h-full">
                <div
                  className={`h-full p-6 rounded-xl border flex flex-col items-start transition-colors ${
                    isDark
                      ? 'bg-[#2A1A0D] border-[#4A2C16]'
                      : 'bg-[#FAF7F0] border-[#E4D4BC]'
                  }`}
                >
                  {/* Step Number Tag & Icon */}
                  <div className="flex items-center justify-between w-full mb-4 pb-3 border-b border-black/5 dark:border-white/5">
                    <span
                      className={`font-serif font-extrabold text-2xl tracking-wider ${
                        isDark ? 'text-[#C58A3A]' : 'text-[#B8792F]'
                      }`}
                    >
                      {item.step}
                    </span>
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        isDark
                          ? 'bg-[#1B1208] text-[#E0B15A] border border-[#4A2C16]'
                          : 'bg-[#F1E8D8] text-[#B8792F] border border-[#E4D4BC]'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>

                  <h3
                    className={`font-serif font-bold text-base sm:text-lg mb-2 ${
                      isDark ? 'text-[#F4E8D0]' : 'text-[#241A12]'
                    }`}
                  >
                    {item.title.replace(/^\d+\.\s*/, '')}
                  </h3>

                  <p
                    className={`text-xs sm:text-sm leading-relaxed ${
                      isDark ? 'text-[#D8C5A8]' : 'text-[#746556]'
                    }`}
                  >
                    {item.description}
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
