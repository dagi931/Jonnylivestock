import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { Compass, ArrowRight, Home } from 'lucide-react';

export const NotFound: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'design7';

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div
        className={`max-w-lg w-full rounded-3xl border p-8 sm:p-12 text-center shadow-xl transition-all ${
          isDark ? 'bg-[#2A1A0D] border-[#4A2C16]' : 'bg-[#F1E8D8] border-[#E4D4BC]'
        }`}
      >
        <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-500 border border-amber-500/30 flex items-center justify-center mx-auto mb-5">
          <Compass className="w-8 h-8" />
        </div>

        <span
          className={`text-xs font-semibold uppercase tracking-wider ${
            isDark ? 'text-[#C58A3A]' : 'text-[#B8792F]'
          }`}
        >
          404 Error
        </span>

        <h1
          className={`font-serif font-bold text-3xl sm:text-4xl mt-1 mb-3 ${
            isDark ? 'text-[#F4E8D0]' : 'text-[#2A1A0D]'
          }`}
        >
          Page Not Found
        </h1>

        <p
          className={`text-sm sm:text-base mb-8 max-w-sm mx-auto ${
            isDark ? 'text-[#D8C5A8]' : 'text-[#746556]'
          }`}
        >
          The page you are looking for does not exist or has been moved.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/"
            className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
              isDark
                ? 'bg-[#C58A3A] hover:bg-[#E0B15A] text-[#1B1208]'
                : 'bg-[#B8792F] hover:bg-[#9E6523] text-[#FAF7F0]'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>Return to Home</span>
          </Link>

          <Link
            to="/sheep"
            className={`w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-semibold border transition-colors ${
              isDark
                ? 'bg-[#1B1208] border-[#4A2C16] text-[#F4E8D0] hover:border-[#C58A3A]'
                : 'bg-[#FAF7F0] border-[#E4D4BC] text-[#2A1A0D] hover:border-[#B8792F]'
            }`}
          >
            <span>Browse Sheep</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};
