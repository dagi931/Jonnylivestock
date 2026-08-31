import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemeMode } from '../types/animal';

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  isDarkRustic: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('jonny_livestock_theme') as ThemeMode;
    return saved === 'design11' ? 'design11' : 'design7'; // Default to Design 7
  });

  useEffect(() => {
    localStorage.setItem('jonny_livestock_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'design7') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'design7' ? 'design11' : 'design7'));
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, isDarkRustic: theme === 'design7' }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
