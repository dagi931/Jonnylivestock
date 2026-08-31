import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Moon, Sun } from 'lucide-react';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const isDarkRustic = theme === 'design7';

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className="relative flex items-center justify-center w-10 h-10 rounded-xl border transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C58A3A] bg-[#2A1A0D] hover:bg-[#4A2C16] border-[#4A2C16] text-[#C58A3A] hover:text-[#E0B15A] shadow-sm data-[theme=design11]:bg-[#F1E8D8] data-[theme=design11]:border-[#E4D4BC] data-[theme=design11]:text-[#B8792F] data-[theme=design11]:hover:bg-[#E4D4BC]"
      data-theme={theme}
      title={`Switch to ${isDarkRustic ? 'Design 11 (Light Theme)' : 'Design 7 (Dark Rustic)'}`}
      aria-label={`Switch to ${isDarkRustic ? 'Light Theme' : 'Dark Rustic Theme'}`}
    >
      {isDarkRustic ? (
        <Sun className="w-4 h-4 transition-transform duration-300 hover:rotate-45" />
      ) : (
        <Moon className="w-4 h-4 transition-transform duration-300 hover:-rotate-12" />
      )}
    </button>
  );
};
