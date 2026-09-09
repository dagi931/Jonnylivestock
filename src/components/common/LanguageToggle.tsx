import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { Globe } from 'lucide-react';

export interface LanguageToggleProps {
  fullWidth?: boolean;
  showLabel?: boolean;
}

export const LanguageToggle: React.FC<LanguageToggleProps> = ({ fullWidth = false, showLabel = false }) => {
  const { language, toggleLanguage, isAmharic } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === 'design7';

  return (
    <button
      onClick={toggleLanguage}
      type="button"
      className={`relative flex items-center justify-center gap-2 h-11 rounded-xl border text-xs font-bold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C58A3A] shadow-xs cursor-pointer ${
        fullWidth ? 'w-full px-3.5' : 'px-2.5 h-10'
      } ${
        isDark
          ? 'bg-[#2A1A0D] hover:bg-[#4A2C16] border-[#4A2C16] text-[#E0B15A]'
          : 'bg-[#F1E8D8] hover:bg-[#E4D4BC] border-[#E4D4BC] text-[#B8792F]'
      }`}
      title={isAmharic ? 'Switch to English (EN)' : 'ወደ አማርኛ ቀይር (አማ)'}
      aria-label={language === 'en' ? 'EN - Switch to Amharic' : 'አማ - ወደ እንግሊዝኛ ቀይር'}
    >
      <Globe className="w-4 h-4 shrink-0" />
      <span className="font-mono uppercase tracking-wider text-xs font-bold">
        {showLabel
          ? language === 'en'
            ? 'English (EN)'
            : 'አማርኛ (አማ)'
          : language === 'en'
            ? 'EN'
            : 'አማ'}
      </span>
    </button>
  );
};
