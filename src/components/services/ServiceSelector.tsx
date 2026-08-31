import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { Truck, UtensilsCrossed, PartyPopper, Scale, Sparkles, Check } from 'lucide-react';
import { livestockServices } from '../../data/services';

interface ServiceSelectorProps {
  selectedServices: string[];
  onChange: (services: string[]) => void;
}

export const ServiceSelector: React.FC<ServiceSelectorProps> = ({
  selectedServices,
  onChange
}) => {
  const { theme } = useTheme();
  const { isAmharic } = useLanguage();
  const isDark = theme === 'design7';

  const iconMap: Record<string, React.ElementType> = {
    Scale,
    Sparkles,
    Truck,
    UtensilsCrossed,
    PartyPopper
  };

  const toggleService = (id: string) => {
    if (selectedServices.includes(id)) {
      onChange(selectedServices.filter((s) => s !== id));
    } else {
      onChange([...selectedServices, id]);
    }
  };

  return (
    <div className="space-y-2.5">
      {livestockServices.map((service) => {
        const isSelected = selectedServices.includes(service.id);
        const Icon = iconMap[service.iconName] || Truck;

        let title = service.title;
        let desc = service.shortDescription;

        if (isAmharic) {
          if (service.id === 'meat-by-kg') {
            title = '01. ስጋ በኪሎ ለሆቴሎችና ሬስቶራንቶች';
            desc = 'የበግ፣ የፍየልና የበሬ ስጋ በኪሎ የታረደ አቅርቦት።';
          } else if (service.id === 'fresh-slaughtered-sheep') {
            title = '02. የታረደ ትኩስ በግ ማድረስ';
            desc = 'ከእርሻችን የታረደና የጸዳ በግ እስከ ቤትዎ ድረስ።';
          } else if (service.id === 'delivery') {
            title = '03. የቀጥታ ከብትና በጎች ማጓጓዝ';
            desc = 'ከአዋሬ እርሻችን አስተማማኝ የቀጥታ እንስሳት ማጓጓዝ።';
          } else if (service.id === 'slaughter-prep') {
            title = '04. በቦታው ላይ የዕርድና የስጋ ዝግጅት';
            desc = '1 ባለሙያ ተመድቦ ንጽህናው የተጠበቀ የዕርድና የስጋ ዝግጅት።';
          } else if (service.id === 'events-ceremonies') {
            title = '05. ለበዓላት፣ ለሰርግና ለተለያዩ ዝግጅቶች';
            desc = 'ለታላላቅ ዝግጅቶች ሙሉ የእንስሳትና የስጋ አቅርቦት።';
          }
        }

        return (
          <label
            key={service.id}
            onClick={() => toggleService(service.id)}
            className={`flex items-start gap-3 p-3 rounded-2xl border cursor-pointer transition-all select-none ${
              isSelected
                ? isDark
                  ? 'bg-[#4A2C16]/50 border-[#C58A3A] shadow-xs ring-1 ring-[#C58A3A]/40'
                  : 'bg-[#F1E8D8] border-[#B8792F] shadow-xs ring-1 ring-[#B8792F]/40'
                : isDark
                  ? 'bg-[#1B1208]/60 border-[#4A2C16] hover:bg-[#2A1A0D]'
                  : 'bg-[#FAF7F0] border-[#E4D4BC] hover:bg-[#F1E8D8]/50'
            }`}
          >
            {/* Custom Checkbox */}
            <div
              className={`w-4 h-4 mt-0.5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                isSelected
                  ? isDark
                    ? 'bg-[#C58A3A] border-[#C58A3A] text-[#1B1208]'
                    : 'bg-[#B8792F] border-[#B8792F] text-[#FAF7F0]'
                  : isDark
                    ? 'border-[#4A2C16] bg-[#1B1208]'
                    : 'border-[#E4D4BC] bg-[#F1E8D8]'
              }`}
            >
              {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <Icon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? (isDark ? 'text-[#E0B15A]' : 'text-[#B8792F]') : 'opacity-60'}`} />
                <span className={`text-xs font-semibold truncate ${isDark ? 'text-[#F4E8D0]' : 'text-[#2A1A0D]'}`}>
                  {title}
                </span>
              </div>
              <p className={`text-[11px] mt-0.5 leading-snug ${isDark ? 'text-[#D8C5A8]/80' : 'text-[#746556]'}`}>
                {desc}
              </p>
            </div>
          </label>
        );
      })}
    </div>
  );
};
