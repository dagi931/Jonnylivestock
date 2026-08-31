import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { Search, Eye, MessageSquareText } from 'lucide-react';

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

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {steps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className={`relative p-6 rounded-2xl border flex flex-col items-start transition-all ${
                  isDark
                    ? 'bg-[#2A1A0D] border-[#4A2C16] shadow-rustic'
                    : 'bg-[#FAF7F0] border-[#E4D4BC] shadow-premium'
                }`}
              >
                {/* Step Number Tag */}
                <div className="flex items-center justify-between w-full mb-4">
                  <span
                    className={`font-serif font-extrabold text-2xl tracking-wider ${
                      isDark ? 'text-[#C58A3A]' : 'text-[#B8792F]'
                    }`}
                  >
                    {item.step}
                  </span>
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      isDark
                        ? 'bg-[#1B1208] text-[#E0B15A] border border-[#4A2C16]'
                        : 'bg-[#F1E8D8] text-[#B8792F] border border-[#E4D4BC]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                </div>

                <h3
                  className={`font-serif font-bold text-lg mb-2 ${
                    isDark ? 'text-[#F4E8D0]' : 'text-[#241A12]'
                  }`}
                >
                  {item.title}
                </h3>

                <p
                  className={`text-xs sm:text-sm leading-relaxed ${
                    isDark ? 'text-[#D8C5A8]' : 'text-[#746556]'
                  }`}
                >
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
