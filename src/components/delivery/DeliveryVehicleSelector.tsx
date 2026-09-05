import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { api } from '../../services/api';
import { formatPrice } from '../../utils/formatters';
import {
  DeliveryQuoteResponse,
  SelectedDeliveryLocation,
  VehicleQuoteResult,
  VehicleTypeId
} from '../../types/delivery';
import {
  Car,
  Truck,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  ShieldCheck,
  RefreshCw,
  Navigation
} from 'lucide-react';

interface DeliveryVehicleSelectorProps {
  loadItems: Array<{ type: string; name?: string; quantity: number; weightKg?: number }>;
  selectedLocation: SelectedDeliveryLocation | null;
  onLocationClick: () => void;
  selectedVehicleId: VehicleTypeId;
  onSelectVehicle: (vehicleId: VehicleTypeId, quote: VehicleQuoteResult) => void;
  onQuoteChange?: (quote: DeliveryQuoteResponse | null) => void;
  isFreeDelivery?: boolean;
}

export const DeliveryVehicleSelector: React.FC<DeliveryVehicleSelectorProps> = ({
  loadItems,
  selectedLocation,
  onLocationClick,
  selectedVehicleId,
  onSelectVehicle,
  onQuoteChange,
  isFreeDelivery = false
}) => {
  const { isAmharic } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === 'design7';

  const [isLoading, setIsLoading] = useState(false);
  const [quoteData, setQuoteData] = useState<DeliveryQuoteResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch live delivery quote from backend whenever location or items change
  useEffect(() => {
    if (!selectedLocation) {
      setQuoteData(null);
      if (onQuoteChange) onQuoteChange(null);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setError(null);

    api
      .getDeliveryQuote({
        deliveryAddress: selectedLocation.address,
        deliveryLat: selectedLocation.lat,
        deliveryLng: selectedLocation.lng,
        items: loadItems
      })
      .then((res: DeliveryQuoteResponse) => {
        if (!isMounted) return;
        if (res.success) {
          setQuoteData(res);
          if (onQuoteChange) onQuoteChange(res);

          // Auto-select recommended vehicle if none selected or current is unsuitable
          const currentVehicle = res.vehicles.find((v) => v.id === selectedVehicleId);
          if (!currentVehicle || !currentVehicle.isSuitable) {
            const recommended =
              res.vehicles.find((v) => v.id === res.recommendedVehicleId) ||
              res.vehicles.find((v) => v.isSuitable) ||
              res.vehicles[0];

            if (recommended) {
              onSelectVehicle(recommended.id, recommended);
            }
          } else {
            onSelectVehicle(currentVehicle.id, currentVehicle);
          }
        } else {
          setError(res.error || 'Failed to calculate delivery route');
          if (onQuoteChange) onQuoteChange(null);
        }
      })
      .catch((err: any) => {
        if (!isMounted) return;
        setError(err.message || 'Error connecting to delivery service');
        if (onQuoteChange) onQuoteChange(null);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedLocation?.lat, selectedLocation?.lng, JSON.stringify(loadItems)]);

  // Render vehicle icon helper
  const renderVehicleIcon = (iconName: string) => {
    switch (iconName) {
      case 'car':
        return <Car className="w-5 h-5" />;
      case 'van':
        return <Truck className="w-5 h-5 text-amber-500" />;
      case 'truck':
      default:
        return <Truck className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. Destination Address & Change Location Header */}
      <div
        className={`p-3.5 sm:p-4 rounded-2xl border transition-all ${
          isDark ? 'bg-[#1B1208] border-[#4A2C16]' : 'bg-white border-[#E4D4BC]'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#C18A45]/15 text-[#C18A45] flex items-center justify-center shrink-0 mt-0.5">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider opacity-60">
                {isAmharic ? 'የማስረከቢያ አድራሻ (Destination)' : 'Delivery Address'}
              </div>
              <div className="text-xs sm:text-sm font-bold truncate max-w-[280px] sm:max-w-md">
                {selectedLocation ? selectedLocation.address : (isAmharic ? 'ቦታ አልተመረጠም' : 'No Location Selected')}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onLocationClick}
            className="px-3 py-1.5 rounded-xl border border-[#C18A45]/40 text-[#C18A45] hover:bg-[#C18A45]/10 text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 shrink-0 self-start sm:self-center"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>
              {selectedLocation
                ? (isAmharic ? 'አድራሻ ቀይር' : 'Change Location')
                : (isAmharic ? 'አድራሻ ይምረጡ' : 'Select Location')}
            </span>
          </button>
        </div>

        {/* Route Details Bar */}
        {quoteData && (
          <div className="mt-3 pt-3 border-t border-black/10 dark:border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 rounded-lg bg-emerald-500/15 text-emerald-400 font-mono font-bold">
                🛣️ {quoteData.distanceKm} KM
              </span>
              <span className="opacity-75 font-medium">
                • {isAmharic ? quoteData.amharicCategoryLabel : quoteData.distanceCategoryLabel}
              </span>
            </div>

            <div className="flex items-center gap-1.5 opacity-70 text-[11px]">
              <Clock className="w-3.5 h-3.5" />
              <span>Est. {quoteData.estimatedDurationMinutes} mins drive</span>
            </div>
          </div>
        )}
      </div>

      {/* Loading state indicator */}
      {isLoading && (
        <div className="p-4 rounded-2xl border border-dashed border-[#C18A45]/40 text-center text-xs opacity-75 flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-[#C18A45]" />
          <span>{isAmharic ? 'የመንገድ ርቀትና ዋጋ በመሰላት ላይ...' : 'Calculating road distance & vehicle suitability...'}</span>
        </div>
      )}

      {/* Out of Range Error (> 30 km) */}
      {quoteData && !quoteData.isWithinRange && (
        <div className="p-3.5 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs space-y-1">
          <div className="font-bold flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{isAmharic ? 'የማድረሻ ክልል አልፏል (ከ30 ኪ.ሜ በላይ)' : 'Delivery Unavailable Beyond 30 KM'}</span>
          </div>
          <p className="text-[11px] opacity-80 leading-relaxed">
            {isAmharic
              ? `የመረጡት ቦታ ከአዋሬ እርሻ ${quoteData.distanceKm} ኪ.ሜ ርቀት ላይ ይገኛል። የማድረስ አገልግሎታችን እስከ ${quoteData.maxDistanceKm} ኪ.ሜ ብቻ ነው። እባክዎ በአዲስ አበባ ውስጥ ቅርብ አድራሻ ይምረጡ ወይም ከእርሻው መረከብ (Farm Pickup) ይምረጡ።`
              : `The destination is ${quoteData.distanceKm} km from Aware Farm. Maximum supported delivery range is ${quoteData.maxDistanceKm} km. Please choose an address within Addis Ababa or select Farm Pickup.`}
          </p>
        </div>
      )}

      {/* General Error Banner */}
      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Free Delivery Banner if applicable */}
      {isFreeDelivery && quoteData && quoteData.isWithinRange && (
        <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2 font-bold shadow-sm">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            {isAmharic
              ? '🎉 የበዓል ጥቅል ልዩ ስጦታ፡ የዚህ ጥቅል ማድረሻ ሙሉ በሙሉ ነፃ (0 ETB) ነው!'
              : '🎉 Celebration Package Perk: Doorstep delivery for this package is 100% FREE (0 ETB)!'}
          </span>
        </div>
      )}

      {/* 2. Vehicle Selection Cards */}
      {quoteData && quoteData.isWithinRange && (
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider opacity-80 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-[#C18A45]" />
              <span>{isAmharic ? 'ተስማሚ የማጓጓዣ ተሽከርካሪ ይምረጡ' : 'Select Delivery Vehicle & Fleet'}</span>
            </span>
            <span className="text-[10px] opacity-60 font-mono">
              {isFreeDelivery ? (isAmharic ? 'ነፃ ማድረሻ' : 'Free Delivery Included') : '1 Delivery Fee per Order'}
            </span>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {quoteData.vehicles.map((v) => {
              const isSelected = selectedVehicleId === v.id;
              const isSuitable = v.isSuitable;
              const effectiveFee = isFreeDelivery ? 0 : v.deliveryFee;

              return (
                <div
                  key={v.id}
                  onClick={() => {
                    if (isSuitable) {
                      onSelectVehicle(v.id, { ...v, deliveryFee: effectiveFee });
                    }
                  }}
                  className={`relative p-3.5 rounded-2xl border transition-all flex flex-col justify-between ${
                    isSelected && isSuitable
                      ? 'bg-amber-500/15 border-amber-500 ring-2 ring-amber-500/30 shadow-md cursor-pointer'
                      : !isSuitable
                      ? isDark
                        ? 'bg-black/40 border-red-900/30 opacity-60 cursor-not-allowed'
                        : 'bg-neutral-100 border-red-200 opacity-60 cursor-not-allowed'
                      : isDark
                      ? 'bg-[#1B1208] border-[#4A2C16] hover:border-amber-500/50 cursor-pointer'
                      : 'bg-white border-[#E4D4BC] hover:border-amber-500/50 cursor-pointer'
                  }`}
                >
                  {/* Top Badges */}
                  <div className="flex items-start justify-between gap-1 mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                          isSelected ? 'bg-[#C18A45] text-white' : 'bg-[#C18A45]/15 text-[#C18A45]'
                        }`}
                      >
                        {renderVehicleIcon(v.icon)}
                      </div>
                      <div>
                        <div className="font-bold text-xs sm:text-sm leading-tight">
                          {isAmharic && v.amharicName ? v.amharicName : v.name}
                        </div>
                        <div className="text-[10px] opacity-60 font-mono">
                          Base {v.baseFee} ETB + {v.pricePerKm} ETB/km
                        </div>
                      </div>
                    </div>

                    {v.isRecommended && isSuitable && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-0.5 shrink-0">
                        <Sparkles className="w-2.5 h-2.5" />
                        {isAmharic ? 'ይመከራል' : 'Best Choice'}
                      </span>
                    )}
                  </div>

                  {/* Calculated Delivery Price */}
                  <div className="my-2 p-2 rounded-xl bg-black/5 dark:bg-white/5 flex items-baseline justify-between">
                    <span className="text-[10px] uppercase font-semibold opacity-70">
                      {isAmharic ? 'የማድረሻ ዋጋ' : 'Trip Price'}:
                    </span>
                    {isFreeDelivery ? (
                      <div className="flex items-center gap-1.5">
                        <span className="line-through text-xs opacity-50 font-mono">
                          {formatPrice(v.deliveryFee)}
                        </span>
                        <span className="font-mono font-black text-sm text-emerald-500">
                          {isAmharic ? 'ነፃ (0 ETB)' : 'FREE (0 ETB)'}
                        </span>
                      </div>
                    ) : (
                      <span className="font-mono font-black text-sm text-[#C18A45]">
                        {formatPrice(v.deliveryFee)}
                      </span>
                    )}
                  </div>

                  {/* Suitability Badge & Reason */}
                  <div className="pt-2 border-t border-black/10 dark:border-white/10 text-[10.5px]">
                    {isSuitable ? (
                      <div className="flex items-center gap-1 text-emerald-500 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        <span>{isAmharic ? 'ለዚህ ጭነት ተስማሚ ነው' : 'Suitable for this load'}</span>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-red-400 font-semibold">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                          <span>{isAmharic ? 'ጭነቱን መሸከም አይችልም' : 'Capacity Exceeded'}</span>
                        </div>
                        {v.unsuitabilityReason && (
                          <p className="text-[10px] text-red-400/90 leading-tight">
                            {v.unsuitabilityReason}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Admin Approval Notice Banner */}
          <div className="p-3 rounded-xl bg-[#C18A45]/10 border border-[#C18A45]/20 text-xs flex items-start gap-2 text-neutral-300">
            <ShieldCheck className="w-4 h-4 text-[#C18A45] shrink-0 mt-0.5" />
            <div className="text-[11px] leading-relaxed">
              <span className="font-bold text-[#C18A45]">
                {isAmharic ? 'የአስተዳዳሪ ማረጋገጫ፡ ' : 'Admin Verification & Dispatch: '}
              </span>
              <span>
                {isAmharic
                  ? 'ትዕዛዝዎና የክፍያ ደረሰኝዎ በአስተዳዳሪው ከተረጋገጠ በኋላ ተሽከርካሪው ወዲያውኑ ወደ አድራሻዎ ይላካል።'
                  : 'Once your payment slip is verified by our admin team, your selected delivery vehicle will be dispatched directly to your address.'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
