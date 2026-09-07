import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { Truck, MapPin, UtensilsCrossed, UserCheck, Sparkles, Check, Info } from 'lucide-react';
import { formatPrice } from '../../utils/formatters';

export type FulfillmentType = 'delivery' | 'pickup';

export type AnimalSlaughterOption =
  | 'none'
  | 'slaughter_along'       // Delivery: Send person to slaughter along (+200 ETB)
  | 'send_slaughtered'      // Delivery: Send slaughtered animal (0 extra travel)
  | 'slaughter_at_farm'     // Pickup: Prepare person to slaughter when they pick up (0 extra travel)
  | 'slaughter_take_along'; // Pickup: Customer takes slaughter person along (+200 ETB)

export interface SlaughterPricing {
  slaughterFee: number;
  travelFee: number;
}

interface AnimalOptionalServicesSelectorProps {
  isDelivery: boolean;
  onDeliveryChange: (isDelivery: boolean) => void;
  slaughterOption: AnimalSlaughterOption;
  onSlaughterOptionChange: (option: AnimalSlaughterOption) => void;
  pricing: SlaughterPricing;
  showDeliveryToggle?: boolean;
  compact?: boolean;
}

export const getSlaughterFee = (option: AnimalSlaughterOption, pricing: SlaughterPricing): number => {
  if (option === 'slaughter_along' || option === 'slaughter_take_along') {
    return (pricing.slaughterFee || 600) + (pricing.travelFee || 200);
  }
  if (option === 'send_slaughtered' || option === 'slaughter_at_farm') {
    return pricing.slaughterFee || 600;
  }
  return 0;
};

export const getSlaughterServiceLabel = (
  option: AnimalSlaughterOption,
  isAmharic: boolean,
  pricing: SlaughterPricing
): { title: string; subtitle: string; feeText: string } => {
  const base = pricing.slaughterFee || 600;
  const travel = pricing.travelFee || 200;

  switch (option) {
    case 'slaughter_along':
      return {
        title: isAmharic ? 'በቦታው ላይ የዕርድ አገልግሎት (ባለሙያ አብሮ ይላካል)' : 'On-Site Slaughter (Worker Accompanies Delivery)',
        subtitle: isAmharic
          ? `የሰለጠነ የዕርድ ባለሙያ ከተሽከርካሪው ጋር አብሮ ወደ ደጃፍዎ በመሄድ ዕርዱንና የስጋ ዝግጅቱን ያከናውናል (+${travel} ብር የጉዞ አበል ተካትቷል)`
          : `A skilled slaughter worker travels along with the delivery vehicle to slaughter and cut the meat at your home (+${travel} ETB travel allowance included)`,
        feeText: `+${formatPrice(base + travel)} (${base} + ${travel})`
      };
    case 'send_slaughtered':
      return {
        title: isAmharic ? 'የታረደ መላክ (እርሻው ላይ ታርዶ የሚላክ)' : 'Send Freshly Slaughtered (Prepared at Farm)',
        subtitle: isAmharic
          ? 'እንስሳው በአዋሬ እርሻችን ንጽህናው ተጠብቆ ታርዶና ተዘጋጅቶ ትኩስ ስጋው በቀጥታ ይደርስዎታል (ተጨማሪ የጉዞ ክፍያ የለውም)'
          : 'The animal is cleanly slaughtered and partitioned at our Aware farm before dispatch; fresh meat delivered to your door (no travel fee)',
        feeText: `+${formatPrice(base)}`
      };
    case 'slaughter_at_farm':
      return {
        title: isAmharic ? 'እርሻው ላይ አርዶ ማዘጋጀት (ሲረከቡ)' : 'Slaughter on Farm (Upon Pickup)',
        subtitle: isAmharic
          ? 'እንስሳውን ለመረከብ ሲመጡ ባለሙያችን እርሻው ቅጥር ግቢ ውስጥ አርዶና አዘጋጅቶ ያስረክብዎታል (ተጨማሪ የጉዞ ክፍያ የለውም)'
          : 'When you arrive for pickup, our worker slaughters and cleans the animal on-site at our farm before you take it (no travel fee)',
        feeText: `+${formatPrice(base)}`
      };
    case 'slaughter_take_along':
      return {
        title: isAmharic ? 'የዕርድ ባለሙያ ይዘው መሄድ (በቦታው ለማረድ)' : 'Take Slaughter Worker Along (To Slaughter at Your Venue)',
        subtitle: isAmharic
          ? `እንስሳውን ሲወስዱ የዕርድ ባለሙያችንን አብረው ይዘው በመሄድ ቤትዎ ወይም ዝግጅት ቦታዎ ያርዳል (+${travel} ብር አብሮ መሄጃ አበል ተካትቷል)`
          : `You take our slaughter worker along with you in your transport to slaughter and prepare meat at your location (+${travel} ETB accompaniment allowance)`,
        feeText: `+${formatPrice(base + travel)} (${base} + ${travel})`
      };
    case 'none':
    default:
      return {
        title: isAmharic ? 'ያለ ዕርድ (እንስሳውን በህይወት መረከብ)' : 'No Slaughter (Live Animal Only)',
        subtitle: isAmharic
          ? 'እንስሳው በህይወት ባለበት ሁኔታ ይረከባሉ፤ ምንም ተጨማሪ የአገልግሎት ክፍያ የለውም'
          : 'Receive the live animal without slaughter service; no additional fee',
        feeText: isAmharic ? 'ነፃ (0 ብር)' : 'Free (0 ETB)'
      };
  }
};

export const AnimalOptionalServicesSelector: React.FC<AnimalOptionalServicesSelectorProps> = ({
  isDelivery,
  onDeliveryChange,
  slaughterOption,
  onSlaughterOptionChange,
  pricing,
  showDeliveryToggle = true,
  compact = false
}) => {
  const { theme } = useTheme();
  const { isAmharic } = useLanguage();
  const isDark = theme === 'design7';

  const baseFee = pricing.slaughterFee || 600;
  const travelFee = pricing.travelFee || 200;

  // Handle switching between delivery and pickup
  const handleToggleDelivery = (deliveryState: boolean) => {
    onDeliveryChange(deliveryState);
    if (deliveryState) {
      if (slaughterOption === 'slaughter_take_along') {
        onSlaughterOptionChange('slaughter_along');
      } else if (slaughterOption === 'slaughter_at_farm') {
        onSlaughterOptionChange('send_slaughtered');
      }
    } else {
      if (slaughterOption === 'slaughter_along') {
        onSlaughterOptionChange('slaughter_take_along');
      } else if (slaughterOption === 'send_slaughtered') {
        onSlaughterOptionChange('slaughter_at_farm');
      }
    }
  };

  // Delivery options available when Delivery is selected
  const deliverySlaughterOptions: AnimalSlaughterOption[] = [
    'none',
    'slaughter_along',
    'send_slaughtered'
  ];

  // Pickup options available when Farm Pickup is selected
  const pickupSlaughterOptions: AnimalSlaughterOption[] = [
    'none',
    'slaughter_at_farm',
    'slaughter_take_along'
  ];

  const currentOptions = isDelivery ? deliverySlaughterOptions : pickupSlaughterOptions;

  return (
    <div className={`space-y-3.5 ${compact ? 'text-xs' : ''}`}>
      {/* 1. Fulfillment Preference Choice (Delivery vs Pickup) */}
      {showDeliveryToggle && (
        <div className="space-y-1.5">
          <label className="block text-[11px] font-bold uppercase tracking-wider opacity-80 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-[#C18A45]" />
              <span>{isAmharic ? 'የማስረከቢያ መንገድ ይምረጡ' : '1. Choose Delivery / Fulfillment'}</span>
            </span>
            <span className="text-[10px] font-mono opacity-60">
              {isDelivery
                ? (isAmharic ? 'የበር ማድረስ' : 'Doorstep Delivery')
                : (isAmharic ? 'ከእርሻው መውሰድ' : 'Farm Pickup')}
            </span>
          </label>

          <div className="grid grid-cols-2 gap-2">
            {/* Delivery Choice */}
            <button
              type="button"
              onClick={() => handleToggleDelivery(true)}
              className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                isDelivery
                  ? isDark
                    ? 'bg-amber-500/20 border-amber-500 text-[#F4E8D0] font-bold shadow-xs ring-1 ring-amber-500/40'
                    : 'bg-amber-500/15 border-amber-600 text-[#241A12] font-bold shadow-xs ring-1 ring-amber-600/40'
                  : isDark
                  ? 'bg-[#1B1208]/60 border-[#4A2C16] text-[#D8C5A8] opacity-70 hover:opacity-100 hover:bg-[#2A1A0D]'
                  : 'bg-[#FAF7F0] border-[#E4D4BC] text-[#746556] opacity-70 hover:opacity-100 hover:bg-[#F1E8D8]/50'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                  isDelivery
                    ? 'border-amber-500 bg-amber-500 text-black'
                    : 'border-black/30 dark:border-white/30'
                }`}
              >
                {isDelivery && <Check className="w-2.5 h-2.5 stroke-[3]" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold truncate flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>{isAmharic ? 'በተሽከርካሪ ማድረስ' : 'Doorstep Delivery'}</span>
                </div>
                <div className="text-[10px] opacity-70 truncate mt-0.5">
                  {isAmharic ? 'ወደ ቤትዎ / ዝግጅት ቦታዎ' : 'Direct to your location'}
                </div>
              </div>
            </button>

            {/* Farm Pickup Choice */}
            <button
              type="button"
              onClick={() => handleToggleDelivery(false)}
              className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                !isDelivery
                  ? isDark
                    ? 'bg-amber-500/20 border-amber-500 text-[#F4E8D0] font-bold shadow-xs ring-1 ring-amber-500/40'
                    : 'bg-amber-500/15 border-amber-600 text-[#241A12] font-bold shadow-xs ring-1 ring-amber-600/40'
                  : isDark
                  ? 'bg-[#1B1208]/60 border-[#4A2C16] text-[#D8C5A8] opacity-70 hover:opacity-100 hover:bg-[#2A1A0D]'
                  : 'bg-[#FAF7F0] border-[#E4D4BC] text-[#746556] opacity-70 hover:opacity-100 hover:bg-[#F1E8D8]/50'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                  !isDelivery
                    ? 'border-amber-500 bg-amber-500 text-black'
                    : 'border-black/30 dark:border-white/30'
                }`}
              >
                {!isDelivery && <Check className="w-2.5 h-2.5 stroke-[3]" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold truncate flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>{isAmharic ? 'ከእርሻው መውሰድ (Pickup)' : 'Farm Pickup'}</span>
                </div>
                <div className="text-[10px] opacity-70 truncate mt-0.5">
                  {isAmharic ? 'አዋሬ / አራት ኪሎ እርሻ (ነፃ)' : 'Aware Farm (Free)'}
                </div>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* 2. Slaughtering and Preparation Service Choice */}
      <div className="space-y-2">
        <label className="block text-[11px] font-bold uppercase tracking-wider opacity-80 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <UtensilsCrossed className="w-3.5 h-3.5 text-[#C18A45]" />
            <span>
              {isAmharic
                ? isDelivery
                  ? '2. የዕርድና የስጋ ዝግጅት ምርጫ (ከማድረስ ጋር)'
                  : '2. የዕርድና የስጋ ዝግጅት ምርጫ (ከመውሰድ ጋር)'
                : isDelivery
                ? '2. Slaughter & Meat Prep (With Delivery)'
                : '2. Slaughter & Meat Prep (With Farm Pickup)'}
            </span>
          </span>
          <span className="text-[10px] font-mono text-amber-500 font-bold">
            {getSlaughterFee(slaughterOption, pricing) > 0
              ? `+${formatPrice(getSlaughterFee(slaughterOption, pricing))}`
              : isAmharic
              ? 'አልተመረጠም'
              : 'None'}
          </span>
        </label>

        {/* Options List */}
        <div className="space-y-2">
          {currentOptions.map((opt) => {
            const isSelected = slaughterOption === opt;
            const { title, subtitle, feeText } = getSlaughterServiceLabel(opt, isAmharic, pricing);

            let Icon = UtensilsCrossed;
            if (opt === 'none') Icon = Sparkles;
            else if (opt === 'slaughter_along' || opt === 'slaughter_take_along') Icon = UserCheck;
            else if (opt === 'send_slaughtered') Icon = Truck;

            return (
              <div
                key={opt}
                onClick={() => onSlaughterOptionChange(opt)}
                className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border cursor-pointer transition-all select-none ${
                  isSelected
                    ? isDark
                      ? 'bg-[#4A2C16]/50 border-[#C58A3A] shadow-xs ring-1 ring-[#C58A3A]/40'
                      : 'bg-[#F1E8D8] border-[#B8792F] shadow-xs ring-1 ring-[#B8792F]/40'
                    : isDark
                    ? 'bg-[#1B1208]/60 border-[#4A2C16] hover:bg-[#2A1A0D]'
                    : 'bg-[#FAF7F0] border-[#E4D4BC] hover:bg-[#F1E8D8]/50'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  {/* Radio Indicator */}
                  <div
                    className={`w-4 h-4 mt-0.5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                      isSelected
                        ? isDark
                          ? 'bg-[#C58A3A] border-[#C58A3A] text-[#1B1208]'
                          : 'bg-[#B8792F] border-[#B8792F] text-[#FAF7F0]'
                        : isDark
                        ? 'border-[#4A2C16] bg-[#1B1208]'
                        : 'border-[#E4D4BC] bg-[#F1E8D8]'
                    }`}
                  >
                    {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Icon
                          className={`w-3.5 h-3.5 shrink-0 ${
                            isSelected
                              ? isDark
                                ? 'text-[#E0B15A]'
                                : 'text-[#B8792F]'
                              : 'opacity-60'
                          }`}
                        />
                        <span
                          className={`text-xs font-bold truncate ${
                            isDark ? 'text-[#F4E8D0]' : 'text-[#241A12]'
                          }`}
                        >
                          {title}
                        </span>
                      </div>

                      {/* Fee Badge */}
                      <span
                        className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-md whitespace-nowrap self-start sm:self-auto ${
                          isSelected
                            ? isDark
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-amber-500/20 text-amber-800 border border-amber-600/30'
                            : 'bg-black/5 dark:bg-white/5 opacity-70'
                        }`}
                      >
                        {feeText}
                      </span>
                    </div>

                    <p
                      className={`text-[10.5px] sm:text-[11px] mt-1 leading-snug ${
                        isDark ? 'text-[#D8C5A8]/85' : 'text-[#746556]'
                      }`}
                    >
                      {subtitle}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Helpful Transparent Pricing Explanatory Note */}
      <div
        className={`p-2.5 rounded-xl border flex items-start gap-2 text-[10.5px] leading-relaxed ${
          isDark
            ? 'bg-amber-500/10 border-amber-500/20 text-[#E0B15A]'
            : 'bg-amber-500/10 border-amber-500/20 text-amber-900'
        }`}
      >
        <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
        <div>
          {isAmharic ? (
            <span>
              <strong>የክፍያ ማብራሪያ፡</strong> የዕርድ መነሻ ዋጋ <strong>{formatPrice(baseFee)}</strong> ነው። የዕርድ ባለሙያው ከማድረሻ ተሽከርካሪ ጋር አብሮ ሲጓዝ ወይም ደንበኞች ይዘውት ሲሄዱ <strong>+{formatPrice(travelFee)}</strong> የጉዞ አበል ይታከላል (ድምር <strong>{formatPrice(baseFee + travelFee)}</strong>)።
            </span>
          ) : (
            <span>
              <strong>Pricing Rule:</strong> Base slaughter fee is <strong>{formatPrice(baseFee)}</strong>. When the slaughter worker travels with delivery or customer takes him along, an extra <strong>+{formatPrice(travelFee)}</strong> travel allowance applies (total <strong>{formatPrice(baseFee + travelFee)}</strong>).
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
