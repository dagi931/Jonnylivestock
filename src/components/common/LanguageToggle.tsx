import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { Globe } from 'lucide-react';

export const LanguageToggle: React.FC = () => {
  const { language, toggleLanguage, isAmharic } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === 'design7';

  return (
    <button
      onClick={toggleLanguage}
      type="button"
      className={`relative flex items-center justify-center gap-2 px-3 h-10 rounded-xl border text-xs font-bold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C58A3A] shadow-xs cursor-pointer ${
        isDark
          ? 'bg-[#2A1A0D] hover:bg-[#4A2C16] border-[#4A2C16] text-[#E0B15A]'
          : 'bg-[#F1E8D8] hover:bg-[#E4D4BC] border-[#E4D4BC] text-[#B8792F]'
      }`}
      title={isAmharic ? 'Switch to English (EN)' : 'ወደ አማርኛ ቀይር (አማ)'}
      aria-label={isAmharic ? 'Switch to English' : 'ወደ አማርኛ ቀይር'}
    >
      <Globe className="w-3.5 h-3.5 shrink-0" />
      <div className="flex items-center gap-1.5 leading-none">
        <span className="font-mono uppercase tracking-wider text-[11px] font-bold">
          {language === 'en' ? 'EN' : 'አማ'}
        </span>
        <span className="opacity-40 font-normal text-[10px]">•</span>
        <span className="text-xs font-semibold">
          {language === 'en' ? 'English' : 'አማርኛ'}
        </span>
      </div>
    </button>
  );
};
