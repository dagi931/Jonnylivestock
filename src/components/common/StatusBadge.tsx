import React from 'react';
import { AnimalStatus } from '../../types/animal';
import { useLanguage } from '../../context/LanguageContext';

interface StatusBadgeProps {
  status: AnimalStatus;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  shape?: 'rect' | 'pill';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  className = '',
  size = 'md',
  shape = 'rect'
}) => {
  const { t } = useLanguage();

  const getStyles = () => {
    switch (status) {
      case 'available':
        return {
          bg: 'bg-[#2E7D32]/20 text-[#81C784] border-[#2E7D32]/40',
          dot: 'bg-[#4CAF50]',
          label: t.common.available
        };
      case 'reserved':
        return {
          bg: 'bg-[#C58A3A]/20 text-[#E0B15A] border-[#C58A3A]/40',
          dot: 'bg-[#C58A3A]',
          label: t.common.reserved
        };
      case 'sold':
        return {
          bg: 'bg-stone-700/30 text-stone-400 border-stone-600/40',
          dot: 'bg-stone-500',
          label: t.common.sold
        };
      default:
        return {
          bg: 'bg-stone-700/30 text-stone-400 border-stone-600/40',
          dot: 'bg-stone-500',
          label: status
        };
    }
  };

  const config = getStyles();

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs sm:text-sm',
    lg: 'px-3.5 py-1.5 text-sm font-semibold'
  };

  const dotSizes = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5'
  };

  const radiusClass = shape === 'pill' ? 'rounded-full' : 'rounded-md';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium ${radiusClass} border ${config.bg} ${sizeClasses[size]} ${className}`}
      aria-label={`Status: ${config.label}`}
    >
      <span className={`rounded-full ${config.dot} ${dotSizes[size]}`} aria-hidden="true" />
      <span>{config.label}</span>
    </span>
  );
};
