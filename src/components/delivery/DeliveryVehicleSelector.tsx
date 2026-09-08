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
  Truck,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  RefreshCw,
  Navigation
} from 'lucide-react';
import { getAccurateCurrentPosition } from '../../utils/geolocation';

interface DeliveryVehicleSelectorProps {
  loadItems: Array<{ type: string; name?: string; quantity: number; weightKg?: number }>;
  selectedLocation: SelectedDeliveryLocation | null;
  onLocationClick: () => void;
  onSelectLocation?: (loc: SelectedDeliveryLocation) => void;
  selectedVehicleId: VehicleTypeId;
  onSelectVehicle: (vehicleId: VehicleTypeId, quote: VehicleQuoteResult) => void;
  onQuoteChange?: (quote: DeliveryQuoteResponse | null) => void;
  isFreeDelivery?: boolean;
}

export const DeliveryVehicleSelector: React.FC<DeliveryVehicleSelectorProps> = ({
  loadItems,
  selectedLocation,
  onLocationClick,
  onSelectLocation,
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

  // Device Geolocation State
  const [isLocatingDevice, setIsLocatingDevice] = useState(false);
  const [locatingStatusText, setLocatingStatusText] = useState<string | null>(null);
  const [deviceLocError, setDeviceLocError] = useState<string | null>(null);

  const handleDetectDeviceLocation = () => {
    setIsLocatingDevice(true);
    setDeviceLocError(null);
    setLocatingStatusText(isAmharic ? 'የሳተላይት መገኛ በመፈለግ ላይ...' : 'Acquiring satellite GPS...');

    getAccurateCurrentPosition({
      maxWaitMs: 12000,
      desiredAccuracyMeters: 25,
      onProgress: (prog) => {
        if (prog.accuracy) {
          setLocatingStatusText(
            isAmharic
              ? `ትክክለኛ መገኛ በመፈለግ ላይ (±${prog.accuracy} ሜትር)...`
              : `Refining GPS (±${prog.accuracy}m)...`
          );
        }
      }
    })
      .then(async (pos) => {
        const { latitude, longitude } = pos;
        setLocatingStatusText(isAmharic ? 'አድራሻ በመለየት ላይ...' : 'Resolving street address...');
        try {
          const res = await api.reverseGeocode(latitude, longitude);
          let addr =
            res.success && res.data?.address
              ? res.data.address
              : `GPS Location (${latitude.toFixed(5)}, ${longitude.toFixed(5)})`;

          const newLoc: SelectedDeliveryLocation = {
            address: addr,
            lat: latitude,
            lng: longitude,
            isCustomPin: true
          };

          if (onSelectLocation) {
            onSelectLocation(newLoc);
          }
        } catch (e) {
          const fallbackLoc: SelectedDeliveryLocation = {
            address: `GPS Location (${latitude.toFixed(5)}, ${longitude.toFixed(5)})`,
            lat: latitude,
            lng: longitude,
            isCustomPin: true
          };
          if (onSelectLocation) {
            onSelectLocation(fallbackLoc);
          }
        } finally {
          setIsLocatingDevice(false);
          setLocatingStatusText(null);
        }
      })
      .catch((err: any) => {
        setIsLocatingDevice(false);
        setLocatingStatusText(null);
        let msg = isAmharic
          ? 'የመሣሪያዎን ትክክለኛ መገኛ ማግኘት አልተቻለም። እባክዎ በካርታው ላይ ይምረጡ።'
          : 'Could not detect device location. Please select from map.';
        if (err.code === 1 || err.name === 'NotAllowedError') {
          msg = isAmharic
            ? 'የመገኛ ፈቃድ አልተሰጠም። እባክዎ በካርታው ላይ ይምረጡ።'
            : 'Location permission was denied. Please select from map.';
        }
        setDeviceLocError(msg);
      });
  };

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

  return (
    <div className="space-y-3.5">
      {/* 1. Destination Address: If no location selected, prompt user to choose Device Location or Map */}
      {!selectedLocation ? (
        <div
          className={`p-4 sm:p-5 rounded-2xl border text-center space-y-3 transition-all ${
            isDark ? 'bg-[#1B1208] border-[#4A2C16]' : 'bg-[#FAF7F0] border-[#E4D4BC]'
          }`}
        >
          <div className="w-10 h-10 mx-auto rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center shadow-inner">
            <Navigation className="w-5 h-5" />
          </div>

          <div className="space-y-1">
            <h4 className="font-bold text-sm sm:text-base">
              {isAmharic ? 'የማስረከቢያ ቦታዎን ይምረጡ' : 'Choose Delivery Location'}
            </h4>
            <p className="text-xs opacity-75 max-w-sm mx-auto leading-relaxed">
              {isAmharic
                ? 'ትክክለኛውን ርቀትና የተሽከርካሪ ዋጋ ለማስላት የመሳሪያዎትን መገኛ (GPS) ይጠቀሙ ወይም በካርታው ላይ ይምረጡ'
                : 'Choose your device GPS location or select directly from the interactive map'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 max-w-md mx-auto">
            {/* Device GPS Button */}
            <button
              type="button"
              onClick={handleDetectDeviceLocation}
              disabled={isLocatingDevice}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 disabled:opacity-50 text-white text-xs sm:text-sm font-bold shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLocatingDevice ? (
                <RefreshCw className="w-4 h-4 animate-spin shrink-0" />
              ) : (
                <Navigation className="w-4 h-4 shrink-0" />
              )}
              <span>
                {isLocatingDevice
                  ? (locatingStatusText || (isAmharic ? 'መገኛ በመፈለግ ላይ...' : 'Detecting GPS...'))
                  : (isAmharic ? 'የመሳሪያዬ መገኛ (GPS)' : 'Use Device Location')}
              </span>
            </button>

            {/* Select from Map Button */}
            <button
              type="button"
              onClick={onLocationClick}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-black text-xs sm:text-sm font-bold shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <MapPin className="w-4 h-4 shrink-0" />
              <span>{isAmharic ? 'በካርታ ላይ ምረጥ' : 'Select from Map'}</span>
            </button>
          </div>

          {deviceLocError && (
            <div className="p-2.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs flex items-center justify-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{deviceLocError}</span>
            </div>
          )}
        </div>
      ) : (
        /* When location IS selected, display address with dual change options */
        <div
          className={`p-3 sm:p-3.5 rounded-2xl border transition-all overflow-hidden ${
            isDark ? 'bg-[#1B1208] border-[#4A2C16]' : 'bg-white border-[#E4D4BC]'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[10px] font-bold uppercase tracking-wider opacity-60 truncate">
                  {isAmharic ? 'የማስረከቢያ አድራሻ' : 'Delivery Address'}
                </div>
                <div
                  title={selectedLocation.address}
                  className="text-xs sm:text-sm font-bold truncate leading-tight"
                >
                  {selectedLocation.address}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
              <button
                type="button"
                onClick={handleDetectDeviceLocation}
                disabled={isLocatingDevice}
                className="px-2.5 py-1.5 rounded-xl border border-emerald-500/40 text-emerald-500 hover:bg-emerald-500/10 active:scale-95 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                title={isAmharic ? 'የመሳሪያዬን መገኛ ተጠቀም' : 'Use Device Location'}
              >
                {isLocatingDevice ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Navigation className="w-3.5 h-3.5" />
                )}
                <span>{isAmharic ? 'ጂፒኤስ' : 'Device GPS'}</span>
              </button>

              <button
                type="button"
                onClick={onLocationClick}
                className="px-3 py-1.5 rounded-xl border border-amber-500/40 text-amber-500 hover:bg-amber-500/10 active:scale-95 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap"
              >
                <MapPin className="w-3 h-3 shrink-0" />
                <span>{isAmharic ? 'ካርታ ቀይር' : 'Change on Map'}</span>
              </button>
            </div>
          </div>

          {/* Route Details Bar */}
          {quoteData && (
            <div className="mt-2.5 pt-2.5 border-t border-black/5 dark:border-white/5 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-500 font-mono font-bold text-[11px] flex items-center gap-1">
                  <Navigation className="w-3 h-3 text-amber-500" />
                  <span>{quoteData.distanceKm} KM</span>
                </span>
                <span className="opacity-75 text-[11px]">
                  • {isAmharic ? quoteData.amharicCategoryLabel : quoteData.distanceCategoryLabel}
                </span>
              </div>

              <div className="flex items-center gap-1 opacity-70 text-[11px]">
                <Clock className="w-3 h-3 text-amber-500" />
                <span>Est. {quoteData.estimatedDurationMinutes} mins drive</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Loading state indicator */}
      {isLoading && (
        <div className="py-3 text-center text-xs opacity-75 flex items-center justify-center gap-2">
          <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-500" />
          <span>{isAmharic ? 'የመንገድ ርቀትና ዋጋ በመሰላት ላይ...' : 'Calculating road distance & vehicle suitability...'}</span>
        </div>
      )}

      {/* Out of Range Error (> 30 km) */}
      {quoteData && !quoteData.isWithinRange && (
        <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs space-y-1">
          <div className="font-bold flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{isAmharic ? 'የማድረሻ ክልል አልፏል (ከ30 ኪ.ሜ በላይ)' : 'Delivery Unavailable Beyond 30 KM'}</span>
          </div>
          <p className="text-[11px] opacity-80 leading-relaxed">
            {isAmharic
              ? `የመረጡት ቦታ ከጆኒ የቀንድ ከብት አቅራቢ ተቋም (አራት ኪሎ) ${quoteData.distanceKm} ኪ.ሜ ርቀት ላይ ይገኛል። የማድረስ አገልግሎታችን እስከ ${quoteData.maxDistanceKm} ኪ.ሜ ብቻ ነው። እባክዎ በአዲስ አበባ ውስጥ ቅርብ አድራሻ ይምረጡ ወይም ከማዕከሉ መረከብ (Pickup) ይምረጡ።`
              : `The destination is ${quoteData.distanceKm} km from Jonny Livestock Facility (Arat Kilo). Maximum supported delivery range is ${quoteData.maxDistanceKm} km. Please choose an address within Addis Ababa or select Hub Pickup.`}
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

      {/* Free Delivery Banner if applicable (clean inline note matching amber theme, no card box, no emoji) */}
      {isFreeDelivery && quoteData && quoteData.isWithinRange && (
        <div className="flex items-center gap-1.5 text-xs text-amber-500 font-semibold py-0.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span>
            {isAmharic
              ? 'የበዓል ጥቅል ስጦታ፡ የዚህ ጥቅል ማድረሻ 100% ነፃ (0 ETB) ነው!'
              : 'Celebration Package Perk: Doorstep delivery for this package is 100% FREE (0 ETB)!'}
          </span>
        </div>
      )}

      {/* 2. Vehicle Selection Rows (Minimal and clean, no nested price boxes) */}
      {quoteData && quoteData.isWithinRange && (
        <div className="space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider opacity-80 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-amber-500" />
              <span>{isAmharic ? 'ተስማሚ ተሽከርካሪ ይምረጡ' : 'Select Delivery Vehicle & Fleet'}</span>
            </span>
            <span className="text-[10px] opacity-60 font-mono">
              {isFreeDelivery ? (isAmharic ? 'ነፃ ማድረሻ' : 'Free Delivery Included') : '1 Fee per Order'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
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
                  className={`p-3 rounded-2xl border transition-all flex flex-col justify-between ${
                    isSelected && isSuitable
                      ? 'bg-amber-500/15 border-amber-500 shadow-sm cursor-pointer'
                      : !isSuitable
                      ? isDark
                        ? 'bg-black/30 border-red-900/20 opacity-50 cursor-not-allowed'
                        : 'bg-neutral-50 border-red-100 opacity-50 cursor-not-allowed'
                      : isDark
                      ? 'bg-[#1B1208] border-[#4A2C16] hover:border-amber-500/50 cursor-pointer'
                      : 'bg-white border-[#E4D4BC] hover:border-amber-500/50 cursor-pointer'
                  }`}
                >
                  <div>
                    {/* Header: Name + Badge */}
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <div className="font-bold text-xs sm:text-sm truncate">
                        {isAmharic && v.amharicName ? v.amharicName : v.name}
                      </div>
                      {v.isRecommended && isSuitable && (
                        <span className="text-[8.5px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
                          {isAmharic ? 'ይመከራል' : 'Best Choice'}
                        </span>
                      )}
                    </div>

                    <div className="text-[10px] opacity-60 font-mono">
                      Base {v.baseFee} ETB + {v.pricePerKm} ETB/km
                    </div>
                  </div>

                  {/* Price and Status Line (Clean inline without box) */}
                  <div className="mt-2 pt-2 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-xs">
                    <div>
                      {isFreeDelivery ? (
                        <span className="font-mono font-bold text-amber-500 text-xs">
                          {isAmharic ? 'ነፃ (0 ETB)' : 'FREE (0 ETB)'}
                        </span>
                      ) : (
                        <span className="font-mono font-bold text-amber-500 text-xs">
                          {formatPrice(v.deliveryFee)}
                        </span>
                      )}
                    </div>

                    <div>
                      {isSuitable ? (
                        <span className="text-[10px] text-emerald-500 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{isAmharic ? 'ተስማሚ' : 'Suitable'}</span>
                        </span>
                      ) : (
                        <span className="text-[10px] text-red-400 font-semibold">
                          {v.unsuitabilityReason || 'Over Capacity'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Admin Verification Note */}
          <p className="text-[11px] opacity-70 leading-tight pt-1">
            <span className="font-bold text-amber-500">
              {isAmharic ? 'የአስተዳዳሪ ማረጋገጫ፡ ' : 'Admin Verification & Dispatch: '}
            </span>
            <span>
              {isAmharic
                ? 'የክፍያ ደረሰኝዎ እንደተረጋገጠ የተመረጠው ተሽከርካሪ በቀጥታ ወደ አድራሻዎ ይላካል።'
                : 'Once your payment slip is verified by our admin team, your selected delivery vehicle will be dispatched directly to your address.'}
            </span>
          </p>
        </div>
      )}
    </div>
  );
};
