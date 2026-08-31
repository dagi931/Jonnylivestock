import React from 'react';
import { useTheme } from '../../context/ThemeContext';

export const SkeletonCard: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'design7';

  return (
    <div
      className={`rounded-2xl border overflow-hidden animate-pulse flex flex-col ${
        isDark
          ? 'bg-[#2A1A0D] border-[#4A2C16]'
          : 'bg-[#F1E8D8] border-[#E4D4BC]'
      }`}
    >
      {/* Compact Image Skeleton */}
      <div className={`aspect-[16/10] sm:aspect-[16/9] w-full ${isDark ? 'bg-[#1B1208]' : 'bg-[#F1E8D8]'}`} />

      {/* Content Skeleton */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between space-y-2.5">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <div className={`h-3 w-16 rounded ${isDark ? 'bg-[#4A2C16]' : 'bg-[#E4D4BC]'}`} />
            <div className={`h-3 w-12 rounded-full ${isDark ? 'bg-[#4A2C16]' : 'bg-[#E4D4BC]'}`} />
          </div>
          <div className={`h-5 w-3/4 rounded ${isDark ? 'bg-[#4A2C16]' : 'bg-[#E4D4BC]'}`} />
          <div className="grid grid-cols-2 gap-1.5 pt-1">
            <div className={`h-6 rounded-lg ${isDark ? 'bg-[#1B1208]' : 'bg-[#FAF7F0]'}`} />
            <div className={`h-6 rounded-lg ${isDark ? 'bg-[#1B1208]' : 'bg-[#FAF7F0]'}`} />
          </div>
        </div>

        <div className="pt-2.5 border-t flex justify-between items-center" style={{ borderColor: isDark ? '#4A2C16' : '#E4D4BC' }}>
          <div className={`h-4 w-20 rounded ${isDark ? 'bg-[#4A2C16]' : 'bg-[#E4D4BC]'}`} />
          <div className={`h-7 w-16 rounded-lg ${isDark ? 'bg-[#4A2C16]' : 'bg-[#E4D4BC]'}`} />
        </div>
      </div>
    </div>
  );
};
