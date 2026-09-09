import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Moon, Sun } from 'lucide-react';

export interface ThemeToggleProps {
  fullWidth?: boolean;
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ fullWidth = false, showLabel = false }) => {
  const { theme, toggleTheme } = useTheme();
  const isDarkRustic = theme === 'design7';

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className={`relative flex items-center justify-center gap-2 h-11 rounded-xl border transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C58A3A] bg-[#2A1A0D] hover:bg-[#4A2C16] border-[#4A2C16] text-[#C58A3A] hover:text-[#E0B15A] shadow-xs data-[theme=design11]:bg-[#F1E8D8] data-[theme=design11]:border-[#E4D4BC] data-[theme=design11]:text-[#B8792F] data-[theme=design11]:hover:bg-[#E4D4BC] cursor-pointer ${
        fullWidth ? 'w-full px-3.5' : 'w-10 h-10'
      }`}
      data-theme={theme}
      title={`Switch to ${isDarkRustic ? 'Design 11 (Light Theme)' : 'Design 7 (Dark Rustic)'}`}
      aria-label={`Switch to ${isDarkRustic ? 'Light Theme' : 'Dark Rustic Theme'}`}
    >
      {isDarkRustic ? (
        <>
          <Sun className="w-4 h-4 shrink-0 transition-transform duration-300 hover:rotate-45" />
          {showLabel && <span className="text-xs font-bold font-mono">Light Mode</span>}
        </>
      ) : (
        <>
          <Moon className="w-4 h-4 shrink-0 transition-transform duration-300 hover:-rotate-12" />
          {showLabel && <span className="text-xs font-bold font-mono">Dark Mode</span>}
        </>
      )}
    </button>
  );
};
